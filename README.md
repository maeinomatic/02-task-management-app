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
