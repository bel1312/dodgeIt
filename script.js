// Game state
let gameState = "menu"; // 'menu', 'playing', 'gameOver'
let score = 0;
let startTime = 0;
let currentTime = 0;
let animationId = null;

// Canvas and context
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// UI elements
const scoreElement = document.getElementById("score");
const timerElement = document.getElementById("timer");
const gameOverElement = document.getElementById("gameOver");
const instructionsElement = document.getElementById("instructions");
const finalScoreElement = document.getElementById("finalScore");
const finalTimeElement = document.getElementById("finalTime");
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");

// Game objects
const player = {
  x: 0,
  y: 0,
  radius: 15,
  speed: 5,
  color: "#00ff88",
};

const bullets = [];
const particles = [];

// Input handling
const keys = {
  w: false,
  s: false,
  a: false,
  d: false,
  ArrowUp: false,
  ArrowDown: false,
  ArrowLeft: false,
  ArrowRight: false,
};

// Game settings
let bulletSpawnRate = 0.02;
let bulletSpeed = 2;
let maxBullets = 50;

// Event listeners
document.addEventListener("keydown", (e) => {
  if (
    e.code === "KeyW" ||
    e.code === "KeyA" ||
    e.code === "KeyS" ||
    e.code === "KeyD" ||
    e.code === "ArrowUp" ||
    e.code === "ArrowDown" ||
    e.code === "ArrowLeft" ||
    e.code === "ArrowRight"
  ) {
    e.preventDefault();
    // Handle both WASD and arrow keys properly
    if (e.code === "KeyW" || e.code === "ArrowUp") keys.w = keys.ArrowUp = true;
    if (e.code === "KeyS" || e.code === "ArrowDown") keys.s = keys.ArrowDown = true;
    if (e.code === "KeyA" || e.code === "ArrowLeft") keys.a = keys.ArrowLeft = true;
    if (e.code === "KeyD" || e.code === "ArrowRight") keys.d = keys.ArrowRight = true;
  }
});

document.addEventListener("keyup", (e) => {
  if (
    e.code === "KeyW" ||
    e.code === "KeyA" ||
    e.code === "KeyS" ||
    e.code === "KeyD" ||
    e.code === "ArrowUp" ||
    e.code === "ArrowDown" ||
    e.code === "ArrowLeft" ||
    e.code === "ArrowRight"
  ) {
    e.preventDefault();
    // Handle both WASD and arrow keys properly
    if (e.code === "KeyW" || e.code === "ArrowUp") keys.w = keys.ArrowUp = false;
    if (e.code === "KeyS" || e.code === "ArrowDown") keys.s = keys.ArrowDown = false;
    if (e.code === "KeyA" || e.code === "ArrowLeft") keys.a = keys.ArrowLeft = false;
    if (e.code === "KeyD" || e.code === "ArrowRight") keys.d = keys.ArrowRight = false;
  }
});

startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", startGame);

// Resize canvas
function resizeCanvas() {
  const container = document.getElementById("gameContainer");
  canvas.width = container.clientWidth;
  canvas.height = container.clientHeight;

  // Reset player position to center
  player.x = canvas.width / 2;
  player.y = canvas.height / 2;
}

// Initialize
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// Bullet class
class Bullet {
  constructor(x, y, targetX, targetY, speed, isAsteroid = false) {
    this.x = x;
    this.y = y;
    this.radius = isAsteroid ? 12 : 4;
    this.speed = speed * (isAsteroid ? 0.7 : 1); // Asteroids move slower
    this.isAsteroid = isAsteroid;
    this.rotation = 0;
    this.rotationSpeed = (Math.random() - 0.5) * 0.1;

    // Calculate direction vector
    const dx = targetX - x;
    const dy = targetY - y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    this.vx = (dx / distance) * this.speed;
    this.vy = (dy / distance) * this.speed;

    if (isAsteroid) {
      this.color = `hsl(${Math.random() * 30 + 15}, 60%, 40%)`; // Brown/orange colors
      this.asteroidVertices = this.generateAsteroidShape();
    } else {
      this.color = `hsl(${Math.random() * 60 + 300}, 100%, 60%)`;
    }
    
    this.trail = [];
  }

  generateAsteroidShape() {
    const vertices = [];
    const numVertices = 8 + Math.floor(Math.random() * 4); // 8-11 vertices
    
    for (let i = 0; i < numVertices; i++) {
      const angle = (i / numVertices) * Math.PI * 2;
      const radiusVariation = 0.7 + Math.random() * 0.6; // Random radius between 0.7-1.3
      const x = Math.cos(angle) * this.radius * radiusVariation;
      const y = Math.sin(angle) * this.radius * radiusVariation;
      vertices.push({ x, y });
    }
    
    return vertices;
  }

  update() {
    this.trail.push({ x: this.x, y: this.y });
    if (this.trail.length > (this.isAsteroid ? 6 : 8)) {
      this.trail.shift();
    }

    this.x += this.vx;
    this.y += this.vy;
    
    // Rotate asteroids
    if (this.isAsteroid) {
      this.rotation += this.rotationSpeed;
    }
  }

  draw() {
    if (this.isAsteroid) {
      this.drawAsteroid();
    } else {
      this.drawRegularBullet();
    }
  }

  drawRegularBullet() {
    // Draw trail
    for (let i = 0; i < this.trail.length; i++) {
      const alpha = i / this.trail.length;
      ctx.globalAlpha = alpha * 0.5;
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(
        this.trail[i].x,
        this.trail[i].y,
        this.radius * alpha,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    // Draw bullet
    ctx.globalAlpha = 1;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();

    // Add glow effect
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  drawAsteroid() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    // Draw asteroid trail (darker and chunkier)
    for (let i = 0; i < this.trail.length; i++) {
      const alpha = i / this.trail.length;
      ctx.globalAlpha = alpha * 0.3;
      const trailX = this.trail[i].x - this.x;
      const trailY = this.trail[i].y - this.y;
      
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(trailX, trailY, this.radius * alpha * 0.8, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;

    // Draw asteroid shape
    ctx.fillStyle = this.color;
    ctx.strokeStyle = `hsl(${Math.random() * 30 + 15}, 80%, 25%)`;
    ctx.lineWidth = 2;
    
    ctx.beginPath();
    ctx.moveTo(this.asteroidVertices[0].x, this.asteroidVertices[0].y);
    
    for (let i = 1; i < this.asteroidVertices.length; i++) {
      ctx.lineTo(this.asteroidVertices[i].x, this.asteroidVertices[i].y);
    }
    
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Add some texture details
    ctx.fillStyle = `hsl(${Math.random() * 30 + 15}, 40%, 30%)`;
    for (let i = 0; i < 3; i++) {
      const x = (Math.random() - 0.5) * this.radius * 0.8;
      const y = (Math.random() - 0.5) * this.radius * 0.8;
      const size = Math.random() * 2 + 1;
      
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }

    // Add glow effect for asteroids
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 15;
    ctx.globalAlpha = 0.3;
    
    ctx.beginPath();
    ctx.moveTo(this.asteroidVertices[0].x, this.asteroidVertices[0].y);
    for (let i = 1; i < this.asteroidVertices.length; i++) {
      ctx.lineTo(this.asteroidVertices[i].x, this.asteroidVertices[i].y);
    }
    ctx.closePath();
    ctx.fill();
    
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  isOffScreen() {
    return (
      this.x < -50 ||
      this.x > canvas.width + 50 ||
      this.y < -50 ||
      this.y > canvas.height + 50
    );
  }
}

// Particle class for effects
class Particle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 10;
    this.vy = (Math.random() - 0.5) * 10;
    this.life = 1;
    this.decay = Math.random() * 0.02 + 0.01;
    this.color = color;
    this.size = Math.random() * 3 + 1;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vx *= 0.98;
    this.vy *= 0.98;
    this.life -= this.decay;
  }

  draw() {
    ctx.globalAlpha = this.life;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

function spawnBullet() {
  if (bullets.length >= maxBullets) return;

  const side = Math.floor(Math.random() * 4);
  let x, y;

  switch (side) {
    case 0: // Top
      x = Math.random() * canvas.width;
      y = -20;
      break;
    case 1: // Right
      x = canvas.width + 20;
      y = Math.random() * canvas.height;
      break;
    case 2: // Bottom
      x = Math.random() * canvas.width;
      y = canvas.height + 20;
      break;
    case 3: // Left
      x = -20;
      y = Math.random() * canvas.height;
      break;
  }

  // 15% chance to spawn an asteroid bullet (increases with difficulty)
  const survivalTime = (currentTime - startTime) / 1000;
  const asteroidChance = Math.min(0.25, 0.15 + (survivalTime / 60) * 0.1);
  const isAsteroid = Math.random() < asteroidChance;

  bullets.push(new Bullet(x, y, player.x, player.y, bulletSpeed, isAsteroid));
}

function updatePlayer() {
  let dx = 0;
  let dy = 0;

  if (keys.a || keys.ArrowLeft) dx -= 1;
  if (keys.d || keys.ArrowRight) dx += 1;
  if (keys.w || keys.ArrowUp) dy -= 1;
  if (keys.s || keys.ArrowDown) dy += 1;

  // Normalize diagonal movement
  if (dx !== 0 && dy !== 0) {
    dx *= 0.707;
    dy *= 0.707;
  }

  player.x += dx * player.speed;
  player.y += dy * player.speed;

  // Keep player in bounds
  player.x = Math.max(
    player.radius,
    Math.min(canvas.width - player.radius, player.x)
  );
  player.y = Math.max(
    player.radius,
    Math.min(canvas.height - player.radius, player.y)
  );
}

function updateBullets() {
  for (let i = bullets.length - 1; i >= 0; i--) {
    const bullet = bullets[i];
    bullet.update();

    if (bullet.isOffScreen()) {
      bullets.splice(i, 1);
      continue;
    }

    // Check collision with player
    const dx = bullet.x - player.x;
    const dy = bullet.y - player.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < bullet.radius + player.radius) {
      gameOver();
      return;
    }
  }
}

function updateParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    const particle = particles[i];
    particle.update();

    if (particle.life <= 0) {
      particles.splice(i, 1);
    }
  }
}

function increaseDifficulty() {
  const survivalTime = (currentTime - startTime) / 1000;

  // Increase bullet spawn rate every 5 seconds
  bulletSpawnRate = Math.min(0.08, 0.02 + (survivalTime / 5) * 0.01);

  // Increase bullet speed every 10 seconds
  bulletSpeed = Math.min(4, 2 + (survivalTime / 10) * 0.5);

  // Increase max bullets every 15 seconds
  maxBullets = Math.min(100, 50 + Math.floor(survivalTime / 15) * 10);

  // Calculate score based on survival time and difficulty
  score = Math.floor(survivalTime * 10 + (survivalTime * survivalTime) / 10);
}

function drawPlayer() {
  // Player glow
  ctx.shadowColor = player.color;
  ctx.shadowBlur = 20;

  // Player body
  ctx.fillStyle = player.color;
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
  ctx.fill();

  // Player inner circle
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.radius * 0.6, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowBlur = 0;
}

function drawBackground() {
  // Animated starfield
  const time = currentTime * 0.001;
  ctx.fillStyle = "#ffffff";

  for (let i = 0; i < 50; i++) {
    const x = (i * 123.45) % canvas.width;
    const y = (i * 67.89 + time * 20) % canvas.height;
    const alpha = Math.sin(time + i) * 0.3 + 0.3;

    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.arc(x, y, 1, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.globalAlpha = 1;
}

function render() {
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw background
  drawBackground();

  // Draw game objects
  drawPlayer();

  bullets.forEach((bullet) => bullet.draw());
  particles.forEach((particle) => particle.draw());

  // Add screen edge glow effect
  const gradient = ctx.createRadialGradient(
    canvas.width / 2,
    canvas.height / 2,
    0,
    canvas.width / 2,
    canvas.height / 2,
    Math.max(canvas.width, canvas.height) / 2
  );
  gradient.addColorStop(0, "rgba(100, 108, 255, 0)");
  gradient.addColorStop(1, "rgba(100, 108, 255, 0.1)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function updateUI() {
  const survivalTime = (currentTime - startTime) / 1000;
  scoreElement.textContent = `Score: ${score}`;
  timerElement.textContent = `Time: ${survivalTime.toFixed(1)}s`;
}

function gameLoop() {
  currentTime = Date.now();

  if (gameState === "playing") {
    updatePlayer();
    updateBullets();
    updateParticles();
    increaseDifficulty();

    // Spawn bullets
    if (Math.random() < bulletSpawnRate) {
      spawnBullet();
    }

    // Add player trail particles
    if (Math.random() < 0.3) {
      particles.push(
        new Particle(
          player.x + (Math.random() - 0.5) * player.radius,
          player.y + (Math.random() - 0.5) * player.radius,
          player.color
        )
      );
    }

    updateUI();
  }

  render();
  animationId = requestAnimationFrame(gameLoop);
}

function startGame() {
  gameState = "playing";
  score = 0;
  startTime = Date.now();
  currentTime = startTime;

  // Reset game objects
  bullets.length = 0;
  particles.length = 0;
  bulletSpawnRate = 0.02;
  bulletSpeed = 2;
  maxBullets = 50;

  // Reset player position
  player.x = canvas.width / 2;
  player.y = canvas.height / 2;

  // Hide menus
  instructionsElement.classList.add("hidden");
  gameOverElement.classList.add("hidden");

  // Start game loop if not already running
  if (!animationId) {
    gameLoop();
  }
}

function gameOver() {
  gameState = "gameOver";

  const survivalTime = (currentTime - startTime) / 1000;
  finalScoreElement.textContent = score;
  finalTimeElement.textContent = `${survivalTime.toFixed(1)}s`;

  // Create explosion particles
  for (let i = 0; i < 20; i++) {
    particles.push(new Particle(player.x, player.y, "#ff4444"));
  }

  gameOverElement.classList.remove("hidden");
}

// Start the game loop
gameLoop();
