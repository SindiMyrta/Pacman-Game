# Pac-Man Arcade

A Pac-Man-inspired browser arcade game built with HTML5, CSS3, JavaScript ES Modules and the Canvas API.

## Features

- Canvas-based maze rendering and animated player
- Keyboard controls (Arrow Keys / WASD)
- Collectible dots and power pellets
- Four ghosts with different movement behaviors
- BFS pathfinding for ghost navigation
- Score, lives and level tracking
- Power mode and ghost-eating bonus
- Main menu, instructions, pause and restart
- High scores saved with Local Storage
- Procedural sound effects using the Web Audio API
- Responsive layout

## Technologies

- HTML5
- CSS3
- Vanilla JavaScript (ES Modules)
- Canvas API
- Web Audio API
- Local Storage
- Breadth-First Search (BFS)

## Run locally

Because the project uses JavaScript modules, run it through a local development server.

1. Open the folder in Visual Studio Code.
2. Install the **Live Server** extension if you do not already have it.
3. Right-click `index.html`.
4. Choose **Open with Live Server**.

## Controls

- Arrow Keys / WASD: Move
- ESC: Pause
- Start / Restart: Use the on-screen buttons

## Project structure

Pacman-Game-Advanced/
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── main.js
│   ├── game.js
│   ├── map.js
│   ├── player.js
│   ├── ghosts.js
│   ├── storage.js
│   └── audio.js
└── README.md


## Notes

This is an educational Pac-Man-inspired project, not an official reproduction of the original game. High scores are stored locally in the browser and are not shared between devices.
