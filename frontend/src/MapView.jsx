import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const MapView = ({ crimes }) => {
  // Color by CrimeType (not CrimeCode)
  const getColor = (type) => {
    switch (type) {
      case "Theft": return "red";
      case "Assault": return "orange";
      case "Burglary": return "blue";
      case "Robbery": return "purple";
      default: return "green";
    }
  };

  const center = crimes.length
    ? [crimes[0].Latitude, crimes[0].Longitude]
    : [20.5937, 78.9629]; // fallback: India center

  // India bounds: [southWest, northEast]
  const indiaBounds = [
    [6.5546079, 68.1113787],  // SW corner
    [35.6745457, 97.395561]   // NE corner
  ];

  // Detect if on mobile
  const isMobile = window.innerWidth < 768;

  return (
    <MapContainer
      center={center}
      zoom={5}
      style={{ height: '100%', width: '100%' }}
      maxBounds={indiaBounds}
      maxBoundsViscosity={1.0}
      minZoom={5}
      maxZoom={12}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {crimes.map((c, idx) => (
        <CircleMarker
          key={idx}
          center={[c.Latitude, c.Longitude]}
          radius={isMobile ? 10 : 6} // larger on mobile
          pathOptions={{
            color: "#000", // black border for contrast
            fillColor: getColor(c.CrimeType),
            fillOpacity: 0.9,
            weight: isMobile ? 3 : 2, // thicker border on mobile
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
