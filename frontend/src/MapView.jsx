import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./MapView.css";  // ✅ Import the CSS file


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
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedNeighborhood, setSelectedNeighborhood] = useState("");

  // Get unique districts & neighborhoods
  const districts = [...new Set(crimes.map((c) => c.District))];
  const neighborhoods = [...new Set(
    crimes
      .filter((c) => !selectedDistrict || c.District === selectedDistrict)
      .map((c) => c.Neighborhood)
  )];

  // Apply filtering
  const filteredCrimes = crimes.filter(
    (c) =>
      (!selectedDistrict || c.District === selectedDistrict) &&
      (!selectedNeighborhood || c.Neighborhood === selectedNeighborhood)
  );

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

  // India bounds
  const indiaBounds = [
    [6.5546079, 68.1113787],
    [35.6745457, 97.395561]
  ];

  const isMobile = window.innerWidth < 768;

  return (
    <div className="map-container">
      {/* Toggle Button (only visible on mobile) */}
      {isMobile && (
        <button
          className="toggle-filters"
          onClick={() => setShowFilters((prev) => !prev)}
        >
          {showFilters ? "✖" : "☰"}
        </button>
      )}

      {/* Filter Panel */}
      <div className={`filter-panel ${isMobile && !showFilters ? "hidden" : ""}`}>
        <label>
          District:
          <select
            value={selectedDistrict}
            onChange={(e) => {
              setSelectedDistrict(e.target.value);
              setSelectedNeighborhood("");
            }}
          >
            <option value="">All</option>
            {districts.map((d, idx) => (
              <option key={idx} value={d}>
                {d}
              </option>
            ))}
          </select>
        </label>
        <label>
          Neighborhood:
          <select
            value={selectedNeighborhood}
            onChange={(e) => setSelectedNeighborhood(e.target.value)}
          >
            <option value="">All</option>
            {neighborhoods.map((n, idx) => (
              <option key={idx} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
      </div>

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
        <FitBounds crimes={filteredCrimes} onBoundsChange={setCrimeBounds} />

        {/* Reset View Button */}
        {crimeBounds && <ResetViewButton bounds={crimeBounds} />}

        {filteredCrimes.map((c, idx) => (
          <CircleMarker
            key={idx}
            center={[c.Latitude, c.Longitude]}
            radius={isMobile ? 10 : 6}
            pathOptions={{
              color: "#000",
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
    </div>
  );
};

export default MapView;
