import React from "react";
import "./Legend.css";

const Legend = () => {
  const crimeTypes = [
    { type: "Theft", color: "#ff4757" },
    { type: "Assault", color: "#ffa726" },
    { type: "Burglary", color: "#42a5f5" },
    { type: "Robbery", color: "#ab47bc" },
    { type: "Other", color: "#66bb6a" },
  ];

  return (
    <div className="legend-container">
      <h4>Crime Legend</h4>
      <div className="legend-items">
        {crimeTypes.map((crime) => (
          <div key={crime.type} className="legend-item">
            <div
              className="legend-color"
              style={{ backgroundColor: crime.color }}
            ></div>
            <span>{crime.type}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Legend;