import React from "react";
import "./Filters.css"; // ✅ add external CSS

const Filters = ({ filters, setFilters, crimes }) => {
  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const uniq = (arr) => Array.from(new Set(arr.filter(Boolean))).sort();

  const crimeCodes = uniq(crimes.map((c) => c.CrimeCode));
  const crimeTypes = uniq(crimes.map((c) => c.CrimeType));
  const crimeModes = uniq(crimes.map((c) => c.CrimeMode));
  const domains = uniq(crimes.map((c) => c.CrimeDomain));
  const places = uniq(crimes.map((c) => c.Place));

  return (
    <div className="filters-container">
      <h3 className="filters-title">Filters</h3>

      <div className="filter-group">
        <label className="filter-label">Crime Code</label>
        <select
          className="filter-input"
          name="crime_code"
          value={filters.crime_code || ""}
          onChange={handleChange}
        >
          <option value="">All</option>
          {crimeCodes.map((code) => (
            <option key={code} value={code}>
              {code}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label className="filter-label">Crime Type</label>
        <select
          className="filter-input"
          name="crime_type"
          value={filters.crime_type || ""}
          onChange={handleChange}
        >
          <option value="">All</option>
          {crimeTypes.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label className="filter-label">Crime Mode</label>
        <select
          className="filter-input"
          name="crime_mode"
          value={filters.crime_mode || ""}
          onChange={handleChange}
        >
          <option value="">All</option>
          {crimeModes.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label className="filter-label">Domain</label>
        <select
          className="filter-input"
          name="crime_domain"
          value={filters.crime_domain || ""}
          onChange={handleChange}
        >
          <option value="">All</option>
          {domains.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label className="filter-label">Place</label>
        <select
          className="filter-input"
          name="place"
          value={filters.place || ""}
          onChange={handleChange}
        >
          <option value="">All</option>
          {places.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label className="filter-label">Search Description</label>
        <input
          className="filter-input"
          type="text"
          name="description"
          placeholder="e.g., fraud, assault..."
          value={filters.description || ""}
          onChange={handleChange}
        />
      </div>

      <div className="filter-group">
        <label className="filter-label">Start</label>
        <input
          className="filter-input"
          type="datetime-local"
          name="start"
          value={filters.start || ""}
          onChange={handleChange}
        />
      </div>

      <div className="filter-group">
        <label className="filter-label">End</label>
        <input
          className="filter-input"
          type="datetime-local"
          name="end"
          value={filters.end || ""}
          onChange={handleChange}
        />
      </div>

      <div className="filter-group">
        <label className="filter-label">Latitude Min</label>
        <input
          className="filter-input"
          type="number"
          step="any"
          name="lat_min"
          value={filters.lat_min || ""}
          onChange={handleChange}
        />
      </div>

      <div className="filter-group">
        <label className="filter-label">Latitude Max</label>
        <input
          className="filter-input"
          type="number"
          step="any"
          name="lat_max"
          value={filters.lat_max || ""}
          onChange={handleChange}
        />
      </div>

      <div className="filter-group">
        <label className="filter-label">Longitude Min</label>
        <input
          className="filter-input"
          type="number"
          step="any"
          name="lon_min"
          value={filters.lon_min || ""}
          onChange={handleChange}
        />
      </div>

      <div className="filter-group">
        <label className="filter-label">Longitude Max</label>
        <input
          className="filter-input"
          type="number"
          step="any"
          name="lon_max"
          value={filters.lon_max || ""}
          onChange={handleChange}
        />
      </div>

      <div className="filter-group">
        <label className="filter-label">Limit</label>
        <input
          className="filter-input"
          type="number"
          name="limit"
          min={1}
          max={5000}
          value={filters.limit || ""}
          onChange={handleChange}
        />
      </div>
    </div>
  );
};

export default Filters;
