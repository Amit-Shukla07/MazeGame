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

  const movePlayer = (dx, dy) => {
    if (gameStatus !== 'playing') return;
    const nextX = playerPos.x + dx;
    const nextY = playerPos.y + dy;
    if (isValidMove(nextX, nextY)) {
      setPlayerPos({ x: nextX, y: nextY });
      checkWin(nextX, nextY);
    }
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

    if (['ArrowUp', 'w', 'W'].includes(key)) movePlayer(0, -1);
    if (['ArrowDown', 's', 'S'].includes(key)) movePlayer(0, 1);
    if (['ArrowLeft', 'a', 'A'].includes(key)) movePlayer(-1, 0);
    if (['ArrowRight', 'd', 'D'].includes(key)) movePlayer(1, 0);
  };

  // Touch swipe controls for mobile
  const touchStartRef = useRef({ x: 0, y: 0 });

  const handleTouchStart = (e) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    };
  };

  const handleTouchEnd = (e) => {
    const deltaX = e.changedTouches[0].clientX - touchStartRef.current.x;
    const deltaY = e.changedTouches[0].clientY - touchStartRef.current.y;
    const minSwipeDistance = 30;

    if (Math.abs(deltaX) < minSwipeDistance && Math.abs(deltaY) < minSwipeDistance) return;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe
      if (deltaX > 0) movePlayer(-1, 0); // Left
      else movePlayer(1, 0); // Right
    } else {
      // Vertical swipe
      if (deltaY > 0) movePlayer(0, -1); // Up
      else movePlayer(0, 1); // Down
    }
  };

  // Lock viewport when playing to prevent mobile screen jump
  useEffect(() => {
    if (gameStatus === 'playing') {
      document.body.classList.remove('allow-scroll');
      document.body.style.top = '0';
    } else {
      document.body.classList.add('allow-scroll');
    }
    return () => {
      document.body.classList.remove('allow-scroll');
    };
  }, [gameStatus]);

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
    <div 
      className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-2 sm:p-4 w-full h-full"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header / HUD - Responsive Layout */}
      <div className="w-full max-w-5xl mb-2 sm:mb-4 flex-shrink-0">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
          {/* Title and Levels */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Maze Runner</h1>
            <div className="flex gap-2">
              {Object.keys(LEVELS).map(lvl => (
                <button
                  key={lvl}
                  onClick={() => startNewGame(lvl)}
                  className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-full border transition-all ${level === lvl ? 'bg-blue-600 border-blue-400 text-white' : 'border-gray-600 text-gray-400 hover:border-gray-400'}`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Timer and Controls */}
          <div className="flex items-center gap-3 sm:gap-6 w-full sm:w-auto">
            <div className="text-center flex-1 sm:flex-none">
              <div className="text-gray-400 text-xs uppercase tracking-wider">Time Left</div>
              <div className={`text-2xl sm:text-3xl font-mono font-bold ${timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                {timeLeft}s
              </div>
            </div>

            <button 
              onClick={handleSolve}
              title="Hint (H)"
              className="p-2 sm:p-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-yellow-400 border border-gray-700 transition-all active:bg-gray-600 flex-shrink-0"
            >
              <Lightbulb size={20} className="sm:w-6 sm:h-6" />
            </button>
            
            <button 
              onClick={() => startNewGame(level)}
              title="Restart (R)"
              className="p-2 sm:p-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-white border border-gray-700 transition-all active:bg-gray-600 flex-shrink-0"
            >
              <RefreshCw size={20} className="sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Game Area - Responsive */}
      <div className="relative border-2 sm:border-4 border-gray-800 rounded-lg sm:rounded-xl overflow-hidden shadow-2xl w-full max-w-5xl flex-1 flex items-center justify-center min-h-0">
        <MazeGrid maze={maze} playerPos={playerPos} solutionPath={solutionPath} />
        
        {/* Overlays */}
        {gameStatus === 'won' && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="text-center animate-bounce">
              <Trophy className="w-16 sm:w-24 h-16 sm:h-24 text-yellow-400 mx-auto mb-3 sm:mb-4" />
              <h2 className="text-2xl sm:text-4xl font-bold text-white mb-2">You Escaped!</h2>
              <p className="text-gray-300 mb-4 sm:mb-6 text-sm sm:text-base">Time remaining: {timeLeft}s</p>
              <button 
                onClick={() => startNewGame(level)}
                className="px-6 sm:px-8 py-2 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full transition-colors shadow-lg shadow-blue-500/30 text-sm sm:text-base"
              >
                Play Again
              </button>
            </div>
          </div>
        )}

        {gameStatus === 'lost' && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
            <div className="text-center">
              <AlertTriangle className="w-16 sm:w-24 h-16 sm:h-24 text-red-500 mx-auto mb-3 sm:mb-4 animate-pulse" />
              <h2 className="text-2xl sm:text-4xl font-bold text-white mb-2">Game Over</h2>
              <p className="text-gray-400 mb-4 sm:mb-6 text-sm sm:text-base">You ran out of time!</p>
              <button 
                onClick={() => startNewGame(level)}
                className="px-6 sm:px-8 py-2 sm:py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-full transition-colors shadow-lg shadow-red-500/30 text-sm sm:text-base"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Legend - Responsive */}
      <div className="mt-2 sm:mt-6 flex flex-wrap gap-3 sm:gap-8 text-gray-500 text-xs sm:text-sm justify-center px-2 flex-shrink-0">
        <span className="flex items-center gap-2"><div className="w-3 h-3 sm:w-4 sm:h-4 bg-gray-200 rounded-sm"></div> Path</span>
        <span className="flex items-center gap-2"><div className="w-3 h-3 sm:w-4 sm:h-4 bg-gray-900 border border-gray-700 rounded-sm"></div> Wall</span>
        <span className="flex items-center gap-2"><div className="w-3 h-3 sm:w-4 sm:h-4 bg-red-600 rounded-full"></div> You</span>
        <span className="flex items-center gap-2"><div className="w-3 h-3 sm:w-4 sm:h-4 bg-blue-500 rounded-sm"></div> Exit</span>
      </div>

      {/* Mobile Controls Info */}
      <div className="mt-2 sm:hidden text-gray-400 text-xs text-center px-2 flex-shrink-0">
        <p>Swipe to move • Tap hint (💡) & restart (↻) buttons</p>
      </div>
      
      {/* Desktop Controls Info */}
      <div className="mt-2 hidden sm:block text-gray-400 text-xs text-center flex-shrink-0">
        <p>Use Arrow/WASD to move • Press H for hint • Press R to restart</p>
      </div>
    </div>
  );
}

export default App;
