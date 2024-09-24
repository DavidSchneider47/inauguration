#!/usr/bin/env python
# coding: utf-8

from flask import Flask, render_template, jsonify
import csv
import os

app = Flask(__name__)

# Load station data from CSV
def load_stations():
    stations = []
    try:
        with open('static/data/stations.csv', newline='', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                try:
                    stations.append({
                        'id': row['id'],
                        'name': row['name'],
                        'latitude': float(row['latitude']),
                        'longitude': float(row['longitude'])
                    })
                except ValueError as ve:
                    print(f"Error processing station row: {row} - {ve}")
    except FileNotFoundError:
        print("Error: stations.csv file not found.")
    except Exception as e:
        print(f"Unexpected error loading stations: {e}")
    return stations

# Load hotel data from CSV with debugging
def load_hotels():
    hotels = []
    try:
        with open('static/data/hotels.csv', newline='', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)

            # Debugging: Print headers to see how they're being read
            headers = reader.fieldnames
            print("Hotel CSV Headers:", headers)
            
            for row in reader:
                # Print each row for debugging
                print(f"Processing row: {row}")
                
                # Check for missing or invalid data and skip rows if necessary
                if not row.get('id') or not row.get('latitude') or not row.get('longitude'):
                    print(f"Skipping row due to missing data: {row}")
                    continue  # Skip rows with missing critical data
                
                try:
                    hotels.append({
                        'id': row['id'],
                        'name': row['name'],
                        'latitude': float(row['latitude']),
                        'longitude': float(row['longitude']),
                        'website': row.get('website', '#')  # Default to '#' if website is missing
                    })
                except ValueError as ve:
                    print(f"Error processing hotel row: {row} - {ve}")
    except FileNotFoundError:
        print("Error: hotels.csv file not found.")
    except Exception as e:
        print(f"Unexpected error loading hotels: {e}")
    return hotels

# Home route - serve the main HTML page
@app.route('/')
def home():
    return render_template('index.html')

# API route for stations
@app.route('/api/stations')
def api_stations():
    try:
        stations = load_stations()
        print(f"Loaded {len(stations)} stations.")
        return jsonify(stations)
    except Exception as e:
        print(f"Error in /api/stations route: {e}")
        return jsonify({"error": "Failed to load stations data."}), 500

# API route for hotels with debugging
@app.route('/api/hotels')
def api_hotels():
    try:
        hotels = load_hotels()
        print(f"Loaded {len(hotels)} hotels.")
        return jsonify(hotels)
    except Exception as e:
        print(f"Error in /api/hotels route: {e}")
        return jsonify({"error": "Failed to load hotels data."}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))  # Get the port from the environment
    app.run(host='0.0.0.0', port=port, debug=True)  # Bind to 0.0.0.0 to make it accessible