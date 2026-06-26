import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import MapComponent from './mapComponent.jsx';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('No se encontró el elemento raíz de la aplicación.');
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <MapComponent />
  </React.StrictMode>,
);
