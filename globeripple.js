let points = [];
let connections = [];
let activeNodes = [];
let waveFront = [];
let globeRadius = 200;
let detail = 20;
let initialRotation = 0;
let globeRotation = initialRotation;
let spreading = false;
let waveOrigin = null;
let waveTime = 0;
let waveSpeed = 1;
let maxWaveDistance = 100;
let propagationInterval = 1000; // Time in milliseconds between each wave step
let lastPropagationTime = 0; // Last time the wave propagated
let recording = false;
let chunks = [];
let recorder;
let startTime = 0;
let lastLogTime = 0;
let loopRecording = false;
let recordingStage = 0; // 0: start with empty, 1: ripple, 2: end with empty
let recordingStartAngle = 0;
let recordingEndTime = 0;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  angleMode(DEGREES);
  makeSpherePoints(globeRadius, detail);
  connectNeighbors();
  startWave();
  setupRecorder();
}

// Add a window resize handler to keep the canvas full screen
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  background(10);
  
  // Center the globe in the frame
  translate(0, 0, 0);
  
  // Handle special recording mode
  if (loopRecording) {
    handleLoopRecording();
  }
  
  // Regular rotation
  rotateY(globeRotation);
  rotateX(60);
  rotateZ(45);
  
  if (!loopRecording) {
    globeRotation += 0.11;
  }

  updateWave();
  showSphere();
}

function handleLoopRecording() {
  let currentTime = millis();
  
  // Stage 0: Start with empty globe for 2 seconds
  if (recordingStage === 0) {
    resetGlobe();
    spreading = false;
    
    if (currentTime - startTime > 2000) {
      recordingStage = 1;
      recordingStartAngle = globeRotation;
      console.log("Recording start angle:", recordingStartAngle);
      startWave();
      console.log("Recording stage 1: Starting wave");
    }
  }
  // Stage 1: Full wave cycle
  else if (recordingStage === 1) {
    // During the wave cycle, update rotation to maintain smooth motion
    const rotationPerFrame = 0.11; // Using your updated rotation speed
    const totalRotation = 360; // Full rotation
    const timeForFullRotation = totalRotation / rotationPerFrame * 16.67; // 16.67ms per frame at 60fps
    
    // Calculate rotation progress
    let elapsed = currentTime - (startTime + 2000); // Time since stage 1 began
    
    // Use modulo to ensure we complete exactly one or more full rotations
    let rotationProgress = (elapsed / timeForFullRotation) % 1;
    
    // Set globe rotation based on progress (full 360° loop)
    globeRotation = recordingStartAngle + rotationProgress * 360;
    
    // Check if we've completed a full rotation and wave has finished
    if (elapsed > timeForFullRotation && !spreading) {
      recordingStage = 2;
      recordingEndTime = currentTime;
      // Ensure globe is exactly at starting position
      globeRotation = recordingStartAngle;
      console.log("Recording end angle:", globeRotation);
      resetGlobe();
      console.log("Recording stage 2: Ending with empty globe");
    }
  } 
  // Stage 2: End with empty globe for 2 more seconds
  else if (recordingStage === 2) {
    // Keep globe rotation fixed at exact starting position
    globeRotation = recordingStartAngle;
    
    if (currentTime - recordingEndTime > 2000) {
      // Stop recording once we've completed the loop
      loopRecording = false;
      stopRecording();
      
      // Reset to normal mode
      recordingStage = 0;
      globeRotation = initialRotation;
      setTimeout(() => {
        startWave();
      }, 500);
    }
  }
}

function makeSpherePoints(radius, step) {
  for (let theta = 0; theta <= 180; theta += step) {
    for (let phi = 0; phi < 360; phi += step) {
      let x = radius * sin(theta) * cos(phi);
      let y = radius * sin(theta) * sin(phi);
      let z = radius * cos(theta);
      points.push({
        pos: createVector(x, y, z),
        active: false,
        size: 2,
        glow: 100,
        waveValue: 0,
        distance: 0 // Will store distance from wave origin
      });
    }
  }
}

function connectNeighbors() {
  // Calculate threshold based on detail (step size)
  let threshold = 2.5 * globeRadius * sin(detail/2) / sin(90);
  connections = points.map(p => []);
  for (let i = 0; i < points.length; i++) {
    for (let j = i+1; j < points.length; j++) {
      if (p5.Vector.dist(points[i].pos, points[j].pos) < threshold) {
        connections[i].push(j);
        connections[j].push(i);
      }
    }
  }
  
  // Log average connections per point to help debug
  let avgConnections = connections.reduce((sum, arr) => sum + arr.length, 0) / connections.length;
  console.log("Average connections per point:", avgConnections);
}

function startWave() {
  resetGlobe();
  let startIndex = floor(random(points.length));
  waveOrigin = points[startIndex].pos.copy();
  
  // Calculate distances from origin for all points
  for (let i = 0; i < points.length; i++) {
    points[i].distance = p5.Vector.dist(points[i].pos, waveOrigin);
  }
  
  points[startIndex].active = true;
  points[startIndex].waveValue = 1;
  activeNodes = [startIndex];
  waveFront = [startIndex];
  waveTime = 0;
  spreading = true;
}

function updateWave() {
  if (!spreading) return;
  
  let currentTime = millis();
  if (currentTime - lastPropagationTime < propagationInterval) return;
  lastPropagationTime = currentTime;
  
  waveTime += waveSpeed;
  
  // Process the current wave front
  let newWaveFront = [];
  
  // For each point in the current wave front, activate its neighbors
  for (let idx of waveFront) {
    // Get all connections from this point
    for (let neighborIdx of connections[idx]) {
      let neighbor = points[neighborIdx];
      
      // If the neighbor is not active yet, activate it
      if (!neighbor.active) {
        neighbor.active = true;
        neighbor.waveValue = 1;
        newWaveFront.push(neighborIdx);
      }
    }
  }
  
  // Update the wave front for the next frame
  waveFront = newWaveFront;
  
  // Apply visual fade effect based on when each point was activated
  for (let i = 0; i < points.length; i++) {
    if (points[i].active) {
      // Gradually decrease the wave value for visual effect
      points[i].waveValue = max(0, points[i].waveValue - 0.01);
    }
  }

  // Reset when wave is complete (no more points to activate)
  if (waveFront.length === 0) {
    spreading = false;
    setTimeout(() => {
      startWave();
    }, 2000);
  }
}

function resetGlobe() {
  for (let p of points) {
    p.active = false;
    p.size = 2;
    p.glow = 100;
    p.waveValue = 0;
  }
}

function showSphere() {
  // Draw connections as faint lines
  stroke(50);
  strokeWeight(0.5);
  for (let i = 0; i < points.length; i++) {
    if (points[i].active) {
      for (let j of connections[i]) {
        if (points[j].active) {
          line(
            points[i].pos.x, points[i].pos.y, points[i].pos.z,
            points[j].pos.x, points[j].pos.y, points[j].pos.z
          );
        }
      }
    }
  }
  
  // Draw points
  for (let pt of points) {
    // Update visual properties
    if (pt.active) {
      // Make the wave front brighter
      let waveIntensity = map(abs(pt.distance - waveTime), 0, 20, 255, 120);
      waveIntensity = constrain(waveIntensity, 200, 255); // Updated to your constrain values
      pt.glow = waveIntensity;
      pt.size = map(waveIntensity, 120, 255, 2, 2); // Updated to keep size constant at 2
    } else {
      pt.glow = max(100, pt.glow - 5);
      pt.size = max(2, pt.size - 0.1);
    }
    
    push();
    translate(pt.pos.x, pt.pos.y, pt.pos.z);
    noStroke();
    fill(pt.glow);
    sphere(pt.size);
    pop();
  }
}

// Handle keyboard input for screenshots and recording
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
  a.download = 'ripple_globe.webm';
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
  a.download = 'ripple_globe_screenshot.png';
  a.click();
  document.body.removeChild(a);
  console.log("Screenshot saved");
}

function startLoopRecording() {
  console.log("Starting perfect loop recording...");
  resetGlobe();
  spreading = false;
  loopRecording = true;
  recordingStage = 0;
  startRecording();
}
