const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const COLS = 12;
const ROWS = 20;
const BLOCK_SIZE = 20;

canvas.width = COLS * BLOCK_SIZE;
canvas.height = ROWS * BLOCK_SIZE;

let board;
let current;
let dropInterval = 500;
let lastTime = 0;

const colors = ["cyan", "yellow", "lime", "red", "orange"];

const pieces = [
    [[1, 1, 1], [0, 1, 0]],
    [[1, 1], [1, 1]],
    [[1, 1, 0], [0, 1, 1]],
    [[0, 1, 1], [1, 1, 0]],
    [[1, 1, 1, 1]],
];

function init() {
    board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    current = newPiece();
}

function newPiece() {
    let index = Math.floor(Math.random() * pieces.length);
    return {
        shape: pieces[index],
        color: colors[index],
        x: 4,
        y: 0
    };
}

function drawBlock(x, y, color) {
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;
    ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE - 2, BLOCK_SIZE - 2);
    ctx.shadowBlur = 0;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    board.forEach((row, y) => {
        row.forEach((val, x) => {
            if (val) drawBlock(x, y, val);
        });
    });

    current.shape.forEach((row, y) => {
        row.forEach((val, x) => {
            if (val) {
                drawBlock(current.x + x, current.y + y, current.color);
            }
        });
    });
}

function collide() {
    return current.shape.some((row, y) =>
        row.some((val, x) => {
            let nx = current.x + x;
            let ny = current.y + y;
            return (
                val &&
                (nx < 0 || nx >= COLS || ny >= ROWS || (ny >= 0 && board[ny][nx]))
            );
        })
    );
}

function merge() {
    current.shape.forEach((row, y) => {
        row.forEach((val, x) => {
            if (val) {
                board[current.y + y][current.x + x] = current.color;
            }
        });
    });
}

function rotate(shape) {
    return shape[0].map((_, i) => shape.map(row => row[i]).reverse());
}

function rotatePiece() {
    let rotated = rotate(current.shape);
    let prev = current.shape;
    current.shape = rotated;
    if (collide()) current.shape = prev;
}

function clearLines() {
    board = board.filter(row => row.some(cell => !cell));
    while (board.length < ROWS) {
        board.unshift(Array(COLS).fill(0));
    }
}

function drop() {
    current.y++;
    if (collide()) {
        current.y--;
        merge();
        clearLines();
        current = newPiece();
    }
}

function move(dir) {
    current.x += dir;
    if (collide()) current.x -= dir;
}

function resetGame() {
    init();
}

document.addEventListener("keydown", e => {
    if (e.key === "ArrowLeft") move(-1);
    if (e.key === "ArrowRight") move(1);
    if (e.key === "ArrowDown") drop();
    if (e.key === "ArrowUp") rotatePiece();
    if (e.key.toLowerCase() === "r") resetGame();
});

function update(time = 0) {
    const delta = time - lastTime;
    if (delta > dropInterval) {
        drop();
        lastTime = time;
    }
    draw();
    requestAnimationFrame(update);
}

init();
update();