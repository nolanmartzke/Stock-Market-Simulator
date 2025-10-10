import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../context/AuthContext";


const Account = () => {
  const [user, setUser] = useState(null);
  const { auth, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (auth)
      setUser({
        name: auth.name,
        email: auth.email,
      });
  }, [auth]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div style={{ maxWidth: 400, margin: '50px auto', padding: 20, border: '1px solid #ccc', borderRadius: 8 }}>
      <h2>Account</h2>
      {
        user ? <>
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <button onClick={handleLogout} style={{ width: '100%', padding: 10, marginTop: 20 }}>
            Log Out
          </button>
        </>
          :
          <></>
      }

    </div>
  );
};

export default Account;