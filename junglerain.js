const CANVAS_WIDTH = 1280;
const CANVAS_HEIGHT = 720;

let ripples = [];
let leaves = [];
let recording = false;
let recorder;
let chunks = [];
let startTime = 0;
let lastLogTime = 0;

function setup() {
  createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  colorMode(RGB, 255, 255, 255, 1);
  setupRecorder();
  
  // Create initial leaves
  for (let i = 0; i < 10; i++) {
    leaves.push(new Leaf());
  }
}

function draw() {
  background(0); // Dark background for water
  
  // Create new ripples randomly
  if (frameCount % 60 === 0) {
    ripples.push(new Ripple(random(width), random(height)));
  }
  
  // Update and display ripples
  for (let i = ripples.length - 1; i >= 0; i--) {
    ripples[i].update();
    ripples[i].display();
    if (ripples[i].isFinished()) {
      ripples.splice(i, 1);
    }
  }
  
  // Update and display leaves
  for (let leaf of leaves) {
    leaf.update();
    leaf.display();
  }

  if (recording) {
    let currentTime = millis();
    if (currentTime - lastLogTime >= 1000) {
      console.log(`Recording time: ${(currentTime - startTime) / 1000} seconds`);
      lastLogTime = currentTime;
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
    stroke(255, this.opacity);
    strokeWeight(2);
    ellipse(this.x, this.y, this.radius * 2);
  }
  
  isFinished() {
    return this.radius > max(width, height);
  }
}

class Leaf {
  constructor() {
    this.reset();
  }
  
  reset() {
    this.x = random(width);
    this.y = random(height);
    this.size = random(20, 40);
    this.angle = random(TWO_PI);
    this.rotationSpeed = random(-0.02, 0.02);
    this.swayAmount = random(0.5, 2);
  }
  
  update() {
    this.x += sin(frameCount * 0.02) * this.swayAmount;
    this.y += cos(frameCount * 0.02) * this.swayAmount;
    this.angle += this.rotationSpeed;
    
    // Wrap around the screen
    this.x = (this.x + width) % width;
    this.y = (this.y + height) % height;
  }
  
  display() {
    push();
    translate(this.x, this.y);
    rotate(this.angle);
    
    fill(200, 0.7);
    noStroke();
    
    // Draw a simple leaf shape
    beginShape();
    vertex(0, -this.size/2);
    bezierVertex(this.size/2, -this.size/2, 
                this.size/2, this.size/2, 
                0, this.size/2);
    bezierVertex(-this.size/2, this.size/2, 
                -this.size/2, -this.size/2, 
                0, -this.size/2);
    endShape();
    
    pop();
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
  a.download = 'leaves_on_water.webm';
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
  a.download = 'leaves_on_water_screenshot.png';
  a.click();
  document.body.removeChild(a);
  console.log("Screenshot saved");
}
