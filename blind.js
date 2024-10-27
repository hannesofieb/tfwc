//--------------page structure (links and ids filling the main section)
document.addEventListener("DOMContentLoaded", () => {
    const sections = {
        intro: "#intro",
        apparence: "#apparence",
        nose: "#nose",
        taste: "#taste",
        tasteFlav: "#tasteFlav",
        tasteTexture: "#tasteTexture"
    };

    let currentSection = "intro";
    const main = document.querySelector(".main");
    const links = document.querySelectorAll(".index-line a");

    // Function to load a section into .main with animation
    function loadSection(sectionKey) {
        if (!sections[sectionKey]) {
            return; // Prevent loading if the section is not defined
        }
    
        const sectionId = sections[sectionKey];
        const sectionContent = document.querySelector(sectionId).innerHTML;
    
        // Determine if we are moving up or down
        let direction = Object.keys(sections).indexOf(sectionKey) > Object.keys(sections).indexOf(currentSection)
            ? "down"
            : "up";
    
        // Add fade-out effect
        main.classList.remove("fade-in-up", "fade-in-down", "fade-out-up", "fade-out-down");
        main.classList.add(direction === "down" ? "fade-out-up" : "fade-out-down");
    
        setTimeout(() => {
            // Update section content
            main.innerHTML = sectionContent;
    
            // Add flex styles only when loading the #intro section
            if (sectionKey === "intro") {
                main.style.display = "flex";
                main.style.flexDirection = "column";
                loadWinesForCarousel(); // Load wines for the carousel in #intro section
            } else {
                // Reset styles for other sections
                main.style.display = "";
                main.style.flexDirection = "";
            }
    
            // If we're loading the "nose" section, add flavour images
            if (sectionKey === "nose") {
                loadFlavourImages(); // Load flavour images for the "nose" section
            }
    
            // Add fade-in effect
            main.classList.remove("fade-out-up", "fade-out-down");
            main.classList.add(direction === "down" ? "fade-in-up" : "fade-in-down");
    
            currentSection = sectionKey;
    
            // Update the GIF in #gif-instruction based on the current section
            const gifInstruction = document.querySelector("#gif-instruction");
            if (gifs[sectionKey]) {
                gifInstruction.src = gifs[sectionKey];
                gifInstruction.style.display = "block"; // Make sure the GIF is visible
            } else {
                gifInstruction.style.display = "none"; // Hide if no GIF is defined for the section
            }
    
            // Update the visibility and styling of the icons and links
            links.forEach((link) => {
                const linkHref = link.getAttribute("href").substring(1);
                const icon = link.previousElementSibling;
                const listItem = link.parentElement;
    
                if (linkHref === currentSection) {
                    icon.style.visibility = "visible";
                    link.style.textDecoration = "none";
                    link.style.opacity = "1";
                    listItem.style.fontWeight = "500";
                } else {
                    icon.style.visibility = "hidden";
                    link.style.textDecoration =
                        Object.keys(sections).indexOf(linkHref) < Object.keys(sections).indexOf(currentSection)
                            ? "line-through"
                            : "none";
                    link.style.opacity = Object.keys(sections).indexOf(linkHref) < Object.keys(sections).indexOf(currentSection)
                        ? "0.5"
                        : "1";
                    listItem.style.fontWeight = "300";
                }
            });
    
            addPaintSwatchListeners(); // Re-attach event listeners
            makeDraggable(); // Make draggable elements draggable again
            addFlavourImageListeners(); // Re-attach flavour image listeners
        }, 500);
    }

    // Function to load wines for the carousel in #intro section
    function loadWinesForCarousel() {
        Papa.parse("blindwines.csv", {
            download: true,
            header: true,
            complete: function (results) {
                const wineCarousel = document.querySelector(".wine-carousel");
                wineCarousel.style.display = "flex";
                wineCarousel.style.flexDirection = "row";
                wineCarousel.style.gap = "20px";

                // Track the current selected wine card and attributes
                let currentSelectedCard = null;
                let selectedWineAttributes = {};

                // Iterate through each wine and create a card for all images from CSV
                results.data.forEach(wine => {
                    // Create wine card container
                    const wineCard = document.createElement("div");
                    wineCard.classList.add("wine-card");
                    wineCard.style.display = "flex";
                    wineCard.style.flexDirection = "column";

                    // Create image element for the wine
                    const imgElement = document.createElement("img");
                    imgElement.src = wine.front; // Use the image URL from CSV
                    imgElement.alt = wine.title || "Wine Image";
                    imgElement.classList.add("wine");

                    // Create selected mark element
                    const selectedMark = document.createElement("hr");
                    selectedMark.classList.add("selected-mark");
                    selectedMark.style.visibility = "hidden"; // Hidden by default

                    // Add click event to wine card
                    wineCard.addEventListener("click", () => {
                        // Deselect previous card if any
                        if (currentSelectedCard && currentSelectedCard !== wineCard) {
                            const prevSelectedMark = currentSelectedCard.querySelector(".selected-mark");
                            currentSelectedCard.classList.remove("selected");
                            if (prevSelectedMark) {
                                prevSelectedMark.style.visibility = "hidden";
                            }
                        }

                        // Select the new wine card
                        if (currentSelectedCard !== wineCard) {
                            wineCard.classList.add("selected");
                            selectedMark.style.visibility = "visible";
                            currentSelectedCard = wineCard;

                            // Update selected wine attributes
                            selectedWineAttributes = {
                                body: wine.body,
                                sweetness: wine.sweetness,
                                tannin: wine.tannin,
                                acidity: wine.acidity,
                            };
                        } else {
                            // Deselect if clicking the already selected card
                            wineCard.classList.remove("selected");
                            selectedMark.style.visibility = "hidden";
                            currentSelectedCard = null;
                            selectedWineAttributes = {};
                        }

                        console.log(selectedWineAttributes); // Debugging: Log selected attributes
                    });

                    // Append elements to wine card
                    wineCard.appendChild(imgElement);
                    wineCard.appendChild(selectedMark);

                    // Append wine card to wine carousel
                    wineCarousel.appendChild(wineCard);
                });
            },
            error: function (error) {
                console.error("Error loading CSV:", error);
            }
        });
    }

    // Load the first section initially without any animations
    loadSection(currentSection);

    // Event listeners for list items and buttons
    links.forEach((link) => {
        link.addEventListener("click", (event) => {
            event.preventDefault();
            const sectionKey = link.getAttribute("href").substring(1);
            loadSection(sectionKey);
        });
    });

    // Event listeners for next and previous buttons
    document.querySelector("#next").addEventListener("click", (event) => {
        event.preventDefault();
        const sectionKeys = Object.keys(sections);
        const currentIndex = sectionKeys.indexOf(currentSection);
        let nextIndex = (currentIndex + 1) % sectionKeys.length;

        // Ensure correct navigation through subsections
        if (sectionKeys[currentIndex] === "taste" && currentIndex + 1 < sectionKeys.length) {
            nextIndex = currentIndex + 1;
        }

        loadSection(sectionKeys[nextIndex]);
    });

    document.querySelector("#prev").addEventListener("click", (event) => {
        event.preventDefault();
        const sectionKeys = Object.keys(sections);
        const currentIndex = sectionKeys.indexOf(currentSection);
        let prevIndex = (currentIndex - 1 + sectionKeys.length) % sectionKeys.length;

        // Ensure correct navigation through subsections
        if (sectionKeys[currentIndex] === "tasteFlav" && currentIndex - 1 >= 0) {
            prevIndex = currentIndex - 1;
        }

        loadSection(sectionKeys[prevIndex]);
    });

    addPaintSwatchListeners(); // Initial attachment
    makeDraggable(); // Make draggable elements draggable initially
    addFlavourImageListeners(); // Make flavour images clickable initially
    addHoverListeners(); // Add hover listeners for swapping alt text
});

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

// Function to add event listeners to the paint swatches
function addFlavourImageListeners() {
    const flavourImages = document.querySelectorAll(".flavour-image");

    if (flavourImages.length === 0) {
        console.error("No flavour images found to attach listeners to");
        return;
    }

    // Initialize an array to keep track of the unique flavours
    let flavourArray = [];

    flavourImages.forEach(image => {
        console.log(`Attaching click listener to image with alt: ${image.alt}`);
        image.addEventListener("click", () => {
            // Extract the alt text from the clicked image and split into words
            const flavours = image.alt.trim().split(" ");

            // Iterate over each word from the alt text
            flavours.forEach(flavour => {
                flavour = flavour.trim().toLowerCase(); // Remove extra spaces and standardize to lowercase for consistency

                // Check if the flavour already exists in the array
                if (flavourArray.includes(flavour)) {
                    // If it exists, remove it (pop it out)
                    flavourArray = flavourArray.filter(item => item !== flavour);
                } else {
                    // If it doesn't exist and there's space, add it
                    if (flavourArray.length < 10) {
                        flavourArray.push(flavour);
                    }
                }
            });

            // Update the smells div to reflect the current array
            const smellsDiv = document.querySelector(".smells p");
            smellsDiv.textContent = `nose: ${flavourArray.join(", ")}`;

            console.log("Updated flavours:", flavourArray);
        });
    });
}



// Function to make elements draggable
function makeDraggable() {
    // Get all elements with the class name "flavour-image" or "draggable"
    const draggableElements = document.querySelectorAll(".flavour-image, .draggable");

    draggableElements.forEach(elmnt => {
        dragElement(elmnt);
    });

    function dragElement(elmnt) {
        let initialMouseX = 0, initialMouseY = 0, initialElementX = 0, initialElementY = 0;
        let isDragging = false;

        // Start dragging on mouse down
        elmnt.onmousedown = dragMouseDown;

        function dragMouseDown(e) {
            e = e || window.event;
            e.preventDefault();

            // Store the initial mouse position and element position
            initialMouseX = e.clientX;
            initialMouseY = e.clientY;
            initialElementX = elmnt.offsetLeft;
            initialElementY = elmnt.offsetTop;

            // Set listeners for mouse move and mouse up
            document.onmouseup = closeDragElement;
            document.onmousemove = elementDrag;

            // Pause any animations while dragging
            elmnt.style.animationPlayState = "paused";
            document.body.style.cursor = "grabbing";

            // Reset isDragging to false initially
            isDragging = false;
        }

        function elementDrag(e) {
            e = e || window.event;
            e.preventDefault();

            // Calculate the new position of the element based on the mouse movement
            let deltaX = e.clientX - initialMouseX;
            let deltaY = e.clientY - initialMouseY;

            // If there is a significant movement, set isDragging to true
            if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
                isDragging = true;
            }

            // Set the element's new position to match the mouse movement
            elmnt.style.left = initialElementX + deltaX + "px";
            elmnt.style.top = initialElementY + deltaY + "px";
        }

        function closeDragElement() {
            // Stop moving when mouse button is released
            document.onmouseup = null;
            document.onmousemove = null;

            // Resume any animations after dragging
            elmnt.style.animationPlayState = "running";
            document.body.style.cursor = "default";

            // If it wasn't a drag, we consider it a click
            if (!isDragging) {
                // Call a click event handler if needed
                elmnt.click();
            }
        }
    }
}

// load and retrieve image info for flavours
function loadFlavourImages() {
    const flavourContainer = document.createElement("div");
    flavourContainer.classList.add("flavour-container");

    Papa.parse("blind.csv", {
        download: true,
        header: true,
        complete: function (results) {
            const shuffledData = results.data.sort(() => 0.5 - Math.random());
            const randomFlavours = shuffledData.slice(0, 30);

            randomFlavours.forEach((item) => {
                if (item.flavour && item.sub && item.img) {
                    const imgElement = document.createElement("img");
                    imgElement.className = `flavour-image blind ${item.flavour} ${item.sub}`;
                    imgElement.src = item.img;

                    // Set alt text to include both flavour and sub
                    imgElement.alt = `${item.flavour} ${item.sub}`;

                    // Set initial position
                    imgElement.style.position = "absolute";
                    imgElement.style.top = `${Math.random() * 80}%`;
                    imgElement.style.left = `${Math.random() * 80}%`;

                    // Assign a random movement pattern with varied duration
                    const movementPatterns = [
                        { name: "float-clockwise", duration: "15s" },
                        { name: "float-anticlockwise", duration: "18s" },
                        { name: "float-zigzag", duration: "20s" },
                    ];
                    const randomPattern = movementPatterns[Math.floor(Math.random() * movementPatterns.length)];
                    imgElement.style.animation = `${randomPattern.name} ${randomPattern.duration} ease-in-out infinite`;

                    flavourContainer.appendChild(imgElement);
                }
            });

            const main = document.querySelector(".main");
            main.appendChild(flavourContainer); // Append flavour container to the main section

            // Make the new images draggable
            makeDraggable();

            // Add event listeners to flavour images after they are appended
            addFlavourImageListeners();
        },
        error: function (error) {
            console.error("Error loading CSV:", error);
        },
    });
}



// Function to add hover event listeners to the parent sections
function addHoverListeners() {
    // Selecting all sections inside #tasteTexture's range-container
    const parentSections = document.querySelectorAll("#tasteTexture .range-container > section");

    parentSections.forEach((section) => {
        // Adding mouseenter event
        section.addEventListener("mouseenter", () => {
            console.log("Hover over:", section.id); // Check if the event is firing and which section is being hovered

            const mainP = section.querySelector("p:not(.alt)"); // Regular paragraph
            const altP = section.querySelector("p.alt");        // Alternate paragraph

            if (mainP && altP) {
                mainP.style.display = "none";  // Hide regular paragraph
                altP.style.display = "block";  // Show alternate paragraph
            }
        });

        // Adding mouseleave event
        section.addEventListener("mouseleave", () => {
            console.log("Mouse leave:", section.id); // Check if the event is firing and which section the mouse left

            const mainP = section.querySelector("p:not(.alt)");
            const altP = section.querySelector("p.alt");

            if (mainP && altP) {
                mainP.style.display = "block"; // Show regular paragraph
                altP.style.display = "none";   // Hide alternate paragraph
            }
        });
    });
}


//--------------paint-wall colors
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

//---------------gif array
const gifs = {
    intro: "https://media.tenor.com/U330eSUYomcAAAAM/wine-genie%C3%9Fer.gif",
    apparence: "https://media1.tenor.com/m/q85ldKgtGpkAAAAC/swirl-wine.gif",
    nose: "https://media4.giphy.com/media/2zco8yS1r8Rhx2cxcf/200w.gif",
    taste: "https://media1.tenor.com/m/gwSt5vdhFQIAAAAd/the-office-michael-scott.gif",
    tasteFlav: "https://media1.tenor.com/m/gwSt5vdhFQIAAAAd/the-office-michael-scott.gif",  // replace with actual URL
    tasteTexture: "https://media1.tenor.com/m/COAVJha-9yYAAAAd/drinking-wine-david-rose.gif"  // replace with actual URL
};
