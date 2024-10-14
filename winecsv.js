// Fisher-Yates Shuffle Algorithm
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function loadCSVAndDisplayWines() {
    Papa.parse("wines.csv", {
        download: true,
        header: true,
        complete: function(results) {
            // Parse the CSV data
            const winesData = results.data;

            // Shuffle the wines data to make it random
            shuffleArray(winesData);

            // Select the wines section
            const winesSection = document.querySelector('.wines');

            // Clear any previous content in the wines section
            winesSection.innerHTML = '';

            // Generate HTML content for each wine
            winesData.forEach(wine => {
                // Check if the wine entry has a valid front image URL
                if (wine.front && wine.front.trim() !== '') {
                    // Create a wine card for each valid wine entry
                    const wineHTML = `
                        <div class="wine-card">
                            <img src="${wine.front}" alt="${wine.name}" class="wine-img" data-front="${wine.front}" data-back="${wine.back}">
                        </div>
                    `;
                    // Append the wine card to the wines section
                    winesSection.innerHTML += wineHTML;
                } else {
                    console.warn(`Skipping wine with missing front image:`, wine);
                }
            });

            // Add hover effect to wines after adding them to DOM
            addHoverEffectToWines();
        }
    });
}





// Load and display the wines when the document is ready
document.addEventListener("DOMContentLoaded", function() {
    loadCSVAndDisplayWines();
});



