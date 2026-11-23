import { Game } from "./game.js";
import { getBestScore, getHighScores } from "./storage.js";
import { isSoundEnabled, setSoundEnabled } from "./audio.js";

const canvas = document.getElementById("gameCanvas");
const gameShell = document.querySelector(".game-shell");
const fullscreenBtn = document.getElementById("fullscreenBtn");
const scoreEl = document.getElementById("score");
const highScoreEl = document.getElementById("highScore");
const livesEl = document.getElementById("lives");
const levelEl = document.getElementById("level");
const overlay = document.getElementById("overlay");
const titleEl = document.getElementById("overlayTitle");
const textEl = document.getElementById("overlayText");
const actionsEl = document.getElementById("overlayActions");

let game;
let started = false;

function updateHUD(stats) {
  scoreEl.textContent = stats.score;
  highScoreEl.textContent = stats.highScore;
  livesEl.textContent = stats.lives;
  levelEl.textContent = stats.level;
}

function showOverlay(title, text, buttons) {
  document.getElementById("scoreDetails")?.remove();
  titleEl.innerHTML = title;
  textEl.textContent = text;
  actionsEl.innerHTML = "";
  buttons.forEach(({ label, action, secondary = false }) => {
    const button = document.createElement("button");
    button.textContent = label;
    if (secondary) button.classList.add("secondary");
    button.addEventListener("click", action);
    actionsEl.appendChild(button);
  });
  overlay.classList.remove("hidden");
}

function hideOverlay() {
  overlay.classList.add("hidden");
}

function startGame() {
  if (!started) {
    game.newGame();
    started = true;
  }
  hideOverlay();
  game.start();
}

function mainMenu() {
  game?.pause();
  showOverlay(
    "PAC<span>•</span>MAN",
    "Collect every dot, use power pellets, and stay away from the ghosts.",
    [
      { label: "START GAME", action: startGame },
      { label: "HOW TO PLAY", action: showInstructions, secondary: true },
      { label: "HIGH SCORES", action: showScores, secondary: true },
      { label: `SETTINGS: SOUND ${isSoundEnabled() ? "ON" : "OFF"}`, action: toggleSound, secondary: true }
    ]
  );
}

function showInstructions() {
  showOverlay(
    "HOW TO PLAY",
    "Move with Arrow Keys or WASD. Press ESC to pause. Small dots give 10 points. Power pellets give 50 points and let you eat ghosts for 8 seconds. Each ghost eaten gives 200 points.",
    [
      { label: "BACK TO MENU", action: mainMenu },
      { label: "START GAME", action: startGame }
    ]
  );
}

function showScores() {
  const scores = getHighScores();
  const list = scores.length
    ? `<ol class="score-list">${scores.map(item => `<li><span>${item.date}</span><strong>${item.score}</strong></li>`).join("")}</ol>`
    : "<p>No scores yet. Play a game to set your first record!</p>";

  showOverlay("HIGH SCORES", "Your top five local records:", [
    { label: "BACK TO MENU", action: mainMenu }
  ]);
  const content = document.createElement("div");
  content.id = "scoreDetails";
  content.innerHTML = list;
  textEl.after(content);
}

function toggleSound() {
  const next = !isSoundEnabled();
  setSoundEnabled(next);
  mainMenu();
}

async function toggleFullscreen() {
  try {
    if (!document.fullscreenElement) {
      await gameShell.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  } catch (error) {
    console.error("Fullscreen error:", error);
  }
}

function updateFullscreenButton() {
  if (document.fullscreenElement) {
    fullscreenBtn.textContent = "⛶ Exit Fullscreen";
  } else {
    fullscreenBtn.textContent = "⛶ Fullscreen";
  }
}

fullscreenBtn.addEventListener("click", toggleFullscreen);

document.addEventListener("fullscreenchange", updateFullscreenButton);

function pauseGame() {
  if (!game || !started) return;
  game.pause();
  showOverlay("PAUSED", "Take a break. Your game is waiting.", [
    { label: "RESUME", action: () => { hideOverlay(); game.start(); } },
    { label: "RESTART", action: () => { game.newGame(); hideOverlay(); game.start(); } },
    { label: "MAIN MENU", action: mainMenu, secondary: true }
  ]);
}

game = new Game(canvas, updateHUD, ({ won, score }) => {
  showOverlay(
    won ? "YOU WIN!" : "GAME OVER",
    `Final score: ${score}. ${won ? "Amazing work!" : "Try again and beat your record!"}`,
    [
      { label: "PLAY AGAIN", action: () => { game.newGame(); hideOverlay(); game.start(); } },
      { label: "MAIN MENU", action: mainMenu, secondary: true }
    ]
  );
});

const keyDirections = {
  ArrowRight: "right", ArrowLeft: "left",
  ArrowUp: "up", ArrowDown: "down",
  d: "right", a: "left", w: "up", s: "down"
};

document.addEventListener("keydown", (event) => {
  const direction = keyDirections[event.key];
  if (direction) {
    event.preventDefault();
    if (started && overlay.classList.contains("hidden")) game.setDirection(direction);
    else if (!started) startGame();
  }

  if (
  event.key === "Escape" &&
  !document.fullscreenElement &&
  started &&
  overlay.classList.contains("hidden")
) {
  pauseGame();
}
});

updateHUD({
  score: 0,
  highScore: getBestScore(),
  lives: 3,
  level: 1
});
game = game || null;
mainMenu();
