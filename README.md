# 📋 Task Management App

A modern Trello-like project management application with drag-and-drop functionality, PostgreSQL persistence, and a clean TypeScript architecture.

## ✨ Features

- **📊 Board Management:** Create and manage multiple project boards
- **🎯 Task Organization:** Drag-and-drop cards between columns
- **💾 Data Persistence:** PostgreSQL database with SQLx
- **🔍 REST API:** Full CRUD operations with Axum
- **📝 Type Safety:** Rust's compile-time guarantees and SQLx query verification
- **🐛 Debugging:** Rust analyzer integration
- **🐳 Docker:** Containerized PostgreSQL with persistent volumes
- **📚 API Docs:** Auto-generated OpenAPI/Swagger documentation

## 🛠️ Tech Stack

### Frontend
- **React 19** with Vite
- **TypeScript 5.9**
- **Redux Toolkit** for state management
- **Axios** for API calls

### Backend
- **Rust** (latest stable) with **Axum** web framework
- **SQLx** for PostgreSQL access
- **utoipa** for OpenAPI/Swagger generation
- **PostgreSQL 15** in Docker
- **Swagger UI** with embedded assets

### Development Tools
- **Docker Compose** for database
- **cargo-watch** for hot-reloading
- **Rust analyzer** for IDE support

## 📁 Project Structure

```
02-task-management-app/
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── store/          # Redux store
│   │   └── services/       # API services
│   └── package.json
├── server/                  # Rust/Axum backend
│   ├── src/
│   │   ├── handlers/       # Request handlers
│   │   ├── routes/         # API routes
│   │   ├── models/         # Data models
│   │   ├── db.rs           # Database connection
│   │   └── main.rs         # Server entry
│   ├── target/             # Build output (git ignored)
│   └── Cargo.toml          # Rust dependencies
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
cargo build

# 3. Setup client
cd ../client
npm install

# 4. Run both
# Terminal 1: cargo run (in server/)
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

**📖 API Documentation:** Visit `http://localhost:5000/swagger` when the server is running.

## 🗄️ Database

The app uses **PostgreSQL 15** with **SQLx**:
- Schema: Board → BoardColumn → Card (one-to-many relationships)
- Data persists in Docker named volumes (survives container restarts)
- Type-safe SQL queries with compile-time verification
- Async connection pooling with Tokio runtime

### Database Schema
```sql
Board {
  id (UUID), title, description, owner_id, members[], 
  created_at, updated_at, columns[]
}

BoardColumn {
  id (UUID), title, board_id, position,
  created_at, updated_at, cards[]
}

Card {
  id (UUID), title, description, list_id, position,
  assignee_id, due_date, labels[],
  created_at, updated_at
}
```

## 🔧 Development

### Building and Running
```bash
cd server
cargo build          # Debug build
cargo build --release  # Optimized release build
cargo run            # Build and run
cargo watch -x run   # Auto-reload on changes
```

### Environment Variables
- **Development:** `.env.development` in `server/`
- **Test:** `.env.test` in `server/`
- **Production:** `.env.production` in `server/`

Required variables:
```env
DATABASE_URL=postgresql://devuser:devpass@localhost:5432/taskdb
PORT=5000
RUST_LOG=info
```

## 🚢 Deployment

### Production Database Setup

When deploying to production (Railway, Fly.io, AWS RDS, etc.):

1. **Get connection string** from your provider:
   ```
   DATABASE_URL=postgresql://<user>:<password>@<host>:<port>/<database>?sslmode=require
   ```

2. **Set environment variable** in your hosting platform

3. **Build in release mode:**
   ```bash
   cargo build --release
   ```

4. **Security checklist:**
   - ✅ Use SSL connections (`?sslmode=require`)
   - ✅ Strong passwords
   - ✅ IP allowlist/firewall rules
   - ✅ Environment variables (never commit credentials)
   - ✅ Build with `--release` flag for optimizations

### Recommended Hosting
- **Frontend:** Vercel, Netlify
- **Backend:** Fly.io, Railway, Render
- **Database:** Supabase, Neon, Railway Postgres

## 📚 Additional Documentation

- [ONBOARDING.md](./ONBOARDING.md) - Complete developer setup guide
- [SWAGGER_ANALYSIS.md](./SWAGGER_ANALYSIS.md) - Swagger/OpenAPI implementation details

## 🤝 Contributing

1. Follow the onboarding guide to set up your environment
2. Create a feature branch
3. Write tests if applicable
4. Submit a pull request

## 📄 License

MIT
