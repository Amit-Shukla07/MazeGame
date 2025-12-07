import React, { useState, useEffect, useRef } from 'react';
import MazeGrid from './components/MazeGrid';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Trophy, AlertTriangle, Lightbulb, RefreshCw } from 'lucide-react';
import { generateMaze } from './utils/mazeGenerator';
import { solveMazeBFS } from './utils/pathfinding';

const LEVELS = {
  Easy: { width: 15, height: 15, time: 30 },
  Medium: { width: 25, height: 25, time: 45 },
  Hard: { width: 35, height: 25, time: 60 },
};

function App() {
  const [level, setLevel] = useState('Hard');
  const [maze, setMaze] = useState([]);
  const [playerPos, setPlayerPos] = useState({ x: 0, y: 0 });
  const [exitPos, setExitPos] = useState({ x: 0, y: 0 });
  const [gameStatus, setGameStatus] = useState('playing'); // playing, won, lost
  const [timeLeft, setTimeLeft] = useState(LEVELS['Medium'].time);
  const [solutionPath, setSolutionPath] = useState([]);
  
  const timerRef = useRef(null);

  // Initialize game
  useEffect(() => {
    startNewGame('Hard');
  }, []);

  // Timer Logic (single interval while playing)
  useEffect(() => {
    if (gameStatus !== 'playing') return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setGameStatus('lost');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [gameStatus]);

  const startNewGame = (selectedLevel = level) => {
    clearInterval(timerRef.current);
    setLevel(selectedLevel);
    const config = LEVELS[selectedLevel];
    
    // Generate Maze
    const newMaze = generateMaze(config.width, config.height);
    setMaze(newMaze);
    
    // Find Start (2) and End (3)
    let start = { x: 0, y: 0 };
    let end = { x: 0, y: 0 };
    
    newMaze.forEach((row, y) => {
        row.forEach((cell, x) => {
            if (cell === 2) start = { x, y };
            if (cell === 3) end = { x, y };
        });
    });

    setPlayerPos(start);
    setExitPos(end);
    setGameStatus('playing');
    setTimeLeft(config.time);
    setSolutionPath([]);
  };

  const handleKeyDown = (e) => {
    const { key } = e;

    const movementKeys = new Set(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','W','a','A','s','S','d','D']);
    const hintKeys = new Set(['h','H']);
    const restartKeys = new Set(['r','R']);

    // Prevent page from scrolling when using movement/hint/restart keys
    if (movementKeys.has(key) || hintKeys.has(key) || restartKeys.has(key)) {
      e.preventDefault();
    }

    // Restart
    if (restartKeys.has(key)) {
      startNewGame(level);
      return;
    }

    // Hint
    if (hintKeys.has(key)) {
      handleSolve();
      return;
    }

    // Movement only when playing
    if (gameStatus !== 'playing') return;

    let nextX = playerPos.x;
    let nextY = playerPos.y;

    if (['ArrowUp', 'w', 'W'].includes(key)) nextY--;
    if (['ArrowDown', 's', 'S'].includes(key)) nextY++;
    if (['ArrowLeft', 'a', 'A'].includes(key)) nextX--;
    if (['ArrowRight', 'd', 'D'].includes(key)) nextX++;

    if (isValidMove(nextX, nextY)) {
      setPlayerPos({ x: nextX, y: nextY });
      checkWin(nextX, nextY);
    }
  };

  const isValidMove = (x, y) => {
    if (!maze.length) return false;
    if (x < 0 || x >= maze[0].length || y < 0 || y >= maze.length) return false;
    if (maze[y][x] === 1) return false;
    return true;
  };

  const checkWin = (x, y) => {
    if (maze[y][x] === 3) {
      setGameStatus('won');
      clearInterval(timerRef.current);
    }
  };

  const handleSolve = () => {
    if (gameStatus !== 'playing') return;
    const path = solveMazeBFS(maze, playerPos, exitPos);
    setSolutionPath(path);
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playerPos, gameStatus]);

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      {/* Header / HUD */}
      <div className="w-full max-w-4xl flex justify-between items-center mb-4 px-4">
        <div>
           <h1 className="text-3xl font-bold text-white neon-text mb-1">Maze Runner</h1>
           <div className="flex gap-2">
             {Object.keys(LEVELS).map(lvl => (
               <button
                 key={lvl}
                 onClick={() => startNewGame(lvl)}
                 className={`px-3 py-1 text-xs rounded-full border transition-all ${level === lvl ? 'bg-blue-600 border-blue-400 text-white' : 'border-gray-600 text-gray-400 hover:border-gray-400'}`}
               >
                 {lvl}
               </button>
             ))}
           </div>
        </div>

        <div className="flex items-center gap-6">
           <div className="text-center">
             <div className="text-gray-400 text-xs uppercase tracking-wider">Time Left</div>
             <div className={`text-3xl font-mono font-bold ${timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
               {timeLeft}s
             </div>
           </div>
           
            <button 
                onClick={handleSolve}
                title="Show shortest path"
                className="p-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-yellow-400 border border-gray-700 transition-all"
            >
                <Lightbulb size={24} />
            </button>
             <button 
                onClick={() => startNewGame(level)}
                title="Restart"
                className="p-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-white border border-gray-700 transition-all"
            >
                <RefreshCw size={24} />
            </button>
        </div>
      </div>
      
      {/* Game Area */}
      <div className="relative border-4 border-gray-800 rounded-xl overflow-hidden shadow-2xl">
        <MazeGrid maze={maze} playerPos={playerPos} solutionPath={solutionPath} />
        
        {/* Overlays */}
        {gameStatus === 'won' && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="text-center animate-bounce">
              <Trophy className="w-24 h-24 text-yellow-400 mx-auto mb-4" />
              <h2 className="text-4xl font-bold text-white mb-2">You Escaped!</h2>
              <p className="text-gray-300 mb-6">Time remaining: {timeLeft}s</p>
              <button 
                onClick={() => startNewGame(level)}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full transition-colors shadow-lg shadow-blue-500/30"
              >
                Play Again
              </button>
            </div>
          </div>
        )}

        {gameStatus === 'lost' && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/90 backdrop-blur-sm">
            <div className="text-center">
              <AlertTriangle className="w-24 h-24 text-red-500 mx-auto mb-4 animate-pulse" />
              <h2 className="text-4xl font-bold text-white mb-2">Game Over</h2>
              <p className="text-gray-400 mb-6">You ran out of time!</p>
              <button 
                onClick={() => startNewGame(level)}
                className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-full transition-colors shadow-lg shadow-red-500/30"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 flex gap-8 text-gray-500 text-sm">
        <span className="flex items-center gap-2"><div className="w-4 h-4 bg-gray-200 rounded-sm"></div> Path</span>
        <span className="flex items-center gap-2"><div className="w-4 h-4 bg-gray-900 border border-gray-700 rounded-sm"></div> Wall</span>
        <span className="flex items-center gap-2"><div className="w-4 h-4 bg-red-600 rounded-full"></div> You</span>
        <span className="flex items-center gap-2"><div className="w-4 h-4 bg-blue-500 rounded-sm"></div> Exit</span>
      </div>
    </div>
  );
}

export default App;
