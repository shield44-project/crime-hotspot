# Crime Hotspot

A web application to visualize crime hotspots in India using interactive maps. This project uses **React** for the frontend and **Flask** for the backend with a Kaggle crime dataset.

---

## Features

- Interactive map using **Leaflet**.
- Displays crimes as markers on the map.
- Markers are color-coded by crime type.
- Fetches real-time data from the Flask backend.

---

## Prerequisites

- Node.js v18+ and Yarn
- Python 3.8+
- pip (Python package manager)
- Virtualenv (recommended)

---


## Setup

### Backend

---
1. Navigate to the backend folder:

cd backend
Create and activate a virtual environment:


python3 -m venv venv
source venv/bin/activate   # Linux / Mac
venv\Scripts\activate    # Windows
---
### Install required packages:
---
pip install -r requirements.txt
Make sure crime_data.csv exists in the backend folder.

Run the backend server:

python app.py
The API will be available at: http://127.0.0.1:5000/api/crimes
---

###Frontend

---
Navigate to the frontend folder:

cd frontend
Install dependencies using Yarn:

yarn install
Start the frontend:

yarn start
The app will open in your browser at http://localhost:3000.
---

###How to Use
---
Open the app in your browser.

The map displays crime locations across India.

Each marker represents a crime; the color indicates the type.

Click on a marker to see details about the crime.
---

Notes
---
Make sure the backend is running before starting the frontend, otherwise markers will not load.

The app currently does not use marker clustering to ensure compatibility with React 18.

Future Improvements
Add marker clustering for better visualization.

Filter crimes by type, city, or state.

Add search and zoom functionality.
---

---
License: All rights reserved
---
