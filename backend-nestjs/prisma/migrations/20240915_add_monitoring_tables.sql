-- Add monitoring and alerting tables

-- System Metrics
CREATE TABLE "system_metrics" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "cpu_usage" DOUBLE PRECISION NOT NULL,
    "memory_usage" DOUBLE PRECISION NOT NULL,
    "disk_usage" DOUBLE PRECISION NOT NULL,
    "active_connections" INTEGER NOT NULL,
    "response_time" DOUBLE PRECISION NOT NULL,
    "error_rate" DOUBLE PRECISION NOT NULL,
    "throughput" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "system_metrics_pkey" PRIMARY KEY ("id")
);

-- Application Metrics
CREATE TABLE "application_metrics" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "active_users" INTEGER NOT NULL,
    "total_transactions" INTEGER NOT NULL,
    "failed_transactions" INTEGER NOT NULL,
    "average_transaction_value" DOUBLE PRECISION NOT NULL,
    "compliance_alerts" INTEGER NOT NULL,
    "security_events" INTEGER NOT NULL,
    "api_calls" INTEGER NOT NULL,
    "database_queries" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "application_metrics_pkey" PRIMARY KEY ("id")
);

-- Error Logs
CREATE TABLE "error_logs" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "level" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "stack" TEXT,
    "context" TEXT NOT NULL,
    "user_id" TEXT,
    "request_id" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "error_logs_pkey" PRIMARY KEY ("id")
);

-- Alerts
CREATE TABLE "alerts" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "status" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "acknowledged_by" TEXT,
    "acknowledged_at" TIMESTAMP(3),
    "resolved_by" TEXT,
    "resolved_at" TIMESTAMP(3),
    "resolution" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "alerts_pkey" PRIMARY KEY ("id")
);

-- Notification Channels
CREATE TABLE "notification_channels" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "config" JSONB NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_channels_pkey" PRIMARY KEY ("id")
);

-- Metrics (Generic time-series data)
CREATE TABLE "metrics" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "tags" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "metrics_pkey" PRIMARY KEY ("id")
);

-- Health Checks
CREATE TABLE "health_checks" (
    "id" TEXT NOT NULL,
    "last_check" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "health_checks_pkey" PRIMARY KEY ("id")
);

-- Create indexes for performance
CREATE INDEX "system_metrics_timestamp_idx" ON "system_metrics"("timestamp");
CREATE INDEX "system_metrics_cpu_usage_idx" ON "system_metrics"("cpu_usage");
CREATE INDEX "system_metrics_memory_usage_idx" ON "system_metrics"("memory_usage");

CREATE INDEX "application_metrics_timestamp_idx" ON "application_metrics"("timestamp");
CREATE INDEX "application_metrics_active_users_idx" ON "application_metrics"("active_users");

CREATE INDEX "error_logs_timestamp_idx" ON "error_logs"("timestamp");
CREATE INDEX "error_logs_level_idx" ON "error_logs"("level");
CREATE INDEX "error_logs_context_idx" ON "error_logs"("context");
CREATE INDEX "error_logs_user_id_idx" ON "error_logs"("user_id");
CREATE INDEX "error_logs_request_id_idx" ON "error_logs"("request_id");

CREATE INDEX "alerts_type_idx" ON "alerts"("type");
CREATE INDEX "alerts_severity_idx" ON "alerts"("severity");
CREATE INDEX "alerts_status_idx" ON "alerts"("status");
CREATE INDEX "alerts_created_at_idx" ON "alerts"("created_at");

CREATE INDEX "notification_channels_type_idx" ON "notification_channels"("type");
CREATE INDEX "notification_channels_enabled_idx" ON "notification_channels"("enabled");

CREATE INDEX "metrics_name_idx" ON "metrics"("name");
CREATE INDEX "metrics_timestamp_idx" ON "metrics"("timestamp");
CREATE INDEX "metrics_name_timestamp_idx" ON "metrics"("name", "timestamp");

-- Add foreign key constraints
ALTER TABLE "error_logs" ADD CONSTRAINT "error_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Add unique constraints
ALTER TABLE "notification_channels" ADD CONSTRAINT "notification_channels_type_key" UNIQUE ("type");

-- Create enums for better data integrity
CREATE TYPE "ErrorLevel" AS ENUM ('error', 'warn', 'info', 'debug');
CREATE TYPE "AlertSeverity" AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE "AlertStatus" AS ENUM ('active', 'acknowledged', 'resolved');
CREATE TYPE "NotificationChannelType" AS ENUM ('email', 'slack', 'webhook', 'sms');

-- Update tables to use enums
ALTER TABLE "error_logs" ALTER COLUMN "level" TYPE "ErrorLevel" USING "level"::"ErrorLevel";
ALTER TABLE "alerts" ALTER COLUMN "severity" TYPE "AlertSeverity" USING "severity"::"AlertSeverity";
ALTER TABLE "alerts" ALTER COLUMN "status" TYPE "AlertStatus" USING "status"::"AlertStatus";
ALTER TABLE "notification_channels" ALTER COLUMN "type" TYPE "NotificationChannelType" USING "type"::"NotificationChannelType";

-- Add partitioning for large tables (PostgreSQL 10+)
-- This helps with performance for time-series data
-- Note: In production, consider implementing proper partitioning strategy

-- Add data retention policies (example triggers)
-- In production, implement proper data retention with scheduled jobs

-- Create function to clean old metrics
CREATE OR REPLACE FUNCTION cleanup_old_metrics()
RETURNS void AS $$
BEGIN
    DELETE FROM system_metrics WHERE timestamp < NOW() - INTERVAL '30 days';
    DELETE FROM application_metrics WHERE timestamp < NOW() - INTERVAL '30 days';
    DELETE FROM error_logs WHERE timestamp < NOW() - INTERVAL '30 days';
    DELETE FROM metrics WHERE timestamp < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Create function to aggregate metrics
CREATE OR REPLACE FUNCTION aggregate_hourly_metrics()
RETURNS void AS $$
BEGIN
    -- Example: Create hourly aggregates for system metrics
    INSERT INTO system_metrics (
        id,
        timestamp,
        cpu_usage,
        memory_usage,
        disk_usage,
        active_connections,
        response_time,
        error_rate,
        throughput
    )
    SELECT 
        gen_random_uuid()::text,
        date_trunc('hour', timestamp) as hour,
        AVG(cpu_usage),
        AVG(memory_usage),
        AVG(disk_usage),
        AVG(active_connections),
        AVG(response_time),
        AVG(error_rate),
        AVG(throughput)
    FROM system_metrics 
    WHERE timestamp >= NOW() - INTERVAL '2 hours'
    AND timestamp < NOW() - INTERVAL '1 hour'
    GROUP BY date_trunc('hour', timestamp)
    ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql;
