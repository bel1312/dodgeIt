# Bullet Dodger - Survival Game 🎮

An exciting bullet dodging survival game built with HTML5 Canvas and JavaScript. Test your reflexes as you dodge bullets coming from all directions while the difficulty increases over time!

## 🎯 Game Features

- **Intense Bullet Dodging**: Navigate your player model through waves of bullets coming from all directions
- **Progressive Difficulty**: The game gets harder over time with more bullets, faster speeds, and increased spawn rates
- **Real-time Scoring**: Score increases based on survival time and difficulty level
- **Smooth Controls**: Responsive WASD or arrow key controls for precise movement
- **Modern UI**: Beautiful gradient backgrounds, glowing effects, and particle systems
- **Responsive Design**: Works on desktop and mobile devices

## 🕹️ How to Play

1. **Movement**: Use WASD keys or arrow keys to move your character
2. **Objective**: Dodge all bullets and survive as long as possible
3. **Scoring**: Your score increases based on how long you survive
4. **Difficulty**: Every few seconds, the game becomes more challenging:
   - More bullets spawn
   - Bullets move faster
   - Maximum bullet count increases

## 🚀 Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Clone or download this repository
2. Navigate to the project directory
3. Install dependencies:
   ```bash
   npm install
   ```

### Running the Game

#### Development Mode

```bash
npm run dev
```

This will start a local development server. Open your browser and navigate to the URL shown in the terminal (usually `http://localhost:5173`).

#### Production Build

```bash
npm run build
```

This creates an optimized production build in the `dist` folder.

#### Preview Production Build

```bash
npm run preview
```

Preview the production build locally.

## 🎮 Game Controls

| Key   | Action     |
| ----- | ---------- |
| W / ↑ | Move Up    |
| S / ↓ | Move Down  |
| A / ← | Move Left  |
| D / → | Move Right |

## 🛠️ Technical Details

- **Engine**: HTML5 Canvas with 2D rendering context
- **Framework**: Vanilla JavaScript with Vite build tool
- **Animation**: RequestAnimationFrame for smooth 60fps gameplay
- **Physics**: Custom collision detection and particle systems
- **Styling**: Modern CSS with gradients, shadows, and responsive design

## 🎨 Game Elements

- **Player**: Green glowing circle that responds to your controls
- **Bullets**: Colorful projectiles with trailing effects
- **Particles**: Visual effects for explosions and movement trails
- **Background**: Animated starfield with gradient effects
- **UI**: Real-time score and timer display

## 📱 Mobile Support

The game is responsive and works on mobile devices, though desktop is recommended for the best experience due to the precision required for bullet dodging.

## 🔧 Development

The project structure:

```
/
├── src/
│   ├── main.js      # Game logic and mechanics
│   └── style.css    # Game styling and UI
├── index.html       # HTML structure
├── package.json     # Dependencies and scripts
└── README.md        # This file
```

### Key Game Mechanics

1. **Collision Detection**: Circle-to-circle collision detection between player and bullets
2. **Difficulty Scaling**: Algorithmic increase in spawn rate, speed, and bullet count
3. **Particle System**: Visual effects for enhanced gameplay experience
4. **Performance Optimization**: Efficient object pooling and cleanup

## 🏆 High Score Tips

- Stay near the center of the screen for maximum escape options
- Watch bullet patterns and anticipate movement
- Use smooth, gradual movements rather than sharp turns
- The longer you survive, the exponentially higher your score!

## 🤝 Contributing

Feel free to fork this project and submit pull requests for improvements!

## 📄 License

This project is open source and available under the MIT License.
