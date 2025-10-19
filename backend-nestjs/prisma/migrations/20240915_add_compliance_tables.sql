-- Add compliance-related tables for GDPR, AML, PCI DSS, and SOX

-- GDPR Data Processing Consent
CREATE TABLE "data_processing_consents" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "consent_given" BOOLEAN NOT NULL,
    "consent_date" TIMESTAMP(3) NOT NULL,
    "ip_address" TEXT NOT NULL,
    "user_agent" TEXT NOT NULL,
    "withdrawn_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "data_processing_consents_pkey" PRIMARY KEY ("id")
);

-- GDPR Data Export/Deletion Requests
CREATE TABLE "data_export_requests" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "request_type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "requested_at" TIMESTAMP(3) NOT NULL,
    "completed_at" TIMESTAMP(3),
    "download_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "data_export_requests_pkey" PRIMARY KEY ("id")
);

-- AML Checks
CREATE TABLE "aml_checks" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "check_type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "risk_score" DOUBLE PRECISION NOT NULL,
    "flags" TEXT[],
    "checked_at" TIMESTAMP(3) NOT NULL,
    "reviewed_by" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "aml_checks_pkey" PRIMARY KEY ("id")
);

-- Suspicious Activity Reports
CREATE TABLE "suspicious_activity_reports" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "transaction_id" TEXT,
    "activity_type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "risk_level" TEXT NOT NULL,
    "reported_at" TIMESTAMP(3) NOT NULL,
    "reported_by" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "reviewed_by" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "suspicious_activity_reports_pkey" PRIMARY KEY ("id")
);

-- PCI DSS Card Data Access Logs
CREATE TABLE "card_data_access" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "access_type" TEXT NOT NULL,
    "card_last4" TEXT NOT NULL,
    "accessed_at" TIMESTAMP(3) NOT NULL,
    "ip_address" TEXT NOT NULL,
    "user_agent" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "card_data_access_pkey" PRIMARY KEY ("id")
);

-- Compliance Checks (Generic for all frameworks)
CREATE TABLE "compliance_checks" (
    "id" TEXT NOT NULL,
    "framework" TEXT NOT NULL,
    "check_type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "findings" TEXT[],
    "checked_at" TIMESTAMP(3) NOT NULL,
    "next_check_due" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "compliance_checks_pkey" PRIMARY KEY ("id")
);

-- SOX Controls
CREATE TABLE "sox_controls" (
    "id" TEXT NOT NULL,
    "control_id" TEXT NOT NULL,
    "control_name" TEXT,
    "description" TEXT,
    "frequency" TEXT,
    "owner" TEXT,
    "status" TEXT NOT NULL,
    "last_tested" TIMESTAMP(3),
    "next_test_due" TIMESTAMP(3),
    "findings" TEXT[],
    "evidence" TEXT[],
    "tested_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sox_controls_pkey" PRIMARY KEY ("id")
);

-- Financial Reports (SOX)
CREATE TABLE "financial_reports" (
    "id" TEXT NOT NULL,
    "report_type" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "prepared_by" TEXT NOT NULL,
    "reviewed_by" TEXT,
    "approved_by" TEXT,
    "status" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "approved_at" TIMESTAMP(3),
    "approval_comments" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "financial_reports_pkey" PRIMARY KEY ("id")
);

-- Create indexes for performance
CREATE INDEX "data_processing_consents_user_id_idx" ON "data_processing_consents"("user_id");
CREATE INDEX "data_processing_consents_purpose_idx" ON "data_processing_consents"("purpose");
CREATE INDEX "data_processing_consents_consent_given_idx" ON "data_processing_consents"("consent_given");

CREATE INDEX "data_export_requests_user_id_idx" ON "data_export_requests"("user_id");
CREATE INDEX "data_export_requests_status_idx" ON "data_export_requests"("status");
CREATE INDEX "data_export_requests_request_type_idx" ON "data_export_requests"("request_type");

CREATE INDEX "aml_checks_user_id_idx" ON "aml_checks"("user_id");
CREATE INDEX "aml_checks_status_idx" ON "aml_checks"("status");
CREATE INDEX "aml_checks_risk_score_idx" ON "aml_checks"("risk_score");
CREATE INDEX "aml_checks_checked_at_idx" ON "aml_checks"("checked_at");

CREATE INDEX "suspicious_activity_reports_user_id_idx" ON "suspicious_activity_reports"("user_id");
CREATE INDEX "suspicious_activity_reports_status_idx" ON "suspicious_activity_reports"("status");
CREATE INDEX "suspicious_activity_reports_risk_level_idx" ON "suspicious_activity_reports"("risk_level");
CREATE INDEX "suspicious_activity_reports_reported_at_idx" ON "suspicious_activity_reports"("reported_at");

CREATE INDEX "card_data_access_user_id_idx" ON "card_data_access"("user_id");
CREATE INDEX "card_data_access_accessed_at_idx" ON "card_data_access"("accessed_at");
CREATE INDEX "card_data_access_access_type_idx" ON "card_data_access"("access_type");

CREATE INDEX "compliance_checks_framework_idx" ON "compliance_checks"("framework");
CREATE INDEX "compliance_checks_status_idx" ON "compliance_checks"("status");
CREATE INDEX "compliance_checks_next_check_due_idx" ON "compliance_checks"("next_check_due");

CREATE INDEX "sox_controls_control_id_idx" ON "sox_controls"("control_id");
CREATE INDEX "sox_controls_status_idx" ON "sox_controls"("status");
CREATE INDEX "sox_controls_next_test_due_idx" ON "sox_controls"("next_test_due");

CREATE INDEX "financial_reports_report_type_idx" ON "financial_reports"("report_type");
CREATE INDEX "financial_reports_status_idx" ON "financial_reports"("status");
CREATE INDEX "financial_reports_period_idx" ON "financial_reports"("period");

-- Add foreign key constraints
ALTER TABLE "data_processing_consents" ADD CONSTRAINT "data_processing_consents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "data_export_requests" ADD CONSTRAINT "data_export_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "aml_checks" ADD CONSTRAINT "aml_checks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "suspicious_activity_reports" ADD CONSTRAINT "suspicious_activity_reports_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "suspicious_activity_reports" ADD CONSTRAINT "suspicious_activity_reports_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "card_data_access" ADD CONSTRAINT "card_data_access_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add unique constraints
ALTER TABLE "sox_controls" ADD CONSTRAINT "sox_controls_control_id_key" UNIQUE ("control_id");

-- Create enums for better data integrity
CREATE TYPE "DataRequestType" AS ENUM ('export', 'deletion');
CREATE TYPE "DataRequestStatus" AS ENUM ('pending', 'processing', 'completed', 'failed');
CREATE TYPE "AmlCheckType" AS ENUM ('kyc', 'transaction', 'periodic', 'suspicious_activity');
CREATE TYPE "AmlCheckStatus" AS ENUM ('pending', 'passed', 'failed', 'requires_review');
CREATE TYPE "RiskLevel" AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE "SarStatus" AS ENUM ('pending', 'investigating', 'resolved', 'false_positive');
CREATE TYPE "CardAccessType" AS ENUM ('view', 'process', 'store');
CREATE TYPE "ComplianceFramework" AS ENUM ('GDPR', 'AML', 'PCI_DSS', 'SOX');
CREATE TYPE "ComplianceStatus" AS ENUM ('compliant', 'non_compliant', 'needs_review');
CREATE TYPE "SoxControlStatus" AS ENUM ('effective', 'deficient', 'not_tested');
CREATE TYPE "FinancialReportType" AS ENUM ('balance_sheet', 'income_statement', 'cash_flow', 'equity_statement');
CREATE TYPE "FinancialReportStatus" AS ENUM ('draft', 'under_review', 'approved', 'filed');

-- Update tables to use enums
ALTER TABLE "data_export_requests" ALTER COLUMN "request_type" TYPE "DataRequestType" USING "request_type"::"DataRequestType";
ALTER TABLE "data_export_requests" ALTER COLUMN "status" TYPE "DataRequestStatus" USING "status"::"DataRequestStatus";

ALTER TABLE "aml_checks" ALTER COLUMN "check_type" TYPE "AmlCheckType" USING "check_type"::"AmlCheckType";
ALTER TABLE "aml_checks" ALTER COLUMN "status" TYPE "AmlCheckStatus" USING "status"::"AmlCheckStatus";

ALTER TABLE "suspicious_activity_reports" ALTER COLUMN "risk_level" TYPE "RiskLevel" USING "risk_level"::"RiskLevel";
ALTER TABLE "suspicious_activity_reports" ALTER COLUMN "status" TYPE "SarStatus" USING "status"::"SarStatus";

ALTER TABLE "card_data_access" ALTER COLUMN "access_type" TYPE "CardAccessType" USING "access_type"::"CardAccessType";

ALTER TABLE "compliance_checks" ALTER COLUMN "framework" TYPE "ComplianceFramework" USING "framework"::"ComplianceFramework";
ALTER TABLE "compliance_checks" ALTER COLUMN "status" TYPE "ComplianceStatus" USING "status"::"ComplianceStatus";

ALTER TABLE "sox_controls" ALTER COLUMN "status" TYPE "SoxControlStatus" USING "status"::"SoxControlStatus";

ALTER TABLE "financial_reports" ALTER COLUMN "report_type" TYPE "FinancialReportType" USING "report_type"::"FinancialReportType";
ALTER TABLE "financial_reports" ALTER COLUMN "status" TYPE "FinancialReportStatus" USING "status"::"FinancialReportStatus";
