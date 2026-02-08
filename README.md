#### Connecting to a Remote/Production PostgreSQL Instance

If you are deploying or connecting to a managed PostgreSQL service (such as Railway, Supabase, Neon, AWS RDS, Azure, or DigitalOcean):

1. Obtain the connection string from your cloud provider. It will look like:
   ```
   DATABASE_URL=postgresql://<user>:<password>@<host>:<port>/<database>
   ```
   Example:
   ```
   DATABASE_URL=postgresql://admin:supersecret@dbhost.example.com:5432/proddb
   ```

2. Update your `.env` file in the `server` folder with the new connection string.

3. Make sure your server can access the database host (check firewall, VPC, or network settings).

4. For production, always use strong passwords and restrict access to trusted IPs.

5. Run migrations and seed data as needed:
   ```sh
   npm run migrate
   npm run seed
   ```

6. If using SSL (recommended for production), your connection string may require additional parameters, e.g.:
   ```
   DATABASE_URL=postgresql://<user>:<password>@<host>:<port>/<database>?sslmode=require
   ```

Refer to your provider's documentation for exact details.
# Task Management App

A Trello-like project management application with drag-and-drop functionality, real-time updates, and team collaboration.

## Features

- Create projects and boards
- Drag-and-drop task cards
- Real-time collaboration (WebSockets)
- Task assignments and due dates
- Comments on tasks
- Activity logging
- Team workspaces
- Priority levels and labels

## Tech Stack

- **Frontend:** React, React Beautiful DnD
- **Backend:** Node.js, Express, Socket.io
- **Database:** PostgreSQL
- **Real-time:** WebSockets (Socket.io)

## Project Structure

```
├── client/              # React frontend
├── server/              # Express backend
├── README.md
└── package.json
```

## Getting Started

### Prerequisites
- Node.js 16+
- PostgreSQL

#### (Recommended) Local PostgreSQL with Docker

You can run a local PostgreSQL database using Docker Compose. This is the easiest way to get started without installing PostgreSQL directly:

1. Make sure you have [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed.
2. In the project root, run:
   ```sh
   docker compose up -d
   ```
   This will start a PostgreSQL server with:
   - user: `devuser`
   - password: `devpass`
   - database: `taskdb`
   - port: `5432`

3. Your backend `.env` should use:
   ```
   DATABASE_URL=postgresql://devuser:devpass@localhost:5432/taskdb
   ```

4. To stop the database:
   ```sh
   docker compose down
   ```

You can use any PostgreSQL client to connect with these credentials.

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file in server folder:
   ```
   DATABASE_URL=your_postgres_uri
   JWT_SECRET=your_jwt_secret
   PORT=5000
   ```

4. Run database migrations:
   ```bash
   npm run migrate
   ```

5. Run development server:
   ```bash
   npm run dev
   ```

## Key Features Implementation

- Drag-and-drop with React Beautiful DnD
- Real-time updates with Socket.io
- WebSocket events for card movements
- Optimistic UI updates

## Deployment

- Frontend: Vercel
- Backend: Railway

## License

MIT
