import React from 'react';
import { createRoot } from 'react-dom/client';
import PrivacyPolicy from './PrivacyPolicy.jsx';
import { SiteAnalytics } from '../analytics.jsx';
import '../index.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <PrivacyPolicy />
    <SiteAnalytics />
  </React.StrictMode>
);
