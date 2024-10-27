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
    const nextIndex = (currentIndex + 1) % sectionKeys.length;
    loadSection(sectionKeys[nextIndex]);
});

document.querySelector("#prev").addEventListener("click", (event) => {
    event.preventDefault();
    const sectionKeys = Object.keys(sections);
    const currentIndex = sectionKeys.indexOf(currentSection);
    const prevIndex = (currentIndex - 1 + sectionKeys.length) % sectionKeys.length;
    loadSection(sectionKeys[prevIndex]);
});

addPaintSwatchListeners(); // Initial attachment


    addPaintSwatchListeners(); // Initial attachment
});


// Function to load flavour images into the nose section
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
                    imgElement.className = `blind ${item.flavour} ${item.sub} flavour-image`;
                    imgElement.src = item.img;
                    imgElement.title = `${item.flavour} ${item.sub}`;

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
                    const randomPattern =
                        movementPatterns[Math.floor(Math.random() * movementPatterns.length)];
                    imgElement.style.animation = `${randomPattern.name} ${randomPattern.duration} ease-in-out infinite`;

                    // Make the images draggable
                    makeDraggable(imgElement, item);

                    flavourContainer.appendChild(imgElement);
                }
            });

            const main = document.querySelector(".main");
            main.appendChild(flavourContainer); // Append flavour container to the main section
        },
        error: function (error) {
            console.error("Error loading CSV:", error);
        },
    });
}

// Function to make an element draggable
function makeDraggable(element, item) {
    let isDragging = false;
    let startX, startY;
    let moveThreshold = 5; // Minimum distance to consider as dragging
    let initialMouseX, initialMouseY;

    element.addEventListener("mousedown", (e) => {
        isDragging = false;
        startX = e.clientX - element.offsetLeft;
        startY = e.clientY - element.offsetTop;
        initialMouseX = e.clientX;
        initialMouseY = e.clientY;

        // Pause animation while dragging
        element.style.animationPlayState = "paused";
        document.body.style.cursor = "grabbing";

        // Add event listeners for mousemove and mouseup on document
        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
    });

    function onMouseMove(e) {
        // Calculate the distance moved
        const deltaX = e.clientX - initialMouseX;
        const deltaY = e.clientY - initialMouseY;

        // If the mouse moved beyond the threshold, consider it a drag
        if (Math.abs(deltaX) > moveThreshold || Math.abs(deltaY) > moveThreshold) {
            isDragging = true;
            const x = e.clientX - startX;
            const y = e.clientY - startY;
            element.style.left = `${x}px`;
            element.style.top = `${y}px`;
        }
    }

    function onMouseUp(e) {
        // Remove the mousemove and mouseup listeners
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);

        // Resume animation when drag ends
        element.style.animationPlayState = "running";
        document.body.style.cursor = "default";

        // If it was not a drag, treat it as a click
        if (!isDragging) {
            addSmell(item);
        }
    }
}

// Function to add smell to the .smells container
function addSmell(item) {
    const smellsContainer = document.querySelector(".tasting-notes .smells p");
    const currentSmells = smellsContainer.textContent.split(", ").map((f) => f.trim());
    const newSmell = `${item.flavour} ${item.sub}`;

    // Add new flavour if it's not a duplicate
    if (!currentSmells.includes(newSmell) && currentSmells.length < 10) {
        if (smellsContainer.textContent.trim() === "nose:") {
            smellsContainer.textContent = `nose: ${newSmell}`;
        } else {
            smellsContainer.textContent += `, ${newSmell}`;
        }
    }
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
