import {
  TILE_SIZE, resetMap, drawMap, countRemainingDots
} from "./map.js";
import {
  createPlayer, drawPlayer, updatePlayer, resetPlayer
} from "./player.js";
import {
  createGhosts, drawGhost, updateGhosts, resetGhosts
} from "./ghosts.js";
import { getBestScore, saveScore } from "./storage.js";
import { playCollectSound, playPowerSound } from "./audio.js";

export class Game {
  constructor(canvas, onUIUpdate, onGameEnd) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.onUIUpdate = onUIUpdate;
    this.onGameEnd = onGameEnd;

    this.player = createPlayer();
    this.ghosts = createGhosts();
    this.score = 0;
    this.lives = 3;
    this.level = 1;
    this.powerUntil = 0;
    this.running = false;
    this.ended = false;
    this.lastTime = 0;
    this.animationId = null;
    this.boundLoop = (time) => this.loop(time);
  }

  start() {
    if (this.ended) this.newGame();
    this.running = true;
    this.lastTime = 0;
    this.animationId = requestAnimationFrame(this.boundLoop);
  }

  pause() {
    this.running = false;
    if (this.animationId) cancelAnimationFrame(this.animationId);
  }

  newGame() {
    this.pause();
    this.score = 0;
    this.lives = 3;
    this.level = 1;
    this.powerUntil = 0;
    this.ended = false;
    this.player = createPlayer();
    this.ghosts = createGhosts();
    resetMap(this.level);
    this.onUIUpdate(this.getStats());
    this.draw();
  }

  loop(time) {
    if (!this.running) return;
    const delta = this.lastTime ? Math.min((time - this.lastTime) / 16.67, 2) : 1;
    this.lastTime = time;

    this.update(delta);
    this.draw();
    this.onUIUpdate(this.getStats());

    if (this.running) this.animationId = requestAnimationFrame(this.boundLoop);
  }

  update(delta) {
    if (this.ended) return;

    const now = Date.now();
    const powered = now < this.powerUntil;

    this.player.speed = 2.2 * delta;
    updatePlayer(this.player, (type) => {
      if (type === "dot") {
        this.score += 10;
        playCollectSound();
      } else if (type === "power") {
        this.score += 50;
        this.powerUntil = Date.now() + 8000;
        playPowerSound();
      }
    });

    for (const ghost of this.ghosts) {
      ghost.speed = 1.35 * delta;
    }
    updateGhosts(this.ghosts, this.player, powered, this.level);

    this.checkCollisions(powered);

    if (countRemainingDots() === 0 && !this.ended) {
  this.level += 1;
  this.powerUntil = 0;

  resetMap(this.level);
  resetPlayer(this.player);
  resetGhosts(this.ghosts);

  this.onUIUpdate(this.getStats());
    }
  }

  checkCollisions(powered) {
    for (const ghost of this.ghosts) {
      const distance = Math.hypot(this.player.x - ghost.x, this.player.y - ghost.y);
      if (distance < this.player.radius + ghost.radius - 4) {
        if (powered) {
          this.score += 200;
          ghost.x = 300;
          ghost.y = 300;
        } else {
          this.lives -= 1;
          if (this.lives <= 0) {
            this.finish(false);
          } else {
            resetPlayer(this.player);
            resetGhosts(this.ghosts);
            this.powerUntil = 0;
          }
        }
        break;
      }
    }
  }

  finish(won) {
    this.ended = true;
    this.pause();
    const scores = saveScore(this.score);
    this.onUIUpdate(this.getStats());
    this.onGameEnd({ won, score: this.score, scores });
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = "#030611";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    const powered = Date.now() < this.powerUntil;
    drawMap(this.ctx, powered);
    this.ghosts.forEach(ghost => drawGhost(this.ctx, ghost, powered));
    drawPlayer(this.ctx, this.player);

    if (powered) {
      this.ctx.fillStyle = "#7db4ff";
      this.ctx.font = "bold 13px monospace";
      this.ctx.fillText("POWER MODE", 12, 20);
    }
  }

  getStats() {
    return {
      score: this.score,
      highScore: Math.max(getBestScore(), this.score),
      lives: this.lives,
      level: this.level
    };
  }

  setDirection(direction) {
    this.player.nextDirection = direction;
  }
}
