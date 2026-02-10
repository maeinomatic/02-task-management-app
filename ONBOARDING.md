# 🚀 Developer Onboarding Guide

Welcome! This guide will help you set up the Task Management App on your local machine.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Docker Desktop** - [Download here](https://www.docker.com/products/docker-desktop/)
- **Git** - [Download here](https://git-scm.com/)
- A code editor like **VS Code** (recommended)

## 🔧 Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd 02-task-management-app
```

### 2. Start the PostgreSQL Database

The application uses PostgreSQL running in Docker. Start it with:

```bash
docker-compose up -d
```

This will:
- Download the PostgreSQL 15 image (if not already downloaded)
- Create a container named `02-task-management-app-db-1`
- Start PostgreSQL on port 5432
- Create a named volume `pgdata` to persist your data

**Verify it's running:**
```bash
docker ps
```
You should see the PostgreSQL container running.

### 3. Install Server Dependencies

Navigate to the server directory and install dependencies:

```bash
cd server
npm install
```

### 4. Setup Environment Variables

Create a `.env.development` file in the `server` directory with the following content:

```env
DATABASE_URL=postgresql://devuser:devpass@localhost:5432/taskdb
USE_IN_MEMORY=false
NODE_ENV=development
PORT=5000
```

### 5. Generate Prisma Client

Prisma is our ORM for database access. Generate the client with:

```bash
npx prisma generate
```

This reads the schema from `prisma/schema.prisma` and generates the TypeScript types.

### 6. Apply Database Schema

The database schema has already been created (Board, BoardColumn, Card tables). If you need to verify or recreate the schema, you can connect to the database:

```bash
docker exec -it 02-task-management-app-db-1 psql -U devuser -d taskdb
```

Then run the schema commands if needed (usually not required for the first setup).

### 7. Build the Server

Compile the TypeScript code:

```bash
npm run build
```

### 8. Install Client Dependencies

Open a new terminal, navigate to the client directory, and install dependencies:

```bash
cd ../client
npm install
```

## 🚀 Running the Application

### Start the Backend Server

From the `server` directory:

```bash
npm run start:dev
```

The server will run on `http://localhost:5000`

**Alternative:** You can also use VS Code debugging:
- Press `F5` in VS Code
- Select "Debug App 2 Server" from the configurations
- Set breakpoints in your TypeScript files

### Start the Frontend Client

From the `client` directory:

```bash
npm run dev
```

The client will run on `http://localhost:3000`

## 🧪 Testing the Setup

1. Open your browser and go to `http://localhost:3000`
2. The frontend should load
3. Try creating a new board - it should persist in PostgreSQL
4. Check the server logs to see database queries

## 📚 Project Structure

```
02-task-management-app/
├── client/                 # React frontend (Vite + TypeScript)
│   ├── src/
│   └── package.json
├── server/                 # Express backend (Node.js + TypeScript)
│   ├── src/
│   │   ├── controllers/   # Request handlers
│   │   ├── repositories/  # Database access layer
│   │   ├── routes/        # API routes
│   │   └── index.ts       # Server entry point
│   ├── prisma/
│   │   └── schema.prisma  # Database schema
│   ├── dist/              # Compiled JavaScript (generated)
│   └── package.json
├── docker-compose.yml      # PostgreSQL setup
└── .vscode/
    └── launch.json         # VS Code debug configurations
```

## 🛠️ Common Commands

### Server Commands (from `server/` directory)

```bash
npm run build              # Compile TypeScript to JavaScript
npm run start:dev          # Run in development mode (auto-rebuild)
npm run start              # Run compiled JavaScript
npx prisma generate        # Regenerate Prisma client
npx prisma studio          # Open Prisma Studio (database GUI)
```

### Client Commands (from `client/` directory)

```bash
npm run dev                # Start development server
npm run build              # Build for production
npm run preview            # Preview production build
```

### Docker Commands (from root directory)

```bash
docker-compose up -d       # Start PostgreSQL in background
docker-compose down        # Stop PostgreSQL (data persists)
docker-compose logs db     # View database logs
docker ps                  # List running containers
docker exec -it 02-task-management-app-db-1 psql -U devuser -d taskdb  # Connect to database
```

## 🐛 Troubleshooting

### Port 5000 Already in Use

If you get an `EADDRINUSE` error:

**Windows:**
```powershell
Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process -Force
```

**macOS/Linux:**
```bash
lsof -ti:5000 | xargs kill -9
```

### Database Connection Issues

1. Verify PostgreSQL is running:
   ```bash
   docker ps
   ```

2. Check database credentials in `.env.development`

3. Test connection manually:
   ```bash
   docker exec -it 02-task-management-app-db-1 psql -U devuser -d taskdb
   ```

### Prisma Client Not Found

If you get "Cannot find module '@prisma/client'":

```bash
cd server
npm install
npx prisma generate
```

### TypeScript Build Errors

Clean and rebuild:

```bash
cd server
rm -rf dist node_modules
npm install
npm run build
```

## 🔐 Environment Variables

### Server Environment Files

- `.env.development` - Development environment (loaded by VS Code debugger)
- `.env.test` - Test environment (if you add tests)
- `.env.production` - Production environment

**Never commit these files to Git!** They are in `.gitignore`.

## 🎯 Next Steps

- Read the [PostgreSQL Plan](./POSTGRESQL_PLAN.md) to understand the database architecture
- Explore the API at `http://localhost:5000/api-docs` (Swagger UI)
- Set breakpoints in VS Code and use the debugger to understand the code flow
- Check existing API endpoints in `server/src/routes/`

## 📞 Getting Help

If you encounter issues:
1. Check the troubleshooting section above
2. Review the server logs for error messages
3. Verify all prerequisites are installed correctly
4. Reach out to the team for assistance

Happy coding! 🎉
