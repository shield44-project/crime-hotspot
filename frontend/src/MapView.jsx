import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Auto-fit map bounds to crime markers
const FitBounds = ({ crimes, onBoundsChange }) => {
  const map = useMap();

  useEffect(() => {
    if (crimes.length > 0) {
      const bounds = crimes.map((c) => [c.Latitude, c.Longitude]);
      map.fitBounds(bounds, { padding: [50, 50] });
      if (onBoundsChange) onBoundsChange(bounds);
    }
  }, [crimes, map, onBoundsChange]);

  return null;
};

// Reset button component
const ResetViewButton = ({ bounds }) => {
  const map = useMap();

  const handleReset = () => {
    if (bounds && bounds.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  };

  return (
    <button
      onClick={handleReset}
      style={{
        position: "absolute",
        top: "10px",
        right: "10px",
        zIndex: 1000,
        padding: "6px 12px",
        background: "#000",
        color: "#fff",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
        fontSize: "14px",
        fontWeight: "bold",
      }}
    >
      Reset View
    </button>
  );
};

const MapView = ({ crimes }) => {
  const [crimeBounds, setCrimeBounds] = useState(null);

  // Color by CrimeType
  const getColor = (type) => {
    switch (type) {
      case "Theft": return "red";
      case "Assault": return "orange";
      case "Burglary": return "blue";
      case "Robbery": return "purple";
      default: return "green";
    }
  };

  // India bounds: [southWest, northEast]
  const indiaBounds = [
    [6.5546079, 68.1113787],  // SW corner
    [35.6745457, 97.395561]   // NE corner
  ];

  // Detect if on mobile
  const isMobile = window.innerWidth < 768;

  return (
    <MapContainer
      center={[20.5937, 78.9629]}
      zoom={5}
      style={{ height: "100%", width: "100%" }}
      maxBounds={indiaBounds}
      maxBoundsViscosity={1.0}
      minZoom={5}
      maxZoom={12}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {/* Auto-fit and track bounds */}
      <FitBounds crimes={crimes} onBoundsChange={setCrimeBounds} />

      {/* Reset View Button */}
      {crimeBounds && <ResetViewButton bounds={crimeBounds} />}

      {crimes.map((c, idx) => (
        <CircleMarker
          key={idx}
          center={[c.Latitude, c.Longitude]}
          radius={isMobile ? 10 : 6}
          pathOptions={{
            color: "#000", // black border for contrast
            fillColor: getColor(c.CrimeType),
            fillOpacity: 0.9,
            weight: isMobile ? 3 : 2,
          }}
        >
          <Popup>
            <strong>{c.CrimeCode}</strong><br />
            {c.CrimeType}<br />
            {c.CrimeDateTime}<br />
            {c.District} - {c.Neighborhood}
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
};

export default MapView;
