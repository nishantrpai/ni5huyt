const CANVAS_WIDTH = 1280;
const CANVAS_HEIGHT = 720;

let ripple;
let recording = false;
let recorder;
let chunks = [];
let startTime = 0;
let lastLogTime = 0;

function setup() {
  createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  colorMode(RGB, 255, 255, 255, 1);
  ripple = new Ripple(width / 2, height / 2);
  setupRecorder();
}

function draw() {
  background(0); // Dark blue background for water
  
  // Update and display the ripple
  ripple.update();
  ripple.display();

  if (ripple.isFinished()) {
    ripple = new Ripple(width / 2, height / 2); // Reset ripple to center
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
    stroke(255, 255, 255, this.opacity);
    strokeWeight(2);
    ellipse(this.x, this.y, this.radius * 2);
  }
  
  isFinished() {
    return this.radius > max(width, height);
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
