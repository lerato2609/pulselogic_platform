import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import './styles/login.css';

const API_URL =
    process.env.REACT_APP_API_URL ||
    'http://localhost:5000/api';

function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (event) => {
        event.preventDefault();

        setError('');

        if (!email.trim() || !password) {
            setError(
                'Please enter your email and password.'
            );

            return;
        }

        setLoading(true);

        try {
            console.log(
                '📸 Login attempt:',
                email
            );

            const response = await fetch(
                `${API_URL}/auth/login`,
                {
                    method: 'POST',

                    headers: {
                        'Content-Type':
                            'application/json'
                    },

                    body: JSON.stringify({
                        email:
                            email
                                .trim()
                                .toLowerCase(),

                        password
                    })
                }
            );

            const data =
                await response.json();

            console.log(
                'Login response:',
                data
            );

            if (!response.ok) {
                throw new Error(
                    data?.message ||
                    'Invalid email or password.'
                );
            }

            if (!data.success) {
                throw new Error(
                    data?.message ||
                    'Login failed.'
                );
            }

            if (!data.temporaryToken) {
                throw new Error(
                    'Biometric session token was not returned.'
                );
            }

            // Temporary biometric session only.
            sessionStorage.setItem(
                'biometricToken',
                data.temporaryToken
            );

            sessionStorage.setItem(
                'biometricUser',
                JSON.stringify(
                    data.user || {}
                )
            );

            sessionStorage.setItem(
                'biometricStatus',
                JSON.stringify(
                    data.biometricStatus || {
                        faceRegistered: false,
                        fingerprintRegistered: false
                    }
                )
            );

            // No dashboard access until face succeeds.
            localStorage.removeItem(
                'token'
            );

            localStorage.removeItem(
                'authToken'
            );

            console.log(
                '✅ Password accepted'
            );

            console.log(
                '➡️ Redirecting to face verification'
            );

            navigate(
                '/face-verification',
                {
                    replace: true
                }
            );

        } catch (error) {
            console.error(
                'Login error:',
                error
            );

            setError(
                error?.message ||
                'Unable to login.'
            );

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">

            <div className="login-card">

                <header className="login-header">

                    <div className="login-logo">
                        ❤️
                    </div>

                    <h1>
                        PulseLogic
                    </h1>

                    <p>
                        Healthcare Management Platform
                    </p>

                </header>


                {error && (
                    <div className="login-error">
                        {error}
                    </div>
                )}


                <form
                    className="login-form"
                    onSubmit={handleLogin}
                >

                    <div className="login-field">

                        <label htmlFor="email">
                            Email
                        </label>

                        <input
                            id="email"
                            type="email"
                            value={email}

                            onChange={(event) =>
                                setEmail(
                                    event.target.value
                                )
                            }

                            placeholder="Enter your email"

                            autoComplete="username"
                        />

                    </div>


                    <div className="login-field">

                        <label htmlFor="password">
                            Password
                        </label>

                        <input
                            id="password"
                            type="password"
                            value={password}

                            onChange={(event) =>
                                setPassword(
                                    event.target.value
                                )
                            }

                            placeholder="Enter your password"

                            autoComplete="current-password"
                        />

                    </div>


                    <button
                        type="submit"
                        className="login-primary-button"
                        disabled={loading}
                    >
                        {loading
                            ? 'Checking credentials...'
                            : 'Sign In'
                        }
                    </button>

                </form>

            </div>

        </div>
    );
}

export default Login;