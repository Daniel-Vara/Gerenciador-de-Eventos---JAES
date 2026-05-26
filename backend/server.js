/**
 * MAIN SERVER FILE - JAES EVENT & TASK MANAGEMENT API
 * 
 * Boots the Node.js Express server, enables middleware (CORS, body-parser),
 * and routes API traffic to dedicated sub-routers.
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

const eventRoutes = require('./routes/eventRoutes');
const participantRoutes = require('./routes/participantRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS so the React frontend (running on another port like 5173) can query this API
app.use(cors({
  origin: '*', // In production, restrict to frontend domain
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));

// Parse incoming requests with JSON payloads
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static assets if any
app.use('/static', express.static(path.join(__dirname, 'public')));

// Root health-check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'healthy',
    timestamp: new Date(),
    app: 'JAES Relational Event Manager API'
  });
});

// Register routes
app.use('/api/events', eventRoutes);
app.use('/api/participants', participantRoutes);

// Error handling middleware for unexpected server errors
app.use((err, req, res, next) => {
  console.error('[Unhandled Server Error]', err);
  res.status(500).json({
    success: false,
    message: 'An unexpected internal server error occurred.',
    error: err.message
  });
});

// Run server
async function startServer() {
  console.log('[Server Startup] Booting server environment...');
  
  // Start listening to port
  app.listen(PORT, () => {
    console.log('\n=============================================================');
    console.log(`  JAES EVENT & TASK MANAGEMENT API RUNNING SUCCESSFULLY`);
    console.log(`  Local Endpoint: http://localhost:${PORT}`);
    console.log(`  Health Check:   http://localhost:${PORT}/api/health`);
    console.log('=============================================================\n');
  });
}

startServer();
