// MapComponent.js
import Slider from '@mui/material/Slider';
import React, { useState, useRef, useEffect } from 'react';
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

  //_______________________________________________________________

  const [isPlaying, setIsPlaying] = useState(false);
  const [playInterval, setPlayInterval] = useState(null);

  const startPlaying = () => {
    if (!isPlaying && currentYearIndex < geoJsonLayersData.length - 1) {
      setIsPlaying(true);
      const interval = setInterval(() => {
        setCurrentYearIndex((prevIndex) => {
          if (prevIndex >= geoJsonLayersData.length - 1) {
            clearInterval(interval);
            setIsPlaying(false);
            return 0;
          }
          return prevIndex + 1;
        });
      }, 1000); // Cambia la duración según tus necesidades
      setPlayInterval(interval);
    }
  };

  const stopPlaying = () => {
    if (isPlaying) {
      clearInterval(playInterval);
      setIsPlaying(false);
      setPlayInterval(null);
    }
  };

  const resetTimeline = () => {
    setCurrentYearIndex(0);
    if (isPlaying) {
      stopPlaying();  // Detiene la reproducción si está activa
    }
  };

  useEffect(() => {
    return () => {
      if (playInterval) {
        clearInterval(playInterval);
      }
    };
  }, [playInterval]);


  return (
    <div>
      <MapContainer
        center={[20.5175, -100.8147]}
        zoom={13}
        className="MapContainer"
        style={{ height: '90vh', width: '100%' }}
        whenCreated={mapInstance => { mapRef.current = mapInstance; }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {geoJsonLayersData[currentYearIndex] && <GeoJSON key={geoJsonLayersData[currentYearIndex].year} data={geoJsonLayersData[currentYearIndex].data} />}
        <TitleControl
          year={geoJsonLayersData[currentYearIndex].year}
          pobTot={geoJsonLayersData[currentYearIndex].data.features[0].properties.PobTot}
          Area_HAS={geoJsonLayersData[currentYearIndex].data.features[0].properties.Area_HAS}
        />
      </MapContainer>
  
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '20px auto', width: '80%' }}>
        {/* Botones y Slider en un mismo contenedor */}
        <button onClick={isPlaying ? stopPlaying : startPlaying}>
          {isPlaying ? 'Pausa' : 'Reproducir'}
        </button>
        <button onClick={resetTimeline}>Reiniciar</button>
        <Slider
          aria-labelledby="discrete-slider"
          value={currentYearIndex}
          onChange={(event, newValue) => setCurrentYearIndex(newValue)}
          step={1}
          marks
          min={0}
          max={geoJsonLayersData.length - 1}
          valueLabelDisplay="auto"
          valueLabelFormat={(index) => geoJsonLayersData[index].year}
          sx={{
            flexGrow: 1,
            mx: 2, // Margin horizontal para separar el slider de los botones
            '& .MuiSlider-mark': {
              backgroundColor: '#000',
              height: 8,
              width: 2,
              '&.MuiSlider-markActive': {
                opacity: 1,
                backgroundColor: 'currentcolor',
              },
            },
            '& .MuiSlider-markLabel': {
              color: 'red',
              fontSize: '0.7rem',
            },
          }}
        />
      </div>
    </div>
  );
};

export default MapComponent;