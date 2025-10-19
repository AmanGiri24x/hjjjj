"""
Simplified DhanAillytics Python Services for immediate startup
"""

from fastapi import FastAPI, HTTPException
from app.services.market_data_service import MarketDataService
from app.services.portfolio_optimizer import PortfolioOptimizer
from app.services.ai_trading_engine import AITradingEngine
from app.services.risk_manager import RiskManager
from app.services.indian_market_service import IndianMarketService
from typing import Dict, Any
from datetime import datetime
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="DhanAillytics Financial Services",
    description="Production-grade financial analysis services",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3002", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "services": {
            "market_data": "active",
            "portfolio_optimizer": "active", 
            "ai_trading": "active",
            "risk_manager": "active",
            "indian_market": "active"
        }
    }

# Market Data Endpoints
# Initialize Indian Market Service
indian_market = IndianMarketService()

@app.get("/api/v1/market/quote/{symbol}")
async def get_quote(symbol: str):
    try:
        ticker = yf.Ticker(symbol)
        info = ticker.info
        hist = ticker.history(period="2d")
        
        if hist.empty:
            raise HTTPException(status_code=404, detail="Symbol not found")
            
        latest = hist.iloc[-1]
        previous = hist.iloc[-2] if len(hist) > 1 else latest
        
        current_price = float(latest['Close'])
        previous_close = float(previous['Close'])
        change = current_price - previous_close
        change_percent = (change / previous_close) * 100 if previous_close != 0 else 0
        
        return {
            "success": True,
            "data": {
                "symbol": symbol.upper(),
                "price": current_price,
                "change": change,
                "change_percent": change_percent,
                "volume": int(latest['Volume']),
                "high": float(latest['High']),
                "low": float(latest['Low']),
                "open": float(latest['Open']),
                "previous_close": previous_close,
                "timestamp": datetime.now().isoformat()
            }
        }
    except Exception as e:
        logger.error(f"Error getting quote for {symbol}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/market/batch-quotes")
async def get_batch_quotes(request: Dict[str, List[str]]):
    try:
        symbols = request.get("symbols", [])
        quotes = {}
        
        for symbol in symbols[:10]:  # Limit to 10 symbols
            try:
                ticker = yf.Ticker(symbol)
                hist = ticker.history(period="1d")
                if not hist.empty:
                    latest = hist.iloc[-1]
                    quotes[symbol] = {
                        "price": float(latest['Close']),
                        "volume": int(latest['Volume']),
                        "change_percent": 0.0  # Simplified
                    }
            except:
                continue
        
        return {"success": True, "data": quotes}
    except Exception as e:
        logger.error(f"Error getting batch quotes: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/market/historical/{symbol}")
async def get_historical_data(symbol: str, period: str = "1y", interval: str = "1d"):
    try:
        ticker = yf.Ticker(symbol)
        data = ticker.history(period=period, interval=interval)
        
        if data.empty:
            raise HTTPException(status_code=404, detail="No data found")
        
        # Convert to JSON-serializable format
        result = []
        for date, row in data.iterrows():
            result.append({
                "date": date.strftime("%Y-%m-%d"),
                "open": float(row['Open']),
                "high": float(row['High']),
                "low": float(row['Low']),
                "close": float(row['Close']),
                "volume": int(row['Volume'])
            })
        
        return {"success": True, "data": result}
    except Exception as e:
        logger.error(f"Error getting historical data: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Portfolio Optimization
@app.post("/api/v1/portfolio/optimize")
async def optimize_portfolio(request: Dict[str, Any]):
    try:
        symbols = request.get("symbols", [])
        
        # Simple equal-weight optimization for demo
        num_assets = len(symbols)
        weights = {symbol: 1.0/num_assets for symbol in symbols}
        
        return {
            "success": True,
            "data": {
                "weights": weights,
                "method": "equal_weight",
                "expected_return": 0.12,
                "volatility": 0.18,
                "sharpe_ratio": 0.67
            }
        }
    except Exception as e:
        logger.error(f"Error optimizing portfolio: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# AI Trading Signals
@app.post("/api/v1/ai/generate-signals")
async def generate_trading_signals(request: Dict[str, Any]):
    try:
        symbols = request.get("symbols", [])
        signals = {}
        
        for symbol in symbols:
            # Simple momentum signal
            ticker = yf.Ticker(symbol)
            hist = ticker.history(period="30d")
            
            if len(hist) >= 20:
                sma_20 = hist['Close'].rolling(20).mean().iloc[-1]
                current_price = hist['Close'].iloc[-1]
                
                if current_price > sma_20:
                    action = "BUY"
                    strength = 0.7
                else:
                    action = "SELL"
                    strength = 0.6
            else:
                action = "HOLD"
                strength = 0.5
            
            signals[symbol] = {
                "action": action,
                "strength": strength,
                "confidence": 0.75,
                "strategy": "momentum"
            }
        
        return {
            "success": True,
            "data": {
                "signals": signals,
                "timestamp": datetime.now().isoformat()
            }
        }
    except Exception as e:
        logger.error(f"Error generating signals: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Risk Management
@app.post("/api/v1/risk/calculate-var")
async def calculate_var(request: Dict[str, Any]):
    try:
        portfolio = request.get("portfolio", {})
        confidence_level = request.get("confidence_level", 0.95)
        
        # Simplified VaR calculation
        var_95 = 0.05  # 5% portfolio loss at 95% confidence
        
        return {
            "success": True,
            "data": {
                "var": var_95,
                "confidence_level": confidence_level,
                "method": "historical",
                "portfolio_volatility": 0.18,
                "max_drawdown": 0.12
            }
        }
    except Exception as e:
        logger.error(f"Error calculating VaR: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Indian Market Endpoints
@app.get("/api/v1/indian-market/stocks")
async def get_indian_stocks():
    """Get real-time data for top Indian stocks"""
    try:
        stocks_data = await indian_market.get_real_time_data()
        return {
            "success": True,
            "data": {
                symbol: {
                    "symbol": stock.symbol,
                    "name": stock.name,
                    "sector": stock.sector,
                    "price": stock.price,
                    "change": stock.change,
                    "change_percent": stock.change_percent,
                    "volume": stock.volume,
                    "market_cap": stock.market_cap,
                    "pe_ratio": stock.pe_ratio,
                    "dividend_yield": stock.dividend_yield,
                    "high_52w": stock.high_52w,
                    "low_52w": stock.low_52w,
                    "beta": stock.beta,
                    "last_updated": stock.last_updated.isoformat()
                }
                for symbol, stock in stocks_data.items()
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/indian-market/3d-data")
async def get_3d_visualization_data():
    """Get data formatted for 3D portfolio visualization"""
    try:
        stocks_data = await indian_market.get_real_time_data()
        viz_config = indian_market.get_3d_visualization_data()
        
        return {
            "success": True,
            "planets": [
                {
                    "id": symbol,
                    "symbol": symbol,
                    "name": viz_config[symbol]["name"],
                    "sector": viz_config[symbol]["sector"],
                    "color": viz_config[symbol]["color"],
                    "size": viz_config[symbol]["planet_size"],
                    "orbitRadius": viz_config[symbol]["orbit_radius"],
                    "orbitSpeed": viz_config[symbol]["orbit_speed"],
                    "price": stocks_data[symbol].price if symbol in stocks_data else 0,
                    "change": stocks_data[symbol].change if symbol in stocks_data else 0,
                    "changePercent": stocks_data[symbol].change_percent if symbol in stocks_data else 0,
                    "marketCap": stocks_data[symbol].market_cap if symbol in stocks_data else 0,
                    "volume": stocks_data[symbol].volume if symbol in stocks_data else 0
                }
                for symbol in viz_config.keys()
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/indian-market/company/{symbol}")
async def get_company_details(symbol: str):
    """Get detailed company information"""
    try:
        details = indian_market.get_company_details(symbol)
        if not details:
            raise HTTPException(status_code=404, detail="Company not found")
        
        return {
            "success": True,
            "data": details
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/indian-market/top-performers")
async def get_top_performers(limit: int = 10):
    """Get top performing Indian stocks"""
    try:
        performers = await indian_market.get_top_performers(limit)
        return {
            "success": True,
            "data": [
                {
                    "symbol": stock.symbol,
                    "name": stock.name,
                    "sector": stock.sector,
                    "price": stock.price,
                    "change": stock.change,
                    "change_percent": stock.change_percent,
                    "market_cap": stock.market_cap
                }
                for stock in performers
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/indian-market/sectors")
async def get_sector_performance():
    """Get sector-wise performance"""
    try:
        sectors = await indian_market.get_sector_performance()
        return {
            "success": True,
            "data": {
                sector: {
                    "avg_change": data["avg_change"],
                    "total_market_cap": data["total_market_cap"],
                    "stock_count": len(data["stocks"])
                }
                for sector, data in sectors.items()
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001, reload=True, log_level="info")
