// Directions: Up, Down, Left, Right
const DIRECTIONS = [
    { x: 0, y: -1 },
    { x: 0, y: 1 },
    { x: -1, y: 0 },
    { x: 1, y: 0 }
];

export const solveMazeBFS = (maze, start, end) => {
    const rows = maze.length;
    const cols = maze[0].length;
    const queue = [[start]]; // Queue of paths
    const visited = new Set();
    visited.add(`${start.x},${start.y}`);

    while (queue.length > 0) {
        const path = queue.shift();
        const { x, y } = path[path.length - 1]; // Current node

        if (x === end.x && y === end.y) {
            return path; // Found the path
        }

        for (const dir of DIRECTIONS) {
            const nx = x + dir.x;
            const ny = y + dir.y;
            const key = `${nx},${ny}`;

            if (
                nx >= 0 && nx < cols && 
                ny >= 0 && ny < rows && 
                maze[ny][nx] !== 1 && // Not a wall
                !visited.has(key)
            ) {
                visited.add(key);
                queue.push([...path, { x: nx, y: ny }]);
            }
        }
    }

    return []; // No path found
};
