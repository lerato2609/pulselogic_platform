import React, { useState, useEffect } from 'react';
import Sidebar from '../components/common/Sidebar';
import Header from '../components/common/Header';
import WidgetCard from '../components/common/WidgetCard';
import './styles/dashboard.css';

function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState('superadmin');
  
  // ─── USER CONTEXT ───
  const [userContext, setUserContext] = useState({
    fullName: '',
    role: '',
    facility: { name: '', code: '' },
    department: { name: '', code: '' },
    organization: { name: '', code: '' }
  });

  // ─── STATS ───
  const [stats, setStats] = useState([]);

  // ─── ALL DISEASES WITH DESCRIPTIONS ───
  const cardiovascularConditions = [
    { name: 'Hypertension', description: 'high blood pressure', icon: 'fa-heart', color: '#EF4444' },
    { name: 'Hypotension', description: 'low blood pressure', icon: 'fa-heartbeat', color: '#F59E0B' },
    { name: 'Heart Failure', description: 'heart unable to pump properly', icon: 'fa-heart-pulse', color: '#EF4444' },
    { name: 'Coronary Artery Disease', description: 'plaque buildup in arteries', icon: 'fa-artery', color: '#F59E0B' },
    { name: 'Cardiac Arrhythmias', description: 'irregular heart rhythm', icon: 'fa-wave-square', color: '#F59E0B' },
    { name: 'Tachycardia', description: 'fast resting heart rate', icon: 'fa-heart-circle-exclamation', color: '#EF4444' },
    { name: 'Bradycardia', description: 'slow resting heart rate', icon: 'fa-heart-circle-minus', color: '#10B981' },
    { name: 'Stroke Risk', description: 'cerebrovascular accident risk', icon: 'fa-brain', color: '#F59E0B' },
  ];

  const chronicDiseases = [
    { name: 'Asthma', description: 'chronic airway inflammation', icon: 'fa-lungs', color: '#F59E0B' },
    { name: 'Diabetes', description: 'high blood sugar levels', icon: 'fa-droplet', color: '#F59E0B' },
    { name: 'Cardiac', description: 'heart disease conditions', icon: 'fa-heart', color: '#EF4444' },
    { name: 'Obesity', description: 'excess body fat', icon: 'fa-weight-scale', color: '#10B981' },
    { name: 'Pneumonia', description: 'lung infection', icon: 'fa-lungs-virus', color: '#0EA5E9' },
    { name: 'HIV', description: 'human immunodeficiency virus', icon: 'fa-virus', color: '#0EA5E9' },
    { name: 'TB', description: 'tuberculosis infection', icon: 'fa-lungs', color: '#F59E0B' },
    { name: 'Anaemia', description: 'low red blood cell count', icon: 'fa-droplet', color: '#F59E0B' },
  ];

  const maternityConditions = [
    { name: 'Pregnancy', description: 'expecting a baby', icon: 'fa-baby', color: '#8B5CF6' },
    { name: 'Gestational Age', description: 'weeks of pregnancy', icon: 'fa-calendar-week', color: '#0EA5E9' },
    { name: 'Due Date', description: 'estimated delivery date', icon: 'fa-calendar-day', color: '#0EA5E9' },
    { name: 'Gestational Hypertension', description: 'high BP during pregnancy', icon: 'fa-heart', color: '#F59E0B' },
    { name: 'Gestational Diabetes', description: 'high sugar during pregnancy', icon: 'fa-droplet', color: '#F59E0B' },
    { name: 'Pre-eclampsia Risk', description: 'high BP + protein in urine', icon: 'fa-triangle-exclamation', color: '#DC2626' },
    { name: 'Reduced Fetal Movement', description: 'decreased baby movements', icon: 'fa-fetus', color: '#DC2626' },
    { name: 'Premature Labour Risk', description: 'labour before 37 weeks', icon: 'fa-clock', color: '#F59E0B' },
    { name: 'Multiple Pregnancy', description: 'twins or more', icon: 'fa-people-arrows', color: '#F59E0B' },
    { name: 'Breech Presentation', description: 'baby feet-first position', icon: 'fa-child', color: '#F59E0B' },
    { name: 'Placenta Previa', description: 'placenta covers cervix', icon: 'fa-uterus', color: '#F59E0B' },
    { name: 'Postnatal Recovery', description: 'recovery after delivery', icon: 'fa-bed', color: '#0EA5E9' },
    { name: 'Breastfeeding', description: 'breastfeeding status', icon: 'fa-baby', color: '#8B5CF6' },
    { name: 'Newborn', description: 'baby health status', icon: 'fa-star', color: '#10B981' },
  ];

  // ─── LOAD USER CONTEXT & FETCH STATS ───
  useEffect(() => {
    // Load user context from localStorage
    const user = JSON.parse(localStorage.getItem('user'));
    const facility = JSON.parse(localStorage.getItem('userFacility'));
    const department = JSON.parse(localStorage.getItem('userDepartment'));
    const organization = JSON.parse(localStorage.getItem('userOrganization'));
    
    if (user) {
      setUserContext({
        fullName: user.fullName || '',
        role: user.role || 'superadmin',
        facility: facility || { name: '', code: '' },
        department: department || { name: '', code: '' },
        organization: organization || { name: '', code: '' }
      });
      setRole(user.role || 'superadmin');
    }
    
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const statsRes = await fetch('http://localhost:5000/api/dashboard/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const statsData = await statsRes.json();
      
      if (statsData.success) {
        const statsArray = [
          { title: 'Patients Today', value: statsData.data.patientsToday, icon: 'fa-user-plus', color: 'blue' },
          { title: 'Critical', value: statsData.data.critical, icon: 'fa-exclamation-triangle', color: 'red' },
          { title: 'In Queue', value: statsData.data.inQueue, icon: 'fa-users', color: 'orange' },
          { title: 'Attended', value: statsData.data.attended, icon: 'fa-check-circle', color: 'green' },
          { title: 'Appointments', value: statsData.data.appointments, icon: 'fa-calendar-check', color: 'purple' },
          { title: 'Escalated (30+ min)', value: statsData.data.escalated, icon: 'fa-clock', color: 'orange' },
          { title: 'Overdue (60+ min)', value: statsData.data.overdue, icon: 'fa-hourglass-end', color: 'red' },
        ];
        setStats(statsArray);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // ─── DISEASE CARD ───
  const DiseaseCard = ({ name, description, icon, color }) => (
    <div className="disease-card" style={{ borderColor: `${color}30` }}>
      <div className="disease-card-content">
        <div className="disease-icon-wrapper" style={{ background: `${color}15`, color: color }}>
          <i className={`fas ${icon}`}></i>
        </div>
        <div className="disease-info">
          <div className="disease-name">{name}</div>
          <div className="disease-description">{description}</div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: '📊 Overview' },
    { id: 'cardiovascular', label: '❤️ Cardiovascular' },
    { id: 'chronic', label: '🩺 Chronic Diseases' },
    { id: 'maternity', label: '👶 Maternity' },
  ];

  // ─── WELCOME HEADER WITH USER CONTEXT ───
  const WelcomeHeader = () => (
    <div className="welcome-header">
      <div className="welcome-left">
        <h1>👋 Welcome, {userContext.fullName || 'User'}!</h1>
        <p className="welcome-subtitle">
          <span className="role-badge-large">{userContext.role || 'Role'}</span>
          {userContext.facility.name && (
            <span className="facility-badge">
              <i className="fas fa-hospital"></i> {userContext.facility.name}
            </span>
          )}
          {userContext.department.name && (
            <span className="department-badge">
              <i className="fas fa-building"></i> {userContext.department.name}
            </span>
          )}
          {userContext.organization.name && (
            <span className="organization-badge">
              <i className="fas fa-building-columns"></i> {userContext.organization.name}
            </span>
          )}
        </p>
      </div>
      <div className="welcome-right">
        <div className="date-time">
          <i className="fas fa-calendar-day"></i>
          <span>{new Date().toLocaleDateString('en-ZA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
        <div className="date-time">
          <i className="fas fa-clock"></i>
          <span>{new Date().toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>
    </div>
  );

  // ─── ROLE-BASED QUICK ACTIONS ───
  const getQuickActions = () => {
    const actions = {
      superadmin: [
        { label: 'Add Organization', icon: 'fa-building', color: 'primary' },
        { label: 'Add Facility', icon: 'fa-hospital', color: 'success' },
        { label: 'Add User', icon: 'fa-user-plus', color: 'warning' },
        { label: 'Generate Report', icon: 'fa-file-export', color: 'info' },
      ],
      doh: [
        { label: 'View Reports', icon: 'fa-file-alt', color: 'primary' },
        { label: 'Export Statistics', icon: 'fa-file-export', color: 'success' },
        { label: 'Disease Surveillance', icon: 'fa-virus', color: 'warning' },
        { label: 'Print Report', icon: 'fa-print', color: 'info' },
      ],
      doctor: [
        { label: 'Diagnose Patient', icon: 'fa-stethoscope', color: 'primary' },
        { label: 'Prescribe Medication', icon: 'fa-prescription', color: 'success' },
        { label: 'Request Lab Tests', icon: 'fa-flask', color: 'info' },
        { label: 'Refer Patient', icon: 'fa-ambulance', color: 'danger' },
      ],
      nurse: [
        { label: 'Capture Vitals', icon: 'fa-heartbeat', color: 'primary' },
        { label: 'Start Assessment', icon: 'fa-clipboard-list', color: 'success' },
        { label: 'Update Queue', icon: 'fa-queue', color: 'info' },
        { label: 'View Patient History', icon: 'fa-history', color: 'warning' },
      ],
      reception: [
        { label: 'Register Patient', icon: 'fa-user-plus', color: 'primary' },
        { label: 'Book Appointment', icon: 'fa-calendar-plus', color: 'success' },
        { label: 'Check In Patient', icon: 'fa-sign-in-alt', color: 'info' },
        { label: 'Print Patient Card', icon: 'fa-id-card', color: 'warning' },
      ],
      pharmacist: [
        { label: 'Dispense Medication', icon: 'fa-prescription-bottle', color: 'primary' },
        { label: 'Update Inventory', icon: 'fa-boxes', color: 'success' },
        { label: 'Receive Stock', icon: 'fa-truck', color: 'info' },
        { label: 'Stock Alerts', icon: 'fa-bell', color: 'danger' },
      ],
    };
    return actions[role] || actions.superadmin;
  };

  const quickActions = getQuickActions();

  return (
    <div className="dashboard-container">
      <Sidebar role={role} />
      <div className="dashboard-main">
        <Header role={role} />
        <div className="dashboard-content">
          
          {/* ─── WELCOME HEADER ─── */}
          <WelcomeHeader />

          {/* ─── TABS ─── */}
          <div className="tabs-container">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* ─── QUICK ACTIONS ─── */}
          <div className="quick-actions-container">
            {quickActions.map((action, index) => (
              <button key={index} className={`quick-action-btn ${action.color}`}>
                <i className={`fas ${action.icon}`}></i> {action.label}
              </button>
            ))}
          </div>

          {/* ─── STATS ROW ─── */}
          <div className="widget-grid">
            {stats.map((stat, index) => (
              <WidgetCard key={index} {...stat} />
            ))}
          </div>

          {/* ─── OVERVIEW TAB ─── */}
          {activeTab === 'overview' && (
            <>
              <div className="disease-grid-container">
                
                {/* Cardiovascular Section */}
                <div className="disease-section">
                  <div className="section-header">
                    <div className="section-header-left">
                      <span className="section-icon">❤️</span>
                      <div>
                        <h3>Cardiovascular Conditions</h3>
                        <p>Heart & Vascular Health</p>
                      </div>
                    </div>
                    <span className="section-count">8 Conditions</span>
                  </div>
                  <div className="disease-grid">
                    {cardiovascularConditions.map((condition, index) => (
                      <DiseaseCard key={index} {...condition} />
                    ))}
                  </div>
                </div>

                {/* Chronic Diseases Section */}
                <div className="disease-section">
                  <div className="section-header">
                    <div className="section-header-left">
                      <span className="section-icon">🩺</span>
                      <div>
                        <h3>Chronic Diseases</h3>
                        <p>Long-term Health Conditions</p>
                      </div>
                    </div>
                    <span className="section-count">8 Conditions</span>
                  </div>
                  <div className="disease-grid">
                    {chronicDiseases.map((condition, index) => (
                      <DiseaseCard key={index} {...condition} />
                    ))}
                  </div>
                </div>
              </div>

              {/* Maternity Section (Full Width) */}
              <div className="disease-section full-width">
                <div className="section-header">
                  <div className="section-header-left">
                    <span className="section-icon">👶</span>
                    <div>
                      <h3>Maternity Tracker</h3>
                      <p>Pregnancy & Postnatal Care</p>
                    </div>
                  </div>
                  <span className="section-count">14 Conditions</span>
                </div>
                <div className="disease-grid full-grid maternity-grid">
                  {maternityConditions.map((condition, index) => (
                    <DiseaseCard key={index} {...condition} />
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ─── CARDIOVASCULAR TAB ─── */}
          {activeTab === 'cardiovascular' && (
            <div className="disease-section full-width">
              <div className="section-header">
                <div className="section-header-left">
                  <span className="section-icon">❤️</span>
                  <div>
                    <h3>Cardiovascular Conditions</h3>
                    <p>Heart & Vascular Health Monitoring</p>
                  </div>
                </div>
                <span className="section-count">8 Conditions</span>
              </div>
              <div className="disease-grid full-grid">
                {cardiovascularConditions.map((condition, index) => (
                  <DiseaseCard key={index} {...condition} />
                ))}
              </div>
            </div>
          )}

          {/* ─── CHRONIC DISEASES TAB ─── */}
          {activeTab === 'chronic' && (
            <div className="disease-section full-width">
              <div className="section-header">
                <div className="section-header-left">
                  <span className="section-icon">🩺</span>
                  <div>
                    <h3>Chronic Diseases</h3>
                    <p>Long-term Health Condition Monitoring</p>
                  </div>
                </div>
                <span className="section-count">8 Conditions</span>
              </div>
              <div className="disease-grid full-grid">
                {chronicDiseases.map((condition, index) => (
                  <DiseaseCard key={index} {...condition} />
                ))}
              </div>
            </div>
          )}

          {/* ─── MATERNITY TAB ─── */}
          {activeTab === 'maternity' && (
            <div className="disease-section full-width">
              <div className="section-header">
                <div className="section-header-left">
                  <span className="section-icon">👶</span>
                  <div>
                    <h3>Maternity Tracker</h3>
                    <p>Pregnancy & Postnatal Care Monitoring</p>
                  </div>
                </div>
                <span className="section-count">14 Conditions</span>
              </div>
              <div className="disease-grid full-grid">
                {maternityConditions.map((condition, index) => (
                  <DiseaseCard key={index} {...condition} />
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default Dashboard;