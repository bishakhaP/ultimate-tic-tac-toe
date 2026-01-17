const boardContainer = document.querySelector("#board-container");
let cells;
let turnO = true;
let boardWinners = Array(9).fill(null);


let winning_grid = [
    [0, 1, 2],
    [0, 3, 6],
    [0, 4, 8],
    [1, 4, 7],
    [2, 5, 8],
    [2, 4, 6],
    [3, 4, 5],
    [6, 7, 8],
];

window.onload = function () {
    setGame();
    setupEventListener();
}

let setGame = () => {
    for (let i = 0; i < 9; i++) {
        const largeGrid = document.createElement("div");
        largeGrid.classList.add("large-grid");
        largeGrid.dataset.gridIndex = i;

        for (let j = 0; j < 9; j++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            cell.dataset.cellIndex = j;
            largeGrid.appendChild(cell);
        }

        boardContainer.appendChild(largeGrid);
    }
    cells = document.querySelectorAll(".cell");
}

let setupEventListener = () => {
    cells.forEach((cell) => {
        cell.addEventListener("click", handleCellClick);
        cell.addEventListener("mouseover", hoverstart);
        cell.addEventListener("mouseout", hoverend);
    })
}

let hoverstart = (event) => {
    const cell = event.target;
    cell.classList.add("XorOhovered");
    if (turnO) {
        cell.innerText = "O";
    } else {
        cell.innerText = "X";
    }
}

let hoverend = (event) => {
    const cell = event.target;
    cell.classList.remove("XorOhovered");
    cell.innerText = "";
}

let allowedGridIndex = null;

// After a click in a cell checks if that grid is valid by allowedGridIndex and checks winner by calling all important functions.
let handleCellClick = (event) => {

    const cell = event.target;

    const grid = cell.closest(".large-grid");
    const gridIndex = grid.dataset.gridIndex;
    console.log(gridIndex);


    cell.classList.remove("XorOhovered")
    cell.removeEventListener("mouseover", hoverstart);
    cell.removeEventListener("mouseout", hoverend);

    if (allowedGridIndex !== null && gridIndex !== allowedGridIndex.toString()) {
        console.log(`You can only play in grid ${allowedGridIndex}`);
        return;
    }

    cell.innerText = turnO ? "O" : "X";
    cell.classList.add("XorO");
    cell.removeEventListener("click", handleCellClick);

    turnO = !turnO;

    const cellIndex = cell.dataset.cellIndex;
    allowedGridIndex = cellIndex;

    checkAllGrids();
    validateNextGrid();
    checkBoardWinner();

    const boardWinner = checkBoardWinner();
    if (boardWinner) {
        if (boardWinner === "Draw") {
            console.log("The game is a draw!");
        } else {
            console.log(`The winner is ${boardWinner}`);
        }
        endGame(boardWinner);
    }

}

// Used to check which grid will the player play in after a move. 
// Decides if allowedGridIndex is null meaning all the grid is open for next move or if allowedGridIndex has a index value where the player will play next.

const validateNextGrid = () => {
    const allLargeGrids = document.querySelectorAll(".large-grid");
    let gridPlayable = false;

    let targetGridCompleted = false;
    if (allowedGridIndex !== null) {
        if (boardWinners[allowedGridIndex] !== null) {
            targetGridCompleted = true;
        } else {
            const targetGrid = allLargeGrids[allowedGridIndex];
            const gridCells = targetGrid.querySelectorAll(".cell");
            const isGridFull = Array.from(gridCells).every((cell) => cell.innerText !== "");
            if (isGridFull) targetGridCompleted = true;
        }
    }

    if (targetGridCompleted) {
        allowedGridIndex = null;
    }

    allLargeGrids.forEach((grid, index) => {
        grid.classList.remove("highlight-grid");

        const isCompleted = boardWinners[index] !== null;

        if (!isCompleted && (allowedGridIndex === null || index === parseInt(allowedGridIndex))) {
            grid.classList.add("highlight-grid");
            grid.classList.remove("disabled-grid");
            gridPlayable = true;
        } else {
            grid.classList.add("disabled-grid");
        }
    });

};

// Used to highlight the allowedgrid which the player will play in rn.
const highlightAllowedGrid = () => {
    const allLargeGrids = document.querySelectorAll(".large-grid");
    allLargeGrids.forEach((grid) => {
        if (allowedGridIndex === null || grid.dataset.gridIndex === allowedGridIndex.toString()) {
            grid.classList.remove("disabled-grid");
        } else {
            grid.classList.add("disabled-grid");
        }
    });
};

// Used to check if a particular grid is won by checking each winning pattern of ttt and return either 'X', 'O', 'Draw'.
const checkGridWinner = (gridCells) => {
    for (let pattern of winning_grid) {
        const pos1 = gridCells[pattern[0]];
        const pos2 = gridCells[pattern[1]];
        const pos3 = gridCells[pattern[2]];

        if (!pos1 || !pos2 || !pos3) {
            continue;
        }

        if (pos1.innerText !== "" && pos1.innerText === pos2.innerText && pos2.innerText === pos3.innerText) {
            return pos1.innerText;
        }
    }
    return null;
};


// Used to update board winners and marking each grid with 'X', 'O', 'Draw'.
const checkAllGrids = () => {
    const allLargeGrids = document.querySelectorAll(".large-grid");

    allLargeGrids.forEach((grid, index) => {
        if (boardWinners[index] !== null) return;

        const gridCells = grid.querySelectorAll(".cell");
        const winner = checkGridWinner(gridCells);

        if (winner) {
            boardWinners[index] = winner;
            console.log(`Grid ${index} has a winner: ${winner}`);
            markGridWinner(grid, winner);
        } else {
            const isGridFull = Array.from(gridCells).every((cell) => cell.innerText !== "");
            if (isGridFull) {
                boardWinners[index] = "Draw";
                console.log(`Grid ${index} is a draw`);
                markGridWinner(grid, "Draw");
            }
        }
    });

    console.log("Updated boardWinners:", boardWinners);
};


// Used to finally mark a full grid by checking grid winner
const markGridWinner = (grid, winner) => {
    if (winner === "Draw") {
        grid.innerText = "Draw";
        grid.classList.add("draw-text");
    } else {
        grid.innerText = winner;
    }
    grid.classList.add("disabled-grid");
    grid.classList.add("disabled-style");
};

// Checks the whole board all the 9 grids to find winner or draw simply returns either winner or draw or null.
const checkBoardWinner = () => {
    console.log("Checking meta board with boardWinners:", boardWinners);

    for (let pattern of winning_grid) {
        const pos1 = boardWinners[pattern[0]];
        const pos2 = boardWinners[pattern[1]];
        const pos3 = boardWinners[pattern[2]];

        console.log(`Checking meta board pattern ${pattern}:`, pos1, pos2, pos3);

        if (pos1 && pos1 !== "Draw" && pos1 === pos2 && pos2 === pos3) {
            console.log(`The final winner is ${pos1}`);
            return pos1;
        }
    }

    const isDraw = boardWinners.every((winner) => winner !== null);
    if (isDraw) {
        console.log("The game is a draw!");
        return "Draw";
    }

    return null;
};


const endGame = (winner) => {
    const modal = document.getElementById("game-over-modal");
    const winnerText = document.getElementById("winner-text");

    if (winner === "Draw") {
        winnerText.innerText = "It's a Draw!";
    } else {
        winnerText.innerText = `${winner} Wins!`;
    }

    modal.classList.add("active");
};

const resetGame = () => {
    boardWinners.fill(null);
    turnO = true;
    allowedGridIndex = null;

    boardContainer.innerHTML = "";
    boardContainer.classList.remove("finalWins");
    boardContainer.innerText = "";

    setGame();
    setupEventListener();

    document.getElementById("game-over-modal").classList.remove("active");
};

document.getElementById("play-again-btn").addEventListener("click", resetGame);
document.getElementById("reset-game").addEventListener("click", resetGame);

const rulesModal = document.getElementById("rules-modal");
document.getElementById("rules-btn").addEventListener("click", () => {
    rulesModal.classList.add("active");
});
document.getElementById("close-rules-btn").addEventListener("click", () => {
    rulesModal.classList.remove("active");
});
rulesModal.addEventListener("click", (e) => {
    if (e.target === rulesModal) {
        rulesModal.classList.remove("active");
    }
});