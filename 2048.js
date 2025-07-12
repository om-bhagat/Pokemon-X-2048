const rows = 4;
const columns = 4;
let board = [];
let score = 0;

window.onload = function () {
    setGame();
};

function setGame() {
    const boardElement = document.getElementById("board");
    boardElement.innerHTML = ""; // Clear board

    for (let r = 0; r < rows; r++) {
        board[r] = [];
        for (let c = 0; c < columns; c++) {
            const tile = document.createElement("div");
            tile.id = `${r}-${c}`;
            tile.classList.add("tile");
            const pos = getTilePosition(r, c);
            tile.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
            boardElement.appendChild(tile);
            board[r][c] = null;
        }
    }

    spawnTile();
    spawnTile();
}

function spawnTile() {
    let empty = [];
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            if (board[r][c] === null) empty.push({ r, c });
        }
    }
    if (empty.length === 0) return;

    let { r, c } = empty[Math.floor(Math.random() * empty.length)];
    const value = 2;

    const tile = document.createElement("div");
    tile.classList.add("tile", "x2");
    tile.style.position = "absolute";
    tile.style.transition = "none";

    const pos = getTilePosition(r, c);
    tile.style.transform = `translate(${pos.x}px, ${pos.y}px)`;

    const img = document.createElement("img");
    img.src = imageMap[value] || "";
    img.alt = value;
    img.style.width = "100%";
    img.style.height = "100%";
    img.style.objectFit = "cover";
    tile.appendChild(img);

    const boardEl = document.getElementById("board");
    boardEl.appendChild(tile);

    // 🔥 Force the browser to apply styles and layout
    tile.getBoundingClientRect(); // ← this is the missing step

    // Re-enable transition AFTER layout has settled
    requestAnimationFrame(() => {
        tile.style.transition = "transform 0.2s ease";
    });

    board[r][c] = {
        value,
        tile
    };
}



function getTilePosition(row, col) {
    const tileSize = 100;
    return {
        x: col * tileSize,
        y: row * tileSize
    };
}

function updatePosition(r, c, tileObj) {
    const pos = getTilePosition(r, c);
    tileObj.tile.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
}

function mergeTiles(src, dest) {
    dest.value *= 2;
    score += dest.value;
    dest.tile.innerHTML = ""; // Clear old image
    const img = document.createElement("img");
    img.src = imageMap[dest.value] || "";
    img.alt = dest.value;
    img.style.width = "100%";
    img.style.height = "100%";
    img.style.objectFit = "cover";
    dest.tile.appendChild(img);
    src.tile.remove();
}

function slide(direction) {
    let moved = false;

    let startR = direction === "down" ? rows - 1 : 0;
    let endR = direction === "down" ? -1 : rows;
    let stepR = direction === "down" ? -1 : 1;

    let startC = direction === "right" ? columns - 1 : 0;
    let endC = direction === "right" ? -1 : columns;
    let stepC = direction === "right" ? -1 : 1;

    for (let i = 0; i < rows * columns; i++) {
        let r = direction === "up" || direction === "down" ? startR + Math.floor(i / columns) * stepR : i % rows;
        let c = direction === "left" || direction === "right" ? startC + Math.floor(i / rows) * stepC : i % columns;

        if (board[r][c] === null) continue;

        let [dr, dc] = direction === "up" ? [-1, 0] :
                       direction === "down" ? [1, 0] :
                       direction === "left" ? [0, -1] : [0, 1];

        let nextR = r + dr;
        let nextC = c + dc;

        while (nextR >= 0 && nextR < rows && nextC >= 0 && nextC < columns) {
            if (board[nextR][nextC] === null) {
                board[nextR][nextC] = board[r][c];
                board[r][c] = null;
                updatePosition(nextR, nextC, board[nextR][nextC]);
                r = nextR;
                c = nextC;
                nextR = r + dr;
                nextC = c + dc;
                moved = true;
            } else if (board[nextR][nextC].value === board[r][c].value && !board[nextR][nextC].merged) {
                mergeTiles(board[r][c], board[nextR][nextC]);
                board[nextR][nextC].merged = true;
                board[r][c] = null;
                moved = true;
                break;
            } else {
                break;
            }
        }
    }

    // Reset merge flags
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            if (board[r][c]) board[r][c].merged = false;
        }
    }

    if (moved) {
        setTimeout(spawnTile, 150);
        document.getElementById("score").innerText = score;
    }
}

document.addEventListener("keyup", (e) => {
    if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.code)) {
        const dir = e.code.replace("Arrow", "").toLowerCase();
        slide(dir);
    }
});

const imageMap = {
    2: "images/2.png",
    4: "images/4.png",
    8: "images/8.jpg",
    16: "images/16.jpg",
    32: "images/32.jpg",
    64: "images/64.png",
    128: "images/128.jpg",
    256: "images/256.png",
    512: "images/512.jpg",
    1024: "images/1024.jpg",
    2048: "images/2048.png",
};
