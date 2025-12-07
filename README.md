# Maze Runner — Client-Side Application

A fast-paced maze navigation game built with **React + Vite** - no backend required! All maze generation and pathfinding logic runs directly in the browser.

## Features

✨ **No Backend Needed** - Fully client-side application
- Maze generation using recursive backtracking algorithm
- Real-time pathfinding using BFS
- Multiple difficulty levels (Easy, Medium, Hard)
- Countdown timer with win/lose conditions
- Beautiful UI with Tailwind CSS

## Project Structure

```
MazeGame/
├── client/
│   ├── src/
│   │   ├── App.jsx              # Main game component
## Maze Runner — Client-Side Application

Professional, compact README for the Maze Runner project. This repository runs entirely in the browser using React + Vite; there is no backend required.

**Highlights**
- Client-side maze generation (recursive backtracking)
- Shortest-path solving via BFS
- Three difficulty levels and an in-browser timer
- Lightweight UI with Tailwind CSS and Lucide icons

**Quick Start**

1. Install dependencies

```cmd
cd client
npm install
```

2. Start the development server

```cmd
npm start
```

Visit `http://localhost:5173` (Vite default) to play.

3. Build for production

```cmd
npm run build
```

The production output is written to `client/dist/` by default.

**Project Structure (relevant files)**

```
client/
├─ index.html
├─ package.json
├─ src/
│  ├─ main.jsx         # App bootstrap
│  ├─ App.jsx          # Main game UI and logic
│  ├─ index.css        # Tailwind + global styles
│  ├─ components/
│  │  └─ MazeGrid.jsx  # Maze rendering
│  └─ utils/
│     ├─ mazeGenerator.js  # Maze algorithm
│     └─ pathfinding.js    # BFS solver
```

**Controls**
- Move: Arrow keys or WASD
- Hint: `H` — shows shortest path from player to exit
- Restart: `R` or the on-screen restart button
- Difficulty: use the level buttons in the header

**Difficulty presets**

| Level  | Size   | Timer |
|--------|--------|-------|
| Easy   | 15×15  | 30s   |
| Medium | 25×25  | 45s   |
| Hard   | 35×25  | 60s   |

Notes on implementation
- Maze generation is done in-browser and produces a solvable "perfect" maze, then the start/end cells are marked.
- BFS is used for the hint/solver to return the shortest path.
- All game state (player position, timer, solution path) is stored in React state — no server interactions.

Maintenance & contribution
- If you intend to add server-side features (leaderboards, multiplayer), create a top-level `server/` service and add clear API contracts in this README.
- For pull requests, keep changes focused and include a short description of behavior changes.

Troubleshooting
- If the dev server fails to start because port is in use, try a different port:

```cmd
npm start -- --port 5174
```

or kill the process using the conflicting port (Windows example):

```cmd
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

License

MIT

----

If you'd like, I can also:
- run a linter and fix minor style issues
- add an ESLint / Prettier config
- produce a small CONTRIBUTING.md with contribution guidelines

Which of those would you like next?
