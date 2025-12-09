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

  const [isGameActive, setIsGameActive] = useState(false);

  // Initialize game
  useEffect(() => {
    // Wait for user to start
  }, []);

  // Timer Logic (single interval while playing)
  useEffect(() => {
    if (gameStatus !== 'playing' || !isGameActive) return;

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
  }, [gameStatus, isGameActive]);

  const startGameWrapper = (selectedLevel) => {
    setIsGameActive(true);
    startNewGame(selectedLevel);
  };

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
    if (gameStatus !== 'playing' || !isGameActive) return;
    const nextX = playerPos.x + dx;
    const nextY = playerPos.y + dy;
    if (isValidMove(nextX, nextY)) {
      setPlayerPos({ x: nextX, y: nextY });
      checkWin(nextX, nextY);
    }
  };

  const handleKeyDown = (e) => {
    if (!isGameActive) return;
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
    if (!isGameActive) return;
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
    if (gameStatus === 'playing' && isGameActive) {
      document.body.classList.remove('allow-scroll');
      document.body.style.top = '0';
    } else {
      document.body.classList.add('allow-scroll');
    }
    return () => {
      document.body.classList.remove('allow-scroll');
    };
  }, [gameStatus, isGameActive]);

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
    if (gameStatus !== 'playing' || !isGameActive) return;
    const path = solveMazeBFS(maze, playerPos, exitPos);
    setSolutionPath(path);
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playerPos, gameStatus, isGameActive]);

  // Start Screen Overlay
  if (!isGameActive) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Animated Background Effect */}
        <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,_rgba(59,130,246,0.3),transparent_70%)] animate-pulse"></div>
        </div>

        <div className="z-10 text-center max-w-md w-full bg-gray-800/50 backdrop-blur-xl p-8 rounded-2xl border border-gray-700 shadow-2xl transform transition-all hover:scale-105">
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 mb-6 drop-shadow-lg">
            Maze Master
          </h1>
          <p className="text-gray-300 mb-8 text-lg">Use your wits to escape before time runs out!</p>
          
          <div className="grid gap-4 mb-8">
             <div className="flex items-center justify-between text-gray-400 bg-gray-900/50 p-3 rounded-lg">
                <span className="flex items-center gap-2"><ArrowUp size={18} /> Move</span>
                <span className="font-mono text-sm">Arrows / WASD</span>
             </div>
             <div className="flex items-center justify-between text-gray-400 bg-gray-900/50 p-3 rounded-lg">
                <span className="flex items-center gap-2"><Lightbulb size={18} /> Hint</span>
                <span className="font-mono text-sm">H Key</span>
             </div>
          </div>

          <button 
            onClick={() => startGameWrapper(level)}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-xl text-xl shadow-lg shadow-blue-500/30 transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3"
          >
            Start Game <ArrowRight size={24} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-2 sm:p-4 w-full h-full relative"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header / HUD - Responsive Layout */}
      <div className="w-full max-w-5xl mb-2 sm:mb-4 flex-shrink-0">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
          {/* Title and Levels */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 hidden sm:block">Maze Runner</h1>
            <div className="flex gap-2">
              {Object.keys(LEVELS).map(lvl => (
                <button
                  key={lvl}
                  onClick={() => startNewGame(lvl)}
                  className={`px-3 py-1.5 text-xs sm:text-sm rounded-full border transition-all ${level === lvl ? 'bg-blue-600 border-blue-400 text-white shadow-md shadow-blue-500/20' : 'border-gray-600 text-gray-400 hover:border-gray-400'}`}
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
              className="p-2 sm:p-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-yellow-400 border border-gray-700 transition-all active:bg-gray-600 flex-shrink-0 shadow-lg"
            >
              <Lightbulb size={20} className="sm:w-6 sm:h-6" />
            </button>
            
            <button 
              onClick={() => startNewGame(level)}
              title="Restart (R)"
              className="p-2 sm:p-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-white border border-gray-700 transition-all active:bg-gray-600 flex-shrink-0 shadow-lg"
            >
              <RefreshCw size={20} className="sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Game Area - Responsive */}
      <div className="relative border-4 border-gray-800 rounded-xl overflow-hidden shadow-2xl w-full max-w-5xl flex-1 flex items-center justify-center min-h-0 bg-gray-950">
        <MazeGrid maze={maze} playerPos={playerPos} solutionPath={solutionPath} />
        
        {/* On-Screen Controls Overlay (Bottom Right or Centered on Mobile) */}
        <div className="absolute bottom-4 right-4 z-20 hidden md:block opacity-50 hover:opacity-100 transition-opacity">
            {/* Desktop hint regarding controls could go here, but avoiding clutter */}
        </div>
        
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

      {/* D-Pad Controls Section */}
      <div className="mt-6 w-full flex justify-center items-center gap-10">
        {/* Legend */}
        <div className="hidden sm:flex flex-wrap gap-4 text-gray-500 text-xs sm:text-sm justify-center">
            <span className="flex items-center gap-2"><div className="w-3 h-3 bg-gray-200 rounded-sm shadow-[0_0_10px_rgba(255,255,255,0.2)]"></div> Path</span>
            <span className="flex items-center gap-2"><div className="w-3 h-3 bg-gray-800 border border-gray-600 rounded-sm"></div> Wall</span>
            <span className="flex items-center gap-2"><div className="w-3 h-3 bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div> You</span>
            <span className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-500 rounded-sm shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div> Exit</span>
        </div>

        {/* Mobile/Touch Controls - Premium Look */}
        <div className="flex flex-col items-center gap-3 bg-gray-900/80 p-6 rounded-[2rem] border border-gray-700/50 shadow-2xl backdrop-blur-xl transform transition-transform hover:scale-105 duration-300">
            {/* Common Button Style */}
            {(() => {
                const btnStyle = "relative w-16 h-16 rounded-2xl bg-gradient-to-b from-gray-700 to-gray-800 border-t border-gray-600 shadow-[0_6px_0_0_rgba(0,0,0,0.4),0_10px_10px_rgba(0,0,0,0.3)] active:shadow-none active:translate-y-[6px] active:border-t-0 transition-all flex items-center justify-center group overflow-hidden";
                const glow = "absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/10 transition-colors duration-300";
                const iconStyle = "text-gray-300 group-hover:text-blue-400 group-active:text-blue-200 transition-colors transform group-active:scale-90";

                return (
                    <>
                        <button 
                            className={btnStyle}
                            onPointerDown={(e) => { e.preventDefault(); movePlayer(0, -1); }}
                            aria-label="Move Up"
                        >
                            <div className={glow}></div>
                            <ArrowUp size={32} className={iconStyle} strokeWidth={2.5} />
                        </button>
                        <div className="flex gap-3">
                            <button 
                                className={btnStyle}
                                onPointerDown={(e) => { e.preventDefault(); movePlayer(-1, 0); }}
                                aria-label="Move Left"
                            >
                                <div className={glow}></div>
                                <ArrowLeft size={32} className={iconStyle} strokeWidth={2.5} />
                            </button>
                            <button 
                                className={btnStyle}
                                onPointerDown={(e) => { e.preventDefault(); movePlayer(0, 1); }}
                                aria-label="Move Down"
                            >
                                <div className={glow}></div>
                                <ArrowDown size={32} className={iconStyle} strokeWidth={2.5} />
                            </button>
                            <button 
                                className={btnStyle}
                                onPointerDown={(e) => { e.preventDefault(); movePlayer(1, 0); }}
                                aria-label="Move Right"
                            >
                                <div className={glow}></div>
                                <ArrowRight size={32} className={iconStyle} strokeWidth={2.5} />
                            </button>
                        </div>
                    </>
                );
            })()}
        </div>
      </div>
    </div>
  );
}

export default App;
