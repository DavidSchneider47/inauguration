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
        stations.forEach(station => {
            // Add a circle marker for each station
            L.circleMarker([station.latitude, station.longitude], {
                color: 'gray',        // Border color
                fillColor: 'gray',    // Fill color
                fillOpacity: 1.0,     // Fill opacity
                radius: getIconSize()
            })
            .addTo(map)
            .bindPopup(`<b>${station.name}</b>`);
        });
    });

// Fetch and display hotels with custom icons
fetch('/api/hotels')
    .then(response => response.json())
    .then(hotels => {
        hotels.forEach(hotel => {
            // Add a circle marker for each hotel
            L.circleMarker([hotel.latitude, hotel.longitude], {
                color: 'green',        // Border color
                fillColor: 'green',    // Fill color
                fillOpacity: 1.0,      // Fill opacity
                radius: getIconSize()
            })
            .addTo(map)
            .bindPopup(`<b>${hotel.name}</b><br><a href="${hotel.website}" target="_blank">Website</a>`);
        });
    });
