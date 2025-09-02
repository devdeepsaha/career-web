import React from 'react';
import ReactDOM from 'react-dom/client';
import ReactGA from 'react-ga4'; // Import the library
import { HelmetProvider } from 'react-helmet-async'; // Import
import App from './App.jsx';
import './index.css';
import './i18n';

// Initialize Google Analytics
ReactGA.initialize("G-54RKL82Q5C"); // Paste your Measurement ID here

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
    <App />
    </HelmetProvider>
  </React.StrictMode>,
);