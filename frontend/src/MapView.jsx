import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
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
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Ensure all types return valid colors
  const getColor = type => {
    switch ((type || "").toLowerCase()) {
      case "theft": return "#ff4757"; // bright red
      case "assault": return "#ffa726"; // bright orange
      case "burglary": return "#42a5f5"; // bright blue
      case "robbery": return "#ab47bc"; // bright purple
      default: return "#66bb6a"; // bright green
    }
  };

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
        <FitBounds crimes={crimes} onBoundsChange={setCrimeBounds} />
        {crimeBounds && <ResetViewButton bounds={crimeBounds} />}

        <MarkerClusterGroup>
          {crimes.map((c, idx) => (
            <CircleMarker
              key={idx}
              center={[c.Latitude, c.Longitude]}
              radius={isMobile ? 12 : 8}
              pathOptions={{
                color: "#fff", // white border for visibility
                fillColor: getColor(c.CrimeCode), // fill color
                fillOpacity: 0.9,
                weight: isMobile ? 4 : 3
              }}
            >
              <Popup>
                <strong>{c.CrimeCode}</strong><br/>
                {c.CrimeType}<br/>
                {c.CrimeDateTime}<br/>
                {c.District} - {c.Neighborhood}
              </Popup>
            </CircleMarker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
};

export default MapView;
