# 📋 Task Management App

A modern Trello-like project management application with drag-and-drop functionality, PostgreSQL persistence, and a clean TypeScript architecture.

## ✨ Features

- **📊 Board Management:** Create and manage multiple project boards
- **🎯 Task Organization:** Drag-and-drop cards between columns
- **💾 Data Persistence:** PostgreSQL database with Prisma v7 ORM
- **🔍 REST API:** Full CRUD operations with Express v5
- **📝 TypeScript:** End-to-end type safety for frontend and backend
- **🐛 Debugging:** VS Code integration with breakpoint support
- **🐳 Docker:** Containerized PostgreSQL with persistent volumes

## 🛠️ Tech Stack

### Frontend
- **React 19** with Vite
- **TypeScript 5.9**
- **Redux Toolkit** for state management
- **Axios** for API calls

### Backend
- **Node.js v25** with Express v5
- **TypeScript 5.9** with ESM modules
- **Prisma v7** ORM with PostgreSQL adapter
- **PostgreSQL 15** in Docker
- **Swagger** API documentation

### Development Tools
- **Docker Compose** for database
- **VS Code** debugging with source maps
- **nodemon** for hot-reloading

## 📁 Project Structure

```
02-task-management-app/
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── store/          # Redux store
│   │   └── services/       # API services
│   └── package.json
├── server/                  # Express backend
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── repositories/   # Database layer (Prisma)
│   │   ├── routes/         # API routes
│   │   └── index.ts        # Server entry
│   ├── prisma/
│   │   └── schema.prisma   # Database schema
│   ├── dist/               # Compiled output
│   └── package.json
├── docker-compose.yml       # PostgreSQL setup
├── ONBOARDING.md           # Developer setup guide
└── README.md               # This file
```

## 🚀 Quick Start

**New to this project?** Check out the [ONBOARDING.md](./ONBOARDING.md) guide for complete setup instructions.

**TL;DR:**
```bash
# 1. Start PostgreSQL
docker-compose up -d

# 2. Setup server
cd server
npm install
npx prisma generate
npm run build

# 3. Setup client
cd ../client
npm install

# 4. Run both
# Terminal 1: npm run start:dev (in server/)
# Terminal 2: npm run dev (in client/)
```

## 🎯 API Endpoints

### Boards
- `GET /api/boards` - List all boards
- `GET /api/boards/:id` - Get board by ID
- `POST /api/boards` - Create new board
- `DELETE /api/boards/:id` - Delete board

### Cards
- `GET /api/cards` - List all cards
- `POST /api/cards` - Create new card
- `PATCH /api/cards/:id` - Update card
- `DELETE /api/cards/:id` - Delete card

**📖 API Documentation:** Visit `http://localhost:5000/api-docs` when the server is running.

## 🗄️ Database

The app uses **PostgreSQL 15** with **Prisma v7**:
- Schema: Board → BoardColumn → Card (one-to-many relationships)
- Data persists in Docker named volumes (survives container restarts)
- Connection managed via `@prisma/adapter-pg` with connection pooling

### Database Schema
```prisma
Board {
  id, title, description, ownerId, members[], 
  createdAt, updatedAt, columns[]
}

BoardColumn {
  id, title, boardId, position,
  createdAt, updatedAt, cards[]
}

Card {
  id, title, description, listId, position,
  assigneeId, dueDate, labels[],
  createdAt, updatedAt
}
```

## 🔧 Development

### Debugging in VS Code
Press **F5** to start debugging with breakpoints:
- Configurations available in `.vscode/launch.json`
- Set breakpoints in TypeScript files
- Source maps enable stepping through original code

### Environment Variables
- **Development:** `.env.development` in `server/`
- **Test:** `.env.test` in `server/`
- **Production:** `.env.production` in `server/`

Required variables:
```env
DATABASE_URL=postgresql://devuser:devpass@localhost:5432/taskdb
USE_IN_MEMORY=false
NODE_ENV=development
PORT=5000
```

## 🚢 Deployment

### Production Database Setup

When deploying to production (Railway, Supabase, Neon, AWS RDS, etc.):

1. **Get connection string** from your provider:
   ```
   DATABASE_URL=postgresql://<user>:<password>@<host>:<port>/<database>?sslmode=require
   ```

2. **Update `prisma.config.ts`** with production URL or use environment variable

3. **Run Prisma commands** on deployment:
   ```bash
   npx prisma generate
   npx prisma db push  # Or use migrations
   ```

4. **Security checklist:**
   - ✅ Use SSL connections (`?sslmode=require`)
   - ✅ Strong passwords
   - ✅ IP allowlist/firewall rules
   - ✅ Environment variables (never commit credentials)

### Recommended Hosting
- **Frontend:** Vercel, Netlify
- **Backend:** Railway, Render, Fly.io
- **Database:** Supabase, Neon, Railway Postgres

## 📚 Additional Documentation

- [ONBOARDING.md](./ONBOARDING.md) - Complete developer setup guide
- [POSTGRESQL_PLAN.md](./POSTGRESQL_PLAN.md) - Database architecture plan

## 🤝 Contributing

1. Follow the onboarding guide to set up your environment
2. Create a feature branch
3. Write tests if applicable
4. Submit a pull request

## 📄 License

MIT
