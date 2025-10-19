"""
Production-grade Market Data Service
Real-time and historical market data with multiple providers
"""

import asyncio
import logging
import pandas as pd
import numpy as np
import yfinance as yf
import ccxt
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
import aiohttp
import websockets
import json
from alpha_vantage.timeseries import TimeSeries
from alpha_vantage.fundamentaldata import FundamentalData
from polygon import RESTClient
import redis
import pickle
from dataclasses import dataclass
import os

logger = logging.getLogger(__name__)

@dataclass
class Quote:
    symbol: str
    price: float
    change: float
    change_percent: float
    volume: int
    bid: float
    ask: float
    high: float
    low: float
    open: float
    previous_close: float
    market_cap: Optional[float] = None
    pe_ratio: Optional[float] = None
    timestamp: datetime = None

class MarketDataService:
    """Production-grade market data service with multiple providers"""
    
    def __init__(self):
        self.redis_client = redis.Redis(
            host=os.getenv('REDIS_HOST', 'localhost'),
            port=int(os.getenv('REDIS_PORT', 6379)),
            decode_responses=True
        )
        
        # Initialize data providers
        self.alpha_vantage_key = os.getenv('ALPHA_VANTAGE_API_KEY')
        self.polygon_key = os.getenv('POLYGON_API_KEY')
        self.finnhub_key = os.getenv('FINNHUB_API_KEY')
        
        if self.alpha_vantage_key:
            self.av_ts = TimeSeries(key=self.alpha_vantage_key, output_format='pandas')
            self.av_fd = FundamentalData(key=self.alpha_vantage_key, output_format='pandas')
        
        if self.polygon_key:
            self.polygon_client = RESTClient(self.polygon_key)
        
        # Initialize crypto exchange
        self.binance = ccxt.binance({
            'apiKey': os.getenv('BINANCE_API_KEY'),
            'secret': os.getenv('BINANCE_SECRET'),
            'sandbox': os.getenv('BINANCE_SANDBOX', 'true').lower() == 'true'
        })
        
        self.websocket_connections = {}
        self.subscribers = {}
        self.is_running = False
        
    async def get_real_time_quote(self, symbol: str) -> Quote:
        """Get real-time quote for a symbol"""
        try:
            # Check cache first
            cached_quote = await self._get_cached_quote(symbol)
            if cached_quote and self._is_quote_fresh(cached_quote):
                return cached_quote
            
            # Try multiple providers
            quote = None
            
            # Try Yahoo Finance first (free and reliable)
            quote = await self._get_yahoo_quote(symbol)
            
            # Fallback to Alpha Vantage
            if not quote and self.alpha_vantage_key:
                quote = await self._get_alpha_vantage_quote(symbol)
            
            # Fallback to Polygon
            if not quote and self.polygon_key:
                quote = await self._get_polygon_quote(symbol)
            
            # Cache the quote
            if quote:
                await self._cache_quote(quote)
                
            return quote
            
        except Exception as e:
            logger.error(f"Error getting quote for {symbol}: {e}")
            raise
    
    async def _get_yahoo_quote(self, symbol: str) -> Optional[Quote]:
        """Get quote from Yahoo Finance"""
        try:
            ticker = yf.Ticker(symbol)
            info = ticker.info
            hist = ticker.history(period="2d")
            
            if hist.empty:
                return None
                
            latest = hist.iloc[-1]
            previous = hist.iloc[-2] if len(hist) > 1 else latest
            
            current_price = float(latest['Close'])
            previous_close = float(previous['Close'])
            change = current_price - previous_close
            change_percent = (change / previous_close) * 100 if previous_close != 0 else 0
            
            return Quote(
                symbol=symbol.upper(),
                price=current_price,
                change=change,
                change_percent=change_percent,
                volume=int(latest['Volume']),
                bid=info.get('bid', current_price),
                ask=info.get('ask', current_price),
                high=float(latest['High']),
                low=float(latest['Low']),
                open=float(latest['Open']),
                previous_close=previous_close,
                market_cap=info.get('marketCap'),
                pe_ratio=info.get('trailingPE'),
                timestamp=datetime.now()
            )
            
        except Exception as e:
            logger.warning(f"Yahoo Finance failed for {symbol}: {e}")
            return None
    
    async def _get_alpha_vantage_quote(self, symbol: str) -> Optional[Quote]:
        """Get quote from Alpha Vantage"""
        try:
            data, _ = self.av_ts.get_quote_endpoint(symbol)
            
            if data.empty:
                return None
            
            quote_data = data.iloc[0]
            
            return Quote(
                symbol=symbol.upper(),
                price=float(quote_data['05. price']),
                change=float(quote_data['09. change']),
                change_percent=float(quote_data['10. change percent'].replace('%', '')),
                volume=int(quote_data['06. volume']),
                bid=float(quote_data['05. price']),  # AV doesn't provide bid/ask
                ask=float(quote_data['05. price']),
                high=float(quote_data['03. high']),
                low=float(quote_data['04. low']),
                open=float(quote_data['02. open']),
                previous_close=float(quote_data['08. previous close']),
                timestamp=datetime.now()
            )
            
        except Exception as e:
            logger.warning(f"Alpha Vantage failed for {symbol}: {e}")
            return None
    
    async def _get_polygon_quote(self, symbol: str) -> Optional[Quote]:
        """Get quote from Polygon"""
        try:
            quote = self.polygon_client.get_last_quote(symbol)
            aggs = self.polygon_client.get_aggs(symbol, 1, "day", limit=2)
            
            if not aggs or len(aggs) == 0:
                return None
            
            latest = aggs[0]
            previous = aggs[1] if len(aggs) > 1 else latest
            
            change = latest.close - previous.close
            change_percent = (change / previous.close) * 100 if previous.close != 0 else 0
            
            return Quote(
                symbol=symbol.upper(),
                price=float(latest.close),
                change=change,
                change_percent=change_percent,
                volume=int(latest.volume),
                bid=float(quote.bid) if quote else float(latest.close),
                ask=float(quote.ask) if quote else float(latest.close),
                high=float(latest.high),
                low=float(latest.low),
                open=float(latest.open),
                previous_close=float(previous.close),
                timestamp=datetime.now()
            )
            
        except Exception as e:
            logger.warning(f"Polygon failed for {symbol}: {e}")
            return None
    
    async def get_batch_quotes(self, symbols: List[str]) -> Dict[str, Quote]:
        """Get quotes for multiple symbols efficiently"""
        quotes = {}
        
        # Process in batches to avoid rate limits
        batch_size = 10
        for i in range(0, len(symbols), batch_size):
            batch = symbols[i:i + batch_size]
            
            # Create tasks for concurrent processing
            tasks = [self.get_real_time_quote(symbol) for symbol in batch]
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            for symbol, result in zip(batch, results):
                if isinstance(result, Quote):
                    quotes[symbol] = result
                else:
                    logger.error(f"Failed to get quote for {symbol}: {result}")
            
            # Rate limiting delay
            if i + batch_size < len(symbols):
                await asyncio.sleep(0.1)
        
        return quotes
    
    async def get_historical_data(
        self, 
        symbol: str, 
        period: str = "1y", 
        interval: str = "1d"
    ) -> pd.DataFrame:
        """Get historical price data"""
        try:
            # Check cache first
            cache_key = f"hist:{symbol}:{period}:{interval}"
            cached_data = self.redis_client.get(cache_key)
            
            if cached_data:
                return pickle.loads(cached_data)
            
            # Get data from Yahoo Finance
            ticker = yf.Ticker(symbol)
            data = ticker.history(period=period, interval=interval)
            
            if data.empty:
                raise ValueError(f"No historical data found for {symbol}")
            
            # Add technical indicators
            data = self._add_technical_indicators(data)
            
            # Cache for 1 hour
            self.redis_client.setex(
                cache_key, 
                3600, 
                pickle.dumps(data)
            )
            
            return data
            
        except Exception as e:
            logger.error(f"Error getting historical data for {symbol}: {e}")
            raise
    
    def _add_technical_indicators(self, data: pd.DataFrame) -> pd.DataFrame:
        """Add common technical indicators to price data"""
        try:
            # Simple Moving Averages
            data['SMA_20'] = data['Close'].rolling(window=20).mean()
            data['SMA_50'] = data['Close'].rolling(window=50).mean()
            data['SMA_200'] = data['Close'].rolling(window=200).mean()
            
            # Exponential Moving Averages
            data['EMA_12'] = data['Close'].ewm(span=12).mean()
            data['EMA_26'] = data['Close'].ewm(span=26).mean()
            
            # MACD
            data['MACD'] = data['EMA_12'] - data['EMA_26']
            data['MACD_Signal'] = data['MACD'].ewm(span=9).mean()
            data['MACD_Histogram'] = data['MACD'] - data['MACD_Signal']
            
            # RSI
            delta = data['Close'].diff()
            gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
            loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
            rs = gain / loss
            data['RSI'] = 100 - (100 / (1 + rs))
            
            # Bollinger Bands
            data['BB_Middle'] = data['Close'].rolling(window=20).mean()
            bb_std = data['Close'].rolling(window=20).std()
            data['BB_Upper'] = data['BB_Middle'] + (bb_std * 2)
            data['BB_Lower'] = data['BB_Middle'] - (bb_std * 2)
            
            # Volume indicators
            data['Volume_SMA'] = data['Volume'].rolling(window=20).mean()
            data['Volume_Ratio'] = data['Volume'] / data['Volume_SMA']
            
            return data
            
        except Exception as e:
            logger.error(f"Error adding technical indicators: {e}")
            return data
    
    async def calculate_correlations(
        self, 
        symbols: List[str], 
        period: str = "1y",
        method: str = "pearson"
    ) -> pd.DataFrame:
        """Calculate correlation matrix for given symbols"""
        try:
            # Get historical data for all symbols
            price_data = {}
            
            for symbol in symbols:
                data = await self.get_historical_data(symbol, period)
                price_data[symbol] = data['Close']
            
            # Create DataFrame with all prices
            df = pd.DataFrame(price_data)
            
            # Calculate returns
            returns = df.pct_change().dropna()
            
            # Calculate correlation matrix
            correlation_matrix = returns.corr(method=method)
            
            return correlation_matrix
            
        except Exception as e:
            logger.error(f"Error calculating correlations: {e}")
            raise
    
    async def get_crypto_data(self, symbol: str, base: str = "USDT") -> Quote:
        """Get cryptocurrency data"""
        try:
            ticker_symbol = f"{symbol}/{base}"
            ticker = await self.binance.fetch_ticker(ticker_symbol)
            
            return Quote(
                symbol=symbol,
                price=float(ticker['last']),
                change=float(ticker['change']),
                change_percent=float(ticker['percentage']),
                volume=int(ticker['baseVolume']),
                bid=float(ticker['bid']),
                ask=float(ticker['ask']),
                high=float(ticker['high']),
                low=float(ticker['low']),
                open=float(ticker['open']),
                previous_close=float(ticker['close']),
                timestamp=datetime.now()
            )
            
        except Exception as e:
            logger.error(f"Error getting crypto data for {symbol}: {e}")
            raise
    
    async def start_real_time_feeds(self):
        """Start real-time WebSocket feeds"""
        self.is_running = True
        logger.info("Starting real-time market data feeds...")
        
        # Start WebSocket connections for different data sources
        await asyncio.gather(
            self._start_yahoo_websocket(),
            self._start_crypto_websocket(),
            return_exceptions=True
        )
    
    async def _start_yahoo_websocket(self):
        """Start Yahoo Finance WebSocket (simulated with polling)"""
        while self.is_running:
            try:
                # Poll for subscribed symbols
                if self.subscribers:
                    symbols = list(self.subscribers.keys())
                    quotes = await self.get_batch_quotes(symbols)
                    
                    # Notify subscribers
                    for symbol, quote in quotes.items():
                        if symbol in self.subscribers:
                            for callback in self.subscribers[symbol]:
                                try:
                                    await callback(quote)
                                except Exception as e:
                                    logger.error(f"Error in subscriber callback: {e}")
                
                await asyncio.sleep(1)  # Poll every second
                
            except Exception as e:
                logger.error(f"Error in Yahoo WebSocket: {e}")
                await asyncio.sleep(5)
    
    async def _start_crypto_websocket(self):
        """Start cryptocurrency WebSocket feeds"""
        while self.is_running:
            try:
                # Implement Binance WebSocket connection
                # This is a simplified version - in production, use proper WebSocket
                await asyncio.sleep(1)
                
            except Exception as e:
                logger.error(f"Error in crypto WebSocket: {e}")
                await asyncio.sleep(5)
    
    def subscribe_to_symbol(self, symbol: str, callback):
        """Subscribe to real-time updates for a symbol"""
        if symbol not in self.subscribers:
            self.subscribers[symbol] = []
        self.subscribers[symbol].append(callback)
    
    def unsubscribe_from_symbol(self, symbol: str, callback):
        """Unsubscribe from real-time updates"""
        if symbol in self.subscribers:
            try:
                self.subscribers[symbol].remove(callback)
                if not self.subscribers[symbol]:
                    del self.subscribers[symbol]
            except ValueError:
                pass
    
    async def _get_cached_quote(self, symbol: str) -> Optional[Quote]:
        """Get cached quote from Redis"""
        try:
            cached_data = self.redis_client.get(f"quote:{symbol}")
            if cached_data:
                return pickle.loads(cached_data)
        except Exception as e:
            logger.warning(f"Error getting cached quote: {e}")
        return None
    
    async def _cache_quote(self, quote: Quote):
        """Cache quote in Redis"""
        try:
            self.redis_client.setex(
                f"quote:{quote.symbol}",
                60,  # Cache for 1 minute
                pickle.dumps(quote)
            )
        except Exception as e:
            logger.warning(f"Error caching quote: {e}")
    
    def _is_quote_fresh(self, quote: Quote, max_age_seconds: int = 60) -> bool:
        """Check if cached quote is still fresh"""
        if not quote.timestamp:
            return False
        age = (datetime.now() - quote.timestamp).total_seconds()
        return age < max_age_seconds
    
    def is_healthy(self) -> bool:
        """Check if service is healthy"""
        try:
            # Check Redis connection
            self.redis_client.ping()
            return True
        except Exception:
            return False
    
    async def cleanup(self):
        """Cleanup resources"""
        self.is_running = False
        logger.info("Market data service cleanup completed")
