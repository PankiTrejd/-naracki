import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();
import pgPromise from 'pg-promise';
import { S3Client } from "@aws-sdk/client-s3";
import axios from 'axios';

import orderRoutes from './routes/orderRoutes.js';
import expenseRoutes from './routes/expenseRoutes.js';
import goalRoutes from './routes/goalRoutes.js';

const app = express();
const port = process.env.PORT || 3001; // Backend will run on port 3001

const allowedOrigins = [
  'https://naracki.vercel.app', // your Vercel frontend
  // add more origins if needed
];

// Middleware
app.use(cors({
  origin: allowedOrigins,
  credentials: true, // if you use cookies/auth
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Database connection setup
export const pgp = pgPromise({
  // Connection pool configuration for better performance
  capSQL: true, // Capitalize SQL keywords
});
// console.log('DATABASE_PASSWORD:', process.env.DATABASE_PASSWORD); // Removed for security
// console.log('Type of DATABASE_PASSWORD:', typeof process.env.DATABASE_PASSWORD); // Removed for security

if (typeof process.env.DATABASE_PASSWORD !== 'string' || !process.env.DATABASE_PASSWORD) {
  console.error('Error: DATABASE_PASSWORD environment variable is missing or not a string.');
  process.exit(1); // Exit the application if password is not valid
}

const dbConfig = {
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  // Connection pool settings for better performance
  max: 10, // Maximum number of connections
  min: 2, // Minimum number of connections
  idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
  acquireTimeoutMillis: 30000, // Wait 30 seconds to acquire a connection
  createTimeoutMillis: 30000, // Wait 30 seconds to create a connection
  destroyTimeoutMillis: 5000, // Wait 5 seconds to destroy a connection
  reapIntervalMillis: 1000, // Check for dead connections every second
  createRetryIntervalMillis: 200, // Wait 200ms between connection creation attempts
  // Query timeout
  query_timeout: 30000, // 30 seconds
  // Statement timeout
  statement_timeout: 30000, // 30 seconds
  // Connection timeout
  connect_timeout: 30000, // 30 seconds
};

export const db = pgp(dbConfig);

// Initialize DigitalOcean Spaces client
export const spacesClient = new S3Client({
  endpoint: `https://${process.env.VITE_DO_SPACES_REGION}.digitaloceanspaces.com`, // Set explicit regional endpoint
  region: process.env.VITE_DO_SPACES_REGION,
  credentials: {
    accessKeyId: process.env.VITE_DO_SPACES_KEY as string,
    secretAccessKey: process.env.VITE_DO_SPACES_SECRET as string,
  },
  forcePathStyle: true, // Crucial for resolving SSL cert issues with DO Spaces
});

export const BUCKET_NAME = process.env.VITE_DO_SPACES_BUCKET;

// InPosta API Proxy (for frontend to securely call InPosta API)
app.post('/api/inposta-shipment', async (req, res) => {
  const INPOSTA_API_BASE_URL = 'https://app.inpostaradeski.mk/api/v1';
  const INPOSTA_TOKEN = process.env.INPOSTA_TOKEN; // Get from environment variables

  if (!INPOSTA_TOKEN) {
    return res.status(500).json({ message: 'InPosta API token is not configured on the backend.' });
  }

  try {
    const response = await axios.post(`${INPOSTA_API_BASE_URL}/shipments`, req.body, {
      headers: {
        'Authorization': INPOSTA_TOKEN,
        'Content-Type': 'application/json',
      },
    });
    res.status(response.status).json(response.data);
  } catch (error: any) {
    console.error('Error proxying InPosta shipment request:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json(error.response?.data || { message: 'Internal Server Error proxying InPosta API' });
  }
});

// Use routes
app.use('/api/orders', orderRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/goals', goalRoutes);

// Basic route for testing
app.get('/', (req, res) => {
  res.send('Hello from the backend!');
});

// Start the server
app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
  db.connect()
    .then((obj: any) => {
      obj.done();
      console.log('Database connection successful!');
    })
    .catch((error: any) => {
      console.error('Database connection error:', error.message || error);
    });
}); 