require('dotenv').config();
const http = require('http');
const app = require('./app');
const { connectDB, disconnectDB } = require('./config/database');

const PORT = parseInt(process.env.PORT, 10) || 3000;

async function startServer() {
  try {
    // 1. Establish database connection
    await connectDB();

    // 2. Auto-seed sample catalog if database is empty
    const Product = require('./models/Product');
    const { populateData } = require('./scripts/seedProducts');
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      console.log('[Server] Initializing catalog with sample products and demo accounts...');
      await populateData();
    }

    // 2. Start HTTP server
    const server = http.createServer(app);

    server.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`  ShopEasy Full-Stack E-Commerce Server is RUNNING  `);
      console.log(`  URL: http://localhost:${PORT}                     `);
      console.log(`  Health Check: http://localhost:${PORT}/api/health `);
      console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`====================================================`);
    });

    // Handle graceful shutdowns
    const handleShutdown = async (signal) => {
      console.log(`\n[Server] Received ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        try {
          await disconnectDB();
          console.log('[Server] Database connections closed. Process exiting.');
          process.exit(0);
        } catch (err) {
          console.error('[Server] Error during database disconnect:', err.message);
          process.exit(1);
        }
      });
    };

    process.on('SIGINT', () => handleShutdown('SIGINT'));
    process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  } catch (err) {
    console.error('[Server] Fatal startup failure:', err.message);
    process.exit(1);
  }
}

startServer();
