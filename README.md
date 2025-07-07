# Bullet Dodger - Survival Game 🎮

An exciting bullet dodging survival game built with pure HTML5 Canvas and JavaScript. Test your reflexes as you dodge bullets coming from all directions while the difficulty increases over time!

This is a **standalone webapp** - no build tools or dependencies required! Just open `index.html` in your browser and play.

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

### Simple Setup - No Installation Required!

This is a **standalone webapp** with no dependencies. Simply:

1. **Download or clone** this repository
2. **Open `index.html`** in any modern web browser
3. **Start playing** immediately!

### Alternative: Run with a Local Server

If you want to run it on a local server (optional):

```bash
# Using Python 3
python -m http.server 8000

# Using Python 2
python -S SimpleHTTPServer 8000

# Using Node.js (if you have it)
npx serve .
```

Then open `http://localhost:8000` in your browser.

## 🎮 Game Controls

| Key   | Action     |
| ----- | ---------- |
| W / ↑ | Move Up    |
| S / ↓ | Move Down  |
| A / ← | Move Left  |
| D / → | Move Right |

## 🛠️ Technical Details

- **Engine**: HTML5 Canvas with 2D rendering context
- **Framework**: Pure Vanilla JavaScript (no build tools or frameworks)
- **Animation**: RequestAnimationFrame for smooth 60fps gameplay
- **Physics**: Custom collision detection and particle systems
- **Styling**: Modern CSS with gradients, shadows, and responsive design
- **Deployment**: Standalone files - works anywhere, no server required

## 🎨 Game Elements

- **Player**: Green glowing circle that responds to your controls
- **Bullets**: Colorful projectiles with trailing effects
- **Particles**: Visual effects for explosions and movement trails
- **Background**: Animated starfield with gradient effects
- **UI**: Real-time score and timer display

## 📱 Mobile Support

The game is responsive and works on mobile devices, though desktop is recommended for the best experience due to the precision required for bullet dodging.

## 🔧 Development

The project is a simple, standalone webapp with this structure:

```
/
├── index.html       # Complete HTML structure and setup
├── style.css        # All game styling and UI
├── script.js        # Complete game logic and mechanics
├── README.md        # This file
└── .gitignore       # Git ignore file
```

### Key Features

- **No Build Process**: Pure HTML/CSS/JavaScript - edit and refresh!
- **No Dependencies**: Zero npm packages or external libraries
- **Portable**: Works offline, can be hosted anywhere
- **Simple**: Easy to understand and modify

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

## 📁 File Structure

- **`index.html`** - Main HTML file with game container and UI elements
- **`style.css`** - Complete styling including animations and responsive design
- **`script.js`** - Full game engine with player, bullets, collision detection, and scoring
- **`README.md`** - Documentation (this file)

## 🌐 Deployment

Since this is a standalone webapp, you can deploy it anywhere:

- **GitHub Pages**: Just push to a repository and enable Pages
- **Netlify**: Drag and drop the files to netlify.com
- **Any Web Server**: Upload files to any hosting service
- **Local Network**: Share via local server for LAN gaming

## 🤝 Contributing

Feel free to fork this project and submit pull requests for improvements! Since it's pure HTML/CSS/JavaScript, it's easy to modify and enhance.

## 📄 License

This project is open source and available under the MIT License.
