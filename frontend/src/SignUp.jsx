import React, { useState } from 'react';

function SignUp() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [rePassword, setRePassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        setUsername('');
        setRePassword('');
        setPassword('');
        // No action on submit for now
    };

    return (
        <div style={{ maxWidth: 400, margin: '50px auto', padding: 20, border: '1px solid #ccc', borderRadius: 8 }}>
            <h2>Sign Up</h2>
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
                <div style={{ marginBottom: 24 }}>
                    <label>
                        Re-enter Password:
                        <input
                            type="password"
                            value={rePassword}
                            onChange={e => setRePassword(e.target.value)}
                            style={{ width: "100%", marginTop: 4 }}
                            required
                        />
                    </label>
                </div>
                <button type="submit" style={{ width: '100%', padding: 10 }}>
                    Sign Up
                </button>
            </form>
        </div>
    );
}

export default SignUp;