let leaves = [];
let numLeaves = 100; // Reduced number of leaves for a closer view
let wind = 0;
let recording = false;
let chunks = [];
let startTime = 0;
let lastLogTime = 0;
let branch;

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100, 1);
  
  // Create a branch
  branch = new Branch();
  
  // Initialize leaves attached to the branch
  for (let i = 0; i < numLeaves; i++) {
    leaves.push(new Leaf(branch));
  }
  setupRecorder();
}

function draw() {
  background(200, 70, 50); // Lighter blue sky background
  
  wind = map(noise(frameCount * 0.01), 0, 1, -0.2, 0.2);
  
  // Draw branch
  branch.show();
  
  // Draw leaves
  for (let leaf of leaves) {
    leaf.update();
    leaf.show();
  }
  
  if (recording) {
    let currentTime = millis();
    if (currentTime - lastLogTime >= 1000) {
      console.log(`Recording time: ${(currentTime - startTime) / 1000} seconds`);
      lastLogTime = currentTime;
    }
  }
}

class Branch {
  constructor() {
    this.x = width * 0.2;
    this.y = height * 0.5;
    this.length = width * 0.6;
    this.angle = -PI / 6; // Slight upward angle
  }
  
  show() {
    push();
    translate(this.x, this.y);
    rotate(this.angle);
    strokeWeight(20);
    stroke(30, 70, 40);
    line(0, 0, this.length, 0);
    pop();
  }
}

class Leaf {
  constructor(branch) {
    this.branch = branch;
    this.offset = random(0.2, 0.8); // Position along the branch
    this.size = random(15, 30);
    this.angle = random(-PI/4, PI/4);
    this.baseAngle = this.angle;
    this.color = color(random(60, 120), random(70, 100), random(40, 80));
    this.swaySpeed = random(0.02, 0.05);
    this.swayAmount = random(0.05, 0.1);
  }
  
  update() {
    this.angle = this.baseAngle + sin(frameCount * this.swaySpeed) * this.swayAmount + wind;
  }
  
  show() {
    push();
    translate(
      this.branch.x + cos(this.branch.angle) * (this.branch.length * this.offset),
      this.branch.y + sin(this.branch.angle) * (this.branch.length * this.offset)
    );
    rotate(this.angle);
    fill(this.color);
    noStroke();
    beginShape();
    vertex(0, -this.size/2);
    bezierVertex(this.size/2, -this.size/4, this.size/2, this.size/4, 0, this.size/2);
    bezierVertex(-this.size/2, this.size/4, -this.size/2, -this.size/4, 0, -this.size/2);
    endShape(CLOSE);
    pop();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  branch = new Branch(); // Recreate branch on resize
  leaves = []; // Clear existing leaves
  for (let i = 0; i < numLeaves; i++) {
    leaves.push(new Leaf(branch));
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
  a.download = 'leaves_on_branch.webm';
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
  a.download = 'leaves_on_branch_screenshot.png';
  a.click();
  document.body.removeChild(a);
  console.log("Screenshot saved");
}
