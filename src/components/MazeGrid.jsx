import shanImg from '../utils/shan.png';

const MazeGrid = ({ maze, playerPos, solutionPath }) => {
  if (!maze || !maze.length) return <div className="text-white">Loading Maze...</div>;
  
  return (
    <div className="flex flex-col items-center justify-center">
      <div 
        className="grid gap-[1px] bg-gray-800 p-2 rounded-lg shadow-2xl"
        style={{
          gridTemplateColumns: `repeat(${maze[0]?.length || 0}, 25px)`
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

            return (
              <div
                key={`${x}-${y}`}
                className={`w-[25px] h-[25px] relative flex items-center justify-center transition-all duration-100 ${bgClass}`}
              >
                {isPlayer && (
                  <div className="absolute z-20 w-[35px] h-[35px] flex items-center justify-center">
                    <img 
                        src={shanImg} 
                        alt="Player" 
                        className="w-full h-full object-cover rounded-full border-2 border-white shadow-lg shadow-black/50" 
                    />
                  </div>
                )}
                {cell === 3 && !isPlayer && (
                    <span className="text-white font-bold text-[8px]">EXIT</span>
                )}
                 {cell === 2 && !isPlayer && (
                    <span className="text-white font-bold text-[8px]">S</span>
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
