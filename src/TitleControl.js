import React, { useEffect } from 'react';
import L from 'leaflet';
import { useMap } from 'react-leaflet';

const TitleControl = ({ year, pobTot }) => {
  const map = useMap();

  useEffect(() => {
    const customControl = L.Control.extend({
      onAdd: function () {
        var container = L.DomUtil.create('div', 'leaflet-control-custom');
        container.style.width = '400px';
        container.style.backgroundColor = '#f7cf92';
        container.style.padding = '5px 10px';
        container.style.borderRadius = '4px';
        container.style.boxShadow = '0 1px 5px rgba(0,0,0,0.2)';
        container.style.margin = '10px';
        container.style.fontFamily = 'Arial, sans-serif';
        container.style.fontSize = '16px';
        container.style.color = '#333';
        // Formatear el texto que se mostrará
        container.innerHTML = `
          <strong>Expansión urbana de Celaya</strong><br><br>
          Año: ${year}<br>
          Población de la mancha urbana: ${pobTot > 0 ? `${pobTot.toLocaleString()} habitantes` : 'Sin datos'}
        `;
        return container;
      }
    });

    const titleControl = new customControl({ position: 'topleft' });
    titleControl.addTo(map);

    return () => {
      titleControl.remove();
    };
  }, [map, year, pobTot]); // Asegúrate de incluir year y pobTot en las dependencias de useEffect

  return null; // Este componente no renderiza nada por sí mismo
};

export default TitleControl;