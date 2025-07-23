// Debugging message to ensure map.js is loaded
console.log("map.js loaded successfully");

// iOS-specific external link handler with multiple fallback methods
function openExternalLink(url) {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isSafari = /Safari/.test(navigator.userAgent) && !/CriOS|FxiOS|OPiOS|mercury/.test(navigator.userAgent);
    
    console.log('Opening external link:', url);
    console.log('Is iOS:', isIOS);
    console.log('Is Safari:', isSafari);
    
    if (isIOS && !isSafari) {
        // We're in an iOS WebView (like your app)
        tryIOSDeepLinks(url);
    } else {
        // Regular browser behavior
        tryRegularOpen(url);
    }
}
window.openExternalLink = openExternalLink;

function tryIOSDeepLinks(url) {
    console.log('Attempting iOS deep link methods...');
    
    // Method 1: Try Safari deep link
    setTimeout(() => {
        console.log('Trying Safari deep link...');
        window.location.href = `x-web-search://?${encodeURIComponent(url)}`;
    }, 100);
    
    // Method 2: Try direct Safari URL scheme after short delay
    setTimeout(() => {
        console.log('Trying direct Safari scheme...');
        window.location.href = `safari-${url}`;
    }, 500);
    
    // Method 3: Try the universal HTTP scheme
    setTimeout(() => {
        console.log('Trying HTTP scheme...');
        window.location.href = url;
    }, 1000);
    
    // Method 4: Fallback to copy after all attempts
    setTimeout(() => {
        console.log('All deep link methods attempted, falling back to copy...');
        copyToClipboard(url);
        showIOSCopyMessage(url);
    }, 2000);
}

function tryRegularOpen(url) {
    try {
        const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
        if (!newWindow || newWindow.closed) {
            copyToClipboard(url);
            alert('Pop-ups blocked. Link copied to clipboard!');
        }
    } catch (error) {
        copyToClipboard(url);
        alert('Unable to open link. Copied to clipboard!');
    }
}

// Enhanced popup creation with iOS-optimized messaging
function createWebViewFriendlyPopup(name, website) {
    if (website) {
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const buttonText = isIOS ? 'Open in Safari' : 'Visit Website';
        
        return `<b>${name}</b><br>
                <button onclick="openExternalLink('${website}')" style="background: #007cba; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer; font-size: 14px; margin: 2px;">
                    ${buttonText}
                </button><br>
                <button onclick="copyToClipboard('${website}')" style="background: #6c757d; color: white; border: none; padding: 6px 10px; border-radius: 4px; cursor: pointer; font-size: 12px; margin: 2px;">
                    Copy Link
                </button>`;
    } else {
        return `<b>${name}</b>`;
    }
}

// iOS-specific copy success message
function showIOSCopyMessage(url) {
    const messageDiv = document.createElement('div');
    messageDiv.innerHTML = `
        <div style="text-align: center;">
            <div style="font-size: 18px; margin-bottom: 10px;">📋</div>
            <div style="font-weight: bold; margin-bottom: 5px;">Link Copied!</div>
            <div style="font-size: 12px; color: #666;">Open Safari and paste to visit:</div>
            <div style="font-size: 11px; color: #007cba; word-break: break-all; margin-top: 5px;">${url}</div>
        </div>
    `;
    
    messageDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        color: black;
        padding: 20px;
        border-radius: 10px;
        z-index: 10000;
        font-size: 14px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        border: 1px solid #ddd;
        max-width: 300px;
        text-align: center;
    `;
    
    document.body.appendChild(messageDiv);
    
    // Remove after 4 seconds
    setTimeout(() => {
        if (document.body.contains(messageDiv)) {
            document.body.removeChild(messageDiv);
        }
    }, 4000);
    
    // Also allow tap to dismiss
    messageDiv.addEventListener('click', () => {
        if (document.body.contains(messageDiv)) {
            document.body.removeChild(messageDiv);
        }
    });
}

// Enhanced clipboard function with better error handling
function copyToClipboard(text) {
    try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => {
                console.log('Clipboard write successful');
            }).catch((err) => {
                console.log('Clipboard write failed, trying fallback...', err);
                fallbackCopy(text);
            });
        } else {
            fallbackCopy(text);
        }
    } catch (error) {
        console.log('Clipboard error:', error);
        fallbackCopy(text);
    }
}
window.copyToClipboard = copyToClipboard;

function fallbackCopy(text) {
    try {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (successful) {
            console.log('Fallback copy successful');
        } else {
            console.log('Fallback copy failed');
            // Last resort - show the URL in a prompt
            prompt('Copy this link:', text);
        }
    } catch (err) {
        console.log('Fallback copy error:', err);
        prompt('Copy this link:', text);
    }
}


// ================================
// MAPBOX GL JS MAP INITIALIZATION (UPDATED)
// ================================

// Initialize the Mapbox GL JS map
mapboxgl.accessToken = 'pk.eyJ1Ijoic3RhbWVuIiwiYSI6IlpkZEtuS1EifQ.jiH_c9ShtBwtqH9RdG40mw';

const map = new mapboxgl.Map({
    container: 'map-inner', // container ID
    style: 'mapbox://styles/stamen/cmd7pl9cl00yf01qncnjggdld/draft', // Your consultant's style
    center: [-77.0219, 38.8989], // starting position [lng, lat]
    zoom: 14 // starting zoom
});

// ================================
// Geolocation Feature Setup (UPDATED FOR MAPBOX GL JS)
// ================================

// Function to initialize geolocation tracking with Mapbox GL JS
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
                        console.log("Geolocation permission denied - continuing without location tracking");
                    }
                })
                .catch(error => {
                    console.warn("Permission query error:", error);
                    // Continue without geolocation instead of trying to start tracking
                    console.log("Continuing without geolocation");
                });
        } else {
            // For non-Android or older devices, proceed with standard tracking
            startTracking();
        }
    } else {
        console.warn("Geolocation is not supported by this browser - continuing without location tracking");
    }

    function startTracking() {
        const options = {
            enableHighAccuracy: true,
            maximumAge: 30000, // Allow cached position up to 30 seconds old
            timeout: 5000 // Reduced timeout to 5 seconds
        };

        navigator.geolocation.watchPosition(
            (position) => {
                console.log("Position retrieved:", position);
                const userLng = position.coords.longitude;
                const userLat = position.coords.latitude;

                // Add or update the user's location marker using Mapbox GL JS
                if (!window.userMarker) {
                    console.log("Creating a new location marker.");
                    // Create a Mapbox GL JS marker
                    const el = document.createElement('div');
                    el.innerHTML = '<i class="fas fa-map-marker-alt" style="font-size:24px; color:blue;"></i>';
                    el.style.width = '24px';
                    el.style.height = '24px';
                    
                    window.userMarker = new mapboxgl.Marker(el)
                        .setLngLat([userLng, userLat])
                        .addTo(map);
                } else {
                    console.log("Updating location marker position.");
                    window.userMarker.setLngLat([userLng, userLat]);
                }
            },
            (error) => {
                console.warn("Geolocation error (non-blocking):", error.message);
                // Don't show alerts or stop execution - just log the error and continue
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        console.log("User denied geolocation permission");
                        break;
                    case error.POSITION_UNAVAILABLE:
                        console.log("Position unavailable");
                        break;
                    case error.TIMEOUT:
                        console.log("Geolocation request timed out");
                        break;
                    default:
                        console.log("Unknown geolocation error");
                        break;
                }
            },
            options
        );
    }
}

// Call the geolocation function to start tracking after map loads
map.on('load', () => {
    trackUserLocation(map);
    initializeEnhancedPOIClicks(); // Add this line
});


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
// ================================
// Missing Functions - UPDATED FOR MAPBOX GL JS
// ================================

// Placeholder function for filtering and displaying markers
function filterAndDisplayMarkers() {
    console.log('filterAndDisplayMarkers called - integrate with Mapbox layers');
    // This should eventually interact with your consultant's Mapbox layers
    // For now, just dispatch an event that Mapbox code might listen for
    window.dispatchEvent(new CustomEvent('filterMarkers', {
        detail: getSearchParams()
    }));
}

// Placeholder function for filtering transit routes  
function filterTransitRoutes(lineQuery) {
    console.log('filterTransitRoutes called with:', lineQuery);
    // This should eventually filter Mapbox transit route layers
    // For now, just dispatch an event
    window.dispatchEvent(new CustomEvent('filterTransitRoutes', {
        detail: { lineQuery: lineQuery }
    }));
}

// Keep only these data variables for search functionality
let stationsData = [];      // Still needed for search
let museumsData = [];       // Keep if you want museums

// ================================
// Fetch and store stations (NEEDED FOR SEARCH)
// ================================
fetch('/api/stations')
    .then(response => {
        if (!response.ok) {
            throw new Error(`Network response was not ok (${response.statusText})`);
        }
        return response.json();
    })
    .then(stations => {
        console.log("Fetched Stations:", stations);
        stationsData = stations; // Store stations data for search
        // Don't call filterAndDisplayMarkers() - let Mapbox handle display
    })
    .catch(error => console.error("Error fetching stations:", error));

// ================================
// MAPBOX LAYER TOGGLE CONTROLS - WORKING VERSION
// ================================

function initializeMapboxLayerToggles() {
    map.on('idle', () => {
        // Enumerate ids of the layers.
        const toggleableLayerIds = [
            'pharmacy', 'supermarkets', 'nightlife',
            'coffee', 'restaurant', 'hotels'
        ];

        // Set up the corresponding toggle button for each layer.
        for (const id of toggleableLayerIds) {
            // Skip layers that already have a button set up.
            if (document.getElementById(id)) {
                continue;
            }

            // Create a link.
            const link = document.createElement('a');
            link.id = id;
            link.href = '#';
            link.textContent = id;
            link.className = 'active';

            // Show or hide layer when the toggle is clicked.
            link.onclick = function (e) {
                const clickedLayer = this.textContent;
                e.preventDefault();
                e.stopPropagation();

                const visibility = map.getLayoutProperty(
                    clickedLayer,
                    'visibility'
                );

                // Toggle layer visibility by changing the layout object's visibility property.
                if (visibility === 'visible') {
                    map.setLayoutProperty(clickedLayer, 'visibility', 'none');
                    this.className = '';
                } else {
                    this.className = 'active';
                    map.setLayoutProperty(
                        clickedLayer,
                        'visibility',
                        'visible'
                    );
                }
            };

            const layers = document.getElementById('map-menu');
            if (layers) {
                layers.appendChild(link);
            }
        }
        console.log('Layer toggles initialized');
    });
}

// Initialize the toggles
initializeMapboxLayerToggles();

// Add this section to your existing map.js file, after the map initialization
// ================================
// ENHANCED POI POPUP FUNCTIONALITY WITH WEBSITE LINKS
// ================================

// Function to create enhanced popups with clickable POI names
function createEnhancedPopup(layer, properties) {
    let popupContent = '<div style="max-width: 250px;">';
    
    // Determine the correct field names for each POI type
    let nameField, websiteField, distanceField;
    
    if (layer === 'hotels') {
        nameField = 'hotel_name';
        websiteField = 'hotel_website';
        distanceField = 'hotel_distance_miles';
    } else if (layer === 'restaurant') {
        nameField = 'restaurant_name';
        websiteField = 'restaurant_website';
        distanceField = 'restaurant_distance_miles';
    } else if (layer === 'coffee') {
        nameField = 'coffee_name';
        websiteField = 'coffee_website';
        distanceField = 'coffee_distance_miles';
    } else if (layer === 'nightlife') {
        nameField = 'bar_name';
        websiteField = 'bar_website';
        distanceField = 'bar_distance_miles';
    } else if (layer === 'pharmacy') {
        nameField = 'pharmacy_name';
        websiteField = 'pharmacy_website';
        distanceField = 'pharmacy_distance_miles';
    } else if (layer === 'supermarkets') {
        nameField = 'supermarket_name';
        websiteField = 'supermarket_website';
        distanceField = 'supermarket_distance_miles';
    } else if (layer === 'museums') {
        nameField = 'museum_name';
        websiteField = 'museum_website';
        distanceField = 'museum_distance_miles';
    } else {
        // Fallback for any other POI types
        nameField = 'name';
        websiteField = 'website';
        distanceField = 'distance_miles';
    }
    
    // Add the establishment name as clickable title (if website exists) or regular title
    if (properties[nameField]) {
        if (properties[websiteField]) {
            // Make the name clickable if website exists
            let websiteUrl = properties[websiteField];
            
            // Ensure the URL has a protocol (add https:// if missing)
            if (!websiteUrl.startsWith('http://') && !websiteUrl.startsWith('https://')) {
                websiteUrl = 'https://' + websiteUrl;
            }
            
            popupContent += `<h3 style="margin: 0 0 8px 0; color: #333; font-size: 16px;">
                <a href="#" onclick="openExternalLink('${websiteUrl}'); return false;" 
                   style="color: #007cba; text-decoration: none; cursor: pointer;">
                    ${properties[nameField]}
                </a>
            </h3>`;
        } else {
            // Regular title if no website
            popupContent += `<h3 style="margin: 0 0 8px 0; color: #333; font-size: 16px;">
                ${properties[nameField]}
            </h3>`;
        }
    }
    
    // Show distance from nearest metro station
    if (properties[distanceField]) {
        const distance = parseFloat(properties[distanceField]);
        popupContent += `<p style="margin: 4px 0; color: #666; font-size: 13px;">
            <strong>Distance:</strong> ${distance} miles from metro
        </p>`;
    }
    
    // Show which metro station this POI is closest to
    if (properties.station_name) {
        popupContent += `<p style="margin: 4px 0; color: #666; font-size: 13px;">
            <strong>Nearest Metro:</strong> ${properties.station_name}
        </p>`;
    }
    
    popupContent += '</div>';
    return popupContent;
}

// Function to initialize enhanced POI click events
function initializeEnhancedPOIClicks() {
    map.on('idle', () => {
        const poiLayers = ['pharmacy', 'supermarkets', 'nightlife', 'coffee', 'restaurant', 'hotels', 'museums'];
        
        poiLayers.forEach(function(layer) {
            // Remove any existing click handlers to avoid duplicates
            map.off('click', layer);
            
            // Add enhanced click event handler
            map.on('click', layer, function(e) {
                const properties = e.features[0].properties;
                const popupContent = createEnhancedPopup(layer, properties);
                
                new mapboxgl.Popup()
                    .setLngLat(e.lngLat)
                    .setHTML(popupContent)
                    .addTo(map);
            });
            
            // Change cursor on hover
            map.on('mouseenter', layer, function() {
                map.getCanvas().style.cursor = 'pointer';
            });
            
            map.on('mouseleave', layer, function() {
                map.getCanvas().style.cursor = '';
            });
        });
        
        console.log('Enhanced POI click events initialized');
    });
}


// ================================
// STATION CLICK EVENTS (Optional enhancement)
// ================================

// Function to add click events for metro stations
function initializeStationClicks() {
    map.on('idle', () => {
        // Check if stations layer exists
        if (map.getLayer('stations')) {
            map.on('click', 'stations', function(e) {
                const properties = e.features[0].properties;
                const popupContent = `
                    <div style="max-width: 200px;">
                        <h3 style="margin: 0 0 8px 0; color: #333; font-size: 16px;">
                            ${properties.station_name}
                        </h3>
                        <p style="margin: 4px 0; color: #666; font-size: 13px;">
                            <strong>Line:</strong> ${properties.station_line || 'Metro Station'}
                        </p>
                    </div>
                `;
                
                new mapboxgl.Popup()
                    .setLngLat(e.lngLat)
                    .setHTML(popupContent)
                    .addTo(map);
            });
            
            // Add hover effects for stations
            map.on('mouseenter', 'stations', function() {
                map.getCanvas().style.cursor = 'pointer';
            });
            
            map.on('mouseleave', 'stations', function() {
                map.getCanvas().style.cursor = '';
            });
        }
    });
}

// Initialize station clicks
initializeStationClicks();


// ================================
// Function to filter and display amenities based on search
// (Called after fetching amenities data) - UPDATED FOR MAPBOX
// ================================
function filterAndDisplayAmenities() {
    // Store current map view to preserve it
    const currentCenter = map.getCenter();
    const currentZoom = map.getZoom();
    
    // This function is now called when users toggle layers on/off
    // It will only display amenities for layers that are currently enabled
    filterAndDisplayMarkers();
    
    // Restore the map view after filtering - Updated for Mapbox GL JS
    map.setCenter(currentCenter);
    map.setZoom(currentZoom);
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
    // Transit routes are handled by consultant's Mapbox map
    console.log('Search updated - letting Mapbox handle display');
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
// Function to center map on a selected station - UPDATED FOR MAPBOX GL JS
// ================================
function centerMapOnStation(stationId) {
    const station = stationsData.find(s => String(s.station_id) === String(stationId));
    if (station) {
        // Updated for Mapbox GL JS - uses flyTo method
        map.flyTo({
            center: [station.station_lon, station.station_lat], // Note: Mapbox uses [lng, lat]
            zoom: 16
        });
        console.log(`Map centered on station: ${station.station_name}`);
    } else {
        console.warn(`Station with ID ${stationId} not found.`);
    }
}

// Make the function globally accessible
window.centerMapOnStation = centerMapOnStation;

// ================================
// Function to clear search and reset map view - UPDATED FOR MAPBOX GL JS
// ================================
function clearSearch() {
    // Remove station and line queries from local storage
    localStorage.removeItem('stationQuery');
    localStorage.removeItem('lineQuery');
    
    // Clear search inputs (with safety checks)
    const stationInput = document.getElementById('station-search');
    const lineInput = document.getElementById('line-search');
    
    if (stationInput) stationInput.value = '';
    if (lineInput) lineInput.value = '';
    
    // Reset map view - centered on Washington Monument - Updated for Mapbox GL JS
    map.flyTo({
        center: [-77.035278, 38.889484], // Note: Mapbox uses [lng, lat]
        zoom: 14
    });
    
    // Reset transit routes to show all
    filterTransitRoutes('');
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
        map.flyTo({
            center: [-77.035278, 38.889484],
            zoom: 14
        });
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