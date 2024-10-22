let winesData = []; // Declare winesData in a wider scope

// Fisher-Yates Shuffle Algorithm
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Function to sort wines by price
function sortByPrice(wines, ascending = true) {
    // Ensure prices are numbers, and filter out wines with no price
    const filteredWines = wines.filter(wine => wine.price !== null && !isNaN(wine.price));
    return filteredWines.sort((a, b) => ascending ? a.price - b.price : b.price - a.price);
}

// Function to filter wines by type (funky/normal)
function filterByType(wines, type) {
    return wines.filter(wine => wine.funkyNormal === type);
}

// Function to display wines
function displayWines(wines) {
    const winesSection = document.querySelector('.wines');
    winesSection.innerHTML = ''; // Clear the section

    wines.forEach(wine => {
        // Validate wine data: check if it has a valid front image and price
        if (wine.front && wine.front.trim() !== '' && wine.price !== null) {
            const wineHTML = `
                <div class="wine-card">
                    <img src="${wine.front}" alt="${wine.name}" class="wine-img" data-link="${wine.link}">
                </div>
            `;
            winesSection.innerHTML += wineHTML;
        } else {
            console.warn(`Skipping wine with missing data:`, wine);
        }
    });

    // Add click event to each wine card
    document.querySelectorAll('.wine-img').forEach(img => {
        img.addEventListener('click', function() {
            window.open(this.dataset.link, '_blank');
        });
    });
}

function loadCSVAndDisplayWines() {
    Papa.parse("wines.csv", {
        download: true,
        header: true,
        complete: function(results) {
            winesData = results.data.map(wine => {
                // Ensure price is parsed as a number, and set to null if invalid
                const price = parseFloat(wine.price);
                return {
                    ...wine,
                    price: !isNaN(price) ? price : null,  // Handle invalid prices as null
                };
            });

            console.log('Parsed Wines Data:', winesData); // Debugging output

            // Shuffle the wines data to randomize display
            shuffleArray(winesData);

            // Display all the wines in random order
            displayWines(winesData);
        }
    });

    // Event listeners for sorting/filtering
    document.getElementById('sort-cheap').addEventListener('click', () => {
        const sortedWines = sortByPrice([...winesData], true); // Sort in ascending order
        displayWines(sortedWines);
    });

    document.getElementById('sort-expensive').addEventListener('click', () => {
        const sortedWines = sortByPrice([...winesData], false); // Sort in descending order
        displayWines(sortedWines);
    });

    document.getElementById('filter-classic').addEventListener('click', () => {
        const classicWines = filterByType(winesData, 'normal'); // Filter by 'normal' wines
        displayWines(classicWines);
    });

    document.getElementById('filter-funky').addEventListener('click', () => {
        const funkyWines = filterByType(winesData, 'funky'); // Filter by 'funky' wines
        displayWines(funkyWines);
    });
}

// Load and display the wines when the document is ready
document.addEventListener("DOMContentLoaded", function() {
    loadCSVAndDisplayWines();
});
