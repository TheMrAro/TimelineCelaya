// MapComponent.js
import React, { useState, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import TitleControl from './TitleControl'; //
import C1860 from './timeline/data/C1860.js';
import C1920 from './timeline/data/C1920.js';
import C1970 from './timeline/data/C1970.js';
import C1980 from './timeline/data/C1980.js';
import C1990 from './timeline/data/C1990.js';
import C1995 from './timeline/data/C1995.js';
import C2000 from './timeline/data/C2000.js';
import C2005 from './timeline/data/C2005.js';
import C2010 from './timeline/data/C2010.js';
import C2014 from './timeline/data/C2014.js';
import C2020 from './timeline/data/C2020.js';
import C2023 from './timeline/data/C2023.js';
import SigloXIX from './timeline/data/SigloXIX.js';

const geoJsonLayersData = [
  { year: 'Siglo XIX', data: SigloXIX },
  { year: '1860', data: C1860 },
  { year: '1920', data: C1920 },
  { year: '1970', data: C1970 },
  { year: '1980', data: C1980 },
  { year: '1990', data: C1990 },
  { year: '1995', data: C1995 },
  { year: '2000', data: C2000 },
  { year: '2005', data: C2005 },
  { year: '2010', data: C2010 },
  { year: '2014', data: C2014 },
  { year: '2020', data: C2020 },
  { year: '2023', data: C2023 },
];

const MapComponent = () => {
  const [currentYearIndex, setCurrentYearIndex] = useState(0);
  const mapRef = useRef(null);

  return (
    <div>
      <MapContainer
        center={[20.5175, -100.8147]}
        zoom={13}
        className="MapContainer" // Añade esta línea
        style={{ height: '90vh', width: '100%' }}
        whenCreated={mapInstance => { mapRef.current = mapInstance; }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {geoJsonLayersData[currentYearIndex] && <GeoJSON key={geoJsonLayersData[currentYearIndex].year} data={geoJsonLayersData[currentYearIndex].data} />}
        <TitleControl 
  year={geoJsonLayersData[currentYearIndex].year} 
  pobTot={geoJsonLayersData[currentYearIndex].data.features[0].properties.PobTot}
/>
      </MapContainer>
      <input
        type="range"
        min="0"
        max={geoJsonLayersData.length - 1}
        value={currentYearIndex}
        onChange={(e) => setCurrentYearIndex(parseInt(e.target.value))}
        style={{ width: '100%', marginTop: '20px' }}
      />
      <div style={{ textAlign: 'center', marginTop: '10px' }}className="yearDisplay">{geoJsonLayersData[currentYearIndex].year}</div>
    </div>
  );
};

export default MapComponent;