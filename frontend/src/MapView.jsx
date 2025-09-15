import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const MapView = ({ crimes }) => {
  const getColor = code => {
    switch(code) {
      case "Theft": return "red";
      case "Assault": return "orange";
      case "Burglary": return "blue";
      default: return "green";
    }
  };

  const center = crimes.length ? [crimes[0].Latitude, crimes[0].Longitude] : [20.5937, 78.9629];

  // India bounds: [southWest, northEast]
  const indiaBounds = [
    [6.5546079, 68.1113787],  // SW corner
    [35.6745457, 97.395561]   // NE corner
  ];

  return (
    <MapContainer 
      center={center} 
      zoom={5} 
      style={{ height: '100%', width: '100%' }}
      maxBounds={indiaBounds}       // restrict to India
      maxBoundsViscosity={1.0}     // prevent dragging outside bounds
      minZoom={5}                   // optional: prevent zooming out too far
      maxZoom={12}                  // optional: prevent zooming in too far
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {crimes.map((c, idx) => (
        <CircleMarker 
          key={idx} 
          center={[c.Latitude, c.Longitude]} 
          pathOptions={{ color: getColor(c.CrimeCode) }} 
          radius={6}
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
  );
};

export default MapView;
