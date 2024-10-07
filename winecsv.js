// Function to load CSV file and populate the wines section
function loadCSVAndDisplayWines() {
    Papa.parse("wines.csv", {
        download: true,
        header: true, // Adjust according to whether your CSV has headers
        complete: function(results) {
            // Parse the CSV data
            const winesData = results.data;

            // Select the wines section
            const winesSection = document.querySelector('.wines');

            // Generate HTML content for each wine
            winesData.forEach(wine => {
                // Create a wine card for each wine entry
                const wineHTML = `
                    <div class="wine-card">
                        <img src="${wine.front}" alt="${wine.name}" class="wine-img">
                    </div>
                `;
                

                // Append the wine card to the wines section
                winesSection.innerHTML += wineHTML;
            });
        }
    });
}

// Function to add hover effect for front and back images
function addHoverEffectToWines() {
    const wineCards = document.querySelectorAll('.wine-card');

    wineCards.forEach(card => {
        const wineImg = card.querySelector('.wine-img');
        const frontImg = wineImg.getAttribute('data-front');
        const backImg = wineImg.getAttribute('data-back');

        // Check if backImg is valid and not an empty string
        if (backImg && backImg.trim() !== '') {
            card.addEventListener('mouseenter', () => {
                console.log(`Switching to back image: ${backImg.trim()}`);
                wineImg.src = backImg.trim(); // Swap to back image on hover
            });
        
            card.addEventListener('mouseleave', () => {
                console.log(`Switching back to front image: ${frontImg}`);
                wineImg.src = frontImg; // Swap back to front image on leave
            });
        }
    });
}


// Load and display the wines when the document is ready
document.addEventListener("DOMContentLoaded", function() {
    loadCSVAndDisplayWines();
});



