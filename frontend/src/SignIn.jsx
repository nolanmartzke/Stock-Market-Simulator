import React, { useState } from 'react';
import { signIn } from './api/AuthAPI';

const SignIn = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        setUsername('');
        setPassword('');

        signIn(username, password)
            .then(response => {
                console.log("Sign-in successful:", response.data);
            })
            .catch(error => {
                console.error("Sign-in error:", error.response ? error.response.data : error.message);
            });
    };

    return (
        <div style={{ maxWidth: 400, margin: '50px auto', padding: 20, border: '1px solid #ccc', borderRadius: 8 }}>
            <h2>Sign In</h2>
            <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
                    <label>
                        Username:
                        <input
                            type="text"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            style={{ width: "100%", marginTop: 4, alignContent: 'center' }}
                            required
                        />
                    </label>
                </div>
                <div style={{ marginBottom: 16 }}>
                    <label>
                        Password:
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            style={{ width: "100%", marginTop: 4 }}
                            required
                        />
                    </label>
                </div>
                <button type="submit" style={{ width: '100%', padding: 10 }}>
                    Sign In
                </button>
            </form>
        </div>
    );
};

export default SignIn;
