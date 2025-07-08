/**
 * Stackr Bitcoin DCA Application - Main Entry Point
 * 
 * PURPOSE: Main application entry point for the Stackr Bitcoin DCA automation system
 * RELATED: Docker container, Bitcoin Knots integration, LangGraph orchestration
 * TAGS: entry-point, main, application-startup
 */

import express from 'express';
import { config } from 'dotenv';
import { greet } from './utils/greet';

// Load environment variables
config();

/**
 * Main application class for Stackr
 * Handles initialization and startup of the Bitcoin DCA automation system
 */
class StackrApp {
  private app: express.Application;
  private port: number;

  constructor() {
    this.app = express();
    this.port = parseInt(process.env['PORT'] || '3000', 10);
    
    this.setupMiddleware();
    this.setupRoutes();
  }

  /**
   * Configure Express middleware
   */
  private setupMiddleware(): void {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    
    // Basic logging middleware
    this.app.use((req, _res, next) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
      next();
    });
  }

  /**
   * Setup application routes
   */
  private setupRoutes(): void {
    // Health check endpoint
    this.app.get('/health', (_req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'stackr',
        version: '0.1.0'
      });
    });

    // Root endpoint
    this.app.get('/', (_req, res) => {
      res.json({
        message: 'Stackr Bitcoin DCA Automation System',
        version: '0.1.0',
        status: 'running',
        greeting: greet('Stackr User'),
        endpoints: {
          health: '/health',
          api: '/api'
        }
      });
    });

    // API placeholder
    this.app.get('/api', (_req, res) => {
      res.json({
        message: 'Stackr API - Coming Soon',
        features: [
          'DCA Automation',
          'Bitcoin Knots Integration',
          'Self-Custody Withdrawals',
          'LangGraph Orchestration'
        ]
      });
    });
  }

  /**
   * Start the application server
   */
  public start(): void {
    this.app.listen(this.port, () => {
      console.log(`🚀 Stackr Bitcoin DCA Application started`);
      console.log(`📍 Server running on http://localhost:${this.port}`);
      console.log(`🔗 Health check: http://localhost:${this.port}/health`);
      console.log(`📊 API endpoint: http://localhost:${this.port}/api`);
      console.log(`⏰ Started at: ${new Date().toISOString()}`);
    });
  }
}

/**
 * Main function to start the application
 */
function main(): void {
  try {
    console.log('🎯 Initializing Stackr Bitcoin DCA Application...');
    
    const app = new StackrApp();
    app.start();
    
  } catch (error) {
    console.error('❌ Failed to start Stackr application:', error);
    process.exit(1);
  }
}

// Start the application if this file is run directly
if (require.main === module) {
  main();
}

export { StackrApp, main }; 