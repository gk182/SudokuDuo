# Sudoku Duo - Dark Theme Starter (MERN + Socket.IO)

Features:
- Two-player realtime Sudoku synchronized for both players (simultaneous view)
- Dark theme UI (Vite + React)
- Server restructured for easier maintenance (services + sockets + controllers)
- Rule: 3 wrong moves by a player -> that player loses and game ends
- Simple preset-based puzzle generator (MVP) — can be replaced by unique-solution generator later

Quick start:
1. Unzip and open two terminals.
2. Server:
   cd server
   cp .env.example .env
   npm install
   npm run dev
3. Client:
   cd client
   npm install
   npm run dev

Server runs at http://localhost:4000, Client at http://localhost:5173 by default.
