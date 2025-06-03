// Debugging message to ensure map.js is loaded
console.log("map.js loaded successfully");

// Initialize the map, centered on Washington, DC with zoom level 16
const map = L.map('map').setView([38.898327, -77.027777], 16);

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

// Add this batch clearing function at the top with your other function definitions
function batchClearLayers() {
    const layersToClean = [
        markerGroup,
        hotelLayer,
        coffeeLayer,
        barsLayer,
        pharmacyLayer,
        restaurantsLayer
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
// Function to adjust icon sizes based on window width
// ================================

function getIconSize() {
    if (window.innerWidth <= 480) {
        return 28; // Increase size for very small screens
    } else if (window.innerWidth <= 768) {
        return 34; // Increase size for medium screens
    }
    return 30; // Larger icons for desktop
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

// Function to create a beer/bar icon
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

// Function to create a restaurant icon
function createRestaurantIcon() {
    return L.divIcon({
        html: `<i class="fas fa-utensils" style="font-size:${getIconSize()}px; color:orange;"></i>`,
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
const restaurantsLayer = L.layerGroup().addTo(map); // Layer for Restaurants
const transitLayer = L.layerGroup().addTo(map); // Layer for transit routes

// Base layers (we have only one)
const baseLayers = {};

// Overlay layers
const overlayLayers = {
    "Hotels": hotelLayer,
    "Coffee Shops": coffeeLayer,
    "Bars": barsLayer,
    "Pharmacies": pharmacyLayer,
    "Restaurants": restaurantsLayer,
    "Transit Routes": transitLayer
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
    
    // Add event listener to the toggle button
    document.getElementById('toggleLayerControl').addEventListener('click', () => {
        // Toggle the 'hidden' class on the layer control
        if (layerControlElement.classList.contains('hidden')) {
            layerControlElement.classList.remove('hidden');
            document.getElementById('toggleLayerControl').textContent = '☰ Hide Layers';
        } else {
            layerControlElement.classList.add('hidden');
            document.getElementById('toggleLayerControl').textContent = '☰ Show Layers';
        }
    });
    
    // Set initial button text
    document.getElementById('toggleLayerControl').textContent = '☰ Hide Layers';
}, 500); // Short delay to ensure the control has been added

// Add responsive behavior - only show toggle on mobile
function updateToggleButtonVisibility() {
    const toggleButton = document.getElementById('toggleLayerControl');
    if (window.innerWidth <= 768) { // Mobile breakpoint
        toggleButton.style.display = 'block';
    } else {
        toggleButton.style.display = 'none';
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
        restaurantsData = restaurants; // Store restaurants data
        filterAndDisplayAmenities(); // Initial display based on any existing search
    })
    .catch(error => console.error("Error fetching restaurants:", error));

// ================================
// Fetch and add transit routes GeoJSON
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
// Function to filter and display only the selected line
// ================================
function filterTransitRoutes(lineQuery) {
    // Normalize the lineQuery to uppercase for comparison with route_id
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
// Function to add amenities markers
// ================================
function addAmenitiesMarkers(filteredStations) {
    // Clear existing amenities layers
    hotelLayer.clearLayers();
    coffeeLayer.clearLayers();
    barsLayer.clearLayers();
    pharmacyLayer.clearLayers();
    restaurantsLayer.clearLayers();

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

            if (typeof lat === 'number' && typeof lon === 'number') {
                L.marker([lat, lon], {
                    icon: createFontAwesomeIcon('fas fa-bed', 'blue')
                })
                .addTo(hotelLayer)
                .bindPopup(`<b>${name}</b><br><a href="${website}" target="_blank">Website</a>`);
            }
        });

        // Add Coffee Shops
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

        // Add Bars
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

        // Add Pharmacies
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

        // Add Restaurants
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

    // If no search query, set the zoom to 16 by default on initial load
    if (!stationQuery && !lineQuery) {
        map.setView([38.898327, -77.027777], 16); // Force zoom to 16 on initial load
    }
}

// ================================
// Function to filter and display amenities based on search
// (Called after fetching amenities data)
// ================================
function filterAndDisplayAmenities() {
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
    
    // Batch clear all layers
    batchClearLayers();
    
    // Reset map view with smooth animation
    requestAnimationFrame(() => {
        map.setView([38.898327, -77.027777], 16);
    });

    // Use debounced functions for heavy operations
    const debouncedReset = debounce(() => {
        filterAndDisplayMarkers();
        filterTransitRoutes('');
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
        // If no match found, clear the map view
        map.setView([38.898327, -77.027777], 16);
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