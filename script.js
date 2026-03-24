const cursor = document.getElementById('cursor');
const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const diffBtns = document.querySelectorAll('.diff-btn');
const restartBtn = document.getElementById('restartBtn');
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('high-score');
const finalScoreVal = document.getElementById('finalScoreVal');

const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake = [];
let dx = 0;
let dy = 0;
let foodX;
let foodY;
let score = 0;
let highScore = localStorage.getItem('orochimaruHighScore') || 0;
let gameLoopTimeout;
let gameActive = false;
let currentSpeed = 100;
let baseSpeed = 100;

highScoreElement.textContent = highScore;

document.addEventListener('mousemove', (e) => {
    if(window.matchMedia("(hover: hover)").matches) {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    }
});

document.addEventListener('mousedown', () => {
    if(window.matchMedia("(hover: hover)").matches) {
        cursor.style.transform = 'translate(-50%, -50%) scale(1.5)';
    }
});

document.addEventListener('mouseup', () => {
    if(window.matchMedia("(hover: hover)").matches) {
        cursor.style.transform = 'translate(-50%, -50%) scale(1)';
    }
});

diffBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        baseSpeed = parseInt(e.target.getAttribute('data-speed'));
        initGame();
    });
});

function initGame() {
    snake = [
        {x: 15, y: 15},
        {x: 15, y: 16},
        {x: 15, y: 17}
    ];
    dx = 0;
    dy = -1;
    score = 0;
    currentSpeed = baseSpeed;
    scoreElement.textContent = score;
    spawnFood();
    gameActive = true;
    startScreen.classList.remove('active');
    gameOverScreen.classList.remove('active');
    gameLoop();
}

function spawnFood() {
    foodX = Math.floor(Math.random() * tileCount);
    foodY = Math.floor(Math.random() * tileCount);
    for (let i = 0; i < snake.length; i++) {
        if (snake[i].x === foodX && snake[i].y === foodY) {
            spawnFood();
            break;
        }
    }
}

function gameLoop() {
    if (!gameActive) return;
    
    gameLoopTimeout = setTimeout(() => {
        clearCanvas();
        moveSnake();
        checkCollision();
        if (gameActive) {
            drawFood();
            drawSnake();
            gameLoop();
        }
    }, currentSpeed);
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function drawSnake() {
    snake.forEach((segment, index) => {
        const isHead = index === 0;
        ctx.shadowBlur = 15;
        ctx.shadowColor = isHead ? "#d4a5fc" : "#8a2be2";
        ctx.fillStyle = isHead ? "#ffffff" : "#6a0dad";
        
        ctx.beginPath();
        ctx.roundRect(segment.x * gridSize + 1, segment.y * gridSize + 1, gridSize - 2, gridSize - 2, isHead ? 6 : 4);
        ctx.fill();
        ctx.shadowBlur = 0;

        if (isHead) {
            ctx.fillStyle = "#ff0000";
            let eyeOffsetX = dx === 1 ? 12 : dx === -1 ? 4 : 8;
            let eyeOffsetY = dy === 1 ? 12 : dy === -1 ? 4 : 8;
            
            if (dx !== 0) {
                ctx.fillRect(segment.x * gridSize + eyeOffsetX, segment.y * gridSize + 4, 3, 3);
                ctx.fillRect(segment.x * gridSize + eyeOffsetX, segment.y * gridSize + 12, 3, 3);
            } else if (dy !== 0) {
                ctx.fillRect(segment.x * gridSize + 4, segment.y * gridSize + eyeOffsetY, 3, 3);
                ctx.fillRect(segment.x * gridSize + 12, segment.y * gridSize + eyeOffsetY, 3, 3);
            } else {
                ctx.fillRect(segment.x * gridSize + 4, segment.y * gridSize + 4, 3, 3);
                ctx.fillRect(segment.x * gridSize + 12, segment.y * gridSize + 4, 3, 3);
            }
        }
    });
}

function drawFood() {
    ctx.shadowBlur = 20;
    ctx.shadowColor = "#00ffcc";
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(foodX * gridSize + gridSize / 2, foodY * gridSize + gridSize / 2, gridSize / 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    
    ctx.fillStyle = "#00ffcc";
    ctx.beginPath();
    ctx.arc(foodX * gridSize + gridSize / 2, foodY * gridSize + gridSize / 2, gridSize / 4, 0, Math.PI * 2);
    ctx.fill();
}

function moveSnake() {
    const head = {x: snake[0].x + dx, y: snake[0].y + dy};
    snake.unshift(head);

    if (head.x === foodX && head.y === foodY) {
        score += 10;
        scoreElement.textContent = score;
        if (currentSpeed > 50) currentSpeed -= 1.5;
        spawnFood();
    } else {
        snake.pop();
    }
}

function checkCollision() {
    const head = snake[0];
    
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        triggerGameOver();
    }

    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            triggerGameOver();
        }
    }
}

function triggerGameOver() {
    gameActive = false;
    clearTimeout(gameLoopTimeout);
    
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('orochimaruHighScore', highScore);
        highScoreElement.textContent = highScore;
    }
    
    finalScoreVal.textContent = score;
    gameOverScreen.classList.add('active');
}

document.addEventListener('keydown', (e) => {
    if (!gameActive) return;
    
    const goingUp = dy === -1;
    const goingDown = dy === 1;
    const goingRight = dx === 1;
    const goingLeft = dx === -1;

    if (e.key === 'ArrowLeft' && !goingRight) { dx = -1; dy = 0; }
    if (e.key === 'ArrowUp' && !goingDown) { dx = 0; dy = -1; }
    if (e.key === 'ArrowRight' && !goingLeft) { dx = 1; dy = 0; }
    if (e.key === 'ArrowDown' && !goingUp) { dx = 0; dy = 1; }
});

restartBtn.addEventListener('click', () => {
    startScreen.classList.add('active');
    gameOverScreen.classList.remove('active');
});

const buttons = document.querySelectorAll('button');
buttons.forEach(btn => {
    btn.addEventListener('mouseenter', () => {
        if(window.matchMedia("(hover: hover)").matches) {
            cursor.style.transform = 'translate(-50%, -50%) scale(2)';
            cursor.style.background = 'radial-gradient(circle, #ff2a2a 0%, transparent 70%)';
            cursor.style.boxShadow = '0 0 15px #ff2a2a, 0 0 30px #aa0000';
        }
    });
    btn.addEventListener('mouseleave', () => {
        if(window.matchMedia("(hover: hover)").matches) {
            cursor.style.transform = 'translate(-50%, -50%) scale(1)';
            cursor.style.background = 'radial-gradient(circle, #b154f0 0%, transparent 70%)';
            cursor.style.boxShadow = '0 0 15px #b154f0, 0 0 30px #6a0dad';
        }
    });
});