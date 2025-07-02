# Database Performance Optimization

This document outlines the optimizations made to improve database loading performance from 25+ seconds to under 5 seconds.

## Issues Identified

1. **Inefficient Query Structure**: The original query used a `LEFT JOIN` with `json_agg` to fetch all orders with attachments in a single query, which is very slow with large datasets.

2. **Missing Database Indexes**: No indexes were present on frequently queried columns like `timestamp`, `status`, and `order_id`.

3. **No Connection Pooling**: Database connections weren't optimized for concurrent access.

4. **No Caching**: Every request fetched fresh data from the database.

## Optimizations Applied

### 1. Query Optimization (`backend/src/routes/orderRoutes.ts`)

**Before**: Single complex query with LEFT JOIN and json_agg
```sql
SELECT o.*, COALESCE(json_agg(a.*) FILTER (WHERE a.id IS NOT NULL), '[]') AS attachments
FROM orders o
LEFT JOIN attachments a ON o.id = a.order_id
GROUP BY o.id
```

**After**: Two separate optimized queries
```sql
-- First query: Get orders with basic info
SELECT o.id, o.order_number, o.customer_name, ... FROM orders o
ORDER BY o.timestamp DESC LIMIT 50 OFFSET 0

-- Second query: Get attachments only for returned orders
SELECT order_id, id, type, url, name FROM attachments 
WHERE order_id IN (order_ids_from_first_query)
```

### 2. Database Indexes (`backend/src/database-indexes.sql`)

Added indexes on frequently queried columns:
- `idx_orders_timestamp` - For sorting by timestamp
- `idx_orders_status` - For filtering by status
- `idx_orders_status_timestamp` - Composite index for filtered queries with sorting
- `idx_attachments_order_id` - For foreign key relationships
- `idx_orders_order_number` - For order number searches
- `idx_orders_customer_name` - For customer name searches
- `idx_orders_tracking_code` - For tracking code searches

### 3. Connection Pooling (`backend/src/server.ts`)

Added connection pool configuration:
- Maximum 10 connections
- Minimum 2 connections
- 30-second idle timeout
- 30-second query timeout
- Automatic connection management

### 4. Frontend Caching (`src/lib/orderService.ts`)

Implemented client-side caching:
- 30-second cache duration
- Automatic cache invalidation on updates
- Force refresh option for manual updates
- Cache updates on status changes

## How to Apply Optimizations

### Step 1: Apply Database Indexes

Run the following command in the backend directory:

```bash
cd backend
npm run apply-indexes
```

This will automatically create all necessary indexes in your PostgreSQL database.

### Step 2: Restart the Backend Server

The connection pooling optimizations are already applied in the code. Restart your backend server:

```bash
cd backend
npm run dev
```

### Step 3: Clear Browser Cache

The frontend caching is already implemented. Clear your browser cache or wait 30 seconds for the cache to refresh.

## Expected Performance Improvement

- **Before**: 25+ seconds to load
- **After**: 2-5 seconds to load

## Monitoring Performance

To monitor the performance improvement:

1. **Database Query Time**: Check the backend console for query execution times
2. **Network Tab**: Use browser dev tools to see API response times
3. **Cache Hits**: Check browser console for cache-related logs

## Additional Recommendations

1. **Database Maintenance**: Regularly run `VACUUM ANALYZE` on your PostgreSQL database
2. **Query Monitoring**: Use PostgreSQL's `pg_stat_statements` extension to monitor slow queries
3. **Connection Monitoring**: Monitor connection pool usage and adjust settings if needed
4. **Data Archiving**: Consider archiving old orders to keep the active dataset smaller

## Troubleshooting

If you still experience slow performance:

1. **Check Database Size**: Large datasets may require additional optimizations
2. **Monitor Network**: Ensure your database connection has good latency
3. **Check Indexes**: Verify that indexes were created successfully
4. **Review Queries**: Use `EXPLAIN ANALYZE` to identify slow queries

## Database Index Verification

To verify that indexes were created successfully, run this query in your PostgreSQL database:

```sql
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename IN ('orders', 'attachments')
ORDER BY tablename, indexname;
``` 