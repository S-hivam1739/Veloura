import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import AdminApp from './admin/AdminApp.jsx';
import './index.css';

// The Admin Panel lives at /admin and is rendered independently of the
// customer storefront (App.jsx is untouched). This is a plain path check
// (no router library added) so it works with the existing Vite SPA setup.
const isAdminRoute = window.location.pathname.startsWith('/admin');

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {isAdminRoute ? <AdminApp /> : <App />}
  </React.StrictMode>
);
