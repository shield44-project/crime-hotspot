import React, { useState } from "react";
import Filters from "./Filters";
import CrimeStats from "./CrimeStats";
import Legend from "./Legend";
import "./Sidebar.css";

const Sidebar = ({ filters, setFilters, crimes }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      {/* Header */}
      <div className="sidebar-header">
        <h2>Crime Dashboard</h2>
        <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? "→" : "←"}
        </button>
      </div>

      {!collapsed && (
        <div className="sidebar-content">
          {/* Filters Section */}
          <div className="sidebar-section">
            <h3>🔍 Filters</h3>
            <Filters filters={filters} setFilters={setFilters} crimes={crimes} />
          </div>

          {/* Stats Section */}
          <div className="sidebar-section">
            <h3>📊 Statistics</h3>
            <CrimeStats crimes={crimes} />
          </div>

          {/* Legend Section */}
          <div className="sidebar-section">
            <h3>🗺️ Legend</h3>
            <Legend />
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
