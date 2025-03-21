const CANVAS_WIDTH = 1280;
const CANVAS_HEIGHT = 720;

let centerSphere;
let particles = [];
let numParticles = 150;
let recording = false;
let recorder;
let chunks = [];
let startTime = 0;
let lastLogTime = 0;
let rotationSpeed = 0.003;
let particleSpeed = 0.02;
let orbitRadius = 300;
let centerRadius = 100;
let trailLength = 20;
let showTrails = true;

function setup() {
  createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT, WEBGL);
  colorMode(RGB, 255, 255, 255, 1);
  
  // Create center sphere
  centerSphere = new CenterSphere(0, 0, 0, centerRadius);
  
  // Initialize particles in orbits around the center
  for (let i = 0; i < numParticles; i++) {
    let phi = random(TWO_PI); // Angle around y-axis
    let theta = random(TWO_PI); // Angle around z-axis
    
    // Random orbit radius with some variation
    let radius = orbitRadius * (0.8 + random(0.4));
    
    // Calculate initial position on the sphere
    let x = radius * sin(phi) * cos(theta);
    let y = radius * sin(phi) * sin(theta);
    let z = radius * cos(phi);
    
    // Random orbit speed with some variation
    let speed = particleSpeed * (0.8 + random(0.4));
    
    particles.push(new Particle(x, y, z, phi, theta, radius, speed));
  }
  
  setupRecorder();
}

function draw() {
  background(0); // Dark background for space
  
  // Set up light
  ambientLight(30);
  pointLight(255, 255, 255, 0, 0, 0);
  
  // Set up view
  rotateX(PI * 0.2); // Tilt down slightly
  rotateY(frameCount * 0.002); // Slowly rotate the entire view
  
  // Display the center sphere
  centerSphere.display();
  
  // Update and display the particles
  for (let particle of particles) {
    particle.update();
    particle.display();
  }

  if (recording) {
    let currentTime = millis();
    if (currentTime - lastLogTime >= 1000) {
      console.log(`Recording time: ${(currentTime - startTime) / 1000} seconds`);
      lastLogTime = currentTime;
    }
  }
}

class CenterSphere {
  constructor(x, y, z, radius) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.radius = radius;
    this.rotation = 0;
  }
  
  display() {
    push();
    translate(this.x, this.y, this.z);
    
    // Core sphere
    noFill();
    stroke(255, 255, 255, 0.8);
    strokeWeight(0.5);
    sphere(this.radius * 0.5, 16, 16);
    
    // Lattice structure
    this.drawLattice();
    
    pop();
  }
  
  drawLattice() {
    // Draw rings
    for (let i = 0; i < 3; i++) {
      push();
      rotateX(PI/2 * i);
      noFill();
      stroke(255, 255, 255, 0.5);
      strokeWeight(1);
      ellipse(0, 0, this.radius * 2);
      pop();
    }
    
    // Draw connecting lines
    for (let i = 0; i < 12; i++) {
      push();
      let angle = i * PI / 6;
      rotateY(angle);
      stroke(255, 255, 255, 0.5);
      strokeWeight(1);
      line(0, -this.radius, 0, 0, this.radius, 0);
      rotateX(PI/2);
      line(0, -this.radius, 0, 0, this.radius, 0);
      pop();
    }
  }
}

class Particle {
  constructor(x, y, z, phi, theta, radius, speed) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.phi = phi;
    this.theta = theta;
    this.radius = radius;
    this.speed = speed;
    this.size = random(2, 5);
    this.trail = [];
    this.orbitAxis = p5.Vector.random3D(); // Random axis of rotation
    this.orbitAngle = random(TWO_PI); // Current angle in orbit
  }
  
  update() {
    // Update orbit angle
    this.orbitAngle += this.speed;
    
    // Save current position in trail before updating
    if (showTrails) {
      this.trail.push(createVector(this.x, this.y, this.z));
      
      // Limit trail length
      if (this.trail.length > trailLength) {
        this.trail.shift();
      }
    }
    
    // Calculate new position based on orbit
    let axis = this.orbitAxis;
    let angle = this.orbitAngle;
    
    // Using quaternion rotation to rotate around arbitrary axis
    let rotationMatrix = [
      [
        cos(angle) + axis.x * axis.x * (1 - cos(angle)),
        axis.x * axis.y * (1 - cos(angle)) - axis.z * sin(angle),
        axis.x * axis.z * (1 - cos(angle)) + axis.y * sin(angle)
      ],
      [
        axis.y * axis.x * (1 - cos(angle)) + axis.z * sin(angle),
        cos(angle) + axis.y * axis.y * (1 - cos(angle)),
        axis.y * axis.z * (1 - cos(angle)) - axis.x * sin(angle)
      ],
      [
        axis.z * axis.x * (1 - cos(angle)) - axis.y * sin(angle),
        axis.z * axis.y * (1 - cos(angle)) + axis.x * sin(angle),
        cos(angle) + axis.z * axis.z * (1 - cos(angle))
      ]
    ];
    
    // Apply rotation to radius vector
    let initialVec = createVector(this.radius, 0, 0);
    let rotatedX = rotationMatrix[0][0] * initialVec.x + rotationMatrix[0][1] * initialVec.y + rotationMatrix[0][2] * initialVec.z;
    let rotatedY = rotationMatrix[1][0] * initialVec.x + rotationMatrix[1][1] * initialVec.y + rotationMatrix[1][2] * initialVec.z;
    let rotatedZ = rotationMatrix[2][0] * initialVec.x + rotationMatrix[2][1] * initialVec.y + rotationMatrix[2][2] * initialVec.z;
    
    this.x = rotatedX;
    this.y = rotatedY;
    this.z = rotatedZ;
  }
  
  display() {
    // Draw trail if enabled
    if (showTrails && this.trail.length > 1) {
      noFill();
      stroke(255, 255, 255, 0.3);
      strokeWeight(1);
      beginShape();
      for (let i = 0; i < this.trail.length; i++) {
        let trailPoint = this.trail[i];
        let alpha = map(i, 0, this.trail.length - 1, 0, 0.8);
        stroke(255, 255, 255, alpha);
        vertex(trailPoint.x, trailPoint.y, trailPoint.z);
      }
      endShape();
    }
    
    // Draw particle
    push();
    translate(this.x, this.y, this.z);
    noStroke();
    fill(255, 255, 255, 0.8);
    sphere(this.size);
    pop();
    
    // Occasionally draw a connecting line to the center
    if (random() < 0.01) {
      stroke(255, 255, 255, 0.15);
      strokeWeight(0.5);
      line(0, 0, 0, this.x, this.y, this.z);
    }
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
  } else if (key === 't' || key === 'T') {
    showTrails = !showTrails;
    if (!showTrails) {
      for (let particle of particles) {
        particle.trail = [];
      }
    }
  } else if (keyCode === UP_ARROW) {
    particleSpeed *= 1.2;
    for (let particle of particles) {
      particle.speed *= 1.2;
    }
  } else if (keyCode === DOWN_ARROW) {
    particleSpeed /= 1.2;
    for (let particle of particles) {
      particle.speed /= 1.2;
    }
  }
}

function setupRecorder() {
  let stream = document.querySelector('canvas').captureStream(60);
  recorder = new MediaRecorder(stream, { 
    mimeType: 'video/webm; codecs=vp9',
    videoBitsPerSecond: 16000000 // High bitrate for quality
  });
  
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
  a.download = 'orbital_particles.webm';
  a.click();
  window.URL.revokeObjectURL(url);
}

function takeScreenshot() {
  let canvas = document.querySelector('canvas');
  let dataURL = canvas.toDataURL('image/png', 1.0);
  let a = document.createElement('a');
  document.body.appendChild(a);
  a.style.display = 'none';
  a.href = dataURL;
  a.download = 'orbital_particles_screenshot.png';
  a.click();
  document.body.removeChild(a);
  console.log("Screenshot saved");
}
