export const TILE_SIZE = 40;

// # = wall, . = dot, o = power pellet, space = empty tile
const MAPS = [
  // LEVEL 1 - Original map
  [
    "###############",
    "#o...........o#",
    "#.###.#.##..#.#",
    "#.#...#.##..#.#",
    "#.###.#.#.#.#.#",
    "#...#.#.#..##.#",
    "#.###.#.#...#.#",
    "#.............#",
    "#.###.###.###.#",
    "#...#...#...#.#",
    "###.#.###.#.###",
    "#.......#.....#",
    "#.###.###.###.#",
    "#o...........o#",
    "###############"
  ],

  // LEVEL 2 - New maze
  [
    "###############",
    "#o.....#.....o#",
    "#.###..#..###.#",
    "#...#..#..#...#",
    "###.#.###.#.###",
    "#...#.....#...#",
    "#.#####.#####.#",
    "#.............#",
    "#.###.#.#.###.#",
    "#...#.#.#.#...#",
    "###.#.#.#.#.###",
    "#...#...#...#.#",
    "#.#####.#####.#",
    "#o...........o#",
    "###############"
  ],

  // LEVEL 3 - More complex maze
  [
    "###############",
    "#o...#...#...o#",
    "#.#.#.#.#.#.#.#",
    "#.#...#...#...#",
    "#.#####.#####.#",
    "#.....#.#.....#",
    "#####.#.#.#####",
    "#.............#",
    "#.###.###.###.#",
    "#...#.....#...#",
    "###.#.###.#.###",
    "#...#.#...#...#",
    "#.###.#.###.#.#",
    "#o...........o#",
    "###############"
  ]
];

export let grid = [];

export function resetMap(level = 1) {
  const selectedMap = MAPS[(level - 1) % MAPS.length];
  grid = selectedMap.map(row => row.split(""));
}

export function drawMap(ctx, powerActive = false) {
  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[row].length; col++) {
      const tile = grid[row][col];
      const x = col * TILE_SIZE;
      const y = row * TILE_SIZE;

      if (tile === "#") {
        ctx.fillStyle = "#102b86";
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        ctx.strokeStyle = "#4775ff";
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
        ctx.fillStyle = "rgba(100,150,255,.12)";
        ctx.fillRect(x + 5, y + 5, TILE_SIZE - 10, 3);
      } else if (tile === ".") {
        ctx.fillStyle = "#ffe8a6";
        ctx.beginPath();
        ctx.arc(x + TILE_SIZE / 2, y + TILE_SIZE / 2, 3.2, 0, Math.PI * 2);
        ctx.fill();
      } else if (tile === "o") {
        const pulse = 6 + Math.sin(Date.now() / 130) * 1.5;
        ctx.fillStyle = powerActive ? "#fff" : "#fff0a8";
        ctx.shadowColor = "#ffe34d";
        ctx.shadowBlur = 13;
        ctx.beginPath();
        ctx.arc(x + TILE_SIZE / 2, y + TILE_SIZE / 2, pulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }
  }
}

export function isWallPixel(x, y) {
  const col = Math.floor(x / TILE_SIZE);
  const row = Math.floor(y / TILE_SIZE);
  if (row < 0 || row >= grid.length || col < 0 || col >= grid[row].length) return true;
  return grid[row][col] === "#";
}

export function canOccupyCircle(x, y, radius) {
  const r = radius - 2;
  return (
    !isWallPixel(x - r, y - r) &&
    !isWallPixel(x + r, y - r) &&
    !isWallPixel(x - r, y + r) &&
    !isWallPixel(x + r, y + r)
  );
}

export function collectAt(x, y) {
  const col = Math.floor(x / TILE_SIZE);
  const row = Math.floor(y / TILE_SIZE);
  if (row < 0 || row >= grid.length || col < 0 || col >= grid[row].length) return null;

  const tile = grid[row][col];
  if (tile === "." || tile === "o") {
    grid[row][col] = " ";
    return tile === "o" ? "power" : "dot";
  }
  return null;
}

export function countRemainingDots() {
  return grid.reduce((total, row) =>
    total + row.filter(tile => tile === "." || tile === "o").length, 0);
}

export function tileCenter(value) {
  return Math.round((value - TILE_SIZE / 2) / TILE_SIZE) * TILE_SIZE + TILE_SIZE / 2;
}

export function findPath(startCol, startRow, targetCol, targetRow) {
  const key = (col, row) => `${col},${row}`;
  const queue = [{ col: startCol, row: startRow, first: null }];
  const visited = new Set([key(startCol, startRow)]);
  const directions = [
    { name: "right", dc: 1, dr: 0 },
    { name: "left", dc: -1, dr: 0 },
    { name: "down", dc: 0, dr: 1 },
    { name: "up", dc: 0, dr: -1 }
  ];

  while (queue.length) {
    const current = queue.shift();
    if (current.col === targetCol && current.row === targetRow) return current.first;

    for (const direction of directions) {
      const col = current.col + direction.dc;
      const row = current.row + direction.dr;
      const id = key(col, row);

      if (visited.has(id) || isWallPixel(col * TILE_SIZE + TILE_SIZE / 2, row * TILE_SIZE + TILE_SIZE / 2)) continue;

      visited.add(id);
      queue.push({
        col,
        row,
        first: current.first || direction.name
      });
    }
  }
  return null;
}
