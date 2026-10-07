import React from 'react';

import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate
} from 'react-router-dom';

import './App.css';


// ============================================================
// PAGE IMPORTS
// ============================================================

import Login from './pages/Login';
import ChangePassword from './pages/ChangePassword';

import BiometricVerification from './pages/BiometricVerification';

import Dashboard from './pages/Dashboard';

import PatientRecords from './pages/PatientRecords';
import PatientRegistration from './pages/PatientRegistration';
import PatientCheckin from './pages/PatientCheckin';

import Appointments from './pages/Appointments';
import Queue from './pages/Queue';

import Consultations from './pages/Consultations';
import Maternity from './pages/Maternity';

import Vitals from './pages/Vitals';

import Prescriptions from './pages/Prescriptions';
import Pharmacy from './pages/Pharmacy';

import Referrals from './pages/Referrals';

import Organizations from './pages/Organizations';
import Users from './pages/Users';

import Reports from './pages/Reports';
import Reminders from './pages/reminders';


// ============================================================
// PRIVATE ROUTE
// ============================================================

const PrivateRoute = ({ children }) => {
    const token =
        localStorage.getItem(
            'token'
        );

    return token
        ? children
        : (
            <Navigate
                to="/login"
                replace
            />
        );
};


// ============================================================
// APP
// ============================================================

function App() {
    return (
        <Router>

            <div className="App">

                <Routes>

                    {/* ===================================== */}
                    {/* PUBLIC LOGIN */}
                    {/* ===================================== */}

                    <Route
                        path="/"
                        element={
                            <Login />
                        }
                    />

                    <Route
                        path="/login"
                        element={
                            <Login />
                        }
                    />

                    <Route
                        path="/change-password"
                        element={
                            <ChangePassword />
                        }
                    />


                    {/* ===================================== */}
                    {/* FACE AUTHENTICATION */}
                    {/* NOT protected */}
                    {/* ===================================== */}

                    <Route
                        path="/face-verification"
                        element={
                            <BiometricVerification />
                        }
                    />


                    {/* ===================================== */}
                    {/* PROTECTED */}
                    {/* ===================================== */}

                    <Route
                        path="/dashboard"
                        element={
                            <PrivateRoute>
                                <Dashboard />
                            </PrivateRoute>
                        }
                    />


                    <Route
                        path="/patients"
                        element={
                            <PrivateRoute>
                                <PatientRecords />
                            </PrivateRoute>
                        }
                    />


                    <Route
                        path="/patients/register"
                        element={
                            <PrivateRoute>
                                <PatientRegistration />
                            </PrivateRoute>
                        }
                    />


                    <Route
                        path="/patients/checkin"
                        element={
                            <PrivateRoute>
                                <PatientCheckin />
                            </PrivateRoute>
                        }
                    />


                    <Route
                        path="/appointments"
                        element={
                            <PrivateRoute>
                                <Appointments />
                            </PrivateRoute>
                        }
                    />


                    <Route
                        path="/queue"
                        element={
                            <PrivateRoute>
                                <Queue />
                            </PrivateRoute>
                        }
                    />


                    <Route
                        path="/reminders"
                        element={
                            <PrivateRoute>
                                <Reminders />
                            </PrivateRoute>
                        }
                    />


                    <Route
                        path="/consultations"
                        element={
                            <PrivateRoute>
                                <Consultations />
                            </PrivateRoute>
                        }
                    />


                    <Route
                        path="/maternity"
                        element={
                            <PrivateRoute>
                                <Maternity />
                            </PrivateRoute>
                        }
                    />


                    <Route
                        path="/vitals"
                        element={
                            <PrivateRoute>
                                <Vitals />
                            </PrivateRoute>
                        }
                    />


                    <Route
                        path="/prescriptions"
                        element={
                            <PrivateRoute>
                                <Prescriptions />
                            </PrivateRoute>
                        }
                    />


                    <Route
                        path="/pharmacy"
                        element={
                            <PrivateRoute>
                                <Pharmacy />
                            </PrivateRoute>
                        }
                    />


                    <Route
                        path="/referrals"
                        element={
                            <PrivateRoute>
                                <Referrals />
                            </PrivateRoute>
                        }
                    />


                    <Route
                        path="/reports"
                        element={
                            <PrivateRoute>
                                <Reports />
                            </PrivateRoute>
                        }
                    />


                    <Route
                        path="/organizations"
                        element={
                            <PrivateRoute>
                                <Organizations />
                            </PrivateRoute>
                        }
                    />


                    <Route
                        path="/users"
                        element={
                            <PrivateRoute>
                                <Users />
                            </PrivateRoute>
                        }
                    />


                    {/* ===================================== */}
                    {/* FALLBACK */}
                    {/* ===================================== */}

                    <Route
                        path="*"
                        element={
                            <Navigate
                                to="/login"
                                replace
                            />
                        }
                    />

                </Routes>

            </div>

        </Router>
    );
}

export default App;