import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { fetchHotspots } from '../api';

const CrimeMap = () => {
  const [clusters, setClusters] = useState([]);

  useEffect(() => {
    fetchHotspots().then(data => setClusters(data));
  }, []);

  return (
    <MapContainer center={[22.5937, 78.9629]} zoom={5} style={{ height: '500px', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {clusters.map(cluster => (
        <Circle
          key={cluster.cluster_id}
          center={cluster.center}
          radius={50000} // 50km radius
          color="red"
        >
          <Popup>
            Cluster {cluster.cluster_id} <br />
            Crimes: {cluster.points.length}
          </Popup>
        </Circle>
      ))}
    </MapContainer>
  );
};

const [filters, setFilters] = useState({});
const [crimes, setCrimes] = useState([]);

useEffect(() => {
  let url = "/api/crimes";
  const params = new URLSearchParams(filters).toString();
  if (params) url += "?" + params;

  fetch(url)
    .then(res => res.json())
    .then(data => setCrimes(data));
}, [filters]);

export default CrimeMap;
