import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./MapView.css";

// Fit map to markers
const FitBounds = ({ crimes, onBoundsChange }) => {
  const map = useMap();
  useEffect(() => {
    if (crimes.length > 0) {
      const bounds = crimes.map(c => [c.Latitude, c.Longitude]);
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
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedNeighborhood, setSelectedNeighborhood] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const districts = [...new Set(crimes.map(c => c.District))];
  const neighborhoods = [...new Set(
    crimes.filter(c => !selectedDistrict || c.District === selectedDistrict)
          .map(c => c.Neighborhood)
  )];

  const filteredCrimes = crimes.filter(
    c => (!selectedDistrict || c.District === selectedDistrict) &&
         (!selectedNeighborhood || c.Neighborhood === selectedNeighborhood)
  );

  const getColor = type => {
    switch (type) {
      case "Theft": return "red";
      case "Assault": return "orange";
      case "Burglary": return "blue";
      case "Robbery": return "purple";
      default: return "green";
    }
  };

  const isMobile = window.innerWidth < 768;

  return (
    <div className="map-container">
      {/* Toggle filters button */}
      {isMobile && (
        <button className="toggle-filters" onClick={() => setShowFilters(prev => !prev)}>
          {showFilters ? "✖" : "☰"}
        </button>
      )}

      {/* Sliding Filters Panel */}
      <div className={`filter-panel ${showFilters ? "open" : ""}`}>
        <h3>Filters</h3>
        <label>
          District:
          <select value={selectedDistrict} onChange={e => { setSelectedDistrict(e.target.value); setSelectedNeighborhood(""); }}>
            <option value="">All</option>
            {districts.map((d, idx) => <option key={idx} value={d}>{d}</option>)}
          </select>
        </label>
        <label>
          Neighborhood:
          <select value={selectedNeighborhood} onChange={e => setSelectedNeighborhood(e.target.value)}>
            <option value="">All</option>
            {neighborhoods.map((n, idx) => <option key={idx} value={n}>{n}</option>)}
          </select>
        </label>
      </div>

      {/* Floating Crime Stats */}
      <div className="crime-stats-panel">
        <h3>Crime Stats</h3>
        <p>Total Crimes: {filteredCrimes.length}</p>
        <p>Theft: {filteredCrimes.filter(c => c.CrimeType === "Theft").length}</p>
        <p>Assault: {filteredCrimes.filter(c => c.CrimeType === "Assault").length}</p>
        <p>Burglary: {filteredCrimes.filter(c => c.CrimeType === "Burglary").length}</p>
        <p>Robbery: {filteredCrimes.filter(c => c.CrimeType === "Robbery").length}</p>
      </div>

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
        <FitBounds crimes={filteredCrimes} onBoundsChange={setCrimeBounds} />
        {crimeBounds && <ResetViewButton bounds={crimeBounds} />}
        {filteredCrimes.map((c, idx) => (
          <CircleMarker
            key={idx}
            center={[c.Latitude, c.Longitude]}
            radius={isMobile ? 10 : 6}
            pathOptions={{ color: "#000", fillColor: getColor(c.CrimeType), fillOpacity: 0.9, weight: isMobile ? 3 : 2 }}
          >
            <Popup>
              <strong>{c.CrimeCode}</strong><br/>
              {c.CrimeType}<br/>
              {c.CrimeDateTime}<br/>
              {c.District} - {c.Neighborhood}
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapView;
