document.addEventListener('DOMContentLoaded', () => {
    // Load the CSV file
    Papa.parse('goon.csv', {
      download: true,
      header: true,
      complete: function(results) {
        // Extract the data from the CSV
        let goonData = results.data;
  
        // Remove any empty rows from the parsed data
        goonData = goonData.filter(row => row.img && row.name && row.link && row.price);
  
        // Shuffle the goonData array
        function shuffle(array) {
          for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
          }
        }
        shuffle(goonData); // Shuffle the goonData array
  
        // Select the container for goon cards
        const goonsContainer = document.querySelector('.goons-container');
  
        // Ensure the container exists before appending
        if (goonsContainer) {
          // Create a card for each goon
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
// texcoords only come from p5 to vertex shader
// so pass texcoords on to the fragment shader in a varying variable
attribute vec2 aTexCoord;
varying vec2 vTexCoord;

void main() {
  // transferring texcoords for the frag shader
  vTexCoord = aTexCoord;

  // copy position with a fourth coordinate for projection (1.0 is normal)
  vec4 positionVec4 = vec4(aPosition, 1.0);

  gl_Position = uProjectionMatrix * uModelViewMatrix * positionVec4;
}`;

// Updated Fragment shader without blur effect
let fragmentShader = `
precision highp float;
varying vec2 vTexCoord;
uniform sampler2D img;

void main() {
  // Just sample the color directly from the image texture
  vec4 color = texture2D(img, vTexCoord);
  gl_FragColor = color;
}`;

let layer;
let simpleShader;

function setup() {
    // Create the canvas and attach it to the #sketch-container
    let canvas = createCanvas(windowWidth, windowHeight, WEBGL);
    canvas.parent('sketch-container'); // Attach the canvas to the #sketch-container
  
    angleMode(DEGREES);
    noStroke();
  
    // Create framebuffer and shader objects
    layer = createFramebuffer();
    simpleShader = createShader(vertexShader, fragmentShader);
  
    // Make the canvas background transparent
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
    ambientMaterial(255, 0, 0);
    fill(255, 255, 100);
    specularMaterial(255);
    shininess(150);
  
    // Rotate based on the defined speed
    push();
    rotateY(frameCount * rotationSpeed); // Adjust rotation speed using the variable
    box(300, 500, 300); // Draw a rectangular prism
    pop();
  
    // Stop drawing to framebuffer
    layer.end();
  
    // Pass color information from the framebuffer to the shader's uniforms
    simpleShader.setUniform('img', layer.color);
  
    // Render the scene captured by framebuffer without blur
    shader(simpleShader);
    plane(width, height);
  }
  