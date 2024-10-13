// Debugging message to ensure map.js is loaded
console.log("map.js loaded successfully");

// Initialize the map, centered on Washington, DC with zoom level 11
const map = L.map('map').setView([38.9072, -77.0369], 11);

// Add OpenStreetMap Carto tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Add fullscreen control (Optional: Ensure you have Leaflet Fullscreen plugin included if you intend to use this)
if (typeof L.control.fullscreen === 'function') {
    L.control.fullscreen().addTo(map);
    console.log("Fullscreen control added.");
} else {
    console.warn("Fullscreen control not available. Ensure the Leaflet Fullscreen plugin is included.");
}

// Function to adjust icon sizes based on window width
function getIconSize() {
    if (window.innerWidth <= 480) {
        return 9;
    } else if (window.innerWidth <= 768) {
        return 12;
    }
    return 15;
}

// Function to create a FontAwesome icon marker
function createFontAwesomeIcon(iconClass, color = 'green') {
    return L.divIcon({
        html: `<i class="${iconClass}" style="font-size:${getIconSize()}px; color:${color};"></i>`,
        className: 'fa-icon',
        iconSize: [getIconSize(), getIconSize()],
        iconAnchor: [getIconSize() / 2, getIconSize() / 2]
    });
}

// Function to create a coffee mug icon
function createCoffeeIcon() {
    return L.divIcon({
        html: `<i class="fas fa-coffee" style="font-size:${getIconSize()}px; color:brown;"></i>`,
        className: 'fa-icon',
        iconSize: [getIconSize(), getIconSize()],
        iconAnchor: [getIconSize() / 2, getIconSize() / 2]
    });
}

// Function to create a bar icon
function createBarIcon() {
    return L.divIcon({
        html: `<i class="fas fa-beer" style="font-size:${getIconSize()}px; color:purple;"></i>`,
        className: 'fa-icon',
        iconSize: [getIconSize(), getIconSize()],
        iconAnchor: [getIconSize() / 2, getIconSize() / 2]
    });
}

// Function to create a pharmacy icon
function createPharmacyIcon() {
    return L.divIcon({
        html: `<i class="fas fa-pills" style="font-size:${getIconSize()}px; color:red;"></i>`,
        className: 'fa-icon',
        iconSize: [getIconSize(), getIconSize()],
        iconAnchor: [getIconSize() / 2, getIconSize() / 2]
    });
}

// Create Layer Groups for stations and amenities
const markerGroup = L.layerGroup().addTo(map); // Layer for station markers
const hotelLayer = L.layerGroup().addTo(map);
const coffeeLayer = L.layerGroup().addTo(map);
const barsLayer = L.layerGroup().addTo(map);
const pharmacyLayer = L.layerGroup().addTo(map); // Layer for pharmacies

// Base layers (we have only one)
const baseLayers = {};

// Overlay layers
const overlayLayers = {
    "Hotels": hotelLayer,
    "Coffee Shops": coffeeLayer,
    "Bars": barsLayer,
    "Pharmacies": pharmacyLayer // Added Pharmacies to overlay layers
};

// Add Layer Control to the map
L.control.layers(baseLayers, overlayLayers, { collapsed: false }).addTo(map);

// ================================
// Initialize Data Structures
// ================================

let stationsData = [];      // To store all stations
let hotelsData = [];        // To store all hotels
let coffeeData = [];        // To store all coffee shops
let barsData = [];          // To store all bars
let pharmaciesData = [];    // To store all pharmacies

// ================================
// Fetch and store stations
// ================================
fetch('/api/stations')
    .then(response => {
        if (!response.ok) {
            throw new Error(`Network response was not ok (${response.statusText})`);
        }
        return response.json();
    })
    .then(stations => {
        console.log("Fetched Stations:", stations); // Debugging
        stationsData = stations; // Store stations data
        filterAndDisplayMarkers(); // Initial display based on any existing search
    })
    .catch(error => console.error("Error fetching stations:", error));

// ================================
// Fetch and store hotels
// ================================
fetch('/api/hotels')
    .then(response => {
        if (!response.ok) {
            throw new Error(`Network response was not ok (${response.statusText})`);
        }
        return response.json();
    })
    .then(hotels => {
        console.log("Fetched Hotels:", hotels); // Debugging
        hotelsData = hotels; // Store hotels data
        filterAndDisplayAmenities(); // Initial display based on any existing search
    })
    .catch(error => console.error("Error fetching hotels:", error));

// ================================
// Fetch and store coffee shops
// ================================
fetch('/api/coffee')
    .then(response => {
        if (!response.ok) {
            throw new Error(`Network response was not ok (${response.statusText})`);
        }
        return response.json();
    })
    .then(coffeeShops => {
        console.log("Fetched Coffee Shops:", coffeeShops); // Debugging
        coffeeData = coffeeShops; // Store coffee shops data
        filterAndDisplayAmenities(); // Initial display based on any existing search
    })
    .catch(error => console.error("Error fetching coffee shops:", error));

// ================================
// Fetch and store bars
// ================================
fetch('/api/bars')
    .then(response => {
        if (!response.ok) {
            throw new Error(`Network response was not ok (${response.statusText})`);
        }
        return response.json();
    })
    .then(bars => {
        console.log("Fetched Bars:", bars); // Debugging
        barsData = bars; // Store bars data
        filterAndDisplayAmenities(); // Initial display based on any existing search
    })
    .catch(error => console.error("Error fetching bars:", error));

// ================================
// Fetch and store pharmacies
// ================================
fetch('/api/pharmacies')
    .then(response => {
        if (!response.ok) {
            throw new Error(`Network response was not ok (${response.statusText})`);
        }
        return response.json();
    })
    .then(pharmacies => {
        console.log("Fetched Pharmacies:", pharmacies); // Debugging
        pharmaciesData = pharmacies; // Store pharmacies data
        filterAndDisplayAmenities(); // Initial display based on any existing search
    })
    .catch(error => console.error("Error fetching pharmacies:", error));

// ================================
// Function to add station markers
// ================================
function addStationMarkers(filteredStations) {
    markerGroup.clearLayers(); // Remove existing station markers

    filteredStations.forEach(station => {
        const lat = station.station_lat;
        const lon = station.station_lon;
        const name = station.station_name;

        // Debugging: Log each station's coordinates
        console.log(`Station: ${name} at (${lat}, ${lon})`);

        // Check if lat and lon are valid numbers
        if (typeof lat === 'number' && typeof lon === 'number') {
            L.circleMarker([lat, lon], {
                color: 'gray',
                fillColor: 'gray',
                fillOpacity: 1.0,
                radius: getIconSize()
            })
            .addTo(markerGroup)
            .bindPopup(`<b>${name}</b>`);
        } else {
            console.warn(`Invalid coordinates for Station: ${name}`, station);
        }
    });

    // Adjust map view to fit markers with maxZoom set to 11
    if (filteredStations.length > 0) {
        const group = new L.featureGroup(filteredStations.map(station => {
            return L.circleMarker([station.station_lat, station.station_lon], {
                color: 'gray',
                fillColor: 'gray',
                fillOpacity: 1.0,
                radius: getIconSize()
            });
        }));
        map.fitBounds(group.getBounds().pad(0.2), { maxZoom: 11 }); // Changed maxZoom to 11
    } else {
        // If no stations match, center back to default view
        map.setView([38.9072, -77.0369], 11); // Changed zoom level to 11
    }
}

// ================================
// Function to add amenities markers
// ================================
function addAmenitiesMarkers(filteredStations) {
    // Clear existing amenities layers
    hotelLayer.clearLayers();
    coffeeLayer.clearLayers();
    barsLayer.clearLayers();
    pharmacyLayer.clearLayers(); // Clear pharmacies layer

    // Helper function to get amenities for a station
    function getAmenitiesByStation(stationId, dataArray) {
        return dataArray.filter(item => String(item.station_id) === String(stationId));
    }

    filteredStations.forEach(station => {
        const stationId = station.station_id;

        // Add Hotels
        const associatedHotels = getAmenitiesByStation(stationId, hotelsData);
        associatedHotels.forEach(hotel => {
            const lat = hotel.hotel_lat;
            const lon = hotel.hotel_lon;
            const name = hotel.hotel_name;
            const website = hotel.hotel_website;

            // Debugging: Log each hotel's coordinates
            console.log(`Hotel: ${name} at (${lat}, ${lon})`);

            // Check if lat and lon are valid numbers
            if (typeof lat === 'number' && typeof lon === 'number') {
                L.marker([lat, lon], {
                    icon: createFontAwesomeIcon('fas fa-bed', 'blue') // Customize color as needed
                })
                .addTo(hotelLayer)
                .bindPopup(`<b>${name}</b><br><a href="${website}" target="_blank">Website</a>`);
            } else {
                console.warn(`Invalid coordinates for Hotel: ${name}`, hotel);
            }
        });

        // Add Coffee Shops
        const associatedCoffee = getAmenitiesByStation(stationId, coffeeData);
        associatedCoffee.forEach(shop => {
            const lat = shop.coffee_lat;
            const lon = shop.coffee_lon;
            const name = shop.coffee_name;
            const website = shop.coffee_website;

            // Debugging: Log each coffee shop's coordinates
            console.log(`Coffee Shop: ${name} at (${lat}, ${lon})`);

            // Check if lat and lon are valid numbers
            if (typeof lat === 'number' && typeof lon === 'number') {
                L.marker([lat, lon], {
                    icon: createCoffeeIcon()
                })
                .addTo(coffeeLayer)
                .bindPopup(`<b>${name}</b><br><a href="${website}" target="_blank">Website</a>`);
            } else {
                console.warn(`Invalid coordinates for Coffee Shop: ${name}`, shop);
            }
        });

        // Add Bars
        const associatedBars = getAmenitiesByStation(stationId, barsData);
        associatedBars.forEach(bar => {
            const lat = bar.bar_lat;
            const lon = bar.bar_lon;
            const name = bar.bar_name;
            const website = bar.bar_website;

            // Debugging: Log each bar's coordinates
            console.log(`Bar: ${name} at (${lat}, ${lon})`);

            // Check if lat and lon are valid numbers
            if (typeof lat === 'number' && typeof lon === 'number') {
                L.marker([lat, lon], {
                    icon: createBarIcon()
                })
                .addTo(barsLayer)
                .bindPopup(`<b>${name}</b><br><a href="${website}" target="_blank">Website</a>`);
            } else {
                console.warn(`Invalid coordinates for Bar: ${name}`, bar);
            }
        });

        // Add Pharmacies
        const associatedPharmacies = getAmenitiesByStation(stationId, pharmaciesData);
        associatedPharmacies.forEach(pharmacy => {
            const lat = pharmacy.pharmacy_lat;
            const lon = pharmacy.pharmacy_lon;
            const name = pharmacy.pharmacy_name;
            const website = pharmacy.pharmacy_website;

            // Debugging: Log each pharmacy's coordinates
            console.log(`Pharmacy: ${name} at (${lat}, ${lon})`);

            // Check if lat and lon are valid numbers
            if (typeof lat === 'number' && typeof lon === 'number') {
                L.marker([lat, lon], {
                    icon: createPharmacyIcon()
                })
                .addTo(pharmacyLayer)
                .bindPopup(`<b>${name}</b><br><a href="${website}" target="_blank">Website</a>`);
            } else {
                console.warn(`Invalid coordinates for Pharmacy: ${name}`, pharmacy);
            }
        });
    });
}

// ================================
// Function to filter and display markers and amenities based on search
// ================================
function filterAndDisplayMarkers() {
    const { stationQuery, lineQuery } = getSearchParams();

    const filteredStations = stationsData.filter(station => {
        const matchesStation = station.station_name.toLowerCase().includes(stationQuery.toLowerCase());
        const matchesLine = lineQuery === '' || station.station_line.split(',').map(l => l.trim()).includes(lineQuery);
        return matchesStation && matchesLine;
    });

    addStationMarkers(filteredStations);
    addAmenitiesMarkers(filteredStations);
}

// ================================
// Function to filter and display amenities based on search
// (Called after fetching amenities data)
function filterAndDisplayAmenities() {
    // Amenities are already handled in filterAndDisplayMarkers
    filterAndDisplayMarkers();
}

/**
 * Retrieves search parameters from localStorage.
 * @returns {Object} - An object containing stationQuery and lineQuery.
 */
function getSearchParams() {
    const stationQuery = localStorage.getItem('stationQuery') || '';
    const lineQuery = localStorage.getItem('lineQuery') || '';
    return { stationQuery, lineQuery };
}

/**
 * Debounce function to limit the rate of function execution
 * @param {Function} func - The function to debounce
 * @param {number} delay - The delay in milliseconds
 * @returns {Function}
 */
function debounce(func, delay) {
    let debounceTimer;
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => func.apply(context, args), delay);
    }
}

// ================================
// Event listener for search updates
// ================================
window.addEventListener('searchUpdated', () => {
    filterAndDisplayMarkers();
});

// ================================
// Perform initial filtering on page load
// ================================
window.addEventListener('load', () => {
    filterAndDisplayMarkers();
});

// ================================
// New Function: Center and Zoom Map on a Selected Station
// ================================

/**
 * Centers the map on the specified station and sets the zoom level to 11.
 * @param {string} stationId - The unique ID of the station.
 */
function centerMapOnStation(stationId) {
    const station = stationsData.find(s => String(s.station_id) === String(stationId));
    if (station) {
        map.setView([station.station_lat, station.station_lon], 11); // Changed zoom level to 11
        console.log(`Map centered on station: ${station.station_name}`);
    } else {
        console.warn(`Station with ID ${stationId} not found.`);
    }
}

// Make the function globally accessible
window.centerMapOnStation = centerMapOnStation;
