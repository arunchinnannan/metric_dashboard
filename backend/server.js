const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const metricsController = require('./controllers/metricsController');
const { testConnection, pool } = require('./database');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'Server running', timestamp: new Date().toISOString() });
});

app.get('/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT 1 as test');
    res.json({ status: 'Database connected', result: result.rows[0] });
  } catch (error) {
    res.status(500).json({ status: 'Database error', error: error.message });
  }
});

app.post('/api/filter-options', metricsController.getFilterOptions);
app.post('/api/metrics-summary', metricsController.getMetricsSummary);
app.post('/api/time-series', metricsController.getTimeSeries);
app.post('/api/top-applications', metricsController.getTopApplications);
app.post('/api/environment-dist', metricsController.getEnvironmentDistribution);
app.post('/api/cluster-comparison', metricsController.getClusterComparison);
app.post('/api/namespace-data', metricsController.getNamespaceData);
app.post('/api/table-data', metricsController.getTableData);
app.post('/api/application-performance', metricsController.getApplicationPerformance);
app.post('/api/mots-grouping', metricsController.getMotsGrouping);

// In Kubernetes, frontend is served by a separate nginx pod
// Only serve static files in local development
if (process.env.NODE_ENV !== 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
  });
}

const PORT = process.env.PORT || 5000;

// Start server with database connection test
const startServer = async () => {
  try {
    // Test database connection before starting server
    await testConnection();

    const server = app.listen(PORT, () => {
      console.log(`\n✅ Server running on http://localhost:${PORT}`);
      console.log(`📊 Open dashboard at http://localhost:5173\n`);
    });

    return server;
  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
  }
};

// Start the server
startServer().then(server => {

  // Graceful shutdown handling
  const gracefulShutdown = (signal) => {
    console.log(`\n🔄 Received ${signal}. Starting graceful shutdown...`);

    server.close(() => {
      console.log('✅ HTTP server closed');

      // Close database connection pool
      const { pool } = require('./database');
      pool.end(() => {
        console.log('✅ Database connection pool closed');
        console.log('👋 Server shutdown complete');
        process.exit(0);
      });
    });

    // Force close after 10 seconds
    setTimeout(() => {
      console.error('❌ Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  };

  // Listen for shutdown signals
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  // Handle uncaught exceptions
  process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err);
    gracefulShutdown('uncaughtException');
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    gracefulShutdown('unhandledRejection');
  });
}).catch(err => {
  console.error('❌ Server startup failed:', err);
  process.exit(1);
});
