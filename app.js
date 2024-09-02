const WALL = 1;
const TREE = 2;
const DESTINATION = 3;
const EMPTY = 0;
const BOX = 4;
const PLAYER = 5;


let currentLevelIndex = 0;
let gridStatic = levels[currentLevelIndex].gridStatic;
let gridDynamic = levels[currentLevelIndex].gridDynamic;
let playerPosition = { row: 0, col: 0 };

for (let row = 0; row < gridDynamic.length; row++) {
    for (let col = 0; col < gridDynamic[row].length; col++) {
        if (gridDynamic[row][col] === 5) { 
            playerPosition = { row, col };
        }
    }
}

function loadLevel(level) {
    let currentLevelIndex = level;
    let gridStatic = levels[currentLevelIndex].gridStatic;
    let gridDynamic = levels[currentLevelIndex].gridDynamic;
    let playerPosition = { row: 0, col: 0 };

    for (let row = 0; row < gridDynamic.length; row++) {
        for (let col = 0; col < gridDynamic[row].length; col++) {
            if (gridDynamic[row][col] === 5) { 
                playerPosition = { row, col };
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const gameContainer = document.getElementById('game-container');
    gameContainer.innerHTML = ''; // Clear the container in case of re-rendering

    // Render the grid based on the 2D array
    renderGrid();
});

document.addEventListener('keydown', (event) => {
    let direction;
    switch (event.key) {
        case 'ArrowUp':
            direction = 'up';
            break;
        case 'ArrowDown':
            direction = 'down';
            break;
        case 'ArrowLeft':
            direction = 'left';
            break;
        case 'ArrowRight':
            direction = 'right';
            break;
        default:
            return; // Ignore other keys
    }

    movePlayer(direction);
});

function movePlayer(direction) {
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
            gridDynamic[nextRow][nextCol] = BOX; // Move the box
            gridDynamic[newRow][newCol] = PLAYER; // Move the player
            gridDynamic[row][col] = EMPTY; // Clear the old player position
            playerPosition.row = newRow;
            playerPosition.col = newCol;
            renderGrid(); // Re-render the grid
        }
    }

    if (checkWinCondition()) {
        console.log("done.");
        loadLevel(currentLevelIndex+1);
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
