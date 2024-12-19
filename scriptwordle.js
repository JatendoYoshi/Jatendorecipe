const board = document.getElementById("board");
const wordToGuess = "APPLE"; // APPLE
const rows = 6; // 6
const cols = wordToGuess.length;

function createBoard() {
    for (let i = 0; i < rows * cols; i++) {
        const cell = document.createElement("div");
        board.appendChild(cell);
    }
}

createBoard();
const wordToGuess = "APPLE"; // Apple
const board = document.getElementById("board");
const rows = 6; // 6
const cols = wordToGuess.length;
let currentRow = 0;
let currentCol = 0;

function createBoard() {
    for (let i = 0; i < rows * cols; i++) {
        const cell = document.createElement("div");
        board.appendChild(cell);
    }
}

function handleInput(key) {
    const cells = board.children;

    // Add letter to the grid
    if (key.length === 1 && /^[a-zA-Z]$/.test(key)) {
        if (currentCol < cols) {
            cells[currentRow * cols + currentCol].textContent = key.toUpperCase();
            currentCol++;
        }
    }

    // Check the word when "Enter" is pressed
    if (key === "Enter" && currentCol === cols) {
        const guess = Array.from(cells)
            .slice(currentRow * cols, (currentRow + 1) * cols)
            .map(cell => cell.textContent)
            .join("");

        if (guess === wordToGuess) {
            // Animate all tiles as "correct"
            for (let i = 0; i < cols; i++) {
                const index = currentRow * cols + i;
                cells[index].classList.add("correct");
            }
            alert("You guessed the word!");
        } else {
            // Provide feedback with animations
            for (let i = 0; i < cols; i++) {
                const index = currentRow * cols + i;
                const letter = cells[index].textContent;

                if (wordToGuess.includes(letter)) {
                    if (wordToGuess[i] === letter) {
                        cells[index].classList.add("correct");
                    } else {
                        cells[index].classList.add("partial");
                    }
                } else {
                    cells[index].classList.add("wrong");
                }
            }
        }

        currentRow++;
        currentCol = 0;
    }

    // Allow "Backspace" to delete letters
    if (key === "Backspace" && currentCol > 0) {
        currentCol--;
        cells[currentRow * cols + currentCol].textContent = "";
    }
}

document.addEventListener("keydown", (e) => handleInput(e.key));
createBoard();
const wordToGuess = "APPLE"; // apple
const board = document.getElementById("board");
const rows = 6; // 6
const cols = wordToGuess.length;
let currentRow = 0;
let currentCol = 0;

function createBoard() {
    for (let i = 0; i < rows * cols; i++) {
        const cell = document.createElement("div");
        board.appendChild(cell);
    }
}

function checkWord(guess) {
    const cells = board.children;

    for (let i = 0; i < cols; i++) {
        const index = currentRow * cols + i;
        const cell = cells[index];
        const letter = cell.textContent;

        // Delay each flip by i * 300ms
        setTimeout(() => {
            if (wordToGuess[i] === letter) {
                cell.classList.add("correct");
            } else if (wordToGuess.includes(letter)) {
                cell.classList.add("partial");
            } else {
                cell.classList.add("wrong");
            }
        }, i * 300); // 300ms delay for each letter
    }
}

function handleInput(key) {
    const cells = board.children;

    // Add letter to the grid
    if (key.length === 1 && /^[a-zA-Z]$/.test(key)) {
        if (currentCol < cols) {
            cells[currentRow * cols + currentCol].textContent = key.toUpperCase();
            currentCol++;
        }
    }

    // Check the word when "Enter" is pressed
    if (key === "Enter" && currentCol === cols) {
        const guess = Array.from(cells)
            .slice(currentRow * cols, (currentRow + 1) * cols)
            .map(cell => cell.textContent)
            .join("");

        checkWord(guess);
        currentRow++;
        currentCol = 0;
    }

    // Allow "Backspace" to delete letters
    if (key === "Backspace" && currentCol > 0) {
        currentCol--;
        cells[currentRow * cols + currentCol].textContent = "";
    }
}

document.addEventListener("keydown", (e) => handleInput(e.key));
createBoard();
