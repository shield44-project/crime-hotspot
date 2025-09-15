import React from "react";
import "./Filters.css"; // ✅ add external CSS

const Filters = ({ filters, setFilters }) => {
  const handleChange = e => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <div className="filters-container">
      <h3 className="filters-title">Filters</h3>

      <div className="filter-group">
        <label className="filter-label">Crime Type</label>
        <input
          className="filter-input"
          name="CrimeCode"
          value={filters.CrimeCode}
          onChange={handleChange}
        />
      </div>

      <div className="filter-group">
        <label className="filter-label">District</label>
        <input
          className="filter-input"
          name="District"
          value={filters.District}
          onChange={handleChange}
        />
      </div>

      <div className="filter-group">
        <label className="filter-label">Neighborhood</label>
        <input
          className="filter-input"
          name="Neighborhood"
          value={filters.Neighborhood}
          onChange={handleChange}
        />
      </div>

      <div className="filter-group">
        <label className="filter-label">Start Date</label>
        <input
          className="filter-input"
          type="date"
          name="StartDate"
          value={filters.StartDate}
          onChange={handleChange}
        />
      </div>

      <div className="filter-group">
        <label className="filter-label">End Date</label>
        <input
          className="filter-input"
          type="date"
          name="EndDate"
          value={filters.EndDate}
          onChange={handleChange}
        />
      </div>
    </div>
  );
};

export default Filters;
