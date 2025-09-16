import React, { useState, useEffect } from "react";
import MapView from "./MapView";
import CrimeStats from "./CrimeStats";
import Filters from "./Filters";
import Sidebar from "./Sidebar";

const App = () => {
  const [crimes, setCrimes] = useState([]);
  const [filters, setFilters] = useState({
    dataset: "@/api/datasets/enhanced_crime_data.csv",
    crime_code: "",
    crime_type: "",
    crime_mode: "",
    description: "",
    place: "",
    crime_domain: "",
    start: "",
    end: "",
    lat_min: "",
    lat_max: "",
    lon_min: "",
    lon_max: "",
    limit: 500, // default to a manageable number
  });

  // Fetch data from Flask with filters
  const fetchData = () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") params.set(k, v);
    });
    fetch(`/api/crimes?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => setCrimes(Array.isArray(data) ? data : []))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchData();
  }, [JSON.stringify(filters)]);

  return (
    <div style={{ display: "flex", height: "100vh", background: "#000000" }}>
      <Sidebar filters={filters} setFilters={setFilters} crimes={crimes} />
      <div style={{ flex: 1, position: "relative" }}>
        <MapView crimes={crimes} />
      </div>
    </div>
  );
};

export default App;
