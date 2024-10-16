from flask import Flask, render_template, jsonify
import json
import os
import logging

app = Flask(__name__)

# Configure logging
logging.basicConfig(level=logging.INFO)

# General function to load JSON data
def load_data(filename):
    try:
        with open(os.path.join('static', 'data', filename), 'r', encoding='utf-8') as jsonfile:
            data = json.load(jsonfile)
        logging.info(f"Loaded {len(data)} records from {filename}.")
        return data
    except FileNotFoundError:
        logging.error(f"Error: {filename} file not found.")
        return []
    except json.JSONDecodeError as jde:
        logging.error(f"JSON decode error in {filename}: {jde}")
        return []
    except Exception as e:
        logging.error(f"Unexpected error loading {filename}: {e}")
        return []

# API route to get all stations
@app.route('/api/stations')
def api_stations():
    stations = load_data('stations.json')
    if not stations:
        return jsonify({"message": "No stations found."}), 200
    return jsonify(stations)

# API route to get all hotels
@app.route('/api/hotels')
def api_hotels():
    hotels = load_data('hotels.json')
    if not hotels:
        return jsonify({"message": "No hotels found."}), 200
    return jsonify(hotels)

# API route to get all coffee shops
@app.route('/api/coffee')
def api_coffee():
    coffee_shops = load_data('coffee.json')
    if not coffee_shops:
        return jsonify({"message": "No coffee shops found."}), 200
    return jsonify(coffee_shops)

# API route to get all bars
@app.route('/api/bars')
def api_bars():
    bars = load_data('bars.json')
    if not bars:
        return jsonify({"message": "No bars found."}), 200
    return jsonify(bars)

# API route to get all pharmacies
@app.route('/api/pharmacies')
def api_pharmacies():
    pharmacies = load_data('pharmacy.json')
    if not pharmacies:
        return jsonify({"message": "No pharmacies found."}), 200
    return jsonify(pharmacies)

# API route to get pharmacies by station_id
@app.route('/api/stations/<station_id>/pharmacies')
def api_pharmacies_by_station(station_id):
    try:
        logging.info(f"Fetching pharmacies for station {station_id}")
        pharmacies = load_data('pharmacy.json')
        filtered_pharmacies = [pharmacy for pharmacy in pharmacies if str(pharmacy.get('station_id')) == str(station_id)]
        if not filtered_pharmacies:
            logging.info(f"No pharmacies found for station {station_id}")
            return jsonify({"message": "No pharmacies found for this station."}), 200
        logging.info(f"Found {len(filtered_pharmacies)} pharmacies for station {station_id}")
        return jsonify(filtered_pharmacies)
    except Exception as e:
        logging.error(f"Error fetching pharmacies for station {station_id}: {e}")
        return jsonify({"message": "An error occurred while fetching pharmacies."}), 500

# API route to get coffee shops by station_id
@app.route('/api/stations/<station_id>/coffee')
def api_coffee_by_station(station_id):
    try:
        logging.info(f"Fetching coffee shops for station {station_id}")
        coffee_shops = load_data('coffee.json')
        filtered_coffee = [shop for shop in coffee_shops if str(shop.get('station_id')) == str(station_id)]
        if not filtered_coffee:
            logging.info(f"No coffee shops found for station {station_id}")
            return jsonify({"message": "No coffee shops found for this station."}), 200
        logging.info(f"Found {len(filtered_coffee)} coffee shops for station {station_id}")
        return jsonify(filtered_coffee)
    except Exception as e:
        logging.error(f"Error fetching coffee shops for station {station_id}: {e}")
        return jsonify({"message": "An error occurred while fetching coffee shops."}), 500

# API route to get bars by station_id
@app.route('/api/stations/<station_id>/bars')
def api_bars_by_station(station_id):
    try:
        logging.info(f"Fetching bars for station {station_id}")
        bars = load_data('bars.json')
        filtered_bars = [bar for bar in bars if str(bar.get('station_id')) == str(station_id)]
        if not filtered_bars:
            logging.info(f"No bars found for station {station_id}")
            return jsonify({"message": "No bars found for this station."}), 200
        logging.info(f"Found {len(filtered_bars)} bars for station {station_id}")
        return jsonify(filtered_bars)
    except Exception as e:
        logging.error(f"Error fetching bars for station {station_id}: {e}")
        return jsonify({"message": "An error occurred while fetching bars."}), 500

# API route to get hotels by station_id
@app.route('/api/stations/<station_id>/hotels')
def api_hotels_by_station(station_id):
    try:
        logging.info(f"Fetching hotels for station {station_id}")
        hotels = load_data('hotels.json')
        filtered_hotels = [hotel for hotel in hotels if str(hotel.get('station_id')) == str(station_id)]
        if not filtered_hotels:
            logging.info(f"No hotels found for station {station_id}")
            return jsonify({"message": "No hotels found for this station."}), 200
        logging.info(f"Found {len(filtered_hotels)} hotels for station {station_id}")
        return jsonify(filtered_hotels)
    except Exception as e:
        logging.error(f"Error fetching hotels for station {station_id}: {e}")
        return jsonify({"message": "An error occurred while fetching hotels."}), 500

# New API route to get transit routes filtered by line
@app.route('/api/routes/<line_query>')
def api_routes_by_line(line_query):
    try:
        logging.info(f"Fetching routes for line {line_query}")
        geojson_data = load_data('reduced_routes_data.geojson')  # Load the full GeoJSON file
        if not geojson_data:
            logging.error("No GeoJSON data found.")
            return jsonify({"message": "No routes found."}), 200

        # Filter the GeoJSON data based on the selected line
        filtered_features = [
            feature for feature in geojson_data['features'] 
            if feature['properties']['route_id'].lower() == line_query.lower()
        ]

        filtered_geojson = {
            "type": "FeatureCollection",
            "features": filtered_features
        }

        if not filtered_features:
            logging.info(f"No routes found for line {line_query}")
            return jsonify({"message": "No routes found for this line."}), 200

        return jsonify(filtered_geojson)
    except Exception as e:
        logging.error(f"Error fetching routes for line {line_query}: {e}")
        return jsonify({"message": "An error occurred while fetching routes."}), 500

# Home route
@app.route('/')
def home():
    return render_template('index.html')

# Stations page route
@app.route('/stations')
def stations_page():
    stations = load_data('stations.json')
    if not stations:
        logging.warning("No stations data available for rendering.")
    # Define line colors
    line_colors = {
        'Red': '#FF0000',
        'Blue': '#0000FF',
        'Yellow': '#FFFF00',
        'Green': '#008000',
        'Orange': '#FFA500',
        'Silver': '#C0C0C0',
        'MARC': '#8B4513',  # Brown for MARC
        'VRE': '#800080'     # Purple for VRE
    }
    return render_template('stations.html', stations=stations, line_colors=line_colors)

# Error handling routes
@app.errorhandler(404)
def page_not_found(e):
    return render_template('error.html', message="Page not found.", status_code=404), 404

if __name__ == '__main__':
    app.run(debug=True)
