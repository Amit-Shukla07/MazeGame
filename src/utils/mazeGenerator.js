// Directions: Up, Down, Left, Right
const DIRECTIONS = [
    { x: 0, y: -2 }, // Up
    { x: 0, y: 2 },  // Down
    { x: -2, y: 0 }, // Left
    { x: 2, y: 0 }   // Right
];

export const generateMaze = (width, height) => {
    // 1. Initialize Grid with Walls (1)
    // Ensure odd dimensions for the algorithm to work with "walls" between "cells"
    const rows = height % 2 === 0 ? height + 1 : height;
    const cols = width % 2 === 0 ? width + 1 : width;
    
    let maze = Array(rows).fill().map(() => Array(cols).fill(1));

    // 2. Recursive Backtracker
    const stack = [];
    // Start at (1,1) to have a border
    const startX = 1;
    const startY = 1;
    
    maze[startY][startX] = 0; // Mark start as empty
    stack.push({ x: startX, y: startY });

    while (stack.length > 0) {
        const current = stack[stack.length - 1]; // Peak
        const { x, y } = current;

        // Find unvisited neighbors
        const neighbors = [];
        for (const dir of DIRECTIONS) {
            const nx = x + dir.x;
            const ny = y + dir.y;

            if (nx > 0 && nx < cols - 1 && ny > 0 && ny < rows - 1 && maze[ny][nx] === 1) {
                neighbors.push({ nx, ny, dir });
            }
        }

        if (neighbors.length > 0) {
            // Choose random neighbor
            const { nx, ny, dir } = neighbors[Math.floor(Math.random() * neighbors.length)];
            
            // Carve path (propagate to neighbor + remove wall in between)
            maze[ny][nx] = 0;
            maze[y + dir.y / 2][x + dir.x / 2] = 0;

            stack.push({ x: nx, y: ny });
        } else {
            // Backtrack
            stack.pop();
        }
    }

    // 3. Set Start and End
    // Let's set Start at Top-Left inner cell
    maze[1][1] = 2; // Start

    // 4. Create multiple paths from start (User Request)
    // Clear neighbors of (1,1) to ensure immediate branching
    if (cols > 2) maze[1][2] = 0;
    if (rows > 2) maze[2][1] = 0;
    if (rows > 2 && cols > 2) maze[2][2] = 0; // Open diagonal for a "room" feel
    
    // Add some random loops/shortcuts to create more "paths" early on
    // Randomly remove some walls near the top-left quadrant
    for(let y = 1; y < Math.min(rows, 10); y++) {
        for(let x = 1; x < Math.min(cols, 10); x++) {
             if (maze[y][x] === 1 && Math.random() < 0.3) {
                 // Check if it doesn't open borders (simple check: keep strict bounds)
                 if (x > 1 && x < cols - 2 && y > 1 && y < rows - 2) {
                     maze[y][x] = 0;
                 }
             }
        }
    }

    // End at Bottom-Right inner cell
    // Find a valid empty cell near bottom-right
    let endX = cols - 2;
    let endY = rows - 2;
    while(maze[endY][endX] === 1) {
       // Search backwards if stuck (simple fallback)
       endX--;
    }
    maze[endY][endX] = 3; // End

    return maze;
};
