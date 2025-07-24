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

function filterTransitRoutes(lineQuery) {
    console.log('filterTransitRoutes called with:', lineQuery);
    
    // Wait for map to be loaded
    if (!map.loaded()) {
        map.on('load', () => filterTransitRoutes(lineQuery));
        return;
    }
    
    // Define which layers belong to each line based on your actual style.json
    const lineLayerMap = {
        'Red': ['composite', 'routes-casing'],
        'Silver': ['composite', 'routes-casing'], 
        'Yellow': ['composite', 'routes-casing'],
        'Blue': ['routes-blue', 'routes-blue-casing'],
        'Green': ['routes-blue', 'routes-blue-casing'],
        'Orange': ['routes-orange', 'routes-orange-casing'],
        'MARC': ['routes-rail'],
        'VRE': ['routes-rail']
    };
    
    // All metro/rail layers
    const allTransitLayers = [
        'routes-rail',
        'routes-casing',
        'routes-blue-casing',
        'routes-orange-casing', 
        'routes-orange',
        'routes-blue',
        'composite'
    ];
    
    // If no line selected or "All Lines" selected, show all metro lines
    if (!lineQuery || lineQuery === '' || lineQuery === 'All Lines') {
        console.log('Showing all metro lines');
        
        // Show all layers and restore their original filters from the style
        allTransitLayers.forEach(layerId => {
            if (map.getLayer(layerId)) {
                map.setLayoutProperty(layerId, 'visibility', 'visible');
                
                // Restore original filters from your style.json
                try {
                    if (layerId === 'routes-rail') {
                        // Original filter: exclude the 6 main metro lines
                        const originalFilter = [
                            "match",
                            ["get", "route_name"],
                            ["Blue", "Green", "Orange", "Yellow", "Silver", "Red"],
                            false,
                            true
                        ];
                        map.setFilter(layerId, originalFilter);
                    } else if (layerId === 'routes-casing') {
                        // Original filter: Red, Silver, Yellow only
                        const originalFilter = [
                            "match",
                            ["get", "route_name"],
                            ["Red", "Silver", "Yellow"],
                            true,
                            false
                        ];
                        map.setFilter(layerId, originalFilter);
                    } else if (layerId === 'routes-blue-casing' || layerId === 'routes-blue') {
                        // Original filter: Blue, Green only
                        const originalFilter = [
                            "match",
                            ["get", "route_name"],
                            ["Blue", "Green"],
                            true,
                            false
                        ];
                        map.setFilter(layerId, originalFilter);
                    } else if (layerId === 'routes-orange-casing' || layerId === 'routes-orange') {
                        // Original filter: Orange only
                        const originalFilter = [
                            "match",
                            ["get", "route_name"],
                            ["Orange"],
                            true,
                            false
                        ];
                        map.setFilter(layerId, originalFilter);
                    } else if (layerId === 'composite') {
                        // Original filter: Yellow, Silver, Red only
                        const originalFilter = [
                            "match",
                            ["get", "route_name"],
                            ["Yellow", "Silver", "Red"],
                            true,
                            false
                        ];
                        map.setFilter(layerId, originalFilter);
                    }
                    console.log(`✓ Restored original filter for ${layerId}`);
                } catch (error) {
                    console.warn(`Could not restore filter for ${layerId}:`, error);
                }
            }
        });
        
        // FIXED: Restore original station filter to prevent duplication
        if (map.getLayer('stations')) {
            try {
                // Instead of clearing the filter completely, restore a sensible default
                // This filter should only show stations that have actual station data
                const defaultStationFilter = [
                    "all",
                    ["has", "station_name"],           // Must have a station name
                    ["!=", ["get", "station_name"], ""], // Station name can't be empty
                    ["has", "station_line"]            // Must have a line designation
                ];
                
                map.setFilter('stations', defaultStationFilter);
                map.setLayoutProperty('stations', 'visibility', 'visible');
                console.log('✓ Applied default station filter to prevent duplication');
            } catch (error) {
                console.warn('Could not apply default station filter:', error);
                // If the default filter fails, try removing the filter but this might cause duplication
                map.setFilter('stations', null);
                map.setLayoutProperty('stations', 'visibility', 'visible');
            }
        }
        return;
    }
    
    console.log('Filtering for line:', lineQuery);
    
    // Get the layers for the selected line
    const selectedLineLayers = lineLayerMap[lineQuery] || [];
    
    if (selectedLineLayers.length === 0) {
        console.warn(`No layers defined for line: ${lineQuery}`);
        return;
    }
    
    // MARC/VRE DEBUG: Add extra logging for these lines
    if (lineQuery === 'MARC' || lineQuery === 'VRE') {
        console.log(`🚂 Debugging ${lineQuery} line:`);
        console.log('Selected layers:', selectedLineLayers);
        
        // Check if routes-rail layer exists and has data
        if (map.getLayer('routes-rail')) {
            const features = map.querySourceFeatures('composite', {
                sourceLayer: 'routes-d6fbbz'
            });
            console.log('Total route features found:', features.length);
            
            const marcVreFeatures = features.filter(f => 
                f.properties.route_name === 'MARC' || f.properties.route_name === 'VRE'
            );
            console.log('MARC/VRE features found:', marcVreFeatures.length);
            
            if (marcVreFeatures.length > 0) {
                console.log('Sample MARC/VRE feature:', marcVreFeatures[0].properties);
            }
        }
    }
    
    // Show/hide layers based on selection
    allTransitLayers.forEach(layerId => {
        if (map.getLayer(layerId)) {
            
            // Show selected line layers, hide others
            if (selectedLineLayers.includes(layerId)) {
                map.setLayoutProperty(layerId, 'visibility', 'visible');
                console.log(`✓ Showing ${layerId} for ${lineQuery}`);
                
                // Apply data filter to show only the selected line
                try {
                    const filter = ['==', ['get', 'route_name'], lineQuery];
                    map.setFilter(layerId, filter);
                    console.log(`✓ Applied filter to ${layerId}:`, filter);
                } catch (error) {
                    console.warn(`Could not filter ${layerId}:`, error);
                }
                
            } else {
                map.setLayoutProperty(layerId, 'visibility', 'none');
                console.log(`✓ Hiding ${layerId}`);
            }
        }
    });
    
    // Filter stations to show those that serve the selected line (including multi-line stations)
    if (map.getLayer('stations')) {
        console.log('Filtering stations for line:', lineQuery);
        try {
            // Use "in" operator to check if the line appears anywhere in the station_line field
            const stationFilter = [
                "all",
                ["has", "station_name"],                                    // Must have station name
                ["!=", ["get", "station_name"], ""],                       // Station name can't be empty
                ["has", "station_line"],                                   // Must have line designation
                [
                    "any",
                    ["in", lineQuery, ["get", "station_line"]],           // Check if line name is in the field
                    ["==", ["get", "station_line"], lineQuery],           // Exact match for single-line stations
                    ["in", lineQuery.toLowerCase(), ["downcase", ["get", "station_line"]]] // Case-insensitive check
                ]
            ];
            
            map.setFilter('stations', stationFilter);
            map.setLayoutProperty('stations', 'visibility', 'visible');
            console.log('✓ Applied station filter for', lineQuery);
            
        } catch (error) {
            console.warn('✗ Station filtering failed:', error);
            
            // Fallback: try simple exact match with basic validation
            try {
                const simpleFilter = [
                    "all",
                    ["has", "station_name"],
                    ["==", ["get", "station_line"], lineQuery]
                ];
                map.setFilter('stations', simpleFilter);
                map.setLayoutProperty('stations', 'visibility', 'visible');
                console.log('✓ Applied simple station filter for', lineQuery);
            } catch (fallbackError) {
                console.warn('✗ All station filtering failed:', fallbackError);
            }
        }
    }
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

// ================================
// LINE DROPDOWN EVENT LISTENERS (ADD THIS TO THE END)
// ================================

// Function to handle line selection from dropdown
function handleLineSelection() {
    const selectedLine = document.getElementById('line-search').value;
    console.log('Line selected:', selectedLine);
    
    // Save the selection to localStorage (so it persists on refresh)
    localStorage.setItem('lineQuery', selectedLine);
    
    // Apply the filtering immediately
    filterTransitRoutes(selectedLine);
}

// Event Listener for Line Selection
document.addEventListener('DOMContentLoaded', () => {
    const lineDropdown = document.getElementById('line-search');
    
    if (lineDropdown) {
        // Listen for changes to the line dropdown
        lineDropdown.addEventListener('change', handleLineSelection);
        
        // Also listen for input events (in case it's a text input with datalist)
        lineDropdown.addEventListener('input', handleLineSelection);
        
        console.log('✅ Line dropdown event listeners added');
    } else {
        console.warn('⚠️ Line dropdown element not found. Make sure element has id="line-search"');
    }
});

// Alternative approach if DOMContentLoaded already fired
window.addEventListener('load', () => {
    const lineDropdown = document.getElementById('line-search');
    
    if (lineDropdown && !lineDropdown.hasAttribute('data-listener-added')) {
        lineDropdown.addEventListener('change', handleLineSelection);
        lineDropdown.addEventListener('input', handleLineSelection);
        lineDropdown.setAttribute('data-listener-added', 'true');
        console.log('✅ Line dropdown event listeners added (on window load)');
    }
});

// ================================
// ENHANCED LINE-BASED POI FILTERING
// ================================

// Function to get all stations that serve a particular line
function getStationsForLine(lineQuery) {
    if (!lineQuery || lineQuery === '' || lineQuery === 'All Lines') {
        return []; // Return empty array to show all POIs
    }
    
    // Filter stations that serve the selected line
    // This handles both single-line and multi-line stations
    return stationsData.filter(station => {
        if (!station.station_line) return false;
        
        const stationLines = station.station_line.toLowerCase();
        const searchLine = lineQuery.toLowerCase();
        
        // Check if the line appears in the station's line designation
        return stationLines.includes(searchLine) || 
               stationLines === searchLine;
    });
}

// Function to create a combined filter that includes BOTH POI type AND line filtering
function createCombinedPOIFilter(layerId, lineQuery) {
    // Define the field name that identifies each POI type based on layer
    const poiTypeFilters = {
        'hotels': ['has', 'hotel_name'],
        'restaurant': ['has', 'restaurant_name'], 
        'coffee': ['has', 'coffee_name'],
        'nightlife': ['has', 'bar_name'],
        'pharmacy': ['has', 'pharmacy_name'],
        'supermarkets': ['has', 'supermarket_name'],
        'museums': ['has', 'museum_name']
    };
    
    // Get the POI type filter for this layer
    const typeFilter = poiTypeFilters[layerId];
    if (!typeFilter) {
        console.warn(`No POI type filter defined for layer: ${layerId}`);
        return null;
    }
    
    // If no line selected or "All Lines", just use the POI type filter
    if (!lineQuery || lineQuery === '' || lineQuery === 'All Lines') {
        return typeFilter;
    }
    
    // Get stations that serve this line
    const stationsForLine = getStationsForLine(lineQuery);
    
    if (stationsForLine.length === 0) {
        console.warn(`No stations found for line: ${lineQuery}`);
        // Return a filter that shows nothing but maintains POI type
        return ['all', typeFilter, ['==', ['get', 'station_name'], 'NO_STATIONS_FOUND']];
    }
    
    // Extract station names
    const stationNames = stationsForLine.map(station => station.station_name);
    
    console.log(`Found ${stationNames.length} stations for ${lineQuery} line:`, stationNames);
    
    // Create station filter
    let stationFilter;
    if (stationNames.length === 1) {
        stationFilter = ['==', ['get', 'station_name'], stationNames[0]];
    } else {
        stationFilter = ['in', ['get', 'station_name'], ['literal', stationNames]];
    }
    
    // Combine POI type filter AND station filter using 'all' operator
    return ['all', typeFilter, stationFilter];
}

// Enhanced version of filterTransitRoutes that also filters POIs
function filterTransitRoutes(lineQuery) {
    console.log('Enhanced filterTransitRoutes called with:', lineQuery);
    
    // Wait for map to be loaded
    if (!map.loaded()) {
        map.on('load', () => filterTransitRoutes(lineQuery));
        return;
    }
    
    // ================================
    // EXISTING TRANSIT LINE FILTERING (unchanged)
    // ================================
    
    // Define which layers belong to each line based on your actual style.json
    const lineLayerMap = {
        'Red': ['composite', 'routes-casing'],
        'Silver': ['composite', 'routes-casing'], 
        'Yellow': ['composite', 'routes-casing'],
        'Blue': ['routes-blue', 'routes-blue-casing'],
        'Green': ['routes-blue', 'routes-blue-casing'],
        'Orange': ['routes-orange', 'routes-orange-casing'],
        'MARC': ['routes-rail'],
        'VRE': ['routes-rail']
    };
    
    // All metro/rail layers
    const allTransitLayers = [
        'routes-rail',
        'routes-casing',
        'routes-blue-casing',
        'routes-orange-casing', 
        'routes-orange',
        'routes-blue',
        'composite'
    ];
    
    // If no line selected or "All Lines" selected, show all metro lines
    if (!lineQuery || lineQuery === '' || lineQuery === 'All Lines') {
        console.log('Showing all metro lines and all POIs');
        
        // Show all transit layers and restore their original filters
        allTransitLayers.forEach(layerId => {
            if (map.getLayer(layerId)) {
                map.setLayoutProperty(layerId, 'visibility', 'visible');
                
                // Restore original filters from your style.json
                try {
                    if (layerId === 'routes-rail') {
                        const originalFilter = [
                            "match",
                            ["get", "route_name"],
                            ["Blue", "Green", "Orange", "Yellow", "Silver", "Red"],
                            false,
                            true
                        ];
                        map.setFilter(layerId, originalFilter);
                    } else if (layerId === 'routes-casing') {
                        const originalFilter = [
                            "match",
                            ["get", "route_name"],
                            ["Red", "Silver", "Yellow"],
                            true,
                            false
                        ];
                        map.setFilter(layerId, originalFilter);
                    } else if (layerId === 'routes-blue-casing' || layerId === 'routes-blue') {
                        const originalFilter = [
                            "match",
                            ["get", "route_name"],
                            ["Blue", "Green"],
                            true,
                            false
                        ];
                        map.setFilter(layerId, originalFilter);
                    } else if (layerId === 'routes-orange-casing' || layerId === 'routes-orange') {
                        const originalFilter = [
                            "match",
                            ["get", "route_name"],
                            ["Orange"],
                            true,
                            false
                        ];
                        map.setFilter(layerId, originalFilter);
                    } else if (layerId === 'composite') {
                        const originalFilter = [
                            "match",
                            ["get", "route_name"],
                            ["Yellow", "Silver", "Red"],
                            true,
                            false
                        ];
                        map.setFilter(layerId, originalFilter);
                    }
                    console.log(`✓ Restored original filter for ${layerId}`);
                } catch (error) {
                    console.warn(`Could not restore filter for ${layerId}:`, error);
                }
            }
        });
        
        // Restore original station filter
        if (map.getLayer('stations')) {
            try {
                const defaultStationFilter = [
                    "all",
                    ["has", "station_name"],
                    ["!=", ["get", "station_name"], ""],
                    ["has", "station_line"]
                ];
                
                map.setFilter('stations', defaultStationFilter);
                map.setLayoutProperty('stations', 'visibility', 'visible');
                console.log('✓ Applied default station filter');
            } catch (error) {
                console.warn('Could not apply default station filter:', error);
                map.setFilter('stations', null);
                map.setLayoutProperty('stations', 'visibility', 'visible');
            }
        }
        
        // ================================
        // NEW: Remove POI filters to show all POIs with their type filters
        // ================================
        filterPOIsForLine(null);
        return;
    }
    
    console.log('Filtering for line:', lineQuery);
    
    // Get the layers for the selected line
    const selectedLineLayers = lineLayerMap[lineQuery] || [];
    
    if (selectedLineLayers.length === 0) {
        console.warn(`No layers defined for line: ${lineQuery}`);
        return;
    }
    
    // Show/hide transit layers based on selection
    allTransitLayers.forEach(layerId => {
        if (map.getLayer(layerId)) {
            
            // Show selected line layers, hide others
            if (selectedLineLayers.includes(layerId)) {
                map.setLayoutProperty(layerId, 'visibility', 'visible');
                console.log(`✓ Showing ${layerId} for ${lineQuery}`);
                
                // Apply data filter to show only the selected line
                try {
                    const filter = ['==', ['get', 'route_name'], lineQuery];
                    map.setFilter(layerId, filter);
                    console.log(`✓ Applied filter to ${layerId}:`, filter);
                } catch (error) {
                    console.warn(`Could not filter ${layerId}:`, error);
                }
                
            } else {
                map.setLayoutProperty(layerId, 'visibility', 'none');
                console.log(`✓ Hiding ${layerId}`);
            }
        }
    });
    
    // Filter stations to show those that serve the selected line
    if (map.getLayer('stations')) {
        console.log('Filtering stations for line:', lineQuery);
        try {
            const stationFilter = [
                "all",
                ["has", "station_name"],
                ["!=", ["get", "station_name"], ""],
                ["has", "station_line"],
                [
                    "any",
                    ["in", lineQuery, ["get", "station_line"]],
                    ["==", ["get", "station_line"], lineQuery],
                    ["in", lineQuery.toLowerCase(), ["downcase", ["get", "station_line"]]]
                ]
            ];
            
            map.setFilter('stations', stationFilter);
            map.setLayoutProperty('stations', 'visibility', 'visible');
            console.log('✓ Applied station filter for', lineQuery);
            
        } catch (error) {
            console.warn('✗ Station filtering failed:', error);
            
            try {
                const simpleFilter = [
                    "all",
                    ["has", "station_name"],
                    ["==", ["get", "station_line"], lineQuery]
                ];
                map.setFilter('stations', simpleFilter);
                map.setLayoutProperty('stations', 'visibility', 'visible');
                console.log('✓ Applied simple station filter for', lineQuery);
            } catch (fallbackError) {
                console.warn('✗ All station filtering failed:', fallbackError);
            }
        }
    }
    
    // ================================
    // NEW: Filter POIs for the selected line
    // ================================
    filterPOIsForLine(lineQuery);
}

// Function to filter all POI layers based on selected transit line
function filterPOIsForLine(lineQuery) {
    console.log('Filtering POIs for line:', lineQuery || 'All Lines');
    
    // Define all POI layers
    const poiLayers = ['pharmacy', 'supermarkets', 'nightlife', 'coffee', 'restaurant', 'hotels', 'museums'];
    
    // Apply the combined filter to each POI layer
    poiLayers.forEach(layerId => {
        if (map.getLayer(layerId)) {
            try {
                // Check if layer is currently visible (respects user's layer toggles)
                const currentVisibility = map.getLayoutProperty(layerId, 'visibility');
                
                if (currentVisibility === 'visible' || currentVisibility === undefined) {
                    // Create combined filter that includes BOTH POI type AND line filtering
                    const combinedFilter = createCombinedPOIFilter(layerId, lineQuery);
                    
                    // Apply the combined filter
                    map.setFilter(layerId, combinedFilter);
                    
                    if (!lineQuery || lineQuery === 'All Lines') {
                        console.log(`✓ Showing all ${layerId} POIs with type filter`);
                    } else {
                        console.log(`✓ Applied combined filter to ${layerId} for line: ${lineQuery}`);
                    }
                } else {
                    console.log(`⚪ Skipping ${layerId} (layer hidden by user)`);
                }
                
            } catch (error) {
                console.warn(`Could not filter ${layerId}:`, error);
            }
        } else {
            console.log(`⚠️ Layer ${layerId} not found in map`);
        }
    });
    
    // Provide user feedback
    if (lineQuery && lineQuery !== 'All Lines') {
        const stationsForLine = getStationsForLine(lineQuery);
        console.log(`🎯 Showing POIs near ${stationsForLine.length} stations on the ${lineQuery} line`);
    } else {
        console.log('🌍 Showing all POIs');
    }
}

// Enhanced layer toggle function that preserves line filtering
function enhancedLayerToggle() {
    const toggleableLayerIds = [
        'pharmacy', 'supermarkets', 'nightlife',
        'coffee', 'restaurant', 'hotels', 'museums'
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

        // Enhanced toggle that preserves line filtering
        link.onclick = function (e) {
            const clickedLayer = this.textContent;
            e.preventDefault();
            e.stopPropagation();

            const visibility = map.getLayoutProperty(clickedLayer, 'visibility');

            // Toggle layer visibility
            if (visibility === 'visible') {
                map.setLayoutProperty(clickedLayer, 'visibility', 'none');
                this.className = '';
            } else {
                map.setLayoutProperty(clickedLayer, 'visibility', 'visible');
                this.className = 'active';
                
                // ================================
                // NEW: Reapply combined filter when layer is turned back on
                // ================================
                const currentLineQuery = localStorage.getItem('lineQuery') || '';
                const combinedFilter = createCombinedPOIFilter(clickedLayer, currentLineQuery);
                
                try {
                    map.setFilter(clickedLayer, combinedFilter);
                    console.log(`✓ Reapplied combined filter to ${clickedLayer}`);
                } catch (error) {
                    console.warn(`Could not reapply filter to ${clickedLayer}:`, error);
                }
            }
        };

        const layers = document.getElementById('map-menu');
        if (layers) {
            layers.appendChild(link);
        }
    }
    console.log('Enhanced layer toggles initialized with line filtering preservation');
}

// Replace the original layer toggle initialization
function initializeMapboxLayerToggles() {
    map.on('idle', enhancedLayerToggle);
}

// Debug function to test the filtering
function debugLineFiltering(testLine = 'Red') {
    console.log(`🔍 DEBUG: Testing filtering for ${testLine} line`);
    
    const stationsForLine = getStationsForLine(testLine);
    console.log(`Found ${stationsForLine.length} stations:`, stationsForLine.map(s => s.station_name));
    
    const combinedFilter = createCombinedPOIFilter('coffee', testLine);
    console.log('Generated combined filter for coffee:', combinedFilter);
    
    // Test the filter on coffee shops
    if (map.getLayer('coffee')) {
        try {
            map.setFilter('coffee', combinedFilter);
            console.log('✓ Applied test combined filter to coffee layer');
            
            // Count visible features (this is approximate)
            setTimeout(() => {
                const visibleFeatures = map.queryRenderedFeatures({ layers: ['coffee'] });
                console.log(`Visible coffee shops after filtering: ${visibleFeatures.length}`);
            }, 1000);
            
        } catch (error) {
            console.error('❌ Filter test failed:', error);
        }
    }
}

// Make debug function globally available
window.debugLineFiltering = debugLineFiltering;


