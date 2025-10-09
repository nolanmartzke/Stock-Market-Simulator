import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Account = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/signin');
      return;
    }

  setUser({
      username: 'demoUser',
      email: 'demo@example.com',
    });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/signin');
  };

  if (!user) return null;

  return (
    <div style={{ maxWidth: 400, margin: '50px auto', padding: 20, border: '1px solid #ccc', borderRadius: 8 }}>
      <h2>Account</h2>
      <p><strong>Username:</strong> {user.username}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <button onClick={handleLogout} style={{ width: '100%', padding: 10, marginTop: 20 }}>
        Log Out
      </button>
    </div>
  );
};

export default Account;