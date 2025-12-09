<div align="center">
<img src="frontend/public/icon.svg" alt="Versus Type Logo" width="150"/>
<h1> Versus Type </h1>
A real-time typing app where you can practice solo or battle friends/randoms in PvP matches.
</div>


## Features
- **Live opponent cursors**
- **Chat**, **WPM updates** and **progress tracking**
- **Responsive**
- **Solo mode**
- **Quick Play**(matchmaking) and **Private/Public Rooms**
- **Customizable passages** and **settings**
- **Stats**
- **No sign-in required**

## Tech Stack
- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS, Customized ShadCN components, Motion
- **Backend**: Node.js, Express, Socket.io, Drizzle ORM, LibSQL (SQLite)
- **Auth**: Better Auth
- **Tools**: Biome, pnpm

## Development Setup

### Using Docker
1. Make sure you have Docker and Docker Compose installed.
2. Clone the repo:

   ```bash
   git clone https://github.com/sahaj-b/versus-type
   cd versus-type
   ```

3. Set up environment variables.
  - Copy [backend/.env.example](backend/.env.example) to `backend/.env` and configure DB and Auth.
  - Copy [frontend/.env.example](frontend/.env.example) to `frontend/.env` and configure the WS and HTTP server URLs.

4. Push database schema:
   ```bash
   cd backend
   pnpm install && pnpm db:push
   ```

4. Start the application using Docker Compose:
    ```bash
    docker compose up
    ```

### Manual Setup
1. Make sure you have Node.js and pnpm installed.
2. Clone the repo:

   ```bash
   git clone https://github.com/sahaj-b/versus-type
   cd versus-type
   ```

3. Install dependencies:

   ```bash
   pnpm install
   ```

4. Set up environment variables.
  - Copy [backend/.env.example](backend/.env.example) to `backend/.env` and configure DB and Auth.
  - Copy [frontend/.env.example](frontend/.env.example) to `frontend/.env` and configure the WS and HTTP server URLs.

5. Push the database schema:

   ```bash
   cd backend
   pnpm db:push
   ```

6. Start the servers:

   ```bash
   cd backend
   pnpm dev

   # in another terminal
   cd frontend
   pnpm dev

   # backend production build
   pnpm -F versus-type-backend build
   pnpm -F versus-type-backend start

    # frontend production build
   cd frontend/
   pnpm build
   pnpm start
   ```
