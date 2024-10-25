let suburbImages = {
    "brunswick": "assets/vino/brunswick.png",
    "carlton": "assets/vino/carlton.png",
    "cbd": "assets/vino/cbd.png",
    "collingwood": "assets/vino/collingwood.png",
    "fitzroy": "assets/vino/fitzroy.png",
    "south-yarra": "assets/vino/south-yarra.png"
};

let userLatitude = null;
let userLongitude = null;

if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
} else {
    console.error("Geolocation is not supported by this browser.");
}

function successCallback(position) {
    userLatitude = position.coords.latitude;
    userLongitude = position.coords.longitude;
    console.log(`User Location: Latitude ${userLatitude}, Longitude ${userLongitude}`);
    loadBarsData();
}

function errorCallback(error) {
    console.error("Error getting geolocation: ", error);
    loadBarsData(); // Still load the bars data even if location fails
}

// Function to calculate distance between two points using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Radius of the Earth in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c; // Distance in meters
    return distance;
}

// Load bar data from CSV
function loadBarsData() {
    fetch('vinographical-bars.csv')
        .then(response => response.text())
        .then(data => {
            const lines = data.split('\n');
            const headers = lines[0].split(',');
            const suburbIndex = headers.indexOf('suburb');
            const barNameIndex = headers.indexOf('bar-name');
            const commentsIndex = headers.indexOf('comments');
            const linkIndex = headers.indexOf('link');
            const gifIndex = headers.indexOf('gif');
            const imgIndex = headers.indexOf('img');
            const latitudeIndex = headers.indexOf('latitude');
            const longitudeIndex = headers.indexOf('longitude');

            for (let i = 1; i < lines.length; i++) {
                if (lines[i].trim() === '') continue;
                const line = lines[i].split(',');
                const suburb = line[suburbIndex]?.trim();
                const barName = line[barNameIndex]?.trim();
                const comments = line[commentsIndex] ? line[commentsIndex].trim().split(' ') : [];
                const link = line[linkIndex] ? line[linkIndex].trim() : null;
                const gif = line[gifIndex] ? line[gifIndex].trim() : null;
                const img = line[imgIndex] ? line[imgIndex].trim() : null;
                const barLatitude = parseFloat(line[latitudeIndex]);
                const barLongitude = parseFloat(line[longitudeIndex]);

                let distanceText = "Location not available";
                if (userLatitude !== null && userLongitude !== null && !isNaN(barLatitude) && !isNaN(barLongitude)) {
                    const distance = calculateDistance(userLatitude, userLongitude, barLatitude, barLongitude);
                    distanceText = `${(distance / 1000).toFixed(2)}km`;
                }

                if (suburb && barName) {
                    const suburbSection = document.querySelector(`.${suburb.toLowerCase()} .bar-list`);
                    if (suburbSection) {
                        const barLine = document.createElement('div');
                        barLine.classList.add('bar-line');

                        const barNameDiv = document.createElement('div');
                        barNameDiv.classList.add('bar-name');

                        const nameDiv = document.createElement('div');
                        nameDiv.classList.add('name');
                        nameDiv.textContent = barName;

                        const distanceDiv = document.createElement('div');
                        distanceDiv.classList.add('distance');
                        distanceDiv.textContent = distanceText;

                        if (link) {
                            barNameDiv.addEventListener('click', function() {
                                window.open(link, '_blank');
                            });
                        }

                        barNameDiv.appendChild(nameDiv);
                        barNameDiv.appendChild(distanceDiv);

                        const commentsDiv = document.createElement('div');
                        commentsDiv.classList.add('comments');
                        commentsDiv.style.display = 'none';
                        commentsDiv.style.flexDirection = 'row';
                        comments.forEach(comment => {
                            const commentDiv = document.createElement('div');
                            commentDiv.classList.add('comment');
                            commentDiv.textContent = comment;
                            commentsDiv.appendChild(commentDiv);
                        });

                        barNameDiv.addEventListener('mouseenter', function() {
                            commentsDiv.style.display = 'flex';
                            if (gif) {
                                const mapImage = document.getElementById('mapImage');
                                mapImage.src = gif;

                                // Set timeout to change image back after GIF finishes
                                setTimeout(() => {
                                    if (img) {
                                        mapImage.src = img;
                                    }
                                }, 2800); // Assuming GIF duration is 3 seconds, you can adjust as needed
                            }
                        });

                        barNameDiv.addEventListener('mouseleave', function() {
                            commentsDiv.style.display = 'none';
                        });

                        barLine.appendChild(barNameDiv);
                        barLine.appendChild(commentsDiv);
                        suburbSection.appendChild(barLine);
                    }
                }
            }
        })
        .catch(error => console.error('Error loading CSV file:', error));
}

// Event listener for suburb hover
document.querySelectorAll('.suburb').forEach(suburbElement => {
    suburbElement.addEventListener('mouseenter', function() {
        const suburbName = this.classList[0]; // Assuming the suburb class is the name
        const mapImage = document.getElementById('mapImage');
        if (suburbImages[suburbName]) {
            mapImage.src = suburbImages[suburbName];
        }
    });

    suburbElement.addEventListener('mouseleave', function() {
        const mapImage = document.getElementById('mapImage');
        mapImage.src = 'assets/vino/main-map.png';
    });
});
