//--------------page structure (links and ids filling the main section)
document.addEventListener("DOMContentLoaded", () => {
    const sections = ["intro", "apparence", "nose", "taste"]; // Define the section IDs in the correct order
    let currentSectionIndex = 0; // Start with the first section
    const main = document.querySelector(".main");
    const links = document.querySelectorAll(".index-line a");

    // Set default visibility for icons to hidden except for sections[0] and adjust font weight
    links.forEach((link, index) => {
        const icon = link.previousElementSibling;
        const listItem = link.parentElement;

        if (index === 0) {
            icon.style.visibility = 'visible'; // Show the icon for the first section by default
            listItem.style.fontWeight = "500"; // Set the font weight for the first section to 500
        } else {
            icon.style.visibility = 'hidden'; // Hide all other icons
            listItem.style.fontWeight = "300"; // Set the font weight for other sections to 300
        }
    });

    // Function to load a section into .main with animation
    function loadSection(newSectionIndex) {
        if (newSectionIndex < 0 || newSectionIndex >= sections.length) {
            return; // Prevent index out of bounds
        }

        const sectionId = sections[newSectionIndex];
        const sectionContent = document.getElementById(sectionId).innerHTML;

        // Determine if we are moving up or down
        let direction;
        if (newSectionIndex > currentSectionIndex) {
            direction = "down";
        } else if (newSectionIndex < currentSectionIndex) {
            direction = "up";
        } else {
            return; // If we are clicking on the same section, do nothing
        }

        // Add the appropriate fade-out effect
        main.classList.remove("fade-in-up", "fade-in-down", "fade-out-up", "fade-out-down");
        main.classList.add(direction === "down" ? "fade-out-up" : "fade-out-down");

        // Wait for the fade-out to complete before loading new content
        setTimeout(() => {
            main.innerHTML = sectionContent;

            // Update the cursor style if the `apparence` section is loaded
            if (newSectionIndex === 1) {
                document.body.style.cursor = "url('tfwc/assets/cursors/wine-tasting-apparence.png'), auto";
            } else {
                document.body.style.cursor = "default"; // Reset to default for other sections
            }

            // Add the appropriate fade-in effect
            main.classList.remove("fade-out-up", "fade-out-down");
            main.classList.add(direction === "down" ? "fade-in-up" : "fade-in-down");

            // Update the current section index
            currentSectionIndex = newSectionIndex;

            // Update active icon visibility, link styles, and font weight
            links.forEach((link, index) => {
                const icon = link.previousElementSibling;
                const listItem = link.parentElement;

                if (index === currentSectionIndex) {
                    icon.style.visibility = 'visible'; // Show active icon for the current section
                    link.style.textDecoration = "none";
                    link.style.opacity = "1"; // Normal style for current section
                    listItem.style.fontWeight = "500"; // Set font weight for the current section
                } else {
                    icon.style.visibility = 'hidden'; // Hide other icons
                    if (index < currentSectionIndex) {
                        link.style.textDecoration = "line-through";
                        link.style.opacity = "0.5"; // Lower opacity for previous sections
                    } else {
                        link.style.textDecoration = "none";
                        link.style.opacity = "1"; // Reset styles for upcoming sections
                    }
                    listItem.style.fontWeight = "300"; // Set lighter font weight for inactive sections
                }
            });

            // Re-attach event listeners to the new content
            addPaintSwatchListeners();
        }, 500); // Set to the duration of your fade-out animation
    }

    // Event listener for list items
    links.forEach((link, index) => {
        link.addEventListener("click", (event) => {
            event.preventDefault();
            loadSection(index);
        });
    });

    // Event listener for the #next button
    document.querySelector("#next").addEventListener("click", (event) => {
        event.preventDefault();
        const nextSectionIndex = (currentSectionIndex + 1) % sections.length; // Cycle to the next section
        loadSection(nextSectionIndex);
    });

    // Event listener for the #prev button
    document.querySelector("#prev").addEventListener("click", (event) => {
        event.preventDefault();
        const prevSectionIndex = (currentSectionIndex - 1 + sections.length) % sections.length; // Cycle to the previous section
        loadSection(prevSectionIndex);
    });

    // Initial load
    loadSection(currentSectionIndex);

    // Function to add event listeners to the paint swatches
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

    // Attach event listeners to the paint swatches initially
    addPaintSwatchListeners();
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
