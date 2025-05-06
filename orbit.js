let stones = [];
let coreSize = 40;
let rotation = 0;
let glowIntensity = 0;
let recordingEnabled = false;
let chunks = [];
let recorder;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  createOrbitSystem(80); // Reduced number for better visibility
  setupRecorder();
}

function createOrbitSystem(numStones) {
  for (let i = 0; i < numStones; i++) {
    stones.push(new Stone());
  }
}

function draw() {
  background(10);
  
  // Lighting setup
  ambientLight(60);
  pointLight(200, 200, 255, 0, 0, 0);
  
  // Camera controls and rotation
  orbitControl(0.3, 0.3);
  rotateY(rotation);
  rotation += 0.005;
  
  // Update glow intensity
  glowIntensity = 150 + sin(frameCount * 0.05) * 50;

  // Draw glowing core
  push();
  noStroke();
  emissiveMaterial(200, 200, 255, glowIntensity);
  sphere(coreSize);
  ambientLight(0, 50, 100);
  pop();

  // Update and draw all stones
  for (let s of stones) {
    s.update();
    s.show();
  }
}

class Stone {
  constructor() {
    // Initialize in a random orbital position
    let phi = random(TWO_PI);
    let theta = random(TWO_PI);
    let radius = random(100, 250);
    
    this.pos = createVector(
      radius * sin(theta) * cos(phi),
      radius * sin(theta) * sin(phi),
      radius * cos(theta)
    );
    
    // Initialize velocity for orbital motion
    this.vel = this.getInitialVelocity();
    this.acc = createVector(0, 0, 0);
    
    // Visual properties
    this.active = true;
    this.color = color(random(180, 220), random(180, 255), random(200, 255));
    this.size = random(2, 4);
    this.glow = 150;
    this.pulseRate = random(0.03, 0.08);
  }

  getInitialVelocity() {
    // Calculate a velocity vector perpendicular to the position vector
    // This creates an initial orbital motion
    let perpendicular = createVector(
      -this.pos.y + random(-0.2, 0.2),
      this.pos.x + random(-0.2, 0.2),
      random(-0.2, 0.2)
    );
    return perpendicular.normalize().mult(random(1.5, 2.5));
  }

  update() {
    // Reset acceleration
    this.acc.mult(0);
    
    // Calculate gravitational force
    let gravityVector = createVector(-this.pos.x, -this.pos.y, -this.pos.z);
    let distanceSquared = gravityVector.magSq();
    let gravityStrength = 150 / distanceSquared; // Adjusted gravity constant
    gravityVector.normalize().mult(gravityStrength);
    
    // Apply gravity
    this.acc.add(gravityVector);
    
    // Apply slight perturbation for more interesting motion
    if (frameCount % 60 === 0) {
      this.acc.add(p5.Vector.random3D().mult(0.01));
    }
    
    // Update velocity and position
    this.vel.add(this.acc);
    this.vel.mult(0.995); // Slight drag to maintain stable orbits
    this.pos.add(this.vel);
    
    // Update glow effect
    this.glow = 150 + sin(frameCount * this.pulseRate) * 50;
    
    // Keep stones within bounds
    let dist = this.pos.mag();
    if (dist > 300) {
      this.pos.mult(300/dist);
      this.vel.mult(0.8); // Reduce velocity when hitting boundary
    }
  }

  show() {
    push();
    translate(this.pos.x, this.pos.y, this.pos.z);
    noStroke();
    emissiveMaterial(red(this.color), green(this.color), blue(this.color), this.glow);
    sphere(this.size);
    pop();
  }
}

// Recording functionality
function setupRecorder() {
  let canvas = document.querySelector('canvas');
  if (canvas) {
    let stream = canvas.captureStream(60);
    recorder = new MediaRecorder(stream, { mimeType: 'video/webm; codecs=vp9' });
    
    recorder.ondataavailable = e => {
      if (e.data.size) {
        chunks.push(e.data);
      }
    };
    
    recorder.onstop = exportVideo;
  }
}

function exportVideo() {
  let blob = new Blob(chunks, { 'type': 'video/webm' });
  let url = URL.createObjectURL(blob);
  let a = document.createElement('a');
  document.body.appendChild(a);
  a.style.display = 'none';
  a.href = url;
  a.download = 'orbit_system.webm';
  a.click();
  window.URL.revokeObjectURL(url);
}

function takeScreenshot() {
  let canvas = document.querySelector('canvas');
  if (canvas) {
    let dataURL = canvas.toDataURL('image/png');
    let a = document.createElement('a');
    document.body.appendChild(a);
    a.style.display = 'none';
    a.href = dataURL;
    a.download = 'orbit_system_screenshot.png';
    a.click();
    document.body.removeChild(a);
    console.log("Screenshot saved");
  }
}

function keyPressed() {
  if (key === 'r' || key === 'R') {
    if (!recordingEnabled) {
      startRecording();
    } else {
      stopRecording();
    }
  } else if (key === 's' || key === 'S') {
    takeScreenshot();
  }
}

function startRecording() {
  chunks = [];
  recordingEnabled = true;
  recorder.start();
  console.log("Recording started");
}

function stopRecording() {
  recordingEnabled = false;
  recorder.stop();
  console.log("Recording stopped");
}

// Add a window resize handler
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
