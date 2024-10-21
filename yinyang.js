const CANVAS_WIDTH = 1280;
const CANVAS_HEIGHT = 720;

let yinYangRadius;
let rotation = 0;
let recording = false;
let recorder;
let chunks = [];
let startTime = 0;
let lastLogTime = 0;

function setup() {
  createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  yinYangRadius = min(width, height) * 0.4;
  setupRecorder();
}

function draw() {
  background(220);
  translate(width / 2, height / 2);
  rotate(rotation);
  
  // Draw Yin-Yang
  noStroke();
  fill(255); // White half
  arc(0, 0, yinYangRadius * 2, yinYangRadius * 2, PI / 2, 3 * PI / 2);
  fill(0); // Black half
  arc(0, 0, yinYangRadius * 2, yinYangRadius * 2, 3 * PI / 2, PI / 2);
  
  // Draw circles
  fill(255);
  ellipse(0, yinYangRadius / 2, yinYangRadius);
  fill(0);
  ellipse(0, -yinYangRadius / 2, yinYangRadius);
  
  // Draw small circles
  fill(0);
  ellipse(0, yinYangRadius / 2, yinYangRadius / 5);
  fill(255);
  ellipse(0, -yinYangRadius / 2, yinYangRadius / 5);
  
  rotation += 0.02;
  
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
  recorder = new MediaRecorder(stream, { 
    mimeType: 'video/webm; codecs=vp9',
    videoBitsPerSecond: 16000000
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
  a.download = 'yin_yang.webm';
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
  a.download = 'yin_yang_screenshot.png';
  a.click();
  document.body.removeChild(a);
  console.log("Screenshot saved");
}
