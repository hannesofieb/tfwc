//--------------page structure (links and ids filling the main section)
document.addEventListener("DOMContentLoaded", () => {
    const sections = ["intro", "apparence", "nose", "taste"];
    let currentSectionIndex = 0;
    const main = document.querySelector(".main");
    const links = document.querySelectorAll(".index-line a");
    const flavourContainer = document.querySelector(".flavour-container");

    // Function to load a section into .main with animation
    function loadSection(newSectionIndex) {
        if (newSectionIndex < 0 || newSectionIndex >= sections.length) {
            return; // Prevent index out of bounds
        }

        const sectionId = sections[newSectionIndex];
        const sectionContent = document.getElementById(sectionId).innerHTML;

        // Determine if we are moving up or down
        let direction = newSectionIndex > currentSectionIndex ? "down" : "up";

        // Add fade-out effect
        main.classList.remove("fade-in-up", "fade-in-down", "fade-out-up", "fade-out-down");
        main.classList.add(direction === "down" ? "fade-out-up" : "fade-out-down");

        setTimeout(() => {
            // Update section content
            main.innerHTML = sectionContent;

            // If we're loading the "nose" section, add flavour images
            if (newSectionIndex === 2) {
                loadFlavourImages(); // Load flavour images for nose section
            }

            // Add fade-in effect
            main.classList.remove("fade-out-up", "fade-out-down");
            main.classList.add(direction === "down" ? "fade-in-up" : "fade-in-down");

            currentSectionIndex = newSectionIndex;

            // Update the visibility and styling of the icons and links
            links.forEach((link, index) => {
                const icon = link.previousElementSibling;
                const listItem = link.parentElement;

                if (index === currentSectionIndex) {
                    icon.style.visibility = 'visible';
                    link.style.textDecoration = "none";
                    link.style.opacity = "1";
                    listItem.style.fontWeight = "500";
                } else {
                    icon.style.visibility = 'hidden';
                    link.style.textDecoration = index < currentSectionIndex ? "line-through" : "none";
                    link.style.opacity = index < currentSectionIndex ? "0.5" : "1";
                    listItem.style.fontWeight = "300";
                }
            });

            addPaintSwatchListeners(); // Re-attach event listeners
        }, 500);
    }

// Function to load flavour images into the nose section
function loadFlavourImages() {
    Papa.parse('blind.csv', {
        download: true,
        header: true,
        complete: function (results) {
            const shuffledData = results.data.sort(() => 0.5 - Math.random());
            const initialFlavours = shuffledData.slice(0, 30); // Limit to 30 random entries for the initial display
            let remainingFlavours = shuffledData.slice(30); // Keep the rest for replacement

            const placedImages = []; // Track placed images' positions to avoid overlap

            initialFlavours.forEach(item => {
                if (item.flavour && item.sub && item.img) {
                    const imgElement = createFlavourImageElement(item, placedImages);
                    flavourContainer.appendChild(imgElement);
                }
            });

            // Append the container with all the images to the main section
            const main = document.querySelector(".main");
            if (!main.contains(flavourContainer)) {
                main.appendChild(flavourContainer);
            }

            // Function to continuously check image positions and reset when needed
            function monitorImagePositions() {
                const flavourImages = document.querySelectorAll('.flavour-container img.flavour-image');

                flavourImages.forEach(image => {
                    // Calculate image's current position relative to the viewport
                    const rect = image.getBoundingClientRect();

                    // If the image is fully out of view at the top, replace its content and reset position
                    if (rect.bottom < 0) {
                        if (remainingFlavours.length > 0) {
                            // Get a new flavour from the remaining ones
                            const newItem = remainingFlavours.shift(); // Get a new flavour
                            const newImgElement = createFlavourImageElement(newItem, placedImages);

                            // Replace the old image with the new one
                            flavourContainer.replaceChild(newImgElement, image);

                            // Push the old item to remainingFlavours if we want it to cycle back later
                            initialFlavours.push(newItem);
                        } else {
                            // If no more remaining flavours, just reset the image
                            resetImagePosition(image);
                        }
                    }
                });

                // Keep checking every animation frame
                requestAnimationFrame(monitorImagePositions);
            }

            // Start monitoring positions
            monitorImagePositions();
        },
        error: function (error) {
            console.error('Error loading CSV:', error);
        }
    });

    // Function to create an image element for a flavour item
    function createFlavourImageElement(item, placedImages) {
        const imgElement = document.createElement("img");
        imgElement.className = `blind ${item.flavour} ${item.sub} flavour-image`;
        imgElement.src = item.img;
        imgElement.title = `${item.flavour}, ${item.sub}`;

        // Try to find a position that doesn't overlap with existing images
        let positionFound = false;
        let top, left;

        while (!positionFound) {
            // Ensure top and left values stay within 0-100vh, considering image size to keep them fully visible
            top = Math.random() * (90); // Set a maximum value to avoid the bottom overflow, assuming max 10% height
            left = Math.random() * (90); // Set a maximum value to avoid the right overflow, assuming max 10% width

            // Check for overlaps with already placed images
            positionFound = !placedImages.some(image => isOverlapping(image, top, left));
        }

        imgElement.style.top = `${top}%`;
        imgElement.style.left = `${left}%`;

        // Record the image's position
        placedImages.push({ top, left, width: 10, height: 10 }); // Assuming 10% width and height

        // Add click functionality to update .smells container
        imgElement.addEventListener("click", () => {
            const smellsContainer = document.querySelector(".tasting-notes .smells p");
            const currentSmells = smellsContainer.textContent.split(", ").map(f => f.trim()).filter(f => f !== "nose:");
            const newSmell = `${item.flavour}, ${item.sub}`;

            // Add new flavour if it's not a duplicate
            if (!currentSmells.includes(newSmell) && currentSmells.length < 10) {
                currentSmells.push(newSmell);
                smellsContainer.textContent = `nose: ${currentSmells.join(", ")}`;
            }
        });

        return imgElement;
    }

    // Function to check if the new image position overlaps with any already placed images
    function isOverlapping(image, newTop, newLeft) {
        const buffer = 2; // Add some buffer to prevent images from touching

        return (
            newTop < image.top + image.height + buffer &&
            newTop + 10 > image.top - buffer &&
            newLeft < image.left + image.width + buffer &&
            newLeft + 10 > image.left - buffer
        );
    }

    // Function to reset each image once it moves out of view
    function resetImagePosition(image) {
        // Remove animation and reset to a position above the viewport
        image.style.animation = 'none'; // Stop the current animation
        image.style.transform = 'translateY(-20vh)'; // Move it to -20vh above the viewport

        // Trigger reflow to apply new styles (restart the animation)
        image.offsetHeight; // Accessing offsetHeight forces a reflow, needed to restart the animation

        // Reapply animation to move upwards again
        image.style.animation = 'move-upwards 30s linear infinite';
    }
}



// Start monitoring positions
document.addEventListener("DOMContentLoaded", () => {
    monitorImagePositions();
});


    // Load the first section initially without any animations
    loadSection(currentSectionIndex);

    // Event listeners for list items and buttons
    links.forEach((link, index) => {
        link.addEventListener("click", (event) => {
            event.preventDefault();
            loadSection(index);
        });
    });

    document.querySelector("#next").addEventListener("click", (event) => {
        event.preventDefault();
        const nextSectionIndex = (currentSectionIndex + 1) % sections.length;
        loadSection(nextSectionIndex);
    });

    document.querySelector("#prev").addEventListener("click", (event) => {
        event.preventDefault();
        const prevSectionIndex = (currentSectionIndex - 1 + sections.length) % sections.length;
        loadSection(prevSectionIndex);
    });

    // Paint Swatch Listeners
    function addPaintSwatchListeners() {
        const paintSwatches = document.querySelectorAll(".paint-swatch");
        paintSwatches.forEach(swatch => {
            swatch.addEventListener("click", () => {
                const label = swatch.querySelector(".label").textContent;
                const looksDiv = document.querySelector(".looks p");
                looksDiv.textContent = `apparence: ${label}`;
            });
        });
    }

    addPaintSwatchListeners(); // Initial attachment
});


//--------------paint-wall
document.addEventListener("DOMContentLoaded", () => {
    // Select all elements with the class 'colour'
    const colorElements = document.querySelectorAll(".colour");

    // Loop through each element
    colorElements.forEach(element => {
        // Get the color code from the element's id attribute
        const colorCode = `#${element.id}`;

        // Apply the background color to the element
        element.style.backgroundColor = colorCode;
    });
});
