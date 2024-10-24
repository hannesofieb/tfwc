document.addEventListener('DOMContentLoaded', () => {
    // Load the CSV file
    Papa.parse('goon.csv', {
        download: true,
        header: true,
        complete: function (results) {
            // Extract the data from the CSV
            let goonData = results.data;

            // Remove any empty rows from the parsed data
            goonData = goonData.filter(row => row.img && row.name && row.link && row.price);

            // Function to shuffle the goonData array
            function shuffle(array) {
                for (let i = array.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [array[i], array[j]] = [array[j], array[i]];
                }
            }

            // Duplicate the items in the goonData array to reach around 400 items
            const targetCount = 629;
            while (goonData.length < targetCount) {
                goonData = goonData.concat(goonData.slice(0, targetCount - goonData.length));
            }

            // Shuffle the goonData array after duplication
            shuffle(goonData);

            // Select the container for goon cards
            const goonsContainer = document.querySelector('.goons-container');

            // Ensure the container exists before appending
            if (goonsContainer) {
                // Create cards and append to the container
                goonData.forEach(goon => {
                    const goonCard = document.createElement('div');
                    goonCard.classList.add('goon-card');

                    // Create an image element
                    const goonImage = document.createElement('img');
                    goonImage.src = goon.img;
                    goonImage.alt = goon.name;
                    goonImage.classList.add('goon-image');

                    // Add click event to redirect to the link
                    goonCard.addEventListener('click', () => {
                        window.open(goon.link, '_blank');
                    });

                    // Append the image to the card
                    goonCard.appendChild(goonImage);

                    // Append the card to the container
                    goonsContainer.appendChild(goonCard);
                });
            } else {
                console.error('Could not find .goons-container element in the DOM.');
            }
        }
    });
});
  



  //--------------------------------------------------------------- rotating goon
  let vertexShader = `
uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

attribute vec3 aPosition;
attribute vec2 aTexCoord;
varying vec2 vTexCoord;

void main() {
  vTexCoord = aTexCoord;
  vec4 positionVec4 = vec4(aPosition, 1.0);
  gl_Position = uProjectionMatrix * uModelViewMatrix * positionVec4;
}`;

let fragmentShader = `
precision highp float;
varying vec2 vTexCoord;
uniform sampler2D img;

void main() {
  vec4 color = texture2D(img, vTexCoord);
  gl_FragColor = color;
}`;

let layer;
let simpleShader;
let images = []; // Array to store images

function preload() {
  // Load images for each face of the cube
  images[0] = loadImage('assets/goon/god/Artboard-1.png'); // For front and back
  images[1] = loadImage('assets/goon/god/Artboard-2.png'); // For left and right sides
  images[2] = loadImage('assets/goon/god/Artboard-6.png'); // For top and bottom
}

function setup() {
  // Create the canvas and attach it to the #sketch-container
  let canvas = createCanvas(windowWidth/2.5, windowHeight/1.5, WEBGL);
  canvas.parent('sketch-container'); // Attach the canvas to the #sketch-container

  angleMode(DEGREES);
  noStroke();

  // Create framebuffer and shader objects
  layer = createFramebuffer();
  simpleShader = createShader(vertexShader, fragmentShader);

  clear(); // Set initial clear to create a transparent background
}

let rotationSpeed = 0.3; // You can adjust this value to control the speed

function draw() {
  clear(); // Clear the canvas at the beginning of each frame to maintain transparency

  // Start drawing to framebuffer
  layer.begin();
  clear(); // Clear the layer framebuffer to maintain transparency

  ambientLight(100);
  directionalLight(255, 255, 255, -1, 1, -1);

  // Rotate based on the defined speed
  push();
  rotateY(frameCount * rotationSpeed); // Adjust rotation speed using the variable

  // Draw each face of the cube manually and apply corresponding image as texture
// Dimensions for front and back
let frontBackWidth = 318;
let frontBackHeight = 383;
let sideWidth = 206; // Depth of the cube (same as translation distance)
let sideHeight = frontBackHeight;

// Front face
push();
translate(0, 0, sideWidth / 2); // Move forward by half the depth
texture(images[0]); // Apply front and back image
plane(frontBackWidth, frontBackHeight);
pop();

// Back face
push();
translate(0, 0, -sideWidth / 2); // Move backward by half the depth
rotateY(180);
texture(images[0]); // Apply front and back image
plane(frontBackWidth, frontBackHeight);
pop();

// Left side face
push();
translate(-frontBackWidth / 2, 0, 0); // Move left by half the width
rotateY(-90);
texture(images[1]); // Apply left side image
plane(sideWidth, sideHeight);
pop();

// Right side face
push();
translate(frontBackWidth / 2, 0, 0); // Move right by half the width
rotateY(90);
texture(images[1]); // Apply right side image
plane(sideWidth, sideHeight);
pop();

// Top face
push();
translate(0, -frontBackHeight / 2, 0); // Move up by half the height
rotateX(90);
texture(images[2]); // Apply top image
plane(frontBackWidth, sideWidth);
pop();

// Bottom face
push();
translate(0, frontBackHeight / 2, 0); // Move down by half the height
rotateX(-90);
texture(images[2]); // Apply bottom image
plane(frontBackWidth, sideWidth);
pop();

  pop();

  // Stop drawing to framebuffer
  layer.end();

  // Pass color information from the framebuffer to the shader's uniforms
  simpleShader.setUniform('img', layer.color);

  // Render the scene captured by framebuffer without blur
  shader(simpleShader);
  plane(width, height);
}
