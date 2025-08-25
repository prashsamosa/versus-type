# Fixing Schema and base frontend
- [x] Rip out participantsDetails JSON
- [x] Create match_participants table
- [x] Fix userSettings/userStats PKs/types/timestamps
- [x] Fix matches.status default. 
- [x] Drizzle migrations
- [x] Setup frontend base
- [x] sign in/up frontend pages

# Core Auth, Settings, Profile + Testing 
- [x] functional auth pages.
- [x] Auth state management, protected routes
- [x] GET Settings
- [x] GET Stats

- [x] Learn React query
- [x] Learn RQ with Nextjs
- [x] Settings page (Display Only)
- [x] Stats MVP

# Solo Typing Mode - Core Gameplay Loop 
- [x] setup shared types(and zod schemas) package
- [x] POST Settings
- [x] Working Settings page
- [x] Working Profile page
- [ ] text gen
- [ ] Figure out how to get passage
- [ ] Figure out starting match

- [ ] Solo game page: Monkeytype like text input
- [ ] Core UI Feedback
- [ ] match stuff API with edge cases
  - [ ] handle edge
- [ ] end game screen with stats

# WebSocket Foundation & Basic Multiplayer Lobby 

## BE Tasks - WebSocket Server & Learning
- [ ] Core: Integrate ws or socket.io. Basic connection/disconnection.
- [ ] LEARNING: Spend dedicated time understanding WebSocket concepts: messages, rooms/namespaces, broadcasting, server-side state management for connections. Authenticate WS connections.
- [ ] Nail Down WebSocket Auth Strategy
- [ ] Test with a simple client tool.

## BE Tasks - PvP Match Management API
- [ ] Endpoints POST /matches/pvp/create & POST /matches/pvp/join.
- [ ] Logic for adding users to match_participants for PvP.
- [ ] BE WebSockets: When players join/leave a lobby (via API), broadcast simple updates (e.g., "player joined/left", updated player list) to clients in the same match room/ID.

## FE Tasks - PvP Lobby UI & WebSocket Client
- [ ] Core: Pages for /pvp/create, /pvp/join, /pvp/lobby/:matchId.
- [ ] Core: UI to create/join.
- [ ] LEARNING & Core: Connect to WebSocket server from lobby page. Send/receive basic messages.
- [ ] Display players in the lobby by listening to WebSocket updates.
- [ ] "Start Game" button (triggers WS message or API call to change match status).

# Real-time PvP Gameplay - Initial Progress Sync 

## BE + FE - Progress Updates
- [ ] FE: Client sends basic progress updates via WebSocket (e.g., just character index or % complete).
- [ ] BE: WebSocket server receives progress, relays to other players in the room.
- [ ] FE: Client receives opponent progress, displays it simply (e.g., a basic progress bar).
- [ ] FOCUS: Getting the WebSocket communication pipe working reliably for this simple data.

## BE + FE - PvP Game End & Basic Results
- [ ] Simplified game end logic for PvP for now (e.g., first to finish, or host calls it).
- [ ] BE: Minimal update to match_participants and user_stats for PvP (e.g., just mark as played, maybe a win flag).
- [ ] FE: Basic display of "Game Over" and who won (if applicable).

## Testing & Polish
- [ ] Core: Manual end-to-end testing of the implemented features.
- [ ] Write more unit tests (BE & FE).
- [ ] Code cleanup, comments. Update README.
- [ ] Reflection: Checklist for Phase 2: POWERUPS LETS GOOO
