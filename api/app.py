import os
from datetime import datetime
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import pandas as pd
import numpy as np
from sklearn.cluster import KMeans

# Resolve paths relative to this file
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Create app
app = Flask(__name__, static_folder=os.path.join(BASE_DIR, "..", "frontend", "build"), static_url_path="")
CORS(app)

# Canonical column names we return to the frontend
CANONICAL_COLS = [
    "Latitude",
    "Longitude",
    "CrimeCode",
    "CrimeType",
    "CrimeMode",
    "CrimeDescription",
    "Time",
    "Place",
    "CrimeDomain",
]

# Known synonyms mapping (lowercase keys)
SYNONYMS = {
    "Latitude": {"latitude", "lat"},
    "Longitude": {"longitude", "lon", "lng", "long"},
    "CrimeCode": {"crime_code", "crimecode", "code"},
    "CrimeType": {"crime_type", "crimetype", "type"},
    "CrimeMode": {"crime_mode", "crimemode", "mode"},
    "CrimeDescription": {"crime_description", "crimedescription", "description", "desc"},
    "Time": {"time", "datetime", "crime_datetime", "crime_date_time", "crimedatetime", "crime date time", "crime date", "crimedate", "date", "timestamp", "crimedatetime"},
    "Place": {"place", "city", "district", "neighborhood", "location", "area"},
    "CrimeDomain": {"crime_domain", "crimedomain", "domain", "category"},
}

DEFAULT_DATASETS = [
    # Highest priority: rich schema with lat/lon etc.
    os.path.join(BASE_DIR, "datasets", "enhanced_crime_data.csv"),
    # Fallback: original basic schema
    os.path.join(BASE_DIR, "crime_data.csv"),
]

_loaded_cache = {}


def _find_col(df: pd.DataFrame, candidates: set):
    cols_lower = {c.lower(): c for c in df.columns}
    for cand in candidates:
        if cand in cols_lower:
            return cols_lower[cand]
    return None


def _normalize_df(df: pd.DataFrame) -> pd.DataFrame:
    """Rename columns to canonical names when possible and coerce dtypes.
    Will only keep columns that can be mapped or already exist.
    """
    rename_map = {}
    cols_lower = {c.lower(): c for c in df.columns}

    # Map synonyms
    for canonical, syns in SYNONYMS.items():
        found = _find_col(df, syns)
        if found is not None:
            rename_map[found] = canonical
        else:
            # If canonical already exists in some case form, map it to itself
            if canonical.lower() in cols_lower:
                rename_map[cols_lower[canonical.lower()]] = canonical

    df = df.rename(columns=rename_map)

    # Coerce types where appropriate
    if "Latitude" in df.columns:
        df["Latitude"] = pd.to_numeric(df["Latitude"], errors="coerce")
    if "Longitude" in df.columns:
        df["Longitude"] = pd.to_numeric(df["Longitude"], errors="coerce")

    if "Time" in df.columns:
        # Parse datetimes and keep a human/ISO string for output
        dt = pd.to_datetime(df["Time"], errors="coerce")
        df["Time"] = dt.dt.strftime("%Y-%m-%d %H:%M:%S")

    # Ensure CrimeCode is string for consistent filtering
    if "CrimeCode" in df.columns:
        df["CrimeCode"] = df["CrimeCode"].astype(str)

    # Provide defaults if some columns missing
    if "CrimeDomain" not in df.columns and "CrimeType" in df.columns:
        # Rough mapping: infer domain from type keywords
        def infer_domain(t: str):
            t = (t or "").lower()
            if any(k in t for k in ["assault", "homicide", "robbery", "sexual", "violence", "kidnap"]):
                return "Violent Crime"
            if "traffic" in t:
                return "Traffic Fatality"
            if any(k in t for k in ["arson", "firearm", "fire"]):
                return "Fire Accident"
            return "Other Crime"
        df["CrimeDomain"] = df["CrimeType"].astype(str).map(infer_domain)

    # Select only canonical columns that exist
    existing = [c for c in CANONICAL_COLS if c in df.columns]
    return df[existing].copy()


def _load_dataset(dataset_param: str | None, limit: int | None) -> pd.DataFrame:
    """Load CSV from either an explicit path (relative to api folder) or default dataset.
    Returns a normalized DataFrame and applies optional limit.
    """
    paths = []
    if dataset_param:
        # Normalize various frontend-style hints like "@/api/...", "/api/...", "api/..."
        p = str(dataset_param).strip()
        for prefix in ("@/api/", "/api/", "api/"):
            if p.startswith(prefix):
                p = p[len(prefix):]
                break
        # Allow absolute or relative; resolve relative to BASE_DIR
        if not os.path.isabs(p):
            p = os.path.join(BASE_DIR, p)
        if os.path.exists(p):
            paths.append(p)
    paths.extend(DEFAULT_DATASETS)

    last_err = None
    for p in paths:
        try:
            mtime = os.path.getmtime(p)
            cache_key = (p, mtime)
            if cache_key in _loaded_cache:
                df = _loaded_cache[cache_key]
            else:
                df = pd.read_csv(p)
                df = _normalize_df(df)
                _loaded_cache.clear()  # drop stale cache for other versions
                _loaded_cache[cache_key] = df
            if limit is not None and limit > 0:
                return df.head(limit).copy()
            return df.copy()
        except Exception as e:
            last_err = e
            continue
    # If no dataset could be loaded
    raise RuntimeError(f"Failed to load any dataset. Last error: {last_err}")


@app.route("/api/crimes")
def get_crimes():
    # Parameters
    dataset = request.args.get("dataset")  # optional path like "datasets/enhanced_crime_data.csv"
    limit = request.args.get("limit")
    try:
        limit_val = int(limit) if limit not in (None, "",) else None
    except ValueError:
        limit_val = None

    # Backward compatibility for old filters
    old_start = request.args.get("StartDate")
    old_end = request.args.get("EndDate")
    old_district = request.args.get("District")
    old_neighborhood = request.args.get("Neighborhood")

    # New filters
    f_code = request.args.get("crime_code") or request.args.get("CrimeCode")
    f_type = request.args.get("crime_type") or request.args.get("CrimeType")
    f_mode = request.args.get("crime_mode") or request.args.get("CrimeMode")
    f_desc = request.args.get("description") or request.args.get("CrimeDescription")
    f_place = request.args.get("place") or request.args.get("Place") or old_district or old_neighborhood
    f_domain = request.args.get("crime_domain") or request.args.get("CrimeDomain")

    f_start = request.args.get("start") or request.args.get("Start") or old_start
    f_end = request.args.get("end") or request.args.get("End") or old_end

    # Ranges for coordinates
    lat_min = request.args.get("lat_min")
    lat_max = request.args.get("lat_max")
    lon_min = request.args.get("lon_min")
    lon_max = request.args.get("lon_max")

    try:
        df = _load_dataset(dataset, limit_val)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    # Apply filters safely
    if f_code and "CrimeCode" in df.columns:
        df = df[df["CrimeCode"].astype(str) == str(f_code)]

    if f_type and "CrimeType" in df.columns:
        df = df[df["CrimeType"].astype(str).str.lower() == str(f_type).lower()]

    if f_mode and "CrimeMode" in df.columns:
        df = df[df["CrimeMode"].astype(str).str.lower() == str(f_mode).lower()]

    if f_domain and "CrimeDomain" in df.columns:
        df = df[df["CrimeDomain"].astype(str).str.lower() == str(f_domain).lower()]

    if f_place and "Place" in df.columns:
        # Allow contains to cover districts/neighborhoods
        df = df[df["Place"].astype(str).str.contains(str(f_place), case=False, na=False)]

    if f_desc and "CrimeDescription" in df.columns:
        df = df[df["CrimeDescription"].astype(str).str.contains(str(f_desc), case=False, na=False)]

    if (f_start or f_end) and "Time" in df.columns:
        ts = pd.to_datetime(df["Time"], errors="coerce")
        if f_start:
            try:
                start_ts = pd.to_datetime(f_start)
                df = df[ts >= start_ts]
            except Exception:
                pass
        if f_end:
            try:
                end_ts = pd.to_datetime(f_end)
                df = df[ts <= end_ts]
            except Exception:
                pass

    # Coordinate ranges
    def _to_float(v):
        try:
            return float(v)
        except (TypeError, ValueError):
            return None

    if "Latitude" in df.columns:
        lo = _to_float(lat_min)
        hi = _to_float(lat_max)
        if lo is not None:
            df = df[df["Latitude"] >= lo]
        if hi is not None:
            df = df[df["Latitude"] <= hi]

    if "Longitude" in df.columns:
        lo = _to_float(lon_min)
        hi = _to_float(lon_max)
        if lo is not None:
            df = df[df["Longitude"] >= lo]
        if hi is not None:
            df = df[df["Longitude"] <= hi]

    # Re-limit after filtering if limit provided
    if limit_val is not None and limit_val > 0:
        df = df.head(limit_val)

    # Return only canonical that exist
    existing = [c for c in CANONICAL_COLS if c in df.columns]
    return jsonify(df[existing].to_dict(orient="records"))


# Hotspot clustering endpoint used by some frontends
@app.route("/api/hotspots")
def get_hotspots():
    dataset = request.args.get("dataset")
    limit = request.args.get("limit")
    try:
        limit_val = int(limit) if limit not in (None, "",) else None
    except ValueError:
        limit_val = None

    try:
        df = _load_dataset(dataset, limit_val)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    # Need coordinates
    if "Latitude" not in df.columns or "Longitude" not in df.columns:
        return jsonify([])

    pts = df[["Latitude", "Longitude"]].dropna()
    pts = pts[(pts["Latitude"].between(-90, 90)) & (pts["Longitude"].between(-180, 180))]
    if len(pts) == 0:
        return jsonify([])

    n = len(pts)
    # Dynamic cluster count: roughly one cluster per ~200 points, up to 10
    k = max(1, min(10, n // 200))

    if k == 1:
        center = [float(pts["Latitude"].mean()), float(pts["Longitude"].mean())]
        return jsonify([
            {"cluster_id": 0, "center": center, "points": list(range(int(n)))}
        ])

    X = pts.to_numpy()
    try:
        km = KMeans(n_clusters=k, n_init=10, random_state=42)
        labels = km.fit_predict(X)
        centers = km.cluster_centers_
    except Exception:
        center = [float(pts["Latitude"].mean()), float(pts["Longitude"].mean())]
        return jsonify([
            {"cluster_id": 0, "center": center, "points": list(range(int(n)))}
        ])

    clusters = []
    for cid in range(k):
        mask = labels == cid
        count = int(mask.sum())
        if count == 0:
            continue
        c = centers[cid]
        clusters.append({
            "cluster_id": int(cid),
            "center": [float(c[0]), float(c[1])],
            "points": [int(i) for i in np.nonzero(mask)[0]]
        })

    return jsonify(clusters)

# Serve built frontend if available
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_react(path):
    static_folder = app.static_folder
    if path != "" and os.path.exists(os.path.join(static_folder, path)):
        return send_from_directory(static_folder, path)
    index_path = os.path.join(static_folder, "index.html")
    if os.path.exists(index_path):
        return send_from_directory(static_folder, "index.html")
    # If build not present, return minimal health message
    return ("Frontend build not found. API is running.", 200)


if __name__ == "__main__":
    # By default, bind to 0.0.0.0 so it works in containers, debug off in production
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)), debug=True)
