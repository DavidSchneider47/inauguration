// Debugging message to ensure map.js is loaded
console.log("map.js loaded successfully");

// Initialize the map, centered on Washington Monument with zoom level 14 to show National Mall
const map = L.map('map').setView([38.889484, -77.035278], 14);

// 1. CartoDB Positron (Light) - RECOMMENDED
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20
}).addTo(map);

// Add fullscreen control (Optional: Ensure you have Leaflet Fullscreen plugin included if you intend to use this)
if (typeof L.control.fullscreen === 'function') {
    L.control.fullscreen().addTo(map);
    console.log("Fullscreen control added.");
} else {
    console.warn("Fullscreen control not available. Ensure the Leaflet Fullscreen plugin is included.");
}

// Add this batch clearing function at the top with your other function definitions
function batchClearLayers() {
    const layersToClean = [
        markerGroup,
        hotelLayer,
        coffeeLayer,
        barsLayer,
        pharmacyLayer,
        restaurantsLayer,
        supermarketsLayer, // Added supermarkets layer to batch clearing
        museumsLayer // Added museums layer to batch clearing
    ];
    
    requestAnimationFrame(() => {
        layersToClean.forEach(layer => layer.clearLayers());
    });
}

// ================================
// Geolocation Feature Setup
// ================================

// Function to initialize geolocation tracking with explicit Android handling
function trackUserLocation(map) {
    // First, check if we're on Android by checking the user agent
    const isAndroid = /Android/i.test(navigator.userAgent);
    
    if (navigator.geolocation) {
        // For Android, we'll first request permissions explicitly
        if (isAndroid && navigator.permissions) {
            navigator.permissions.query({ name: 'geolocation' })
                .then(permissionStatus => {
                    if (permissionStatus.state === 'granted') {
                        startTracking();
                    } else if (permissionStatus.state === 'prompt') {
                        // Show a more user-friendly prompt
                        if (confirm('This app needs your location to show where you are on the map. Allow access?')) {
                            startTracking();
                        }
                    } else {
                        console.error("Geolocation permission denied");
                        alert("Location access is denied. Please enable location services for this app in your device settings.");
                    }
                })
                .catch(error => {
                    console.error("Permission query error:", error);
                    // Fallback to standard tracking if permission query fails
                    startTracking();
                });
        } else {
            // For non-Android or older devices, proceed with standard tracking
            startTracking();
        }
    } else {
        console.warn("Geolocation is not supported by this browser.");
        alert("Geolocation is not supported by this browser.");
    }

    function startTracking() {
        const options = {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 10000 // Increased timeout to 10 seconds
        };

        navigator.geolocation.watchPosition(
            (position) => {
                console.log("Position retrieved:", position);
                const userLat = position.coords.latitude;
                const userLng = position.coords.longitude;

                // Add or update the user's location marker
                if (!window.userMarker) {
                    console.log("Creating a new location marker.");
                    window.userMarker = L.marker([userLat, userLng], {
                        icon: createUserLocationIcon()
                    }).addTo(map);
                } else {
                    console.log("Updating location marker position.");
                    window.userMarker.setLatLng([userLat, userLng]);
                }
            },
            (error) => {
                console.error("Geolocation error:", error);
                // More detailed error handling for Android
                if (isAndroid) {
                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            alert("Please enable location services for this app in your device settings.");
                            break;
                        case error.POSITION_UNAVAILABLE:
                            alert("Location service is not available. Please check your device's location settings.");
                            break;
                        case error.TIMEOUT:
                            alert("Location request timed out. Please check your internet connection.");
                            break;
                        default:
                            alert("An unknown error occurred while trying to get your location.");
                            break;
                    }
                }
            },
            options
        );
    }
}

// Custom icon for user location
function createUserLocationIcon() {
    return L.divIcon({
        html: `<i class="fas fa-map-marker-alt" style="font-size:24px; color:blue;"></i>`,
        className: 'user-location-icon',
        iconSize: [24, 24],
        iconAnchor: [12, 24], // Anchor to the bottom center of the icon
    });
}

// Call the geolocation function to start tracking
trackUserLocation(map);

// ================================
// Function to adjust icon sizes based on window width (REVISED FOR SMALLER ICONS)
// ================================

function getIconSize() {
    if (window.innerWidth <= 480) {
        return 18; // Reduced from 28
    } else if (window.innerWidth <= 768) {
        return 20; // Reduced from 34
    }
    return 22; // Reduced from 30 for desktop
}

// Function to create a FontAwesome icon marker (REVISED FOR SMALLER ICONS)
function createFontAwesomeIcon(iconClass, color = 'green') {
    const iconSize = getIconSize();
    return L.divIcon({
        html: `<i class="${iconClass}" style="font-size:${iconSize}px; color:${color};"></i>`,
        className: 'fa-icon',
        iconSize: [iconSize, iconSize],
        iconAnchor: [iconSize / 2, iconSize / 2]
    });
}

// Function to create a coffee mug icon (REVISED FOR SMALLER ICONS)
function createCoffeeIcon() {
    const iconSize = getIconSize();
    return L.divIcon({
        html: `<i class="fas fa-coffee" style="font-size:${iconSize}px; color:brown;"></i>`,
        className: 'fa-icon',
        iconSize: [iconSize, iconSize],
        iconAnchor: [iconSize / 2, iconSize / 2]
    });
}

// Function to create a beer/bar icon (REVISED FOR SMALLER ICONS)
function createBarIcon() {
    const iconSize = getIconSize();
    return L.divIcon({
        html: `<i class="fas fa-beer" style="font-size:${iconSize}px; color:purple;"></i>`,
        className: 'fa-icon',
        iconSize: [iconSize, iconSize],
        iconAnchor: [iconSize / 2, iconSize / 2]
    });
}

// Function to create a pharmacy icon (REVISED FOR SMALLER ICONS)
function createPharmacyIcon() {
    const iconSize = getIconSize();
    return L.divIcon({
        html: `<i class="fas fa-notes-medical" style="font-size:${iconSize}px; color:red;"></i>`,
        className: 'fa-icon',
        iconSize: [iconSize, iconSize],
        iconAnchor: [iconSize / 2, iconSize / 2]
    });
}

// Function to create a restaurant icon (REVISED FOR SMALLER ICONS)
function createRestaurantIcon() {
    const iconSize = getIconSize();
    return L.divIcon({
        html: `<i class="fas fa-utensils" style="font-size:${iconSize}px; color:orange;"></i>`,
        className: 'fa-icon',
        iconSize: [iconSize, iconSize],
        iconAnchor: [iconSize / 2, iconSize / 2]
    });
}

// Function to create a supermarket icon (NEW)
function createSupermarketIcon() {
    const iconSize = getIconSize();
    return L.divIcon({
        html: `<i class="fas fa-shopping-cart" style="font-size:${iconSize}px; color:limegreen;"></i>`,
        className: 'fa-icon',
        iconSize: [iconSize, iconSize],
        iconAnchor: [iconSize / 2, iconSize / 2]
    });
}

// Function to create a museum icon (NEW)
function createMuseumIcon() {
    const iconSize = getIconSize();
    return L.divIcon({
        html: `<i class="fas fa-university" style="font-size:${iconSize}px; color:darkgreen;"></i>`,
        className: 'fa-icon',
        iconSize: [iconSize, iconSize],
        iconAnchor: [iconSize / 2, iconSize / 2]
    });
}

// Create Layer Groups for stations and amenities
const markerGroup = L.layerGroup().addTo(map); // Layer for station markers
const hotelLayer = L.layerGroup(); // Changed: NOT added to map by default
const coffeeLayer = L.layerGroup(); // Changed: NOT added to map by default
const barsLayer = L.layerGroup(); // Changed: NOT added to map by default
const pharmacyLayer = L.layerGroup(); // Changed: NOT added to map by default
const restaurantsLayer = L.layerGroup(); // Changed: NOT added to map by default
const supermarketsLayer = L.layerGroup(); // Changed: NOT added to map by default
const transitLayer = L.layerGroup().addTo(map); // Transit routes - always visible
const museumsLayer = L.layerGroup().addTo(map); // Museums - always visible

// Base layers (we have only one)
const baseLayers = {};

// Overlay layers - REMOVED "Transit Routes" from control since it's always visible
const overlayLayers = {
    "Hotels": hotelLayer,
    "Coffee Shops": coffeeLayer,
    "Bars": barsLayer,
    "Pharmacies": pharmacyLayer,
    "Restaurants": restaurantsLayer,
    "Supermarkets": supermarketsLayer
};

// Add Layer Control to the map (positioned in top right)
const layerControl = L.control.layers(baseLayers, overlayLayers, { 
    collapsed: false,
    position: 'topright'
}).addTo(map);

// Get a reference to the layer control element
let layerControlElement;

// We need to wait for the layer control to be added to the DOM
setTimeout(() => {
    layerControlElement = document.querySelector('.leaflet-control-layers');
    
    // REMOVED: Toggle button functionality for layer control since we no longer need it
    // Users can now directly use the layer control panel to toggle amenities
    
}, 500); // Short delay to ensure the control has been added

// Add responsive behavior - only show toggle on mobile
function updateToggleButtonVisibility() {
    const toggleButton = document.getElementById('toggleLayerControl');
    if (toggleButton) { // Check if button exists
        if (window.innerWidth <= 768) { // Mobile breakpoint
            toggleButton.style.display = 'block';
        } else {
            toggleButton.style.display = 'none';
        }
    }
}

// Call on page load and when window resizes
window.addEventListener('load', updateToggleButtonVisibility);
window.addEventListener('resize', updateToggleButtonVisibility);

// ================================
// Initialize Data Structures
// ================================

let stationsData = [];      // To store all stations
let hotelsData = [];        // To store all hotels
let coffeeData = [];        // To store all coffee shops
let barsData = [];          // To store all bars
let pharmaciesData = [];    // To store all pharmacies
let restaurantsData = [];   // To store all restaurants
let supermarketsData = [];  // To store all supermarkets (NEW)
let museumsData = [];       // To store all museums

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
        // Ensure we have an array, not an object with a message
        hotelsData = Array.isArray(hotels) ? hotels : [];
        // REMOVED: filterAndDisplayAmenities() call - amenities start hidden
    })
    .catch(error => {
        console.error("Error fetching hotels:", error);
        hotelsData = []; // Ensure it's an empty array on error
    });

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
        // Ensure we have an array, not an object with a message
        coffeeData = Array.isArray(coffeeShops) ? coffeeShops : [];
        // REMOVED: filterAndDisplayAmenities() call - amenities start hidden
    })
    .catch(error => {
        console.error("Error fetching coffee shops:", error);
        coffeeData = []; // Ensure it's an empty array on error
    });

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
        // Ensure we have an array, not an object with a message
        barsData = Array.isArray(bars) ? bars : [];
        // REMOVED: filterAndDisplayAmenities() call - amenities start hidden
    })
    .catch(error => {
        console.error("Error fetching bars:", error);
        barsData = []; // Ensure it's an empty array on error
    });

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
        // Ensure we have an array, not an object with a message
        pharmaciesData = Array.isArray(pharmacies) ? pharmacies : [];
        // REMOVED: filterAndDisplayAmenities() call - amenities start hidden
    })
    .catch(error => {
        console.error("Error fetching pharmacies:", error);
        pharmaciesData = []; // Ensure it's an empty array on error
    });

// ================================
// Fetch and store restaurants
// ================================
fetch('/api/restaurants')
    .then(response => {
        if (!response.ok) {
            throw new Error(`Network response was not ok (${response.statusText})`);
        }
        return response.json();
    })
    .then(restaurants => {
        console.log("Fetched Restaurants:", restaurants); // Debugging
        // Ensure we have an array, not an object with a message
        restaurantsData = Array.isArray(restaurants) ? restaurants : [];
        // REMOVED: filterAndDisplayAmenities() call - amenities start hidden
    })
    .catch(error => {
        console.error("Error fetching restaurants:", error);
        restaurantsData = []; // Ensure it's an empty array on error
    });

// ================================
// Fetch and store supermarkets (NEW)
// ================================
fetch('/api/supermarkets')
    .then(response => {
        if (!response.ok) {
            throw new Error(`Network response was not ok (${response.statusText})`);
        }
        return response.text(); // Get as text first to handle invalid JSON
    })
    .then(text => {
        // Clean up any NaN values before parsing
        const cleanedText = text.replace(/:\s*NaN/g, ': null');
        const supermarkets = JSON.parse(cleanedText);
        console.log("Fetched Supermarkets:", supermarkets); // Debugging
        // Ensure we have an array, not an object with a message
        supermarketsData = Array.isArray(supermarkets) ? supermarkets : [];
        // REMOVED: filterAndDisplayAmenities() call - amenities start hidden
    })
    .catch(error => {
        console.error("Error fetching supermarkets:", error);
        supermarketsData = []; // Ensure it's an empty array on error
    });

// ================================
// Fetch and store museums (NEW)
// ================================
fetch('/static/data/museums.json')
    .then(response => {
        if (!response.ok) {
            throw new Error(`Network response was not ok (${response.statusText})`);
        }
        return response.json();
    })
    .then(museums => {
        console.log("Fetched Museums:", museums); // Debugging
        museumsData = museums; // Store museums data
        addMuseumMarkers(); // Add museums to map immediately (always visible)
    })
    .catch(error => console.error("Error fetching museums:", error));

// ================================
// Fetch and add transit routes GeoJSON - ALWAYS LOAD
// ================================
fetch('/static/data/reduced_routes_data.geojson')
    .then(response => {
        if (!response.ok) {
            throw new Error(`Failed to fetch GeoJSON data: ${response.statusText}`);
        }
        return response.json();
    })
    .then(geojsonData => {
        console.log("Fetched Transit Routes GeoJSON:", geojsonData); // Debugging
        L.geoJSON(geojsonData, {
            style: function(feature) {
                let routeColor;
                const routeId = feature.properties.route_id;

                if (routeId === 'VRE') {
                    routeColor = '#800080'; // Purple for VRE
                } else if (routeId === 'MARC') {
                    routeColor = '#8B4513'; // Brown for MARC
                } else {
                    routeColor = feature.properties.route_color || '#000000'; // Default to black if no route color
                }

                return {
                    color: routeColor,
                    weight: 4,
                    opacity: 0.7
                };
            },
            onEachFeature: function(feature, layer) {
                if (feature.properties && feature.properties.route_short_name) {
                    layer.bindPopup(`<strong>Route: ${feature.properties.route_short_name}</strong>`);
                }
            }
        }).addTo(transitLayer);
    })
    .catch(error => console.error("Error loading transit routes GeoJSON:", error));

// ================================
// Function to add museum markers (NEW)
// ================================
function addMuseumMarkers() {
    museumsLayer.clearLayers();
    
    const BATCH_SIZE = 10;
    let currentIndex = 0;
    
    function processBatch() {
        const endIndex = Math.min(currentIndex + BATCH_SIZE, museumsData.length);
        const batch = museumsData.slice(currentIndex, endIndex);
        
        requestAnimationFrame(() => {
            batch.forEach(museum => {
                const lat = museum.latitude;  // Updated to match your JSON
                const lon = museum.longitude; // Updated to match your JSON
                const name = museum.museum_name; // Updated to match your JSON
                const website = museum.website;
                
                if (typeof lat === 'number' && typeof lon === 'number') {
                    const popupContent = website 
                        ? `<b>${name}</b><br><a href="${website}" target="_blank">Website</a>`
                        : `<b>${name}</b>`;
                    
                    L.marker([lat, lon], {
                        icon: createMuseumIcon()
                    })
                    .addTo(museumsLayer)
                    .bindPopup(popupContent);
                }
            });
            
            currentIndex += BATCH_SIZE;
            if (currentIndex < museumsData.length) {
                processBatch();
            }
        });
    }
    
    processBatch();
}

// ================================
// Function to filter and display only the selected line - MODIFIED
// ================================
function filterTransitRoutes(lineQuery) {
    // Since transit routes are always visible, we still need this function
    // but we'll handle the filtering differently
    const normalizedLineQuery = lineQuery.toUpperCase();

    // Clear the current transit routes
    transitLayer.clearLayers();

    fetch('/static/data/reduced_routes_data.geojson')
        .then(response => response.json())
        .then(geojsonData => {
            const filteredData = {
                ...geojsonData,
                features: geojsonData.features.filter(feature => {
                    const routeId = feature.properties.route_id;
                    return normalizedLineQuery === '' || routeId === normalizedLineQuery; // Match selected line or show all
                })
            };

            L.geoJSON(filteredData, {
                style: function(feature) {
                    let routeColor;
                    const routeId = feature.properties.route_id;

                    if (routeId === 'VRE') {
                        routeColor = '#800080'; // Purple for VRE
                    } else if (routeId === 'MARC') {
                        routeColor = '#8B4513'; // Brown for MARC
                    } else {
                        routeColor = feature.properties.route_color || '#000000'; // Default to black
                    }

                    return {
                        color: routeColor,
                        weight: 4,
                        opacity: 0.7
                    };
                },
                onEachFeature: function(feature, layer) {
                    if (feature.properties && feature.properties.route_short_name) {
                        layer.bindPopup(`<strong>Route: ${feature.properties.route_short_name}</strong>`);
                    }
                }
            }).addTo(transitLayer);
        })
        .catch(error => console.error("Error fetching transit routes:", error));
}

// ================================
// Function to add station markers
// ================================
function addStationMarkers(filteredStations) {
    markerGroup.clearLayers();
    
    const BATCH_SIZE = 10;
    let currentIndex = 0;
    
    function processBatch() {
        const endIndex = Math.min(currentIndex + BATCH_SIZE, filteredStations.length);
        const batch = filteredStations.slice(currentIndex, endIndex);
        
        requestAnimationFrame(() => {
            batch.forEach(station => {
                const lat = station.station_lat;
                const lon = station.station_lon;
                const name = station.station_name;
                
                if (typeof lat === 'number' && typeof lon === 'number') {
                    L.circleMarker([lat, lon], {
                        color: 'gray',
                        fillColor: 'gray',
                        fillOpacity: 1.0,
                        radius: getIconSize() / 2
                    })
                    .addTo(markerGroup)
                    .bindPopup(`<b>${name}</b>`);
                }
            });
            
            currentIndex += BATCH_SIZE;
            if (currentIndex < filteredStations.length) {
                processBatch();
            }
        });
    }
    
    processBatch();
    
    if (filteredStations.length > 0) {
        const bounds = L.latLngBounds(
            filteredStations.map(station => [station.station_lat, station.station_lon])
        );
        map.fitBounds(bounds.pad(0.2), { maxZoom: 16 });
    } else {
        map.setView([38.898327, -77.027777], 16);
    }
}

// ================================
// Function to add amenities markers - MODIFIED to handle layer visibility
// ================================
function addAmenitiesMarkers(filteredStations) {
    // Clear existing amenities layers
    hotelLayer.clearLayers();
    coffeeLayer.clearLayers();
    barsLayer.clearLayers();
    pharmacyLayer.clearLayers();
    restaurantsLayer.clearLayers();
    supermarketsLayer.clearLayers();

    // Helper function to get amenities for a station
    function getAmenitiesByStation(stationId, dataArray) {
        // Safety check: ensure dataArray is actually an array
        if (!Array.isArray(dataArray)) {
            console.warn("getAmenitiesByStation received non-array data:", dataArray);
            return [];
        }
        return dataArray.filter(item => String(item.station_id) === String(stationId));
    }

    filteredStations.forEach(station => {
        const stationId = station.station_id;

        // Add Hotels (only if layer is currently enabled)
        if (map.hasLayer(hotelLayer)) {
            const associatedHotels = getAmenitiesByStation(stationId, hotelsData);
            associatedHotels.forEach(hotel => {
                const lat = hotel.hotel_lat;
                const lon = hotel.hotel_lon;
                const name = hotel.hotel_name;
                const website = hotel.hotel_website;

                if (typeof lat === 'number' && typeof lon === 'number') {
                    L.marker([lat, lon], {
                        icon: createFontAwesomeIcon('fas fa-bed', 'blue')
                    })
                    .addTo(hotelLayer)
                    .bindPopup(`<b>${name}</b><br><a href="${website}" target="_blank">Website</a>`);
                }
            });
        }

        // Add Coffee Shops (only if layer is currently enabled)
        if (map.hasLayer(coffeeLayer)) {
            const associatedCoffee = getAmenitiesByStation(stationId, coffeeData);
            associatedCoffee.forEach(shop => {
                const lat = shop.coffee_lat;
                const lon = shop.coffee_lon;
                const name = shop.coffee_name;
                const website = shop.coffee_website;

                if (typeof lat === 'number' && typeof lon === 'number') {
                    L.marker([lat, lon], {
                        icon: createCoffeeIcon()
                    })
                    .addTo(coffeeLayer)
                    .bindPopup(`<b>${name}</b><br><a href="${website}" target="_blank">Website</a>`);
                }
            });
        }

        // Add Bars (only if layer is currently enabled)
        if (map.hasLayer(barsLayer)) {
            const associatedBars = getAmenitiesByStation(stationId, barsData);
            associatedBars.forEach(bar => {
                const lat = bar.bar_lat;
                const lon = bar.bar_lon;
                const name = bar.bar_name;
                const website = bar.bar_website;

                if (typeof lat === 'number' && typeof lon === 'number') {
                    L.marker([lat, lon], {
                        icon: createBarIcon()
                    })
                    .addTo(barsLayer)
                    .bindPopup(`<b>${name}</b><br><a href="${website}" target="_blank">Website</a>`);
                }
            });
        }

        // Add Pharmacies (only if layer is currently enabled)
        if (map.hasLayer(pharmacyLayer)) {
            const associatedPharmacies = getAmenitiesByStation(stationId, pharmaciesData);
            associatedPharmacies.forEach(pharmacy => {
                const lat = pharmacy.pharmacy_lat;
                const lon = pharmacy.pharmacy_lon;
                const name = pharmacy.pharmacy_name;
                const website = pharmacy.pharmacy_website;

                if (typeof lat === 'number' && typeof lon === 'number') {
                    L.marker([lat, lon], {
                        icon: createPharmacyIcon()
                    })
                    .addTo(pharmacyLayer)
                    .bindPopup(`<b>${name}</b><br><a href="${website}" target="_blank">Website</a>`);
                }
            });
        }

        // Add Restaurants (only if layer is currently enabled)
        if (map.hasLayer(restaurantsLayer)) {
            const associatedRestaurants = getAmenitiesByStation(stationId, restaurantsData);
            associatedRestaurants.forEach(restaurant => {
                const lat = restaurant.restaurant_lat;
                const lon = restaurant.restaurant_lon;
                const name = restaurant.restaurant_name;
                const website = restaurant.restaurant_website;

                if (typeof lat === 'number' && typeof lon === 'number') {
                    L.marker([lat, lon], {
                        icon: createRestaurantIcon()
                    })
                    .addTo(restaurantsLayer)
                    .bindPopup(`<b>${name}</b><br><a href="${website}" target="_blank">Website</a>`);
                }
            });
        }

        // Add Supermarkets (only if layer is currently enabled)
        if (map.hasLayer(supermarketsLayer)) {
            const associatedSupermarkets = getAmenitiesByStation(stationId, supermarketsData);
            associatedSupermarkets.forEach(supermarket => {
                // Handle your actual field names
                const lat = supermarket.supermarket_lat;
                const lon = supermarket.supermarket_lon;
                const name = supermarket.supermarket_name;
                const website = supermarket.supermaret_website || supermarket.supermarket_website; // Handle the typo

                if (typeof lat === 'number' && typeof lon === 'number') {
                    const popupContent = website 
                        ? `<b>${name}</b><br><a href="${website}" target="_blank">Website</a>`
                        : `<b>${name}</b>`;

                    L.marker([lat, lon], {
                        icon: createSupermarketIcon()
                    })
                    .addTo(supermarketsLayer)
                    .bindPopup(popupContent);
                }
            });
        }
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

    // If no search query, set the zoom to 14 by default on initial load to show National Mall
    if (!stationQuery && !lineQuery) {
        map.setView([38.889484, -77.035278], 14); // Force zoom to 14 on initial load, centered on Washington Monument
    }
}

// ================================
// Function to filter and display amenities based on search
// (Called after fetching amenities data) - MODIFIED
// ================================
function filterAndDisplayAmenities() {
    // This function is now called when users toggle layers on/off
    // It will only display amenities for layers that are currently enabled
    filterAndDisplayMarkers();
}

// ================================
// Retrieve search parameters from localStorage
// ================================
function getSearchParams() {
    const stationQuery = localStorage.getItem('stationQuery') || '';
    const lineQuery = localStorage.getItem('lineQuery') || '';
    return { stationQuery, lineQuery };
}

// ================================
// Debounce function to limit function execution rate
// ================================
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
    const { lineQuery } = getSearchParams();
    filterTransitRoutes(lineQuery);
});

// ================================
// Event listeners for layer control changes - NEW
// ================================
map.on('overlayadd', function(e) {
    // When a user adds an overlay layer, refresh the amenities
    filterAndDisplayAmenities();
});

map.on('overlayremove', function(e) {
    // When a user removes an overlay layer, refresh the amenities
    filterAndDisplayAmenities();
});

// ================================
// Perform initial filtering on page load
// ================================
window.addEventListener('load', () => {
    const { lineQuery } = getSearchParams();
    filterAndDisplayMarkers();
    filterTransitRoutes(lineQuery);
});

// ================================
// Function to center map on a selected station
// ================================
function centerMapOnStation(stationId) {
    const station = stationsData.find(s => String(s.station_id) === String(stationId));
    if (station) {
        map.setView([station.station_lat, station.station_lon], 16);
        console.log(`Map centered on station: ${station.station_name}`);
    } else {
        console.warn(`Station with ID ${stationId} not found.`);
    }
}

// Make the function globally accessible
window.centerMapOnStation = centerMapOnStation;

// ================================
// Function to clear search and reset map view
// ================================
function clearSearch() {
    // Remove station and line queries from local storage
    localStorage.removeItem('stationQuery');
    localStorage.removeItem('lineQuery');
    
    // Clear search inputs
    document.getElementById('station-search').value = '';
    document.getElementById('line-search').value = '';
    
    // Batch clear all layers except transit and museums (which are always visible)
    const layersToClean = [
        markerGroup,
        hotelLayer,
        coffeeLayer,
        barsLayer,
        pharmacyLayer,
        restaurantsLayer,
        supermarketsLayer
    ];
    
    requestAnimationFrame(() => {
        layersToClean.forEach(layer => layer.clearLayers());
    });
    
    // Reset map view with smooth animation - centered on Washington Monument
    requestAnimationFrame(() => {
        map.setView([38.889484, -77.035278], 14);
    });

    // Use debounced functions for heavy operations
    const debouncedReset = debounce(() => {
        filterAndDisplayMarkers();
        filterTransitRoutes(''); // This will show all transit routes
        addMuseumMarkers(); // Re-add museums after clearing (they're always visible)
    }, 100);
    
    debouncedReset();
}

// ================================
// Event listeners for various actions
// ================================
document.getElementById('clearButton').addEventListener('click', clearSearch);

// ================================
// Function to filter station drop-down based on input
// ================================
function updateStationDropdown() {
    const stationSearchInput = document.getElementById('station-search').value.toLowerCase();
    const dataList = document.getElementById('station-list');
    
    // Clear existing options
    dataList.innerHTML = '';

    // Filter stations based on input
    const matchingStations = stationsData.filter(station => 
        station.station_name.toLowerCase().includes(stationSearchInput)
    );

    // Create new options for matching stations
    matchingStations.forEach(station => {
        const option = document.createElement('option');
        option.value = station.station_name;
        dataList.appendChild(option);
    });
}

// ================================
// Function to handle station selection from drop-down
// ================================
function handleStationSelection() {
    const selectedStationName = document.getElementById('station-search').value;
    
    // Find the station that matches the selected name
    const selectedStation = stationsData.find(station => 
        station.station_name.toLowerCase() === selectedStationName.toLowerCase()
    );

    if (selectedStation) {
        // Center map on selected station
        centerMapOnStation(selectedStation.station_id);
    } else {
        // If no match found, reset to Washington Monument view
        map.setView([38.889484, -77.035278], 14);
    }
}

// Event Listener to Update Station Dropdown as User Types
document.getElementById('station-search').addEventListener('input', () => {
    updateStationDropdown();
});

// Event Listener to Handle Station Selection from the List
document.getElementById('station-search').addEventListener('change', () => {
    handleStationSelection();
});