"""
DhanAillytics Python Financial Services
Production-grade financial analysis and AI/ML services
"""

from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import uvicorn
import logging
from contextlib import asynccontextmanager
import asyncio
from typing import List, Dict, Any, Optional
import os
from dotenv import load_dotenv

# Import our services
from services.market_data_service import MarketDataService
from services.portfolio_optimizer import PortfolioOptimizer
from services.risk_manager import RiskManager
from services.ai_trading_engine import AITradingEngine
from services.backtesting_engine import BacktestingEngine
from models.schemas import *
from utils.auth import verify_token
from utils.database import DatabaseManager
from utils.logger import setup_logging

load_dotenv()

# Setup logging
setup_logging()
logger = logging.getLogger(__name__)

# Global services
market_service = None
portfolio_optimizer = None
risk_manager = None
ai_engine = None
backtesting_engine = None
db_manager = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize services on startup"""
    global market_service, portfolio_optimizer, risk_manager, ai_engine, backtesting_engine, db_manager
    
    logger.info("Initializing DhanAillytics Python Services...")
    
    # Initialize database
    db_manager = DatabaseManager()
    await db_manager.initialize()
    
    # Initialize services
    market_service = MarketDataService()
    portfolio_optimizer = PortfolioOptimizer()
    risk_manager = RiskManager()
    ai_engine = AITradingEngine()
    backtesting_engine = BacktestingEngine()
    
    # Start background tasks
    asyncio.create_task(market_service.start_real_time_feeds())
    asyncio.create_task(ai_engine.start_model_training())
    
    logger.info("All services initialized successfully")
    
    yield
    
    # Cleanup
    logger.info("Shutting down services...")
    await market_service.cleanup()
    await db_manager.close()

app = FastAPI(
    title="DhanAillytics Financial Services",
    description="Production-grade financial analysis and AI/ML services",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://dhanaillytics.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verify JWT token and get user info"""
    try:
        user_info = await verify_token(credentials.credentials)
        return user_info
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid authentication token")

# Health check
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "services": {
            "market_data": market_service.is_healthy() if market_service else False,
            "portfolio_optimizer": portfolio_optimizer.is_healthy() if portfolio_optimizer else False,
            "risk_manager": risk_manager.is_healthy() if risk_manager else False,
            "ai_engine": ai_engine.is_healthy() if ai_engine else False,
            "backtesting": backtesting_engine.is_healthy() if backtesting_engine else False
        }
    }

# Market Data Endpoints
@app.get("/api/v1/market/quote/{symbol}")
async def get_quote(symbol: str, user=Depends(get_current_user)):
    """Get real-time quote for a symbol"""
    try:
        quote = await market_service.get_real_time_quote(symbol)
        return {"success": True, "data": quote}
    except Exception as e:
        logger.error(f"Error getting quote for {symbol}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/market/batch-quotes")
async def get_batch_quotes(request: BatchQuoteRequest, user=Depends(get_current_user)):
    """Get real-time quotes for multiple symbols"""
    try:
        quotes = await market_service.get_batch_quotes(request.symbols)
        return {"success": True, "data": quotes}
    except Exception as e:
        logger.error(f"Error getting batch quotes: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/market/historical/{symbol}")
async def get_historical_data(
    symbol: str, 
    period: str = "1y",
    interval: str = "1d",
    user=Depends(get_current_user)
):
    """Get historical price data"""
    try:
        data = await market_service.get_historical_data(symbol, period, interval)
        return {"success": True, "data": data}
    except Exception as e:
        logger.error(f"Error getting historical data for {symbol}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Portfolio Optimization Endpoints
@app.post("/api/v1/portfolio/optimize")
async def optimize_portfolio(request: PortfolioOptimizationRequest, user=Depends(get_current_user)):
    """Optimize portfolio allocation using modern portfolio theory"""
    try:
        result = await portfolio_optimizer.optimize_portfolio(
            symbols=request.symbols,
            weights=request.current_weights,
            objective=request.objective,
            constraints=request.constraints,
            risk_tolerance=request.risk_tolerance
        )
        return {"success": True, "data": result}
    except Exception as e:
        logger.error(f"Error optimizing portfolio: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/portfolio/efficient-frontier")
async def calculate_efficient_frontier(request: EfficientFrontierRequest, user=Depends(get_current_user)):
    """Calculate efficient frontier for given assets"""
    try:
        frontier = await portfolio_optimizer.calculate_efficient_frontier(
            symbols=request.symbols,
            num_portfolios=request.num_portfolios,
            risk_free_rate=request.risk_free_rate
        )
        return {"success": True, "data": frontier}
    except Exception as e:
        logger.error(f"Error calculating efficient frontier: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Risk Management Endpoints
@app.post("/api/v1/risk/calculate-var")
async def calculate_var(request: VaRRequest, user=Depends(get_current_user)):
    """Calculate Value at Risk for portfolio"""
    try:
        var_result = await risk_manager.calculate_var(
            portfolio=request.portfolio,
            confidence_level=request.confidence_level,
            time_horizon=request.time_horizon,
            method=request.method
        )
        return {"success": True, "data": var_result}
    except Exception as e:
        logger.error(f"Error calculating VaR: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/risk/stress-test")
async def stress_test_portfolio(request: StressTestRequest, user=Depends(get_current_user)):
    """Perform stress testing on portfolio"""
    try:
        stress_results = await risk_manager.stress_test_portfolio(
            portfolio=request.portfolio,
            scenarios=request.scenarios,
            shock_magnitude=request.shock_magnitude
        )
        return {"success": True, "data": stress_results}
    except Exception as e:
        logger.error(f"Error performing stress test: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# AI Trading Engine Endpoints
@app.post("/api/v1/ai/generate-signals")
async def generate_trading_signals(request: TradingSignalRequest, user=Depends(get_current_user)):
    """Generate AI-powered trading signals"""
    try:
        signals = await ai_engine.generate_trading_signals(
            symbols=request.symbols,
            timeframe=request.timeframe,
            strategy_type=request.strategy_type,
            risk_level=request.risk_level
        )
        return {"success": True, "data": signals}
    except Exception as e:
        logger.error(f"Error generating trading signals: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/ai/predict-price")
async def predict_price(request: PricePredictionRequest, user=Depends(get_current_user)):
    """Predict future price using AI models"""
    try:
        prediction = await ai_engine.predict_price(
            symbol=request.symbol,
            horizon=request.horizon,
            model_type=request.model_type,
            features=request.features
        )
        return {"success": True, "data": prediction}
    except Exception as e:
        logger.error(f"Error predicting price for {request.symbol}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/ai/sentiment-analysis")
async def analyze_sentiment(request: SentimentAnalysisRequest, user=Depends(get_current_user)):
    """Analyze market sentiment from news and social media"""
    try:
        sentiment = await ai_engine.analyze_market_sentiment(
            symbols=request.symbols,
            sources=request.sources,
            timeframe=request.timeframe
        )
        return {"success": True, "data": sentiment}
    except Exception as e:
        logger.error(f"Error analyzing sentiment: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Backtesting Endpoints
@app.post("/api/v1/backtest/run")
async def run_backtest(request: BacktestRequest, user=Depends(get_current_user)):
    """Run strategy backtest"""
    try:
        results = await backtesting_engine.run_backtest(
            strategy=request.strategy,
            symbols=request.symbols,
            start_date=request.start_date,
            end_date=request.end_date,
            initial_capital=request.initial_capital,
            parameters=request.parameters
        )
        return {"success": True, "data": results}
    except Exception as e:
        logger.error(f"Error running backtest: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/backtest/results/{backtest_id}")
async def get_backtest_results(backtest_id: str, user=Depends(get_current_user)):
    """Get backtest results by ID"""
    try:
        results = await backtesting_engine.get_backtest_results(backtest_id)
        return {"success": True, "data": results}
    except Exception as e:
        logger.error(f"Error getting backtest results: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Advanced Analytics Endpoints
@app.post("/api/v1/analytics/factor-analysis")
async def factor_analysis(request: FactorAnalysisRequest, user=Depends(get_current_user)):
    """Perform factor analysis on portfolio"""
    try:
        analysis = await portfolio_optimizer.factor_analysis(
            portfolio=request.portfolio,
            factors=request.factors,
            period=request.period
        )
        return {"success": True, "data": analysis}
    except Exception as e:
        logger.error(f"Error performing factor analysis: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/analytics/correlation-analysis")
async def correlation_analysis(request: CorrelationAnalysisRequest, user=Depends(get_current_user)):
    """Analyze correlations between assets"""
    try:
        correlations = await market_service.calculate_correlations(
            symbols=request.symbols,
            period=request.period,
            method=request.method
        )
        return {"success": True, "data": correlations}
    except Exception as e:
        logger.error(f"Error calculating correlations: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8001,
        reload=True,
        log_level="info"
    )
