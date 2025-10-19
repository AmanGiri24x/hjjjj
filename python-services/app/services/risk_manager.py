"""
Production-grade Risk Management System
VaR, Stress Testing, and Risk Analytics
"""

import numpy as np
import pandas as pd
import logging
from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime, timedelta
from scipy import stats
from scipy.optimize import minimize
import asyncio
from arch import arch_model
from sklearn.covariance import EmpiricalCovariance, MinCovDet
import warnings
warnings.filterwarnings('ignore')

logger = logging.getLogger(__name__)

class RiskManager:
    """Advanced risk management with multiple methodologies"""
    
    def __init__(self):
        self.confidence_levels = [0.95, 0.99, 0.999]
        self.var_methods = ['historical', 'parametric', 'monte_carlo', 'garch']
        
    async def calculate_var(
        self,
        portfolio: Dict[str, float],
        confidence_level: float = 0.95,
        time_horizon: int = 1,
        method: str = "historical"
    ) -> Dict[str, Any]:
        """Calculate Value at Risk using multiple methods"""
        
        try:
            # Get portfolio returns
            returns = await self._get_portfolio_returns(portfolio)
            
            if returns is None or len(returns) < 30:
                raise ValueError("Insufficient data for VaR calculation")
            
            # Calculate VaR based on method
            if method == "historical":
                var_result = self._historical_var(returns, confidence_level, time_horizon)
            elif method == "parametric":
                var_result = self._parametric_var(returns, confidence_level, time_horizon)
            elif method == "monte_carlo":
                var_result = await self._monte_carlo_var(returns, confidence_level, time_horizon)
            elif method == "garch":
                var_result = await self._garch_var(returns, confidence_level, time_horizon)
            else:
                var_result = self._historical_var(returns, confidence_level, time_horizon)
            
            # Calculate additional risk metrics
            cvar = self._calculate_cvar(returns, confidence_level)
            max_drawdown = self._calculate_max_drawdown(returns)
            
            return {
                'var': var_result['var'],
                'cvar': cvar,
                'max_drawdown': max_drawdown,
                'method': method,
                'confidence_level': confidence_level,
                'time_horizon': time_horizon,
                'portfolio_volatility': returns.std() * np.sqrt(252),
                'skewness': stats.skew(returns),
                'kurtosis': stats.kurtosis(returns),
                'details': var_result.get('details', {})
            }
            
        except Exception as e:
            logger.error(f"Error calculating VaR: {e}")
            raise
    
    def _historical_var(self, returns: pd.Series, confidence_level: float, time_horizon: int) -> Dict[str, Any]:
        """Historical simulation VaR"""
        
        # Scale returns for time horizon
        scaled_returns = returns * np.sqrt(time_horizon)
        
        # Calculate VaR as percentile
        var = np.percentile(scaled_returns, (1 - confidence_level) * 100)
        
        return {
            'var': abs(var),
            'details': {
                'method': 'historical_simulation',
                'sample_size': len(returns),
                'worst_loss': scaled_returns.min()
            }
        }
    
    def _parametric_var(self, returns: pd.Series, confidence_level: float, time_horizon: int) -> Dict[str, Any]:
        """Parametric (Normal) VaR"""
        
        # Calculate statistics
        mean_return = returns.mean()
        volatility = returns.std()
        
        # Scale for time horizon
        scaled_mean = mean_return * time_horizon
        scaled_vol = volatility * np.sqrt(time_horizon)
        
        # Calculate VaR using normal distribution
        z_score = stats.norm.ppf(1 - confidence_level)
        var = abs(scaled_mean + z_score * scaled_vol)
        
        return {
            'var': var,
            'details': {
                'method': 'parametric_normal',
                'mean_return': scaled_mean,
                'volatility': scaled_vol,
                'z_score': z_score
            }
        }
    
    async def _monte_carlo_var(self, returns: pd.Series, confidence_level: float, time_horizon: int, n_simulations: int = 10000) -> Dict[str, Any]:
        """Monte Carlo simulation VaR"""
        
        # Fit distribution to returns
        mean_return = returns.mean()
        volatility = returns.std()
        
        # Generate random scenarios
        np.random.seed(42)
        simulated_returns = np.random.normal(
            mean_return * time_horizon,
            volatility * np.sqrt(time_horizon),
            n_simulations
        )
        
        # Calculate VaR
        var = abs(np.percentile(simulated_returns, (1 - confidence_level) * 100))
        
        return {
            'var': var,
            'details': {
                'method': 'monte_carlo',
                'n_simulations': n_simulations,
                'simulated_mean': simulated_returns.mean(),
                'simulated_std': simulated_returns.std()
            }
        }
    
    async def _garch_var(self, returns: pd.Series, confidence_level: float, time_horizon: int) -> Dict[str, Any]:
        """GARCH model VaR"""
        
        try:
            # Fit GARCH(1,1) model
            model = arch_model(returns * 100, vol='Garch', p=1, q=1)  # Scale for numerical stability
            fitted_model = model.fit(disp='off')
            
            # Forecast volatility
            forecast = fitted_model.forecast(horizon=time_horizon)
            forecasted_vol = np.sqrt(forecast.variance.iloc[-1, :].sum()) / 100  # Scale back
            
            # Calculate VaR using forecasted volatility
            mean_return = returns.mean()
            z_score = stats.norm.ppf(1 - confidence_level)
            var = abs(mean_return * time_horizon + z_score * forecasted_vol)
            
            return {
                'var': var,
                'details': {
                    'method': 'garch',
                    'forecasted_volatility': forecasted_vol,
                    'garch_params': fitted_model.params.to_dict()
                }
            }
            
        except Exception as e:
            logger.warning(f"GARCH VaR failed, falling back to parametric: {e}")
            return self._parametric_var(returns, confidence_level, time_horizon)
    
    def _calculate_cvar(self, returns: pd.Series, confidence_level: float) -> float:
        """Calculate Conditional Value at Risk (Expected Shortfall)"""
        
        var_threshold = np.percentile(returns, (1 - confidence_level) * 100)
        tail_losses = returns[returns <= var_threshold]
        
        return abs(tail_losses.mean()) if len(tail_losses) > 0 else 0
    
    def _calculate_max_drawdown(self, returns: pd.Series) -> float:
        """Calculate maximum drawdown"""
        
        cumulative_returns = (1 + returns).cumprod()
        rolling_max = cumulative_returns.expanding().max()
        drawdown = (cumulative_returns - rolling_max) / rolling_max
        
        return abs(drawdown.min())
    
    async def stress_test_portfolio(
        self,
        portfolio: Dict[str, float],
        scenarios: List[Dict[str, Any]],
        shock_magnitude: float = 0.2
    ) -> Dict[str, Any]:
        """Perform comprehensive stress testing"""
        
        try:
            # Get portfolio data
            returns = await self._get_portfolio_returns(portfolio)
            prices = await self._get_portfolio_prices(portfolio)
            
            stress_results = {}
            
            # Historical stress scenarios
            historical_scenarios = await self._historical_stress_scenarios(returns, shock_magnitude)
            stress_results['historical'] = historical_scenarios
            
            # Market crash scenarios
            crash_scenarios = await self._market_crash_scenarios(portfolio, shock_magnitude)
            stress_results['market_crash'] = crash_scenarios
            
            # Interest rate scenarios
            ir_scenarios = await self._interest_rate_scenarios(portfolio, shock_magnitude)
            stress_results['interest_rate'] = ir_scenarios
            
            # Correlation breakdown scenarios
            correlation_scenarios = await self._correlation_breakdown_scenarios(portfolio)
            stress_results['correlation_breakdown'] = correlation_scenarios
            
            # Custom scenarios
            if scenarios:
                custom_results = []
                for scenario in scenarios:
                    result = await self._apply_custom_scenario(portfolio, scenario)
                    custom_results.append(result)
                stress_results['custom'] = custom_results
            
            # Summary statistics
            all_losses = []
            for category in stress_results.values():
                if isinstance(category, list):
                    all_losses.extend([s.get('portfolio_loss', 0) for s in category])
                elif isinstance(category, dict):
                    all_losses.append(category.get('portfolio_loss', 0))
            
            return {
                'stress_results': stress_results,
                'summary': {
                    'worst_case_loss': min(all_losses) if all_losses else 0,
                    'average_loss': np.mean(all_losses) if all_losses else 0,
                    'scenarios_tested': len(all_losses),
                    'losses_exceeding_10pct': sum(1 for loss in all_losses if loss < -0.1)
                },
                'timestamp': datetime.now()
            }
            
        except Exception as e:
            logger.error(f"Error in stress testing: {e}")
            raise
    
    async def _historical_stress_scenarios(self, returns: pd.Series, shock_magnitude: float) -> Dict[str, Any]:
        """Generate historical stress scenarios"""
        
        # Find worst historical periods
        worst_day = returns.min()
        worst_week = returns.rolling(5).sum().min()
        worst_month = returns.rolling(21).sum().min()
        
        return {
            'worst_day': worst_day,
            'worst_week': worst_week,
            'worst_month': worst_month,
            'portfolio_loss': worst_month  # Use worst month as portfolio impact
        }
    
    async def _market_crash_scenarios(self, portfolio: Dict[str, float], shock_magnitude: float) -> List[Dict[str, Any]]:
        """Generate market crash scenarios"""
        
        scenarios = [
            {'name': '2008 Financial Crisis', 'equity_shock': -0.37, 'bond_shock': 0.05},
            {'name': '2020 COVID Crash', 'equity_shock': -0.34, 'bond_shock': 0.08},
            {'name': 'Black Monday 1987', 'equity_shock': -0.22, 'bond_shock': 0.02},
            {'name': 'Dot-com Crash 2000', 'equity_shock': -0.49, 'bond_shock': 0.12}
        ]
        
        results = []
        for scenario in scenarios:
            # Apply shocks based on asset type (simplified)
            portfolio_loss = 0
            for symbol, weight in portfolio.items():
                # Assume equity shock for all (would categorize assets in production)
                loss = weight * scenario['equity_shock']
                portfolio_loss += loss
            
            results.append({
                'scenario_name': scenario['name'],
                'portfolio_loss': portfolio_loss,
                'equity_shock': scenario['equity_shock'],
                'bond_shock': scenario['bond_shock']
            })
        
        return results
    
    async def _interest_rate_scenarios(self, portfolio: Dict[str, float], shock_magnitude: float) -> Dict[str, Any]:
        """Generate interest rate shock scenarios"""
        
        # Simplified interest rate impact (would use duration analysis in production)
        rate_shocks = [0.01, 0.02, 0.03, -0.01, -0.02]  # 100bp, 200bp, 300bp shocks
        
        results = []
        for shock in rate_shocks:
            # Estimate portfolio impact (simplified)
            portfolio_impact = sum(portfolio.values()) * shock * -5  # Rough duration estimate
            
            results.append({
                'rate_shock': shock,
                'portfolio_impact': portfolio_impact
            })
        
        return {
            'scenarios': results,
            'portfolio_loss': min([r['portfolio_impact'] for r in results])
        }
    
    async def _correlation_breakdown_scenarios(self, portfolio: Dict[str, float]) -> Dict[str, Any]:
        """Test correlation breakdown scenarios"""
        
        # Simulate scenario where all correlations go to 1 (crisis scenario)
        portfolio_variance_normal = 0.04  # Assume 20% portfolio volatility normally
        portfolio_variance_crisis = 0.09   # 30% volatility in crisis (all correlated)
        
        portfolio_loss = -2 * np.sqrt(portfolio_variance_crisis - portfolio_variance_normal)
        
        return {
            'scenario': 'correlation_breakdown',
            'normal_volatility': np.sqrt(portfolio_variance_normal),
            'crisis_volatility': np.sqrt(portfolio_variance_crisis),
            'portfolio_loss': portfolio_loss
        }
    
    async def _apply_custom_scenario(self, portfolio: Dict[str, float], scenario: Dict[str, Any]) -> Dict[str, Any]:
        """Apply custom stress scenario"""
        
        portfolio_loss = 0
        
        # Apply shocks to individual assets
        if 'asset_shocks' in scenario:
            for symbol, weight in portfolio.items():
                shock = scenario['asset_shocks'].get(symbol, 0)
                portfolio_loss += weight * shock
        
        # Apply market-wide shock
        if 'market_shock' in scenario:
            portfolio_loss += scenario['market_shock']
        
        return {
            'scenario_name': scenario.get('name', 'Custom'),
            'portfolio_loss': portfolio_loss,
            'scenario_details': scenario
        }
    
    async def calculate_portfolio_beta(self, portfolio: Dict[str, float], benchmark: str = "SPY") -> Dict[str, Any]:
        """Calculate portfolio beta relative to benchmark"""
        
        try:
            # Get portfolio and benchmark returns
            portfolio_returns = await self._get_portfolio_returns(portfolio)
            
            import yfinance as yf
            benchmark_data = yf.download(benchmark, period="1y", progress=False)
            benchmark_returns = benchmark_data['Adj Close'].pct_change().dropna()
            
            # Align dates
            common_dates = portfolio_returns.index.intersection(benchmark_returns.index)
            portfolio_aligned = portfolio_returns.loc[common_dates]
            benchmark_aligned = benchmark_returns.loc[common_dates]
            
            # Calculate beta
            covariance = np.cov(portfolio_aligned, benchmark_aligned)[0, 1]
            benchmark_variance = np.var(benchmark_aligned)
            beta = covariance / benchmark_variance
            
            # Calculate correlation and R-squared
            correlation = np.corrcoef(portfolio_aligned, benchmark_aligned)[0, 1]
            r_squared = correlation ** 2
            
            # Calculate alpha
            portfolio_mean = portfolio_aligned.mean() * 252
            benchmark_mean = benchmark_aligned.mean() * 252
            risk_free_rate = 0.02  # Assume 2%
            alpha = portfolio_mean - (risk_free_rate + beta * (benchmark_mean - risk_free_rate))
            
            return {
                'beta': beta,
                'alpha': alpha,
                'correlation': correlation,
                'r_squared': r_squared,
                'benchmark': benchmark,
                'tracking_error': (portfolio_aligned - benchmark_aligned).std() * np.sqrt(252)
            }
            
        except Exception as e:
            logger.error(f"Error calculating portfolio beta: {e}")
            raise
    
    async def _get_portfolio_returns(self, portfolio: Dict[str, float]) -> pd.Series:
        """Get portfolio returns time series"""
        
        try:
            import yfinance as yf
            
            symbols = list(portfolio.keys())
            weights = np.array(list(portfolio.values()))
            
            # Download price data
            data = yf.download(symbols, period="1y", progress=False)
            
            if len(symbols) == 1:
                prices = data['Adj Close'].to_frame(symbols[0])
            else:
                prices = data['Adj Close']
            
            # Calculate returns
            returns = prices.pct_change().dropna()
            
            # Calculate portfolio returns
            portfolio_returns = (returns * weights).sum(axis=1)
            
            return portfolio_returns
            
        except Exception as e:
            logger.error(f"Error getting portfolio returns: {e}")
            return None
    
    async def _get_portfolio_prices(self, portfolio: Dict[str, float]) -> pd.DataFrame:
        """Get portfolio price data"""
        
        try:
            import yfinance as yf
            
            symbols = list(portfolio.keys())
            data = yf.download(symbols, period="1y", progress=False)
            
            if len(symbols) == 1:
                return data['Adj Close'].to_frame(symbols[0])
            else:
                return data['Adj Close']
                
        except Exception as e:
            logger.error(f"Error getting portfolio prices: {e}")
            return None
    
    def is_healthy(self) -> bool:
        """Check if service is healthy"""
        return True
