import { useEffect } from 'react';
import L from 'leaflet';
import { useMap } from 'react-leaflet';

const numberFormatter = new Intl.NumberFormat('es-MX', {
  maximumFractionDigits: 2,
});

const currentColor = '#1d4ed8';
const compareColor = '#dc2626';

/**
 * @param {string} label
 * @param {string} value
 */
const createMetricRow = (label, value) => {
  const row = document.createElement('div');
  row.className = 'control-metric-row';

  const metricLabel = document.createElement('span');
  metricLabel.className = 'control-metric-label';
  metricLabel.textContent = `${label}: `;

  const metricValue = document.createElement('span');
  metricValue.className = 'control-metric-value';
  metricValue.textContent = value;

  row.append(metricLabel, metricValue);
  return row;
};

/**
 * @param {{ title: string, year: string, pobTot: number, areaHas: number, color: string }} layer
 */
const createLayerBlock = ({ title, year, pobTot, areaHas, color }) => {
  const block = document.createElement('section');
  block.className = 'control-layer-block';
  block.style.borderLeftColor = color;

  const heading = document.createElement('div');
  heading.className = 'control-layer-heading';
  heading.style.color = color;
  heading.textContent = title;

  block.append(
    heading,
    createMetricRow('Anio', year),
    createMetricRow('Area (hectareas)', numberFormatter.format(areaHas)),
    createMetricRow(
      'Poblacion',
      pobTot > 0 ? `${numberFormatter.format(pobTot)} habitantes` : 'Sin datos',
    ),
  );

  return block;
};

/**
 * @param {{
 *   currentLayer: { year: string, pobTot: number, areaHas: number },
 *   compareLayer: null | { year: string, pobTot: number, areaHas: number }
 * }} props
 */
const TitleControl = ({ currentLayer, compareLayer }) => {
  const map = useMap();

  useEffect(() => {
    const customControl = L.Control.extend({
      onAdd: function () {
        const container = L.DomUtil.create('div', 'leaflet-control-custom');
        container.style.width = '400px';
        container.style.backgroundColor = '#f7f3ea';
        container.style.padding = '10px 12px';
        container.style.borderRadius = '6px';
        container.style.boxShadow = '0 1px 5px rgba(0,0,0,0.2)';
        container.style.margin = '10px';
        container.style.fontFamily = 'Arial, sans-serif';
        container.style.fontSize = '14px';
        container.style.color = '#333';

        const title = document.createElement('strong');
        title.textContent = 'Expansion urbana de Celaya';
        title.className = 'control-title';

        const layersWrap = document.createElement('div');
        layersWrap.className = 'control-layers-wrap';
        layersWrap.append(
          createLayerBlock({
            title: 'Capa actual',
            year: currentLayer.year,
            pobTot: currentLayer.pobTot,
            areaHas: currentLayer.areaHas,
            color: currentColor,
          }),
        );

        if (compareLayer) {
          layersWrap.append(
            createLayerBlock({
              title: 'Comparacion',
              year: compareLayer.year,
              pobTot: compareLayer.pobTot,
              areaHas: compareLayer.areaHas,
              color: compareColor,
            }),
          );
        }

        container.append(title, layersWrap);
        return container;
      },
    });

    const titleControl = new customControl({ position: 'topleft' });
    titleControl.addTo(map);

    return () => {
      titleControl.remove();
    };
  }, [compareLayer, currentLayer, map]);

  return null;
};

export default TitleControl;
