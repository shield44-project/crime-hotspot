import React, { useEffect, useState } from 'react';
import { fetchCrimes } from '../api';
import CrimeMap from './CrimeMap';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const [crimes, setCrimes] = useState([]);
  const [topStates, setTopStates] = useState([]);

  useEffect(() => {
    fetchCrimes().then(data => {
      setCrimes(data);
      const states = {};
      data.forEach(c => {
        states[c.State] = (states[c.State] || 0) + 1;
      });
      const sorted = Object.entries(states)
        .map(([state, count]) => ({ state, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
      setTopStates(sorted);
    });
  }, []);

  return (
    <div>
      <h2>Crime Dashboard</h2>
      <div style={{ display: 'flex', justifyContent: 'space-around' }}>
        <div>Total Crimes: {crimes.length}</div>
        <div>Top 5 States: {topStates.map(s => s.state).join(', ')}</div>
      </div>
      <div style={{ height: '400px', marginTop: '20px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={topStates}>
            <XAxis dataKey="state" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div style={{ marginTop: '20px' }}>
        <CrimeMap />
      </div>
    </div>
  );
};

export default Dashboard;
