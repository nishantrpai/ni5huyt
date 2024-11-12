const CANVAS_WIDTH = 1280;
const CANVAS_HEIGHT = 720;

let underwaterWaves = [];
const numWaves = 12; // More waves for underwater effect
let recording = false;
let recorder;
let chunks = [];
let loopDuration = 300;
let frameCount = 0;
let startTime = 0;

// Particle system for underwater debris/bubbles
let particles = [];
const NUM_PARTICLES = 50;

function setup() {
  createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  
  // Initialize waves with underwater properties
  for (let i = 0; i < numWaves; i++) {
    underwaterWaves.push({
      amplitude: random(8, 20), // Varied amplitudes
      frequency: random(0.003, 0.008), // Slower frequencies for underwater feel
      speed: random(0.01, 0.02), // Slower speeds
      offset: random(TWO_PI), // Random phase offsets
      color: color(30, 30, 30, random(100, 200)) // Blue tones with transparency
    });
  }

  // Initialize particles
  for (let i = 0; i < NUM_PARTICLES; i++) {
    particles.push({
      x: random(width),
      y: random(height),
      size: random(2, 5),
      speed: random(0.5, 2),
      alpha: random(20, 100)
    });
  }
  
  setupRecorder();
}

function draw() {
  // Dark blue gradient background
  let gradient = drawingContext.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, 'rgba(0, 0, 0, 0.5)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 1)');
  drawingContext.fillStyle = gradient;
  rect(0, 0, width, height);

  // Draw light rays
  // drawLightRays();
  
  // Draw waves
  for (let i = 0; i < underwaterWaves.length; i++) {
    drawUnderwaterWave(i);
    underwaterWaves[i].offset += underwaterWaves[i].speed;
  }

  // Update and draw particles
  updateParticles();
  
  if (recording) {
    frameCount++;
    if (frameCount >= loopDuration) {
      stopRecording();
    }
  }
}

function drawUnderwaterWave(index) {
  let wave = underwaterWaves[index];
  let y = map(index, 0, underwaterWaves.length - 1, height * 0.1, height * 0.9);
  
  noFill();
  stroke(wave.color);
  strokeWeight(4);
  beginShape();
  for (let x = 0; x < width; x += 5) {
    let waveY = y + sin(x * wave.frequency + wave.offset) * wave.amplitude;
    vertex(x, waveY);
  }
  endShape();
}

function drawLightRays() {
  drawingContext.save();
  for (let i = 0; i < 3; i++) {
    let x = width * (i / 3) + sin(frameCount * 0.02) * 50;
    let alpha = map(sin(frameCount * 0.02 + i), -1, 1, 10, 30);
    drawingContext.fillStyle = `rgba(255, 255, 255, ${alpha/255})`;
    drawingContext.beginPath();
    drawingContext.moveTo(x, 0);
    drawingContext.lineTo(x + 100, height);
    drawingContext.lineTo(x - 100, height);
    drawingContext.closePath();
    drawingContext.fill();
  }
  drawingContext.restore();
}

function updateParticles() {
  for (let particle of particles) {
    particle.y -= particle.speed;
    if (particle.y < 0) {
      particle.y = height;
      particle.x = random(width);
    }
    fill(255, 255, 255, particle.alpha);
    noStroke();
    ellipse(particle.x, particle.y, particle.size);
  }
}

function setupRecorder() {
  recorder = new MediaRecorder(canvas.captureStream(60), { mimeType: 'video/webm', videoBitsPerSecond: 8000000 });
  recorder.ondataavailable = e => chunks.push(e.data);
  recorder.onstop = exportVideo;
}

function startRecording() {
  chunks = [];
  recording = true;
  frameCount = 0;
  startTime = millis();
  recorder.start();
}

function stopRecording() {
  recording = false;
  recorder.stop();
}

function exportVideo() {
  const blob = new Blob(chunks, { type: 'video/webm' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'underwater_scene.webm';
  a.click();
  URL.revokeObjectURL(url);
}

function takeScreenshot() {
  let screenshot = document.createElement('canvas');
  screenshot.width = width;
  screenshot.height = height;
  screenshot.getContext('2d').drawImage(canvas, 0, 0, width, height);
  let screenshotUrl = screenshot.toDataURL();
  let a = document.createElement('a');
  a.href = screenshotUrl;
  a.download = 'screenshot.png';
  a.click();
}

// Key pressed function to handle recording and screenshot
function keyPressed() {
  if (key === 'r' || key === 'R') {
    if (!recording) {
      startRecording();
    }
  } else if (key === 's' || key === 'S') {
    takeScreenshot();
  }
}
