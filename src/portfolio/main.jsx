import React from 'react';
import { createRoot } from 'react-dom/client';
import App from '../app/App.jsx';
import { SiteAnalytics } from '../analytics.jsx';
import '../index.css';

// The portfolio page shares the homepage's header, display settings, footer and project popup.
createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App page="portfolio" />
    <SiteAnalytics />
  </React.StrictMode>
);
