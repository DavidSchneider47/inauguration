// Debugging message to ensure map.js is loaded
console.log("map.js loaded successfully");

// Initialize the map, centered on Washington, DC with zoom level 16
mapboxgl.accessToken = 'pk.eyJ1Ijoic3RhbWVuIiwiYSI6IlpkZEtuS1EifQ.jiH_c9ShtBwtqH9RdG40mw';

const map = new mapboxgl.Map({
    container: 'map-inner', // container ID
    style: 'mapbox://styles/stamen/cmd7pl9cl00yf01qncnjggdld/draft', // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
    center: [-77.0219, 38.8989], // starting position [lng, lat]. Note that lat must be set between -90 and 90
    zoom: 14 // starting zoom
    });

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
    layers.appendChild(link);
}
    });