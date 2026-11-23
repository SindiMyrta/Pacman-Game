import { TILE_SIZE, canOccupyCircle, collectAt, tileCenter } from "./map.js";

export function createPlayer() {
  return {
    x: 60, y: 60, radius: 13, speed: 2.2,
    direction: "right", nextDirection: "right",
    animation: 0
  };
}

export function drawPlayer(ctx, player) {
  const angles = { right: 0, left: Math.PI, up: -Math.PI / 2, down: Math.PI / 2 };
  const angle = angles[player.direction] ?? 0;
  const mouth = Math.abs(Math.sin(player.animation)) * 0.34;

  ctx.save();
  ctx.fillStyle = "#ffe34d";
  ctx.shadowColor = "#ffe34d";
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.moveTo(player.x, player.y);
  ctx.arc(player.x, player.y, player.radius, angle + mouth, angle + Math.PI * 2 - mouth);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

export function updatePlayer(player, onCollect) {
  const speed = player.speed;
  const centerX = tileCenter(player.x);
  const centerY = tileCenter(player.y);
  const horizontal = ["right", "left"].includes(player.nextDirection);
  const vertical = ["up", "down"].includes(player.nextDirection);

  // Snap gently to a tile center when the player requests a turn.
  if (horizontal && Math.abs(player.y - centerY) <= player.radius + speed) {
    const [dx, dy] = movement(player.nextDirection, speed);
    if (canOccupyCircle(player.x + dx, centerY + dy, player.radius)) {
      player.y = centerY;
      player.direction = player.nextDirection;
    }
  } else if (vertical && Math.abs(player.x - centerX) <= player.radius + speed) {
    const [dx, dy] = movement(player.nextDirection, speed);
    if (canOccupyCircle(centerX + dx, player.y + dy, player.radius)) {
      player.x = centerX;
      player.direction = player.nextDirection;
    }
  }

  const [dx, dy] = movement(player.direction, speed);
  const nextX = player.x + dx;
  const nextY = player.y + dy;

  if (canOccupyCircle(nextX, nextY, player.radius)) {
    player.x = nextX;
    player.y = nextY;
  } else {
    // Keep the player aligned in the corridor when blocked by a wall.
    if (dx !== 0) player.y = centerY;
    if (dy !== 0) player.x = centerX;
  }

  player.animation += 0.16;

  const collected = collectAt(player.x, player.y);
  if (collected) onCollect(collected);
}

function movement(direction, speed) {
  const vectors = {
    right: [speed, 0], left: [-speed, 0],
    up: [0, -speed], down: [0, speed]
  };
  return vectors[direction] || [0, 0];
}

export function resetPlayer(player) {
  Object.assign(player, {
    x: 60, y: 60, direction: "right",
    nextDirection: "right", animation: 0
  });
}
