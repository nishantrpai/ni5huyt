const CANVAS_WIDTH = 1280;
const CANVAS_HEIGHT = 720;

let raindrops = [];
const numRaindrops = 100;
let recording = false;
let recorder;
let chunks = [];
let loopDuration = 300; // 5 seconds at 60 fps
let frameCount = 0;
let startTime = 0;
let lastLogTime = 0;

function setup() {
  createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  for (let i = 0; i < numRaindrops; i++) {
    raindrops.push({
      x: random(width),
      y: random(-height, 0),
      length: random(10, 30),
      speed: random(5, 15),
      color: color(255, 255, 255, random(30, 150))
    });
  }
  setupRecorder();
}

function draw() {
  background(0);
  
  for (let raindrop of raindrops) {
    drawRaindrop(raindrop);
    updateRaindrop(raindrop);
  }
  
  if (recording) {
    // Recording is now controlled manually
    let currentTime = millis();
    if (currentTime - lastLogTime >= 1000) {
      console.log(`Recording time: ${(currentTime - startTime) / 1000} seconds`);
      lastLogTime = currentTime;
    }
  }
}

function drawRaindrop(raindrop) {
  stroke(raindrop.color);
  line(raindrop.x, raindrop.y, raindrop.x, raindrop.y + raindrop.length);
}

function updateRaindrop(raindrop) {
  raindrop.y += raindrop.speed;
  if (raindrop.y > height) {
    raindrop.y = random(-50, 0);
    raindrop.x = random(width);
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
  
  // Reset raindrop positions to create a seamless loop
  for (let raindrop of raindrops) {
    raindrop.y = random(-height, 0);
  }
  
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
  a.download = 'raindrops_loop.webm';
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
  a.download = 'raindrops_screenshot.png';
  a.click();
  document.body.removeChild(a);
  console.log("Screenshot saved");
}
