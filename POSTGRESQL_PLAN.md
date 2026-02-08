# 📋 PostgreSQL Integration Plan

## 🎯 Current Status
- ✅ Docker Compose setup is correct
- ✅ PostgreSQL dependencies installed (`pg`, `@types/pg`)
- ✅ TypeScript interfaces defined for all entities
- ❌ Controllers still use in-memory storage
- ❌ No database connection code
- ❌ No database schema/migrations

## 📝 Step-by-Step Implementation Plan

### Phase 1: Database Setup & Connection
1. **Create database configuration** (`src/config/database.ts`)
   - Set up PostgreSQL connection pool
   - Handle environment variables (`DATABASE_URL`)
   - Add connection error handling

2. **Create database utilities** (`src/utils/database.ts`)
   - Helper functions for common database operations
   - Query builders and result parsers

### Phase 2: Schema & Migrations
3. **Create SQL schema files** (`src/database/schema.sql`)
   - Define all 6 tables: users, boards, board_members, lists, cards, comments
   - Set up proper foreign key relationships
   - Add indexes for performance

4. **Create migration system** (`src/database/migrations/`)
   - Migration runner script
   - Version tracking for schema changes
   - Rollback capabilities

### Phase 3: Update Controllers
5. **Replace in-memory storage in controllers**
   - `boardController.ts`: Replace `boards[]` with database queries
   - `cardController.ts`: Replace `cards[]` with database queries
   - Add proper error handling for database operations

6. **Add data validation**
   - Input sanitization
   - Foreign key validation
   - Business logic validation

### Phase 4: Testing & Production
7. **Update package.json scripts**
   - Add `npm run migrate` command
   - Add `npm run seed` for test data
   - Update dev/start scripts

8. **Environment configuration**
   - `.env` file for local development
   - Production database URL handling
   - SSL configuration for production

## 🗂️ Files to Create/Modify

### New Files:
```
src/
├── config/
│   └── database.ts
├── database/
│   ├── schema.sql
│   └── migrations/
│       └── 001_initial_schema.sql
└── utils/
    └── database.ts
```

### Files to Modify:
- `src/controllers/boardController.ts`
- `src/controllers/cardController.ts`
- `package.json` (add migration scripts)
- `.env` (add DATABASE_URL)

## 🛠️ Commands to Run Later

```bash
# Start PostgreSQL
docker-compose up -d

# Run migrations
npm run migrate

# Seed with test data (optional)
npm run seed

# Test database connection
npm run test-db
```

## 📊 Database Schema Overview

**6 Tables:**
1. `users` - User accounts
2. `boards` - Project boards
3. `board_members` - Board membership (many-to-many)
4. `lists` - Columns within boards
5. `cards` - Tasks within lists
6. `comments` - Comments on cards

**Key Relationships:**
- Board → Owner (users)
- Board ↔ Members (board_members)
- Board → Lists
- List → Cards
- Card → Assignee (users)
- Card → Comments

## 🎯 Success Criteria
- ✅ All API endpoints work with PostgreSQL
- ✅ Data persists between server restarts
- ✅ Proper error handling for database operations
- ✅ Foreign key constraints enforced
- ✅ Environment-based configuration works

---

**Ready to implement this when you want to move from in-memory to persistent storage!** 🚀</content>
<parameter name="filePath">c:\Users\Martin\Documents\visualstudiocode\github portfolio projects\02-task-management-app\POSTGRESQL_PLAN.md