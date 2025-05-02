const CANVAS_WIDTH = 1280;
const CANVAS_HEIGHT = 720;

let ripple;
let recording = false;
let recorder;
let chunks = [];
let startTime = 0;
let lastLogTime = 0;
// Water surface parameters
let worleyPoints = [];
let numPoints = 30;
let time = 0;
let waterColor;

function setup() {
  createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  colorMode(RGB, 255, 255, 255, 1);
  ripple = new Ripple(width / 2, height / 2);
  setupRecorder();
  
  // Initialize Worley noise points
  initWorleyPoints();
  
  // Set water base color (dark blue)
  waterColor = color(10, 30, 60);
}

function initWorleyPoints() {
  // Create random points for Worley noise
  worleyPoints = [];
  for (let i = 0; i < numPoints; i++) {
    worleyPoints.push({
      x: random(width * 1.5) - width * 0.25,
      y: random(height * 1.5) - height * 0.25,
      xSpeed: random(0.2, 0.5) * (random() > 0.5 ? 1 : -1),
      ySpeed: random(0.2, 0.5) * (random() > 0.5 ? 1 : -1)
    });
  }
}

function draw() {
  // Draw water surface with Worley noise
  drawWaterSurface();
  
  // Update and display the ripple
  ripple.update();
  ripple.display();

  if (ripple.isFinished()) {
    ripple = new Ripple(width / 2, height / 2); // Reset ripple to center
  }

  // Move Worley noise points for the flowing water effect
  updateWorleyPoints();
  
  // Update time for animation
  time += 0.01;

  if (recording) {
    let currentTime = millis();
    if (currentTime - lastLogTime >= 1000) {
      console.log(`Recording time: ${(currentTime - startTime) / 1000} seconds`);
      lastLogTime = currentTime;
    }
  }
}

function drawWaterSurface() {
  loadPixels();
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      let d = worleyNoise(x, y);
      
      // Apply ripple effect to the water surface
      let rippleEffect = getRippleEffect(x, y);
      d = d * (1 + rippleEffect * 0.3);
      
      // Create depth effect with subtle blue variations
      let waterBrightness = map(d, 0, 0.1, 0.2, 0.8);
      let r = 10 + waterBrightness * 40;
      let g = 30 + waterBrightness * 60;
      let b = 90 + waterBrightness * 90;
      
      // Add subtle wave movement over time
      let timeEffect = sin(x * 0.01 + y * 0.01 + time) * 0.05;
      waterBrightness += timeEffect;
      
      let c = color(r, g, b);
      set(x, y, c);
    }
  }
  updatePixels();
}

function getRippleEffect(x, y) {
  // Calculate distance from ripple center
  let d = dist(x, y, ripple.x, ripple.y);
  
  // Check if the point is affected by the ripple
  let rippleWidth = 50;
  if (d < ripple.radius + rippleWidth && d > ripple.radius - rippleWidth) {
    // The closer to the ripple edge, the stronger the effect
    let effect = map(abs(d - ripple.radius), 0, rippleWidth, 1, 0);
    return effect * ripple.opacity;
  }
  return 0;
}

// Optimize Worley noise calculation for performance
function worleyNoise(x, y) {
  let minDist = Infinity;
  let secondMinDist = Infinity;
  
  // Only check nearby points for optimization
  for (let point of worleyPoints) {
    let d = dist(x, y, point.x, point.y);
    if (d < minDist) {
      secondMinDist = minDist;
      minDist = d;
    } else if (d < secondMinDist) {
      secondMinDist = d;
    }
  }
  
  // F2-F1 difference creates more interesting patterns
  let result = map((secondMinDist - minDist), 0, 50, 0, 0.5);
  return constrain(result, 0, 1);
}

function updateWorleyPoints() {
  for (let point of worleyPoints) {
    // Move points based on their speed
    point.x += point.xSpeed;
    point.y += point.ySpeed;
    
    // Bounce points off the edges with some padding
    if (point.x < -width * 0.25 || point.x > width * 1.25) {
      point.xSpeed *= -1;
    }
    if (point.y < -height * 0.25 || point.y > height * 1.25) {
      point.ySpeed *= -1;
    }
  }
}

class Ripple {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 0;
    this.speed = 2;
    this.opacity = 1;
  }
  
  update() {
    this.radius += this.speed;
    this.opacity = map(this.radius, 0, max(width, height), 1, 0);
  }
  
  display() {
    noFill();
    stroke(255, 255, 255, this.opacity);
    strokeWeight(2);
    ellipse(this.x, this.y, this.radius * 2);
  }
  
  isFinished() {
    return this.radius > max(width, height);
  }
}

function keyPressed() {
  if (key === '+' || key === '=') {
    numPoints += 5;
    initWorleyPoints();
  } else if (key === '-' || key === '_') {
    numPoints = max(10, numPoints - 5);
    initWorleyPoints();
  } else if (key === 'r' || key === 'R') {
    if (!recording) {
      startRecording();
    } else {
      stopRecording();
    }
  } else if (key === 's' || key === 'S') {
    takeScreenshot();
  }
}

function setupRecorder() {
  let stream = document.querySelector('canvas').captureStream(60);
  recorder = new MediaRecorder(stream, { mimeType: 'video/webm; codecs=vp9' });
  
  recorder.ondataavailable = e => {
    if (e.data.size) {
      chunks.push(e.data);
    }
  };
  
  recorder.onstop = exportVideo;
}

function startRecording() {
  console.log("Recording started");
  chunks = [];
  recording = true;
  startTime = millis();
  lastLogTime = startTime;
  recorder.start();
}

function stopRecording() {
  console.log("Recording stopped");
  recording = false;
  recorder.stop();
}

function exportVideo() {
  let blob = new Blob(chunks, { 'type' : 'video/webm' });
  let url = URL.createObjectURL(blob);
  let a = document.createElement('a');
  document.body.appendChild(a);
  a.style.display = 'none';
  a.href = url;
  a.download = 'ripple_effect.webm';
  a.click();
  window.URL.revokeObjectURL(url);
}

function takeScreenshot() {
  let canvas = document.querySelector('canvas');
  let dataURL = canvas.toDataURL('image/png');
  let a = document.createElement('a');
  document.body.appendChild(a);
  a.style.display = 'none';
  a.href = dataURL;
  a.download = 'ripple_effect_screenshot.png';
  a.click();
  document.body.removeChild(a);
  console.log("Screenshot saved");
}

function mousePressed() {
  // Create a new ripple at the mouse position when clicked
  ripple = new Ripple(mouseX, mouseY);
}

// Make the water surface more dynamic with mouse movement
function mouseMoved() {
  // Slightly influence the closest Worley point based on mouse movement
  if (worleyPoints.length > 0) {
    let closest = 0;
    let minDist = Infinity;
    
    for (let i = 0; i < worleyPoints.length; i++) {
      let d = dist(mouseX, mouseY, worleyPoints[i].x, worleyPoints[i].y);
      if (d < minDist) {
        minDist = d;
        closest = i;
      }
    }
    
    // Only affect if mouse is somewhat close
    if (minDist < 100) {
      let influence = map(minDist, 0, 100, 0.2, 0);
      worleyPoints[closest].x += (mouseX - pmouseX) * influence;
      worleyPoints[closest].y += (mouseY - pmouseY) * influence;
    }
  }
}
