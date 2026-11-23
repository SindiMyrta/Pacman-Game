import { TILE_SIZE, canOccupyCircle, findPath, tileCenter } from "./map.js";

const GHOST_STARTS = [
  { col: 6, row: 7, color: "#ff4d68", personality: "chaser" },
  { col: 7, row: 7, color: "#ff8bd1", personality: "ambusher" },
  { col: 8, row: 7, color: "#50e8ff", personality: "wanderer" },
  { col: 9, row: 7, color: "#ffad4d", personality: "guard" }
];

export function createGhosts() {
  return GHOST_STARTS.map((ghost, index) => ({
    ...ghost,
    x: ghost.col * TILE_SIZE + TILE_SIZE / 2,
    y: ghost.row * TILE_SIZE + TILE_SIZE / 2,
    radius: 13,
    speed: 1.35,
    direction: index % 2 === 0 ? "left" : "right",
    frightened: false,
    changeTimer: 0
  }));
}

export function drawGhost(ctx, ghost, powerActive) {
  const frightened = powerActive || ghost.frightened;
  const color = frightened ? "#2856d9" : ghost.color;
  const r = ghost.radius;

  ctx.save();
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.arc(ghost.x, ghost.y - 2, r, Math.PI, 0);
  ctx.lineTo(ghost.x + r, ghost.y + r);
  ctx.lineTo(ghost.x + r / 2, ghost.y + r - 5);
  ctx.lineTo(ghost.x, ghost.y + r);
  ctx.lineTo(ghost.x - r / 2, ghost.y + r - 5);
  ctx.lineTo(ghost.x - r, ghost.y + r);
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(ghost.x - 5, ghost.y - 4, 4, 0, Math.PI * 2);
  ctx.arc(ghost.x + 5, ghost.y - 4, 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = frightened ? "#fff" : "#183b9b";
  ctx.beginPath();
  ctx.arc(ghost.x - 5, ghost.y - 4, 2, 0, Math.PI * 2);
  ctx.arc(ghost.x + 5, ghost.y - 4, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function updateGhosts(ghosts, player, powerActive, level) {
  for (const ghost of ghosts) {
    const speed = ghost.speed + Math.min(level - 1, 5) * 0.12;
    const centerX = tileCenter(ghost.x);
    const centerY = tileCenter(ghost.y);
    const atCenter = Math.abs(ghost.x - centerX) <= speed && Math.abs(ghost.y - centerY) <= speed;

    if (atCenter) {
      ghost.x = centerX;
      ghost.y = centerY;

      const ghostCol = Math.floor(ghost.x / TILE_SIZE);
      const ghostRow = Math.floor(ghost.y / TILE_SIZE);
      let targetX = player.x;
      let targetY = player.y;

      // Give each ghost a slightly different target to create varied behavior.
      if (ghost.personality === "ambusher") {
        const offsets = { right: [2, 0], left: [-2, 0], up: [0, -2], down: [0, 2] };
        const [ox, oy] = offsets[player.direction] || [0, 0];
        targetX += ox * TILE_SIZE;
        targetY += oy * TILE_SIZE;
      } else if (ghost.personality === "wanderer" && Math.random() < 0.35) {
        targetX = (1 + Math.floor(Math.random() * 13)) * TILE_SIZE;
        targetY = (1 + Math.floor(Math.random() * 13)) * TILE_SIZE;
      } else if (ghost.personality === "guard") {
        targetX = player.x > 300 ? 260 : 340;
        targetY = player.y;
      }

      let next = null;
      if (powerActive) {
        const choices = ["right", "left", "up", "down"];
        next = choices[Math.floor(Math.random() * choices.length)];
      } else {
        next = findPath(
          ghostCol, ghostRow,
          Math.max(1, Math.min(13, Math.floor(targetX / TILE_SIZE))),
          Math.max(1, Math.min(13, Math.floor(targetY / TILE_SIZE)))
        );
      }

      if (next) ghost.direction = next;
    }

    const vectors = {
      right: [speed, 0], left: [-speed, 0],
      up: [0, -speed], down: [0, speed]
    };
    const [dx, dy] = vectors[ghost.direction] || [0, 0];

    if (canOccupyCircle(ghost.x + dx, ghost.y + dy, ghost.radius)) {
      ghost.x += dx;
      ghost.y += dy;
    } else {
      // At a dead end, reverse direction and let pathfinding choose again.
      ghost.direction = ({ right: "left", left: "right", up: "down", down: "up" })[ghost.direction];
    }
  }
}

export function resetGhosts(ghosts) {
  const fresh = createGhosts();
  ghosts.forEach((ghost, index) => Object.assign(ghost, fresh[index]));
}
