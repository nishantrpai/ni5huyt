let nodes = [];
let connections = [];
let waves = [];
const numWaves = 5;
const CUBE_SIZE = 200;
let recording = false;
let recorder;
let chunks = [];
let startTime = 0;
let lastLogTime = 0;
let loopRecording = false;
let recordingStage = 0;
let recordingStartAngle = 0;
let recordingEndTime = 0;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  
  // Create waves with grayscale colors
  for (let i = 0; i < numWaves; i++) {
    waves.push({
      amplitude: random(20, 50),
      frequency: random(0.005, 0.01),
      speed: random(0.005, 0.01), // Slower wave movement
      offset: random(TWO_PI),
      color: color(255, 255, 255, i * 30) // Grayscale with varying opacity
    });
  }

  // Create nodes in a single cube pattern
  for (let x = -1; x <= 1; x += 0.5) {
    for (let y = -1; y <= 1; y += 0.5) {
      for (let z = -1; z <= 1; z += 0.5) {
        let px = x * CUBE_SIZE/2 ;
        let py = y * CUBE_SIZE/2;
        let pz = z * CUBE_SIZE/2;
        nodes.push(createVector(px, py, pz));
      }
    }
  }

  // Create more connections between nodes
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      let d = p5.Vector.dist(nodes[i], nodes[j]);
      if (d < CUBE_SIZE * 0.8 && random() < 0.3) {
        connections.push(new Connection(i, j));
      }
    }
  }

  setupRecorder();
}

function draw() {
  background(10);

  // Handle loop recording stages
  if (loopRecording) {
    handleLoopRecording();
  } else {
    // Regular rotation
    rotateY(frameCount * 0.001); // Slow Y-axis rotation
    rotateZ(sin(frameCount * 0.005) * 0.3); // Gentle X-axis wobble
  }

  orbitControl();
  
  // Update waves
  for (let wave of waves) {
    wave.offset += wave.speed;
  }

  // Draw connections first
  for (let conn of connections) {
    conn.update();
    conn.display();
  }

  // Draw nodes on top
  for (let p of nodes) {
    push();
    translate(p.x, p.y, p.z);
    noStroke();
    fill(120);
    sphere(2);
    pop();
  }

  // Display recording time
  if (recording) {
    let currentTime = millis();
    if (currentTime - lastLogTime >= 1000) {
      console.log(`Recording time: ${(currentTime - startTime) / 1000} seconds`);
      lastLogTime = currentTime;
    }
  }
}

class Connection {
  constructor(i, j) {
    this.i = i;
    this.j = j;
    this.weight = random(0.3, 1);
    this.decay = random(0.005, 0.001); // Slower decay
    this.lastEnergy = 0;
    this.baseOpacity = random(30, 80); // Base opacity for grayscale effect
  }

  update() {
    let pos = p5.Vector.add(nodes[this.i], nodes[this.j]).mult(0.5);
    let energy = 0;
    
    // Calculate wave influence
    for (let wave of waves) {
      let waveValue = sin(
        pos.x * wave.frequency + 
        pos.y * wave.frequency + 
        pos.z * wave.frequency + 
        wave.offset
      ) * wave.amplitude;
      
      energy += map(waveValue, -wave.amplitude, wave.amplitude, 0, 1);
    }
    energy /= waves.length;
    
    // Smoother weight updates
    if (energy > 0.5) {
      this.weight = lerp(this.weight, 1, 0.05);
    } else {
      this.weight = max(0.05, this.weight - this.decay);
    }
    
    this.lastEnergy = energy;
  }

  display() {
    if (this.weight > 0.05) {
      let a = nodes[this.i];
      let b = nodes[this.j];
      
      // Create grayscale effect with wave influence
      let brightness = lerp(10, 250, this.weight);
      let alpha = lerp(this.baseOpacity, 150, this.lastEnergy) * this.weight;
      
      stroke(brightness, alpha);
      strokeWeight(this.weight * 1);
      line(a.x, a.y, a.z, b.x, b.y, b.z);
    }
  }
}

function keyPressed() {
  if (key === 'r' || key === 'R') {
    if (!recording) {
      if (keyIsDown(SHIFT)) {
        console.log('perfect loop recording');
        startLoopRecording();
      } else {
        startRecording();
      }
    } else {
      if (!loopRecording) {
        stopRecording();
      }
    }
  } else if (key === 's' || key === 'S') {
    takeScreenshot();
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
  a.download = 'energy_cube.webm';
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
  a.download = 'energy_cube_screenshot.png';
  a.click();
  document.body.removeChild(a);
  console.log("Screenshot saved");
}

function startLoopRecording() {
  console.log("Starting perfect loop recording...");
  resetCube();
  loopRecording = true;
  recordingStage = 0;
  recordingStartAngle = frameCount * 0.001; // Save current rotation
  startRecording();
}

function resetCube() {
  // Reset any animation states if needed
  for (let wave of waves) {
    wave.offset = random(TWO_PI);
  }
  for (let conn of connections) {
    conn.weight = random(0.3, 1);
  }
}

function handleLoopRecording() {
  let currentTime = millis();
  
  // Stage 0: Start with initial state for 2 seconds
  if (recordingStage === 0) {
    resetCube();
    
    if (currentTime - startTime > 2000) {
      recordingStage = 1;
      console.log("Recording stage 1: Starting animation");
    }
  }
  // Stage 1: Full animation cycle
  else if (recordingStage === 1) {
    // During the animation cycle, update rotation to maintain smooth motion
    const rotationPerFrame = 0.001; // Using the same rotation speed
    const totalRotation = TWO_PI; // Full rotation
    const timeForFullRotation = totalRotation / rotationPerFrame * (1000/60); // ms for full rotation at 60fps
    
    // Calculate rotation progress
    let elapsed = currentTime - (startTime + 2000); // Time since stage 1 began
    
    // Use modulo to ensure we complete exactly one rotation
    let rotationProgress = (elapsed / timeForFullRotation) % 1;
    
    // Set rotation based on progress
    rotateY(recordingStartAngle + rotationProgress * TWO_PI);
    rotateZ(sin(frameCount * 0.005) * 0.3); // Keep the wobble

    // Check if we've completed a full rotation
    if (elapsed > timeForFullRotation) {
      recordingStage = 2;
      recordingEndTime = currentTime;
      console.log("Recording stage 2: Ending animation");
    }
  } 
  // Stage 2: End with final state for 2 more seconds
  else if (recordingStage === 2) {
    // Keep rotation fixed at ending position
    rotateY(recordingStartAngle + TWO_PI);
    rotateZ(sin(frameCount * 0.005) * 0.3);
    
    if (currentTime - recordingEndTime > 2000) {
      // Stop recording once we've completed the loop
      loopRecording = false;
      stopRecording();
      
      // Reset to normal mode
      recordingStage = 0;
      console.log("Perfect loop recording completed");
    }
  }
}