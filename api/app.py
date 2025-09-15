import os
from flask import Flask, jsonify, request, send_from_directory
import pandas as pd
from flask_cors import CORS

app = Flask(__name__, static_folder="frontend/build", static_url_path="")
CORS(app)

# Load your crime data
crime_df = pd.read_csv("crime_data.csv")

# API endpoint
@app.route("/api/crimes")
def get_crimes():
    df = crime_df.copy()

    crime_code = request.args.get("CrimeCode")
    district = request.args.get("District")
    neighborhood = request.args.get("Neighborhood")
    start_date = request.args.get("StartDate")
    end_date = request.args.get("EndDate")

    if crime_code:
        df = df[df["CrimeCode"] == crime_code]
    if district:
        df = df[df["District"] == district]
    if neighborhood:
        df = df[df["Neighborhood"] == neighborhood]
    if start_date:
        df = df[df["CrimeDateTime"] >= start_date]
    if end_date:
        df = df[df["CrimeDateTime"] <= end_date]

    return jsonify(df.to_dict(orient="records"))

# Serve React frontend
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_react(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, "index.html")

if __name__ == "__main__":
    app.run(debug=True)
