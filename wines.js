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
    const filteredWines = wines.filter(wine => wine.price !== null && !isNaN(wine.price));
    return filteredWines.sort((a, b) => ascending ? a.price - b.price : b.price - a.price);
}

// Function to filter wines by type (funky/normal)
function filterByType(wines, type) {
    return wines.filter(wine => wine.funkyNormal === type);
}

function displayWines(wines) {
    const winesSection = document.querySelector('.wines');
    winesSection.innerHTML = ''; // Clear the section

    wines.forEach(wine => {
        if (wine.front && wine.front.trim() !== '' && wine.price !== null && wine.comment) {
            const wineHTML = `
                <div class="wine-card">
                    <img src="${wine.front}" alt="${wine.name}" class="wine-img" data-link="${wine.link}" draggable="true" data-name="${wine.name}" data-type="${wine.funkyNormal}" data-price="${wine.price}" data-front="${wine.front}" data-comment="${wine.comment}">
                </div>
            `;
            winesSection.innerHTML += wineHTML;
        } else {
            console.warn(`Skipping wine with missing data:`, wine);
        }
    });

    // Add event listeners to each wine card
    document.querySelectorAll('.wine-img').forEach(img => {
        // Add click event to open the link in a new tab
        img.addEventListener('click', function() {
            window.open(this.dataset.link, '_blank');
        });

        // Add hover event to display info in wine-info section
        img.addEventListener('mouseenter', function() {
            const wineInfoSection = document.querySelector('.wine-info');
            const bottleImgContainer = wineInfoSection.querySelector('.bottle-img');
            const commentElement = wineInfoSection.querySelector('.comment');
            const priceElement = wineInfoSection.querySelector('.price');

            // Extracting the necessary data attributes
            const wineFront = this.dataset.front;
            const wineComment = this.dataset.comment;
            const winePrice = this.dataset.price;

            // Display the wine image in the center
            if (wineFront) {
                bottleImgContainer.innerHTML = `<img src="${wineFront}" alt="${this.dataset.name}" class="wine-img-hover">`;
            }

            // Update comment and price
            if (wineComment) {
                commentElement.textContent = wineComment;
            }
            if (winePrice) {
                priceElement.textContent = `$${parseFloat(winePrice).toFixed(2)}`;
            }
        });

        // Clear hover info when mouse leaves the image
        img.addEventListener('mouseleave', function() {
            const wineInfoSection = document.querySelector('.wine-info');
            const bottleImgContainer = wineInfoSection.querySelector('.bottle-img');
            const commentElement = wineInfoSection.querySelector('.comment');
            const priceElement = wineInfoSection.querySelector('.price');

            // Clear the wine info
            bottleImgContainer.innerHTML = '';
            commentElement.textContent = '';
            priceElement.textContent = '';
        });
    });
}


function loadCSVAndDisplayWines() {
    Papa.parse("wines.csv", {
        download: true,
        header: true,
        complete: function(results) {
            console.log('CSV Loaded:', results.data);

            winesData = results.data.map(wine => {
                const price = parseFloat(wine.price);
                return {
                    ...wine,
                    price: !isNaN(price) ? price : null,
                };
            });

            shuffleArray(winesData);
            displayWines(winesData);

            // Event listeners for sorting/filtering (added after CSV is loaded)
            document.getElementById('sort-cheap').addEventListener('click', () => {
                const sortedWines = sortByPrice([...winesData], true);
                displayWines(sortedWines);
            });

            document.getElementById('sort-expensive').addEventListener('click', () => {
                const sortedWines = sortByPrice([...winesData], false);
                displayWines(sortedWines);
            });

            document.getElementById('filter-classic').addEventListener('click', () => {
                const classicWines = filterByType(winesData, 'normal');
                displayWines(classicWines);
            });

            document.getElementById('filter-funky').addEventListener('click', () => {
                const funkyWines = filterByType(winesData, 'funky');
                displayWines(funkyWines);
            });
        }
    });
}


// Load and display the wines when the document is ready
document.addEventListener("DOMContentLoaded", function() {
    loadCSVAndDisplayWines();
});
