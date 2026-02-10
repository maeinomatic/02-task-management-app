import { defineConfig } from 'prisma/config';

export default defineConfig({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://devuser:devpass@localhost:5432/taskdb',
    },
  },
});
