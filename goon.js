let vertexShader = `
  // Vertex Shader Code Here
`;

let fragmentShader = `
  // Fragment Shader Code Here
`;

let layer;
let blur;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  angleMode(DEGREES);
  noStroke();

  // Create framebuffer and shader objects
  layer = createFramebuffer();
  blur = createShader(vertexShader, fragmentShader);

  describe(
    'A single rectangle rotating in front of the camera. The closest and farthest parts of the rectangle from the camera appear blurred.'
  );
}

function draw() {
  // Start drawing to framebuffer
  layer.begin();
  background(255);
  ambientLight(100);
  directionalLight(255, 255, 255, -1, 1, -1);
  ambientMaterial(255, 0, 0);
  fill(255, 255, 100);
  specularMaterial(255);
  shininess(150);

  // Rotate 1° per frame
  rotateY(frameCount);

  // Draw a single rectangle in the center of the canvas
  push();
  translate(0, 0, 0);
  box(200, 100, 10); // A 3D rectangle (width: 200, height: 100, depth: 10)
  pop();

  // Stop drawing to framebuffer
  layer.end();

  // Pass color and depth information from the framebuffer
  // to the shader's uniforms
  blur.setUniform('img', layer.color);
  blur.setUniform('depth', layer.depth);

  // Render the scene captured by framebuffer with depth of field blur
  shader(blur);
  plane(width, height);
}
