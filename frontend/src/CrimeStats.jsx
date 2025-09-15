import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const CrimeStats = ({ crimes }) => {
  const counts = crimes.reduce((acc, c) => {
    acc[c.CrimeCode] = (acc[c.CrimeCode] || 0) + 1;
    return acc;
  }, {});

  const data = Object.keys(counts).map(key => ({ CrimeCode: key, Count: counts[key] }));

  return (
    <div>
      <h3>Crime Stats</h3>
      <p>Total Crimes: {crimes.length}</p>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data}>
          <XAxis dataKey="CrimeCode" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="Count" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CrimeStats;
