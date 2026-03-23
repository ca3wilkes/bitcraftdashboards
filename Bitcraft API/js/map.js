// -----------------------------
// BIOME COLORS (from bitcraftmap project)
// -----------------------------
const BIOME_COLORS = {
  "plains": "#A7D379",
  "forest": "#228B22",
  "mountain": "#8B8B8B",
  "desert": "#E5C07B",
  "tundra": "#C0C0C0",
  "swamp": "#556B2F",
  "water": "#4A90E2",
  "ocean": "#1E3A8A",
  "unknown": "#000000"
};

// -----------------------------
// CANVAS SETUP
// -----------------------------
const canvas = document.getElementById("worldCanvas");
const ctx = canvas.getContext("2d");

let tiles = [];
let scale = 2;
let offsetX = 0;
let offsetY = 0;

let dragging = false;
let dragStartX = 0;
let dragStartY = 0;

// -----------------------------
// LOAD WORLD DATA
// -----------------------------
async function loadWorld() {
  console.log("Loading world data...");

  const res = await fetch("https://raw.githubusercontent.com/bitcraftmap/bitcraftmap/main/data/world.json");
  const data = await res.json();

  tiles = data.tiles;
  console.log(`Loaded ${tiles.length} tiles`);

  drawWorld();
}

loadWorld();

// -----------------------------
// DRAW WORLD
// -----------------------------
function drawWorld() {
  if (!tiles.length) return;

  const xs = tiles.map(t => t.x);
  const ys = tiles.map(t => t.y);

  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  const width = (maxX - minX + 1) * scale;
  const height = (maxY - minY + 1) * scale;

  canvas.width = width;
  canvas.height = height;

  ctx.clearRect(0, 0, width, height);

  tiles.forEach(tile => {
    const biome = tile.biome || "unknown";
    const color = BIOME_COLORS[biome] || BIOME_COLORS["unknown"];

    ctx.fillStyle = color;

    const px = (tile.x - minX) * scale + offsetX;
    const py = (tile.y - minY) * scale + offsetY;

    ctx.fillRect(px, py, scale, scale);
  });
}

// -----------------------------
// ZOOM
// -----------------------------
document.addEventListener("wheel", e => {
  const zoom = e.deltaY * -0.001;
  scale += zoom;

  if (scale < 1) scale = 1;
  if (scale > 20) scale = 20;

  drawWorld();
});

// -----------------------------
// PAN
// -----------------------------
canvas.addEventListener("mousedown", e => {
  dragging = true;
  dragStartX = e.clientX - offsetX;
  dragStartY = e.clientY - offsetY;
});

canvas.addEventListener("mousemove", e => {
  if (!dragging) return;

  offsetX = e.clientX - dragStartX;
  offsetY = e.clientY - dragStartY;

  drawWorld();
});

canvas.addEventListener("mouseup", () => dragging = false);
canvas.addEventListener("mouseleave", () => dragging = false);
