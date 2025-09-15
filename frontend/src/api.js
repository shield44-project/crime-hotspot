import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

export const fetchCrimes = () => axios.get(`${BASE_URL}/crimes`).then(res => res.data);
export const fetchHotspots = () => axios.get(`${BASE_URL}/hotspots`).then(res => res.data);
