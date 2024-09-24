// Debugging message to ensure map.js is loaded
console.log("map.js loaded successfully");

// Initialize the map, centered on Washington, DC
const map = L.map('map').setView([38.9072, -77.0369], 12);

// Add OpenStreetMap Carto tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Add fullscreen control
if (typeof L.control.fullscreen === 'function') {
    L.control.fullscreen().addTo(map);
    console.log("Fullscreen control added.");
} else {
    console.warn("Fullscreen control not available.");
}

// Function to adjust icon sizes for stations and hotels
function getIconSize() {
    if (window.innerWidth <= 480) {
        return 9;  // 1.5 times larger for smaller screens
    } else if (window.innerWidth <= 768) {
        return 12;  // 1.5 times larger for medium-sized screens
    }
    return 15;     // 1.5 times larger for larger screens
}

// Function to create a FontAwesome icon marker (with increased size)
function createFontAwesomeIcon(iconClass) {
    return L.divIcon({
        html: `<i class="${iconClass}" style="font-size:${getIconSize()}px; color:green;"></i>`,
        className: 'fa-icon', // Custom class for styling
        iconSize: [getIconSize(), getIconSize()], // Size of the icon
        iconAnchor: [getIconSize() / 2, getIconSize() / 2] // To center the icon
    });
}

// Fetch and display stations with custom icons (gray circle markers for now)
fetch('/api/stations')
    .then(response => {
        if (!response.ok) {
            throw new Error("Failed to fetch stations data");
        }
        return response.json();
    })
    .then(stations => {
        console.log("Stations data:", stations);  // Debugging: Log stations data
        stations.forEach(station => {
            L.circleMarker([station.latitude, station.longitude], {
                color: 'gray',            // Border color for stations
                fillColor: 'gray',        // Fill color for stations
                fillOpacity: 1.0,         // Fill opacity
                radius: getIconSize()     // Same dynamic size as hotels
            })
            .addTo(map)
            .bindPopup(`<b>${station.name}</b>`);
        });
    })
    .catch(error => {
        console.error("Error fetching stations:", error);  // Debugging: Log errors
    });

// Fetch and display hotels with FontAwesome icons (with increased size)
fetch('/api/hotels')
    .then(response => {
        if (!response.ok) {
            throw new Error("Failed to fetch hotels data");
        }
        return response.json();
    })
    .then(hotels => {
        console.log("Hotels data:", hotels);  // Debugging: Log hotels data
        hotels.forEach(hotel => {
            L.marker([hotel.latitude, hotel.longitude], {
                icon: createFontAwesomeIcon('fas fa-hotel')  // Use FontAwesome hotel icon
            })
            .addTo(map)
            .bindPopup(`<b>${hotel.name}</b><br><a href="${hotel.website}" target="_blank">Website</a>`);
        });
    })
    .catch(error => {
        console.error("Error fetching hotels:", error);  // Debugging: Log errors
    });



