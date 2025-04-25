import json
import os
import time

from flask import Flask, request, jsonify
from flask_cors import CORS

# We asume the JSON file named "alerts.json".
json_file = os.path.join(os.path.dirname(__file__), "alerts.json")

def read_alerts(path):
    try:
        with open(path, 'r') as file:
            data = json.load(file)
            print(f"Data was read from {len(data)}.")
            return data
    except FileNotFoundError:
        print("File not found.")
        return []
    except json.JSONDecodeError as e:
        print(f"Error while decoding JSON: {e}")
        return []

def main():
    while True:
        alerts = read_alerts(json_file)

        # Work with data here.
        for i, alert in enumerate(alerts):
            print(f"Alert #{i+1}: {alert}")
            data = request.get_json();
            
            # Print the data received from the request
            print(f"Data received: {data}")

        # 120 seconds delay
        time.sleep(120)

if __name__ == "__main__":
    main()