-- Database Indexes for Performance Optimization
-- Run this script on your PostgreSQL database to improve query performance

-- Index on orders table for timestamp (most common sorting field)
CREATE INDEX IF NOT EXISTS idx_orders_timestamp ON orders(timestamp DESC);

-- Index on orders table for status (common filtering field)
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- Composite index for status and timestamp (for filtered queries with sorting)
CREATE INDEX IF NOT EXISTS idx_orders_status_timestamp ON orders(status, timestamp DESC);

-- Index on attachments table for order_id (foreign key relationship)
CREATE INDEX IF NOT EXISTS idx_attachments_order_id ON attachments(order_id);

-- Index on orders table for order_number (if frequently searched)
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);

-- Index on orders table for customer_name (if frequently searched)
CREATE INDEX IF NOT EXISTS idx_orders_customer_name ON orders(customer_name);

-- Index on orders table for tracking_code (if frequently searched)
CREATE INDEX IF NOT EXISTS idx_orders_tracking_code ON orders(tracking_code);

-- Analyze tables to update statistics
ANALYZE orders;
ANALYZE attachments; 