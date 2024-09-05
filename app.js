const WALL = 1;
const TREE = 2;
const DESTINATION = 3;
const EMPTY = 0;
const BOX = 4;
const PLAYER = 5;

MOVABLE = true;

let currentLevelIndex = 0;
let gridStatic = [];
let gridDynamic = [];
let playerPosition = { row: 0, col: 0 };
let levelSolution = null

let moveMemory = []

for (let row = 0; row < levels[currentLevelIndex].gridStatic.length; row++) {
    gridStatic.push([]);
    gridDynamic.push([]);
    for (let col = 0; col < levels[currentLevelIndex].gridStatic[row].length; col++) {
        gridStatic[row].push(levels[currentLevelIndex].gridStatic[row][col]);
        gridDynamic[row].push(levels[currentLevelIndex].gridDynamic[row][col]);
        if (levels[currentLevelIndex].gridDynamic[row][col] === 5) { 
            playerPosition = { row, col };
        }
    }
}
levelSolution = levels[currentLevelIndex].solutionMoves || null;

function loadLevel(level) {
    currentLevelIndex = (level+15) % 15;
    gridStatic = [];
    gridDynamic = [];
    playerPosition = { row: 0, col: 0 };
    levelSolution = null

    for (let row = 0; row < levels[currentLevelIndex].gridStatic.length; row++) {
        gridStatic.push([]);
        gridDynamic.push([]);
        for (let col = 0; col < levels[currentLevelIndex].gridStatic[row].length; col++) {
            gridStatic[row].push(levels[currentLevelIndex].gridStatic[row][col]);
            gridDynamic[row].push(levels[currentLevelIndex].gridDynamic[row][col]);
            if (levels[currentLevelIndex].gridDynamic[row][col] === 5) { 
                playerPosition = { row, col };
            }
        }
    }
    levelSolution = levels[currentLevelIndex].solutionMoves || null;
    moveMemory = []

    document.getElementById('current-level').textContent = currentLevelIndex + 1;
    document.getElementById('level-solution').textContent = null;
    renderGrid();
    MOVABLE = true;
}

function playSolution(moves) {
    MOVABLE = false;
    if (moves.length === 0) {
        MOVABLE = true;
        return;
    } 

    let move = moves.shift();
    movePlayer(move, true);
    setTimeout(() => playSolution(moves), 250);
}


document.addEventListener('DOMContentLoaded', () => {
    const gameContainer = document.getElementById('game-container');
    gameContainer.innerHTML = '';

    document.getElementById('prev-level').addEventListener('click', () => {
        if (MOVABLE)
            loadLevel(currentLevelIndex - 1); // Go to the previous level
    });

    document.getElementById('next-level').addEventListener('click', () => {
        if (MOVABLE)
            loadLevel(currentLevelIndex + 1); // Go to the next level
    });

    document.getElementById('show-solution').addEventListener('click', () => {
        if (MOVABLE) {
            let solutionMoves = levelSolution.slice();
            if (solutionMoves) {
                // console.log("Solution found:", solutionMoves);
                let formattedMoves = solutionMoves
                .map((move, index) => (index + 1) % 10 === 0 ? move + '\n' : move)
                .join(' ');
                document.getElementById('level-solution').textContent = "Solution: \n " + formattedMoves;
                setTimeout( () => {
                    playSolution(solutionMoves);
                }, 500);
            } else {
                // console.log("No solution found.");
                document.getElementById('level-solution').textContent = "No solution found.";
            }
        }
    });

    document.getElementById('undo-move').addEventListener('click', () => {
        if (MOVABLE)
            undoMove();
    });

    document.getElementById('move-up').addEventListener('click', () => {
        movePlayer('up');
    });
    
    document.getElementById('move-down').addEventListener('click', () => {
        movePlayer('down');
    });
    
    document.getElementById('move-left').addEventListener('click', () => {
        movePlayer('left');
    });
    
    document.getElementById('move-right').addEventListener('click', () => {
        movePlayer('right');
    });    

    // Render the grid based on the 2D array
    renderGrid();
});

document.addEventListener('keydown', (event) => {
    if (MOVABLE) {
        if (event.key == 'ArrowUp' || event.key.toLowerCase() == 'w') {
            movePlayer('up');
        } else if (event.key == 'ArrowDown' || event.key.toLowerCase() == 's') {
            movePlayer('down');
        } else if (event.key == 'ArrowLeft' || event.key.toLowerCase() == 'a') {
            movePlayer('left');
        } else if (event.key == 'ArrowRight' || event.key.toLowerCase() == 'd') {
            movePlayer('right');
        } else if (event.key.toLowerCase() == 'q') {
            loadLevel(currentLevelIndex - 1);
        } else if (event.key.toLowerCase() == 'e') {
            loadLevel(currentLevelIndex + 1);
        }
    }
});

function undoMove() {
    if (moveMemory.length > 0) {
        const previousState = moveMemory.pop();
        playerPosition = previousState.playerPos;
        gridDynamic = previousState.gridDynamic;
        renderGrid();
    }
}

function recordState() {
    const state = {
        playerPos: { ...playerPosition },
        gridDynamic: JSON.parse(JSON.stringify(gridDynamic)) 
    };
    moveMemory.push(state);
}

function movePlayer(direction, automatic = false) {
    if (MOVABLE == false && !automatic) return;
    if (!automatic && checkWinCondition()) {
        loadLevel(currentLevelIndex+1);
        return;
    }

    let { row, col } = playerPosition;
    let newRow = row;
    let newCol = col;

    // Determine new player position
    switch (direction) {
        case 'up':
            newRow--;
            break;
        case 'down':
            newRow++;
            break;
        case 'left':
            newCol--;
            break;
        case 'right':
            newCol++;
            break;
    }

    // Check the type of cell in the new position
    const targetCell = gridDynamic[newRow][newCol];
    const targetStaticCell = gridStatic[newRow][newCol];

    if (targetCell === EMPTY && targetStaticCell !== WALL && targetStaticCell !== TREE) {
        // If it's an empty space or destination, move the player
        gridDynamic[row][col] = EMPTY; // Clear the old player position
        playerPosition.row = newRow;
        playerPosition.col = newCol;
        gridDynamic[newRow][newCol] = PLAYER; // Update the new player position
        renderGrid(); // Re-render the grid

    } else if (targetCell === BOX) {
        // If the player is moving into a box, check if the box can be pushed
        const nextRow = newRow + (newRow - row);
        const nextCol = newCol + (newCol - col);
        const nextCell = gridDynamic[nextRow][nextCol];
        const nextStaticCell = gridStatic[nextRow][nextCol];

        if (nextCell === EMPTY && nextStaticCell !== WALL && nextStaticCell !== TREE) {
            // If the next cell is empty or a destination, push the box
            recordState();
            gridDynamic[nextRow][nextCol] = BOX; // Move the box
            gridDynamic[newRow][newCol] = PLAYER; // Move the player
            gridDynamic[row][col] = EMPTY; // Clear the old player position
            playerPosition.row = newRow;
            playerPosition.col = newCol;
            renderGrid(); // Re-render the grid
            // console.log(moveMemory);
        }
    }
}


function renderGrid() {
    const gameContainer = document.getElementById('game-container');
    gameContainer.innerHTML = ''; // Clear the grid

    for (let row = 0; row < gridStatic.length; row++) {
        for (let col = 0; col < gridStatic[row].length; col++) {
            const cell = document.createElement('div');
            cell.className = 'cell';

            // Render the static layer
            switch (gridStatic[row][col]) {
                case TREE:
                    cell.classList.add('tree');
                    break;
                case WALL:
                    cell.classList.add('wall');
                    break;
                case DESTINATION:
                    cell.classList.add('destination');
                    break;
                default:
                    cell.classList.add('empty'); // Render empty space for all other cases
                    break;
            }

            // Render the dynamic layer on top
            switch (gridDynamic[row][col]) {
                case BOX:
                    cell.classList.add('box');
                    break;
                case PLAYER:
                    cell.classList.add('player');
                    break;
            }

            gameContainer.appendChild(cell);
        }
    }
}

function checkWinCondition() {
    for (let row = 0; row < gridStatic.length; row++) {
        for (let col = 0; col < gridStatic[row].length; col++) {
            if (gridStatic[row][col] === DESTINATION && gridDynamic[row][col] !== BOX) {
                return false; // Not all destinations have boxes
            }
        }
    }
    return true; // All destinations have boxes
}


// Automating

function getStateHash(gridDynamic) {
    // Convert the dynamic grid to a unique hash to identify the state
    return gridDynamic.flat().join(',');
}

function findSolution() {
    // console.log("calculating solution...");
    let initialGrid = JSON.parse(JSON.stringify(gridDynamic)); // Clone the initial grid
    let queue = [{ grid: initialGrid, playerPosition, moves: [] }];
    let visited = new Set();

    while (queue.length > 0) {
        let currentNode = queue.shift();
        let { grid, playerPosition, moves } = currentNode;

        let stateHash = getStateHash(grid);
        if (visited.has(stateHash)) continue; // Skip if already visited
        visited.add(stateHash);

        if (isDeadlock(grid)) continue;

        if (isSolved(grid)) {
            return moves; // Solution found
        }

        // Explore all possible moves
        for (let direction of ['up', 'down', 'left', 'right']) {
            let newGrid = JSON.parse(JSON.stringify(grid)); // Clone current grid
            let newPlayerPosition = { ...playerPosition };

            if (makeMove(newGrid, newPlayerPosition, direction)) {
                queue.push({
                    grid: newGrid,
                    playerPosition: newPlayerPosition,
                    moves: moves.concat(direction)
                });
            }
        }
        // if (queue.length % 10 == 0) console.log(queue.length);
    }

    return null; // No solution found
}

function makeMove(grid, playerPosition, direction) {
    let { row, col } = playerPosition;
    let newRow = row;
    let newCol = col;

    // Determine the new position based on the direction
    switch (direction) {
        case 'up':
            newRow--;
            break;
        case 'down':
            newRow++;
            break;
        case 'left':
            newCol--;
            break;
        case 'right':
            newCol++;
            break;
    }

    const targetCell = grid[newRow][newCol];
    const targetStaticCell = gridStatic[newRow][newCol];

    if (targetCell === EMPTY && targetStaticCell !== WALL && targetStaticCell !== TREE) {
        // If the target cell is empty or a destination, move the player
        grid[row][col] = EMPTY; // Clear the old player position
        grid[newRow][newCol] = PLAYER; // Update the new player position
        playerPosition.row = newRow;
        playerPosition.col = newCol;
        return true;

    } else if (targetCell === BOX) {
        // If the target cell is a box, check if the box can be pushed
        const nextRow = newRow + (newRow - row);
        const nextCol = newCol + (newCol - col);
        const nextCell = grid[nextRow][nextCol];
        const nextStaticCell = gridStatic[nextRow][nextCol];

        if (nextCell === EMPTY && nextStaticCell !== WALL && nextStaticCell !== TREE) {
            // Push the box
            grid[nextRow][nextCol] = BOX;
            grid[newRow][newCol] = PLAYER; // Move the player
            grid[row][col] = EMPTY; // Clear the old player position
            playerPosition.row = newRow;
            playerPosition.col = newCol;
            return true;
        }
    }

    return false; // Move is not possible
}

function isSolved(grid) {
    for (let row = 0; row < grid.length; row++) {
        for (let col = 0; col < grid[row].length; col++) {
            // If there is a destination that doesn't have a box, the level is not solved
            if (gridStatic[row][col] === DESTINATION && grid[row][col] !== BOX) {
                return false;
            }
        }
    }
    return true; // All destinations have boxes
}

function isDeadlock(grid) {
    // Check for corner deadlocks
    for (let row = 0; row < gridStatic.length; row++) {
        for (let col = 0; col < gridStatic[row].length; col++) {
            if (grid[row][col] === BOX) {
                // Check if the box is in a corner
                if (isCornerDeadlock(row, col)) {
                    return true; // Deadlock detected
                }
            }
        }
    }
    return false; // No deadlock detected
}

function isCornerDeadlock(row, col) {
    const isWallOrTree = (r, c) =>
        gridStatic[r][c] === WALL || gridStatic[r][c] === TREE;

    // Check all four corners around the box
    if (
        isWallOrTree(row - 1, col) && isWallOrTree(row, col - 1) && // Top-left corner
        gridStatic[row][col] !== DESTINATION
    ) return true;

    if (
        isWallOrTree(row - 1, col) && isWallOrTree(row, col + 1) && // Top-right corner
        gridStatic[row][col] !== DESTINATION
    ) return true;

    if (
        isWallOrTree(row + 1, col) && isWallOrTree(row, col - 1) && // Bottom-left corner
        gridStatic[row][col] !== DESTINATION
    ) return true;

    if (
        isWallOrTree(row + 1, col) && isWallOrTree(row, col + 1) && // Bottom-right corner
        gridStatic[row][col] !== DESTINATION
    ) return true;

    return false; // Not a corner deadlock
}