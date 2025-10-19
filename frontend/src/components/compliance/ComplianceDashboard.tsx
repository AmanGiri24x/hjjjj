'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  FileText, 
  Users, 
  CreditCard, 
  Building,
  TrendingUp,
  AlertCircle,
  Download,
  Eye,
  Lock
} from 'lucide-react';

interface ComplianceOverview {
  gdpr: {
    status: 'compliant' | 'non_compliant' | 'needs_review';
    lastAssessment: string;
    nextAssessment: string;
    issues: string[];
  };
  aml: {
    status: 'compliant' | 'non_compliant' | 'needs_review';
    lastAssessment: string;
    nextAssessment: string;
    pendingReports: number;
  };
  pciDss: {
    status: 'compliant' | 'non_compliant' | 'needs_review';
    lastAssessment: string;
    nextAssessment: string;
    requirements: number;
  };
  sox: {
    status: 'effective' | 'deficient' | 'material_weakness';
    lastAssessment: string;
    nextAssessment: string;
    controlsEffective: number;
    totalControls: number;
  };
}

interface ComplianceAlert {
  type: 'gdpr' | 'aml' | 'pci_dss' | 'sox';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  actionRequired: boolean;
}

interface ComplianceMetrics {
  consentRate: number;
  amlRiskScore: number;
  pciCompliance: number;
  soxEffectiveness: number;
}

export default function ComplianceDashboard() {
  const [overview, setOverview] = useState<ComplianceOverview | null>(null);
  const [alerts, setAlerts] = useState<ComplianceAlert[]>([]);
  const [metrics, setMetrics] = useState<ComplianceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'gdpr' | 'aml' | 'pci' | 'sox'>('overview');

  useEffect(() => {
    fetchComplianceData();
  }, []);

  const fetchComplianceData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/compliance/dashboard', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setOverview(data.summary);
        setAlerts(data.alerts);
        setMetrics(data.metrics);
      }
    } catch (error) {
      console.error('Failed to fetch compliance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant':
      case 'effective':
        return 'text-green-600 bg-green-100';
      case 'non_compliant':
      case 'deficient':
      case 'material_weakness':
        return 'text-red-600 bg-red-100';
      case 'needs_review':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600 bg-red-100 border-red-200';
      case 'high':
        return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'low':
        return 'text-blue-600 bg-blue-100 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const ComplianceCard = ({ 
    title, 
    icon: Icon, 
    status, 
    lastAssessment, 
    nextAssessment, 
    details 
  }: {
    title: string;
    icon: React.ElementType;
    status: string;
    lastAssessment: string;
    nextAssessment: string;
    details: React.ReactNode;
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg border border-gray-200 p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            {React.createElement(Icon, { className: "h-6 w-6 text-blue-600" })}
          </div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status)}`}>
          {status.replace('_', ' ').toUpperCase()}
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Last Assessment:</span>
          <span className="font-medium">{new Date(lastAssessment).toLocaleDateString()}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Next Assessment:</span>
          <span className="font-medium">{new Date(nextAssessment).toLocaleDateString()}</span>
        </div>
        {details}
      </div>
    </motion.div>
  );

  const MetricCard = ({ 
    title, 
    value, 
    icon: Icon, 
    color = 'blue' 
  }: {
    title: string;
    value: number;
    icon: React.ElementType;
    color?: string;
  }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-xl shadow-lg border border-gray-200 p-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value.toFixed(1)}%</p>
        </div>
        <div className={`p-3 bg-${color}-100 rounded-lg`}>
          {React.createElement(Icon, { className: `h-8 w-8 text-${color}-600` })}
        </div>
      </div>
      <div className="mt-4">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`bg-${color}-600 h-2 rounded-full transition-all duration-300`}
            style={{ width: `${Math.min(value, 100)}%` }}
          />
        </div>
      </div>
    </motion.div>
  );

  if (loading) {
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
          <h1 className="text-3xl font-bold text-gray-900">Compliance Dashboard</h1>
          <p className="text-gray-600 mt-2">Monitor regulatory compliance across all frameworks</p>
        </div>
        <button
          onClick={fetchComplianceData}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Refresh Data
        </button>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg border border-gray-200 p-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <AlertTriangle className="h-5 w-5 text-orange-500 mr-2" />
            Active Alerts
          </h2>
          <div className="space-y-3">
            {alerts.map((alert, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${getSeverityColor(alert.severity)}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{alert.message}</p>
                    <p className="text-sm opacity-75 mt-1">
                      {alert.type.toUpperCase()} • {alert.severity.toUpperCase()}
                    </p>
                  </div>
                  {alert.actionRequired && (
                    <button className="px-3 py-1 bg-white rounded-md text-sm font-medium hover:bg-gray-50">
                      Take Action
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="GDPR Consent Rate"
            value={metrics.consentRate}
            icon={Users}
            color="green"
          />
          <MetricCard
            title="AML Risk Score"
            value={100 - metrics.amlRiskScore}
            icon={Shield}
            color="blue"
          />
          <MetricCard
            title="PCI DSS Compliance"
            value={metrics.pciCompliance}
            icon={CreditCard}
            color="purple"
          />
          <MetricCard
            title="SOX Effectiveness"
            value={metrics.soxEffectiveness}
            icon={Building}
            color="indigo"
          />
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: TrendingUp },
            { id: 'gdpr', label: 'GDPR', icon: Users },
            { id: 'aml', label: 'AML', icon: Shield },
            { id: 'pci', label: 'PCI DSS', icon: CreditCard },
            { id: 'sox', label: 'SOX', icon: Building },
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
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'overview' && overview && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ComplianceCard
              title="GDPR Compliance"
              icon={Users}
              status={overview.gdpr.status}
              lastAssessment={overview.gdpr.lastAssessment}
              nextAssessment={overview.gdpr.nextAssessment}
              details={
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Issues:</span>
                    <span className="font-medium">{overview.gdpr.issues.length}</span>
                  </div>
                  {overview.gdpr.issues.length > 0 && (
                    <div className="text-sm text-red-600">
                      {overview.gdpr.issues[0]}
                    </div>
                  )}
                </div>
              }
            />

            <ComplianceCard
              title="AML Compliance"
              icon={Shield}
              status={overview.aml.status}
              lastAssessment={overview.aml.lastAssessment}
              nextAssessment={overview.aml.nextAssessment}
              details={
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Pending Reports:</span>
                  <span className="font-medium">{overview.aml.pendingReports}</span>
                </div>
              }
            />

            <ComplianceCard
              title="PCI DSS Compliance"
              icon={CreditCard}
              status={overview.pciDss.status}
              lastAssessment={overview.pciDss.lastAssessment}
              nextAssessment={overview.pciDss.nextAssessment}
              details={
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Requirements:</span>
                  <span className="font-medium">{overview.pciDss.requirements}</span>
                </div>
              }
            />

            <ComplianceCard
              title="SOX Compliance"
              icon={Building}
              status={overview.sox.status}
              lastAssessment={overview.sox.lastAssessment}
              nextAssessment={overview.sox.nextAssessment}
              details={
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Effective Controls:</span>
                    <span className="font-medium">
                      {overview.sox.controlsEffective}/{overview.sox.totalControls}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{
                        width: `${(overview.sox.controlsEffective / overview.sox.totalControls) * 100}%`
                      }}
                    />
                  </div>
                </div>
              }
            />
          </div>
        )}

        {activeTab === 'gdpr' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-xl shadow-lg border border-gray-200 p-6"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-6">GDPR Management</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                <Eye className="h-6 w-6 text-blue-600 mb-2" />
                <h4 className="font-medium">View Consent History</h4>
                <p className="text-sm text-gray-600">Review user consent records</p>
              </button>
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                <Download className="h-6 w-6 text-green-600 mb-2" />
                <h4 className="font-medium">Export User Data</h4>
                <p className="text-sm text-gray-600">Generate data export reports</p>
              </button>
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                <FileText className="h-6 w-6 text-purple-600 mb-2" />
                <h4 className="font-medium">Privacy Policy</h4>
                <p className="text-sm text-gray-600">Update privacy documentation</p>
              </button>
            </div>
          </motion.div>
        )}

        {activeTab === 'aml' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-xl shadow-lg border border-gray-200 p-6"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-6">AML Monitoring</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                <AlertCircle className="h-6 w-6 text-red-600 mb-2" />
                <h4 className="font-medium">Suspicious Activities</h4>
                <p className="text-sm text-gray-600">Review flagged transactions</p>
              </button>
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                <Users className="h-6 w-6 text-orange-600 mb-2" />
                <h4 className="font-medium">Risk Assessments</h4>
                <p className="text-sm text-gray-600">Perform user risk checks</p>
              </button>
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                <FileText className="h-6 w-6 text-blue-600 mb-2" />
                <h4 className="font-medium">Compliance Reports</h4>
                <p className="text-sm text-gray-600">Generate AML reports</p>
              </button>
            </div>
          </motion.div>
        )}

        {activeTab === 'pci' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-xl shadow-lg border border-gray-200 p-6"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-6">PCI DSS Controls</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                <Lock className="h-6 w-6 text-green-600 mb-2" />
                <h4 className="font-medium">Data Protection</h4>
                <p className="text-sm text-gray-600">Monitor card data security</p>
              </button>
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                <Shield className="h-6 w-6 text-blue-600 mb-2" />
                <h4 className="font-medium">Security Testing</h4>
                <p className="text-sm text-gray-600">Run vulnerability scans</p>
              </button>
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                <FileText className="h-6 w-6 text-purple-600 mb-2" />
                <h4 className="font-medium">Compliance Report</h4>
                <p className="text-sm text-gray-600">Generate PCI DSS report</p>
              </button>
            </div>
          </motion.div>
        )}

        {activeTab === 'sox' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-xl shadow-lg border border-gray-200 p-6"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-6">SOX Controls</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                <CheckCircle className="h-6 w-6 text-green-600 mb-2" />
                <h4 className="font-medium">Control Testing</h4>
                <p className="text-sm text-gray-600">Test internal controls</p>
              </button>
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                <FileText className="h-6 w-6 text-blue-600 mb-2" />
                <h4 className="font-medium">Financial Reports</h4>
                <p className="text-sm text-gray-600">Generate financial statements</p>
              </button>
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                <Clock className="h-6 w-6 text-orange-600 mb-2" />
                <h4 className="font-medium">Audit Schedule</h4>
                <p className="text-sm text-gray-600">View upcoming audits</p>
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
