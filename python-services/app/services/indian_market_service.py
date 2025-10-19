"""
Indian Stock Market Data Service
Provides real-time data for NSE/BSE listed companies
"""

import yfinance as yf
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import asyncio
import aiohttp
from dataclasses import dataclass
import logging

logger = logging.getLogger(__name__)

@dataclass
class IndianStock:
    symbol: str
    name: str
    sector: str
    market_cap: float
    price: float
    change: float
    change_percent: float
    volume: int
    pe_ratio: Optional[float]
    dividend_yield: Optional[float]
    high_52w: float
    low_52w: float
    beta: Optional[float]
    last_updated: datetime

class IndianMarketService:
    def __init__(self):
        # Top Indian companies with NSE symbols (Yahoo Finance format)
        self.indian_companies = {
            'RELIANCE.NS': {
                'name': 'Reliance Industries Ltd',
                'sector': 'Oil & Gas',
                'color': '#FF6B6B',
                'size_multiplier': 1.5
            },
            'TCS.NS': {
                'name': 'Tata Consultancy Services',
                'sector': 'IT Services',
                'color': '#4ECDC4',
                'size_multiplier': 1.4
            },
            'HDFCBANK.NS': {
                'name': 'HDFC Bank Ltd',
                'sector': 'Banking',
                'color': '#45B7D1',
                'size_multiplier': 1.3
            },
            'INFY.NS': {
                'name': 'Infosys Ltd',
                'sector': 'IT Services',
                'color': '#96CEB4',
                'size_multiplier': 1.2
            },
            'HINDUNILVR.NS': {
                'name': 'Hindustan Unilever Ltd',
                'sector': 'FMCG',
                'color': '#FFEAA7',
                'size_multiplier': 1.1
            },
            'ICICIBANK.NS': {
                'name': 'ICICI Bank Ltd',
                'sector': 'Banking',
                'color': '#DDA0DD',
                'size_multiplier': 1.1
            },
            'KOTAKBANK.NS': {
                'name': 'Kotak Mahindra Bank',
                'sector': 'Banking',
                'color': '#98D8C8',
                'size_multiplier': 1.0
            },
            'ITC.NS': {
                'name': 'ITC Ltd',
                'sector': 'FMCG',
                'color': '#F7DC6F',
                'size_multiplier': 1.0
            },
            'LT.NS': {
                'name': 'Larsen & Toubro Ltd',
                'sector': 'Construction',
                'color': '#BB8FCE',
                'size_multiplier': 0.9
            },
            'SBIN.NS': {
                'name': 'State Bank of India',
                'sector': 'Banking',
                'color': '#85C1E9',
                'size_multiplier': 0.9
            },
            'BHARTIARTL.NS': {
                'name': 'Bharti Airtel Ltd',
                'sector': 'Telecom',
                'color': '#F8C471',
                'size_multiplier': 0.8
            },
            'ASIANPAINT.NS': {
                'name': 'Asian Paints Ltd',
                'sector': 'Paints',
                'color': '#82E0AA',
                'size_multiplier': 0.8
            },
            'MARUTI.NS': {
                'name': 'Maruti Suzuki India Ltd',
                'sector': 'Automobile',
                'color': '#F1948A',
                'size_multiplier': 0.7
            },
            'BAJFINANCE.NS': {
                'name': 'Bajaj Finance Ltd',
                'sector': 'NBFC',
                'color': '#D7BDE2',
                'size_multiplier': 0.7
            },
            'WIPRO.NS': {
                'name': 'Wipro Ltd',
                'sector': 'IT Services',
                'color': '#A9DFBF',
                'size_multiplier': 0.6
            }
        }
        
        self.cache = {}
        self.cache_duration = 300  # 5 minutes
        
    async def get_real_time_data(self, symbols: List[str] = None) -> Dict[str, IndianStock]:
        """Get real-time data for Indian stocks"""
        if symbols is None:
            symbols = list(self.indian_companies.keys())
            
        stocks_data = {}
        
        try:
            # Use yfinance to get real-time data
            tickers = yf.Tickers(' '.join(symbols))
            
            for symbol in symbols:
                try:
                    ticker = yf.Ticker(symbol)
                    info = ticker.info
                    hist = ticker.history(period='1d', interval='1m')
                    
                    if not hist.empty:
                        current_price = hist['Close'].iloc[-1]
                        prev_close = info.get('previousClose', current_price)
                        change = current_price - prev_close
                        change_percent = (change / prev_close) * 100 if prev_close else 0
                        
                        stock = IndianStock(
                            symbol=symbol,
                            name=self.indian_companies[symbol]['name'],
                            sector=self.indian_companies[symbol]['sector'],
                            market_cap=info.get('marketCap', 0),
                            price=float(current_price),
                            change=float(change),
                            change_percent=float(change_percent),
                            volume=int(info.get('volume', 0)),
                            pe_ratio=info.get('trailingPE'),
                            dividend_yield=info.get('dividendYield'),
                            high_52w=float(info.get('fiftyTwoWeekHigh', current_price)),
                            low_52w=float(info.get('fiftyTwoWeekLow', current_price)),
                            beta=info.get('beta'),
                            last_updated=datetime.now()
                        )
                        
                        stocks_data[symbol] = stock
                        
                except Exception as e:
                    logger.error(f"Error fetching data for {symbol}: {e}")
                    # Fallback with demo data
                    stocks_data[symbol] = self._get_fallback_data(symbol)
                    
        except Exception as e:
            logger.error(f"Error in get_real_time_data: {e}")
            # Return fallback data for all symbols
            for symbol in symbols:
                stocks_data[symbol] = self._get_fallback_data(symbol)
                
        return stocks_data
    
    def _get_fallback_data(self, symbol: str) -> IndianStock:
        """Generate fallback demo data for when API fails"""
        base_prices = {
            'RELIANCE.NS': 2500,
            'TCS.NS': 3800,
            'HDFCBANK.NS': 1650,
            'INFY.NS': 1450,
            'HINDUNILVR.NS': 2400,
            'ICICIBANK.NS': 950,
            'KOTAKBANK.NS': 1800,
            'ITC.NS': 450,
            'LT.NS': 3200,
            'SBIN.NS': 600,
            'BHARTIARTL.NS': 850,
            'ASIANPAINT.NS': 3100,
            'MARUTI.NS': 10500,
            'BAJFINANCE.NS': 6800,
            'WIPRO.NS': 420
        }
        
        base_price = base_prices.get(symbol, 1000)
        # Add some random variation
        price_variation = np.random.uniform(-0.05, 0.05)
        current_price = base_price * (1 + price_variation)
        change = current_price - base_price
        change_percent = (change / base_price) * 100
        
        return IndianStock(
            symbol=symbol,
            name=self.indian_companies[symbol]['name'],
            sector=self.indian_companies[symbol]['sector'],
            market_cap=int(base_price * 1000000 * np.random.uniform(0.8, 1.2)),
            price=current_price,
            change=change,
            change_percent=change_percent,
            volume=int(np.random.uniform(100000, 5000000)),
            pe_ratio=np.random.uniform(15, 35),
            dividend_yield=np.random.uniform(0.5, 3.0),
            high_52w=current_price * np.random.uniform(1.1, 1.5),
            low_52w=current_price * np.random.uniform(0.6, 0.9),
            beta=np.random.uniform(0.8, 1.5),
            last_updated=datetime.now()
        )
    
    async def get_top_performers(self, limit: int = 10) -> List[IndianStock]:
        """Get top performing stocks of the day"""
        all_stocks = await self.get_real_time_data()
        sorted_stocks = sorted(
            all_stocks.values(),
            key=lambda x: x.change_percent,
            reverse=True
        )
        return sorted_stocks[:limit]
    
    async def get_sector_performance(self) -> Dict[str, Dict]:
        """Get sector-wise performance"""
        all_stocks = await self.get_real_time_data()
        sectors = {}
        
        for stock in all_stocks.values():
            if stock.sector not in sectors:
                sectors[stock.sector] = {
                    'stocks': [],
                    'avg_change': 0,
                    'total_market_cap': 0
                }
            sectors[stock.sector]['stocks'].append(stock)
            sectors[stock.sector]['total_market_cap'] += stock.market_cap
        
        # Calculate average change per sector
        for sector_data in sectors.values():
            if sector_data['stocks']:
                sector_data['avg_change'] = sum(
                    stock.change_percent for stock in sector_data['stocks']
                ) / len(sector_data['stocks'])
        
        return sectors
    
    def get_company_details(self, symbol: str) -> Dict:
        """Get detailed company information"""
        if symbol not in self.indian_companies:
            return {}
            
        try:
            ticker = yf.Ticker(symbol)
            info = ticker.info
            
            return {
                'symbol': symbol,
                'name': self.indian_companies[symbol]['name'],
                'sector': self.indian_companies[symbol]['sector'],
                'industry': info.get('industry', 'N/A'),
                'website': info.get('website', ''),
                'description': info.get('longBusinessSummary', ''),
                'employees': info.get('fullTimeEmployees', 0),
                'city': info.get('city', ''),
                'country': info.get('country', 'India'),
                'market_cap': info.get('marketCap', 0),
                'enterprise_value': info.get('enterpriseValue', 0),
                'revenue': info.get('totalRevenue', 0),
                'profit_margin': info.get('profitMargins', 0),
                'operating_margin': info.get('operatingMargins', 0),
                'return_on_equity': info.get('returnOnEquity', 0),
                'debt_to_equity': info.get('debtToEquity', 0),
                'current_ratio': info.get('currentRatio', 0),
                'book_value': info.get('bookValue', 0),
                'price_to_book': info.get('priceToBook', 0),
                'earnings_growth': info.get('earningsGrowth', 0),
                'revenue_growth': info.get('revenueGrowth', 0)
            }
        except Exception as e:
            logger.error(f"Error getting company details for {symbol}: {e}")
            return {
                'symbol': symbol,
                'name': self.indian_companies[symbol]['name'],
                'sector': self.indian_companies[symbol]['sector'],
                'description': f"Leading company in {self.indian_companies[symbol]['sector']} sector"
            }
    
    def get_3d_visualization_data(self) -> Dict:
        """Get data formatted for 3D visualization"""
        return {
            symbol: {
                'name': data['name'],
                'sector': data['sector'],
                'color': data['color'],
                'size_multiplier': data['size_multiplier'],
                'orbit_radius': 50 + (i * 15),  # Different orbit distances
                'orbit_speed': 0.01 + (i * 0.002),  # Different rotation speeds
                'planet_size': 2 + (data['size_multiplier'] * 3)
            }
            for i, (symbol, data) in enumerate(self.indian_companies.items())
        }
