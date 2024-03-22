class Connect4 {
    constructor() {

        // Initialize game state
        this.rows = 6;
        this.cols = 7;
        this.board = this.createBoard();
        this.currentPlayer = 1;
        this.gameOver = false;
    }

    /**
     * Creates a 2D array representing the game board.
     */
    createBoard() {
        return Array.from({ length: this.rows }, () => Array(this.cols).fill(0));
    }

    /**
     * Adds a piece to the specified column.
     * @param {number} col - The column to add the piece to.
     */
    addPiece(col) {
        if (this.gameOver) return;

        for (let row = this.rows - 1; row >= 0; row--) {
            if (this.board[row][col] === 0) {
                this.board[row][col] = this.currentPlayer;
                const win = this.checkWin(row, col); // Check for win after each move
                if (!win) this.togglePlayer();
                return { row, col };
            }
        }
    }


    togglePlayer() {
        this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
        this.updateGameStatus();
    }

    checkWin(row, col) {
        const player = this.board[row][col];

        // Helper function to check direction
        const checkDirection = (deltaRow, deltaCol) => {
            let count = 0;
            let r = row + deltaRow;
            let c = col + deltaCol;

            while (r >= 0 && r < this.rows && c >= 0 && c < this.cols && this.board[r][c] === player) {
                count++;
                r += deltaRow;
                c += deltaCol;
            }

            return count;
        };

        // Check all directions
        const directions = [[1, 0], [0, 1], [1, 1], [1, -1]]; // vertical, horizontal, diagonal (both directions)
        for (let [deltaRow, deltaCol] of directions) {
            let count = 1;
            count += checkDirection(deltaRow, deltaCol);
            count += checkDirection(-deltaRow, -deltaCol);

            if (count >= 4) {
                this.gameOver = true;
                this.showVictoryMessage(this.currentPlayer); // Pass the current player
                return true;
            }
        }
        return false;
    }

    /**
     * Displays a victory message and resets the game.
     * @param {number} winningPlayer - The player number who won.
     */
    showVictoryMessage(winningPlayer) {
        const victoryMessage = document.createElement('div');
        victoryMessage.className = 'victory-message';
        victoryMessage.textContent = `Player ${winningPlayer} Wins! Victory!`;
        document.body.appendChild(victoryMessage);

        victoryMessage.addEventListener('animationend', () => {
            victoryMessage.remove();
            this.resetGame();
        });
    }

    /**
     * Resets the game to its initial state.
     */
    resetGame() {
        this.board = this.createBoard();
        this.currentPlayer = 1;
        this.gameOver = false;
        this.updateGameStatus();
        this.updateBoardView();
    }

    /**
     * Updates the display of the game status.
     */
    updateGameStatus() {
        const statusElement = document.getElementById("gameStatus");
        if (this.gameOver) {
            statusElement.textContent = `Player ${this.currentPlayer} wins!`;
        } else {
            statusElement.textContent = `Player ${this.currentPlayer}'s turn`;
        }
    }

    /**
     * Updates the visual representation of the board based on the game state.
     */
    updateBoardView() {
        const slots = document.querySelectorAll('#gameBoard .slot');
        slots.forEach((slot, index) => {
            const row = Math.floor(index / this.cols);
            const col = index % this.cols;
            const player = this.board[row][col];

            slot.className = 'slot'; // Reset the class name
            if (player === 1) {
                slot.classList.add('player1');
            } else if (player === 2) {
                slot.classList.add('player2');
            }
        });
    }

    
}

/**
 * Initializes and renders the game board in the DOM.
 */
function createBoardView() {
    const boardElement = document.getElementById('gameBoard');
    boardElement.innerHTML = '';
    for (let row = 0; row < game.rows; row++) {
        for (let col = 0; col < game.cols; col++) {
            const slot = document.createElement('div');
            slot.className = 'slot';
            slot.addEventListener('click', () => handleSlotClick(row, col));
            boardElement.appendChild(slot);
        }
    }
}

/**
 * Handles a click event on a slot.
 * @param {number} row - The row of the clicked slot.
 * @param {number} col - The column of the clicked slot.
 */
function handleSlotClick(row, col) {
    game.addPiece(col);
    game.updateBoardView();
    
    // Emit the new game state to the server
    const gameState = {
        board: game.board,
        currentPlayer: game.currentPlayer,
        gameOver: game.gameOver
    };
    socket.emit('gameStateChange', gameState);
}


const game = new Connect4();

// Main game initialization
document.addEventListener('DOMContentLoaded', () => {
    createBoardView();
    document.getElementById('resetButton').addEventListener('click', () => game.resetGame());
    game.updateGameStatus();
});

const socket = io(); // This connects to the server provided by your Node.js backend

function onGameStateChange(newState) {
    // Emit the new game state to the server
    socket.emit('gameStateChange', newState);
}


// Listen for game state updates from the server
socket.on('gameStateUpdate', (updatedState) => {
    // Update the local game state based on the server's update
    updateGameState(updatedState);
});

function updateGameState(newState) {
    // Update the board with the new state
    game.board = newState.board;

    // Update the current player
    game.currentPlayer = newState.currentPlayer;

    // Update the gameOver state
    game.gameOver = newState.gameOver;

    // Update the visual representation of the board and game status
    game.updateBoardView();
    game.updateGameStatus();

    // If the game is over, handle any post-game logic such as displaying the victory message
    if (game.gameOver) {
        game.showVictoryMessage(newState.winningPlayer);
    }
}


