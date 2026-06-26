import Slider from '@mui/material/Slider';
import Switch from '@mui/material/Switch';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { useEffect, useRef, useState } from 'react';
import { GeoJSON, MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import TitleControl from './TitleControl.jsx';

/**
 * @typedef {import('geojson').FeatureCollection} FeatureCollection
 * @typedef {{ year: string, load: () => Promise<{ default: FeatureCollection }> }} TimelineLayer
 * @typedef {'map' | 'satellite'} BaseMapMode
 */

const geoJsonLayersData = /** @type {TimelineLayer[]} */ ([
  { year: 'Siglo XIX', load: () => import('./timeline/data/SigloXIX.js') },
  { year: '1860', load: () => import('./timeline/data/C1860.js') },
  { year: '1920', load: () => import('./timeline/data/C1920.js') },
  { year: '1970', load: () => import('./timeline/data/C1970.js') },
  { year: '1980', load: () => import('./timeline/data/C1980.js') },
  { year: '1990', load: () => import('./timeline/data/C1990.js') },
  { year: '1995', load: () => import('./timeline/data/C1995.js') },
  { year: '2000', load: () => import('./timeline/data/C2000.js') },
  { year: '2005', load: () => import('./timeline/data/C2005.js') },
  { year: '2010', load: () => import('./timeline/data/C2010.js') },
  { year: '2014', load: () => import('./timeline/data/C2014.js') },
  { year: '2020', load: () => import('./timeline/data/C2020.js') },
  { year: '2023', load: () => import('./timeline/data/C2023.js') },
]);

const LAST_YEAR_INDEX = geoJsonLayersData.length - 1;
const primaryLayerStyle = {
  color: '#1d4ed8',
  weight: 3,
  fillColor: '#2563eb',
  fillOpacity: 0.12,
};
const compareLayerStyle = {
  color: '#dc2626',
  weight: 3,
  fillColor: '#ef4444',
  fillOpacity: 0.1,
};
const baseMapOptions = {
  map: {
    label: 'Calles',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
  },
  satellite: {
    label: 'Satelital',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri',
  },
};

/**
 * @param {number} index
 */
const clampYearIndex = (index) => Math.max(0, Math.min(index, LAST_YEAR_INDEX));

/**
 * @param {number | number[]} value
 */
const getSliderValue = (value) => Array.isArray(value) ? value[0] : value;

/**
 * @param {FeatureCollection | undefined} data
 */
const getLayerProperties = (data) => {
  const properties = data?.features[0]?.properties ?? {};

  return {
    pobTot: Number(properties.PobTot ?? 0),
    areaHas: Number(properties.Area_HAS ?? 0),
  };
};

/**
 * @param {number} index
 * @param {Map<number, FeatureCollection>} cache
 */
const loadLayerData = async (index, cache) => {
  const cachedData = cache.get(index);

  if (cachedData) {
    return cachedData;
  }

  const module = await geoJsonLayersData[index].load();
  cache.set(index, module.default);
  return module.default;
};

const MapComponent = () => {
  const [currentYearIndex, setCurrentYearIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [compareYearIndex, setCompareYearIndex] = useState(0);
  const [compareActive, setCompareActive] = useState(false);
  const [baseMapMode, setBaseMapMode] = useState(/** @type {BaseMapMode} */ ('map'));
  const [layerDataByIndex, setLayerDataByIndex] = useState(() => new Map());
  const playIntervalRef = useRef(/** @type {number | null} */ (null));
  const layerDataCacheRef = useRef(/** @type {Map<number, FeatureCollection>} */ (new Map()));

  const baseMap = baseMapOptions[baseMapMode] ?? baseMapOptions.map;
  const currentLayer = geoJsonLayersData[currentYearIndex];
  const compareLayer = geoJsonLayersData[compareYearIndex];
  const currentData = layerDataByIndex.get(currentYearIndex);
  const compareData = layerDataByIndex.get(compareYearIndex);
  const currentMetrics = getLayerProperties(currentData);
  const compareMetrics = getLayerProperties(compareData);

  const stopPlaying = () => {
    if (playIntervalRef.current) {
      window.clearInterval(playIntervalRef.current);
      playIntervalRef.current = null;
    }

    setIsPlaying(false);
  };

  const startPlaying = () => {
    if (isPlaying || currentYearIndex >= LAST_YEAR_INDEX) {
      return;
    }

    setIsPlaying(true);
    playIntervalRef.current = window.setInterval(() => {
      setCurrentYearIndex((prevIndex) => {
        if (prevIndex >= LAST_YEAR_INDEX) {
          stopPlaying();
          return LAST_YEAR_INDEX;
        }

        return prevIndex + 1;
      });
    }, 1000);
  };

  const resetTimeline = () => {
    stopPlaying();
    setCurrentYearIndex(0);
  };

  useEffect(() => {
    let isActive = true;
    const indexesToLoad = compareActive
      ? [currentYearIndex, compareYearIndex]
      : [currentYearIndex];

    Promise
      .all(indexesToLoad.map((index) => loadLayerData(index, layerDataCacheRef.current)))
      .then(() => {
        if (isActive) {
          setLayerDataByIndex(new Map(layerDataCacheRef.current));
        }
      });

    return () => {
      isActive = false;
    };
  }, [currentYearIndex, compareActive, compareYearIndex]);

  useEffect(() => {
    return () => {
      if (playIntervalRef.current) {
        window.clearInterval(playIntervalRef.current);
      }
    };
  }, []);

  /**
   * @param {React.ChangeEvent<HTMLInputElement>} event
   */
  const handleCompareSwitchChange = (event) => {
    const isActive = event.target.checked;
    setCompareActive(isActive);

    if (isActive) {
      setCompareYearIndex(currentYearIndex > 0 ? currentYearIndex - 1 : 1);
      return;
    }

    setCompareYearIndex(0);
  };

  /**
   * @param {React.MouseEvent<HTMLElement>} _event
   * @param {BaseMapMode | null} nextMode
   */
  const handleBaseMapChange = (_event, nextMode) => {
    if (nextMode) {
      setBaseMapMode(nextMode);
    }
  };

  /**
   * @param {Event} _event
   * @param {number | number[]} newValue
   */
  const handleCurrentYearChange = (_event, newValue) => {
    setCurrentYearIndex(clampYearIndex(getSliderValue(newValue)));
  };

  /**
   * @param {Event} _event
   * @param {number | number[]} newValue
   */
  const handleCompareYearChange = (_event, newValue) => {
    setCompareYearIndex(clampYearIndex(getSliderValue(newValue)));
  };

  /**
   * @param {number} index
   */
  const getYearLabel = (index) => geoJsonLayersData[clampYearIndex(index)].year;

  return (
    <div className="app-shell">
      <div className="map-stage">
        <div className="base-map-switch">
          <ToggleButtonGroup
            exclusive
            value={baseMapMode}
            onChange={handleBaseMapChange}
            aria-label="selector de mapa base"
            size="small"
          >
            <ToggleButton value="map">Calles</ToggleButton>
            <ToggleButton value="satellite">Satelital</ToggleButton>
          </ToggleButtonGroup>
        </div>

        <MapContainer
          center={[20.528, -100.81]}
          zoom={13}
          zoomControl={false}
          className="MapContainer"
        >
          <TileLayer
            key={baseMapMode}
            url={baseMap.url}
            attribution={baseMap.attribution}
          />
          {currentData && <GeoJSON key={currentLayer.year} data={currentData} style={primaryLayerStyle} />}
          {compareActive && compareData && (
            <GeoJSON key={`${compareLayer.year}-compare`} data={compareData} style={compareLayerStyle} />
          )}
          <TitleControl
            currentLayer={{
              year: currentLayer.year,
              pobTot: currentMetrics.pobTot,
              areaHas: currentMetrics.areaHas,
            }}
            compareLayer={compareActive && compareData ? {
              year: compareLayer.year,
              pobTot: compareMetrics.pobTot,
              areaHas: compareMetrics.areaHas,
            } : null}
          />
        </MapContainer>
      </div>

      <div className="timeline-controls">
        <div className="timeline-actions">
          <button onClick={isPlaying ? stopPlaying : startPlaying}>
            {isPlaying ? 'Pausa' : 'Reproducir'}
          </button>
          <button onClick={resetTimeline}>Reiniciar</button>
        </div>

        <Slider
          aria-labelledby="discrete-slider"
          value={currentYearIndex}
          onChange={handleCurrentYearChange}
          step={1}
          marks={geoJsonLayersData.map((data, index) => ({ value: index, label: data.year }))}
          min={0}
          max={LAST_YEAR_INDEX}
          valueLabelDisplay="auto"
          valueLabelFormat={getYearLabel}
          sx={{
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
              color: '#000',
              fontSize: '0.9rem',
              transform: 'translate(-50%, 15px)',
            },
          }}
        />
      </div>

      <div className="timeline-controls compare-controls">
        <div className="timeline-actions">
          <Switch checked={compareActive} onChange={handleCompareSwitchChange} />
          Comparar
        </div>
        <Slider
          disabled={!compareActive}
          value={compareYearIndex}
          onChange={handleCompareYearChange}
          step={1}
          marks
          min={0}
          max={LAST_YEAR_INDEX}
          valueLabelDisplay="auto"
          valueLabelFormat={getYearLabel}
          sx={{
            color: 'red',
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
