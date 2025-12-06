<div align="center">
<img src="frontend/public/icon.svg" alt="Versus Type Logo" width="150"/>
<h1> Versus Type </h1>
A real-time typing app where you can practice solo or battle friends/randoms in PvP matches.
</div>


## Features
- **Live opponent cursors**
- **Chat**
- **WPM updates** and **progress tracking**
- **Solo mode**
- **Quick Play**(matchmaking) and **Private/Public Rooms**
- **Customizable passages** and **settings**
- **Stats**
- **No sign-in required**

## Tech Stack
- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS, Customized ShadCN components
- **Backend**: Node.js, Express, Socket.io, Drizzle ORM, LibSQL (SQLite)
- **Auth**: Better Auth
- **Tools**: Biome, pnpm

## Development Setup

### Prerequisites
- Node.js 18+
- pnpm

### Installation
1. Clone the repo:

   ```bash
   git clone https://github.com/sahaj-b/versus-type
   cd versus-type
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Set up environment variables. Copy [backend/.env.example](backend/.env.example) to `backend/.env` and configure DB and Auth. In frontend, `NEXT_PUBLIC_SERVER_RUL` in should point to your backend server (default: `http://localhost:4000`).

4. Run the database migrations:

   ```bash
   cd backend
   pnpm db:push
   ```

5. Start the development servers:

   ```bash
   cd backend
   pnpm dev

   # in another terminal
   cd frontend
   pnpm dev
   ```
