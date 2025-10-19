-- Add AI and ML service tables

-- AI Interactions
CREATE TABLE "ai_interactions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_interactions_pkey" PRIMARY KEY ("id")
);

-- Model Usage
CREATE TABLE "model_usage" (
    "id" TEXT NOT NULL,
    "model_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "processing_time" INTEGER NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "model_usage_pkey" PRIMARY KEY ("id")
);

-- Insight Generation
CREATE TABLE "insight_generation" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "insight_count" INTEGER NOT NULL,
    "insights" JSONB NOT NULL DEFAULT '[]',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "insight_generation_pkey" PRIMARY KEY ("id")
);

-- Prediction Generation
CREATE TABLE "prediction_generation" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "prediction_type" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "timeframe" TEXT NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "prediction_generation_pkey" PRIMARY KEY ("id")
);

-- Knowledge Documents
CREATE TABLE "knowledge_documents" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "tags" TEXT[],
    "embedding" DOUBLE PRECISION[],
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "knowledge_documents_pkey" PRIMARY KEY ("id")
);

-- RAG Sessions
CREATE TABLE "rag_sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "messages" JSONB NOT NULL DEFAULT '[]',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rag_sessions_pkey" PRIMARY KEY ("id")
);

-- Financial Insights
CREATE TABLE "financial_insights" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "actionable" BOOLEAN NOT NULL DEFAULT false,
    "recommendations" TEXT[],
    "impact" JSONB NOT NULL DEFAULT '{}',
    "confidence" DOUBLE PRECISION NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "financial_insights_pkey" PRIMARY KEY ("id")
);

-- ML Predictions
CREATE TABLE "ml_predictions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "prediction" JSONB NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "timeframe" TEXT NOT NULL,
    "factors" TEXT[],
    "scenarios" JSONB NOT NULL DEFAULT '{}',
    "methodology" TEXT NOT NULL,
    "limitations" TEXT[],
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ml_predictions_pkey" PRIMARY KEY ("id")
);

-- Create indexes for performance
CREATE INDEX "ai_interactions_user_id_idx" ON "ai_interactions"("user_id");
CREATE INDEX "ai_interactions_type_idx" ON "ai_interactions"("type");
CREATE INDEX "ai_interactions_created_at_idx" ON "ai_interactions"("created_at");

CREATE INDEX "model_usage_model_id_idx" ON "model_usage"("model_id");
CREATE INDEX "model_usage_user_id_idx" ON "model_usage"("user_id");
CREATE INDEX "model_usage_created_at_idx" ON "model_usage"("created_at");
CREATE INDEX "model_usage_success_idx" ON "model_usage"("success");

CREATE INDEX "insight_generation_user_id_idx" ON "insight_generation"("user_id");
CREATE INDEX "insight_generation_created_at_idx" ON "insight_generation"("created_at");

CREATE INDEX "prediction_generation_user_id_idx" ON "prediction_generation"("user_id");
CREATE INDEX "prediction_generation_type_idx" ON "prediction_generation"("prediction_type");
CREATE INDEX "prediction_generation_created_at_idx" ON "prediction_generation"("created_at");

CREATE INDEX "knowledge_documents_category_idx" ON "knowledge_documents"("category");
CREATE INDEX "knowledge_documents_tags_idx" ON "knowledge_documents" USING GIN ("tags");
CREATE INDEX "knowledge_documents_title_idx" ON "knowledge_documents"("title");

CREATE INDEX "rag_sessions_user_id_idx" ON "rag_sessions"("user_id");
CREATE INDEX "rag_sessions_session_id_idx" ON "rag_sessions"("session_id");
CREATE INDEX "rag_sessions_updated_at_idx" ON "rag_sessions"("updated_at");

CREATE INDEX "financial_insights_user_id_idx" ON "financial_insights"("user_id");
CREATE INDEX "financial_insights_type_idx" ON "financial_insights"("type");
CREATE INDEX "financial_insights_priority_idx" ON "financial_insights"("priority");
CREATE INDEX "financial_insights_created_at_idx" ON "financial_insights"("created_at");

CREATE INDEX "ml_predictions_user_id_idx" ON "ml_predictions"("user_id");
CREATE INDEX "ml_predictions_type_idx" ON "ml_predictions"("type");
CREATE INDEX "ml_predictions_created_at_idx" ON "ml_predictions"("created_at");

-- Add foreign key constraints
ALTER TABLE "ai_interactions" ADD CONSTRAINT "ai_interactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "model_usage" ADD CONSTRAINT "model_usage_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "insight_generation" ADD CONSTRAINT "insight_generation_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "prediction_generation" ADD CONSTRAINT "prediction_generation_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "rag_sessions" ADD CONSTRAINT "rag_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "financial_insights" ADD CONSTRAINT "financial_insights_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ml_predictions" ADD CONSTRAINT "ml_predictions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create enums for better data integrity
CREATE TYPE "AiInteractionType" AS ENUM ('chat', 'insights', 'prediction', 'analysis');
CREATE TYPE "InsightType" AS ENUM ('diversification', 'risk_analysis', 'tax_optimization', 'rebalancing', 'goal_tracking', 'cost_analysis', 'performance_review');
CREATE TYPE "InsightPriority" AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE "PredictionType" AS ENUM ('portfolio_performance', 'market_trend', 'risk_assessment', 'goal_probability', 'volatility_forecast', 'sector_rotation');

-- Update tables to use enums
ALTER TABLE "ai_interactions" ALTER COLUMN "type" TYPE "AiInteractionType" USING "type"::"AiInteractionType";
ALTER TABLE "financial_insights" ALTER COLUMN "type" TYPE "InsightType" USING "type"::"InsightType";
ALTER TABLE "financial_insights" ALTER COLUMN "priority" TYPE "InsightPriority" USING "priority"::"InsightPriority";
ALTER TABLE "prediction_generation" ALTER COLUMN "prediction_type" TYPE "PredictionType" USING "prediction_type"::"PredictionType";
ALTER TABLE "ml_predictions" ALTER COLUMN "type" TYPE "PredictionType" USING "type"::"PredictionType";

-- Add unique constraints where appropriate
ALTER TABLE "rag_sessions" ADD CONSTRAINT "rag_sessions_user_session_key" UNIQUE ("user_id", "session_id");

-- Create function to clean old AI data
CREATE OR REPLACE FUNCTION cleanup_old_ai_data()
RETURNS void AS $$
BEGIN
    DELETE FROM ai_interactions WHERE created_at < NOW() - INTERVAL '90 days';
    DELETE FROM model_usage WHERE created_at < NOW() - INTERVAL '90 days';
    DELETE FROM insight_generation WHERE created_at < NOW() - INTERVAL '90 days';
    DELETE FROM prediction_generation WHERE created_at < NOW() - INTERVAL '90 days';
    DELETE FROM rag_sessions WHERE updated_at < NOW() - INTERVAL '30 days';
    DELETE FROM financial_insights WHERE created_at < NOW() - INTERVAL '180 days';
    DELETE FROM ml_predictions WHERE created_at < NOW() - INTERVAL '180 days';
END;
$$ LANGUAGE plpgsql;

-- Create function to aggregate AI usage metrics
CREATE OR REPLACE FUNCTION aggregate_ai_metrics()
RETURNS void AS $$
BEGIN
    -- Create daily aggregates for AI interactions
    INSERT INTO ai_interactions (
        id,
        user_id,
        type,
        query,
        response,
        confidence,
        metadata,
        created_at
    )
    SELECT 
        gen_random_uuid()::text,
        user_id,
        type,
        'Daily aggregate',
        'Aggregated data',
        AVG(confidence),
        jsonb_build_object(
            'aggregate', true,
            'count', COUNT(*),
            'date', date_trunc('day', created_at)
        ),
        date_trunc('day', created_at)
    FROM ai_interactions 
    WHERE created_at >= NOW() - INTERVAL '2 days'
    AND created_at < NOW() - INTERVAL '1 day'
    AND metadata->>'aggregate' IS NULL
    GROUP BY user_id, type, date_trunc('day', created_at)
    ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql;
