"""
Comprehensive Backtesting Engine
Strategy testing with performance analytics
"""

import numpy as np
import pandas as pd
import logging
from typing import Dict, List, Optional, Any, Callable
from datetime import datetime, timedelta
import asyncio
import backtrader as bt
import yfinance as yf
from dataclasses import dataclass
import uuid
import pickle
import os

logger = logging.getLogger(__name__)

@dataclass
class BacktestResult:
    strategy_name: str
    total_return: float
    annual_return: float
    volatility: float
    sharpe_ratio: float
    max_drawdown: float
    win_rate: float
    profit_factor: float
    total_trades: int
    avg_trade_return: float
    best_trade: float
    worst_trade: float
    equity_curve: pd.Series
    trades: List[Dict]
    metrics: Dict[str, Any]

class BacktestingEngine:
    """Advanced backtesting engine with multiple strategies"""
    
    def __init__(self):
        self.results_cache = {}
        self.strategies = {}
        self._register_default_strategies()
    
    def _register_default_strategies(self):
        """Register built-in trading strategies"""
        self.strategies = {
            'sma_crossover': SMAStrategy,
            'rsi_mean_reversion': RSIStrategy,
            'momentum': MomentumStrategy,
            'mean_reversion': MeanReversionStrategy,
            'bollinger_bands': BollingerBandsStrategy
        }
    
    async def run_backtest(
        self,
        strategy: str,
        symbols: List[str],
        start_date: str,
        end_date: str,
        initial_capital: float = 100000,
        parameters: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """Run comprehensive backtest"""
        
        try:
            backtest_id = str(uuid.uuid4())
            logger.info(f"Starting backtest {backtest_id} for strategy {strategy}")
            
            # Get strategy class
            if strategy not in self.strategies:
                raise ValueError(f"Unknown strategy: {strategy}")
            
            strategy_class = self.strategies[strategy]
            
            # Run backtest for each symbol
            results = {}
            
            for symbol in symbols:
                result = await self._run_single_backtest(
                    strategy_class, symbol, start_date, end_date, 
                    initial_capital, parameters or {}
                )
                results[symbol] = result
            
            # Aggregate results
            aggregated = self._aggregate_results(results)
            
            # Cache results
            self.results_cache[backtest_id] = {
                'results': results,
                'aggregated': aggregated,
                'parameters': {
                    'strategy': strategy,
                    'symbols': symbols,
                    'start_date': start_date,
                    'end_date': end_date,
                    'initial_capital': initial_capital,
                    'parameters': parameters
                },
                'timestamp': datetime.now()
            }
            
            return {
                'backtest_id': backtest_id,
                'individual_results': results,
                'aggregated_results': aggregated,
                'status': 'completed'
            }
            
        except Exception as e:
            logger.error(f"Error running backtest: {e}")
            raise
    
    async def _run_single_backtest(
        self,
        strategy_class,
        symbol: str,
        start_date: str,
        end_date: str,
        initial_capital: float,
        parameters: Dict
    ) -> BacktestResult:
        """Run backtest for single symbol"""
        
        # Get data
        data = await self._get_backtest_data(symbol, start_date, end_date)
        
        # Create Backtrader cerebro
        cerebro = bt.Cerebro()
        
        # Add data
        data_feed = bt.feeds.PandasData(dataname=data)
        cerebro.adddata(data_feed)
        
        # Add strategy
        cerebro.addstrategy(strategy_class, **parameters)
        
        # Set initial capital
        cerebro.broker.setcash(initial_capital)
        
        # Add analyzers
        cerebro.addanalyzer(bt.analyzers.Returns, _name='returns')
        cerebro.addanalyzer(bt.analyzers.SharpeRatio, _name='sharpe')
        cerebro.addanalyzer(bt.analyzers.DrawDown, _name='drawdown')
        cerebro.addanalyzer(bt.analyzers.TradeAnalyzer, _name='trades')
        
        # Run backtest
        results = cerebro.run()
        strategy_result = results[0]
        
        # Extract metrics
        returns_analyzer = strategy_result.analyzers.returns.get_analysis()
        sharpe_analyzer = strategy_result.analyzers.sharpe.get_analysis()
        drawdown_analyzer = strategy_result.analyzers.drawdown.get_analysis()
        trades_analyzer = strategy_result.analyzers.trades.get_analysis()
        
        # Calculate additional metrics
        final_value = cerebro.broker.getvalue()
        total_return = (final_value - initial_capital) / initial_capital
        
        # Get equity curve
        equity_curve = self._extract_equity_curve(strategy_result)
        
        # Get trade details
        trades = self._extract_trades(strategy_result)
        
        return BacktestResult(
            strategy_name=strategy_class.__name__,
            total_return=total_return,
            annual_return=returns_analyzer.get('rnorm100', 0) / 100,
            volatility=np.std([returns_analyzer.get('rnorm100', 0)]) / 100,
            sharpe_ratio=sharpe_analyzer.get('sharperatio', 0) or 0,
            max_drawdown=drawdown_analyzer.get('max', {}).get('drawdown', 0) / 100,
            win_rate=trades_analyzer.get('won', {}).get('total', 0) / max(trades_analyzer.get('total', {}).get('total', 1), 1),
            profit_factor=self._calculate_profit_factor(trades_analyzer),
            total_trades=trades_analyzer.get('total', {}).get('total', 0),
            avg_trade_return=trades_analyzer.get('pnl', {}).get('net', {}).get('average', 0),
            best_trade=trades_analyzer.get('pnl', {}).get('net', {}).get('max', 0),
            worst_trade=trades_analyzer.get('pnl', {}).get('net', {}).get('min', 0),
            equity_curve=equity_curve,
            trades=trades,
            metrics=self._calculate_additional_metrics(equity_curve, trades)
        )
    
    def _calculate_profit_factor(self, trades_analyzer: Dict) -> float:
        """Calculate profit factor"""
        gross_profits = trades_analyzer.get('won', {}).get('pnl', {}).get('total', 0)
        gross_losses = abs(trades_analyzer.get('lost', {}).get('pnl', {}).get('total', 0))
        
        return gross_profits / max(gross_losses, 1)
    
    def _extract_equity_curve(self, strategy_result) -> pd.Series:
        """Extract equity curve from strategy"""
        # Simplified equity curve extraction
        dates = [bt.num2date(x) for x in strategy_result.datas[0].datetime.array]
        values = [strategy_result.broker.getvalue()] * len(dates)  # Simplified
        
        return pd.Series(values, index=dates)
    
    def _extract_trades(self, strategy_result) -> List[Dict]:
        """Extract individual trades"""
        # Simplified trade extraction
        return []  # Would implement detailed trade tracking
    
    def _calculate_additional_metrics(self, equity_curve: pd.Series, trades: List[Dict]) -> Dict[str, Any]:
        """Calculate additional performance metrics"""
        
        returns = equity_curve.pct_change().dropna()
        
        return {
            'calmar_ratio': equity_curve.iloc[-1] / abs(equity_curve.min()) if equity_curve.min() < 0 else 0,
            'sortino_ratio': returns.mean() / returns[returns < 0].std() if len(returns[returns < 0]) > 0 else 0,
            'skewness': returns.skew(),
            'kurtosis': returns.kurtosis(),
            'var_95': np.percentile(returns, 5),
            'cvar_95': returns[returns <= np.percentile(returns, 5)].mean()
        }
    
    async def _get_backtest_data(self, symbol: str, start_date: str, end_date: str) -> pd.DataFrame:
        """Get historical data for backtesting"""
        
        try:
            data = yf.download(symbol, start=start_date, end=end_date, progress=False)
            
            # Ensure required columns
            required_columns = ['Open', 'High', 'Low', 'Close', 'Volume']
            for col in required_columns:
                if col not in data.columns:
                    raise ValueError(f"Missing required column: {col}")
            
            return data
            
        except Exception as e:
            logger.error(f"Error getting backtest data for {symbol}: {e}")
            raise
    
    def _aggregate_results(self, results: Dict[str, BacktestResult]) -> Dict[str, Any]:
        """Aggregate results across multiple symbols"""
        
        if not results:
            return {}
        
        # Calculate portfolio-level metrics
        total_returns = [r.total_return for r in results.values()]
        annual_returns = [r.annual_return for r in results.values()]
        volatilities = [r.volatility for r in results.values()]
        sharpe_ratios = [r.sharpe_ratio for r in results.values() if r.sharpe_ratio]
        max_drawdowns = [r.max_drawdown for r in results.values()]
        
        return {
            'portfolio_return': np.mean(total_returns),
            'portfolio_annual_return': np.mean(annual_returns),
            'portfolio_volatility': np.mean(volatilities),
            'portfolio_sharpe': np.mean(sharpe_ratios) if sharpe_ratios else 0,
            'portfolio_max_drawdown': np.mean(max_drawdowns),
            'best_performer': max(results.keys(), key=lambda k: results[k].total_return),
            'worst_performer': min(results.keys(), key=lambda k: results[k].total_return),
            'win_rate': np.mean([r.win_rate for r in results.values()]),
            'total_trades': sum([r.total_trades for r in results.values()])
        }
    
    async def get_backtest_results(self, backtest_id: str) -> Dict[str, Any]:
        """Get cached backtest results"""
        
        if backtest_id not in self.results_cache:
            raise ValueError(f"Backtest {backtest_id} not found")
        
        return self.results_cache[backtest_id]
    
    def is_healthy(self) -> bool:
        """Check if service is healthy"""
        return True

# Built-in Strategy Classes
class SMAStrategy(bt.Strategy):
    """Simple Moving Average Crossover Strategy"""
    
    params = (
        ('fast_period', 10),
        ('slow_period', 30),
    )
    
    def __init__(self):
        self.fast_sma = bt.indicators.SimpleMovingAverage(
            self.datas[0], period=self.params.fast_period
        )
        self.slow_sma = bt.indicators.SimpleMovingAverage(
            self.datas[0], period=self.params.slow_period
        )
        self.crossover = bt.indicators.CrossOver(self.fast_sma, self.slow_sma)
    
    def next(self):
        if not self.position:
            if self.crossover > 0:
                self.buy()
        else:
            if self.crossover < 0:
                self.sell()

class RSIStrategy(bt.Strategy):
    """RSI Mean Reversion Strategy"""
    
    params = (
        ('rsi_period', 14),
        ('rsi_upper', 70),
        ('rsi_lower', 30),
    )
    
    def __init__(self):
        self.rsi = bt.indicators.RelativeStrengthIndex(
            self.datas[0], period=self.params.rsi_period
        )
    
    def next(self):
        if not self.position:
            if self.rsi < self.params.rsi_lower:
                self.buy()
        else:
            if self.rsi > self.params.rsi_upper:
                self.sell()

class MomentumStrategy(bt.Strategy):
    """Momentum Strategy"""
    
    params = (
        ('period', 20),
        ('threshold', 0.02),
    )
    
    def __init__(self):
        self.momentum = bt.indicators.Momentum(
            self.datas[0], period=self.params.period
        )
    
    def next(self):
        momentum_pct = self.momentum[0] / self.datas[0].close[-self.params.period]
        
        if not self.position:
            if momentum_pct > self.params.threshold:
                self.buy()
        else:
            if momentum_pct < -self.params.threshold:
                self.sell()

class MeanReversionStrategy(bt.Strategy):
    """Mean Reversion Strategy"""
    
    params = (
        ('period', 20),
        ('std_dev', 2),
    )
    
    def __init__(self):
        self.sma = bt.indicators.SimpleMovingAverage(
            self.datas[0], period=self.params.period
        )
        self.std = bt.indicators.StandardDeviation(
            self.datas[0], period=self.params.period
        )
    
    def next(self):
        upper_band = self.sma[0] + (self.std[0] * self.params.std_dev)
        lower_band = self.sma[0] - (self.std[0] * self.params.std_dev)
        
        if not self.position:
            if self.datas[0].close[0] < lower_band:
                self.buy()
        else:
            if self.datas[0].close[0] > upper_band:
                self.sell()

class BollingerBandsStrategy(bt.Strategy):
    """Bollinger Bands Strategy"""
    
    params = (
        ('period', 20),
        ('std_dev', 2),
    )
    
    def __init__(self):
        self.bollinger = bt.indicators.BollingerBands(
            self.datas[0], period=self.params.period, devfactor=self.params.std_dev
        )
    
    def next(self):
        if not self.position:
            if self.datas[0].close[0] < self.bollinger.lines.bot[0]:
                self.buy()
        else:
            if self.datas[0].close[0] > self.bollinger.lines.top[0]:
                self.sell()
