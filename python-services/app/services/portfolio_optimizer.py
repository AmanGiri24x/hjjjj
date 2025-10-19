"""
Production-grade Portfolio Optimization Service
Modern Portfolio Theory, Risk Parity, and Advanced Optimization
"""

import numpy as np
import pandas as pd
import logging
from typing import Dict, List, Optional, Tuple, Any
from datetime import datetime, timedelta
import asyncio
from scipy.optimize import minimize
import cvxpy as cp
from pypfopt import EfficientFrontier, risk_models, expected_returns
from pypfopt.discrete_allocation import DiscreteAllocation, get_latest_prices
from riskfolio import Portfolio as RiskfolioPortfolio
import riskparityportfolio as rpp
from sklearn.covariance import LedoitWolf
import warnings
warnings.filterwarnings('ignore')

logger = logging.getLogger(__name__)

class PortfolioOptimizer:
    """Advanced portfolio optimization with multiple methodologies"""
    
    def __init__(self):
        self.risk_free_rate = 0.02  # 2% default risk-free rate
        
    async def optimize_portfolio(
        self,
        symbols: List[str],
        weights: Optional[List[float]] = None,
        objective: str = "max_sharpe",
        constraints: Optional[Dict] = None,
        risk_tolerance: float = 0.5,
        method: str = "mean_variance"
    ) -> Dict[str, Any]:
        """
        Optimize portfolio allocation using various methods
        
        Args:
            symbols: List of asset symbols
            weights: Current portfolio weights (optional)
            objective: Optimization objective (max_sharpe, min_volatility, max_return, risk_parity)
            constraints: Additional constraints
            risk_tolerance: Risk tolerance level (0-1)
            method: Optimization method (mean_variance, black_litterman, risk_parity, hierarchical)
        """
        try:
            logger.info(f"Optimizing portfolio for {len(symbols)} assets using {method} method")
            
            # Get historical data
            price_data = await self._get_price_data(symbols)
            
            if method == "mean_variance":
                result = await self._mean_variance_optimization(
                    price_data, objective, constraints, risk_tolerance
                )
            elif method == "black_litterman":
                result = await self._black_litterman_optimization(
                    price_data, objective, constraints
                )
            elif method == "risk_parity":
                result = await self._risk_parity_optimization(price_data)
            elif method == "hierarchical":
                result = await self._hierarchical_risk_parity(price_data)
            else:
                raise ValueError(f"Unknown optimization method: {method}")
            
            # Add portfolio metrics
            result.update(await self._calculate_portfolio_metrics(
                result['weights'], price_data
            ))
            
            return result
            
        except Exception as e:
            logger.error(f"Error optimizing portfolio: {e}")
            raise
    
    async def _mean_variance_optimization(
        self,
        price_data: pd.DataFrame,
        objective: str,
        constraints: Optional[Dict],
        risk_tolerance: float
    ) -> Dict[str, Any]:
        """Mean-variance optimization using PyPortfolioOpt"""
        
        # Calculate expected returns and covariance matrix
        mu = expected_returns.mean_historical_return(price_data)
        S = risk_models.sample_cov(price_data)
        
        # Apply Ledoit-Wolf shrinkage to covariance matrix
        lw = LedoitWolf()
        S_shrunk = pd.DataFrame(
            lw.fit(price_data.pct_change().dropna()).covariance_,
            index=S.index,
            columns=S.columns
        )
        
        # Create efficient frontier
        ef = EfficientFrontier(mu, S_shrunk)
        
        # Apply constraints
        if constraints:
            if 'max_weight' in constraints:
                ef.add_constraint(lambda w: w <= constraints['max_weight'])
            if 'min_weight' in constraints:
                ef.add_constraint(lambda w: w >= constraints['min_weight'])
            if 'sector_constraints' in constraints:
                # Implement sector constraints
                pass
        
        # Optimize based on objective
        if objective == "max_sharpe":
            weights = ef.max_sharpe(risk_free_rate=self.risk_free_rate)
        elif objective == "min_volatility":
            weights = ef.min_volatility()
        elif objective == "max_return":
            target_return = mu.mean() * (1 + risk_tolerance)
            weights = ef.efficient_return(target_return)
        elif objective == "efficient_risk":
            target_volatility = S_shrunk.values.diagonal().mean() * risk_tolerance
            weights = ef.efficient_risk(target_volatility)
        else:
            weights = ef.max_sharpe(risk_free_rate=self.risk_free_rate)
        
        # Clean weights (remove tiny allocations)
        cleaned_weights = ef.clean_weights()
        
        return {
            'weights': cleaned_weights,
            'method': 'mean_variance',
            'objective': objective,
            'expected_return': mu,
            'covariance_matrix': S_shrunk
        }
    
    async def _black_litterman_optimization(
        self,
        price_data: pd.DataFrame,
        objective: str,
        constraints: Optional[Dict]
    ) -> Dict[str, Any]:
        """Black-Litterman model optimization"""
        
        # Calculate market cap weights (simplified - equal weights for demo)
        n_assets = len(price_data.columns)
        market_weights = np.array([1/n_assets] * n_assets)
        
        # Calculate historical returns and covariance
        returns = price_data.pct_change().dropna()
        S = returns.cov().values
        
        # Risk aversion parameter
        delta = 2.5
        
        # Implied equilibrium returns
        pi = delta * np.dot(S, market_weights)
        
        # Investor views (simplified - no views for demo)
        P = np.array([])  # Picking matrix
        Q = np.array([])  # View returns
        Omega = np.array([])  # Uncertainty matrix
        
        # Black-Litterman formula (without views, reduces to equilibrium)
        tau = 0.025
        M1 = np.linalg.inv(tau * S)
        
        if len(P) > 0:
            M2 = np.dot(P.T, np.dot(np.linalg.inv(Omega), P))
            M3 = np.dot(np.linalg.inv(tau * S), pi)
            M4 = np.dot(P.T, np.dot(np.linalg.inv(Omega), Q))
            
            mu_bl = np.dot(np.linalg.inv(M1 + M2), M3 + M4)
            S_bl = np.linalg.inv(M1 + M2)
        else:
            mu_bl = pi
            S_bl = tau * S
        
        # Optimize using Black-Litterman inputs
        mu_bl_series = pd.Series(mu_bl, index=price_data.columns)
        S_bl_df = pd.DataFrame(S_bl, index=price_data.columns, columns=price_data.columns)
        
        ef = EfficientFrontier(mu_bl_series, S_bl_df)
        
        if objective == "max_sharpe":
            weights = ef.max_sharpe(risk_free_rate=self.risk_free_rate)
        else:
            weights = ef.min_volatility()
        
        cleaned_weights = ef.clean_weights()
        
        return {
            'weights': cleaned_weights,
            'method': 'black_litterman',
            'objective': objective,
            'expected_return': mu_bl_series,
            'covariance_matrix': S_bl_df,
            'implied_returns': pd.Series(pi, index=price_data.columns)
        }
    
    async def _risk_parity_optimization(self, price_data: pd.DataFrame) -> Dict[str, Any]:
        """Risk parity portfolio optimization"""
        
        # Calculate covariance matrix
        returns = price_data.pct_change().dropna()
        S = returns.cov().values
        
        # Risk parity optimization
        weights = rpp.design(S)
        
        weights_dict = dict(zip(price_data.columns, weights))
        
        return {
            'weights': weights_dict,
            'method': 'risk_parity',
            'objective': 'equal_risk_contribution',
            'covariance_matrix': pd.DataFrame(S, index=price_data.columns, columns=price_data.columns)
        }
    
    async def _hierarchical_risk_parity(self, price_data: pd.DataFrame) -> Dict[str, Any]:
        """Hierarchical Risk Parity (HRP) optimization"""
        
        returns = price_data.pct_change().dropna()
        
        # Calculate correlation matrix
        corr_matrix = returns.corr()
        
        # Calculate distance matrix
        distance_matrix = np.sqrt((1 - corr_matrix) / 2)
        
        # Hierarchical clustering
        from scipy.cluster.hierarchy import linkage, dendrogram
        from scipy.spatial.distance import squareform
        
        condensed_distances = squareform(distance_matrix)
        linkage_matrix = linkage(condensed_distances, method='ward')
        
        # Get cluster order
        def get_cluster_order(linkage_matrix, n_assets):
            cluster_order = []
            
            def traverse(node_id):
                if node_id < n_assets:
                    cluster_order.append(node_id)
                else:
                    left_child = int(linkage_matrix[node_id - n_assets, 0])
                    right_child = int(linkage_matrix[node_id - n_assets, 1])
                    traverse(left_child)
                    traverse(right_child)
            
            traverse(2 * n_assets - 2)
            return cluster_order
        
        n_assets = len(price_data.columns)
        cluster_order = get_cluster_order(linkage_matrix, n_assets)
        
        # Calculate HRP weights
        def calculate_hrp_weights(returns, cluster_order):
            cov_matrix = returns.cov()
            weights = pd.Series(1.0, index=returns.columns)
            
            def get_cluster_var(cov_matrix, cluster_items):
                cluster_cov = cov_matrix.loc[cluster_items, cluster_items]
                inv_diag = 1 / np.diag(cluster_cov)
                weights = inv_diag / inv_diag.sum()
                cluster_var = np.dot(weights, np.dot(cluster_cov, weights))
                return cluster_var
            
            def recursive_bisection(items):
                if len(items) == 1:
                    return
                
                # Split cluster into two parts
                mid = len(items) // 2
                left_cluster = items[:mid]
                right_cluster = items[mid:]
                
                # Calculate cluster variances
                left_var = get_cluster_var(cov_matrix, left_cluster)
                right_var = get_cluster_var(cov_matrix, right_cluster)
                
                # Allocate weights inversely proportional to variance
                total_var = left_var + right_var
                left_weight = right_var / total_var
                right_weight = left_var / total_var
                
                # Update weights
                weights[left_cluster] *= left_weight
                weights[right_cluster] *= right_weight
                
                # Recursive bisection
                recursive_bisection(left_cluster)
                recursive_bisection(right_cluster)
            
            ordered_assets = [returns.columns[i] for i in cluster_order]
            recursive_bisection(ordered_assets)
            
            return weights
        
        hrp_weights = calculate_hrp_weights(returns, cluster_order)
        
        return {
            'weights': hrp_weights.to_dict(),
            'method': 'hierarchical_risk_parity',
            'objective': 'hierarchical_diversification',
            'cluster_order': [price_data.columns[i] for i in cluster_order],
            'correlation_matrix': corr_matrix
        }
    
    async def calculate_efficient_frontier(
        self,
        symbols: List[str],
        num_portfolios: int = 100,
        risk_free_rate: Optional[float] = None
    ) -> Dict[str, Any]:
        """Calculate efficient frontier"""
        
        if risk_free_rate is None:
            risk_free_rate = self.risk_free_rate
        
        try:
            # Get price data
            price_data = await self._get_price_data(symbols)
            
            # Calculate expected returns and covariance matrix
            mu = expected_returns.mean_historical_return(price_data)
            S = risk_models.sample_cov(price_data)
            
            # Generate efficient frontier
            ef = EfficientFrontier(mu, S)
            
            # Calculate range of target returns
            min_ret = mu.min()
            max_ret = mu.max()
            target_returns = np.linspace(min_ret, max_ret, num_portfolios)
            
            frontier_volatility = []
            frontier_returns = []
            frontier_sharpe = []
            frontier_weights = []
            
            for target_return in target_returns:
                try:
                    ef_copy = EfficientFrontier(mu, S)
                    weights = ef_copy.efficient_return(target_return)
                    ret, vol, sharpe = ef_copy.portfolio_performance(
                        risk_free_rate=risk_free_rate, verbose=False
                    )
                    
                    frontier_returns.append(ret)
                    frontier_volatility.append(vol)
                    frontier_sharpe.append(sharpe)
                    frontier_weights.append(weights)
                    
                except Exception:
                    continue
            
            # Find optimal portfolios
            max_sharpe_idx = np.argmax(frontier_sharpe)
            min_vol_idx = np.argmin(frontier_volatility)
            
            return {
                'frontier_returns': frontier_returns,
                'frontier_volatility': frontier_volatility,
                'frontier_sharpe': frontier_sharpe,
                'frontier_weights': frontier_weights,
                'max_sharpe_portfolio': {
                    'weights': frontier_weights[max_sharpe_idx],
                    'return': frontier_returns[max_sharpe_idx],
                    'volatility': frontier_volatility[max_sharpe_idx],
                    'sharpe': frontier_sharpe[max_sharpe_idx]
                },
                'min_volatility_portfolio': {
                    'weights': frontier_weights[min_vol_idx],
                    'return': frontier_returns[min_vol_idx],
                    'volatility': frontier_volatility[min_vol_idx],
                    'sharpe': frontier_sharpe[min_vol_idx]
                },
                'symbols': symbols
            }
            
        except Exception as e:
            logger.error(f"Error calculating efficient frontier: {e}")
            raise
    
    async def factor_analysis(
        self,
        portfolio: Dict[str, float],
        factors: List[str],
        period: str = "1y"
    ) -> Dict[str, Any]:
        """Perform factor analysis on portfolio"""
        
        try:
            # Get portfolio and factor data
            symbols = list(portfolio.keys())
            weights = np.array(list(portfolio.values()))
            
            # Get price data
            price_data = await self._get_price_data(symbols, period)
            factor_data = await self._get_factor_data(factors, period)
            
            # Calculate portfolio returns
            returns = price_data.pct_change().dropna()
            portfolio_returns = (returns * weights).sum(axis=1)
            
            # Align dates
            common_dates = portfolio_returns.index.intersection(factor_data.index)
            portfolio_returns = portfolio_returns.loc[common_dates]
            factor_data = factor_data.loc[common_dates]
            
            # Run factor regression
            from sklearn.linear_model import LinearRegression
            
            X = factor_data.values
            y = portfolio_returns.values
            
            model = LinearRegression()
            model.fit(X, y)
            
            # Calculate factor exposures and statistics
            factor_exposures = dict(zip(factors, model.coef_))
            alpha = model.intercept_
            r_squared = model.score(X, y)
            
            # Calculate factor contributions
            factor_returns = factor_data.mean() * 252  # Annualized
            factor_contributions = {}
            
            for i, factor in enumerate(factors):
                contribution = model.coef_[i] * factor_returns.iloc[i]
                factor_contributions[factor] = contribution
            
            return {
                'factor_exposures': factor_exposures,
                'alpha': alpha * 252,  # Annualized alpha
                'r_squared': r_squared,
                'factor_contributions': factor_contributions,
                'total_factor_return': sum(factor_contributions.values()),
                'unexplained_return': alpha * 252
            }
            
        except Exception as e:
            logger.error(f"Error performing factor analysis: {e}")
            raise
    
    async def _get_price_data(self, symbols: List[str], period: str = "1y") -> pd.DataFrame:
        """Get historical price data for symbols"""
        try:
            import yfinance as yf
            
            # Download data
            data = yf.download(symbols, period=period, progress=False)
            
            if len(symbols) == 1:
                return data['Adj Close'].to_frame(symbols[0])
            else:
                return data['Adj Close']
                
        except Exception as e:
            logger.error(f"Error getting price data: {e}")
            raise
    
    async def _get_factor_data(self, factors: List[str], period: str = "1y") -> pd.DataFrame:
        """Get factor data (simplified - using market indices as proxies)"""
        try:
            # Map factors to symbols (simplified)
            factor_symbols = {
                'market': 'SPY',
                'size': 'IWM',  # Small cap
                'value': 'IWD',  # Value
                'momentum': 'MTUM',  # Momentum
                'quality': 'QUAL',  # Quality
                'low_volatility': 'USMV'  # Low volatility
            }
            
            symbols = [factor_symbols.get(factor, 'SPY') for factor in factors]
            price_data = await self._get_price_data(symbols, period)
            
            # Calculate returns
            factor_returns = price_data.pct_change().dropna()
            factor_returns.columns = factors
            
            return factor_returns
            
        except Exception as e:
            logger.error(f"Error getting factor data: {e}")
            raise
    
    async def _calculate_portfolio_metrics(
        self,
        weights: Dict[str, float],
        price_data: pd.DataFrame
    ) -> Dict[str, Any]:
        """Calculate portfolio performance metrics"""
        
        try:
            # Convert weights to array
            symbols = list(weights.keys())
            weight_array = np.array([weights[symbol] for symbol in symbols])
            
            # Calculate returns
            returns = price_data[symbols].pct_change().dropna()
            portfolio_returns = (returns * weight_array).sum(axis=1)
            
            # Calculate metrics
            annual_return = portfolio_returns.mean() * 252
            annual_volatility = portfolio_returns.std() * np.sqrt(252)
            sharpe_ratio = (annual_return - self.risk_free_rate) / annual_volatility
            
            # Downside metrics
            negative_returns = portfolio_returns[portfolio_returns < 0]
            downside_deviation = negative_returns.std() * np.sqrt(252)
            sortino_ratio = (annual_return - self.risk_free_rate) / downside_deviation if len(negative_returns) > 0 else 0
            
            # Maximum drawdown
            cumulative_returns = (1 + portfolio_returns).cumprod()
            rolling_max = cumulative_returns.expanding().max()
            drawdown = (cumulative_returns - rolling_max) / rolling_max
            max_drawdown = drawdown.min()
            
            # VaR and CVaR
            var_95 = np.percentile(portfolio_returns, 5)
            cvar_95 = portfolio_returns[portfolio_returns <= var_95].mean()
            
            return {
                'annual_return': annual_return,
                'annual_volatility': annual_volatility,
                'sharpe_ratio': sharpe_ratio,
                'sortino_ratio': sortino_ratio,
                'max_drawdown': max_drawdown,
                'var_95': var_95,
                'cvar_95': cvar_95,
                'downside_deviation': downside_deviation
            }
            
        except Exception as e:
            logger.error(f"Error calculating portfolio metrics: {e}")
            return {}
    
    def is_healthy(self) -> bool:
        """Check if service is healthy"""
        return True
