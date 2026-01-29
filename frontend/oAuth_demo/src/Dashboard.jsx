import React from 'react';

export default function Dashboard({ user, onLogout }) {
  const handleLogout = async () => {
    try {
      await fetch('http://localhost:5001/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      onLogout();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <div className="dashboard">
      <h1>Welcome to Dashboard!</h1>
      <p>You're successfully logged in</p>

      <div className="user-info">
        <p><strong>Name:</strong> {user.name || 'Not provided'}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>User ID:</strong> {user.id}</p>
      </div>

      <button onClick={handleLogout} className="btn btn-logout">
        Logout
      </button>
    </div>
  );
}