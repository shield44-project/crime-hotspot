import React, { useState, useEffect } from "react";
import MapView from "./MapView";
import CrimeStats from "./CrimeStats";
import Filters from "./Filters";

const App = () => {
  const [crimes, setCrimes] = useState([]);
  const [filters, setFilters] = useState({
    CrimeCode: "",
    District: "",
    Neighborhood: "",
    StartDate: "",
    EndDate: "",
  });

  // Fetch data from Flask with filters
  const fetchData = () => {
    const params = new URLSearchParams(filters);
    fetch(`http://127.0.0.1:5000/api/crimes?${params.toString()}`)
      .then(res => res.json())
      .then(data => setCrimes(data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchData();
  }, [filters]);

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <div style={{ flex: 1, padding: "20px", overflowY: "auto", backgroundColor: "#f9f9f9" }}>
        <Filters filters={filters} setFilters={setFilters} crimes={crimes} />
        <CrimeStats crimes={crimes} />
      </div>
      <div style={{ flex: 2 }}>
        <MapView crimes={crimes} />
      </div>
    </div>
  );
};

export default App;
