// Load the CSV data for flavours
let blindData = []; // Store parsed CSV data here for later use
function loadBlindData() {
    Papa.parse("blind.csv", {
        download: true,
        header: true,
        complete: function(results) {
            blindData = results.data; // Store the data for later usage
        },
        error: function(error) {
            console.error("Error loading blind.csv:", error);
        }
    });
}

//--------------page structure (links and ids filling the main section)
document.addEventListener("DOMContentLoaded", () => {
    loadBlindData(); // Load CSV data initially

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
        if (currentSection === "taste" && document.querySelector("#depends-on-answer").children.length > 0) {
            // Move to tasteTexture section after depends-on-answer
            loadSection("tasteTexture");
        } else {
            const sectionKeys = Object.keys(sections);
            const currentIndex = sectionKeys.indexOf(currentSection);
            let nextIndex = (currentIndex + 1) % sectionKeys.length;
    
            // Navigate to the next section
            loadSection(sectionKeys[nextIndex]);
        }
    });

    document.querySelector("#prev").addEventListener("click", (event) => {
        event.preventDefault();
        if (currentSection === "tasteTexture") {
            // Move back to depends-on-answer and re-display #check-answer
            loadSection("taste");
            document.querySelector("#check-answer").style.display = "block";
        } else {
            const sectionKeys = Object.keys(sections);
            const currentIndex = sectionKeys.indexOf(currentSection);
            let prevIndex = (currentIndex - 1 + sectionKeys.length) % sectionKeys.length;
    
            // Navigate to the previous section
            loadSection(sectionKeys[prevIndex]);
        }
    });

    addPaintSwatchListeners(); // Initial attachment
    makeDraggable(); // Make draggable elements draggable initially
    addFlavourImageListeners(); // Make flavour images clickable initially
    addHoverListeners(); // Add hover listeners for swapping alt text
    addAnswerButtonListeners(); // Add event listeners to "yes" and "no" buttons
    addFlavourTasteImageListeners(); // Add event listeners to initial flavour taste images if there are any

    updateStructure(); // Initialize the structure values on load
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

// Function to add event listeners to the yes and no buttons
function addAnswerButtonListeners() {
    const yesButton = document.querySelector("#yes");
    const noButton = document.querySelector("#no");

    if (yesButton && noButton) {
        yesButton.addEventListener("click", handleYesButtonClick);
        noButton.addEventListener("click", handleNoButtonClick);
    }
}

// Handle Yes Button Click: Append matching flavour images
function handleYesButtonClick() {
    console.log("Yes button clicked"); // Add this to verify if the click event is being registered
    const dependsOnAnswerDiv = document.querySelector("#depends-on-answer");
    const checkAnswerDiv = document.querySelector("#check-answer");
    const yesSection = document.querySelector("#yes-btn-clicked");
    if (!dependsOnAnswerDiv || !checkAnswerDiv || !yesSection) return;

    // Clear the existing content
    dependsOnAnswerDiv.innerHTML = '';

    // Clone the entire #yes-btn-clicked section and append it to #depends-on-answer
    const clonedYesSection = yesSection.cloneNode(true);
    dependsOnAnswerDiv.appendChild(clonedYesSection);

    // Get the current smells from the `.smells` element
    const smellsText = document.querySelector(".smells p").textContent || "";
    const smellsArray = smellsText.replace("nose: ", "").split(", ").map(smell => smell.trim().toLowerCase());

    // Find the .flavour-taste-img div inside the cloned content
    const flavourTasteImgDiv = clonedYesSection.querySelector(".flavour-taste-img");

    // Filter the CSV data and get images for flavours that match the smells array
    blindData.forEach(item => {
        if (smellsArray.includes(item.sub.toLowerCase())) {
            const imgElement = document.createElement("img");
            imgElement.src = item.img;
            imgElement.alt = `${item.flavour} ${item.sub}`;
            imgElement.className = "flavour-image";
            flavourTasteImgDiv.appendChild(imgElement);
        }
    });

    // Attach event listeners to the newly added flavour-taste images
    addFlavourTasteImageListeners();

    // Hide the #check-answer div when #depends-on-answer is updated
    checkAnswerDiv.style.display = 'none';
}

// Handle No Button Click: Append non-matching flavour images
function handleNoButtonClick() {
    console.log("No button clicked"); // Add this to verify if the click event is being registered
    const dependsOnAnswerDiv = document.querySelector("#depends-on-answer");
    const checkAnswerDiv = document.querySelector("#check-answer");
    const noSection = document.querySelector("#no-btn-clicked");
    if (!dependsOnAnswerDiv || !checkAnswerDiv || !noSection) return;

    // Clear the existing content
    dependsOnAnswerDiv.innerHTML = '';

    // Clone the entire #no-btn-clicked section and append it to #depends-on-answer
    const clonedNoSection = noSection.cloneNode(true);
    dependsOnAnswerDiv.appendChild(clonedNoSection);

    // Get the current smells from the `.smells` element
    const smellsText = document.querySelector(".smells p").textContent || "";
    const smellsArray = smellsText.replace("nose: ", "").split(", ").map(smell => smell.trim().toLowerCase());

    // Find the .flavour-taste-img div inside the cloned content
    const flavourTasteImgDiv = clonedNoSection.querySelector(".flavour-taste-img");

    // Filter the CSV data and get images for flavours that do NOT match the smells array
    blindData.forEach(item => {
        if (!smellsArray.includes(item.sub.toLowerCase())) {
            const imgElement = document.createElement("img");
            imgElement.src = item.img;
            imgElement.alt = `${item.flavour} ${item.sub}`;
            imgElement.className = "flavour-image";
            flavourTasteImgDiv.appendChild(imgElement);
        }
    });

    // Attach event listeners to the newly added flavour-taste images
    addFlavourTasteImageListeners();

    // Hide the #check-answer div when #depends-on-answer is updated
    checkAnswerDiv.style.display = 'none';
}

// Array to keep track of selected tastes
let selectedTastes = [];

// Function to add hover and click listeners to flavour taste images
function addFlavourTasteImageListeners() {
    const flavourImages = document.querySelectorAll(".flavour-taste-img img");

    flavourImages.forEach(image => {
        // Scale on hover
        image.addEventListener("mouseenter", () => {
            image.style.transform = "scale(1.1)";
        });

        image.addEventListener("mouseleave", () => {
            if (!selectedTastes.includes(image.alt)) {
                // Only shrink back if the image is not selected
                image.style.transform = "scale(1)";
            }
        });

        // Toggle selection on click
        image.addEventListener("click", () => {
            const flavors = image.alt.split(/[\s,]+/).map(flavor => flavor.trim().toLowerCase());

            // Check if the flavor is already selected
            if (selectedTastes.some(flavor => flavors.includes(flavor))) {
                // If already selected, remove it
                selectedTastes = selectedTastes.filter(flavor => !flavors.includes(flavor));
                image.style.transform = "scale(1)";
            } else {
                // If not selected, add it (but ensure not more than 10 selected)
                if (selectedTastes.length + flavors.length <= 10) {
                    selectedTastes.push(...flavors);
                }
                image.style.transform = "scale(1.1)";
            }

            // Update the `.tastes` element
            const tastesDiv = document.querySelector(".tastes p");
            tastesDiv.textContent = `flavour: ${selectedTastes.join(", ")}`;

            console.log("Updated selected tastes:", selectedTastes);
        });
    });
}


// Object to store structure values
let structure = {
    body: "",
    sweetness: "",
    tannins: "",
    acidity: ""
};

function attachRangeInputListeners() {
    const rangeInputsMap = {
        "body-range": "body",
        "sweetness-range": "sweetness",
        "tannin-range": "tannin",
        "acidity-range": "acidity"
    };

    // Add input event listener to each range input for live updates
    for (const [inputId, section] of Object.entries(rangeInputsMap)) {
        const input = document.getElementById(inputId);
        if (input) {
            input.addEventListener("input", () => {
                const value = parseInt(input.value);
                console.log(`Slider moved: ${inputId}, new value: ${value}, section: ${section}`);
                if (!isNaN(value)) {
                    updateStructure(section, value);
                } else {
                    console.error(`Invalid value for slider: ${inputId}`);
                }
            });
        } else {
            console.error(`No input element found for id: ${inputId}`);
        }
    }
}

// Function to reset the structure object and remove active classes
function resetStructure() {
    structure = {
        body: "",
        sweetness: "",
        tannins: "",
        acidity: ""
    };

    // Reset the text display to blank initially
    const structureDiv = document.querySelector("#structure p");
    if (structureDiv) {
        structureDiv.textContent = `Structure: `;
    } else {
        console.error("#structure p element not found");
    }

    // Remove "active selected" class from all labels
    const labels = document.querySelectorAll(".range-labels li");
    if (labels.length > 0) {
        labels.forEach(label => {
            label.classList.remove("active", "selected");
        });
    } else {
        console.error("No range labels found to reset");
    }
}


// Function to update the structure and display the text in #structure
function updateStructure(section, value) {
    // Ensure section is defined and value is within the valid range
    if (!section || isNaN(value)) {
        console.error(`Invalid section or value: section=${section}, value=${value}`);
        return;
    }

    const labels = document.querySelectorAll(`#${section} .range-labels li`);
    
    // Ensure the value is within the bounds of the labels
    if (value < 1 || value > labels.length) {
        console.error(`Label index ${value} out of bounds for section ${section}`);
        return;
    }

    // Update the label as active and selected
    labels.forEach((label, index) => {
        if (index + 1 === value) {
            label.classList.add("active", "selected");
        } else {
            label.classList.remove("active", "selected");
        }
    });

    // Update the structure object with the label text
    if (labels[value - 1]) {
        structure[section] = labels[value - 1].textContent;
    } else {
        console.error(`No label found for value ${value} in section ${section}`);
        return;
    }

    // Determine sweetness description for structure text
    let sweetnessText = (structure.sweetness && (structure.sweetness.toLowerCase() === "low" || structure.sweetness.toLowerCase() === "medium"))
        ? `${structure.sweetness} sweetness`
        : structure.sweetness || "";

    // Update the structure display text
    const structureDiv = document.querySelector(".structure p");
    if (structureDiv) {
        structureDiv.textContent = `Structure: ${structure.body || ""} body, ${sweetnessText}, ${structure.tannins || ""} tannins, ${structure.acidity || ""} acidity.`;
    } else {
        console.error(".structure p element not found");
    }
}


// Add event listeners to the range inputs to update structure
document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM fully loaded and parsed");

    // Map of range inputs to corresponding structure sections
    const rangeInputsMap = {
        "body-range": "body",
        "sweetness-range": "sweetness",
        "tannin-range": "tannin",
        "acidity-range": "acidity"
    };

    // Add input event listener to each range input for live updates
    for (const [inputId, section] of Object.entries(rangeInputsMap)) {
        const input = document.getElementById(inputId);
        if (input) {
            input.addEventListener("input", () => {
                console.log(`Slider moved: ${inputId}, new value: ${input.value}`);
                updateStructure(section, input.value);
            });
        } else {
            console.error(`No input element found for id: ${inputId}`);
        }
    }

    // Call resetStructure initially to clear default selections
    resetStructure();
});


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
