import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import "./CrimeStats.css"; // ✅ add external CSS

const CrimeStats = ({ crimes }) => {
  const counts = crimes.reduce((acc, c) => {
    acc[c.CrimeCode] = (acc[c.CrimeCode] || 0) + 1;
    return acc;
  }, {});

  const data = Object.keys(counts).map(key => ({
    CrimeCode: key,
    Count: counts[key],
  }));

  const exportToCSV = () => {
    const headers = ["Latitude", "Longitude", "CrimeCode", "CrimeType", "CrimeDateTime", "District", "Neighborhood"];
    const csvContent = [
      headers.join(","),
      ...crimes.map(c => [c.Latitude, c.Longitude, c.CrimeCode, c.CrimeType, c.CrimeDateTime, c.District, c.Neighborhood].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "filtered_crimes.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="stats-container">
      <h3 className="stats-title">Crime Stats</h3>
      <p className="stats-total">Total Crimes: {crimes.length}</p>
      <button className="export-btn" onClick={exportToCSV}>📥 Export CSV</button>

      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data}>
            <XAxis dataKey="CrimeCode" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="Count" fill="#ffffff" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CrimeStats;
