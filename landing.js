const scrollContainer = document.querySelector('.scroll-container');
let scrollSpeed = 1; // Adjust speed of the scrolling if needed
let isScrolling = false;

// Function to start scrolling
function scroll(stepX, stepY) {
    if (isScrolling) {
        scrollContainer.scrollLeft += stepX;
        scrollContainer.scrollTop += stepY;
        requestAnimationFrame(() => scroll(stepX, stepY));
    }
}

// Event Listener for Mouse Movement
document.addEventListener('mousemove', (e) => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Calculate whether the mouse is in the auto-scroll zones
    const mouseX = e.clientX;
    const mouseY = e.clientY;

    isScrolling = false;

    if (mouseX < viewportWidth * 0.1) {
        // Mouse is in the left 10% of the screen
        isScrolling = true;
        scroll(-scrollSpeed, 0); // Scroll left
    } else if (mouseX > viewportWidth * 0.9) {
        // Mouse is in the right 10% of the screen
        isScrolling = true;
        scroll(scrollSpeed, 0); // Scroll right
    }

    if (mouseY < viewportHeight * 0.1) {
        // Mouse is in the top 10% of the screen
        isScrolling = true;
        scroll(0, -scrollSpeed); // Scroll up
    } else if (mouseY > viewportHeight * 0.9) {
        // Mouse is in the bottom 10% of the screen
        isScrolling = true;
        scroll(0, scrollSpeed); // Scroll down
    }
});

// Stop scrolling when mouse leaves the edge zones
document.addEventListener('mouseleave', () => {
    isScrolling = false;
});
