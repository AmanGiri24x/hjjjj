'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Cpu,
  Database,
  HardDrive,
  MemoryStick,
  Network,
  Server,
  TrendingUp,
  TrendingDown,
  Users,
  Zap,
  AlertCircle,
  Eye,
  Download,
  Settings,
  RefreshCw
} from 'lucide-react';

interface SystemMetrics {
  timestamp: string;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  activeConnections: number;
  responseTime: number;
  errorRate: number;
  throughput: number;
}

interface ApplicationMetrics {
  timestamp: string;
  activeUsers: number;
  totalTransactions: number;
  failedTransactions: number;
  averageTransactionValue: number;
  complianceAlerts: number;
  securityEvents: number;
  apiCalls: number;
  databaseQueries: number;
}

interface Alert {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  createdAt: string;
  status: 'active' | 'acknowledged' | 'resolved';
}

interface PerformanceMetrics {
  responseTime: {
    avg: number;
    p50: number;
    p95: number;
    p99: number;
  };
  throughput: {
    requestsPerSecond: number;
    requestsPerMinute: number;
  };
  errorRate: {
    percentage: number;
    count: number;
  };
  availability: {
    percentage: number;
    uptime: number;
  };
}

export default function MonitoringDashboard() {
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
  const [applicationMetrics, setApplicationMetrics] = useState<ApplicationMetrics | null>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'alerts' | 'logs'>('overview');
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchMonitoringData();
    
    if (autoRefresh) {
      const interval = setInterval(fetchMonitoringData, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const fetchMonitoringData = async () => {
    try {
      setLoading(true);
      const [systemRes, appRes, perfRes, alertsRes] = await Promise.all([
        fetch('/api/monitoring/metrics/system', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/monitoring/metrics/application', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/monitoring/metrics/performance', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/monitoring/alerts', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      if (systemRes.ok) setSystemMetrics(await systemRes.json());
      if (appRes.ok) setApplicationMetrics(await appRes.json());
      if (perfRes.ok) setPerformanceMetrics(await perfRes.json());
      if (alertsRes.ok) setAlerts(await alertsRes.json());
    } catch (error) {
      console.error('Failed to fetch monitoring data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (value: number, thresholds: { warning: number; critical: number }) => {
    if (value >= thresholds.critical) return 'text-red-600 bg-red-100';
    if (value >= thresholds.warning) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-100 border-blue-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const MetricCard = ({ 
    title, 
    value, 
    unit = '', 
    icon: Icon, 
    trend, 
    thresholds,
    color = 'blue' 
  }: {
    title: string;
    value: number;
    unit?: string;
    icon: React.ElementType;
    trend?: number;
    thresholds?: { warning: number; critical: number };
    color?: string;
  }) => {
    const statusColor = thresholds ? getStatusColor(value, thresholds) : `text-${color}-600 bg-${color}-100`;
    
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-lg border border-gray-200 p-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {typeof value === 'number' ? value.toFixed(1) : value}{unit}
            </p>
            {trend !== undefined && (
              <div className={`flex items-center mt-2 text-sm ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {trend >= 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                {Math.abs(trend).toFixed(1)}%
              </div>
            )}
          </div>
          <div className={`p-3 rounded-lg ${statusColor}`}>
            {React.createElement(Icon, { className: "h-8 w-8" })}
          </div>
        </div>
      </motion.div>
    );
  };

  const AlertCard = ({ alert }: { alert: Alert }) => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`p-4 rounded-lg border ${getSeverityColor(alert.severity)} mb-3`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <AlertTriangle className="h-5 w-5" />
          <div>
            <h4 className="font-medium">{alert.type.replace(/_/g, ' ')}</h4>
            <p className="text-sm opacity-75">{alert.message}</p>
            <p className="text-xs opacity-60 mt-1">
              {new Date(alert.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            alert.status === 'active' ? 'bg-red-100 text-red-800' :
            alert.status === 'acknowledged' ? 'bg-yellow-100 text-yellow-800' :
            'bg-green-100 text-green-800'
          }`}>
            {alert.status}
          </span>
          {alert.status === 'active' && (
            <button className="px-3 py-1 bg-white rounded text-sm font-medium hover:bg-gray-50">
              Acknowledge
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );

  if (loading && !systemMetrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Monitoring</h1>
          <p className="text-gray-600 mt-2">Real-time system and application monitoring</p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              autoRefresh 
                ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
            Auto Refresh
          </button>
          <button
            onClick={fetchMonitoringData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh Now
          </button>
        </div>
      </div>

      {/* Critical Alerts Banner */}
      {alerts.filter(a => a.severity === 'critical' && a.status === 'active').length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-lg p-4"
        >
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <span className="font-medium text-red-800">
              {alerts.filter(a => a.severity === 'critical' && a.status === 'active').length} critical alerts require immediate attention
            </span>
          </div>
        </motion.div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: Activity },
            { id: 'performance', label: 'Performance', icon: TrendingUp },
            { id: 'alerts', label: 'Alerts', icon: AlertTriangle },
            { id: 'logs', label: 'Logs', icon: Eye },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
              {tab.id === 'alerts' && alerts.filter(a => a.status === 'active').length > 0 && (
                <span className="bg-red-100 text-red-800 text-xs rounded-full px-2 py-1">
                  {alerts.filter(a => a.status === 'active').length}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* System Metrics */}
          {systemMetrics && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">System Metrics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                  title="CPU Usage"
                  value={systemMetrics.cpuUsage}
                  unit="%"
                  icon={Cpu}
                  thresholds={{ warning: 70, critical: 85 }}
                />
                <MetricCard
                  title="Memory Usage"
                  value={systemMetrics.memoryUsage}
                  unit="%"
                  icon={MemoryStick}
                  thresholds={{ warning: 75, critical: 90 }}
                />
                <MetricCard
                  title="Disk Usage"
                  value={systemMetrics.diskUsage}
                  unit="%"
                  icon={HardDrive}
                  thresholds={{ warning: 80, critical: 95 }}
                />
                <MetricCard
                  title="Response Time"
                  value={systemMetrics.responseTime}
                  unit="ms"
                  icon={Zap}
                  thresholds={{ warning: 1000, critical: 2000 }}
                />
              </div>
            </div>
          )}

          {/* Application Metrics */}
          {applicationMetrics && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Application Metrics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                  title="Active Users"
                  value={applicationMetrics.activeUsers}
                  icon={Users}
                  color="green"
                />
                <MetricCard
                  title="Transactions/Hour"
                  value={applicationMetrics.totalTransactions}
                  icon={Activity}
                  color="blue"
                />
                <MetricCard
                  title="Error Rate"
                  value={applicationMetrics.failedTransactions / Math.max(applicationMetrics.totalTransactions, 1) * 100}
                  unit="%"
                  icon={AlertTriangle}
                  thresholds={{ warning: 5, critical: 10 }}
                />
                <MetricCard
                  title="Security Events"
                  value={applicationMetrics.securityEvents}
                  icon={AlertCircle}
                  thresholds={{ warning: 5, critical: 10 }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'performance' && performanceMetrics && (
        <div className="space-y-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Performance Metrics</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Avg Response Time"
              value={performanceMetrics.responseTime.avg}
              unit="ms"
              icon={Clock}
              color="blue"
            />
            <MetricCard
              title="95th Percentile"
              value={performanceMetrics.responseTime.p95}
              unit="ms"
              icon={TrendingUp}
              color="orange"
            />
            <MetricCard
              title="Throughput"
              value={performanceMetrics.throughput.requestsPerSecond}
              unit=" req/s"
              icon={Network}
              color="green"
            />
            <MetricCard
              title="Availability"
              value={performanceMetrics.availability.percentage}
              unit="%"
              icon={CheckCircle}
              color="green"
            />
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Response Time Distribution</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">50th percentile:</span>
                    <span className="font-medium">{performanceMetrics.responseTime.p50}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">95th percentile:</span>
                    <span className="font-medium">{performanceMetrics.responseTime.p95}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">99th percentile:</span>
                    <span className="font-medium">{performanceMetrics.responseTime.p99}ms</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Error Statistics</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Error rate:</span>
                    <span className="font-medium">{performanceMetrics.errorRate.percentage.toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total errors:</span>
                    <span className="font-medium">{performanceMetrics.errorRate.count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Uptime:</span>
                    <span className="font-medium">{Math.floor(performanceMetrics.availability.uptime / 3600)}h {Math.floor((performanceMetrics.availability.uptime % 3600) / 60)}m</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'alerts' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Active Alerts</h2>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                {alerts.filter(a => a.status === 'active').length} active alerts
              </span>
            </div>
          </div>

          {alerts.length === 0 ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-green-800 mb-2">All Systems Operational</h3>
              <p className="text-green-600">No active alerts at this time.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {alerts
                .sort((a, b) => {
                  const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
                  return severityOrder[b.severity] - severityOrder[a.severity];
                })
                .map(alert => (
                  <AlertCard key={alert.id} alert={alert} />
                ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">System Logs</h2>
            <div className="flex items-center space-x-2">
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                <Download className="h-4 w-4 mr-2" />
                Export Logs
              </button>
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                <Settings className="h-4 w-4 mr-2" />
                Configure
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="font-mono text-sm space-y-2 max-h-96 overflow-y-auto">
              <div className="text-gray-600">[2024-09-15 23:58:07] INFO: System monitoring started</div>
              <div className="text-blue-600">[2024-09-15 23:58:08] DEBUG: Collecting system metrics</div>
              <div className="text-green-600">[2024-09-15 23:58:09] INFO: All health checks passed</div>
              <div className="text-yellow-600">[2024-09-15 23:58:10] WARN: High memory usage detected: 78%</div>
              <div className="text-gray-600">[2024-09-15 23:58:11] INFO: Compliance check completed</div>
              <div className="text-blue-600">[2024-09-15 23:58:12] DEBUG: Database connection pool: 8/20 active</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
