const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const statusEl = document.getElementById("status");
const coinsEl = document.getElementById("coins");

const TILE = 32;
const LEVEL = [
  "........................................................................................................",
  "........................................................................................................",
  "........................................................................................................",
  "........................................................................................................",
  ".....................C..................................................................................",
  "..........B....C.....B....................................................C............................F",
  "..........B....B.....B..........................C.........................B.......................BBBBB",
  "....C.....B....B.....B......................BBBBB...................C.....B.......................B....",
  "....B.....B....B.....B............C.........B........................B.....B.......................B....",
  "....B.....B....B.....B.........BBBBB.........B....................BBBBB....B.......................B....",
  "....B.....B....B.....B.......................B.............C................B.......................B....",
  "....B.....B....B.....B.......................B..........BBBBB..............B.......................B....",
  "....B.....B....B.....B.......................B.............................B.......................B....",
  "....B.....B....B.....B.......................B.............................B.......................B....",
  "....B.....B....B.....B.................BBBBBBB.............................B.......................B....",
  "....B.....B....B.....B.....................................................B.......................B....",
  "GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG",
];

const levelWidth = LEVEL[0].length;
const levelHeight = LEVEL.length;

const player = {
  x: 2 * TILE,
  y: 10 * TILE,
  width: 24,
  height: 28,
  vx: 0,
  vy: 0,
  speed: 3.2,
  jump: 10.5,
  onGround: false,
  alive: true,
};

const input = {
  left: false,
  right: false,
  jump: false,
  reset: false,
};

let coins = 0;
let gameState = "playing";

const solidTiles = new Set(["G", "B"]);

function resetGame() {
  player.x = 2 * TILE;
  player.y = 10 * TILE;
  player.vx = 0;
  player.vy = 0;
  player.onGround = false;
  player.alive = true;
  coins = 0;
  gameState = "playing";
  statusEl.textContent = "Listo";
  coinsEl.textContent = coins;
}

function getTileAt(x, y) {
  if (x < 0 || y < 0 || x >= levelWidth || y >= levelHeight) return " ";
  return LEVEL[y][x];
}

function setTileAt(x, y, value) {
  if (x < 0 || y < 0 || x >= levelWidth || y >= levelHeight) return;
  const row = LEVEL[y].split("");
  row[x] = value;
  LEVEL[y] = row.join("");
}

function handleInput() {
  player.vx = 0;
  if (input.left) player.vx = -player.speed;
  if (input.right) player.vx = player.speed;
  if (input.jump && player.onGround) {
    player.vy = -player.jump;
    player.onGround = false;
  }
}

function applyPhysics() {
  player.vy += 0.5; // gravity
  if (player.vy > 12) player.vy = 12;

  movePlayer(player.vx, 0);
  movePlayer(0, player.vy);
}

function movePlayer(dx, dy) {
  player.x += dx;
  player.y += dy;

  const left = Math.floor(player.x / TILE);
  const right = Math.floor((player.x + player.width) / TILE);
  const top = Math.floor(player.y / TILE);
  const bottom = Math.floor((player.y + player.height) / TILE);

  player.onGround = false;

  for (let y = top; y <= bottom; y += 1) {
    for (let x = left; x <= right; x += 1) {
      const tile = getTileAt(x, y);
      if (!solidTiles.has(tile)) continue;

      const tileX = x * TILE;
      const tileY = y * TILE;
      const intersects =
        player.x < tileX + TILE &&
        player.x + player.width > tileX &&
        player.y < tileY + TILE &&
        player.y + player.height > tileY;

      if (!intersects) continue;

      if (dx > 0) {
        player.x = tileX - player.width;
      } else if (dx < 0) {
        player.x = tileX + TILE;
      } else if (dy > 0) {
        player.y = tileY - player.height;
        player.vy = 0;
        player.onGround = true;
      } else if (dy < 0) {
        player.y = tileY + TILE;
        player.vy = 0;
      }
    }
  }
}

function collectCoins() {
  const centerX = Math.floor((player.x + player.width / 2) / TILE);
  const centerY = Math.floor((player.y + player.height / 2) / TILE);
  if (getTileAt(centerX, centerY) === "C") {
    setTileAt(centerX, centerY, ".");
    coins += 1;
    coinsEl.textContent = coins;
  }
}

function checkWinLose() {
  if (player.y > canvas.height + 200) {
    gameState = "lost";
    statusEl.textContent = "¡Te caíste! Pulsa R para reiniciar.";
  }

  const flagRow = LEVEL.findIndex((row) => row.includes("F"));
  if (flagRow !== -1) {
    const flagTileX = LEVEL[flagRow].indexOf("F");
    const flagWorldX = flagTileX * TILE;
    if (player.x + player.width > flagWorldX) {
      gameState = "won";
      statusEl.textContent = "¡Ganaste! Llegaste al final.";
    }
  }
}

function update() {
  if (gameState === "playing") {
    handleInput();
    applyPhysics();
    collectCoins();
    checkWinLose();
  }
  if (input.reset) {
    resetGame();
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const cameraX = Math.max(0, Math.min(player.x - canvas.width / 2, levelWidth * TILE - canvas.width));

  ctx.save();
  ctx.translate(-cameraX, 0);

  for (let y = 0; y < levelHeight; y += 1) {
    for (let x = 0; x < levelWidth; x += 1) {
      const tile = LEVEL[y][x];
      if (tile === ".") continue;
      const drawX = x * TILE;
      const drawY = y * TILE;

      if (tile === "G") {
        ctx.fillStyle = "#4caf50";
        ctx.fillRect(drawX, drawY, TILE, TILE);
      } else if (tile === "B") {
        ctx.fillStyle = "#c48a48";
        ctx.fillRect(drawX, drawY, TILE, TILE);
        ctx.strokeStyle = "#8d5a2a";
        ctx.strokeRect(drawX + 2, drawY + 2, TILE - 4, TILE - 4);
      } else if (tile === "C") {
        ctx.fillStyle = "#ffd54f";
        ctx.beginPath();
        ctx.arc(drawX + TILE / 2, drawY + TILE / 2, TILE / 4, 0, Math.PI * 2);
        ctx.fill();
      } else if (tile === "F") {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(drawX + 12, drawY - TILE * 2, 4, TILE * 3);
        ctx.fillStyle = "#e53935";
        ctx.beginPath();
        ctx.moveTo(drawX + 16, drawY - TILE * 2);
        ctx.lineTo(drawX + 60, drawY - TILE * 1.6);
        ctx.lineTo(drawX + 16, drawY - TILE * 1.2);
        ctx.closePath();
        ctx.fill();
      }
    }
  }

  ctx.fillStyle = "#e53935";
  ctx.fillRect(player.x, player.y, player.width, player.height);
  ctx.fillStyle = "#ffccbc";
  ctx.fillRect(player.x + 4, player.y + 6, player.width - 8, 8);

  ctx.restore();
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

window.addEventListener("keydown", (event) => {
  if (event.code === "ArrowLeft") input.left = true;
  if (event.code === "ArrowRight") input.right = true;
  if (event.code === "Space") input.jump = true;
  if (event.code === "KeyR") input.reset = true;
});

window.addEventListener("keyup", (event) => {
  if (event.code === "ArrowLeft") input.left = false;
  if (event.code === "ArrowRight") input.right = false;
  if (event.code === "Space") input.jump = false;
  if (event.code === "KeyR") input.reset = false;
});

resetGame();
loop();
