import React from "react";
import "./Filters.css"; // ✅ add external CSS

const Filters = ({ filters, setFilters, crimes }) => {
  const handleChange = e => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const crimeCodes = [...new Set(crimes.map(c => c.CrimeCode))].sort();
  const districts = [...new Set(crimes.map(c => c.District))].sort();
  const neighborhoods = [...new Set(crimes.map(c => c.Neighborhood))].sort();

  return (
    <div className="filters-container">
      <h3 className="filters-title">Filters</h3>

      <div className="filter-group">
        <label className="filter-label">Crime Type</label>
        <select
          className="filter-input"
          name="CrimeCode"
          value={filters.CrimeCode}
          onChange={handleChange}
        >
          <option value="">All</option>
          {crimeCodes.map(code => <option key={code} value={code}>{code}</option>)}
        </select>
      </div>

      <div className="filter-group">
        <label className="filter-label">District</label>
        <select
          className="filter-input"
          name="District"
          value={filters.District}
          onChange={handleChange}
        >
          <option value="">All</option>
          {districts.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      <div className="filter-group">
        <label className="filter-label">Neighborhood</label>
        <select
          className="filter-input"
          name="Neighborhood"
          value={filters.Neighborhood}
          onChange={handleChange}
        >
          <option value="">All</option>
          {neighborhoods.map(n => <option key={n} value={n}>{n}</option>)}
        </select>
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
