import React, { useEffect, useRef, useState } from 'react';
import shanImg from '../utils/shan.png';

const MazeGrid = ({ maze, playerPos, solutionPath }) => {
  if (!maze || !maze.length) return <div className="text-white">Loading Maze...</div>;

  const containerRef = useRef(null);
  const [cellSize, setCellSize] = useState(25);

  useEffect(() => {
    const resize = () => {
      if (!containerRef.current) return;
      const cols = maze[0].length;
      const rows = maze.length;

      // Calculate available space with sensible margins
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // On mobile: leave space for HUD (~100px) and controls (~50px)
      // On desktop: use more of the screen
      const isMobile = viewportWidth < 640;
      const availableWidth = isMobile 
        ? Math.min(viewportWidth - 16, 600) 
        : Math.min(viewportWidth - 32, 900);
      const availableHeight = isMobile
        ? Math.min(viewportHeight - 200, 600)
        : Math.min(viewportHeight - 200, 800);

      const sizeX = Math.floor((availableWidth - 4) / cols);
      const sizeY = Math.floor((availableHeight - 4) / rows);

      // Clamp cell size: min 12px for playability, max 50px for visibility
      const size = Math.max(12, Math.min(50, Math.min(sizeX, sizeY)));
      setCellSize(size);
    };

    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [maze]);

  const cols = maze[0].length;

  return (
    <div className="flex flex-col items-center justify-center w-full" ref={containerRef}>
      <div
        className="grid gap-[1px] bg-gray-800 p-2 rounded-lg shadow-2xl overflow-auto"
        style={{
          gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
          maxWidth: '100%',
          maxHeight: '70vh',
          scrollBehavior: 'smooth'
        }}
      >
        {maze.map((row, y) => (
          row.map((cell, x) => {
            const isPlayer = playerPos.x === x && playerPos.y === y;
            const isPath = solutionPath?.some(p => p.x === x && p.y === y);

            // Determine cell color
            let bgClass = 'bg-gray-200'; // Path (0)
            if (cell === 1) bgClass = 'bg-gray-900'; // Wall
            if (cell === 2) bgClass = 'bg-green-400'; // Start
            if (cell === 3) bgClass = 'bg-blue-500'; // End

            if (isPath && !isPlayer && cell !== 2 && cell !== 3) {
              bgClass = 'bg-yellow-300 animate-pulse'; // Solution Path
            }

            const playerImgSize = Math.max(8, Math.floor(cellSize * 0.85));
            const fontSize = Math.max(6, Math.floor(cellSize * 0.25));

            return (
              <div
                key={`${x}-${y}`}
                className={`relative flex items-center justify-center transition-all duration-100 ${bgClass}`}
                style={{ width: `${cellSize}px`, height: `${cellSize}px` }}
              >
                {isPlayer && (
                  <div 
                    className="absolute z-20 flex items-center justify-center"
                    style={{ width: `${playerImgSize}px`, height: `${playerImgSize}px` }}
                  >
                    <img
                      src={shanImg}
                      alt="Player"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: '9999px',
                        border: `${cellSize > 16 ? '2px' : '1px'} solid white`,
                        boxShadow: '0 0 4px rgba(0,0,0,0.5)'
                      }}
                    />
                  </div>
                )}
                {cell === 3 && !isPlayer && (
                  <span 
                    className="text-white font-bold truncate"
                    style={{ fontSize: `${fontSize}px` }}
                  >
                    EXIT
                  </span>
                )}
                {cell === 2 && !isPlayer && (
                  <span
                    className="text-white font-bold"
                    style={{ fontSize: `${fontSize}px` }}
                  >
                    S
                  </span>
                )}
              </div>
            );
          })
        ))}
      </div>
    </div>
  );
};

export default MazeGrid;
