// Debugging message to ensure map.js is loaded
console.log("map.js loaded successfully");

// Initialize the map, centered on Washington, DC
const map = L.map('map').setView([38.9072, -77.0369], 12);

// Add OpenStreetMap Carto tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Add fullscreen control
L.control.fullscreen().addTo(map);

// Fetch and display stations with custom icons
fetch('/api/stations')
    .then(response => response.json())
    .then(stations => {
        console.log("Stations fetched: ", stations); // Debugging message
        stations.forEach(station => {
            console.log(`Adding station: ${station.name} at ${station.latitude}, ${station.longitude}`);
            L.circleMarker([station.latitude, station.longitude], {
                color: 'gray',        // Border color
                fillColor: 'gray',    // Fill color
                fillOpacity: 1.0,     // Fill opacity
                radius: getIconSize()
            })
            .addTo(map)
            .bindPopup(`<b>${station.name}</b>`);
        });
    })
    .catch(err => console.error('Error fetching stations:', err));

// Fetch and display hotels with custom icons
fetch('/api/hotels')
    .then(response => response.json())
    .then(hotels => {
        console.log("Hotels fetched: ", hotels); // Debugging message
        hotels.forEach(hotel => {
            console.log(`Adding hotel: ${hotel.name} at ${hotel.latitude}, ${hotel.longitude}`);
            L.circleMarker([hotel.latitude, hotel.longitude], {
                color: 'green',        // Border color
                fillColor: 'green',    // Fill color
                fillOpacity: 1.0,      // Fill opacity
                radius: getIconSize()
            })
            .addTo(map)
            .bindPopup(`<b>${hotel.name}</b><br><a href="${hotel.website}" target="_blank">Website</a>`);
        });
    })
    .catch(err => console.error('Error fetching hotels:', err));

// Function to adjust icon sizes based on screen width.
function getIconSize() {
    if (window.innerWidth <= 480) {
        return 10;  // Smaller size for mobile screens
    } else if (window.innerWidth <= 768) {
        return 12;  // Medium size for tablets
    }
    return 15;  // Default size for larger screens
}

