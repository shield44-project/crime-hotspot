import React, { useState, useEffect, useMemo } from "react";
import MapView from "./MapView";
import CrimeStats from "./CrimeStats";
import Filters from "./Filters";
import Sidebar from "./Sidebar";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import "./App.css";

// Normalize various schemas to a common internal shape
function normalizeRecords(records) {
  const out = [];
  for (const r of records) {
    if (!r) continue;
    // Try common latitude/longitude key variants
    const lat = parseFloat(
      r.lat ?? r.latitude ?? r.Latitude ?? r.LAT ?? r.y ?? r.Y ?? r.Lat
    );
    const lon = parseFloat(
      r.lon ?? r.lng ?? r.long ?? r.longitude ?? r.Longitude ?? r.LON ?? r.LNG ?? r.x ?? r.X ?? r.Lon
    );
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;

    // Infer textual fields
    const type = r.CrimeType ?? r.type ?? r.Type ?? r.category ?? r.Category ?? r.offense ?? r.Offense ?? r.crime_type;
    const code = r.CrimeCode ?? r.code ?? r.Code ?? r.UCR ?? r.ucr ?? r.crime_code;
    const mode = r.CrimeMode ?? r.mode ?? r.Mode ?? r.method ?? r.Method;
    const desc = r.CrimeDescription ?? r.description ?? r.Description ?? r.desc ?? r.DESC;
    const time = r.Time ?? r.datetime ?? r.timestamp ?? r.date ?? r.Date ?? r.time ?? r.TimeStamp;
    const place = r.Place ?? r.location ?? r.Location ?? r.address ?? r.Address;
    const domain = r.CrimeDomain ?? r.domain ?? r.Domain ?? r.context ?? r.Context;

    out.push({
      Latitude: lat,
      Longitude: lon,
      CrimeType: type ?? "Unknown",
      CrimeCode: code ?? "",
      CrimeMode: mode ?? "",
      CrimeDescription: desc ?? "",
      Time: time ?? "",
      Place: place ?? "",
      CrimeDomain: domain ?? "",
      __raw: r,
    });
  }
  return out;
}

const App = () => {
  const [crimes, setCrimes] = useState([]);
  const [rawData, setRawData] = useState([]);
  const [filters, setFilters] = useState({
    source: "bundle", // bundle | upload
    presetFile: "enhanced_crime_data.csv", // default bundled CSV
    crime_code: "",
    crime_type: "",
    crime_mode: "",
    description: "",
    place: "",
    crime_domain: "",
    start: "",
    end: "",
    lat_min: "",
    lat_max: "",
    lon_min: "",
    lon_max: "",
    limit: 500,
  });
  const [uploadedFile, setUploadedFile] = useState(null);

  // Load from bundled assets under public/ or src datasets
  const loadPreset = async (filename) => {
    const url = process.env.PUBLIC_URL + "/" + filename;
    const ext = filename.split(".").pop().toLowerCase();
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`Failed to fetch ${url}`);

    if (ext === "csv") {
      const text = await resp.text();
      const { data } = Papa.parse(text, { header: true, skipEmptyLines: true });
      return normalizeRecords(data);
    }
    if (ext === "json") {
      const json = await resp.json();
      const arr = Array.isArray(json) ? json : json.data ?? [];
      return normalizeRecords(arr);
    }
    if (ext === "xlsx" || ext === "xls") {
      const blob = await resp.blob();
      const buf = await blob.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      const sheet = wb.SheetNames[0];
      const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheet], { defval: "" });
      return normalizeRecords(rows);
    }
    throw new Error("Unsupported preset format");
  };

  const parseUploaded = async (file) => {
    const name = file.name.toLowerCase();
    if (name.endsWith(".csv")) {
      const text = await file.text();
      const { data } = Papa.parse(text, { header: true, skipEmptyLines: true });
      return normalizeRecords(data);
    }
    if (name.endsWith(".json")) {
      const text = await file.text();
      const json = JSON.parse(text);
      const arr = Array.isArray(json) ? json : json.data ?? [];
      return normalizeRecords(arr);
    }
    if (name.endsWith(".xlsx") || name.endsWith(".xls")) {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      const sheet = wb.SheetNames[0];
      const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheet], { defval: "" });
      return normalizeRecords(rows);
    }
    throw new Error("Unsupported uploaded format");
  };

  // Apply filters to normalized data
  const filtered = useMemo(() => {
    let rows = [...rawData];

    const f = filters;
    const inRange = (v, min, max) => {
      if (min !== "" && Number.isFinite(+min) && v < +min) return false;
      if (max !== "" && Number.isFinite(+max) && v > +max) return false;
      return true;
    };

    rows = rows.filter((c) =>
      inRange(c.Latitude, f.lat_min, f.lat_max) &&
      inRange(c.Longitude, f.lon_min, f.lon_max)
    );

    if (f.crime_code) rows = rows.filter((c) => String(c.CrimeCode).toLowerCase() === String(f.crime_code).toLowerCase());
    if (f.crime_type) rows = rows.filter((c) => String(c.CrimeType).toLowerCase() === String(f.crime_type).toLowerCase());
    if (f.crime_mode) rows = rows.filter((c) => String(c.CrimeMode).toLowerCase() === String(f.crime_mode).toLowerCase());
    if (f.description) rows = rows.filter((c) => String(c.CrimeDescription).toLowerCase().includes(String(f.description).toLowerCase()));
    if (f.place) rows = rows.filter((c) => String(c.Place).toLowerCase() === String(f.place).toLowerCase());
    if (f.crime_domain) rows = rows.filter((c) => String(c.CrimeDomain).toLowerCase() === String(f.crime_domain).toLowerCase());

    // time range: try to parse to Date if present
    const toTime = (t) => {
      const d = new Date(t);
      return isNaN(d) ? null : d.getTime();
    };
    const start = f.start ? new Date(f.start).getTime() : null;
    const end = f.end ? new Date(f.end).getTime() : null;
    if (start || end) {
      rows = rows.filter((c) => {
        const ct = c.Time ? toTime(c.Time) : null;
        if (ct === null) return true; // keep if unparsable
        if (start && ct < start) return false;
        if (end && ct > end) return false;
        return true;
      });
    }

    if (f.limit && Number.isFinite(+f.limit)) rows = rows.slice(0, +f.limit);

    return rows;
  }, [rawData, filters]);

  useEffect(() => {
    // initial load from public preset
    if (filters.source === "bundle" && filters.presetFile) {
      loadPreset(filters.presetFile)
        .then(setRawData)
        .catch((e) => {
          console.error(e);
          setRawData([]);
        });
    }
  }, [filters.source, filters.presetFile]);

  useEffect(() => {
    setCrimes(filtered);
  }, [filtered]);

  // Handler for file upload
  const onUpload = async (file) => {
    try {
      const rows = await parseUploaded(file);
      setUploadedFile(file);
      setRawData(rows);
    } catch (e) {
      console.error(e);
      alert("Failed to parse file. Please provide CSV, XLSX, or JSON with lat/lon fields.");
    }
  };

  return (
    <div className="app-container">
      <Sidebar
        filters={filters}
        setFilters={setFilters}
        crimes={crimes}
      />
      <div className="map-wrapper">
        <MapView crimes={crimes} />
        {/* Simple top bar for data source switching and upload */}
        <div className="data-source-controls">
          <select
            className="data-source-select"
            value={filters.source}
            onChange={(e) => setFilters((f) => ({ ...f, source: e.target.value }))}
          >
            <option value="bundle">Bundled dataset</option>
            <option value="upload">Upload file</option>
          </select>

          {filters.source === "bundle" && (
            <select
              className="data-source-select"
              value={filters.presetFile}
              onChange={(e) => setFilters((f) => ({ ...f, presetFile: e.target.value }))}
            >
              <option value="enhanced_crime_data.csv">enhanced_crime_data.csv</option>
            </select>
          )}

          {filters.source === "upload" && (
            <input 
              className="file-upload-input"
              type="file" 
              accept=".csv,.json,.xlsx,.xls" 
              onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])} 
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
