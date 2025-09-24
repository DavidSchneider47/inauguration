// Debugging message to ensure map.js is loaded
console.log("map.js loaded successfully");

// NEW: Simplified and more reliable external link handler
function openExternalLink(url) {
    console.log('Opening external link:', url);
    
    // Ensure URL has proper protocol
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
    }
    
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // ENHANCED: Better detection for your published mobile app
    if (isMobile && isRunningInApp()) {
        console.log('Mobile app detected: Opening in same window to avoid iOS Safari issue');
        // Open in same window - this keeps users in your app's WebView
        window.location.href = url;
        return;
    }
    
    // OPTIMIZED: Different strategies for mobile vs desktop
    if (isMobile) {
        // Mobile-optimized approach - faster and more reliable
        try {
            // Try window.open with mobile-friendly parameters
            const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
            
            // Quick check if it worked (don't wait long)
            if (newWindow && !newWindow.closed) {
                console.log('Mobile: Link opened successfully');
                return;
            }
            
            // Immediate fallback for mobile
            console.log('Mobile: Using direct navigation');
            window.location.href = url;
            
        } catch (error) {
            console.log('Mobile: Error, using direct navigation:', error);
            window.location.href = url;
        }
    } else {
        // Desktop approach (more thorough checking)
        try {
            const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
            
            if (!newWindow || newWindow.closed || typeof newWindow.closed == 'undefined') {
                console.log('Desktop: Popup blocked, trying fallback...');
                fallbackToDirectNavigation(url);
            } else {
                console.log('Desktop: Link opened successfully in new window');
            }
        } catch (error) {
            console.log('Desktop: Window.open failed, trying fallback:', error);
            fallbackToDirectNavigation(url);
        }
    }
}

window.openExternalLink = openExternalLink;

// Detect if running inside your published mobile app's WebView
function isRunningInApp() {
    const userAgent = navigator.userAgent.toLowerCase();
    
    // Check for mobile app WebView indicators
    return (
        // Android app WebView
        userAgent.includes('wv') ||
        // iOS app WebView 
        (userAgent.includes('mobile/') && !userAgent.includes('safari')) ||
        // iOS standalone mode
        window.navigator.standalone === true ||
        // Missing typical browser features
        typeof window.chrome === 'undefined' && typeof window.safari === 'undefined'
    );
}

// NEW: User-friendly fallback navigation
function fallbackToDirectNavigation(url) {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
        if (isRunningInApp()) {
            // RUNNING IN YOUR PUBLISHED APP
            const userWantsToLeave = confirm(
                'This will open in your device browser. You can return to MetroMatch by switching back to the app.\n\nOpen website?'
            );
            
            if (userWantsToLeave) {
                // Try to force opening in system browser
                window.open(url, '_system') || window.open(url, '_blank');
            }
        } else {
            // RUNNING IN MOBILE BROWSER (Safari/Chrome)
            // Your existing fast code
            try {
                if (window.open) {
                    const newWindow = window.open(url, '_blank', 'noopener');
                    if (newWindow) {
                        console.log('Mobile: Opened in new tab successfully');
                        return;
                    }
                }
                console.log('Mobile: Direct navigation fallback');
                window.location.href = url;
            } catch (error) {
                console.log('Mobile navigation error:', error);
                if (confirm('Open external link?')) {
                    window.location.href = url;
                }
            }
        }
    } else {
        // Desktop behavior (unchanged)
        const userChoice = confirm(
            'Unable to open link in new window. Would you like to:\n\nOK = Go to the link now (you can use back button to return)\nCancel = Copy link to clipboard'
        );
        
        if (userChoice) {
            window.location.href = url;
        } else {
            copyToClipboard(url);
        }
    }
}

// NEW: Simplified popup creation function
function createWebViewFriendlyPopup(name, website) {
    if (website) {
        return `<b>${name}</b><br>
                <button onclick="openExternalLink('${website}')" style="background: #007cba; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer; font-size: 14px; margin: 2px;">
                    Visit Website
                </button><br>
                <button onclick="copyToClipboard('${website}')" style="background: #6c757d; color: white; border: none; padding: 6px 10px; border-radius: 4px; cursor: pointer; font-size: 12px; margin: 2px;">
                    Copy Link
                </button>`;
    } else {
        return `<b>${name}</b>`;
    }
}

// NEW: Simplified clipboard function
function copyToClipboard(text) {
    try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => {
                console.log('Clipboard write successful');
            }).catch((err) => {
                console.log('Clipboard write failed:', err);
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
        console.log('Fllback copy error:', err);
        prompt('Copy this link:', text);
    }
}


// ================================
// MAPBOX GL JS MAP INITIALIZATION (UPDATED)
// ================================

// Initialize the Mapbox GL JS map
mapboxgl.accessToken = 'pk.eyJ1Ijoic2NobmVpZGVyZDQxIiwiYSI6ImNtNmt4N3Q3ajAyeGsya3B5bzliYWp6Z2cifQ.bk-MyCYaco0t569bZog7cA';

const map = new mapboxgl.Map({
    container: 'map-inner', // container ID
    style: 'mapbox://styles/schneiderd41/cmdf6hejb01jq01qnex6kg3v2', 
    center: [-77.0219, 38.8989], // starting position [lng, lat]
    zoom: 14, // starting zoom
    attributionControl: false
    })
    .addControl(new mapboxgl.AttributionControl({
        customAttribution: '© <a href="https://www.stamen.com">Stamen Design | </a>'
    }));
    
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
// POI FAVORITES SYSTEM - FIXED VERSION
// ================================

// Favorites management functions
const POIFavorites = {
    storageKey: 'poi_favorites',
    
    // FIXED: More reliable ID creation using name + layer + rounded coordinates
    createId(layer, properties, lngLat) {
        const nameField = this.getNameField(layer);
        const name = properties[nameField] || 'Unknown';
        
        // Use the name as primary identifier + layer + rounded coordinates
        // Round coordinates to 4 decimal places for consistency (~11m precision)
        const sanitizedName = name.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
        const roundedLng = Math.round(lngLat[0] * 10000) / 10000;
        const roundedLat = Math.round(lngLat[1] * 10000) / 10000;
        
        return `${layer}_${sanitizedName}_${roundedLng}_${roundedLat}`;
    },
    
    // Get the correct name field for each layer
    getNameField(layer) {
        const fieldMap = {
            'hotels': 'hotel_name',
            'restaurant': 'restaurant_name',
            'coffee': 'coffee_name',
            'nightlife': 'bar_name',
            'pharmacy': 'pharmacy_name',
            'supermarkets': 'supermarket_name',
            'museums': 'museum_name'
        };
        return fieldMap[layer] || 'name';
    },
    
    // Get all favorites from localStorage
    getFavorites() {
        try {
            return JSON.parse(localStorage.getItem(this.storageKey) || '{}');
        } catch (error) {
            console.warn('Error loading favorites:', error);
            return {};
        }
    },
    
    // FIXED: More robust favorite checking with fallback search
    isFavorited(layer, properties, lngLat) {
        const id = this.createId(layer, properties, lngLat);
        const favorites = this.getFavorites();
        
        // Direct ID match
        if (favorites.hasOwnProperty(id)) {
            console.log(`✅ Direct match found for ID: ${id}`);
            return true;
        }
        
        // Fallback: search by name and layer (in case of coordinate differences)
        const nameField = this.getNameField(layer);
        const poiName = properties[nameField];
        
        if (poiName) {
            const matchingFavorites = Object.values(favorites).filter(fav => 
                fav.layer === layer && 
                fav.name === poiName
            );
            
            if (matchingFavorites.length > 0) {
                console.log(`✅ Name-based match found for: ${poiName} in layer: ${layer}`);
                return true;
            }
        }
        
        console.log(`❌ No match found for POI: ${poiName} in layer: ${layer}`);
        return false;
    },
    
    // FIXED: Better add to favorites with name-based deduplication
    addToFavorites(layer, properties, lngLat) {
        const id = this.createId(layer, properties, lngLat);
        const nameField = this.getNameField(layer);
        const poiName = properties[nameField];
        const favorites = this.getFavorites();
        
        // Check if already exists by name to prevent duplicates
        const existingFavorite = Object.keys(favorites).find(favId => {
            const fav = favorites[favId];
            return fav.layer === layer && fav.name === poiName;
        });
        
        if (existingFavorite) {
            console.log(`ℹ️ POI already favorited with different ID: ${existingFavorite}`);
            return true; // Already favorited, no need to add again
        }
        
        console.log(`➕ Adding to favorites with ID: ${id}`);
        
        favorites[id] = {
            layer,
            properties: { ...properties },
            lngLat: [...lngLat],
            dateAdded: new Date().toISOString(),
            name: poiName
        };
        
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(favorites));
            console.log(`⭐ Successfully added to favorites: ${poiName}`);
            console.log(`📊 Total favorites: ${Object.keys(favorites).length}`);
            return true;
        } catch (error) {
            console.warn('Error saving favorite:', error);
            return false;
        }
    },
    
    // FIXED: More robust removal with name-based search
    removeFromFavorites(layer, properties, lngLat) {
        const id = this.createId(layer, properties, lngLat);
        const nameField = this.getNameField(layer);
        const poiName = properties[nameField];
        const favorites = this.getFavorites();
        
        console.log(`➖ Trying to remove from favorites: ${poiName}`);
        
        // Try direct ID match first
        if (favorites.hasOwnProperty(id)) {
            delete favorites[id];
            this.saveFavorites(favorites);
            console.log(`☆ Removed by direct ID: ${poiName}`);
            return true;
        }
        
        // Fallback: find by name and layer
        const matchingIds = Object.keys(favorites).filter(favId => {
            const fav = favorites[favId];
            return fav.layer === layer && fav.name === poiName;
        });
        
        if (matchingIds.length > 0) {
            // Remove all matching entries (handles duplicates)
            matchingIds.forEach(matchId => delete favorites[matchId]);
            this.saveFavorites(favorites);
            console.log(`☆ Removed by name match: ${poiName} (${matchingIds.length} entries)`);
            return true;
        }
        
        console.warn(`❌ Could not find favorite to remove: ${poiName}`);
        return false;
    },
    
    // Helper to save favorites
    saveFavorites(favorites) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(favorites));
            return true;
        } catch (error) {
            console.warn('Error saving favorites:', error);
            return false;
        }
    },
    
    // Get count of favorites
    getCount() {
        return Object.keys(this.getFavorites()).length;
    }
};

// ================================
// ENHANCED POI POPUP WITH FAVORITES - FIXED VERSION
// ================================

// ================================
// ENHANCED POI POPUP WITH FAVORITES - FIXED VERSION
// ================================

function createEnhancedPopup(layer, properties, lngLat) {
    let popupContent = '<div style="max-width: 250px;">';
    
    // Get field names for this POI type
    const fieldMap = {
        'hotels': { 
            name: 'hotel_name', 
            website: 'hotel_website', 
            distance: 'hotel_distance_miles',
            expedia_link: 'expedia_link ',  // Note the space at the end
            booking_link: 'booking_link',
            trip_link: 'trip_link'
        },
        'restaurant': { 
            name: 'restaurant_name', 
            website: 'restaurant_website', 
            distance: 'restaurant_distance_miles',
            price: 'restaurant_price',
            cuisine: 'restaurant_cuisine_type'
        },
        'coffee': { name: 'coffee_name', website: 'coffee_website', distance: 'coffee_distance_miles' },
        'nightlife': { name: 'bar_name', website: 'bar_website', distance: 'bar_distance_miles' },
        'pharmacy': { name: 'pharmacy_name', website: 'pharmacy_website', distance: 'pharmacy_distance_miles' },
        'supermarkets': { name: 'supermarket_name', website: 'supermarket_website', distance: 'supermarket_distance_miles' },
        'museums': { name: 'museum_name', website: 'museum_website', distance: 'museum_distance_miles' }
    };

    const fields = fieldMap[layer] || { name: 'name', website: 'website', distance: 'distance_miles' };
    const stationField = 'closest_station_name';
    
    // Check favorite status more reliably
    const isFavorited = POIFavorites.isFavorited(layer, properties, lngLat);
    const poiId = POIFavorites.createId(layer, properties, lngLat);
    
    console.log(`🏷️ Creating popup - POI: ${properties[fields.name]}, Favorited: ${isFavorited}`);
    
    // Title with star button
    if (properties[fields.name]) {
        popupContent += `<div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">`;
        
        // POI name - SPECIAL HANDLING FOR HOTELS
        if (layer === 'hotels') {
            // For hotels, show name without hyperlink
            popupContent += `<h3 style="margin: 0; color: #333; font-size: 16px; flex: 1;">
                ${properties[fields.name]}
            </h3>`;
        } else {
            // For other POI types, keep the original website link behavior
            if (properties[fields.website]) {
                let websiteUrl = properties[fields.website];
                if (!websiteUrl.startsWith('http://') && !websiteUrl.startsWith('https://')) {
                    websiteUrl = 'https://' + websiteUrl;
                }
                
                popupContent += `<h3 style="margin: 0; color: #333; font-size: 16px; flex: 1;">
                    <a href="#" onclick="openExternalLink('${websiteUrl}'); return false;" 
                       style="color: #007cba; text-decoration: none; cursor: pointer;">
                        ${properties[fields.name]}
                    </a>
                </h3>`;
            } else {
                popupContent += `<h3 style="margin: 0; color: #333; font-size: 16px; flex: 1;">
                    ${properties[fields.name]}
                </h3>`;
            }
        }
        
        // Star button with correct initial state
        const starIcon = isFavorited ? '⭐' : '☆';
        const starColor = isFavorited ? '#FFD700' : '#999';
        const buttonId = `star_${poiId.replace(/[^a-zA-Z0-9]/g, '_')}`;
        
        // Store POI data globally for the onclick handler
        window[`poi_data_${poiId}`] = {
            layer: layer,
            properties: properties,
            lngLat: lngLat
        };
            
        popupContent += `<button id="${buttonId}" 
                                onclick="togglePOIFavoriteFixed('${poiId}')" 
                                style="background: none; border: none; font-size: 20px; cursor: pointer; color: ${starColor}; padding: 0; margin-left: 8px;" 
                                title="${isFavorited ? 'Remove from favorites' : 'Add to favorites'}">
            ${starIcon}
        </button>`;
        
        popupContent += `</div>`;
    }
    
    // SPECIAL BOOKING LINKS FOR HOTELS
    if (layer === 'hotels') {
        const expediaLink = properties[fields.expedia_link];
        const bookingLink = properties[fields.booking_link];
        const tripLink = properties[fields.trip_link];
        
        // Debug logging to check if links are found
        console.log('Hotel booking links debug:');
        console.log('Expedia:', expediaLink);
        console.log('Booking:', bookingLink);
        console.log('Trip:', tripLink);
        
        // Only show booking links section if at least one link exists
        if (expediaLink || bookingLink || tripLink) {
            popupContent += `<div style="margin: 8px 0; padding: 8px; background: #f8f9fa; border-radius: 6px; border: 1px solid #e9ecef;">
                <p style="margin: 0 0 6px 0; color: #666; font-size: 12px; font-weight: bold;">Book this hotel:</p>
                <div style="display: flex; gap: 8px; flex-wrap: wrap;">`;
            
            // Expedia link
            if (expediaLink) {
                popupContent += `<a href="#" onclick="openExternalLink('${expediaLink}'); return false;" 
                                   style="background: #FFD700; color: #333; padding: 4px 8px; border-radius: 4px; text-decoration: none; font-size: 11px; font-weight: bold; cursor: pointer; border: 1px solid #FFC107;">
                    Expedia.com
                </a>`;
            }
            
            // Booking.com link
            if (bookingLink) {
                popupContent += `<a href="#" onclick="openExternalLink('${bookingLink}'); return false;" 
                                   style="background: #003580; color: white; padding: 4px 8px; border-radius: 4px; text-decoration: none; font-size: 11px; font-weight: bold; cursor: pointer; border: 1px solid #002147;">
                    Booking.com
                </a>`;
            }
            
            // Trip.com link
            if (tripLink) {
                popupContent += `<a href="#" onclick="openExternalLink('${tripLink}'); return false;" 
                                   style="background: #FF6B35; color: white; padding: 4px 8px; border-radius: 4px; text-decoration: none; font-size: 11px; font-weight: bold; cursor: pointer; border: 1px solid #E55A2B;">
                    Trip.com
                </a>`;
            }
            
            popupContent += `</div></div>`;
        }
    }
    
    // NEW ORDER: Cuisine first (for restaurants only)
    if (layer === 'restaurant' && properties[fields.cuisine]) {
        popupContent += `<p style="margin: 4px 0; color: #666; font-size: 13px;">
            <strong>Cuisine:</strong> ${properties[fields.cuisine]}
        </p>`;
    }

    // Price second (for restaurants only)
    if (layer === 'restaurant' && properties[fields.price]) {
        popupContent += `<p style="margin: 4px 0; color: #666; font-size: 13px;">
            <strong>Price:</strong> ${properties[fields.price]}
        </p>`;
    }

    // Nearest station third
    if (properties[stationField] || properties.station_name) {
        const stationName = properties[stationField] || properties.station_name;
        popupContent += `<p style="margin: 4px 0; color: #666; font-size: 13px;">
            <strong>Nearest Metro:</strong> ${stationName}
        </p>`;
    }

    // Distance fourth (last)
    if (properties[fields.distance]) {
        const distance = parseFloat(properties[fields.distance]);
        popupContent += `<p style="margin: 4px 0; color: #666; font-size: 13px;">
            <strong>Distance:</strong> ${distance} miles from metro
        </p>`;
    }
    
    popupContent += '</div>';
    return popupContent;
}

// ================================
// FIXED FUNCTION: Toggle regular POI layer - NOW SUPPORTS MULTIPLE LAYERS
// ================================

function togglePOILayer(layerId, buttonElement) {
    // MUSEUMS ARE ALWAYS VISIBLE - don't allow toggling off
    if (layerId === 'museums') {
        // Museums should always be on, just update button state
        map.setLayoutProperty('museums', 'visibility', 'visible');
        buttonElement.classList.add('active');
        applyCategoryFilter('museums');
        console.log(`🏛️ Museums are always visible - cannot be toggled off`);
        return;
    }
    
    const visibility = map.getLayoutProperty(layerId, 'visibility');
    const isCurrentlyVisible = visibility === 'visible' || visibility === undefined;

    if (isCurrentlyVisible) {
        // Hide the current layer (toggle off)
        map.setLayoutProperty(layerId, 'visibility', 'none');
        buttonElement.classList.remove('active');
        console.log(`✅ Hidden layer: ${layerId}`);
    } else {
        // Show the selected layer (toggle on) - NO LONGER HIDE OTHER LAYERS
        map.setLayoutProperty(layerId, 'visibility', 'visible');
        buttonElement.classList.add('active');
        
        // Apply category-specific filter
        applyCategoryFilter(layerId);
        
        // Apply line filter if needed (on top of category filter)
        const currentLineQuery = localStorage.getItem('lineQuery') || '';
        if (currentLineQuery && currentLineQuery !== 'All Lines') {
            if (typeof createCombinedPOIFilter === 'function') {
                try {
                    const combinedFilter = createCombinedPOIFilter(layerId, currentLineQuery);
                    map.setFilter(layerId, combinedFilter);
                    console.log(`✅ Applied combined category + line filter to ${layerId}`);
                } catch (error) {
                    console.warn(`⚠️ Could not apply combined filter to ${layerId}:`, error);
                    applyCategoryFilter(layerId);
                }
            } else {
                console.log(`✅ Applied category filter to ${layerId} (no line filter function available)`);
            }
        } else {
            console.log(`✅ Applied category filter to ${layerId}`);
        }
        
        console.log(`✅ Showed layer: ${layerId} (other layers remain as-is)`);
    }
    
    // Turn off favorites mode if it was active
    if (window.favoritesOnlyMode) {
        console.log('🔄 Turning off favorites mode due to layer toggle');
        window.favoritesOnlyMode = false;
        
        const favoritesButton = document.getElementById('compact-favorites');
        if (favoritesButton) {
            favoritesButton.setAttribute('data-favorites-only', 'false');
            favoritesButton.classList.remove('active');
        }
    }
}

// ================================
// MISSING FUNCTION 1: Category Filter (THE KEY FIX)
// ================================

function applyCategoryFilter(layerId) {
    // Clear any existing filters first
    map.setFilter(layerId, null);
    
    // Get the correct name field for this category
    const nameField = POIFavorites.getNameField(layerId);
    
    // Create a filter that shows POIs where ONLY this category's name field has content
    // and other category name fields are empty or don't exist
    const otherNameFields = ['hotel_name', 'restaurant_name', 'coffee_name', 'bar_name', 'pharmacy_name', 'supermarket_name', 'museum_name']
        .filter(field => field !== nameField);
    
    // Build the filter conditions
    const currentFieldExists = [
        'all',
        ['has', nameField],
        ['!=', ['get', nameField], ''],
        ['!=', ['get', nameField], null]
    ];
    
    // Ensure other category fields are empty/null/missing
    const otherFieldsEmpty = otherNameFields.map(field => [
        'any',
        ['!', ['has', field]],           // Field doesn't exist
        ['==', ['get', field], ''],      // Field is empty string
        ['==', ['get', field], null]     // Field is null
    ]);
    
    // Combine all conditions: current field exists AND all other fields are empty
    const categoryFilter = [
        'all',
        currentFieldExists,
        ...otherFieldsEmpty
    ];
    
    map.setFilter(layerId, categoryFilter);
    console.log(`🎯 Applied strict category filter for ${layerId} using field: ${nameField}`);
}

// ================================
// FIXED: New toggle function with better state management
// ================================

function togglePOIFavoriteFixed(poiId) {
    console.log('\n🔄 === FIXED TOGGLE FAVORITE ===');
    console.log('POI ID:', poiId);
    
    const poiData = window[`poi_data_${poiId}`];
    if (!poiData) {
        console.error('❌ POI data not found for ID:', poiId);
        return;
    }
    
    const { layer, properties, lngLat } = poiData;
    const nameField = POIFavorites.getNameField(layer);
    const poiName = properties[nameField];
    
    console.log('POI Name:', poiName);
    console.log('Layer:', layer);
    
    // Check current favorite status using the more robust method
    const isFavorited = POIFavorites.isFavorited(layer, properties, lngLat);
    console.log('Current favorite status:', isFavorited);
    
    const buttonId = `star_${poiId.replace(/[^a-zA-Z0-9]/g, '_')}`;
    const starButton = document.getElementById(buttonId);
    
    if (isFavorited) {
        // Remove from favorites
        console.log('🗑️ Removing from favorites...');
        const success = POIFavorites.removeFromFavorites(layer, properties, lngLat);
        
        if (success && starButton) {
            starButton.innerHTML = '☆';
            starButton.style.color = '#999';
            starButton.title = 'Add to favorites';
            console.log('✅ Updated star button to unfavorited state');
        }
        
        if (success) {
            updateFavoritesDisplay();
            console.log(`☆ Successfully removed from favorites: ${poiName}`);
            
            // If in favorites-only mode, hide this POI
            if (window.favoritesOnlyMode) {
                console.log('🔄 Updating favorites-only view...');
                setTimeout(() => {
                    applyFavoritesFilter(layer);
                }, 100);
            }
        } else {
            console.error('❌ Failed to remove from favorites');
        }
    } else {
        // Add to favorites
        console.log('➕ Adding to favorites...');
        const success = POIFavorites.addToFavorites(layer, properties, lngLat);
        
        if (success && starButton) {
            starButton.innerHTML = '⭐';
            starButton.style.color = '#FFD700';
            starButton.title = 'Remove from favorites';
            console.log('✅ Updated star button to favorited state');
        }
        
        if (success) {
            updateFavoritesDisplay();
            console.log(`⭐ Successfully added to favorites: ${poiName}`);
        } else {
            console.error('❌ Failed to add to favorites');
        }
    }
    
    console.log('=== END FIXED TOGGLE ===\n');
}

// Make the fixed function globally available
window.togglePOIFavoriteFixed = togglePOIFavoriteFixed;

// ================================
// KEEP THE OLD FUNCTION FOR BACKWARD COMPATIBILITY
// ================================

function togglePOIFavorite(layer, poiId, properties, lngLat) {
    // Just redirect to the fixed version
    window[`poi_data_${poiId}`] = { layer, properties, lngLat };
    togglePOIFavoriteFixed(poiId);
}

// Make it globally available
window.togglePOIFavorite = togglePOIFavorite;

// ================================
// ENHANCED LAYER TOGGLES WITH FAVORITES
// ================================

function initializeCompactLayerToggles() {
    addCompactToggleStyles();
    
    map.on('idle', () => {
        const layerConfigs = {
            'pharmacy': { name: 'Pharmacy', icon: 'static/images/pharmacies.svg', color: '#4CAF50' },
            'supermarkets': { name: 'Grocery', icon: 'static/images/supermarket.svg', color: '#FF9800' },
            'nightlife': { name: 'Nightlife', icon: 'static/images/nightlife.svg', color: '#9C27B0' },
            'coffee': { name: 'Breakfast', icon: 'static/images/coffee.svg', color: '#8B4513' },
            'restaurant': { name: 'Lunch/Dinner', icon: 'static/images/restaurants.svg', color: '#FF6B35' },
            'hotels': { name: 'Hotels', icon: 'static/images/hotel.svg', color: '#2196F3' },
            // Add favorites toggle
            'favorites': { name: 'Favorites Only', icon: null, color: '#FFD700', isSpecial: true }
        };

        let menuContainer = document.getElementById('compact-map-menu');
        if (!menuContainer) {
            menuContainer = document.createElement('div');
            menuContainer.id = 'compact-map-menu';
            menuContainer.className = 'compact-layer-menu';
            
            const mapContainer = document.getElementById('map') || 
                                document.getElementById('map-container') || 
                                document.body;
            mapContainer.appendChild(menuContainer);
        }

        Object.keys(layerConfigs).forEach(layerId => {
            const config = layerConfigs[layerId];
            
            if (document.getElementById(`compact-${layerId}`)) {
                return;
            }

            // Skip non-special layers that don't exist in map
            if (!config.isSpecial && (!map.getLayer || !map.getLayer(layerId))) {
                console.warn(`⚠️ Layer ${layerId} not found in map`);
                return;
            }

            const button = document.createElement('div');
            button.id = `compact-${layerId}`;
            button.className = 'compact-layer-button';
            button.title = config.name;
            
            // Set initial state - MUSEUMS START ACTIVE
            if (layerId === 'favorites') {
                // Favorites toggle starts inactive
                button.setAttribute('data-favorites-only', 'false');
            } else if (layerId === 'museums') {
                // Museums always start active and visible
                button.classList.add('active');
            } else {
                const currentVisibility = map.getLayoutProperty(layerId, 'visibility');
                const isActive = currentVisibility === 'visible' || currentVisibility === undefined;
                if (isActive) button.classList.add('active');
            }

            // Create button content
            if (layerId === 'favorites') {
                button.innerHTML = `
                    <div class="compact-icon" style="background-color: ${config.color}">
                        <span style="font-size: 16px; color: white;">⭐</span>
                        <div id="favorites-count" style="position: absolute; top: -8px; right: -8px; background: #DC143C; color: white; border-radius: 50%; min-width: 18px; height: 18px; font-size: 11px; font-weight: bold; display: none; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 1px 3px rgba(0,0,0,0.3);">
                            0
                        </div>
                    </div>
                `;
            } else {
                button.innerHTML = `
                    <div class="compact-icon" style="background-color: ${config.color}">
                        <img src="${config.icon}" alt="${config.name}" class="icon-image" 
                             onload="this.style.opacity='1';" 
                             onerror="this.style.display='none'; this.parentNode.innerHTML='${config.name.charAt(0)}';" />
                    </div>
                `;
            }

            // Click handler
            button.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                this.style.transform = 'scale(0.9)';
                setTimeout(() => this.style.transform = 'scale(1)', 100);

                if (layerId === 'favorites') {
                    toggleFavoritesOnlyMode(this);
                } else {
                    togglePOILayer(layerId, this);
                }
            };

            menuContainer.appendChild(button);
        });

        updateFavoritesDisplay();
        console.log('✅ Enhanced layer toggles with favorites initialized');
    });
}

// Toggle favorites-only mode - FIXED to maintain proper star states
function toggleFavoritesOnlyMode(buttonElement) {
    const isActive = buttonElement.getAttribute('data-favorites-only') === 'true';
    const favoritesCount = POIFavorites.getCount();
    
    if (favoritesCount === 0) {
        alert('No favorites saved yet! Click the star (☆) in POI popups to add favorites.');
        return;
    }
    
    if (isActive) {
        // Turn off favorites-only mode
        buttonElement.setAttribute('data-favorites-only', 'false');
        buttonElement.classList.remove('active');
        window.favoritesOnlyMode = false;
        
        console.log('📍 Turning OFF favorites-only mode');
        
        // Reset all layers to their normal visibility state
        const poiLayers = ['pharmacy', 'supermarkets', 'nightlife', 'coffee', 'restaurant', 'hotels', 'museums'];
        poiLayers.forEach(layerId => {
            if (map.getLayer(layerId)) {
                // Clear any favorites filters and apply category filters
                map.setFilter(layerId, null);
                applyCategoryFilter(layerId);
                
                // Check if the layer toggle button is active to determine visibility
                const layerButton = document.getElementById(`compact-${layerId}`);
                const shouldBeVisible = layerButton && layerButton.classList.contains('active');
                
                if (shouldBeVisible) {
                    map.setLayoutProperty(layerId, 'visibility', 'visible');
                } else {
                    map.setLayoutProperty(layerId, 'visibility', 'none');
                }
            }
        });
        
        console.log('📍 Showing all POIs based on active layer toggles');
    } else {
        // Turn on favorites-only mode
        buttonElement.setAttribute('data-favorites-only', 'true');
        buttonElement.classList.add('active');
        window.favoritesOnlyMode = true;
        
        console.log('⭐ Turning ON favorites-only mode');
        
        // Show all layers that have favorites, hide others
        const poiLayers = ['pharmacy', 'supermarkets', 'nightlife', 'coffee', 'restaurant', 'hotels', 'museums'];
        const favorites = POIFavorites.getFavorites();
        const layersWithFavorites = new Set(Object.values(favorites).map(fav => fav.layer));
        
        console.log('📋 Favorites by layer:', layersWithFavorites);
        
        poiLayers.forEach(layerId => {
            if (map.getLayer(layerId)) {
                if (layersWithFavorites.has(layerId)) {
                    // Show layer and apply favorites filter
                    map.setLayoutProperty(layerId, 'visibility', 'visible');
                    applyFavoritesFilter(layerId);
                    
                    // Update toggle button state
                    const layerButton = document.getElementById(`compact-${layerId}`);
                    if (layerButton) layerButton.classList.add('active');
                    
                    console.log(`✅ Showing favorites for layer: ${layerId}`);
                } else {
                    // Hide layers with no favorites
                    map.setLayoutProperty(layerId, 'visibility', 'none');
                    
                    // Update toggle button state
                    const layerButton = document.getElementById(`compact-${layerId}`);
                    if (layerButton) layerButton.classList.remove('active');
                }
            }
        });
        
        console.log(`⭐ Showing only favorites from ${layersWithFavorites.size} categories (${favoritesCount} total items)`);
    }
}

// Apply favorites filter to a specific layer
function applyFavoritesFilter(layerId) {
    const favorites = POIFavorites.getFavorites();
    const layerFavorites = Object.values(favorites).filter(fav => fav.layer === layerId);
    
    if (layerFavorites.length === 0) {
        // No favorites for this layer, hide it
        map.setFilter(layerId, ['==', 'id', 'IMPOSSIBLE_MATCH']);
        return;
    }
    
    // Create filter to show only favorited POIs
    const nameField = POIFavorites.getNameField(layerId);
    const favoriteNames = layerFavorites.map(fav => fav.name);
    
    const filter = favoriteNames.length === 1 
        ? ['==', ['get', nameField], favoriteNames[0]]
        : ['in', ['get', nameField], ['literal', favoriteNames]];
    
    map.setFilter(layerId, filter);
    console.log(`✅ Applied favorites filter to ${layerId}: ${favoriteNames.length} items`);
}

// Update favorites display counter - FIXED to show actual count, not actions
function updateFavoritesDisplay() {
    // Get the actual current count from storage
    const currentCount = POIFavorites.getCount();
    const counter = document.getElementById('favorites-count');
    
    if (counter) {
        counter.textContent = currentCount;
        counter.style.display = currentCount > 0 ? 'flex' : 'none';
        console.log(`📊 Updated favorites counter to: ${currentCount}`);
    } else {
        console.warn('⚠️ Favorites counter element not found');
    }
    
    // Also log the current favorites for debugging
    const favorites = POIFavorites.getFavorites();
    console.log(`🗂️ Current favorites in storage:`, Object.keys(favorites).map(key => favorites[key].name));
}

// ================================
// POI CLICK HANDLERS - FIXED
// ================================

function initializeEnhancedPOIClicks() {
    console.log('🎯 Initializing FIXED POI click events...');
    
    const poiLayers = ['pharmacy', 'supermarkets', 'nightlife', 'coffee', 'restaurant', 'hotels', 'museums'];
    let successfulLayers = 0;
    
    poiLayers.forEach(layer => {
        if (!map.getLayer(layer)) {
            console.warn(`⚠️ Layer ${layer} not found in map`);
            return;
        }
        
        console.log(`✅ Setting up FIXED handlers for layer: ${layer}`);
        
        // Remove existing handlers
        map.off('click', layer);
        map.off('mouseenter', layer);
        map.off('mouseleave', layer);
        
        // Add click handler with improved favorites support
        map.on('click', layer, function(e) {
            if (e.features && e.features.length > 0) {
                const properties = e.features[0].properties;
                const lngLat = e.lngLat.toArray();
                
                console.log(`🖱️ Clicked POI in layer: ${layer}`);
                
                const popupContent = createEnhancedPopup(layer, properties, lngLat);
                
                // Remove existing popups
                const existingPopups = document.getElementsByClassName('mapboxgl-popup');
                for (let i = existingPopups.length - 1; i >= 0; i--) {
                    existingPopups[i].remove();
                }
                
                const popup = new mapboxgl.Popup({
                    closeOnClick: true,
                    closeOnMove: false
                })
                    .setLngLat(e.lngLat)
                    .setHTML(popupContent)
                    .addTo(map);
                
                console.log(`✅ Created popup for POI: ${properties[POIFavorites.getNameField(layer)]}`);
            }
        });
        
        // Add hover effects
        map.on('mouseenter', layer, () => map.getCanvas().style.cursor = 'pointer');
        map.on('mouseleave', layer, () => map.getCanvas().style.cursor = '');
        
        successfulLayers++;
    });
    
    console.log(`✅ FIXED POI click handlers initialized for ${successfulLayers} layers`);
}

// ================================
// ENHANCED CSS STYLES
// ================================

function addCompactToggleStyles() {
    if (document.getElementById('compact-toggle-styles')) return;

    const styles = document.createElement('style');
    styles.id = 'compact-toggle-styles';
    styles.textContent = `
        .compact-layer-menu {
            position: absolute;
            top: 20px;
            right: 20px;
            background: rgba(255, 255, 255, 0.95);
            border-radius: 10px;
            box-shadow: 0 3px 15px rgba(0, 0, 0, 0.15);
            border: 1px solid rgba(0, 0, 0, 0.1);
            z-index: 1000;
            backdrop-filter: blur(10px);
            padding: 8px;
            display: flex;
            gap: 6px;
            flex-wrap: wrap;
            max-width: 140px;
        }

        .compact-layer-button {
            width: 36px;
            height: 36px;
            cursor: pointer;
            transition: all 0.2s ease;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            background: rgba(255, 255, 255, 0.7);
        }

        .compact-layer-button:hover {
            transform: scale(1.1) !important;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }

        .compact-layer-button.active {
            background: rgba(255, 255, 255, 1);
            box-shadow: 0 2px 10px rgba(0, 124, 186, 0.3);
        }

        .compact-layer-button.active::after {
            content: '';
            position: absolute;
            bottom: 2px;
            right: 2px;
            width: 8px;
            height: 8px;
            background: #007cba;
            border-radius: 50%;
            border: 1px solid white;
        }

        .compact-icon {
            width: 28px;
            height: 28px;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            position: relative;
            overflow: hidden;
        }

        .icon-image {
            width: 18px;
            height: 18px;
            object-fit: contain;
            filter: brightness(1.1) contrast(1.1);
            transition: all 0.2s ease;
            opacity: 0;
        }

        .compact-layer-button:hover .icon-image {
            transform: scale(1.1);
            filter: brightness(1.2) contrast(1.2);
        }

        .compact-layer-button.active .icon-image {
            filter: brightness(1.3) contrast(1.3);
        }

        .compact-layer-button:hover::before {
            content: attr(title);
            position: absolute;
            bottom: -30px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 11px;
            white-space: nowrap;
            z-index: 1001;
            pointer-events: none;
        }

        @media (max-width: 768px) {
            .compact-layer-menu {
                top: 10px;
                right: 10px;
                padding: 6px;
                gap: 4px;
                max-width: 120px;
            }
            .compact-layer-button { width: 32px; height: 32px; }
            .compact-icon { width: 24px; height: 24px; }
            .icon-image { width: 16px; height: 16px; }
        }
    `;

    document.head.appendChild(styles);
}

// ================================
// WMATA TRIP PLANNER LINK STYLES AND ELEMENT
// ================================
function addWMATATripPlannerLink() {
    // Add CSS styles for the trip planner link
    const tripPlannerStyles = document.createElement('style');
    tripPlannerStyles.id = 'wmata-trip-planner-styles';
    tripPlannerStyles.textContent = `
        .wmata-trip-planner {
            position: absolute;
            top: 20px;
            left: 20px;
            background: rgba(255, 255, 255, 0.95);
            border-radius: 8px;
            box-shadow: 0 3px 15px rgba(0, 0, 0, 0.15);
            border: 1px solid rgba(0, 0, 0, 0.1);
            z-index: 1000;
            backdrop-filter: blur(10px);
            padding: 12px 16px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        .wmata-trip-planner a {
            color: #007cba;
            text-decoration: none;
            font-weight: 600;
            font-size: 14px;
            display: flex;
            align-items: center;
            gap: 6px;
            transition: all 0.2s ease;
        }
        .wmata-trip-planner a:hover {
            color: #005a87;
            text-decoration: underline;
        }
        .wmata-trip-planner a::before {
            content: '🚇';
            font-size: 16px;
        }
        /* Mobile responsive */
        @media (max-width: 768px) {
            .wmata-trip-planner {
                top: 10px;
                left: 10px;
                padding: 10px 12px;
            }
            
            .wmata-trip-planner a {
                font-size: 13px;
            }
        }
        /* Adjust for very small screens */
        @media (max-width: 480px) {
            .wmata-trip-planner a::before {
                display: none; /* Hide emoji on very small screens */
            }
        }
    `;
    
    document.head.appendChild(tripPlannerStyles);
    
    // Create the trip planner link element
    const tripPlannerContainer = document.createElement('div');
    tripPlannerContainer.className = 'wmata-trip-planner';
    tripPlannerContainer.innerHTML = `
        <a href="#" onclick="openExternalLink('https://www.wmata.com/schedules/trip-planner/'); return false;">
            WMATA Trip Planner
        </a>
    `;
    
    // Add to map container
    const mapContainer = document.getElementById('map') || 
                        document.getElementById('map-container') || 
                        document.body;
    mapContainer.appendChild(tripPlannerContainer);
    
    console.log('✅ WMATA Trip Planner link added');
}

// ================================
// INITIALIZATION - UPDATED ORDER
// ================================

// Initialize the WMATA Trip Planner link first
addWMATATripPlannerLink();

// Initialize everything
initializeCompactLayerToggles();

// Map load callback - ENHANCED to always show museums
map.on('load', () => {
    console.log('🗺️ Map loaded, starting initialization...');
    
    trackUserLocation(map);
    window.mapLoadTime = Date.now();
    
    const initializePOIs = () => {
        if (!window.poiClicksInitialized) {
            console.log('🎯 Map is idle, initializing POI handlers...');
            initializeEnhancedPOIClicks();
            window.poiClicksInitialized = true;
            
            // CRITICAL: Ensure museums are always visible after initialization
            ensureMuseumsAlwaysVisible();
        }
    };
    
    map.on('idle', initializePOIs);
    
    setTimeout(() => {
        if (!window.poiClicksInitialized) {
            console.log('⏰ Backup initialization triggered...');
            initializePOIs();
        }
    }, 2000);
    
    console.log('🚀 Map initialization complete');
});

// ================================
// NEW FUNCTION: Ensure museums are always visible
// ================================

function ensureMuseumsAlwaysVisible() {
    if (map.getLayer('museums')) {
        map.setLayoutProperty('museums', 'visibility', 'visible');
        applyCategoryFilter('museums');
        
        // Make sure the museums button shows as active
        const museumsButton = document.getElementById('compact-museums');
        if (museumsButton) {
            museumsButton.classList.add('active');
        }
        
        console.log('🏛️ Museums layer set to always visible');
        
        // Re-apply this every few seconds to ensure it stays visible
        setInterval(() => {
            if (map.getLayer('museums')) {
                const visibility = map.getLayoutProperty('museums', 'visibility');
                if (visibility !== 'visible') {
                    map.setLayoutProperty('museums', 'visibility', 'visible');
                    applyCategoryFilter('museums');
                    console.log('🔄 Re-enabled museums visibility');
                }
            }
        }, 3000);
    }
}

// Make the function globally available for manual calls
window.ensureMuseumsAlwaysVisible = ensureMuseumsAlwaysVisible;

// ================================
// DEBUG FUNCTIONS - ENHANCED
// ================================

function testFavorites() {
    const favorites = POIFavorites.getFavorites();
    console.log('📋 Current favorites:', favorites);
    console.log('📊 Favorites count:', POIFavorites.getCount());
    console.log('🔄 Favorites-only mode:', window.favoritesOnlyMode || false);
}

// Enhanced debug function for favorites
function debugFavorites() {
    console.log('\n=== FAVORITES DEBUG ===');
    const favorites = POIFavorites.getFavorites();
    console.log('Total favorites:', Object.keys(favorites).length);
    console.log('Favorites list:');
    Object.keys(favorites).forEach(id => {
        const fav = favorites[id];
        console.log(`  ${id}: ${fav.name} (${fav.layer})`);
    });
    console.log('=== END DEBUG ===\n');
}

// Test a specific POI's favorite status
function testPOIFavoriteStatus(layer, name) {
    const favorites = POIFavorites.getFavorites();
    const matches = Object.values(favorites).filter(fav => 
        fav.layer === layer && fav.name.includes(name)
    );
    console.log(`Found ${matches.length} matching favorites for "${name}" in ${layer}:`, matches);
}

// MISSING FUNCTION 3: Debug POI Filtering (to test the fix)
function debugPOIFiltering() {
    console.log('\n=== POI FILTERING DEBUG ===');
    
    // Test each layer
    const testLayers = ['hotels', 'coffee', 'restaurant'];
    
    testLayers.forEach(layerId => {
        if (map.getLayer(layerId)) {
            console.log(`\n--- Testing ${layerId} ---`);
            
            // Show the layer with no filter
            map.setLayoutProperty(layerId, 'visibility', 'visible');
            map.setFilter(layerId, null);
            
            setTimeout(() => {
                const allFeatures = map.queryRenderedFeatures({ layers: [layerId] });
                console.log(`${layerId} with no filter: ${allFeatures.length} features`);
                
                if (allFeatures.length > 0) {
                    const sample = allFeatures[0].properties;
                    const nameFields = Object.keys(sample).filter(key => key.includes('_name') && sample[key]);
                    console.log(`  Sample feature populated name fields:`, nameFields);
                }
                
                // Now apply the category filter
                applyCategoryFilter(layerId);
                
                setTimeout(() => {
                    const filteredFeatures = map.queryRenderedFeatures({ layers: [layerId] });
                    console.log(`${layerId} with category filter: ${filteredFeatures.length} features`);
                }, 200);
                
                // Hide the layer
                map.setLayoutProperty(layerId, 'visibility', 'none');
            }, 200);
        } else {
            console.log(`❌ Layer ${layerId} not found`);
        }
    });
}

// Make functions globally available
window.testFavorites = testFavorites;
window.debugFavorites = debugFavorites;
window.testPOIFavoriteStatus = testPOIFavoriteStatus;
window.POIFavorites = POIFavorites;
window.debugPOIFiltering = debugPOIFiltering;
// ================================
// STATION CLICK EVENTS (Optional enhancement)
// =============================

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

// FINAL FIX: Replace your clearSearch function (around line 661) with this version
function clearSearch() {
    console.log('🧹 Starting clearSearch function...');
    
    // Remove station and line queries from local storage
    localStorage.removeItem('stationQuery');
    localStorage.removeItem('lineQuery');
    console.log('✓ Cleared localStorage');
    
    // Clear search inputs (with safety checks)
    const stationInput = document.getElementById('station-search');
    const lineInput = document.getElementById('line-search');
    
    if (stationInput) {
        stationInput.value = '';
        console.log('✓ Cleared station input');
    }
    
    if (lineInput) {
        // IMPORTANT: Set to empty or your default "all lines" option
        lineInput.value = ''; // or 'All Lines' if that's your default option text
        console.log('✓ Cleared line input');
    }
    
    // Reset map view - centered on Washington Monument
    map.flyTo({
        center: [-77.035278, 38.889484],
        zoom: 14
    });
    console.log('✓ Reset map view');
    
    // CRITICAL FIX: Call the enhanced filterTransitRoutes with explicit null/empty
    // This ensures it goes through the "show all lines" path
    filterTransitRoutes(null);  // Try null first
    
    // Also explicitly reset POI filtering 
    filterPOIsForLine(null);
    
    // Additional safety: Force trigger the "show all lines" logic
    setTimeout(() => {
        console.log('🔄 Safety reset - forcing show all lines...');
        
        // Define all transit layers (same as in your enhanced function)
        const allTransitLayers = [
            'routes-rail',
            'routes-casing', 
            'routes-blue-casing',
            'routes-orange-casing',
            'routes-orange',
            'routes-blue',
            'composite'
        ];
        
        // Force all layers visible and restore original filters
        allTransitLayers.forEach(layerId => {
            if (map.getLayer && map.getLayer(layerId)) {
                try {
                    map.setLayoutProperty(layerId, 'visibility', 'visible');
                    
                    // Restore the original filters based on your enhanced function logic
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
                    
                    console.log(`✓ Force-restored ${layerId}`);
                } catch (error) {
                    console.warn(`Could not force-restore ${layerId}:`, error);
                }
            }
        });
        
        // Force restore stations
        if (map.getLayer && map.getLayer('stations')) {
            try {
                const defaultStationFilter = [
                    "all",
                    ["has", "station_name"],
                    ["!=", ["get", "station_name"], ""],
                    ["has", "station_line"]
                ];
                map.setFilter('stations', defaultStationFilter);
                map.setLayoutProperty('stations', 'visibility', 'visible');
                console.log('✓ Force-restored stations');
            } catch (error) {
                console.warn('Could not force-restore stations:', error);
            }
        }
        
    }, 500); // Small delay to ensure map is ready
    
    console.log('🎯 clearSearch completed - map should show all lines');
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


