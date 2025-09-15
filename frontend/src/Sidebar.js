import React, { useState } from "react";
import Filters from "./Filters";
import CrimeStats from "./CrimeStats";
import "./Sidebar.css";

const Sidebar = ({ filters, setFilters, crimes }) => {
  const [activeTab, setActiveTab] = useState("filters");
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      {/* Toggle button */}
      <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)}>
        {collapsed ? "➡️" : "⬅️"}
      </button>

      {!collapsed && (
        <>
          {/* Tabs */}
          <div className="sidebar-tabs">
            <button
              className={activeTab === "filters" ? "active" : ""}
              onClick={() => setActiveTab("filters")}
            >
              Filters
            </button>
            <button
              className={activeTab === "stats" ? "active" : ""}
              onClick={() => setActiveTab("stats")}
            >
              Crime Stats
            </button>
          </div>

          {/* Tab Content */}
          <div className="sidebar-content">
            {activeTab === "filters" && <Filters filters={filters} setFilters={setFilters} crimes={crimes} />}
            {activeTab === "stats" && <CrimeStats crimes={crimes} />}
          </div>
        </>
      )}
    </div>
  );
};

export default Sidebar;
