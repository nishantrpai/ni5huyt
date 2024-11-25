const CANVAS_WIDTH = 1280;
const CANVAS_HEIGHT = 720;

let leaves = [];
const NUM_LEAVES = 500; // Increased number of leaves
let wind = 0;
let recording = false;
let recorder;
let chunks = [];
let startTime = 0;
let lastLogTime = 0;

function setup() {
  createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  colorMode(RGB, 255);
  for (let i = 0; i < NUM_LEAVES; i++) {
    leaves.push(new Leaf(random(width * 0.2, width * 0.8), random(height * 0.3, height * 0.6)));
  }
  setupRecorder();
}

function draw() {
  background(0); // Black background
  
  // Create wind effect using noise
  wind = map(noise(frameCount * 0.005), 0, 1, -0.5, 0.5);
  
  // Update and display the leaves
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

class Leaf {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.angle = random(TWO_PI);
    this.size = random(15, 30);
    this.swayAmount = random(0.05, 0.25);
    this.swaySpeed = random(0.02, 0.05);
    this.baseX = x;
    this.baseY = y;
    this.color = color(random(150, 255)); // Varying shades of gray to white
  }
  
  update() {
    // Apply wind effect
    this.x = this.baseX + (wind * 50);
    this.angle = wind + sin(frameCount * this.swaySpeed * 2 + this.baseY) * this.swayAmount;
  }
  
  display() {
    push();
    translate(this.x, this.y);
    rotate(this.angle);
    
    // Draw leaf
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
  recorder = new MediaRecorder(stream, { mimeType: 'video/webm; codecs=vp9', videoBitsPerSecond: 16000000 });
  
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
