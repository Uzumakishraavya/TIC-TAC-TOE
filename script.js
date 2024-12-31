let currentPlayer = 'X';
let board = ['', '', '', '', '', '', '', '', ''];
let scoreX = 0;
let scoreO = 0;
let gameOver = false; // Flag to track game over status
let currentUser = ''; // Store the username
let gameProgress = []; 

function initializeBoard() {
   const boardElement = document.getElementById('board');
   boardElement.innerHTML = '';
   gameOver = false; // Reset game over status at the start of a new game

   for (let i = 0; i < 9; i++) {
       const cell = document.createElement('div');
       cell.classList.add('cell');
       cell.dataset.index = i;
       cell.addEventListener('click', handleCellClick);
       boardElement.appendChild(cell);
   }
}

function login() {
   const username = document.getElementById('username').value.trim();
   const password = document.getElementById('password').value.trim();

   if (username === '' || password === '') {
       alert('Please fill out both fields to continue.');
       return;
   }

   currentUser = username;
   localStorage.setItem('currentUser', currentUser);

   // Load scores and progress from localStorage
   scoreX = parseInt(localStorage.getItem(`${currentUser}_scoreX`) || '0');
   scoreO = parseInt(localStorage.getItem(`${currentUser}_scoreO`) || '0');
   gameProgress = JSON.parse(localStorage.getItem(`${currentUser}_gameProgress`) || '["", "", "", "", "", "", "", "", ""]');

   document.querySelector('.login').style.display = 'none';
   document.querySelector('.game').style.display = 'block';
   document.getElementById('scoreX').textContent = scoreX;
   document.getElementById('scoreO').textContent = scoreO;
   initializeBoard(); // Populate the board with the saved game progress
}

// Save the game progress (board state, scores) to localStorage
function saveProgress() {
   localStorage.setItem(`${currentUser}_gameProgress`, JSON.stringify(board));
   localStorage.setItem(`${currentUser}_scoreX`, scoreX);
   localStorage.setItem(`${currentUser}_scoreO`, scoreO);
}

function handleCellClick(event) {
   if (gameOver) return; // Ignore clicks if the game is over

   const index = event.target.dataset.index;

   if (board[index] === '' && currentPlayer) {
       board[index] = currentPlayer;
       event.target.textContent = currentPlayer;
       checkWinner();

       if (!gameOver && currentPlayer === 'X') {
           currentPlayer = 'O';
           botMove(); // Let the bot play after the human move
       }
       updateStatus();
   }
}

function botMove() {
   setTimeout(() => {
       if (gameOver) return; // Do not make a move if the game is over

       const bestMove = minimax(board, 'O');
       board[bestMove.index] = 'O';
       document.querySelector(`.cell[data-index='${bestMove.index}']`).textContent = 'O';
       checkWinner();
       if (!gameOver) {
           currentPlayer = 'X';
           updateStatus();
       }
   }, 500);
}

function minimax(board, player) {
   const availableMoves = getAvailableMoves(board);
   
   // Base case: Check if the game has ended
   if (checkWinnerForPlayer(board, 'O')) return { score: 1 };  // O wins
   if (checkWinnerForPlayer(board, 'X')) return { score: -1 }; // X wins
   if (availableMoves.length === 0) return { score: 0 };        // Tie

   const moves = [];

   // Loop over all available moves
   for (let move of availableMoves) {
       const newBoard = board.slice();
       newBoard[move] = player;
       
       const result = minimax(newBoard, player === 'O' ? 'X' : 'O');
       moves.push({
           index: move,
           score: result.score
       });
   }

   // Minimax chooses the best move for the current player
   let bestMove;
   if (player === 'O') {
       let bestScore = -Infinity;
       for (let move of moves) {
           if (move.score > bestScore) {
               bestScore = move.score;
               bestMove = move;
           }
       }
   } else {
       let bestScore = Infinity;
       for (let move of moves) {
           if (move.score < bestScore) {
               bestScore = move.score;
               bestMove = move;
           }
       }
   }
   return bestMove;
}

function getAvailableMoves(board) {
   return board.map((cell, index) => cell === '' ? index : null).filter(index => index !== null);
}

function checkWinnerForPlayer(board, player) {
   const winningCombos = [
       [0, 1, 2], [3, 4, 5], [6, 7, 8],
       [0, 3, 6], [1, 4, 7], [2, 5, 8],
       [0, 4, 8], [2, 4, 6]
   ];

   return winningCombos.some(([a, b, c]) => {
       return board[a] === player && board[b] === player && board[c] === player;
   });
}

function checkWinner() {
   if (checkWinnerForPlayer(board, 'O')) {
       gameOver = true;
       document.getElementById('status').textContent = 'You Lost!';
       scoreO++;
       document.getElementById('scoreO').textContent = scoreO;
       localStorage.setItem(`${currentUser}_scoreO`, scoreO); // Save score
   } else if (checkWinnerForPlayer(board, 'X')) {
       gameOver = true;
       document.getElementById('status').textContent = 'You Win!';
       scoreX++;
       document.getElementById('scoreX').textContent = scoreX;
       localStorage.setItem(`${currentUser}_scoreX`, scoreX); // Save score
   } else if (board.every(cell => cell !== '')) {
       document.getElementById('status').textContent = "It's a Tie!";
       gameOver = true; // Set gameOver flag to true when it's a tie
   }
}

function updateStatus() {
   if (!gameOver) {
       document.getElementById('status').textContent = `Player ${currentPlayer}'s Turn`;
   }
}

function resetGame() {
   board = ['', '', '', '', '', '', '', '', ''];
   currentPlayer = 'X';
   gameOver = false; // Reset game over status
   document.getElementById('status').textContent = "Player X's Turn";
   initializeBoard();
}
