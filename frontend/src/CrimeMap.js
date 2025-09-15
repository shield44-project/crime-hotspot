import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Circle, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { fetchHotspots } from '../api';

const CrimeMap = () => {
  const [clusters, setClusters] = useState([]);
  const [filters, setFilters] = useState({});
  const [crimes, setCrimes] = useState([]);

  // Detect mobile
  const isMobile = window.innerWidth < 768;

  // Fetch hotspot clusters
  useEffect(() => {
    fetchHotspots().then(data => setClusters(data));
  }, []);

  // Fetch crimes based on filters
  useEffect(() => {
    let url = "/api/crimes";
    const params = new URLSearchParams(filters).toString();
    if (params) url += "?" + params;

    fetch(url)
      .then(res => res.json())
      .then(data => setCrimes(data));
  }, [filters]);

  // Map colors by crime type
  const crimeColors = {
    Theft: '#FF0000',
    Assault: '#0000FF',
    Robbery: '#00FF00',
    Default: '#FFFF00'
  };

  // Adjust circle radius based on device
  const getRadius = (base) => isMobile ? base * 1.5 : base;

  return (
    <MapContainer center={[22.5937, 78.9629]} zoom={5} style={{ height: '100vh', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Hotspot clusters */}
      {clusters.map(cluster => (
        <Circle
          key={cluster.cluster_id}
          center={cluster.center}
          radius={getRadius(50000)} // 50km, bigger on mobile
          color="red"
          fillColor="red"
          fillOpacity={0.8}
        >
          <Popup>
            Cluster {cluster.cluster_id} <br />
            Crimes: {cluster.points.length}
          </Popup>
        </Circle>
      ))}

      {/* Individual crimes */}
      {crimes.map((crime, index) => (
        <Circle
          key={index}
          center={[crime.lat, crime.lon]}
          radius={getRadius(5000)} // smaller than cluster
          color={crimeColors[crime.type] || crimeColors.Default}
          fillColor={crimeColors[crime.type] || crimeColors.Default}
          fillOpacity={0.9}
        >
          <Popup>
            {crime.type} <br />
            Location: {crime.location || 'Unknown'}
          </Popup>
        </Circle>
      ))}
    </MapContainer>
  );
};

export default CrimeMap;
