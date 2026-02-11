# Backend Migration Plan: Node.js → Rust (Axum + sqlx + utoipa)

**Issue**: #1  
**Branch**: `refactor/issue-1-rust-axum-backend`  
**Goal**: Replace Node.js/Express backend with Rust/Axum while preserving API contract

---

## Current State Analysis

### API Endpoints
- **Boards**: GET all, GET by ID, POST create, PUT update (501 not implemented), DELETE
- **Cards**: GET all (with listId filter), GET by ID, POST create, PUT update, DELETE
- **System**: GET /api/health, GET /docs (Swagger UI), GET /openapi.json

### Critical Issues to Fix
1. ⚠️ **Cards not persisted** - Card controller uses in-memory storage only
2. ⚠️ **Board update not implemented** - Returns 501 error
3. ⚠️ **No connection pooling** - Each DB operation creates new connection
4. ⚠️ **No tests** - No test coverage
5. ⚠️ **No seed data** - No development fixtures

### Database Schema
```
Board: id, title, description, ownerId, members[], createdAt, updatedAt
  └─> BoardColumn: id, title, boardId, position, createdAt, updatedAt
        └─> Card: id, title, description, listId, position, assigneeId, 
                  dueDate, labels[], createdAt, updatedAt
```

---

## Phase 1: Project Setup & Infrastructure

-### 1.1 Initialize Rust Project
- [x] Create `server/` directory
- [ ] Run `cargo init --name task_management_api`
- [ ] Add dependencies to `Cargo.toml`:
  - axum (web framework)
  - tokio (async runtime)
  - sqlx with postgres feature
  - serde + serde_json
  - tower-http (CORS)
  - utoipa + utoipa-swagger-ui
  - dotenvy (env vars)
  - chrono (dates)

### 1.2 Configure Database Connection
- [ ] Create `src/db.rs`
- [ ] Set up sqlx `PgPool`
- [ ] Load `DATABASE_URL` from `.env.development`
- [ ] Test connection to existing PostgreSQL (devuser/devpass@localhost:5432/taskdb)

### 1.3 Set Up Project Structure
```
server/
├── src/
│   ├── main.rs           # Entry point
│   ├── db.rs             # Connection pool
│   ├── routes/           # Route handlers
│   │   ├── mod.rs
│   │   ├── boards.rs
│   │   └── cards.rs
│   ├── models/           # DB models & schemas
│   │   ├── mod.rs
│   │   ├── board.rs
│   │   ├── card.rs
│   │   └── column.rs
│   ├── handlers/         # Business logic
│   │   ├── mod.rs
│   │   ├── boards.rs
│   │   └── cards.rs
│   └── errors.rs         # Error handling
├── .env.development
└── Cargo.toml
```

---

## Phase 2: Database Layer (sqlx)

### 2.1 Define Database Models
- [ ] Create `Board` struct in `models/board.rs`
  - Derive: `sqlx::FromRow`, `Serialize`, `Deserialize`, `ToSchema`
  - Fields: id, title, description, owner_id, members, created_at, updated_at
- [ ] Create `BoardColumn` struct
- [ ] Create `Card` struct

### 2.2 Create API Response Types
- [ ] Define `ApiResponse<T>` wrapper: `{ success, data?, error?, message? }`
- [ ] Create conversion traits (From DB models → API models)

### 2.3 Implement Database Queries

**Boards** (`handlers/boards.rs`):
- [ ] `get_all_boards()` - SELECT with ORDER BY created_at DESC
- [ ] `get_board_by_id(id)` - SELECT WHERE id = $1
- [ ] `create_board(title, description)` - INSERT RETURNING *
- [ ] `update_board(id, title, description)` - UPDATE RETURNING * ✨ **NEW**
- [ ] `delete_board(id)` - DELETE WHERE id = $1

**Cards** (`handlers/cards.rs`):
- [ ] `get_all_cards(list_id_filter)` - SELECT with optional WHERE
- [ ] `get_card_by_id(id)` - SELECT WHERE id = $1
- [ ] `create_card(...)` - INSERT RETURNING * ✨ **NOW PERSISTED**
- [ ] `update_card(id, ...)` - UPDATE RETURNING *
- [ ] `delete_card(id)` - DELETE WHERE id = $1

---

## Phase 3: API Layer (Axum + utoipa)

### 3.1 Set Up Axum Server
- [ ] Configure `main.rs`:
  - Initialize database pool
  - Set up CORS (allow all origins)
  - Create Axum router
  - Mount routes at `/api/boards` and `/api/cards`
  - Add `/api/health` endpoint
  - Bind to port 5000 (or `PORT` env)
  - Graceful shutdown handlers

### 3.2 Implement Board Routes
- [ ] Create `routes/boards.rs` with utoipa annotations
- [ ] Implement all endpoints with proper error handling
- [ ] Preserve exact API contract (paths, methods, formats)

### 3.3 Implement Card Routes
- [ ] Create `routes/cards.rs` with utoipa annotations
- [ ] Support `listId` query parameter
- [ ] Implement position-based ordering
- [ ] Match current API response format

### 3.4 Generate OpenAPI Documentation
- [ ] Create `#[derive(OpenApi)]` struct in main.rs
- [ ] List all paths and schemas
- [ ] Serve Swagger UI at `/docs`
- [ ] Serve OpenAPI JSON at `/openapi.json`

---

## Phase 4: Error Handling & Middleware

### 4.1 Implement Error Handler
- [ ] Create `errors.rs`:
  - Define `AppError` enum
  - Implement `IntoResponse`
  - Match format: `{ success: false, error: "..." }`

### 4.2 Add Request Validation
- [ ] Validate required fields
- [ ] Return 400 for invalid input

---

## Phase 5: Testing & Validation

### 5.1 Create Integration Tests
- [ ] Add `tests/` directory
- [ ] Test each endpoint
- [ ] Verify HTTP status codes
- [ ] Verify response formats
- [ ] Verify database state changes

### 5.2 Test API Contract Compatibility
- [ ] Run both Node.js and Rust servers side-by-side
- [ ] Use curl/Postman to verify identical responses
- [ ] Test with React frontend

---

## Phase 6: Documentation & Deployment

### 6.1 Update Docker Compose (Optional)
- [ ] Add Rust backend service (optional)
- [ ] Keep PostgreSQL unchanged

### 6.2 Update ONBOARDING.md
- [ ] Add Rust/Cargo prerequisites
- [ ] Update installation steps
- [ ] Update debugging instructions (Rust Analyzer + CodeLLDB)
- [ ] Add sqlx-cli instructions

### 6.3 Update README.md
- [ ] Replace tech stack section
- [ ] Update API documentation link
- [ ] Add performance notes

---

## Phase 7: Migration & Cleanup

### 7.1 Switch Frontend to Rust Backend
- [ ] Update API base URL if needed
- [ ] Test all frontend functionality

-### 7.2 Remove Node.js Backend
- [ ] Archive or delete old Node.js `server/` directory (if still present)
- [x] Renamed `server-rust/` to `server/`
- [ ] Update VS Code launch.json
- [ ] Remove Node.js dependencies

### 7.3 Final Verification
- [ ] Run full application
- [ ] Verify all features work
- [ ] Check Swagger UI
- [ ] Confirm database persistence

---

## Verification Checklist

After migration:
- [ ] All 9 API endpoints work identically to Node.js version
- [ ] Swagger UI accessible at `http://localhost:5000/docs`
- [ ] Cards are persisted to database (not in-memory) ✨
- [ ] Board updates are implemented (no 501 errors) ✨
- [ ] Frontend works without modifications
- [ ] Database connection pooling configured ✨
- [ ] OpenAPI spec auto-generated and accurate

---

## Key Improvements

**What We're Fixing:**
- ✅ Cards now persisted to database (was in-memory only)
- ✅ Board updates implemented (was returning 501)
- ✅ Proper connection pooling (was creating connection per request)
- ✅ Better performance (compiled binary)
- ✅ Compile-time type safety
- ✅ Auto-generated OpenAPI docs from code

**Technology Choices:**
- **Axum** - Ergonomic, tower ecosystem, better async
- **sqlx** - Compile-time query verification, lightweight, async-first
- **utoipa** - De facto OpenAPI standard for Rust

---

**Status**: Ready to begin implementation  
**Next Step**: Phase 1.1 - Initialize Rust project
