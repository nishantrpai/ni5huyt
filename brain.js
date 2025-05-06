let nodes = [];
let connections = [];

function setup() {
  createCanvas(800, 600, WEBGL);
  noiseDetail(4, 0.5);
  let lobes = [-1, 1];

  for (let i = 0; i < 1000; i++) {
    let lobe = random(lobes);
    let angle = random(TWO_PI);
    let lat = random(-PI / 2, PI / 2);
    let baseR = 130;
    let r = baseR + noise(i * 0.1, lat * 3) * 50;

    let x = lobe * 60 + r * cos(lat) * cos(angle);
    let y = r * sin(lat);
    let z = r * cos(lat) * sin(angle);

    // sculpt with 3D Perlin field
    let nx = map(x, -200, 200, 0, 3);
    let ny = map(y, -200, 200, 0, 3);
    let nz = map(z, -200, 200, 0, 3);
    let field = noise(nx, ny, nz);

    if (field > 0.45) { // keep only points inside folds
      nodes.push(createVector(x, y, z));
    }
  }

  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      let d = p5.Vector.dist(nodes[i], nodes[j]);
      if (d < 60 && random() < 0.08) {
        connections.push(new Connection(i, j));
      }
    }
  }
}

function draw() {
  background(10);
  rotateY(millis() * 0.0005);
  ambientLight(100);

  for (let p of nodes) {
    push();
    translate(p.x, p.y, p.z);
    noStroke();
    fill(200);
    sphere(2);
    pop();
  }

  for (let conn of connections) {
    conn.update();
    conn.display();
  }
}

class Connection {
  constructor(i, j) {
    this.i = i;
    this.j = j;
    this.weight = random(0.3, 1);
    this.decay = random(0.001, 0.005);
  }

  update() {
    this.weight -= this.decay;
    if (this.weight < 0.1 && random() < 0.01) {
      this.weight = random(0.4, 1);
    }
  }

  display() {
    if (this.weight > 0.05) {
      let a = nodes[this.i];
      let b = nodes[this.j];
      stroke(lerp(50, 255, this.weight));
      strokeWeight(this.weight);
      line(a.x, a.y, a.z, b.x, b.y, b.z);
    }
  }
}
