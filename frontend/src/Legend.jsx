import React from "react";
import "./Legend.css";

const Legend = () => {
  const crimeTypes = [
    { type: "Theft / Identity Theft / Vehicle - Stolen / Shoplifting", color: "#ff4757" },
    { type: "Assault / Domestic Violence / Homicide / Sexual Assault / Robbery", color: "#ffa726" },
    { type: "Burglary", color: "#42a5f5" },
    { type: "Arson / Firearm Offense", color: "#ef5350" },
    { type: "Cybercrime / Fraud / Counterfeiting / Extortion", color: "#ab47bc" },
    { type: "Drug/Illegal Possession/Public Intoxication", color: "#66bb6a" },
    { type: "Traffic Violation", color: "#ffee58" },
    { type: "Vandalism", color: "#29b6f6" },
    { type: "Other / Unknown", color: "#90a4ae" },
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