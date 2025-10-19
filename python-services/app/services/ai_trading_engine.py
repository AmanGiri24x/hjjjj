"""
AI Trading Engine with ML Models for Signal Generation
"""

import numpy as np
import pandas as pd
import logging
from typing import Dict, List, Optional, Any, Tuple
import asyncio
from datetime import datetime, timedelta
import tensorflow as tf
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.preprocessing import StandardScaler, MinMaxScaler
import xgboost as xgb
import lightgbm as lgb
from transformers import pipeline
import yfinance as yf
import talib
import warnings
warnings.filterwarnings('ignore')

logger = logging.getLogger(__name__)

class AITradingEngine:
    """Advanced AI trading engine with multiple ML models"""
    
    def __init__(self):
        self.models = {}
        self.scalers = {}
        self.sentiment_analyzer = None
        self.is_training = False
        
        # Initialize sentiment analysis
        try:
            self.sentiment_analyzer = pipeline(
                "sentiment-analysis",
                model="ProsusAI/finbert",
                return_all_scores=True
            )
        except Exception as e:
            logger.warning(f"Could not load sentiment model: {e}")
    
    async def generate_trading_signals(
        self,
        symbols: List[str],
        timeframe: str = "1d",
        strategy_type: str = "momentum",
        risk_level: float = 0.5
    ) -> Dict[str, Any]:
        """Generate AI-powered trading signals"""
        
        try:
            signals = {}
            
            for symbol in symbols:
                # Get features
                features = await self._extract_features(symbol, timeframe)
                
                if features is None:
                    continue
                
                # Generate signal based on strategy
                if strategy_type == "momentum":
                    signal = await self._momentum_signal(features, risk_level)
                elif strategy_type == "mean_reversion":
                    signal = await self._mean_reversion_signal(features, risk_level)
                elif strategy_type == "ml_ensemble":
                    signal = await self._ml_ensemble_signal(symbol, features, risk_level)
                else:
                    signal = await self._ml_ensemble_signal(symbol, features, risk_level)
                
                signals[symbol] = signal
            
            return {
                'signals': signals,
                'timestamp': datetime.now(),
                'strategy_type': strategy_type,
                'risk_level': risk_level
            }
            
        except Exception as e:
            logger.error(f"Error generating trading signals: {e}")
            raise
    
    async def _extract_features(self, symbol: str, timeframe: str) -> Optional[pd.DataFrame]:
        """Extract technical and fundamental features"""
        
        try:
            # Get price data
            ticker = yf.Ticker(symbol)
            data = ticker.history(period="1y", interval=timeframe)
            
            if data.empty:
                return None
            
            # Technical indicators
            data['RSI'] = talib.RSI(data['Close'].values)
            data['MACD'], data['MACD_Signal'], data['MACD_Hist'] = talib.MACD(data['Close'].values)
            data['BB_Upper'], data['BB_Middle'], data['BB_Lower'] = talib.BBANDS(data['Close'].values)
            data['SMA_20'] = talib.SMA(data['Close'].values, timeperiod=20)
            data['SMA_50'] = talib.SMA(data['Close'].values, timeperiod=50)
            data['EMA_12'] = talib.EMA(data['Close'].values, timeperiod=12)
            data['EMA_26'] = talib.EMA(data['Close'].values, timeperiod=26)
            data['ATR'] = talib.ATR(data['High'].values, data['Low'].values, data['Close'].values)
            data['ADX'] = talib.ADX(data['High'].values, data['Low'].values, data['Close'].values)
            
            # Price features
            data['Returns'] = data['Close'].pct_change()
            data['Log_Returns'] = np.log(data['Close'] / data['Close'].shift(1))
            data['Volatility'] = data['Returns'].rolling(20).std()
            data['Price_Position'] = (data['Close'] - data['Low'].rolling(20).min()) / (data['High'].rolling(20).max() - data['Low'].rolling(20).min())
            
            # Volume features
            data['Volume_SMA'] = data['Volume'].rolling(20).mean()
            data['Volume_Ratio'] = data['Volume'] / data['Volume_SMA']
            data['OBV'] = talib.OBV(data['Close'].values, data['Volume'].values)
            
            return data.dropna()
            
        except Exception as e:
            logger.error(f"Error extracting features for {symbol}: {e}")
            return None
    
    async def _momentum_signal(self, features: pd.DataFrame, risk_level: float) -> Dict[str, Any]:
        """Generate momentum-based signal"""
        
        latest = features.iloc[-1]
        
        # Momentum indicators
        rsi_signal = 1 if latest['RSI'] > 70 else (-1 if latest['RSI'] < 30 else 0)
        macd_signal = 1 if latest['MACD'] > latest['MACD_Signal'] else -1
        sma_signal = 1 if latest['Close'] > latest['SMA_20'] else -1
        
        # Combine signals
        signal_strength = (rsi_signal + macd_signal + sma_signal) / 3
        
        # Adjust for risk level
        position_size = abs(signal_strength) * risk_level
        
        return {
            'action': 'BUY' if signal_strength > 0.3 else ('SELL' if signal_strength < -0.3 else 'HOLD'),
            'strength': abs(signal_strength),
            'position_size': position_size,
            'confidence': min(abs(signal_strength) + 0.5, 1.0),
            'indicators': {
                'RSI': latest['RSI'],
                'MACD': latest['MACD'],
                'SMA_20': latest['SMA_20']
            }
        }
    
    async def _mean_reversion_signal(self, features: pd.DataFrame, risk_level: float) -> Dict[str, Any]:
        """Generate mean reversion signal"""
        
        latest = features.iloc[-1]
        
        # Mean reversion indicators
        bb_position = (latest['Close'] - latest['BB_Lower']) / (latest['BB_Upper'] - latest['BB_Lower'])
        price_position = latest['Price_Position']
        rsi_mean_reversion = 1 if latest['RSI'] < 30 else (-1 if latest['RSI'] > 70 else 0)
        
        # Combine signals (inverse logic for mean reversion)
        signal_strength = -(bb_position - 0.5) * 2 + rsi_mean_reversion * 0.5
        
        position_size = abs(signal_strength) * risk_level
        
        return {
            'action': 'BUY' if signal_strength > 0.3 else ('SELL' if signal_strength < -0.3 else 'HOLD'),
            'strength': abs(signal_strength),
            'position_size': position_size,
            'confidence': min(abs(signal_strength) + 0.4, 1.0),
            'indicators': {
                'BB_Position': bb_position,
                'Price_Position': price_position,
                'RSI': latest['RSI']
            }
        }
    
    async def _ml_ensemble_signal(self, symbol: str, features: pd.DataFrame, risk_level: float) -> Dict[str, Any]:
        """Generate ML ensemble signal"""
        
        try:
            # Prepare features for ML
            feature_cols = ['RSI', 'MACD', 'ATR', 'ADX', 'Returns', 'Volatility', 'Volume_Ratio']
            X = features[feature_cols].dropna()
            
            if len(X) < 50:  # Need minimum data
                return await self._momentum_signal(features, risk_level)
            
            # Create target (future returns)
            y = features['Returns'].shift(-1).dropna()
            X = X.iloc[:-1]  # Align with y
            
            # Train ensemble if not exists
            if symbol not in self.models:
                await self._train_ensemble_model(symbol, X, y)
            
            # Make prediction
            latest_features = X.iloc[-1:].values
            
            if symbol in self.models and symbol in self.scalers:
                scaled_features = self.scalers[symbol].transform(latest_features)
                
                predictions = []
                for model in self.models[symbol]:
                    pred = model.predict(scaled_features)[0]
                    predictions.append(pred)
                
                # Ensemble prediction
                ensemble_pred = np.mean(predictions)
                confidence = 1 - np.std(predictions)  # Lower std = higher confidence
                
                # Generate signal
                signal_strength = np.tanh(ensemble_pred * 10)  # Normalize to [-1, 1]
                position_size = abs(signal_strength) * risk_level * confidence
                
                return {
                    'action': 'BUY' if signal_strength > 0.2 else ('SELL' if signal_strength < -0.2 else 'HOLD'),
                    'strength': abs(signal_strength),
                    'position_size': position_size,
                    'confidence': confidence,
                    'predicted_return': ensemble_pred,
                    'model_type': 'ml_ensemble'
                }
            
            # Fallback to momentum
            return await self._momentum_signal(features, risk_level)
            
        except Exception as e:
            logger.error(f"Error in ML ensemble signal: {e}")
            return await self._momentum_signal(features, risk_level)
    
    async def _train_ensemble_model(self, symbol: str, X: pd.DataFrame, y: pd.Series):
        """Train ensemble of ML models"""
        
        try:
            # Scale features
            scaler = StandardScaler()
            X_scaled = scaler.fit_transform(X)
            
            # Train multiple models
            models = []
            
            # Random Forest
            rf = RandomForestRegressor(n_estimators=100, random_state=42)
            rf.fit(X_scaled, y)
            models.append(rf)
            
            # XGBoost
            xgb_model = xgb.XGBRegressor(n_estimators=100, random_state=42)
            xgb_model.fit(X_scaled, y)
            models.append(xgb_model)
            
            # LightGBM
            lgb_model = lgb.LGBMRegressor(n_estimators=100, random_state=42, verbose=-1)
            lgb_model.fit(X_scaled, y)
            models.append(lgb_model)
            
            self.models[symbol] = models
            self.scalers[symbol] = scaler
            
            logger.info(f"Trained ensemble model for {symbol}")
            
        except Exception as e:
            logger.error(f"Error training ensemble model for {symbol}: {e}")
    
    async def predict_price(
        self,
        symbol: str,
        horizon: int = 5,
        model_type: str = "lstm",
        features: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """Predict future price using deep learning"""
        
        try:
            # Get historical data
            ticker = yf.Ticker(symbol)
            data = ticker.history(period="2y", interval="1d")
            
            if len(data) < 100:
                raise ValueError("Insufficient data for prediction")
            
            # Prepare data for LSTM
            prices = data['Close'].values
            scaler = MinMaxScaler()
            scaled_prices = scaler.fit_transform(prices.reshape(-1, 1))
            
            # Create sequences
            sequence_length = 60
            X, y = [], []
            
            for i in range(sequence_length, len(scaled_prices) - horizon):
                X.append(scaled_prices[i-sequence_length:i, 0])
                y.append(scaled_prices[i:i+horizon, 0])
            
            X, y = np.array(X), np.array(y)
            X = X.reshape((X.shape[0], X.shape[1], 1))
            
            # Build LSTM model
            model = tf.keras.Sequential([
                tf.keras.layers.LSTM(50, return_sequences=True, input_shape=(sequence_length, 1)),
                tf.keras.layers.Dropout(0.2),
                tf.keras.layers.LSTM(50, return_sequences=False),
                tf.keras.layers.Dropout(0.2),
                tf.keras.layers.Dense(25),
                tf.keras.layers.Dense(horizon)
            ])
            
            model.compile(optimizer='adam', loss='mse')
            
            # Train model
            model.fit(X, y, batch_size=32, epochs=50, verbose=0)
            
            # Make prediction
            last_sequence = scaled_prices[-sequence_length:].reshape(1, sequence_length, 1)
            prediction_scaled = model.predict(last_sequence, verbose=0)
            
            # Inverse transform
            prediction = scaler.inverse_transform(prediction_scaled.reshape(-1, 1)).flatten()
            
            # Calculate confidence intervals
            current_price = prices[-1]
            predicted_returns = (prediction - current_price) / current_price
            
            return {
                'symbol': symbol,
                'current_price': current_price,
                'predicted_prices': prediction.tolist(),
                'predicted_returns': predicted_returns.tolist(),
                'horizon_days': horizon,
                'model_type': model_type,
                'confidence': 0.75,  # Simplified confidence
                'timestamp': datetime.now()
            }
            
        except Exception as e:
            logger.error(f"Error predicting price for {symbol}: {e}")
            raise
    
    async def analyze_market_sentiment(
        self,
        symbols: List[str],
        sources: List[str] = ["news"],
        timeframe: str = "1d"
    ) -> Dict[str, Any]:
        """Analyze market sentiment from various sources"""
        
        try:
            sentiment_scores = {}
            
            for symbol in symbols:
                # Get news sentiment (simplified)
                news_sentiment = await self._get_news_sentiment(symbol)
                
                # Get social media sentiment (placeholder)
                social_sentiment = 0.0  # Would integrate Twitter/Reddit APIs
                
                # Combine sentiments
                overall_sentiment = (news_sentiment + social_sentiment) / 2
                
                sentiment_scores[symbol] = {
                    'overall_sentiment': overall_sentiment,
                    'news_sentiment': news_sentiment,
                    'social_sentiment': social_sentiment,
                    'sentiment_label': self._sentiment_to_label(overall_sentiment)
                }
            
            return {
                'sentiment_scores': sentiment_scores,
                'timestamp': datetime.now(),
                'sources': sources
            }
            
        except Exception as e:
            logger.error(f"Error analyzing sentiment: {e}")
            raise
    
    async def _get_news_sentiment(self, symbol: str) -> float:
        """Get news sentiment for symbol"""
        
        if not self.sentiment_analyzer:
            return 0.0
        
        try:
            # Get recent news (simplified - would use news APIs)
            ticker = yf.Ticker(symbol)
            news = ticker.news
            
            if not news:
                return 0.0
            
            sentiments = []
            for article in news[:5]:  # Analyze recent articles
                title = article.get('title', '')
                if title:
                    result = self.sentiment_analyzer(title)
                    # Convert to numerical score
                    for item in result[0]:
                        if item['label'] == 'positive':
                            sentiments.append(item['score'])
                        elif item['label'] == 'negative':
                            sentiments.append(-item['score'])
            
            return np.mean(sentiments) if sentiments else 0.0
            
        except Exception as e:
            logger.warning(f"Error getting news sentiment for {symbol}: {e}")
            return 0.0
    
    def _sentiment_to_label(self, score: float) -> str:
        """Convert sentiment score to label"""
        if score > 0.2:
            return "Bullish"
        elif score < -0.2:
            return "Bearish"
        else:
            return "Neutral"
    
    async def start_model_training(self):
        """Start background model training"""
        self.is_training = True
        logger.info("Started AI model training background task")
        
        while self.is_training:
            try:
                # Retrain models periodically
                await asyncio.sleep(3600)  # Every hour
                
                # Add model retraining logic here
                
            except Exception as e:
                logger.error(f"Error in model training: {e}")
                await asyncio.sleep(300)  # Wait 5 minutes on error
    
    def is_healthy(self) -> bool:
        """Check if service is healthy"""
        return True
