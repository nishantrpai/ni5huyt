const CANVAS_WIDTH = 1280;
const CANVAS_HEIGHT = 720;

let streetLights = [];
let fogParticles = [];
let carPosition;
let recording = false;
let recorder;
let chunks = [];
let startTime = 0;
let lastLogTime = 0;

function setup() {
  createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  colorMode(RGB, 255, 255, 255, 1);
  
  // Create street lights
  for(let i = 0; i < 20; i++) {
    streetLights.push(new StreetLight(i * 300, height/2));
  }
  
  // Initialize fog particles
  for(let i = 0; i < 5000; i++) {
    fogParticles.push(new FogParticle());
  }
  
  carPosition = createVector(width/2, height * 0.8);
  
  setupRecorder();
}

function draw() {
  background(10, 10, 15); // Very dark night background
  
  // Simulate car movement
  translate(-frameCount % 300, 0);
  
  // Draw and update fog
  for(let particle of fogParticles) {
    particle.update();
    particle.display();
  }
  
  // Draw street
  noStroke();
  fill(30, 30, 35);
  rect(0, height/2, width*2, height/2);
  
  // Draw and update street lights
  for(let light of streetLights) {
    light.display();
  }
  
  // Reset translation for UI elements
  resetMatrix();
  
  // Draw car windshield frame
  noFill();
  stroke(50);
  strokeWeight(20);
  rect(0, 0, width, height, 50);
  
  if (recording) {
    let currentTime = millis();
    if (currentTime - lastLogTime >= 1000) {
      console.log(`Recording time: ${(currentTime - startTime) / 1000} seconds`);
      lastLogTime = currentTime;
    }
  }
}

class StreetLight {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.poleHeight = 200;
    this.glowRadius = 300;
  }
  
  display() {
    // Draw pole
    stroke(60);
    strokeWeight(8);
    line(this.x, this.y + this.poleHeight, this.x, this.y);
    
    // Draw light fixture
    fill(255, 200, 100);
    noStroke();
    ellipse(this.x, this.y, 20, 20);
    
    // Draw light glow
    let gradient = drawingContext.createRadialGradient(
      this.x, this.y, 0,
      this.x, this.y, this.glowRadius
    );
    gradient.addColorStop(0, 'rgba(255, 200, 100, 0.2)');
    gradient.addColorStop(1, 'rgba(255, 200, 100, 0)');
    drawingContext.fillStyle = gradient;
    ellipse(this.x, this.y, this.glowRadius * 2);
  }
}

class FogParticle {
  constructor() {
    this.reset();
  }
  
  reset() {
    this.x = random(width*2);
    this.y = random(height);
    this.size = random(1, 3);
    this.speed = random(0.5, 1);
    this.opacity = random(0.1, 0.3);
  }
  
  update() {
    this.x -= this.speed;
    if(this.x < -this.size) {
      this.x = width*2 + this.size;
    }
  }
  
  display() {
    noStroke();
    fill(200, 200, 200, this.opacity * 255);
    ellipse(this.x, this.y, this.size);
  }
}

function keyPressed() {
  if (key === 'r' || key === 'R') {
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
  a.download = 'foggy_streets.webm';
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
  a.download = 'foggy_streets_screenshot.png';
  a.click();
  document.body.removeChild(a);
  console.log("Screenshot saved");
}
