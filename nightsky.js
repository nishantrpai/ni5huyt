const CANVAS_WIDTH = 1280;
const CANVAS_HEIGHT = 720;
let itter = 240
let minSize = 0.5
let maxSize = 2
let minOpacity = 50
let maxOpacity = 200
let bgColor
let stars = []
let recording = false;
let recorder;
let chunks = [];
let startTime = 0;
let lastLogTime = 0;

function setup() {
  pixelDensity(3)
  createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT)
  bgColor = color(33,23,70)
  setupRecorder()
  // Create initial stars
  for(let y = 0; y < itter; y++) {
    stars.push({
      x: random(width),
      y: random(height),
      size: random(minSize, maxSize),
      twinkleSpeed: random(0.02, 0.05),
      twinkleOffset: random(TWO_PI)
    })
  }
}

function draw() {
  background(0,0,0);
  for(let star of stars) {
    let twinkle = sin(frameCount * star.twinkleSpeed + star.twinkleOffset)
    let sizeMod = map(twinkle, -1, 1, -0.5, 0.5)
    let currentSize = star.size + sizeMod
    
    noStroke()
    let rOpacity = map(currentSize, minSize, maxSize, minOpacity, maxOpacity)
    fill(255,255,255,rOpacity)
    ellipse(star.x, star.y, currentSize, currentSize)
  }
  
  if (recording) {
    let currentTime = millis();
    if (currentTime - lastLogTime >= 1000) {
      console.log(`Recording time: ${(currentTime - startTime) / 1000} seconds`);
      lastLogTime = currentTime;
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
  
  // // Reset raindrop positions to create a seamless loop
  // for (let raindrop of raindrops) {
  //   raindrop.y = random(-height, 0);
  // }
  
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
