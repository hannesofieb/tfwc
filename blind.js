//--------------page structure (links and ids filling the main section)
document.addEventListener("DOMContentLoaded", () => {
    const sections = ["intro", "apparence", "nose", "taste"]; // Define the section IDs in the correct order
    let currentSectionIndex = 0; // Start with the first section
    const main = document.querySelector(".main");
    const links = document.querySelectorAll(".index-line a");

    // Function to load a section into .main
    function loadSection(sectionId) {
        const sectionContent = document.getElementById(sectionId).innerHTML;
        main.innerHTML = sectionContent;

        // Update active icon visibility and link styles
        links.forEach((link, index) => {
            const icon = link.previousElementSibling;
            if (sections[index] === sectionId) {
                icon.style.visibility = 'visible'; // Show active icon for the current section
                link.style.textDecoration = "none";
                link.style.opacity = "1"; // Normal style for current section
            } else {
                icon.style.visibility = 'hidden'; // Hide other icons
                if (index < currentSectionIndex) {
                    // Style for previous sections (strikethrough and lower opacity)
                    link.style.textDecoration = "line-through";
                    link.style.opacity = "0.5";
                } else {
                    // Reset style for upcoming sections
                    link.style.textDecoration = "none";
                    link.style.opacity = "1";
                }
            }
        });
    }

    // Event listener for list items
    links.forEach((link, index) => {
        link.addEventListener("click", (event) => {
            event.preventDefault();
            currentSectionIndex = index; // Update the index based on clicked item
            loadSection(sections[currentSectionIndex]);
        });
    });

    // Event listener for the .next button
    document.querySelector(".next").addEventListener("click", (event) => {
        event.preventDefault();
        currentSectionIndex = (currentSectionIndex + 1) % sections.length; // Cycle to the next section
        loadSection(sections[currentSectionIndex]);
    });

    // Initial load (optional)
    loadSection(sections[currentSectionIndex]);
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

