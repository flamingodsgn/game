// Dark Flamingo Runner
// A pixelated endless runner with a flamingo avoiding dinosaur obstacles

let flamingo; // Player character
let obstacles = []; // Array to store obstacles
let backgrounds = []; // Parallax backgrounds
let gameSpeed = 6; // Initial game speed
let gameState = "start"; // start, playing, gameOver
let score = 0;
let highScore = 0;
let jumpSound, dieSound, scoreSound;
let flapAnimation = []; // Flamingo animation frames
let dinoImages = []; // Dinosaur obstacle images
let bgLayers = []; // Background layer images
let groundY; // Y position of the ground
let scoreInterval; // Interval for score incrementing
let particleSystem; // Particle system for effects
let pinkAccents = []; // Glowing pink elements in background
let shakeScreen = false; // For screen shake effect

// Preload all game assets
function preload() {
  // We'll create these programmatically in setup instead of loading external files
}

// Setup the game
function setup() {
  createCanvas(800, 400);
  pixelDensity(1); // For consistent pixel art rendering
  groundY = height - 50;
  
  // Create the flamingo player character
  flamingo = new Flamingo();
  
  // Initialize particle system
  particleSystem = new ParticleSystem();
  
  // Create background layers
  createBackgrounds();
  
  // Create pink accent elements
  createPinkAccents();
  
  // Reset the game to starting state
  resetGame();
}

// Main draw loop
function draw() {
  background(20, 22, 36); // Dark blue-black background
  
  // Apply screen shake effect if active
  if (shakeScreen) {
    translate(random(-5, 5), random(-5, 5));
  }
  
  // Draw background layers with parallax effect
  drawBackgrounds();
  
  // Draw pink accent elements
  drawPinkAccents();
  
  // Draw ground
  drawGround();
  
  // Handle game states
  if (gameState === "start") {
    displayStartScreen();
  } else if (gameState === "playing") {
    updateGame();
    displayScore();
  } else if (gameState === "gameOver") {
    displayGameOverScreen();
  }
}

// Handle keyboard/mouse input
function keyPressed() {
  if (keyCode === 32) { // Space bar
    handleJumpInput();
  }
}

function mousePressed() {
  handleJumpInput();
}

function handleJumpInput() {
  if (gameState === "start") {
    startGame();
  } else if (gameState === "playing") {
    flamingo.jump();
    particleSystem.createJumpParticles(flamingo.x, flamingo.y + flamingo.height);
  } else if (gameState === "gameOver") {
    resetGame();
  }
}

// Game state management functions
function startGame() {
  gameState = "playing";
  score = 0;
  scoreInterval = setInterval(() => {
    score++;
    // Every 100 points, increase game speed
    if (score % 100 === 0) {
      gameSpeed += 0.5;
    }
  }, 100);
}

function gameOver() {
  gameState = "gameOver";
  clearInterval(scoreInterval);
  // If current score is higher than high score, update high score
  if (score > highScore) {
    highScore = score;
  }
  
  // Create death particles at flamingo position
  particleSystem.createDeathParticles(flamingo.x, flamingo.y + flamingo.height/2);
  
  // Add screen shake effect
  shakeScreen = true;
  setTimeout(() => {
    shakeScreen = false;
  }, 500);
  
  // Play die sound
  // if (dieSound) dieSound.play();
}

function resetGame() {
  gameState = "start";
  gameSpeed = 6;
  obstacles = [];
  flamingo.reset();
  particleSystem.particles = [];
}

// Game logic update function
function updateGame() {
  // Update flamingo
  flamingo.update();
  flamingo.show();
  
  // Manage obstacles
  manageObstacles();
  
  // Update particles
  particleSystem.update();
  particleSystem.show();
  
  // Check for collisions
  checkCollisions();
}

// Obstacle management
function manageObstacles() {
  // Add new obstacles based on random chance and game speed
  if (frameCount % 60 === 0 && random(1) < 0.5 + (gameSpeed / 20)) {
    obstacles.push(new Obstacle());
  }
  
  // Update and show existing obstacles, remove if off-screen
  for (let i = obstacles.length - 1; i >= 0; i--) {
    obstacles[i].update();
    obstacles[i].show();
    
    if (obstacles[i].x < -obstacles[i].width) {
      obstacles.splice(i, 1);
    }
  }
}

// Collision detection
function checkCollisions() {
  for (let obstacle of obstacles) {
    if (flamingo.hits(obstacle)) {
      gameOver();
      break;
    }
  }
}

// Display functions
function displayStartScreen() {
  push();
  textAlign(CENTER);
  
  // Title
  textSize(40);
  fill(255, 105, 180); // Pink
  text("DARK FLAMINGO RUNNER", width/2, height/2 - 60);
  
  // Instructions
  textSize(20);
  fill(200);
  text("Press SPACE or CLICK to jump and start", width/2, height/2);
  
  // Draw the flamingo
  flamingo.show();
  
  pop();
}

function displayScore() {
  push();
  textAlign(RIGHT);
  textSize(24);
  fill(255, 105, 180); // Pink
  text("SCORE: " + score, width - 20, 40);
  pop();
}

function displayGameOverScreen() {
  push();
  textAlign(CENTER);
  
  // Game Over text
  textSize(40);
  fill(255, 105, 180); // Pink
  text("GAME OVER", width/2, height/2 - 60);
  
  // Score display
  textSize(24);
  fill(200);
  text("SCORE: " + score, width/2, height/2);
  text("HIGH SCORE: " + highScore, width/2, height/2 + 40);
  
  // Restart instructions
  textSize(20);
  fill(255, 105, 180);
  text("Press SPACE or CLICK to play again", width/2, height/2 + 100);
  
  // Draw flamingo in "dead" state
  flamingo.show(true);
  
  pop();
}

// Background creation and rendering
function createBackgrounds() {
  // Far background (stars and nebula)
  backgrounds.push({
    layer: createStarryBackground(),
    speed: 0.5
  });
  
  // Mid background (distant mountains)
  backgrounds.push({
    layer: createMountainBackground(),
    speed: 1
  });
  
  // Near background (closer silhouettes)
  backgrounds.push({
    layer: createSilhouetteBackground(),
    speed: 2
  });
  
  // Closest background (floating crystals)
  backgrounds.push({
    layer: createCrystalBackground(),
    speed: 3
  });
}

function createStarryBackground() {
  let bg = createGraphics(width * 2, height);
  bg.background(15, 17, 30); // Darker background for more contrast
  
  // Create a subtle nebula effect
  for (let i = 0; i < 5; i++) {
    let nebulaX = random(bg.width);
    let nebulaY = random(bg.height * 0.7);
    let nebulaSize = random(100, 300);
    
    // Create nebula with random deep blue/purple gradient
    for (let r = 10; r > 0; r--) {
      let nebulaColor;
      if (random() < 0.3) {
        // Pink/purple nebula
        nebulaColor = color(
          random(100, 180), 
          random(20, 50), 
          random(140, 200), 
          10 + (10 - r) * 3
        );
      } else {
        // Blue/teal nebula
        nebulaColor = color(
          random(20, 50), 
          random(40, 80), 
          random(80, 130), 
          10 + (10 - r) * 3
        );
      }
      bg.noStroke();
      bg.fill(nebulaColor);
      bg.ellipse(
        nebulaX, 
        nebulaY, 
        nebulaSize * (r/10) * random(0.8, 1.2)
      );
    }
  }
  
  // Draw stars with twinkling effect
  for (let i = 0; i < 300; i++) {
    let x = random(bg.width);
    let y = random(bg.height - 100);
    let size = random(1, 3);
    
    // Vary star brightness and color slightly
    if (random() < 0.1) {
      // Brighter blue-white stars
      bg.fill(200, 220, 255, random(200, 255));
      size = random(2, 4);
    } else if (random() < 0.05) {
      // Slight pink tint for some stars
      bg.fill(255, 230, 240, random(180, 255));
    } else {
      // Regular white stars with varying brightness
      bg.fill(255, random(150, 255));
    }
    
    bg.noStroke();
    
    // Add slight glow to some stars
    if (random() < 0.1) {
      bg.drawingContext.shadowBlur = 5;
      bg.drawingContext.shadowColor = color(255, 255, 255, 150);
    }
    
    // Create pixel stars (some square, some diamond shaped)
    if (random() < 0.7) {
      bg.rect(x, y, size, size);
    } else {
      bg.push();
      bg.translate(x, y);
      bg.rotate(PI/4);
      bg.rect(0, 0, size, size);
      bg.pop();
    }
    
    bg.drawingContext.shadowBlur = 0;
  }
  
  // Draw a larger pink moon/planet with more detailed glow
  let moonX = bg.width * 0.7;
  let moonY = bg.height * 0.25;
  let moonSize = 80;
  
  // Create crater details first
  bg.fill(220, 90, 160);
  bg.ellipse(moonX - moonSize * 0.2, moonY - moonSize * 0.1, moonSize * 0.3);
  bg.ellipse(moonX + moonSize * 0.25, moonY + moonSize * 0.2, moonSize * 0.25);
  bg.ellipse(moonX - moonSize * 0.1, moonY + moonSize * 0.15, moonSize * 0.15);
  
  // Glow effect with multiple layers
  for (let i = 8; i > 0; i--) {
    let alpha = 255 - (i * 30);
    bg.noStroke();
    // Use a more vibrant pink for the glow
    bg.fill(255, 80, 180, alpha);
    bg.ellipse(moonX, moonY, moonSize + (i * 20));
  }
  
  // Moon core
  bg.fill(255, 105, 180);
  bg.ellipse(moonX, moonY, moonSize);
  
  // Add highlight
  bg.fill(255, 200, 230);
  bg.ellipse(moonX - moonSize * 0.2, moonY - moonSize * 0.2, moonSize * 0.4);
  
  // Add some stars around the moon for extra effect
  for (let i = 0; i < 20; i++) {
    let angle = random(TWO_PI);
    let dist = random(moonSize * 1.5, moonSize * 3);
    let x = moonX + cos(angle) * dist;
    let y = moonY + sin(angle) * dist;
    let size = random(1, 3);
    
    bg.fill(255, 255, 255, random(200, 255));
    bg.rect(x, y, size, size);
  }
  
  // Draw a second smaller moon/planet in a different color
  let planet2X = bg.width * 0.3;
  let planet2Y = bg.height * 0.15;
  let planet2Size = 30;
  
  // Subtle glow
  for (let i = 5; i > 0; i--) {
    bg.fill(100, 100, 200, (5-i) * 20);
    bg.ellipse(planet2X, planet2Y, planet2Size + (i * 10));
  }
  
  // Planet core - deep blue
  bg.fill(80, 80, 180);
  bg.ellipse(planet2X, planet2Y, planet2Size);
  
  // Planet highlight
  bg.fill(150, 150, 220);
  bg.ellipse(planet2X - 5, planet2Y - 5, 8);
  
  return bg;
}

function createMountainBackground() {
  let bg = createGraphics(width * 2, height);
  bg.noStroke();
  
  // Create a gradient background for mountains
  let gradientHeight = height;
  for (let y = 0; y < gradientHeight; y++) {
    let inter = map(y, 0, gradientHeight, 0, 1);
    let c = lerpColor(
      color(25, 27, 40), // Dark blue at top
      color(40, 42, 56), // Lighter at bottom
      inter
    );
    bg.stroke(c);
    bg.line(0, y, bg.width, y);
  }
  bg.noStroke();
  
  // Draw distant range with more mountains
  for (let i = 0; i < 10; i++) {
    let mountainWidth = random(150, 400);
    let mountainHeight = random(70, 200);
    let x = i * bg.width/9 + random(-40, 40);
    let y = height - 50 - mountainHeight;
    
    // Create a gradient for the mountain
    let mountainColor = color(30, 32, 46);
    
    // Draw a more complex mountain shape with multiple peaks
    bg.fill(mountainColor);
    bg.beginShape();
    bg.vertex(x - 50, height);
    
    // Create random jagged peaks
    let peakCount = floor(random(3, 6));
    let segmentWidth = mountainWidth / peakCount;
    
    for (let j = 0; j <= peakCount; j++) {
      let peakHeight = random(0.7, 1) * mountainHeight;
      let peakX = x + j * segmentWidth;
      let peakY = y + (mountainHeight - peakHeight);
      
      // Add some smaller bumps between major peaks
      if (j > 0) {
        let midX = x + (j - 0.5) * segmentWidth;
        let midHeight = random(0.3, 0.7) * mountainHeight;
        let midY = y + (mountainHeight - midHeight);
        bg.vertex(midX, midY);
      }
      
      bg.vertex(peakX, peakY);
    }
    
    bg.vertex(x + mountainWidth + 50, height);
    bg.endShape(CLOSE);
    
    // Add snow caps to some mountains
    if (random() < 0.4) {
      bg.fill(200, 210, 220, 150);
      bg.beginShape();
      
      // Draw just the top portion
      for (let j = 0; j <= peakCount; j++) {
        let peakHeight = random(0.7, 1) * mountainHeight;
        let peakX = x + j * segmentWidth;
        let peakY = y + (mountainHeight - peakHeight);
        
        // Add some smaller bumps between major peaks
        if (j > 0) {
          let midX = x + (j - 0.5) * segmentWidth;
          let midHeight = random(0.3, 0.7) * mountainHeight;
          let midY = y + (mountainHeight - midHeight);
          
          // Only add snow to higher peaks
          if (midHeight > mountainHeight * 0.6) {
            bg.vertex(midX, midY);
            bg.vertex(midX + 10, midY + 20);
          }
        }
        
        if (peakHeight > mountainHeight * 0.7) {
          bg.vertex(peakX - 15, peakY + 25);
          bg.vertex(peakX, peakY);
          bg.vertex(peakX + 15, peakY + 25);
        }
      }
      
      bg.endShape();
    }
    
    // Add pink glow to some mountain peaks
    if (random() < 0.3) {
      let glowX = x + random(mountainWidth * 0.3, mountainWidth * 0.7);
      let glowY = y + random(10, 30);
      let glowSize = random(30, 60);
      
      // Draw glow
      for (let g = 5; g > 0; g--) {
        bg.fill(255, 105, 180, 10 + (5-g) * 8);
        bg.ellipse(glowX, glowY, glowSize + (g * 15));
      }
      
      // Draw core
      bg.fill(255, 105, 180, 150);
      bg.ellipse(glowX, glowY, glowSize * 0.4);
    }
  }
  
  return bg;
}

function createSilhouetteBackground() {
  let bg = createGraphics(width * 2, height);
  bg.noStroke();
  
  // Create an array of different alien tree/plant types
  const plantTypes = [
    {
      name: "tallTree",
      draw: function(x, y, scale) {
        let trunkWidth = 12 * scale;
        let trunkHeight = 180 * scale;
        
        // Draw trunk
        bg.fill(25, 27, 35);
        bg.rect(x - trunkWidth/2, y - trunkHeight, trunkWidth, trunkHeight);
        
        // Draw multiple branch layers
        let branchLayers = floor(random(3, 6));
        for (let i = 0; i < branchLayers; i++) {
          let layerWidth = map(i, 0, branchLayers-1, 100, 40) * scale;
          let layerHeight = 40 * scale;
          let layerY = y - trunkHeight + i * (trunkHeight / (branchLayers + 1));
          
          bg.fill(35, 37, 45);
          
          // Create pixelated branch layer
          let pixelSize = 4;
          for (let py = 0; py < layerHeight; py += pixelSize) {
            for (let px = 0; px < layerWidth; px += pixelSize) {
              // Create a diamond shape
              let distFromCenter = abs(px - layerWidth/2) / (layerWidth/2) + abs(py - layerHeight/2) / (layerHeight/2);
              if (distFromCenter < 1 + random(-0.2, 0.2)) {
                bg.rect(
                  x - layerWidth/2 + px,
                  layerY - layerHeight/2 + py,
                  pixelSize, pixelSize
                );
              }
            }
          }
        }
        
        // Add pink glow/accent if needed
        if (random() < 0.4) {
          // Draw multiple glowing spots
          let spotCount = floor(random(1, 4));
          for (let i = 0; i < spotCount; i++) {
            let spotX = x + random(-trunkWidth * 1.5, trunkWidth * 1.5);
            let spotY = y - random(trunkHeight * 0.3, trunkHeight * 0.9);
            let spotSize = random(5, 15);
            
            // Draw glow
            for (let j = 3; j > 0; j--) {
              bg.fill(255, 105, 180, 60 - j * 15);
              bg.ellipse(spotX, spotY, spotSize + j * 6);
            }
            
            // Draw core
            bg.fill(255, 165, 210);
            bg.ellipse(spotX, spotY, spotSize * 0.6);
          }
        }
      }
    },
    {
      name: "mushroomPlant",
      draw: function(x, y, scale) {
        let stemWidth = 8 * scale;
        let stemHeight = 60 * scale;
        let capWidth = 70 * scale;
        let capHeight = 50 * scale;
        
        // Draw stem
        bg.fill(35, 37, 45);
        bg.rect(x - stemWidth/2, y - stemHeight, stemWidth, stemHeight);
        
        // Draw cap
        bg.fill(45, 47, 55);
        
        // Draw pixelated cap
        let pixelSize = 4;
        for (let py = 0; py < capHeight; py += pixelSize) {
          for (let px = 0; px < capWidth; px += pixelSize) {
            // Create a dome shape
            let distFromCenter = sqrt(sq(px - capWidth/2) / sq(capWidth/2) + sq(py) / sq(capHeight));
            if (distFromCenter < 1) {
              bg.rect(
                x - capWidth/2 + px,
                y - stemHeight - capHeight + py,
                pixelSize, pixelSize
              );
            }
          }
        }
        
        // Always add pink glow for this type
        // Draw glow at the top center
        let glowX = x;
        let glowY = y - stemHeight - capHeight * 0.7;
        let glowSize = 25 * scale;
        
        // Draw glow
        for (let i = 4; i > 0; i--) {
          bg.fill(255, 105, 180, 70 - i * 15);
          bg.ellipse(glowX, glowY, glowSize + i * 8);
        }
        
        // Draw core
        bg.fill(255, 165, 210);
        bg.ellipse(glowX, glowY, glowSize * 0.6);
        
        // Add some small dots on the cap
        for (let i = 0; i < 8; i++) {
          let dotX = x + random(-capWidth * 0.4, capWidth * 0.4);
          let dotY = y - stemHeight - capHeight * random(0.3, 0.9);
          bg.fill(55, 57, 65);
          bg.rect(dotX, dotY, pixelSize * 2, pixelSize * 2);
        }
      }
    },
    {
      name: "crystalFormation",
      draw: function(x, y, scale) {
        // Draw multiple crystal spikes
        let crystalCount = floor(random(3, 7));
        let maxHeight = 120 * scale;
        
        for (let i = 0; i < crystalCount; i++) {
          let crystalX = x + random(-30, 30) * scale;
          let crystalHeight = random(30, maxHeight);
          let crystalWidth = random(10, 20) * scale;
          let crystalY = y - crystalHeight;
          
          // Draw crystal
          bg.fill(40, 42, 55);
          
          // Create a jagged crystal shape
          bg.beginShape();
          bg.vertex(crystalX, y);
          bg.vertex(crystalX - crystalWidth/2, crystalY + crystalHeight * 0.8);
          bg.vertex(crystalX, crystalY);
          bg.vertex(crystalX + crystalWidth/2, crystalY + crystalHeight * 0.7);
          bg.vertex(crystalX + crystalWidth/3, y);
          bg.endShape(CLOSE);
          
          // Add glow to the crystal tip
          if (random() < 0.7) {
            let glowX = crystalX;
            let glowY = crystalY + random(5, 15);
            let glowSize = random(10, 20) * scale;
            
            // Draw glow
            for (let j = 4; j > 0; j--) {
              bg.fill(255, 105, 180, 70 - j * 15);
              bg.ellipse(glowX, glowY, glowSize + j * 6);
            }
            
            // Draw core
            bg.fill(255, 175, 220);
            bg.ellipse(glowX, glowY, glowSize * 0.5);
          }
        }
      }
    }
  ];
  
  // Draw various plants across the background
  const groundLevel = height - 50;
  for (let i = 0; i < 25; i++) {
    let x = i * bg.width/20 + random(-30, 30);
    let plantType = plantTypes[floor(random(plantTypes.length))];
    let scale = random(0.7, 1.3);
    
    plantType.draw(x, groundLevel, scale);
  }
  
  return bg;
}

function createCrystalBackground() {
  let bg = createGraphics(width * 2, height);
  bg.noStroke();
  
  // Draw floating crystal formations
  for (let i = 0; i < 20; i++) {
    let x = random(bg.width);
    let y = random(height * 0.3, height - 100);
    let crystalSize = random(15, 50);
    
    // Determine if this will be a pink crystal or a blue/purple one
    let isPink = random() < 0.4;
    
    // Draw the crystal with glow
    if (isPink) {
      // Pink crystal
      // Glow
      for (let j = 4; j > 0; j--) {
        bg.fill(255, 105, 180, 40 - j * 5);
        bg.ellipse(x, y, crystalSize * 2 + j * 15);
      }
      
      // Crystal core
      drawCrystal(bg, x, y, crystalSize, color(220, 80, 150), color(255, 150, 200));
    } else {
      // Blue/purple crystal
      // Glow
      for (let j = 4; j > 0; j--) {
        bg.fill(100, 120, 220, 30 - j * 5);
        bg.ellipse(x, y, crystalSize * 2 + j * 15);
      }
      
      // Crystal core
      drawCrystal(bg, x, y, crystalSize, color(80, 90, 160), color(130, 140, 220));
    }
  }
  
  return bg;
}

// Helper function to draw a crystal
function drawCrystal(graphic, x, y, size, baseColor, highlightColor) {
  // Draw crystal shape
  graphic.fill(baseColor);
  
  // Crystal can be various shapes
  let type = floor(random(3));
  
  if (type === 0) {
    // Diamond shape
    graphic.beginShape();
    graphic.vertex(x, y - size);
    graphic.vertex(x + size/2, y);
    graphic.vertex(x, y + size/2);
    graphic.vertex(x - size/2, y);
    graphic.endShape(CLOSE);
    
    // Highlight
    graphic.fill(highlightColor);
    graphic.beginShape();
    graphic.vertex(x, y - size/2);
    graphic.vertex(x + size/4, y - size/4);
    graphic.vertex(x, y);
    graphic.vertex(x - size/4, y - size/4);
    graphic.endShape(CLOSE);
  } else if (type === 1) {
    // Hexagonal shape
    graphic.beginShape();
    for (let i = 0; i < 6; i++) {
      let angle = i * TWO_PI / 6;
      let px = x + cos(angle) * size/2;
      let py = y + sin(angle) * size/2;
      graphic.vertex(px, py);
    }
    graphic.endShape(CLOSE);
    
    // Highlight
    graphic.fill(highlightColor);
    graphic.beginShape();
    for (let i = 0; i < 3; i++) {
      let angle = i * TWO_PI / 6;
      let px = x + cos(angle) * size/3;
      let py = y + sin(angle) * size/3;
      graphic.vertex(px, py);
    }
    graphic.endShape(CLOSE);
  } else {
    // Irregular crystal cluster
    graphic.beginShape();
    for (let i = 0; i < 5; i++) {
      let angle = i * TWO_PI / 5;
      let radius = size/2 * random(0.7, 1.3);
      let px = x + cos(angle) * radius;
      let py = y + sin(angle) * radius;
      graphic.vertex(px, py);
    }
    graphic.endShape(CLOSE);
    
    // Highlight
    graphic.fill(highlightColor);
    graphic.ellipse(x - size/4, y - size/4, size/3);
  }
  
  // Add sparkle
  graphic.fill(255, 255, 255, 200);
  graphic.ellipse(x - size/4, y - size/4, size/10);
}

function createPinkAccents() {
  // Create floating pink glowing particles
  for (let i = 0; i < 10; i++) {
    pinkAccents.push({
      x: random(width),
      y: random(50, height - 100),
      size: random(3, 8),
      speed: random(0.5, 1.5),
      pulseRate: random(0.02, 0.05),
      pulseOffset: random(TWO_PI)
    });
  }
}

function drawBackgrounds() {
  // Draw each background layer with parallax effect
  for (let i = 0; i < backgrounds.length; i++) {
    let bg = backgrounds[i];
    
    // Calculate x position based on game speed and parallax factor
    let xPos = -(frameCount * bg.speed) % bg.layer.width;
    
    // Draw the background layer twice to create seamless scrolling
    image(bg.layer, xPos, 0);
    image(bg.layer, xPos + bg.layer.width, 0);
  }
}

function drawPinkAccents() {
  for (let accent of pinkAccents) {
    push();
    
    // Move the accent
    accent.x -= accent.speed;
    if (accent.x < -accent.size) {
      accent.x = width + accent.size;
      accent.y = random(50, height - 100);
    }
    
    // Create a pulsing effect
    let pulse = sin(frameCount * accent.pulseRate + accent.pulseOffset) * 0.3 + 0.7;
    let size = accent.size * pulse;
    
    // Draw the glowing effect
    noStroke();
    for (let i = 3; i > 0; i--) {
      fill(255, 105, 180, 255 / (i * 2));
      ellipse(accent.x, accent.y, size + i * 5);
    }
    
    // Draw the core
    fill(255, 105, 180);
    ellipse(accent.x, accent.y, size);
    
    pop();
  }
}

function drawGround() {
  // Draw the ground
  push();
  noStroke();
  fill(40, 42, 56);
  rect(0, groundY, width, height - groundY);
  
  // Add pixelated ground details
  fill(30, 32, 46);
  let groundPixelSize = 4;
  for (let x = 0; x < width; x += groundPixelSize) {
    if (random() < 0.2) {
      rect(x, groundY, groundPixelSize, groundPixelSize);
    }
  }
  pop();
}

// Flamingo player class
class Flamingo {
  constructor() {
    this.x = 80;
    this.width = 30;
    this.height = 60;
    this.y = groundY - this.height;
    this.vy = 0;
    this.gravity = 0.8;
    this.jumpForce = -15;
    this.isJumping = false;
    this.frameCount = 0;
    this.animationSpeed = 0.2;
    
    // Create pixelated flamingo graphic
    this.createFlamingoGraphics();
  }
  
  createFlamingoGraphics() {
    // Create higher resolution flamingo with more detail
    this.width = 40; // Increased from 30
    this.height = 70; // Increased from 60
    
    // Create standing flamingo
    this.standingFrame = createGraphics(this.width, this.height);
    this.drawDetailedFlamingo(this.standingFrame, 0);
    
    // Create running animation frames
    this.runFrames = [];
    for (let i = 0; i < 6; i++) { // Increased from 4 to 6 for smoother animation
      let frame = createGraphics(this.width, this.height);
      this.drawDetailedFlamingo(frame, i);
      this.runFrames.push(frame);
    }
    
    // Create jumping frame
    this.jumpFrame = createGraphics(this.width, this.height);
    this.drawDetailedFlamingo(this.jumpFrame, 6);
    
    // Create dead frame
    this.deadFrame = createGraphics(this.width, this.height);
    this.drawDetailedFlamingo(this.deadFrame, 7);
    
    // Create wing flap frame (new)
    this.flapFrame = createGraphics(this.width, this.height);
    this.drawDetailedFlamingo(this.flapFrame, 8);
  }
  
  drawDetailedFlamingo(graphics, frameNum) {
    let pixelSize = 2; // Smaller pixels for more detail
    graphics.noStroke();
    
    // Vibrant pink body color
    let bodyColor = color(255, 105, 180);
    // Brighter pink for highlights
    let highlightColor = color(255, 150, 200);
    // Darker pink for shading
    let shadeColor = color(220, 70, 150);
    // Deep shade for depth
    let deepShadeColor = color(180, 40, 120);
    // Black for outline
    let outlineColor = color(20, 22, 36);
    // White for details
    let detailColor = color(255, 255, 255);
    
    // Clear the canvas
    graphics.background(0, 0);
    
    // Draw based on animation frame
    if (frameNum === 7) {
      // Dead frame - flamingo on its side with X eyes
      this.drawDeadFlamingo(graphics, pixelSize, bodyColor, highlightColor, shadeColor, deepShadeColor, outlineColor, detailColor);
    } else if (frameNum === 6) {
      // Jump frame - stretched pose
      this.drawJumpingFlamingo(graphics, pixelSize, bodyColor, highlightColor, shadeColor, deepShadeColor, outlineColor, detailColor);
    } else if (frameNum === 8) {
      // Wing flap frame - wings extended (special)
      this.drawFlapFlamingo(graphics, pixelSize, bodyColor, highlightColor, shadeColor, deepShadeColor, outlineColor, detailColor);
    } else {
      // Running frames - more dynamic animation
      this.drawRunningFlamingo(graphics, pixelSize, bodyColor, highlightColor, shadeColor, deepShadeColor, outlineColor, detailColor, frameNum);
    }
    
    // Add a subtle glow effect to the flamingo
    this.addGlowEffect(graphics, bodyColor);
  }
  
  addGlowEffect(graphics, color) {
    // Add a soft glow around the flamingo edges
    graphics.drawingContext.globalCompositeOperation = 'lighter';
    graphics.noFill();
    graphics.strokeWeight(3);
    graphics.stroke(red(color), green(color), blue(color), 40);
    graphics.rect(0, 0, this.width, this.height, 10);
    graphics.strokeWeight(2);
    graphics.stroke(red(color), green(color), blue(color), 30);
    graphics.rect(-2, -2, this.width+4, this.height+4, 12);
    graphics.drawingContext.globalCompositeOperation = 'source-over';
  }
  
  drawRunningFlamingo(graphics, pixelSize, bodyColor, highlightColor, shadeColor, deepShadeColor, outlineColor, detailColor, frameNum) {
    // Define a more detailed running animation
    // First draw outline/silhouette
    graphics.fill(outlineColor);
    
    // Draw flamingo outline pixel map
    const flamingoOutline = [
      "     oo     ",
      "    oooo    ",
      "    oooo    ",
      "     oo     ",
      "     o      ",
      "     o      ",
      "     o      ",
      "     o      ",
      "     o      ",
      "     oo     ",
      "     ooo    ",
      "     oooo   ",
      "    oooooo  ",
      "   ooooooo  ",
      "   ooooooo  ",
      "    oooooo  ",
      "    oooooo  ",
      "    oooooo  ",
      "     o   o  ",
      "     o   o  ",
      "     o   o  ",
      "     o   o  ",
      "           o",
      "           o",
      "           o",
      "           o"
    ];
    
    // Offset the drawing to position correctly
    let offsetX = 3;
    let offsetY = 2;
    
    // Draw outline
    for (let y = 0; y < flamingoOutline.length; y++) {
      for (let x = 0; x < flamingoOutline[y].length; x++) {
        if (flamingoOutline[y][x] === 'o') {
          graphics.rect((x + offsetX) * pixelSize, (y + offsetY) * pixelSize, pixelSize, pixelSize);
        }
      }
    }
    
    // Fill body
    graphics.fill(bodyColor);
    
    // Define body pixel map
    const flamingoBody = [
      "     ..     ",
      "    ....    ",
      "    ....    ",
      "     ..     ",
      "     .      ",
      "     .      ",
      "     .      ",
      "     .      ",
      "     .      ",
      "     ..     ",
      "     ...    ",
      "     ....   ",
      "    ......  ",
      "   .......  ",
      "   .......  ",
      "    ......  ",
      "    ......  ",
      "    ......  "
    ];
    
    // Draw body
    for (let y = 0; y < flamingoBody.length; y++) {
      for (let x = 0; x < flamingoBody[y].length; x++) {
        if (flamingoBody[y][x] === '.') {
          graphics.rect((x + offsetX) * pixelSize, (y + offsetY) * pixelSize, pixelSize, pixelSize);
        }
      }
    }
    
    // Add shading
    graphics.fill(shadeColor);
    
    // Define shading pixel map
    const flamingoShade = [
      "           ",
      "           ",
      "     ..    ",
      "     .     ",
      "           ",
      "           ",
      "           ",
      "           ",
      "           ",
      "           ",
      "      ..   ",
      "      ...  ",
      "     ....  ",
      "     ..... ",
      "     ..... ",
      "     ....  ",
      "     ....  ",
      "     ....  "
    ];
    
    // Draw shading
    for (let y = 0; y < flamingoShade.length; y++) {
      for (let x = 0; x < flamingoShade[y].length; x++) {
        if (flamingoShade[y][x] === '.') {
          graphics.rect((x + offsetX + 2) * pixelSize, (y + offsetY) * pixelSize, pixelSize, pixelSize);
        }
      }
    }
    
    // Add highlights
    graphics.fill(highlightColor);
    
    // Define highlight pixel map
    const flamingoHighlight = [
      "     ..    ",
      "    ....   ",
      "    ..     ",
      "           ",
      "     .     ",
      "     .     ",
      "     .     ",
      "           ",
      "           ",
      "     .     ",
      "     .     ",
      "     .     ",
      "    ..     ",
      "   ...     ",
      "   ..      ",
      "    .      ",
      "           ",
      "           "
    ];
    
    // Draw highlights
    for (let y = 0; y < flamingoHighlight.length; y++) {
      for (let x = 0; x < flamingoHighlight[y].length; x++) {
        if (flamingoHighlight[y][x] === '.') {
          graphics.rect((x + offsetX) * pixelSize, (y + offsetY) * pixelSize, pixelSize, pixelSize);
        }
      }
    }
    
    // Draw the beak
    graphics.fill(deepShadeColor);
    graphics.rect((offsetX + 1) * pixelSize, (offsetY + 2) * pixelSize, pixelSize * 2, pixelSize);
    graphics.rect((offsetX) * pixelSize, (offsetY + 3) * pixelSize, pixelSize * 2, pixelSize);
    
    // Draw the eye
    graphics.fill(outlineColor);
    graphics.rect((offsetX + 4) * pixelSize, (offsetY + 3) * pixelSize, pixelSize, pixelSize);
    graphics.fill(detailColor);
    graphics.rect((offsetX + 4) * pixelSize, (offsetY + 3) * pixelSize, pixelSize/2, pixelSize/2);
    
    // Draw the legs with animation
    // We'll use frame number to create more fluid running animation
    let legOffset = sin(frameNum * 0.5 * PI) * 3;
    let legHeight = 8 + abs(legOffset);
    
    // First leg
    graphics.fill(deepShadeColor);
    if (frameNum % 6 < 3) {
      // First leg forward
      graphics.rect((offsetX + 5) * pixelSize, (offsetY + 18) * pixelSize, pixelSize, pixelSize * legHeight);
    } else {
      // First leg back
      graphics.rect((offsetX + 5) * pixelSize, (offsetY + 18) * pixelSize, pixelSize, pixelSize * 4);
    }
    
    // Second leg with offset animation
    if ((frameNum + 3) % 6 < 3) {
      // Second leg forward
      graphics.rect((offsetX + 10) * pixelSize, (offsetY + 18) * pixelSize, pixelSize, pixelSize * (legHeight - 1));
    } else {
      // Second leg back
      graphics.rect((offsetX + 10) * pixelSize, (offsetY + 18) * pixelSize, pixelSize, pixelSize * 3);
    }
    
    // Add some feather details based on frame
    graphics.fill(highlightColor);
    let featherOffset = frameNum % 3;
    for (let i = 0; i < 3; i++) {
      graphics.rect((offsetX + 8 + i) * pixelSize, (offsetY + 13 + featherOffset) * pixelSize, pixelSize, pixelSize);
    }
  }
  
  drawJumpingFlamingo(graphics, pixelSize, bodyColor, highlightColor, shadeColor, deepShadeColor, outlineColor, detailColor) {
    // Define a more detailed jumping pose
    // First draw outline/silhouette
    graphics.fill(outlineColor);
    
    // Draw flamingo jumping outline pixel map
    const flamingoJumpOutline = [
      "           oo",
      "          oooo",
      "          oooo",
      "           oo ",
      "          o   ",
      "         o    ",
      "        o     ",
      "       o      ",
      "      o       ",
      "     o        ",
      "    oo        ",
      "   ooo        ",
      "  oooo        ",
      " ooooo        ",
      "oooooo        ",
      "oooooo        ",
      "oooooo        ",
      "oooooo        ",
      " o  oo        ",
      "    oo        ",
      "    o         ",
      "    o         "
    ];
    
    // Offset the drawing to position correctly
    let offsetX = 2;
    let offsetY = 5;
    
    // Draw outline
    for (let y = 0; y < flamingoJumpOutline.length; y++) {
      for (let x = 0; x < flamingoJumpOutline[y].length; x++) {
        if (flamingoJumpOutline[y][x] === 'o') {
          graphics.rect((x + offsetX) * pixelSize, (y + offsetY) * pixelSize, pixelSize, pixelSize);
        }
      }
    }
    
    // Fill body
    graphics.fill(bodyColor);
    
    // Define body pixel map
    const flamingoJumpBody = [
      "           ..",
      "          ....",
      "          ....",
      "           .. ",
      "          .   ",
      "         .    ",
      "        .     ",
      "       .      ",
      "      .       ",
      "     .        ",
      "    ..        ",
      "   ...        ",
      "  ....        ",
      " .....        ",
      "......        ",
      "......        ",
      "......        ",
      "......        "
    ];
    
    // Draw body
    for (let y = 0; y < flamingoJumpBody.length; y++) {
      for (let x = 0; x < flamingoJumpBody[y].length; x++) {
        if (flamingoJumpBody[y][x] === '.') {
          graphics.rect((x + offsetX) * pixelSize, (y + offsetY) * pixelSize, pixelSize, pixelSize);
        }
      }
    }
    
    // Add shading
    graphics.fill(shadeColor);
    
    // Define shading pixel map
    const flamingoJumpShade = [
      "           ..",
      "          ..",
      "          .. ",
      "             ",
      "             ",
      "             ",
      "             ",
      "             ",
      "             ",
      "             ",
      "             ",
      "             ",
      "   ...        ",
      "  ....        ",
      " .....        ",
      " .....        ",
      " .....        ",
      " .....        "
    ];
    
    // Draw shading
    for (let y = 0; y < flamingoJumpShade.length; y++) {
      for (let x = 0; x < flamingoJumpShade[y].length; x++) {
        if (flamingoJumpShade[y][x] === '.') {
          graphics.rect((x + offsetX) * pixelSize, (y + offsetY) * pixelSize, pixelSize, pixelSize);
        }
      }
    }
    
    // Add highlights
    graphics.fill(highlightColor);
    
    // Define highlight pixel map
    const flamingoJumpHighlight = [
      "            ",
      "          ..",
      "          . ",
      "           .",
      "          . ",
      "         .  ",
      "        .   ",
      "       .    ",
      "      .     ",
      "     .      ",
      "    .       ",
      "   .        ",
      "  .         ",
      " .          ",
      ".           ",
      ".           ",
      ".           ",
      "            "
    ];
    
    // Draw highlights
    for (let y = 0; y < flamingoJumpHighlight.length; y++) {
      for (let x = 0; x < flamingoJumpHighlight[y].length; x++) {
        if (flamingoJumpHighlight[y][x] === '.') {
          graphics.rect((x + offsetX) * pixelSize, (y + offsetY) * pixelSize, pixelSize, pixelSize);
        }
      }
    }
    
    // Draw the beak
    graphics.fill(deepShadeColor);
    graphics.rect((offsetX + 14) * pixelSize, (offsetY + 1) * pixelSize, pixelSize * 2, pixelSize);
    graphics.rect((offsetX + 15) * pixelSize, (offsetY) * pixelSize, pixelSize * 2, pixelSize);
    
    // Draw the eye
    graphics.fill(outlineColor);
    graphics.rect((offsetX + 13) * pixelSize, (offsetY + 1) * pixelSize, pixelSize, pixelSize);
    graphics.fill(detailColor);
    graphics.rect((offsetX + 13) * pixelSize, (offsetY + 1) * pixelSize, pixelSize/2, pixelSize/2);
    
    // Draw the tucked legs
    graphics.fill(deepShadeColor);
    graphics.rect((offsetX + 3) * pixelSize, (offsetY + 19) * pixelSize, pixelSize, pixelSize * 2);
    graphics.rect((offsetX + 6) * pixelSize, (offsetY + 17) * pixelSize, pixelSize, pixelSize * 2);
    
    // Add some trailing motion lines
    graphics.strokeWeight(1);
    graphics.stroke(highlightColor);
    for (let i = 0; i < 5; i++) {
      let x1 = offsetX * pixelSize - i * 3;
      let y1 = (offsetY + 15) * pixelSize + i * 2;
      let x2 = x1 - 5;
      let y2 = y1 - 3;
      graphics.line(x1, y1, x2, y2);
    }
    graphics.noStroke();
  }
  
  drawDeadFlamingo(graphics, pixelSize, bodyColor, highlightColor, shadeColor, deepShadeColor, outlineColor, detailColor) {
    // Define a more detailed dead flamingo (on its side)
    graphics.fill(outlineColor);
    
    // Draw dead flamingo outline - it's now on its side
    const flamingoDeadOutline = [
      "                  ",
      "                  ",
      "                  ",
      "  oo              ",
      " oooo             ",
      "oooooo            ",
      "ooooooooooooooo   ",
      "ooooooooooooooooo ",
      " ooooooooooooooooo",
      "  ooooooooooooooo ",
      "    ooooooooo     ",
      "     ooo          ",
      "                  ",
      "                  "
    ];
    
    // Offset the drawing to position correctly
    let offsetX = 2;
    let offsetY = 15;
    
    // Draw outline
    for (let y = 0; y < flamingoDeadOutline.length; y++) {
      for (let x = 0; x < flamingoDeadOutline[y].length; x++) {
        if (flamingoDeadOutline[y][x] === 'o') {
          graphics.rect((x + offsetX) * pixelSize, (y + offsetY) * pixelSize, pixelSize, pixelSize);
        }
      }
    }
    
    // Fill body
    graphics.fill(bodyColor);
    
    // Define body pixel map
    const flamingoDeadBody = [
      "                  ",
      "                  ",
      "                  ",
      "  ..              ",
      " ....             ",
      "......            ",
      ".............     ",
      "................. ",
      " .................",
      "  ............... ",
      "    .........     ",
      "     ...          ",
      "                  ",
      "                  "
    ];
    
    // Draw body
    for (let y = 0; y < flamingoDeadBody.length; y++) {
      for (let x = 0; x < flamingoDeadBody[y].length; x++) {
        if (flamingoDeadBody[y][x] === '.') {
          graphics.rect((x + offsetX) * pixelSize, (y + offsetY) * pixelSize, pixelSize, pixelSize);
        }
      }
    }
    
    // Add shading
    graphics.fill(shadeColor);
    
    // Define shading pixel map
    const flamingoDeadShade = [
      "                  ",
      "                  ",
      "                  ",
      "                  ",
      "                  ",
      "......            ",
      ".............     ",
      "................. ",
      " .................",
      "  ............    ",
      "    .....         ",
      "                  ",
      "                  ",
      "                  "
    ];
    
    // Draw shading
    for (let y = 0; y < flamingoDeadShade.length; y++) {
      for (let x = 0; x < flamingoDeadShade[y].length; x++) {
        if (flamingoDeadShade[y][x] === '.') {
          graphics.rect((x + offsetX) * pixelSize, (y + offsetY + 2) * pixelSize, pixelSize, pixelSize);
        }
      }
    }
    
    // Add highlights
    graphics.fill(highlightColor);
    
    // Define highlight pixel map
    const flamingoDeadHighlight = [
      "                  ",
      "                  ",
      "                  ",
      "  ..              ",
      " ....             ",
      "......            ",
      ".....             ",
      "......            ",
      " .....            ",
      "  ....            ",
      "    ...           ",
      "                  ",
      "                  ",
      "                  "
    ];
    
    // Draw highlights
    for (let y = 0; y < flamingoDeadHighlight.length; y++) {
      for (let x = 0; x < flamingoDeadHighlight[y].length; x++) {
        if (flamingoDeadHighlight[y][x] === '.') {
          graphics.rect((x + offsetX) * pixelSize, (y + offsetY) * pixelSize, pixelSize, pixelSize);
        }
      }
    }
    
    // Draw the beak
    graphics.fill(deepShadeColor);
    graphics.rect((offsetX + 1) * pixelSize, (offsetY + 4) * pixelSize, pixelSize, pixelSize);
    
    // Draw X eyes (more detailed)
    graphics.fill(outlineColor);
    // First X
    graphics.rect((offsetX + 3) * pixelSize, (offsetY + 5) * pixelSize, pixelSize, pixelSize);
    graphics.rect((offsetX + 4) * pixelSize, (offsetY + 6) * pixelSize, pixelSize, pixelSize);
    graphics.rect((offsetX + 3) * pixelSize, (offsetY + 7) * pixelSize, pixelSize, pixelSize);
    graphics.rect((offsetX + 4) * pixelSize, (offsetY + 5) * pixelSize, pixelSize, pixelSize);
    graphics.rect((offsetX + 3) * pixelSize, (offsetY + 6) * pixelSize, pixelSize, pixelSize);
    
    // Legs sticking up
    graphics.fill(deepShadeColor);
    graphics.rect((offsetX + 8) * pixelSize, (offsetY + 3) * pixelSize, pixelSize, pixelSize * 4);
    graphics.rect((offsetX + 12) * pixelSize, (offsetY + 4) * pixelSize, pixelSize, pixelSize * 3);
    
    // Add some impact effects (stars/sparkles around the dead flamingo)
    for (let i = 0; i < 8; i++) {
      let angle = i * PI / 4;
      let x = offsetX * pixelSize + 10 * pixelSize + cos(angle) * 15 * pixelSize;
      let y = offsetY * pixelSize + 6 * pixelSize + sin(angle) * 10 * pixelSize;
      
      graphics.fill(highlightColor);
      graphics.rect(x, y, pixelSize * 2, pixelSize * 2);
      graphics.fill(detailColor);
      graphics.rect(x + pixelSize/2, y + pixelSize/2, pixelSize, pixelSize);
    }
  }
  
  drawFlapFlamingo(graphics, pixelSize, bodyColor, highlightColor, shadeColor, deepShadeColor, outlineColor, detailColor) {
    // Special animation frame with wings extended
    // First draw outline/silhouette
    graphics.fill(outlineColor);
    
    // Draw flamingo with wings outline
    const flamingoWingOutline = [
      "     oo     ",
      "    oooo    ",
      "    oooo    ",
      "     oo     ",
      "     o      ",
      "     o      ",
      "     o      ",
      "     o      ",
      "     o      ",
      "     oo     ",
      "     ooo    ",
      "    ooooo   ",
      "   ooooooo  ",
      "  oooooooooo",
      " ooooooooooo",
      "oooooooooooo",
      " ooooooooooo",
      "  oooooooo  ",
      "     o   o  ",
      "     o   o  ",
      "     o   o  ",
      "     o   o  "
    ];
    
    // Offset the drawing to position correctly
    let offsetX = 3;
    let offsetY = 2;
    
    // Draw outline
    for (let y = 0; y < flamingoWingOutline.length; y++) {
      for (let x = 0; x < flamingoWingOutline[y].length; x++) {
        if (flamingoWingOutline[y][x] === 'o') {
          graphics.rect((x + offsetX) * pixelSize, (y + offsetY) * pixelSize, pixelSize, pixelSize);
        }
      }
    }
    
    // Fill body
    graphics.fill(bodyColor);
    
    // Define body and wings pixel map
    const flamingoWingBody = [
      "     ..     ",
      "    ....    ",
      "    ....    ",
      "     ..     ",
      "     .      ",
      "     .      ",
      "     .      ",
      "     .      ",
      "     .      ",
      "     ..     ",
      "     ...    ",
      "    .....   ",
      "   .......  ",
      "  ..........",
      " ...........",
      "............",
      " ...........",
      "  ........  "
    ];
    
    // Draw body and wings
    for (let y = 0; y < flamingoWingBody.length; y++) {
      for (let x = 0; x < flamingoWingBody[y].length; x++) {
        if (flamingoWingBody[y][x] === '.') {
          graphics.rect((x + offsetX) * pixelSize, (y + offsetY) * pixelSize, pixelSize, pixelSize);
        }
      }
    }
    
    // Add shading to wings
    graphics.fill(shadeColor);
    
    // Define wing shading pixel map
    const flamingoWingShade = [
      "           ",
      "           ",
      "     ..    ",
      "     .     ",
      "           ",
      "           ",
      "           ",
      "           ",
      "           ",
      "           ",
      "      ..   ",
      "     ....  ",
      "    ...... ",
      "   ........",
      "   ........",
      "    ...... ",
      "     ....  ",
      "      ..   "
    ];
    
    // Draw wing shading
    for (let y = 0; y < flamingoWingShade.length; y++) {
      for (let x = 0; x < flamingoWingShade[y].length; x++) {
        if (flamingoWingShade[y][x] === '.') {
          graphics.rect((x + offsetX + 3) * pixelSize, (y + offsetY) * pixelSize, pixelSize, pixelSize);
        }
      }
    }
    
    // Add detailed wing pattern
    graphics.fill(deepShadeColor);
    
    // Wing feather pattern for detail
    for (let i = 0; i < 5; i++) {
      graphics.rect((offsetX + 5 + i*2) * pixelSize, (offsetY + 14) * pixelSize, pixelSize, pixelSize);
      graphics.rect((offsetX + 5 + i*2) * pixelSize, (offsetY + 16) * pixelSize, pixelSize, pixelSize);
    }
    
    // Add sparkle/particle effect around wings
    graphics.fill(highlightColor);
    for (let i = 0; i < 10; i++) {
      let x = (offsetX + 5 + random(10)) * pixelSize;
      let y = (offsetY + 14 + random(4)) * pixelSize;
      graphics.rect(x, y, pixelSize, pixelSize);
    }
    
    // Add highlights
    graphics.fill(highlightColor);
    
    // Define highlight pixel map for body/head
    const flamingoWingHighlight = [
      "     ..    ",
      "    ....   ",
      "    ..     ",
      "           ",
      "     .     ",
      "     .     ",
      "     .     ",
      "           ",
      "           ",
      "     .     ",
      "     .     ",
      "     .     ",
      "    ..     ",
      "   ...     ",
      "   ..      ",
      "    .      ",
      "           ",
      "           "
    ];
    
    // Draw body highlights
    for (let y = 0; y < flamingoWingHighlight.length; y++) {
      for (let x = 0; x < flamingoWingHighlight[y].length; x++) {
        if (flamingoWingHighlight[y][x] === '.') {
          graphics.rect((x + offsetX) * pixelSize, (y + offsetY) * pixelSize, pixelSize, pixelSize);
        }
      }
    }
    
    // Draw the beak
    graphics.fill(deepShadeColor);
    graphics.rect((offsetX + 1) * pixelSize, (offsetY + 2) * pixelSize, pixelSize * 2, pixelSize);
    graphics.rect((offsetX) * pixelSize, (offsetY + 3) * pixelSize, pixelSize * 2, pixelSize);
    
    // Draw the eye
    graphics.fill(outlineColor);
    graphics.rect((offsetX + 4) * pixelSize, (offsetY + 3) * pixelSize, pixelSize, pixelSize);
    // Add eye shine
    graphics.fill(detailColor);
    graphics.rect((offsetX + 4) * pixelSize, (offsetY + 3) * pixelSize, pixelSize/2, pixelSize/2);
    
    // Draw the legs
    graphics.fill(deepShadeColor);
    // Legs in a balanced position
    graphics.rect((offsetX + 5) * pixelSize, (offsetY + 18) * pixelSize, pixelSize, pixelSize * 4);
    graphics.rect((offsetX + 10) * pixelSize, (offsetY + 18) * pixelSize, pixelSize, pixelSize * 4);
  }
  
  update() {
    // Apply gravity
    this.vy += this.gravity;
    this.y += this.vy;
    
    // Check if on ground
    if (this.y > groundY - this.height) {
      this.y = groundY - this.height;
      this.vy = 0;
      this.isJumping = false;
    }
    
    // Update animation frame
    this.frameCount += this.animationSpeed;
    if (this.frameCount >= this.runFrames.length) {
      this.frameCount = 0;
    }
  }
  
  jump() {
    if (!this.isJumping) {
      this.vy = this.jumpForce;
      this.isJumping = true;
      // Play jump sound
      // if (jumpSound) jumpSound.play();
    }
  }
  
  show(isDead = false) {
    push();
    imageMode(CENTER);
    
    if (isDead) {
      // Show dead flamingo
      image(this.deadFrame, this.x, this.y + this.height/2);
    } else if (this.isJumping) {
      // Show jumping flamingo
      image(this.jumpFrame, this.x, this.y + this.height/2);
      
      // Occasionally show wing flap frame for a more dynamic jump animation
      if (frameCount % 10 === 0) {
        image(this.flapFrame, this.x, this.y + this.height/2);
      }
    } else if (gameState === "playing") {
      // Show running animation
      let frameIndex = floor(this.frameCount) % this.runFrames.length;
      image(this.runFrames[frameIndex], this.x, this.y + this.height/2);
    } else {
      // Show standing flamingo on start screen with occasional wing flap
      if (frameCount % 60 < 10) {
        image(this.flapFrame, this.x, this.y + this.height/2);
      } else {
        image(this.standingFrame, this.x, this.y + this.height/2);
      }
    }
    
    pop();
  }
  
  hits(obstacle) {
    // Simple AABB collision detection
    let flamHitbox = {
      x: this.x - this.width/2 + 5,
      y: this.y + 5,
      w: this.width - 10,
      h: this.height - 10
    };
    
    return (
      flamHitbox.x + flamHitbox.w > obstacle.x && 
      flamHitbox.x < obstacle.x + obstacle.width &&
      flamHitbox.y + flamHitbox.h > obstacle.y &&
      flamHitbox.y < obstacle.y + obstacle.height
    );
  }
  
  reset() {
    this.y = groundY - this.height;
    this.vy = 0;
    this.isJumping = false;
  }
}

// Obstacle class (Dinosaurs)
class Obstacle {
  constructor() {
    // Randomly choose dinosaur size and type
    this.width = random(40, 80);
    this.height = random(50, 90);
    this.x = width;
    this.y = groundY - this.height;
    this.type = floor(random(3)); // 0 = raptor, 1 = t-rex, 2 = flying
    
    // Create pixelated dino graphic
    this.graphic = createGraphics(this.width, this.height);
    this.createDinoGraphic();
    
    // For animation
    this.frameCount = 0;
    this.animationSpeed = 0.15;
    
    // For flying dinos
    if (this.type === 2) {
      this.y = groundY - this.height - random(50, 150);
      this.flapSpeed = random(0.1, 0.2);
      this.verticalOffset = 0;
      this.verticalDirection = 1;
    }
  }
  
  createDinoGraphic() {
    let pixelSize = 3;
    this.graphic.noStroke();
    
    // Dinosaur body color - dark with a hint of the background color
    let dinoColor = color(40, 42, 56);
    // Darker shade for details
    let shadeColor = color(30, 32, 46);
    // Deep shade for details
    let deepShadeColor = color(25, 27, 36);
    // Pink accent (glowing eye)
    let accentColor = color(255, 105, 180);
    // Highlight color
    let highlightColor = color(60, 62, 76);
    
    // Clear the canvas
    this.graphic.background(0, 0);
    
    // Draw based on dinosaur type
    if (this.type === 0) {
      // Small dino (raptor)
      this.drawRaptorDino(pixelSize, dinoColor, shadeColor, deepShadeColor, accentColor, highlightColor);
    } else if (this.type === 1) {
      // Taller dino (T-Rex)
      this.drawTRexDino(pixelSize, dinoColor, shadeColor, deepShadeColor, accentColor, highlightColor);
    } else {
      // Flying dino (pterodactyl)
      this.drawPterodactyl(pixelSize, dinoColor, shadeColor, deepShadeColor, accentColor, highlightColor);
    }
  }
  
  drawRaptorDino(pixelSize, dinoColor, shadeColor, deepShadeColor, accentColor, highlightColor) {
    // Calculate pixel grid dimensions
    let gridWidth = floor(this.width / pixelSize);
    let gridHeight = floor(this.height / pixelSize);
    
    // Create a detailed raptor silhouette using pixel art
    const raptorOutline = [
      "               oo",
      "              oooo",
      "              oooo",
      "              oooo",
      "              oooo",
      "             ooooo",
      "            oooooo",
      "           ooooooo",
      "          oooooooo",
      "         ooooooooo",
      "        oooooooooo",
      "       ooooooooooo",
      "       ooooooooooo",
      "       ooooooooooo",
      "       ooooooooooo",
      "       ooooooooooo",
      "       ooooooooooo",
      "       ooooooooooo",
      "       ooooo  oooo",
      "       oooo   oooo",
      "        oo     oo ",
      "                  "
    ];
    
    // Offset for drawing
    let offsetX = 1;
    let offsetY = 1;
    
    // Draw outline
    this.graphic.fill(deepShadeColor);
    for (let y = 0; y < raptorOutline.length && y < gridHeight; y++) {
      for (let x = 0; x < raptorOutline[y].length && x < gridWidth; x++) {
        if (raptorOutline[y][x] === 'o') {
          this.graphic.rect((x + offsetX) * pixelSize, (y + offsetY) * pixelSize, pixelSize, pixelSize);
        }
      }
    }
    
    // Create body fill with more detail
    const raptorBody = [
      "               ..",
      "              ....",
      "              ....",
      "              ....",
      "              ....",
      "             .....",
      "            ......",
      "           .......",
      "          ........",
      "         .........",
      "        ..........",
      "       ...........",
      "       ...........",
      "       ...........",
      "       ...........",
      "       ...........",
      "       ...........",
      "       ...........",
      "       .....  ....",
      "       ....   ....",
      "        ..     .. "
    ];
    
    // Draw body
    this.graphic.fill(dinoColor);
    for (let y = 0; y < raptorBody.length && y < gridHeight; y++) {
      for (let x = 0; x < raptorBody[y].length && x < gridWidth; x++) {
        if (raptorBody[y][x] === '.') {
          this.graphic.rect((x + offsetX) * pixelSize, (y + offsetY) * pixelSize, pixelSize, pixelSize);
        }
      }
    }
    
    // Add highlight details
    const raptorHighlight = [
      "                  ",
      "               ...",
      "               .. ",
      "                  ",
      "                  ",
      "                  ",
      "                  ",
      "                  ",
      "                  ",
      "         ......   ",
      "        .......   ",
      "       ........   ",
      "       ........   ",
      "       ........   ",
      "       .......    ",
      "       ......     ",
      "       .....      ",
      "       ....       ",
      "       ...        ",
      "       ..         ",
      "        .         "
    ];
    
    // Draw highlights
    this.graphic.fill(highlightColor);
    for (let y = 0; y < raptorHighlight.length && y < gridHeight; y++) {
      for (let x = 0; x < raptorHighlight[y].length && x < gridWidth; x++) {
        if (raptorHighlight[y][x] === '.') {
          this.graphic.rect((x + offsetX) * pixelSize, (y + offsetY) * pixelSize, pixelSize, pixelSize);
        }
      }
    }
    
    // Add shaded details
    const raptorShade = [
      "                  ",
      "                  ",
      "                  ",
      "              ... ",
      "              ....",
      "             .....",
      "            ......",
      "           .......",
      "          ........",
      "                  ",
      "                  ",
      "                  ",
      "                  ",
      "                  ",
      "                  ",
      "                  ",
      "                  ",
      "                  ",
      "                  ",
      "                  ",
      "                  "
    ];
    
    // Draw shading
    this.graphic.fill(shadeColor);
    for (let y = 0; y < raptorShade.length && y < gridHeight; y++) {
      for (let x = 0; x < raptorShade[y].length && x < gridWidth; x++) {
        if (raptorShade[y][x] === '.') {
          this.graphic.rect((x + offsetX) * pixelSize, (y + offsetY) * pixelSize, pixelSize, pixelSize);
        }
      }
    }
    
    // Eye with pink glow
    this.graphic.fill(accentColor);
    this.graphic.rect((gridWidth - 2) * pixelSize, 3 * pixelSize, pixelSize, pixelSize);
    
    // Glowing effect around the eye
    this.graphic.noFill();
    this.graphic.stroke(accentColor);
    this.graphic.strokeWeight(1);
    for (let i = 3; i > 0; i--) {
      this.graphic.stroke(red(accentColor), green(accentColor), blue(accentColor), 70 - i * 20);
      this.graphic.ellipse(
        (gridWidth - 1.5) * pixelSize, 
        3.5 * pixelSize, 
        pixelSize * (i + 1) * 2
      );
    }
    this.graphic.noStroke();
    
    // Teeth
    this.graphic.fill(220, 220, 220);
    this.graphic.rect((gridWidth - 3) * pixelSize, 6 * pixelSize, pixelSize, pixelSize);
    this.graphic.rect((gridWidth - 5) * pixelSize, 6 * pixelSize, pixelSize, pixelSize);
    
    // Claws
    this.graphic.fill(deepShadeColor);
    this.graphic.rect(8 * pixelSize, (gridHeight - 1) * pixelSize, pixelSize, pixelSize);
    this.graphic.rect(12 * pixelSize, (gridHeight - 1) * pixelSize, pixelSize, pixelSize);
  }
  
  drawTRexDino(pixelSize, dinoColor, shadeColor, deepShadeColor, accentColor, highlightColor) {
    // Calculate pixel grid dimensions
    let gridWidth = floor(this.width / pixelSize);
    let gridHeight = floor(this.height / pixelSize);
    
    // Create a detailed T-Rex silhouette using pixel art
    const trexOutline = [
      "                 oooo",
      "                oooooo",
      "                oooooo",
      "               ooooooo",
      "               ooooooo",
      "              oooooooo",
      "              oooooooo",
      "              oooooooo",
      "             ooooooooo",
      "            oooooooooo",
      "           ooooooooooo",
      "          oooooooooooo",
      "         ooooooooooooo",
      "        oooooooooooooo",
      "       ooooooooooooooo",
      "      oooooooooooooooo",
      "     ooooooooooooooooo",
      "    oooooooooooooooooo",
      "    oooooooooooooooooo",
      "    oooooooooooooooooo",
      "    oooooooooooooooooo",
      "    oooooooooooooooooo",
      "    oooooooooooooooooo",
      "    ooooo       oooooo",
      "    oooo         ooooo",
      "    ooo           oooo",
      "                       "
    ];
    
    // Offset for drawing
    let offsetX = 1;
    let offsetY = 1;
    
    // Draw outline
    this.graphic.fill(deepShadeColor);
    for (let y = 0; y < trexOutline.length && y < gridHeight; y++) {
      for (let x = 0; x < trexOutline[y].length && x < gridWidth; x++) {
        if (trexOutline[y][x] === 'o') {
          this.graphic.rect((x + offsetX) * pixelSize, (y + offsetY) * pixelSize, pixelSize, pixelSize);
        }
      }
    }
    
    // Create body fill with more detail
    const trexBody = [
      "                 ....",
      "                ......",
      "                ......",
      "               .......",
      "               .......",
      "              ........",
      "              ........",
      "              ........",
      "             .........",
      "            ..........",
      "           ...........",
      "          ............",
      "         .............",
      "        ..............",
      "       ...............",
      "      ................",
      "     .................",
      "    ..................",
      "    ..................",
      "    ..................",
      "    ..................",
      "    ..................",
      "    ..................",
      "    .....       ......",
      "    ....         .....",
      "    ...           ...."
    ];
    
    // Draw body
    this.graphic.fill(dinoColor);
    for (let y = 0; y < trexBody.length && y < gridHeight; y++) {
      for (let x = 0; x < trexBody[y].length && x < gridWidth; x++) {
        if (trexBody[y][x] === '.') {
          this.graphic.rect((x + offsetX) * pixelSize, (y + offsetY) * pixelSize, pixelSize, pixelSize);
        }
      }
    }
    
    // Add highlight details
    const trexHighlight = [
      "                     ",
      "                 ... ",
      "                 ... ",
      "                     ",
      "                     ",
      "                     ",
      "                     ",
      "                     ",
      "                     ",
      "            .......  ",
      "           ........  ",
      "          .........  ",
      "         ..........  ",
      "        ...........  ",
      "       ............  ",
      "      .............  ",
      "     ..............  ",
      "    ...............  ",
      "    ...............  ",
      "    ..............   ",
      "    .............    ",
      "    ............     ",
      "    ...........      ",
      "    ........         ",
      "    .......          ",
      "    ......           "
    ];
    
    // Draw highlights
    this.graphic.fill(highlightColor);
    for (let y = 0; y < trexHighlight.length && y < gridHeight; y++) {
      for (let x = 0; x < trexHighlight[y].length && x < gridWidth; x++) {
        if (trexHighlight[y][x] === '.') {
          this.graphic.rect((x + offsetX) * pixelSize, (y + offsetY) * pixelSize, pixelSize, pixelSize);
        }
      }
    }
    
    // Add shaded details
    const trexShade = [
      "                     ",
      "                     ",
      "                ... .",
      "               ......",
      "               ......",
      "              .......",
      "              .......",
      "              .......",
      "             ........",
      "                     ",
      "                     ",
      "                     ",
      "                     ",
      "                     ",
      "                     ",
      "                     ",
      "                     ",
      "                     ",
      "                     ",
      "                     ",
      "                     ",
      "                     ",
      "                     ",
      "                     ",
      "                     ",
      "                     "
    ];
    
    // Draw shading
    this.graphic.fill(shadeColor);
    for (let y = 0; y < trexShade.length && y < gridHeight; y++) {
      for (let x = 0; x < trexShade[y].length && x < gridWidth; x++) {
        if (trexShade[y][x] === '.') {
          this.graphic.rect((x + offsetX) * pixelSize, (y + offsetY) * pixelSize, pixelSize, pixelSize);
        }
      }
    }
    
    // Eye with pink glow
    this.graphic.fill(accentColor);
    this.graphic.rect((gridWidth - 4) * pixelSize, 5 * pixelSize, pixelSize, pixelSize);
    
    // Glowing effect around the eye
    this.graphic.noFill();
    this.graphic.stroke(accentColor);
    this.graphic.strokeWeight(1);
    for (let i = 4; i > 0; i--) {
      this.graphic.stroke(red(accentColor), green(accentColor), blue(accentColor), 80 - i * 20);
      this.graphic.ellipse(
        (gridWidth - 3.5) * pixelSize, 
        5.5 * pixelSize, 
        pixelSize * (i + 1) * 2
      );
    }
    this.graphic.noStroke();
    
    // Teeth
    this.graphic.fill(220, 220, 220);
    this.graphic.rect((gridWidth - 5) * pixelSize, 8 * pixelSize, pixelSize, pixelSize);
    this.graphic.rect((gridWidth - 7) * pixelSize, 8 * pixelSize, pixelSize, pixelSize);
    this.graphic.rect((gridWidth - 9) * pixelSize, 8 * pixelSize, pixelSize, pixelSize);
    
    // Tiny arms
    this.graphic.fill(deepShadeColor);
    this.graphic.rect((gridWidth - 8) * pixelSize, 12 * pixelSize, pixelSize * 2, pixelSize * 2);
    
    // Claws
    this.graphic.fill(deepShadeColor);
    this.graphic.rect(8 * pixelSize, (gridHeight - 2) * pixelSize, pixelSize, pixelSize);
    this.graphic.rect(16 * pixelSize, (gridHeight - 2) * pixelSize, pixelSize, pixelSize);
  }
  
  drawPterodactyl(pixelSize, dinoColor, shadeColor, deepShadeColor, accentColor, highlightColor) {
    // Calculate pixel grid dimensions
    let gridWidth = floor(this.width / pixelSize);
    let gridHeight = floor(this.height / pixelSize);
    
    // Create pterodactyl with wings
    // Wings extended
    const pteroOutline = [
      "oo                    oo",
      "ooo                  ooo",
      "oooo                oooo",
      "ooooo              ooooo",
      "oooooo            oooooo",
      "ooooooo          ooooooo",
      "oooooooo        oooooooo",
      "ooooooooo      ooooooooo",
      "oooooooooo    oooooooooo",
      "ooooooooooo  ooooooooooo",
      "oooooooooooooooooooooooo",
      " oooooooooooooooooooooo ",
      "  oooooooooooooooooooo  ",
      "   oooooooooooooooooo   ",
      "    oooooooooooooooo    ",
      "     oooooooooooooo     "
    ];
    
    // Offset for drawing
    let offsetX = 1;
    let offsetY = 2;
    
    // Draw outline
    this.graphic.fill(deepShadeColor);
    for (let y = 0; y < pteroOutline.length && y < gridHeight; y++) {
      for (let x = 0; x < pteroOutline[y].length && x < gridWidth; x++) {
        if (pteroOutline[y][x] === 'o') {
          this.graphic.rect((x + offsetX) * pixelSize, (y + offsetY) * pixelSize, pixelSize, pixelSize);
        }
      }
    }
    
    // Create body fill 
    const pteroBody = [
      "..                    ..",
      "...                  ...",
      "....                ....",
      ".....              .....",
      "......            ......",
      ".......          .......",
      "........        ........",
      ".........      .........",
      "..........    ..........",
      "...........  ...........",
      "........................",
      " ......................  ",
      "  ....................  ",
      "   ..................   ",
      "    ................    ",
      "     ..............     "
    ];
    
    // Draw body
    this.graphic.fill(dinoColor);
    for (let y = 0; y < pteroBody.length && y < gridHeight; y++) {
      for (let x = 0; x < pteroBody[y].length && x < gridWidth; x++) {
        if (pteroBody[y][x] === '.') {
          this.graphic.rect((x + offsetX) * pixelSize, (y + offsetY) * pixelSize, pixelSize, pixelSize);
        }
      }
    }
    
    // Head details
    let headX = gridWidth / 2;
    let headY = 4;
    
    // Draw head
    this.graphic.fill(shadeColor);
    for (let y = 0; y < 4; y++) {
      for (let x = 0; x < 6; x++) {
        this.graphic.rect((headX + x - 3) * pixelSize, (headY + y) * pixelSize, pixelSize, pixelSize);
      }
    }
    
    // Beak
    this.graphic.fill(deepShadeColor);
    for (let i = 0; i < 5; i++) {
      this.graphic.rect((headX + 3 + i) * pixelSize, (headY + 1) * pixelSize, pixelSize, pixelSize);
    }
    
    // Eye with pink glow
    this.graphic.fill(accentColor);
    this.graphic.rect((headX) * pixelSize, (headY + 1) * pixelSize, pixelSize, pixelSize);
    
    // Glowing effect around the eye
    this.graphic.noFill();
    this.graphic.stroke(accentColor);
    this.graphic.strokeWeight(1);
    for (let i = 3; i > 0; i--) {
      this.graphic.stroke(red(accentColor), green(accentColor), blue(accentColor), 70 - i * 20);
      this.graphic.ellipse(
        (headX + 0.5) * pixelSize, 
        (headY + 1.5) * pixelSize, 
        pixelSize * (i + 1) * 2
      );
    }
    this.graphic.noStroke();
    
    // Wing details - membrane texture
    this.graphic.fill(shadeColor);
    
    // Left wing texture
    for (let y = 5; y < 12; y++) {
      for (let x = 2; x < headX - 2; x++) {
        if (y % 2 === 0 && x % 3 === 0) {
          this.graphic.rect((x) * pixelSize, (y + offsetY) * pixelSize, pixelSize, pixelSize);
        }
      }
    }
    
    // Right wing texture
    for (let y = 5; y < 12; y++) {
      for (let x = headX + 2; x < gridWidth - 2; x++) {
        if (y % 2 === 0 && x % 3 === 0) {
          this.graphic.rect((x) * pixelSize, (y + offsetY) * pixelSize, pixelSize, pixelSize);
        }
      }
    }
    
    // Add some wing glow accents
    for (let i = 0; i < 2; i++) {
      let wingX = i === 0 ? gridWidth * 0.25 : gridWidth * 0.75;
      let wingY = 8;
      
      this.graphic.noFill();
      this.graphic.stroke(accentColor);
      this.graphic.strokeWeight(1);
      for (let j = 3; j > 0; j--) {
        this.graphic.stroke(red(accentColor), green(accentColor), blue(accentColor), 50 - j * 10);
        this.graphic.ellipse(
          wingX * pixelSize, 
          (wingY + offsetY) * pixelSize, 
          pixelSize * (j + 1) * 3
        );
      }
    }
    this.graphic.noStroke();
  }
  
  update() {
    // Move obstacle left
    this.x -= gameSpeed;
    
    // Animation
    this.frameCount += this.animationSpeed;
    if (this.frameCount >= 4) {
      this.frameCount = 0;
    }
    
    // For flying type, add vertical movement
    if (this.type === 2) {
      this.verticalOffset += this.verticalDirection * sin(frameCount * this.flapSpeed) * 2;
      
      // Limit vertical movement
      if (abs(this.verticalOffset) > 20) {
        this.verticalDirection *= -1;
      }
    }
  }
  
  show() {
    push();
    if (this.type === 2) {
      // Flying dino with vertical movement
      image(this.graphic, this.x, this.y + this.verticalOffset);
      
      // Add wing flap animation
      if (frameCount % 20 < 10) {
        // Wings up
        this.graphic.drawingContext.globalAlpha = 0.9;
      } else {
        // Wings down
        this.graphic.drawingContext.globalAlpha = 1;
      }
    } else {
      // Ground dinos
      image(this.graphic, this.x, this.y);
      
      // Add slight animation for ground dinos
      if (this.type === 0) { // Raptor
        if (floor(this.frameCount) % 2 === 0) {
          // Leaning forward slightly
          translate(this.x, this.y);
          rotate(radians(2));
          image(this.graphic, 0, 0);
        } else {
          image(this.graphic, this.x, this.y);
        }
      } else { // T-Rex
        if (floor(this.frameCount) % 2 === 0) {
          // Jaw movement
          // This is handled in the main image
          image(this.graphic, this.x, this.y);
        } else {
          image(this.graphic, this.x, this.y);
        }
      }
    }
    pop();
  }
}

// Particle system for effects (jump dust, etc.)
class ParticleSystem {
  constructor() {
    this.particles = [];
  }
  
  createJumpParticles(x, y) {
    for (let i = 0; i < 15; i++) {
      this.particles.push(new Particle(x, y, 'jump'));
    }
  }
  
  createDeathParticles(x, y) {
    for (let i = 0; i < 30; i++) {
      this.particles.push(new Particle(x, y, 'death'));
    }
  }
  
  createTrailParticles(x, y) {
    if (frameCount % 5 === 0) {
      for (let i = 0; i < 3; i++) {
        this.particles.push(new Particle(x, y, 'trail'));
      }
    }
  }
  
  update() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      let particle = this.particles[i];
      particle.update();
      
      if (particle.isDead()) {
        this.particles.splice(i, 1);
      }
    }
  }
  
  show() {
    for (let particle of this.particles) {
      particle.show();
    }
  }
}

// Particle class for effects
class Particle {
  constructor(x, y, type='jump') {
    this.type = type;
    this.x = x;
    this.y = y;
    
    if (this.type === 'jump') {
      this.vx = random(-3, 3);
      this.vy = random(-6, -1);
      this.alpha = 255;
      this.size = random(3, 8);
      this.color = color(255, 105, 180);
      this.gravity = 0.2;
      this.alphaDelta = 10;
    } else if (this.type === 'death') {
      this.vx = random(-5, 5);
      this.vy = random(-8, 8);
      this.alpha = 255;
      this.size = random(4, 10);
      
      // Mix of pink and white particles for death effect
      if (random() < 0.5) {
        this.color = color(255, 105, 180);
      } else {
        this.color = color(255, 255, 255);
      }
      
      this.gravity = 0.1;
      this.alphaDelta = 5;
      this.rotation = random(TWO_PI);
      this.rotationSpeed = random(-0.2, 0.2);
    } else if (this.type === 'trail') {
      this.vx = random(-1, 0);
      this.vy = random(-0.5, 0.5);
      this.alpha = 150;
      this.size = random(2, 4);
      this.color = color(255, 105, 180);
      this.gravity = 0;
      this.alphaDelta = 8;
    }
  }
  
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.alpha -= this.alphaDelta;
    
    if (this.type === 'death') {
      this.rotation += this.rotationSpeed;
      this.vx *= 0.95; // Slow down death particles
      this.vy *= 0.95;
    } else {
      this.vy += this.gravity; // Apply gravity to jump particles
    }
  }
  
  show() {
    push();
    if (this.type === 'death') {
      // Death particles can be various shapes
      translate(this.x, this.y);
      rotate(this.rotation);
      noStroke();
      fill(red(this.color), green(this.color), blue(this.color), this.alpha);
      
      let shape = floor(random(3));
      if (shape === 0) {
        // Square particle
        rectMode(CENTER);
        rect(0, 0, this.size, this.size);
      } else if (shape === 1) {
        // Diamond particle
        beginShape();
        vertex(0, -this.size/2);
        vertex(this.size/2, 0);
        vertex(0, this.size/2);
        vertex(-this.size/2, 0);
        endShape(CLOSE);
      } else {
        // Circle particle
        ellipse(0, 0, this.size);
      }
    } else {
      // Jump and trail particles
      noStroke();
      fill(red(this.color), green(this.color), blue(this.color), this.alpha);
      
      // Add glow effect to particles
      drawingContext.shadowBlur = 5;
      drawingContext.shadowColor = color(red(this.color), green(this.color), blue(this.color), 100);
      
      ellipse(this.x, this.y, this.size);
      drawingContext.shadowBlur = 0;
    }
    pop();
  }
  
  isDead() {
    return this.alpha <= 0;
  }
}   