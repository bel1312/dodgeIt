// Game state
let gameState = "menu"; // 'menu', 'playing', 'gameOver'
let score = 0;
let personalBest = 0;
let startTime = 0;
let currentTime = 0;
let pausedTime = 0;
let isGamePaused = false;
let animationId = null;
let lastBossTime = 0;
let bossActive = false;

// Canvas and context
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// UI elements
const scoreElement = document.getElementById("score");
const timerElement = document.getElementById("timer");
const personalBestElement = document.getElementById("personalBest");
const bossWarningElement = document.getElementById("bossWarning");
const gameOverElement = document.getElementById("gameOver");
const instructionsElement = document.getElementById("instructions");
const finalScoreElement = document.getElementById("finalScore");
const finalTimeElement = document.getElementById("finalTime");
const gameOverBestElement = document.getElementById("gameOverBest");
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
const buffs = [];
let boss = null;

// Buff system
let activeBuffs = {
  shield: { active: false, endTime: 0 },
  speed: { active: false, endTime: 0 },
  size: { active: false, endTime: 0 }
};

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

// Personal best functions
function loadPersonalBest() {
  const saved = localStorage.getItem("bulletDodgerPersonalBest");
  personalBest = saved ? parseInt(saved) : 0;
  updatePersonalBestDisplay();
}

function savePersonalBest() {
  localStorage.setItem("bulletDodgerPersonalBest", personalBest.toString());
}

function updatePersonalBestDisplay() {
  personalBestElement.textContent = `Best: ${personalBest}`;
}

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
    if (e.code === "KeyS" || e.code === "ArrowDown")
      keys.s = keys.ArrowDown = true;
    if (e.code === "KeyA" || e.code === "ArrowLeft")
      keys.a = keys.ArrowLeft = true;
    if (e.code === "KeyD" || e.code === "ArrowRight")
      keys.d = keys.ArrowRight = true;
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
    if (e.code === "KeyW" || e.code === "ArrowUp")
      keys.w = keys.ArrowUp = false;
    if (e.code === "KeyS" || e.code === "ArrowDown")
      keys.s = keys.ArrowDown = false;
    if (e.code === "KeyA" || e.code === "ArrowLeft")
      keys.a = keys.ArrowLeft = false;
    if (e.code === "KeyD" || e.code === "ArrowRight")
      keys.d = keys.ArrowRight = false;
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
      // Check if player has shield buff
      if (activeBuffs.shield.active) {
        // Destroy bullet but don't kill player
        bullets.splice(i, 1);
        // Add shield effect particles
        for (let j = 0; j < 8; j++) {
          particles.push(new Particle(bullet.x, bullet.y, "#00aaff"));
        }
        continue;
      }
      
      gameOver();
      return;
    }
  }
}

function updateBoss() {
  const survivalTime = (currentTime - startTime) / 1000;

  // Simple boss spawning every 60 seconds
  const timeSinceLastBoss = survivalTime - lastBossTime;

  // Show warning 5 seconds before boss spawns
  if (!bossActive && timeSinceLastBoss >= 55 && timeSinceLastBoss < 60) {
    bossWarningElement.classList.remove("hidden");
  } else {
    bossWarningElement.classList.add("hidden");
  }

  // Spawn boss every 60 seconds
  if (!bossActive && timeSinceLastBoss >= 60) {
    boss = new Boss();
    bossActive = true;
    lastBossTime = survivalTime;
    bossWarningElement.classList.add("hidden");

    // Add warning particles
    for (let i = 0; i < 50; i++) {
      particles.push(
        new Particle(
          Math.random() * canvas.width,
          Math.random() * canvas.height,
          "#ff0066"
        )
      );
    }
  }

  // Update boss if active
  if (boss && bossActive) {
    boss.update();

    // Safety check: if boss is null after update, clean up
    if (!boss) {
      bossActive = false;
      return;
    }

    // Check collision with player
    if (boss.checkCollision(player.x, player.y, player.radius)) {
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

  // Increase bullet spawn rate every 8 seconds (slowed down from 5)
  bulletSpawnRate = Math.min(0.06, 0.02 + (survivalTime / 8) * 0.008);

  // Increase bullet speed every 15 seconds (slowed down from 10)
  bulletSpeed = Math.min(3.5, 2 + (survivalTime / 15) * 0.4);

  // Increase max bullets every 20 seconds (slowed down from 15)
  maxBullets = Math.min(80, 50 + Math.floor(survivalTime / 20) * 8);

  // Calculate score based on survival time and difficulty
  score = Math.floor(survivalTime * 10 + (survivalTime * survivalTime) / 10);
}

function drawPlayer() {
  // Draw shield effect if active
  if (activeBuffs.shield.active) {
    ctx.shadowColor = "#00aaff";
    ctx.shadowBlur = 25;
    ctx.strokeStyle = "#00aaff";
    ctx.lineWidth = 3;
    ctx.globalAlpha = 0.6;
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius + 8, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  // Player glow (different color if speed buff active)
  ctx.shadowColor = activeBuffs.speed.active ? "#ffaa00" : player.color;
  ctx.shadowBlur = 20;

  // Player body (different color if size buff active)
  ctx.fillStyle = activeBuffs.size.active ? "#aa00ff" : player.color;
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
  buffs.forEach((buff) => buff.draw());

  // Draw boss if active
  if (boss && bossActive) {
    boss.draw();
  }

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

  if (gameState === "playing" && !isGamePaused) {
    updatePlayer();
    updateBullets();
    updateBoss();
    updateParticles();
    increaseDifficulty();
    updateBuffs();

    // Spawn bullets (reduced when boss is active)
    const spawnRate = bossActive ? bulletSpawnRate * 0.3 : bulletSpawnRate;
    if (Math.random() < spawnRate) {
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
  
  // Reset pause state
  isGamePaused = false;
  pausedTime = 0;

  // Reset game objects
  bullets.length = 0;
  particles.length = 0;
  buffs.length = 0;
  bulletSpawnRate = 0.02;
  bulletSpeed = 2;
  maxBullets = 50;

  // Reset boss state
  boss = null;
  bossActive = false;
  lastBossTime = 0;

  // Reset buffs
  activeBuffs.shield.active = false;
  activeBuffs.speed.active = false;
  activeBuffs.size.active = false;

  // Reset player to default state
  player.speed = 5;
  player.radius = 15;

  // Reset player position
  player.x = canvas.width / 2;
  player.y = canvas.height / 2;

  // Hide menus
  instructionsElement.classList.add("hidden");
  gameOverElement.classList.add("hidden");
  bossWarningElement.classList.add("hidden");

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

  // Check and update personal best
  if (score > personalBest) {
    personalBest = score;
    savePersonalBest();
    updatePersonalBestDisplay();
  }
  gameOverBestElement.textContent = personalBest;

  // Create explosion particles
  for (let i = 0; i < 20; i++) {
    particles.push(new Particle(player.x, player.y, "#ff4444"));
  }

  gameOverElement.classList.remove("hidden");
}

// Boss class
class Boss {
  constructor() {
    this.radius = 40; // Reduced from 60
    this.x = Math.random() * (canvas.width - this.radius * 2) + this.radius;
    this.y = Math.random() * (canvas.height - this.radius * 2) + this.radius;
    this.health = 1; // Boss has 1 health (touching kills player)
    this.speed = 1.5;
    this.color = "#ff0066";
    this.glowColor = "#ff3388";

    // Movement pattern
    this.targetX = this.x;
    this.targetY = this.y;
    this.moveTimer = 0;
    this.moveInterval = 2000; // Change direction every 2 seconds

    // Shooting pattern
    this.shootTimer = 0;
    this.shootInterval = 800; // Shoot every 0.8 seconds
    this.burstCount = 0;
    this.maxBursts = 5;

    // Visual effects
    this.pulsePhase = 0;
    this.tentacles = [];
    this.initializeTentacles();

    // Spawn timer
    this.spawnTime = Date.now();
    this.duration = 10000; // 10 seconds
  }

  initializeTentacles() {
    for (let i = 0; i < 8; i++) {
      this.tentacles.push({
        angle: (i / 8) * Math.PI * 2,
        length: this.radius * 0.8,
        phase: Math.random() * Math.PI * 2,
      });
    }
  }

  update() {
    const currentTime = Date.now();

    // Check if boss duration is over
    if (currentTime - this.spawnTime > this.duration) {
      // Spawn a random buff when boss dies
      this.spawnBuff();
      boss = null;
      bossActive = false;
      return;
    }

    // Update movement
    this.updateMovement();

    // Update shooting
    this.updateShooting();

    // Update visual effects
    this.pulsePhase += 0.1;
    this.tentacles.forEach((tentacle) => {
      tentacle.phase += 0.05;
    });
  }
  
  spawnBuff() {
    const buffTypes = ['shield', 'speed', 'size'];
    const randomType = buffTypes[Math.floor(Math.random() * buffTypes.length)];
    
    // Spawn buff at boss location
    buffs.push(new Buff(this.x, this.y, randomType));
    
    // Add some celebration particles
    for (let i = 0; i < 30; i++) {
      particles.push(new Particle(this.x, this.y, "#ffff00"));
    }
  }

  updateMovement() {
    this.moveTimer += 16; // Assuming 60fps

    if (this.moveTimer >= this.moveInterval) {
      // Pick new random target
      this.targetX =
        Math.random() * (canvas.width - this.radius * 2) + this.radius;
      this.targetY =
        Math.random() * (canvas.height - this.radius * 2) + this.radius;
      this.moveTimer = 0;
    }

    // Move towards target
    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 5 && distance > 0) {
      // Added safety check
      this.x += (dx / distance) * this.speed;
      this.y += (dy / distance) * this.speed;
    }

    // Keep boss in bounds
    this.x = Math.max(
      this.radius,
      Math.min(canvas.width - this.radius, this.x)
    );
    this.y = Math.max(
      this.radius,
      Math.min(canvas.height - this.radius, this.y)
    );
  }

  updateShooting() {
    this.shootTimer += 16;

    if (this.shootTimer >= this.shootInterval) {
      this.shootBurst();
      this.shootTimer = 0;
      this.burstCount++;

      if (this.burstCount >= this.maxBursts) {
        this.burstCount = 0;
        this.shootInterval = 800 + Math.random() * 1200; // Vary shoot interval
      }
    }
  }

  shootBurst() {
    const numBullets = 8; // Shoot in 8 directions
    const speed = bulletSpeed * 1.3; // Reduced from 1.8 to 1.3

    for (let i = 0; i < numBullets; i++) {
      const angle = (i / numBullets) * Math.PI * 2;
      const bulletX = this.x + Math.cos(angle) * this.radius;
      const bulletY = this.y + Math.sin(angle) * this.radius;
      const targetX = this.x + Math.cos(angle) * 1000;
      const targetY = this.y + Math.sin(angle) * 1000;

      bullets.push(
        new Bullet(bulletX, bulletY, targetX, targetY, speed, false)
      );
    }

    // Add some targeted bullets at player
    for (let i = 0; i < 3; i++) {
      const spread = (Math.random() - 0.5) * 0.5; // Small spread
      const bulletX = this.x;
      const bulletY = this.y;
      const targetX = player.x + spread * 100;
      const targetY = player.y + spread * 100;

      bullets.push(
        new Bullet(bulletX, bulletY, targetX, targetY, speed * 1.1, false)
      ); // Reduced from 1.2 to 1.1
    }
  }

  draw() {
    ctx.save();

    // Draw tentacles/appendages
    this.drawTentacles();

    // Draw main body with pulsing effect
    const pulseSize = Math.sin(this.pulsePhase) * 5 + this.radius;

    // Outer glow
    ctx.shadowColor = this.glowColor;
    ctx.shadowBlur = 30;
    ctx.fillStyle = this.glowColor;
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    ctx.arc(this.x, this.y, pulseSize + 10, 0, Math.PI * 2);
    ctx.fill();

    // Main body
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 20;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, pulseSize, 0, Math.PI * 2);
    ctx.fill();

    // Inner details
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#ffffff";
    ctx.globalAlpha = 0.8;
    ctx.beginPath();
    ctx.arc(this.x, this.y, pulseSize * 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Eye-like details
    ctx.fillStyle = this.color;
    ctx.globalAlpha = 1;
    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI * 2 + this.pulsePhase;
      const eyeX = this.x + Math.cos(angle) * pulseSize * 0.5;
      const eyeY = this.y + Math.sin(angle) * pulseSize * 0.5;
      ctx.beginPath();
      ctx.arc(eyeX, eyeY, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  drawTentacles() {
    this.tentacles.forEach((tentacle) => {
      const waveOffset = Math.sin(tentacle.phase) * 20;
      const endX =
        this.x + Math.cos(tentacle.angle) * (tentacle.length + waveOffset);
      const endY =
        this.y + Math.sin(tentacle.angle) * (tentacle.length + waveOffset);

      ctx.strokeStyle = this.color;
      ctx.lineWidth = 8;
      ctx.lineCap = "round";
      ctx.globalAlpha = 0.7;

      ctx.beginPath();
      ctx.moveTo(this.x, this.y);

      // Create wavy tentacle
      const segments = 5;
      for (let i = 1; i <= segments; i++) {
        const progress = i / segments;
        const segmentX = this.x + (endX - this.x) * progress;
        const segmentY = this.y + (endY - this.y) * progress;
        const wave =
          Math.sin(tentacle.phase + progress * Math.PI * 2) *
          15 *
          (1 - progress);

        const perpX =
          -(endY - this.y) /
          Math.sqrt((endX - this.x) ** 2 + (endY - this.y) ** 2);
        const perpY =
          (endX - this.x) /
          Math.sqrt((endX - this.x) ** 2 + (endY - this.y) ** 2);

        ctx.lineTo(segmentX + perpX * wave, segmentY + perpY * wave);
      }

      ctx.stroke();
      ctx.globalAlpha = 1;
    });
  }

  checkCollision(otherX, otherY, otherRadius) {
    const dx = this.x - otherX;
    const dy = this.y - otherY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < this.radius + otherRadius;
  }
}

// Buff class
class Buff {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.radius = 20;
    this.type = type; // 'shield', 'speed', 'size'
    this.pulsePhase = 0;
    this.floatPhase = 0;
    this.spawnTime = Date.now();
    this.duration = 15000; // 15 seconds before disappearing
    
    // Set buff properties based on type
    switch (type) {
      case 'shield':
        this.color = "#00aaff";
        this.glowColor = "#66ccff";
        this.symbol = "🛡️";
        break;
      case 'speed':
        this.color = "#ffaa00";
        this.glowColor = "#ffcc66";
        this.symbol = "⚡";
        break;
      case 'size':
        this.color = "#aa00ff";
        this.glowColor = "#cc66ff";
        this.symbol = "🔻";
        break;
    }
  }
  
  update() {
    // Check if buff should disappear
    if (Date.now() - this.spawnTime > this.duration) {
      return false; // Signal for removal
    }
    
    // Update visual effects
    this.pulsePhase += 0.15;
    this.floatPhase += 0.08;
    
    // Floating motion
    this.y += Math.sin(this.floatPhase) * 0.5;
    
    return true; // Continue existing
  }
  
  draw() {
    ctx.save();
    
    // Floating offset
    const floatOffset = Math.sin(this.floatPhase) * 3;
    const drawY = this.y + floatOffset;
    
    // Pulsing size
    const pulseSize = this.radius + Math.sin(this.pulsePhase) * 3;
    
    // Outer glow
    ctx.shadowColor = this.glowColor;
    ctx.shadowBlur = 25;
    ctx.fillStyle = this.glowColor;
    ctx.globalAlpha = 0.4;
    ctx.beginPath();
    ctx.arc(this.x, drawY, pulseSize + 8, 0, Math.PI * 2);
    ctx.fill();
    
    // Main buff circle
    ctx.globalAlpha = 0.8;
    ctx.shadowBlur = 15;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, drawY, pulseSize, 0, Math.PI * 2);
    ctx.fill();
    
    // Inner highlight
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 0.6;
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(this.x, drawY, pulseSize * 0.4, 0, Math.PI * 2);
    ctx.fill();
    
    // Symbol/text
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#ffffff";
    // Draw different symbols for each buff type
    switch (this.type) {
      case 'shield':
        // Draw shield symbol (diamond shape)
        ctx.beginPath();
        ctx.moveTo(this.x, this.y - 8);
        ctx.lineTo(this.x + 6, this.y);
        ctx.lineTo(this.x, this.y + 8);
        ctx.lineTo(this.x - 6, this.y);
        ctx.closePath();
        ctx.fill();
        break;
      case 'speed':
        // Draw speed symbol (arrow)
        ctx.beginPath();
        ctx.moveTo(this.x - 6, this.y - 4);
        ctx.lineTo(this.x + 6, this.y);
        ctx.lineTo(this.x - 6, this.y + 4);
        ctx.lineTo(this.x - 2, this.y);
        ctx.closePath();
        ctx.fill();
        break;
      case 'size':
        // Draw size symbol (small circle)
        ctx.beginPath();
        ctx.arc(this.x, this.y, 4, 0, Math.PI * 2);
        ctx.fill();
        break;
    }
    
    ctx.restore();
  }
  
  checkCollision(otherX, otherY, otherRadius) {
    const dx = this.x - otherX;
    const dy = this.y - otherY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < this.radius + otherRadius;
  }
}

function updateBuffs() {
  // Update active buff timers
  const currentTime = Date.now();
  
  if (activeBuffs.shield.active && currentTime > activeBuffs.shield.endTime) {
    activeBuffs.shield.active = false;
  }
  
  if (activeBuffs.speed.active && currentTime > activeBuffs.speed.endTime) {
    activeBuffs.speed.active = false;
    player.speed = 5; // Reset to normal speed
  }
  
  if (activeBuffs.size.active && currentTime > activeBuffs.size.endTime) {
    activeBuffs.size.active = false;
    player.radius = 15; // Reset to normal size
  }
  
  // Update buff pickups
  for (let i = buffs.length - 1; i >= 0; i--) {
    const buff = buffs[i];
    
    if (!buff.update()) {
      // Buff expired
      buffs.splice(i, 1);
      continue;
    }
    
    // Check collision with player
    if (buff.checkCollision(player.x, player.y, player.radius)) {
      activateBuff(buff.type);
      buffs.splice(i, 1);
      
      // Add pickup particles
      for (let j = 0; j < 15; j++) {
        particles.push(new Particle(buff.x, buff.y, buff.color));
      }
    }
  }
}

function activateBuff(buffType) {
  const currentTime = Date.now();
  const buffDuration = 30000; // 30 seconds
  
  switch (buffType) {
    case 'shield':
      activeBuffs.shield.active = true;
      activeBuffs.shield.endTime = currentTime + buffDuration;
      break;
      
    case 'speed':
      activeBuffs.speed.active = true;
      activeBuffs.speed.endTime = currentTime + buffDuration;
      player.speed = 7; // Increased speed
      break;
      
    case 'size':
      activeBuffs.size.active = true;
      activeBuffs.size.endTime = currentTime + buffDuration;
      player.radius = 12; // Reduced size (20% smaller)
      break;
  }
}

// Color picker functionality
function initializeColorPicker() {
  const colorOptions = document.querySelectorAll('.color-option');
  
  colorOptions.forEach(option => {
    option.addEventListener('click', function() {
      // Remove selected class from all options
      colorOptions.forEach(opt => opt.classList.remove('selected'));
      
      // Add selected class to clicked option
      this.classList.add('selected');
      
      // Update player color
      const newColor = this.getAttribute('data-color');
      player.color = newColor;
      
      // Save color preference
      localStorage.setItem('bulletDodgerPlayerColor', newColor);
    });
  });
}

// Load saved player color
function loadPlayerColor() {
  const savedColor = localStorage.getItem('bulletDodgerPlayerColor');
  if (savedColor) {
    player.color = savedColor;
    
    // Update selected color option
    const colorOptions = document.querySelectorAll('.color-option');
    colorOptions.forEach(option => {
      option.classList.remove('selected');
      if (option.getAttribute('data-color') === savedColor) {
        option.classList.add('selected');
      }
    });
  }
}

// Pause game when tab loses focus
document.addEventListener("visibilitychange", () => {
  if (gameState === "playing") {
    if (document.hidden) {
      // Game lost focus - pause
      isGamePaused = true;
      pausedTime = Date.now();
    } else {
      // Game regained focus - resume
      if (isGamePaused) {
        const pauseDuration = Date.now() - pausedTime;
        startTime += pauseDuration; // Adjust start time to account for pause
        isGamePaused = false;
      }
    }
  }
});

// Also handle window focus/blur events as backup
window.addEventListener("blur", () => {
  if (gameState === "playing" && !isGamePaused) {
    isGamePaused = true;
    pausedTime = Date.now();
  }
});

window.addEventListener("focus", () => {
  if (gameState === "playing" && isGamePaused) {
    const pauseDuration = Date.now() - pausedTime;
    startTime += pauseDuration;
    isGamePaused = false;
  }
});

// Start the game loop
loadPersonalBest();
loadPlayerColor();
initializeColorPicker();
gameLoop();
