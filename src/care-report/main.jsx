import React from 'react';
import { createRoot } from 'react-dom/client';
import CareReport from './CareReport.jsx';
import '../index.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CareReport />
  </React.StrictMode>
);
