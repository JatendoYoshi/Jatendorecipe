document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('grid');
    const keyboard = document.getElementById('keyboard');
    const word = 'apple'; // The target word
    let currentRow = 0;
    let currentTile = 0;
    const rows = 6;
    const columns = 5;

    // Create grid
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < columns; j++) {
            const tile = document.createElement('div');
            tile.classList.add('tile');
            tile.setAttribute('data-row', i);
            tile.setAttribute('data-col', j);
            grid.appendChild(tile);
        }
    }

    // Create keyboard
    const keys = 'QWERTYUIOPASDFGHJKLZXCVBNM'.split('');
    keys.forEach(key => {
        const keyElement = document.createElement('div');
        keyElement.classList.add('key');
        keyElement.textContent = key;
        keyElement.addEventListener('click', () => handleKeyClick(key));
        keyboard.appendChild(keyElement);
    });

    const handleKeyClick = (key) => {
        if (currentTile < columns && currentRow < rows) {
            const tile = document.querySelector(`.tile[data-row="${currentRow}"][data-col="${currentTile}"]`);
            tile.textContent = key;
            currentTile++;
        }
    };

    document.addEventListener('keydown', (e) => {
        const key = e.key.toUpperCase();
        if (keys.includes(key)) {
            handleKeyClick(key);
        } else if (e.key === 'Enter') {
            handleSubmit();
        } else if (e.key === 'Backspace') {
            handleDelete();
        }
    });

    const handleSubmit = () => {
        if (currentTile === columns) {
            const guess = [];
            for (let i = 0; i < columns; i++) {
                const tile = document.querySelector(`.tile[data-row="${currentRow}"][data-col="${i}"]`);
                guess.push(tile.textContent.toLowerCase());
            }
            const guessString = guess.join('');
            if (guessString === word) {
                alert('Congratulations! You guessed the word!');
            } else {
                alert('Incorrect guess.');
            }
            currentRow++;
            currentTile = 0;
        }
    };

    const handleDelete = () => {
        if (currentTile > 0) {
            currentTile--;
            const tile = document.querySelector(`.tile[data-row="${currentRow}"][data-col="${currentTile}"]`);
            tile.textContent = '';
        }
    };
});


