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

  return (
    <div className="stats-container">
      <h3 className="stats-title">Crime Stats</h3>
      <p className="stats-total">Total Crimes: {crimes.length}</p>

      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data}>
            <XAxis dataKey="CrimeCode" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="Count" fill="#3498db" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CrimeStats;
