// define variables
let nodes = [];
let numNodes = 120;
let minDist = 30;
let maxDist = 120;
let angle = 0; // Added to control rotation
let zOffset = 0; // Added to control tunnel movement
let speed = 2; // Added to control speed of tunnel movement
let width = 1280; // Added to control width of canvas
let height = 720; // Added to control height of canvas
let recording = false;
let recorder;
let chunks = [];
let startTime = 0;
let lastLogTime = 0;
let spaceBetweenFractals = 500; // Added to control space between fractals

// setup function
function setup() {
  createCanvas(width, height, WEBGL);
  setupRecorder();
  
  // create initial nodes
  for (let i = 0; i < numNodes; i++) {
    nodes.push(createNode());
  }
}

// draw function
function draw() {
  orbitControl();
  background(0);

  // move through the tunnel
  zOffset -= speed;

  // draw and update nodes
  for (let i = 0; i < nodes.length; i++) {
    let node = nodes[i];
    
    // update node position
    node.z += speed;
    
    // if node is behind the camera, reset it
    if (node.z > 500) {
      nodes[i] = createNode();
    }

    // draw connections between nodes
    for (let j = i + 1; j < nodes.length; j++) {
      let otherNode = nodes[j];
      let d = dist(node.x, node.y, node.z, otherNode.x, otherNode.y, otherNode.z);

      if (d < maxDist && d > minDist) {
        stroke(255, map(d, minDist, maxDist, 255, 50));
        line(node.x, node.y, node.z, otherNode.x, otherNode.y, otherNode.z);
      }
    }

    // draw node
    push();
    translate(node.x, node.y, node.z);
    noStroke();
    fill(255);
    sphere(2);
    pop();
  }

  // Rotate the entire structure slowly
  rotateY(angle);
  angle += 0.01;

  // Add space between fractals
  if (zOffset <= -spaceBetweenFractals) {
    zOffset = 0;
    // Reset all nodes to create a new fractal
    for (let i = 0; i < nodes.length; i++) {
      nodes[i] = createNode();
    }
  }

  if (recording) {
    let currentTime = millis();
    if (currentTime - lastLogTime >= 1000) {
      console.log(`Recording time: ${(currentTime - startTime) / 1000} seconds`);
      lastLogTime = currentTime;
    }
  }
}

// function to create a new node
function createNode() {
  let theta = random(TWO_PI);
  let phi = random(PI);
  let r = random(100, 300);
  
  let x = r * sin(phi) * cos(theta);
  let y = r * sin(phi) * sin(theta);
  let z = r * cos(phi) - 1000; // Start nodes behind the camera
  
  return createVector(x, y, z);
}

// function to create fractal pattern (not directly used, but kept for reference)
function createFractal(depth, x, y, size) {
  if (depth == 0) {
    return [{ x: x, y: y }];
  } else {
    let points = [];
    let halfSize = size / 2;
    points = points.concat(
      createFractal(depth - 1, x - halfSize, y - halfSize, halfSize)
    );
    points = points.concat(
      createFractal(depth - 1, x + halfSize, y - halfSize, halfSize)
    );
    points = points.concat(createFractal(depth - 1, x, y + halfSize, halfSize));
    return points;
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
  a.download = 'fractal_effect.webm';
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
  a.download = 'fractal_effect_screenshot.png';
  a.click();
  document.body.removeChild(a);
  console.log("Screenshot saved");
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
