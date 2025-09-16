import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, Rectangle } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "./styles/MarkerCluster.css";
import "./styles/MarkerCluster.Default.css";
import "./MapView.css";

// Fit map to markers
const FitBounds = ({ crimes, onBoundsChange }) => {
  const map = useMap();
  useEffect(() => {
    const pts = crimes.filter((c) => Number.isFinite(c.Latitude) && Number.isFinite(c.Longitude));
    if (pts.length > 0) {
      const bounds = pts.map((c) => [c.Latitude, c.Longitude]);
      map.fitBounds(bounds, { padding: [50, 50] });
      if (onBoundsChange) onBoundsChange(bounds);
    }
  }, [crimes, map, onBoundsChange]);
  return null;
};

// Reset map view button
const ResetViewButton = ({ bounds }) => {
  const map = useMap();
  const handleReset = () => {
    if (bounds?.length) map.fitBounds(bounds, { padding: [50, 50] });
  };
  return <button className="reset-button" onClick={handleReset}>Reset View</button>;
};

const MapView = ({ crimes }) => {
  const [crimeBounds, setCrimeBounds] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Color by crime type for regions/markers
  const getColor = (type) => {
    switch ((type || "").toLowerCase()) {
      case "identity theft":
      case "theft":
      case "vehicle - stolen":
      case "shoplifting":
        return "#ff4757"; // red shades for theft-related
      case "assault":
      case "domestic violence":
      case "homicide":
      case "sexual assault":
      case "robbery":
        return "#ffa726"; // orange for violent crimes
      case "burglary":
        return "#42a5f5"; // blue for burglary
      case "arson":
      case "firearm offense":
        return "#ef5350"; // strong red for fire-related
      case "cybercrime":
      case "fraud":
      case "counterfeiting":
      case "extortion":
        return "#ab47bc"; // purple for economic/cyber
      case "drug offense":
      case "illegal possession":
      case "public intoxication":
        return "#66bb6a"; // green for substance/possession
      case "traffic violation":
        return "#ffee58"; // yellow for traffic
      case "vandalism":
        return "#29b6f6"; // light blue
      default:
        return "#90a4ae"; // gray fallback
    }
  };

  // Build marker icon as a simple colored dot using DivIcon (no image assets needed)
  const getMarkerIcon = (type, mobile) => {
    const color = getColor(type);
    const size = mobile ? 24 : 18;
    const html = `<span style="
      display:inline-block;
      width:${size}px;
      height:${size}px;
      border-radius:50%;
      background:${color};
      border:2px solid #fff;
      box-shadow:0 0 3px rgba(0,0,0,0.6);
    "></span>`;
    return L.divIcon({
      className: "leaflet-div-icon crime-marker",
      html,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2]
    });
  };

  // Build a simple grid overlay to mark regions with crimes
  const validCrimes = crimes.filter((c) => Number.isFinite(c.Latitude) && Number.isFinite(c.Longitude));
  const cellSize = 0.5; // degrees; coarse grid for country-level view

  const bins = new Map();
  for (const c of validCrimes) {
    const lat = c.Latitude;
    const lon = c.Longitude;
    const type = c.CrimeType || c.CrimeCode || "Other";
    const latKey = Math.floor(lat / cellSize) * cellSize;
    const lonKey = Math.floor(lon / cellSize) * cellSize;
    const key = `${latKey.toFixed(3)},${lonKey.toFixed(3)}`;
    let bin = bins.get(key);
    if (!bin) {
      bin = { lat0: latKey, lon0: lonKey, count: 0, typeCounts: {} };
      bins.set(key, bin);
    }
    bin.count += 1;
    bin.typeCounts[type] = (bin.typeCounts[type] || 0) + 1;
  }

  let maxCount = 0;
  const gridRects = [];
  bins.forEach((bin) => {
    if (bin.count > maxCount) maxCount = bin.count;
  });
  bins.forEach((bin, key) => {
    // Determine dominant type
    let topType = "Other";
    let topVal = -1;
    for (const [t, v] of Object.entries(bin.typeCounts)) {
      if (v > topVal) { topVal = v; topType = t; }
    }
    const color = getColor(topType);
    const intensity = maxCount > 0 ? Math.min(0.8, 0.2 + (bin.count / maxCount) * 0.6) : 0.2;
    const bounds = [
      [bin.lat0, bin.lon0],
      [bin.lat0 + cellSize, bin.lon0 + cellSize]
    ];
    gridRects.push({ key, bounds, color, intensity, count: bin.count, topType });
  });

  return (
    <div className="map-container">
      <MapContainer
        center={[20.5937, 78.9629]}
        zoom={5}
        style={{ height: "100%", width: "100%" }}
        maxBounds={[[6.5, 68.1],[35.6,97.3]]}
        maxBoundsViscosity={1.0}
        minZoom={5}
        maxZoom={12}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {/* Region density overlay (dominant type color, opacity by density) */}
        {gridRects.map((g) => (
          <Rectangle
            key={`grid-${g.key}`}
            bounds={g.bounds}
            interactive={false}
            pathOptions={{ fillColor: g.color, fillOpacity: g.intensity, color: g.color, weight: 0 }}
          >
            <Popup>
              <div>
                <strong>Crimes:</strong> {g.count}<br/>
                <strong>Dominant:</strong> {g.topType}
              </div>
            </Popup>
          </Rectangle>
        ))}

        <FitBounds crimes={crimes} onBoundsChange={setCrimeBounds} />
        {crimeBounds && <ResetViewButton bounds={crimeBounds} />}

        <>
          {crimes
            .filter((c) => Number.isFinite(c.Latitude) && Number.isFinite(c.Longitude))
            .map((c, idx) => (
              <Marker
                key={idx}
                position={[c.Latitude, c.Longitude]}
                icon={getMarkerIcon(c.CrimeType || c.CrimeCode, isMobile)}
                zIndexOffset={1000}
              >
                <Popup>
                  <strong>{c.CrimeType || c.CrimeCode}</strong><br/>
                  Code: {c.CrimeCode}<br/>
                  Mode: {c.CrimeMode || "-"}<br/>
                  Domain: {c.CrimeDomain || "-"}<br/>
                  Time: {c.Time || "-"}<br/>
                  Place: {c.Place || "-"}
                </Popup>
              </Marker>
            ))}
        </>
      </MapContainer>
    </div>
  );
};

export default MapView;
