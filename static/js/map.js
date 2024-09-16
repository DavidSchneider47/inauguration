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
    .then(response => {
        if (!response.ok) {
            throw new Error("Failed to fetch stations data");
        }
        return response.json();
    })
    .then(stations => {
        console.log("Stations data:", stations); // Debugging: Log stations data
        stations.forEach(station => {
            L.circleMarker([station.latitude, station.longitude], {
                color: 'gray',
                fillColor: 'gray',
                fillOpacity: 1.0,
                radius: 10 // Adjust as needed
            })
            .addTo(map)
            .bindPopup(`<b>${station.name}</b>`);
        });
    })
    .catch(error => {
        console.error("Error fetching stations:", error); // Debugging: Log errors
    });

// Fetch and display hotels with custom icons
fetch('/api/hotels')
    .then(response => {
        if (!response.ok) {
            throw new Error("Failed to fetch hotels data");
        }
        return response.json();
    })
    .then(hotels => {
        console.log("Hotels data:", hotels); // Debugging: Log hotels data
        hotels.forEach(hotel => {
            L.circleMarker([hotel.latitude, hotel.longitude], {
                color: 'green',
                fillColor: 'green',
                fillOpacity: 1.0,
                radius: 8 // Adjust as needed
            })
            .addTo(map)
            .bindPopup(`<b>${hotel.name}</b><br><a href="${hotel.website}" target="_blank">Website</a>`);
        });
    })
    .catch(error => {
        console.error("Error fetching hotels:", error); // Debugging: Log errors
    });
