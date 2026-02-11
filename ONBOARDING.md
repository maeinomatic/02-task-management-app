# 🚀 Developer Onboarding Guide

Welcome! This guide will help you set up the Task Management App on your local machine.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Rust** (latest stable) - [Install rustup](https://rustup.rs/)
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

### 3. Setup Environment Variables

Create a `.env.development` file in the `server` directory with the following content:

```env
DATABASE_URL=postgresql://devuser:devpass@localhost:5432/taskdb
PORT=5000
RUST_LOG=info
```

**Note:** The `.env` file is already in `.gitignore` and will not be committed.

### 4. Apply Database Schema

The database schema needs to be created. Connect to the database:

```bash
docker exec -it 02-task-management-app-db-1 psql -U devuser -d taskdb
```

Then run the schema commands (if not already applied). The schema SQL is in the codebase documentation.

### 5. Build the Rust Server

Navigate to the server directory and build the project:

```bash
cd server
cargo build
```

This will:
- Download and compile all Rust dependencies
- Compile the server binary
- Place the executable in `target/debug/`

**Note:** The first build may take a few minutes as Rust compiles all dependencies.

### 6. Install Client Dependencies

Open a new terminal, navigate to the client directory, and install dependencies:

```bash
cd ../client
npm install
```

## 🚀 Running the Application

### Start the Backend Server

From the `server` directory:

```bash
cargo run
```

The server will run on `http://localhost:5000`

**For faster rebuilds during development:**
```bash
cargo build && cargo run
```

**With hot-reload (using cargo-watch):**
```bash
# Install cargo-watch first (one-time)
cargo install cargo-watch

# Then run with auto-reload
cargo watch -x run
```

**API Documentation:** Visit `http://localhost:5000/swagger` for interactive Swagger UI

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
5. Visit `http://localhost:5000/swagger` to explore the API with Swagger UI
6. Visit `http://localhost:5000/api-doc/openapi.json` to see the OpenAPI specification

## 📚 Project Structure

```
02-task-management-app/
├── client/                 # React frontend (Vite + TypeScript)
│   ├── src/
│   └── package.json
├── server/                 # Rust backend (Axum + SQLx)
│   ├── src/
│   │   ├── handlers/      # Request handlers
│   │   ├── routes/        # API routes
│   │   ├── models/        # Data models
│   │   ├── db.rs          # Database connection
│   │   └── main.rs        # Server entry point
│   ├── target/            # Compiled binaries (git ignored)
│   └── Cargo.toml         # Rust dependencies
├── docker-compose.yml      # PostgreSQL setup
└── .vscode/
    └── launch.json         # VS Code debug configurations
```

## 🛠️ Common Commands

### Server Commands (from `server/` directory)

```bash
cargo build                # Compile in debug mode
cargo build --release      # Compile in release mode (optimized)
cargo run                  # Build and run
cargo check                # Check for errors without building
cargo clean                # Remove build artifacts
cargo watch -x run         # Auto-reload on file changes (requires cargo-watch)
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

### Rust Compilation Errors

If you get compilation errors:

```bash
cd server
cargo clean
cargo update
cargo build
```

### Missing Cargo or Rust

If `cargo` command is not found:

**Install Rust:**
```bash
# Visit https://rustup.rs/ or run:
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Then restart your terminal
```

**Verify installation:**
```bash
rustc --version
cargo --version
```

### Swagger UI Not Loading

If you can't access Swagger UI at `/swagger`:

1. Ensure the server is built with the `debug-embed` feature (already configured in `Cargo.toml`)
2. Check that the server is running on port 5000
3. Try accessing the OpenAPI JSON directly at `/api-doc/openapi.json`
4. Check server logs for any errors

## 🔐 Environment Variables

### Server Environment Files

- `.env.development` - Development environment
- `.env.test` - Test environment (if you add tests)
- `.env.production` - Production environment

**Required variables:**
- `DATABASE_URL` - PostgreSQL connection string
- `PORT` - Server port (default: 5000)
- `RUST_LOG` - Log level (trace, debug, info, warn, error)

**Never commit these files to Git!** They are in `.gitignore`.

## 🎯 Next Steps

- Explore the API at `http://localhost:5000/swagger` (Swagger UI)
- Review the OpenAPI specification at `http://localhost:5000/api-doc/openapi.json`
- Check existing API endpoints in `server/src/routes/`
- Review the Rust handlers in `server/src/handlers/`
- Read the database schema documentation

## 📞 Getting Help

If you encounter issues:
1. Check the troubleshooting section above
2. Review the server logs for error messages
3. Verify all prerequisites are installed correctly
4. Reach out to the team for assistance

Happy coding! 🎉
