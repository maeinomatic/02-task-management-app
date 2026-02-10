import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import boardRoutes from './routes/boards.js';
import cardRoutes from './routes/cards.js';
// swagger imports are loaded dynamically below to avoid swagger-ui-dist
// reading CLI args early and emitting warnings in Node ESM environment.

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// API Routes
console.log('Setting up routes...');
app.use('/api/boards', boardRoutes);
console.log('Board routes set up');
app.use('/api/cards', cardRoutes);
console.log('Card routes set up');

// OpenAPI / Swagger UI
// Sanitize any stray CLI flag that swagger-ui-dist may read and warn about
process.argv = process.argv.filter(arg => {
  if (arg === '--localstorage-file') return false;
  if (arg.startsWith('--localstorage-file=')) return false;
  return true;
});

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
  // Load swagger modules dynamically AFTER server starts
  (async () => {
    try {
      const [swaggerUi, openapiSpec] = await Promise.all([
        import('swagger-ui-express'),
        import('./openapi.js')
      ]);

      app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiSpec.default));
      app.get('/openapi.json', (_req, res) => res.json(openapiSpec.default));
      console.log('Swagger UI loaded at /docs');
    } catch (err) {
      console.error('Failed to load Swagger UI:', err);
    }
  })();
});

// Handle server errors
server.on('error', (err) => {
  console.error('Server error:', err);
});

// Handle process signals
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, closing server...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
