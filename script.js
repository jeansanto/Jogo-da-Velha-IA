const state = {
    board: Array(9).fill(null),
    currentPlayer: 'X',
    gameOver: false,
    winner: null,
    mode: 'ia',
    difficulty: 'medio',
    scores: {
        player1: 0,
        player2: 0,
        draw: 0,
    },
};

const boardEl = document.getElementById('board');
const statusEl = document.getElementById('status');
const restartBtn = document.getElementById('restartBtn');
const gameModeSelect = document.getElementById('gameMode');
const difficultySelect = document.getElementById('difficultySelect');
const difficultyGroup = document.getElementById('difficultyGroup');
const player1ScoreEl = document.getElementById('player1Score');
const player2ScoreEl = document.getElementById('player2Score');
const drawScoreEl = document.getElementById('drawScore');
const player2Label = document.getElementById('player2Label');
const resetScoreBtn = document.getElementById('resetScoreBtn');
const confirmModal = document.getElementById('confirmModal');
const confirmYes = document.getElementById('confirmYes');
const confirmNo = document.getElementById('confirmNo');

function init() {
    createBoard();
    attachEvents();
    resetGame();
    updateUI();
}

function createBoard() {
    boardEl.innerHTML = '';
    for (let i = 0; i < 9; i++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.index = i;
        boardEl.appendChild(cell);
    }
}

function attachEvents() {
    boardEl.addEventListener('click', handleCellClick);
    restartBtn.addEventListener('click', resetGame);
    resetScoreBtn.addEventListener('click', () => showModal());
    confirmYes.addEventListener('click', resetScore);
    confirmNo.addEventListener('click', hideModal);

    gameModeSelect.addEventListener('change', (e) => {
        state.mode = e.target.value;
        if (state.mode === 'ia') {
            difficultyGroup.classList.remove('hidden');
            player2Label.textContent = '🤖 Computador';
        } else {
            difficultyGroup.classList.add('hidden');
            player2Label.textContent = '👤 Jogador 2';
        }
        resetGame();
    });

    difficultySelect.addEventListener('change', (e) => {
        state.difficulty = e.target.value;
        resetGame();
    });

    confirmModal.addEventListener('click', (e) => {
        if (e.target === confirmModal) hideModal();
    });
}

function handleCellClick(e) {
    const cell = e.target.closest('.cell');
    if (!cell) return;
    if (state.gameOver) return;

    const index = parseInt(cell.dataset.index);
    if (state.board[index] !== null) return;

    if (state.mode === 'ia' && state.currentPlayer !== 'X') {
        statusEl.textContent = '⏳ Aguarde a IA jogar...';
        return;
    }

    makeMove(index, state.currentPlayer);

    if (state.gameOver) return;

    if (state.mode === 'ia' && state.currentPlayer === 'O') {
        const delay = state.difficulty === 'facil' ? 200 : 
                      state.difficulty === 'medio' ? 350 : 500;
        setTimeout(() => {
            if (!state.gameOver && state.currentPlayer === 'O') {
                computerMove();
            }
        }, delay);
    }
}

function makeMove(index, player) {
    if (state.board[index] !== null) return false;

    state.board[index] = player;
    renderCell(index, player);

    const winInfo = checkWinner(state.board);
    if (winInfo) {
        endGame(winInfo.winner, winInfo.combo);
        return true;
    }

    if (state.board.every(cell => cell !== null)) {
        endGame('draw');
        return true;
    }

    state.currentPlayer = state.currentPlayer === 'X' ? 'O' : 'X';
    updateStatus();
    return true;
}

function renderCell(index, player) {
    const cell = boardEl.children[index];
    cell.textContent = player;
    cell.classList.add('taken', player.toLowerCase());
}

function checkWinner(board) {
    const patterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];

    for (const pattern of patterns) {
        const [a, b, c] = pattern;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return { winner: board[a], combo: pattern };
        }
    }
    return null;
}

function endGame(winner, combo = null) {
    state.gameOver = true;
    state.winner = winner;

    if (combo) {
        combo.forEach(idx => {
            boardEl.children[idx].classList.add('winner');
        });
    }

    if (winner === 'X') {
        state.scores.player1++;
        statusEl.textContent = state.mode === 'ia' ? '🎉 Você venceu!' : '🎉 Jogador 1 venceu!';
    } else if (winner === 'O') {
        state.scores.player2++;
        statusEl.textContent = state.mode === 'ia' ? '🤖 Computador venceu!' : '🎉 Jogador 2 venceu!';
    } else {
        state.scores.draw++;
        statusEl.textContent = '🤝 Empate!';
    }

    updateScoreUI();
}

function resetGame() {
    state.board = Array(9).fill(null);
    state.currentPlayer = 'X';
    state.gameOver = false;
    state.winner = null;

    Array.from(boardEl.children).forEach(cell => {
        cell.textContent = '';
        cell.className = 'cell';
    });

    updateStatus();
}

function resetScore() {
    state.scores.player1 = 0;
    state.scores.player2 = 0;
    state.scores.draw = 0;
    updateScoreUI();
    statusEl.textContent = '🗑️ Placar zerado!';
    setTimeout(() => updateStatus(), 1500);
    hideModal();
}

function showModal() {
    confirmModal.style.display = 'flex';
}

function hideModal() {
    confirmModal.style.display = 'none';
}

function updateStatus() {
    if (state.gameOver) return;

    if (state.mode === 'ia') {
        if (state.currentPlayer === 'X') {
            statusEl.textContent = '🧑 Sua vez (X)';
        } else {
            statusEl.textContent = '🤖 Computador pensando...';
        }
    } else {
        if (state.currentPlayer === 'X') {
            statusEl.textContent = '🎯 Vez do Jogador 1 (X)';
        } else {
            statusEl.textContent = '🎯 Vez do Jogador 2 (O)';
        }
    }
}

function updateScoreUI() {
    player1ScoreEl.textContent = state.scores.player1;
    player2ScoreEl.textContent = state.scores.player2;
    drawScoreEl.textContent = state.scores.draw;
}

function updateUI() {
    updateStatus();
    updateScoreUI();
}

function computerMove() {
    if (state.gameOver) return;
    if (state.currentPlayer !== 'O') return;
    if (state.mode !== 'ia') return;

    const available = state.board
        .map((val, idx) => val === null ? idx : null)
        .filter(v => v !== null);

    if (available.length === 0) return;

    let moveIndex;

    switch (state.difficulty) {
        case 'facil':
            moveIndex = getRandomMove(available);
            break;
        case 'medio':
            moveIndex = getMediumMove(available);
            break;
        case 'dificil':
            moveIndex = getBestMove(state.board);
            break;
        default:
            moveIndex = getRandomMove(available);
    }

    if (moveIndex !== undefined) {
        makeMove(moveIndex, 'O');
    }
}

function getRandomMove(available) {
    return available[Math.floor(Math.random() * available.length)];
}

function getMediumMove(available) {
    if (Math.random() < 0.3) {
        return getRandomMove(available);
    }
    return getBestMove(state.board);
}

function getBestMove(board) {
    const available = board
        .map((val, idx) => val === null ? idx : null)
        .filter(v => v !== null);

    if (available.length === 0) return undefined;

    const filled = board.filter(v => v !== null).length;
    if (filled === 0) {
        const corners = [0, 2, 6, 8];
        return corners[Math.floor(Math.random() * corners.length)];
    }
    if (filled === 1 && board[4] === null) {
        return 4;
    }

    let bestScore = -Infinity;
    let bestMove = available[0];

    for (const move of available) {
        const newBoard = [...board];
        newBoard[move] = 'O';
        const score = minimax(newBoard, 0, false);
        if (score > bestScore) {
            bestScore = score;
            bestMove = move;
        }
    }

    return bestMove;
}

function minimax(board, depth, isMaximizing) {
    const result = checkWinner(board);

    if (result) {
        if (result.winner === 'O') return 10 - depth;
        if (result.winner === 'X') return depth - 10;
    }

    if (board.every(cell => cell !== null)) {
        return 0;
    }

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] === null) {
                const newBoard = [...board];
                newBoard[i] = 'O';
                bestScore = Math.max(bestScore, minimax(newBoard, depth + 1, false));
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] === null) {
                const newBoard = [...board];
                newBoard[i] = 'X';
                bestScore = Math.min(bestScore, minimax(newBoard, depth + 1, true));
            }
        }
        return bestScore;
    }
}

init();