import React from "react";

const Filters = ({ filters, setFilters }) => {
  const handleChange = e => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <div style={{ marginBottom: "20px" }}>
      <h3>Filters</h3>
      <div>
        <label>Crime Type: </label>
        <input name="CrimeCode" value={filters.CrimeCode} onChange={handleChange} />
      </div>
      <div>
        <label>District: </label>
        <input name="District" value={filters.District} onChange={handleChange} />
      </div>
      <div>
        <label>Neighborhood: </label>
        <input name="Neighborhood" value={filters.Neighborhood} onChange={handleChange} />
      </div>
      <div>
        <label>Start Date: </label>
        <input type="date" name="StartDate" value={filters.StartDate} onChange={handleChange} />
      </div>
      <div>
        <label>End Date: </label>
        <input type="date" name="EndDate" value={filters.EndDate} onChange={handleChange} />
      </div>
    </div>
  );
};

export default Filters;
