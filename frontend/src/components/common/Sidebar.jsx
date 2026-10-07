// frontend/src/components/common/Sidebar.jsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../styles/sidebar.css';

function Sidebar({ role = 'admin' }) {
    const location = useLocation();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [isOpen, setIsOpen] = useState(true);

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('user'));
        if (userData) setUser(userData);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    };

    // ═══════════════════════════════════════════════════════
    // MENU — Your original order + Reminders added
    // ═══════════════════════════════════════════════════════
    const menuItems = [
        { name: 'Dashboard', icon: 'fa-chart-line', path: '/dashboard' },
        { name: 'Register Patient', icon: 'fa-user-plus', path: '/patients/register' },
        { name: 'Check-In', icon: 'fa-clipboard-check', path: '/patients/checkin' },
        { name: 'Vitals', icon: 'fa-heartbeat', path: '/vitals' },
        { name: 'Queue', icon: 'fa-list-ol', path: '/queue' },
        { name: 'Patient Records', icon: 'fa-users', path: '/patients' },
        { name: 'Appointments', icon: 'fa-calendar-check', path: '/appointments' },
        { name: 'Reminders', icon: 'fa-bell', path: '/reminders' },
        { name: 'Consultations', icon: 'fa-stethoscope', path: '/consultations' },
        { name: 'Maternity', icon: 'fa-baby', path: '/maternity' },
        { name: 'Prescriptions', icon: 'fa-prescription', path: '/prescriptions' },
        { name: 'Pharmacy', icon: 'fa-pills', path: '/pharmacy' },
        { name: 'Referrals', icon: 'fa-ambulance', path: '/referrals' },
        { name: 'Reports', icon: 'fa-chart-bar', path: '/reports' },
        { name: 'Organizations', icon: 'fa-building', path: '/organizations' },
        { name: 'Users', icon: 'fa-user-md', path: '/users' },
    ];

    const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

    return (
        <>
            <button className="sidebar-toggle" onClick={() => setIsOpen(!isOpen)}>
                <i className={`fas ${isOpen ? 'fa-times' : 'fa-bars'}`}></i>
            </button>

            <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
                {/* LOGO */}
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <i className="fas fa-heartbeat"></i>
                    </div>
                    <div className="sidebar-brand">
                        <h2>PulseLogic</h2>
                        <p>Health System</p>
                    </div>
                </div>

                {/* USER INFO */}
                {user && (
                    <div className="sidebar-user">
                        <div className="user-avatar">
                            {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div className="user-info">
                            <h4>{user.full_name || 'User'}</h4>
                            <p>{user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Staff'}</p>
                        </div>
                    </div>
                )}

                {/* NAVIGATION */}
                <nav className="sidebar-nav">
                    <ul className="nav-list">
                        {menuItems.map((item, i) => (
                            <li key={i}>
                                <Link
                                    to={item.path}
                                    className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
                                >
                                    <i className={`fas ${item.icon}`}></i>
                                    <span>{item.name}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* LOGOUT */}
                <div className="sidebar-footer">
                    <button className="logout-btn" onClick={handleLogout}>
                        <i className="fas fa-sign-out-alt"></i>
                        <span>Logout</span>
                    </button>
                </div>
            </aside>
        </>
    );
}

export default Sidebar;