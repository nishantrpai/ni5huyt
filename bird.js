const CANVAS_WIDTH = 1280;
const CANVAS_HEIGHT = 720;

let birds = [];
const NUM_BIRDS = 20;
let recording = false;
let recorder;
let chunks = [];
let startTime = 0;
let lastLogTime = 0;
let sunsetGradient;

function setup() {
  createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT, WEBGL);
  colorMode(RGB, 255, 255, 255, 1);
  createSunsetGradient();
  createBirdFormation();
  setupRecorder();
}

function draw() {
  background(200, 100, 50); // Sunset color
  
  // Set up 3D scene
  orbitControl();
  ambientLight(100);
  pointLight(255, 255, 255, 0, 0, 500);
  
  // Update and display the birds
  for (let bird of birds) {
    bird.update();
    bird.display();
  }

  if (recording) {
    let currentTime = millis();
    if (currentTime - lastLogTime >= 1000) {
      console.log(`Recording time: ${(currentTime - startTime) / 1000} seconds`);
      lastLogTime = currentTime;
    }
  }
}

function createSunsetGradient() {
  // Not needed for 3D scene, but kept for compatibility
}

class OrigamiBird {
  constructor(x, y, z) {
    this.position = createVector(x, y, z);
    this.velocity = p5.Vector.random3D().mult(2);
    this.size = random(20, 40);
    this.rotationX = random(TWO_PI);
    this.rotationY = random(TWO_PI);
    this.rotationZ = random(TWO_PI);
    this.flapSpeed = random(0.05, 0.1);
    this.flapAngle = 0;
  }
  
  update() {
    this.position.add(this.velocity);
    
    // Wrap around the canvas
    if (this.position.x > width/2) this.position.x = -width/2;
    if (this.position.x < -width/2) this.position.x = width/2;
    if (this.position.y > height/2) this.position.y = -height/2;
    if (this.position.y < -height/2) this.position.y = height/2;
    if (this.position.z > 500) this.position.z = -500;
    if (this.position.z < -500) this.position.z = 500;
    
    // Update flap animation
    this.flapAngle = sin(frameCount * this.flapSpeed) * PI/6;
  }
  
  display() {
    push();
    translate(this.position.x, this.position.y, this.position.z);
    rotateX(this.rotationX);
    rotateY(this.rotationY);
    rotateZ(this.rotationZ);
    
    // Body
    fill(255);
    noStroke();
    box(this.size, this.size/2, this.size/3);
    
    // Wings
    push();
    rotateY(this.flapAngle);
    fill(200);
    translate(this.size/2, 0, 0);
    box(this.size, this.size/4, this.size);
    pop();
    
    push();
    rotateY(-this.flapAngle);
    fill(200);
    translate(-this.size/2, 0, 0);
    box(this.size, this.size/4, this.size);
    pop();
    
    // Head
    fill(230);
    translate(this.size/2, -this.size/4, 0);
    sphere(this.size/4);
    
    // Beak
    fill(255, 200, 0);
    translate(this.size/4, 0, 0);
    cone(this.size/8, this.size/4);
    
    pop();
  }
}

function createBirdFormation() {
  birds = [];
  for (let i = 0; i < NUM_BIRDS; i++) {
    let x = random(-width/2, width/2);
    let y = random(-height/2, height/2);
    let z = random(-500, 500);
    birds.push(new OrigamiBird(x, y, z));
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
    videoBitsPerSecond: 16000000 // High bitrate for better quality
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
  a.download = 'origami_birds.webm';
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
  a.download = 'origami_birds_screenshot.png';
  a.click();
  document.body.removeChild(a);
  console.log("Screenshot saved");
}
