# Fox Courier Game 🦊📦

A 2D top-down horror delivery game built with Phaser 3 and TypeScript.

## 🎮 Gameplay
You are a fox courier delivering packages in a spooky forest at night.
- **Goal**: Deliver all packages to the designated houses before time runs out.
- **Avoid**: Ghosts and running out of stamina.
- **Nights**: survive 3 progressively harder nights.

## 🕹️ Controls
- **WASD**: Move
- **SHIFT**: Sprint
- **F**: Interact / Knock on doors
- **E**: Flashlight toggle (if available)
- **ESC**: Pause Game

## 🛠️ Setup & Run

### Prerequisites
- Node.js (v14 or higher recommended)
- NPM

### Installation
```bash
npm install
```

### Development
Run the development server with live reload:
```bash
npm run dev
```

### Build
Build the project for production:
```bash
npm run build
```
The output will be in the `dist/` folder.

## 📁 Project Structure
- `src/`: TypeScript source code
  - `scenes/`: Phaser scenes (MainMenu, GameScene)
  - `entities/`: Game objects (Player, Enemy)
  - `systems/`: Game systems (UI, Map, Sound, etc.)
  - `config/`: Configuration constants
- `assets/`: Game assets (Images, Audio)
- `dist/`: Compiled JavaScript output

## 📝 License
Proprietary / Private Use
