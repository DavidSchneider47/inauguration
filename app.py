#!/usr/bin/env python
# coding: utf-8

# In[ ]:


from flask import Flask, render_template, jsonify
import csv

app = Flask(__name__)

# Load station data from CSV
def load_stations():
    stations = []
    with open('data/stations.csv', newline='') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            stations.append({
                'id': row['id'],
                'name': row['name'],
                'latitude': float(row['latitude']),
                'longitude': float(row['longitude'])
            })
    return stations

# Load hotel data from CSV with debugging
def load_hotels():
    hotels = []
    with open('data/hotels.csv', newline='') as csvfile:
        reader = csv.DictReader(csvfile)

        # Debugging: Print headers to see how they're being read
        headers = reader.fieldnames
        print("Hotel CSV Headers:", headers)
        
        for row in reader:
            # Print each row for debugging
            print(f"Processing row: {row}")
            
            # Check for missing or invalid data and skip rows if necessary
            if not row['id'] or not row['latitude'] or not row['longitude']:
                print(f"Skipping row due to missing data: {row}")
                continue  # Skip rows with missing critical data
            
            hotels.append({
                'id': row['id'],
                'name': row['name'],
                'latitude': float(row['latitude']),
                'longitude': float(row['longitude']),
                'website': row['website']
            })
    
    return hotels

# Home route - serve the main HTML page
@app.route('/')
def home():
    return render_template('index.html')

# API route for stations
@app.route('/api/stations')
def api_stations():
    stations = load_stations()
    return jsonify(stations)

# API route for hotels with debugging
@app.route('/api/hotels')
def api_hotels():
    hotels = load_hotels()
    print(f"Loaded {len(hotels)} hotels")
    return jsonify(hotels)

if __name__ == '__main__':
    app.run(debug=True)

