import React, { useState } from 'react';
import AdminLoginPage from './AdminLoginPage';
import AdminDashboard from './AdminDashboard';

export default function AdminApp() {
  const [isAuthed, setIsAuthed] = useState(() => Boolean(localStorage.getItem('veloura_admin_token')));

  const handleLogout = () => {
    localStorage.removeItem('veloura_admin_token');
    setIsAuthed(false);
  };

  if (!isAuthed) {
    return <AdminLoginPage onLoginSuccess={() => setIsAuthed(true)} />;
  }

  return <AdminDashboard onLogout={handleLogout} />;
}