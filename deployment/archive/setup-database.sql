-- Database setup script for Kafka Metrics Dashboard
-- Run this on your PostgreSQL server before starting the application

-- Create database if it doesn't exist (run as postgres superuser)
-- CREATE DATABASE kafka_metrics;

-- Create user if it doesn't exist (run as postgres superuser)
-- CREATE USER kafka_user WITH PASSWORD 'admin';
-- GRANT ALL PRIVILEGES ON DATABASE kafka_metrics TO kafka_user;

-- Connect to kafka_metrics database
\c kafka_metrics

-- Create metrics schema
CREATE SCHEMA IF NOT EXISTS metrics;

-- Grant permissions
GRANT ALL ON SCHEMA metrics TO kafka_user;
GRANT ALL ON ALL TABLES IN SCHEMA metrics TO kafka_user;
GRANT ALL ON ALL SEQUENCES IN SCHEMA metrics TO kafka_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA metrics GRANT ALL ON TABLES TO kafka_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA metrics GRANT ALL ON SEQUENCES TO kafka_user;

-- Create the main metrics table
CREATE TABLE IF NOT EXISTS metrics.kafka_application_metrics (
    id SERIAL PRIMARY KEY,
    metric_date DATE NOT NULL,
    cluster_name VARCHAR(255) NOT NULL,
    namespace VARCHAR(255),
    environment VARCHAR(100),
    application_name VARCHAR(255) NOT NULL,
    pool_id VARCHAR(255),
    data_plane VARCHAR(255),
    mots_id VARCHAR(255),
    topic_name VARCHAR(255) NOT NULL,
    partition_count INTEGER,
    replication_factor INTEGER,
    total_messages BIGINT,
    total_bytes BIGINT,
    retention_ms BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_kafka_metrics_date ON metrics.kafka_application_metrics(metric_date);
CREATE INDEX IF NOT EXISTS idx_kafka_metrics_cluster ON metrics.kafka_application_metrics(cluster_name);
CREATE INDEX IF NOT EXISTS idx_kafka_metrics_app ON metrics.kafka_application_metrics(application_name);
CREATE INDEX IF NOT EXISTS idx_kafka_metrics_topic ON metrics.kafka_application_metrics(topic_name);
CREATE INDEX IF NOT EXISTS idx_kafka_metrics_env ON metrics.kafka_application_metrics(environment);

-- Insert sample data for testing
INSERT INTO metrics.kafka_application_metrics 
(metric_date, cluster_name, namespace, environment, application_name, pool_id, data_plane, mots_id, topic_name, partition_count, replication_factor, total_messages, total_bytes, retention_ms)
VALUES
-- Sample data for different environments and applications
('2025-11-01', 'prod-cluster-1', 'default', 'production', 'payment-service', 'pool-1', 'us-east-1', 'mots-001', 'payments.transactions', 12, 3, 1500000, 750000000, 604800000),
('2025-11-01', 'prod-cluster-1', 'default', 'production', 'order-service', 'pool-1', 'us-east-1', 'mots-002', 'orders.created', 8, 3, 850000, 425000000, 604800000),
('2025-11-01', 'prod-cluster-2', 'default', 'production', 'inventory-service', 'pool-2', 'us-west-2', 'mots-003', 'inventory.updates', 6, 3, 650000, 325000000, 604800000),
('2025-11-02', 'prod-cluster-1', 'default', 'production', 'payment-service', 'pool-1', 'us-east-1', 'mots-001', 'payments.transactions', 12, 3, 1600000, 800000000, 604800000),
('2025-11-02', 'prod-cluster-1', 'default', 'production', 'order-service', 'pool-1', 'us-east-1', 'mots-002', 'orders.created', 8, 3, 900000, 450000000, 604800000),
('2025-11-02', 'prod-cluster-2', 'default', 'production', 'inventory-service', 'pool-2', 'us-west-2', 'mots-003', 'inventory.updates', 6, 3, 700000, 350000000, 604800000),
('2025-11-03', 'prod-cluster-1', 'default', 'production', 'payment-service', 'pool-1', 'us-east-1', 'mots-001', 'payments.transactions', 12, 3, 1750000, 875000000, 604800000),
('2025-11-03', 'prod-cluster-1', 'default', 'production', 'order-service', 'pool-1', 'us-east-1', 'mots-002', 'orders.created', 8, 3, 950000, 475000000, 604800000),
('2025-11-03', 'prod-cluster-2', 'default', 'production', 'inventory-service', 'pool-2', 'us-west-2', 'mots-003', 'inventory.updates', 6, 3, 750000, 375000000, 604800000),
-- Staging environment data
('2025-11-01', 'staging-cluster-1', 'staging', 'staging', 'payment-service', 'pool-staging', 'us-east-1', 'mots-stg-001', 'payments.transactions', 4, 2, 150000, 75000000, 259200000),
('2025-11-01', 'staging-cluster-1', 'staging', 'staging', 'order-service', 'pool-staging', 'us-east-1', 'mots-stg-002', 'orders.created', 4, 2, 85000, 42500000, 259200000),
('2025-11-02', 'staging-cluster-1', 'staging', 'staging', 'payment-service', 'pool-staging', 'us-east-1', 'mots-stg-001', 'payments.transactions', 4, 2, 160000, 80000000, 259200000),
('2025-11-02', 'staging-cluster-1', 'staging', 'staging', 'order-service', 'pool-staging', 'us-east-1', 'mots-stg-002', 'orders.created', 4, 2, 90000, 45000000, 259200000),
-- Development environment data
('2025-11-01', 'dev-cluster-1', 'development', 'development', 'payment-service', 'pool-dev', 'us-east-1', 'mots-dev-001', 'payments.transactions', 2, 1, 15000, 7500000, 86400000),
('2025-11-01', 'dev-cluster-1', 'development', 'development', 'order-service', 'pool-dev', 'us-east-1', 'mots-dev-002', 'orders.created', 2, 1, 8500, 4250000, 86400000),
('2025-11-02', 'dev-cluster-1', 'development', 'development', 'payment-service', 'pool-dev', 'us-east-1', 'mots-dev-001', 'payments.transactions', 2, 1, 16000, 8000000, 86400000),
('2025-11-02', 'dev-cluster-1', 'development', 'development', 'order-service', 'pool-dev', 'us-east-1', 'mots-dev-002', 'orders.created', 2, 1, 9000, 4500000, 86400000),
-- Recent data (last 7 days)
('2025-11-04', 'prod-cluster-1', 'default', 'production', 'payment-service', 'pool-1', 'us-east-1', 'mots-001', 'payments.transactions', 12, 3, 1800000, 900000000, 604800000),
('2025-11-05', 'prod-cluster-1', 'default', 'production', 'payment-service', 'pool-1', 'us-east-1', 'mots-001', 'payments.transactions', 12, 3, 1850000, 925000000, 604800000),
('2025-11-06', 'prod-cluster-1', 'default', 'production', 'payment-service', 'pool-1', 'us-east-1', 'mots-001', 'payments.transactions', 12, 3, 1900000, 950000000, 604800000),
('2025-11-07', 'prod-cluster-1', 'default', 'production', 'payment-service', 'pool-1', 'us-east-1', 'mots-001', 'payments.transactions', 12, 3, 1950000, 975000000, 604800000)
ON CONFLICT DO NOTHING;

-- Verify data was inserted
SELECT COUNT(*) as total_records FROM metrics.kafka_application_metrics;
SELECT DISTINCT environment FROM metrics.kafka_application_metrics;
SELECT DISTINCT cluster_name FROM metrics.kafka_application_metrics;
SELECT DISTINCT application_name FROM metrics.kafka_application_metrics;

-- Show sample data
SELECT metric_date, cluster_name, environment, application_name, topic_name, total_messages, total_bytes
FROM metrics.kafka_application_metrics
ORDER BY metric_date DESC, total_messages DESC
LIMIT 10;

GRANT ALL ON SCHEMA metrics TO kafka_user;
GRANT ALL ON ALL TABLES IN SCHEMA metrics TO kafka_user;
