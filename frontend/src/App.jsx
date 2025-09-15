import React, { useState, useEffect } from "react";
import MapView from "./MapView";
import CrimeStats from "./CrimeStats";
import Filters from "./Filters";
import Sidebar from "./Sidebar";

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
    fetch(`/api/crimes?${params.toString()}`)
      .then(res => res.json())
      .then(data => setCrimes(data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchData();
  }, [filters]);

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
