// src/pages/Referrals.jsx
import React, { useState, useEffect } from 'react';
import Sidebar from '../components/common/Sidebar';
import Header from '../components/common/Header';
import './styles/referrals.css';

function Referrals() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [role, setRole] = useState('doctor');
  const [user, setUser] = useState(null);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [referrals, setReferrals] = useState([]);
  const [filteredReferrals, setFilteredReferrals] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [facilities, setFacilities] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedReferral, setSelectedReferral] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [referralStats, setReferralStats] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    completed: 0,
    cancelled: 0
  });

  // ─── REFERRAL FORM ───
  const [referralForm, setReferralForm] = useState({
    patient_id: '',
    referring_doctor_id: '',
    from_facility_id: '',
    to_facility_id: '',
    reason: '',
    priority: 'normal',
    status: 'pending',
    referral_date: ''
  });

  // ─── UPDATE REFERRAL FORM ───
  const [updateForm, setUpdateForm] = useState({
    status: '',
    notes: ''
  });

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    console.log('Referrals component mounted');
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      if (userData) {
        setUser(userData);
        setRole(userData.role || 'doctor');
        setReferralForm(prev => ({
          ...prev,
          referring_doctor_id: userData.id || userData.user_id || 1,
          from_facility_id: userData.facility_id || 1,
          referral_date: new Date().toISOString().split('T')[0]
        }));
      }
      fetchPatients();
      fetchFacilities();
      fetchDepartments();
      fetchReferrals();
    } catch (err) {
      console.error('Error in useEffect:', err);
      setError('Error loading data');
      setLoading(false);
    }
  }, []);

  const fetchPatients = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/patients`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setPatients(data.patients || data.data || []);
      } else {
        // Mock data for demo
        setPatients([
          { patient_id: 1, first_name: 'John', last_name: 'Doe', phone_number: '0712345678', id_number: '8001015001086' },
          { patient_id: 2, first_name: 'Jane', last_name: 'Smith', phone_number: '0723456789', id_number: '9002025002087' },
          { patient_id: 3, first_name: 'Peter', last_name: 'Jones', phone_number: '0734567890', id_number: '8503035003088' },
          { patient_id: 4, first_name: 'Mary', last_name: 'Williams', phone_number: '0745678901', id_number: '8604045004089' }
        ]);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
      setPatients([
        { patient_id: 1, first_name: 'John', last_name: 'Doe', phone_number: '0712345678', id_number: '8001015001086' },
        { patient_id: 2, first_name: 'Jane', last_name: 'Smith', phone_number: '0723456789', id_number: '9002025002087' },
        { patient_id: 3, first_name: 'Peter', last_name: 'Jones', phone_number: '0734567890', id_number: '8503035003088' },
        { patient_id: 4, first_name: 'Mary', last_name: 'Williams', phone_number: '0745678901', id_number: '8604045004089' }
      ]);
    }
  };

  const fetchFacilities = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/facilities`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setFacilities(data.facilities || []);
      } else {
        // Mock facilities
        setFacilities([
          { facility_id: 1, facility_name: 'Soweto Clinic', facility_type: 'Clinic', facility_level: 'clinic', city: 'Johannesburg' },
          { facility_id: 2, facility_name: 'Cape Town Community Health Centre', facility_type: 'Community Health Centre', facility_level: 'community_health_centre', city: 'Cape Town' },
          { facility_id: 3, facility_name: 'Durban District Hospital', facility_type: 'District Hospital', facility_level: 'district_hospital', city: 'Durban' },
          { facility_id: 4, facility_name: 'Pretoria Regional Hospital', facility_type: 'Regional Hospital', facility_level: 'regional_hospital', city: 'Pretoria' },
          { facility_id: 5, facility_name: 'Johannesburg Tertiary Hospital', facility_type: 'Tertiary Hospital', facility_level: 'tertiary_hospital', city: 'Johannesburg' },
          { facility_id: 6, facility_name: 'Bloemfontein Specialist Centre', facility_type: 'Specialist', facility_level: 'specialist', city: 'Bloemfontein' }
        ]);
      }
    } catch (error) {
      console.error('Error fetching facilities:', error);
      setFacilities([
        { facility_id: 1, facility_name: 'Soweto Clinic', facility_type: 'Clinic', facility_level: 'clinic', city: 'Johannesburg' },
        { facility_id: 2, facility_name: 'Cape Town Community Health Centre', facility_type: 'Community Health Centre', facility_level: 'community_health_centre', city: 'Cape Town' },
        { facility_id: 3, facility_name: 'Durban District Hospital', facility_type: 'District Hospital', facility_level: 'district_hospital', city: 'Durban' },
        { facility_id: 4, facility_name: 'Pretoria Regional Hospital', facility_type: 'Regional Hospital', facility_level: 'regional_hospital', city: 'Pretoria' },
        { facility_id: 5, facility_name: 'Johannesburg Tertiary Hospital', facility_type: 'Tertiary Hospital', facility_level: 'tertiary_hospital', city: 'Johannesburg' }
      ]);
    }
  };

  const fetchDepartments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/departments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setDepartments(data.departments || []);
      } else {
        setDepartments([
          { id: 1, name: 'Emergency' },
          { id: 2, name: 'Cardiology' },
          { id: 3, name: 'Neurology' },
          { id: 4, name: 'Orthopedics' },
          { id: 5, name: 'Pediatrics' },
          { id: 6, name: 'Obstetrics & Gynecology' },
          { id: 7, name: 'Oncology' },
          { id: 8, name: 'General Surgery' },
          { id: 9, name: 'Internal Medicine' },
          { id: 10, name: 'Psychiatry' }
        ]);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
      setDepartments([
        { id: 1, name: 'Emergency' },
        { id: 2, name: 'Cardiology' },
        { id: 3, name: 'Neurology' },
        { id: 4, name: 'Orthopedics' },
        { id: 5, name: 'Pediatrics' },
        { id: 6, name: 'Obstetrics & Gynecology' },
        { id: 7, name: 'Oncology' },
        { id: 8, name: 'General Surgery' },
        { id: 9, name: 'Internal Medicine' },
        { id: 10, name: 'Psychiatry' }
      ]);
    }
  };

  const fetchReferrals = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/referrals`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setReferrals(data.referrals || []);
        setFilteredReferrals(data.referrals || []);
        updateStats(data.referrals || []);
      } else {
        // Mock data for demo
        const mockData = [
          {
            referral_id: 1,
            patient_id: 1,
            patient_name: 'John Doe',
            referring_doctor: 'Dr. Smith',
            from_facility: 'Soweto Clinic',
            to_facility: 'Johannesburg Tertiary Hospital',
            reason: 'Patient needs specialist cardiology assessment',
            priority: 'urgent',
            status: 'pending',
            referral_date: '2026-08-27',
            created_at: '2026-08-27T10:30:00'
          },
          {
            referral_id: 2,
            patient_id: 2,
            patient_name: 'Jane Smith',
            referring_doctor: 'Dr. Jones',
            from_facility: 'Cape Town Community Health Centre',
            to_facility: 'Pretoria Regional Hospital',
            reason: 'Patient needs neurological assessment',
            priority: 'emergency',
            status: 'accepted',
            referral_date: '2026-08-26',
            created_at: '2026-08-26T14:20:00',
            accepted_at: '2026-08-26T16:30:00'
          },
          {
            referral_id: 3,
            patient_id: 3,
            patient_name: 'Peter Jones',
            referring_doctor: 'Dr. Brown',
            from_facility: 'Durban District Hospital',
            to_facility: 'Johannesburg Tertiary Hospital',
            reason: 'Patient needs oncology consultation',
            priority: 'urgent',
            status: 'completed',
            referral_date: '2026-08-25',
            created_at: '2026-08-25T09:15:00',
            accepted_at: '2026-08-25T11:00:00'
          },
          {
            referral_id: 4,
            patient_id: 4,
            patient_name: 'Mary Williams',
            referring_doctor: 'Dr. Wilson',
            from_facility: 'Pretoria Regional Hospital',
            to_facility: 'Bloemfontein Specialist Centre',
            reason: 'Patient needs orthopedic surgery',
            priority: 'normal',
            status: 'pending',
            referral_date: '2026-08-24',
            created_at: '2026-08-24T16:45:00'
          }
        ];
        setReferrals(mockData);
        setFilteredReferrals(mockData);
        updateStats(mockData);
      }
    } catch (error) {
      console.error('Error fetching referrals:', error);
      const mockData = [
        {
          referral_id: 1,
          patient_id: 1,
          patient_name: 'John Doe',
          referring_doctor: 'Dr. Smith',
          from_facility: 'Soweto Clinic',
          to_facility: 'Johannesburg Tertiary Hospital',
          reason: 'Patient needs specialist cardiology assessment',
          priority: 'urgent',
          status: 'pending',
          referral_date: '2026-08-27',
          created_at: '2026-08-27T10:30:00'
        },
        {
          referral_id: 2,
          patient_id: 2,
          patient_name: 'Jane Smith',
          referring_doctor: 'Dr. Jones',
          from_facility: 'Cape Town Community Health Centre',
          to_facility: 'Pretoria Regional Hospital',
          reason: 'Patient needs neurological assessment',
          priority: 'emergency',
          status: 'accepted',
          referral_date: '2026-08-26',
          created_at: '2026-08-26T14:20:00',
          accepted_at: '2026-08-26T16:30:00'
        }
      ];
      setReferrals(mockData);
      setFilteredReferrals(mockData);
      updateStats(mockData);
    } finally {
      setLoading(false);
    }
  };

  const updateStats = (data) => {
    const total = data.length;
    const pending = data.filter(r => r.status === 'pending').length;
    const accepted = data.filter(r => r.status === 'accepted').length;
    const completed = data.filter(r => r.status === 'completed').length;
    const cancelled = data.filter(r => r.status === 'cancelled').length;
    setReferralStats({ total, pending, accepted, completed, cancelled });
  };

  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
    setReferralForm(prev => ({ ...prev, patient_id: patient.patient_id }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setReferralForm(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateInputChange = (e) => {
    const { name, value } = e.target;
    setUpdateForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitReferral = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      
      if (!referralForm.patient_id || !referralForm.to_facility_id || !referralForm.reason) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }

      const referralData = {
        ...referralForm,
        referring_doctor_id: user?.id || user?.user_id || 1,
        from_facility_id: user?.facility_id || 1,
        referral_date: referralForm.referral_date || new Date().toISOString().split('T')[0]
      };

      const response = await fetch(`${API_URL}/referrals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(referralData)
      });

      const data = await response.json();

      if (data.success) {
        // Add to local list
        const newReferral = {
          referral_id: data.referral_id || Date.now(),
          patient_id: referralForm.patient_id,
          patient_name: selectedPatient ? `${selectedPatient.first_name} ${selectedPatient.last_name}` : 'Unknown',
          referring_doctor: user?.full_name || user?.name || 'Doctor',
          from_facility: facilities.find(f => f.facility_id == referralForm.from_facility_id)?.facility_name || 'Unknown',
          to_facility: facilities.find(f => f.facility_id == referralForm.to_facility_id)?.facility_name || 'Unknown',
          reason: referralForm.reason,
          priority: referralForm.priority,
          status: 'pending',
          referral_date: referralForm.referral_date,
          created_at: new Date().toISOString()
        };
        setReferrals([newReferral, ...referrals]);
        setFilteredReferrals([newReferral, ...filteredReferrals]);
        updateStats([newReferral, ...referrals]);
        
        alert('✅ Referral created and electronic medical information transferred successfully!');
        setShowReferralModal(false);
        setSelectedPatient(null);
        
        // Reset form
        setReferralForm({
          patient_id: '',
          referring_doctor_id: user?.id || 1,
          from_facility_id: user?.facility_id || 1,
          to_facility_id: '',
          reason: '',
          priority: 'normal',
          status: 'pending',
          referral_date: new Date().toISOString().split('T')[0]
        });
      } else {
        setError(data.message || 'Failed to create referral');
      }
    } catch (err) {
      setError('Error creating referral');
      console.error('Referral error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateReferral = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/referrals/${selectedReferral.referral_id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: updateForm.status
        })
      });

      const data = await response.json();

      if (data.success) {
        // Update local state
        const updatedReferrals = referrals.map(r => {
          if (r.referral_id === selectedReferral.referral_id) {
            return {
              ...r,
              status: updateForm.status,
              accepted_at: updateForm.status === 'accepted' ? new Date().toISOString() : r.accepted_at
            };
          }
          return r;
        });
        setReferrals(updatedReferrals);
        setFilteredReferrals(updatedReferrals);
        updateStats(updatedReferrals);
        
        alert(`✅ Referral ${updateForm.status} successfully!`);
        setShowUpdateModal(false);
        setSelectedReferral(null);
      } else {
        setError(data.message || 'Failed to update referral');
      }
    } catch (err) {
      setError('Error updating referral');
      console.error('Update error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (referral) => {
    setSelectedReferral(referral);
    setShowDetailsModal(true);
  };

  const handleUpdateStatus = (referral) => {
    setSelectedReferral(referral);
    setUpdateForm({
      status: referral.status === 'pending' ? 'accepted' : 'completed'
    });
    setShowUpdateModal(true);
  };

  const handleFilterChange = (status) => {
    setFilterStatus(status);
    if (status === 'all') {
      setFilteredReferrals(referrals);
    } else {
      setFilteredReferrals(referrals.filter(r => r.status === status));
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    let filtered = referrals;
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(r => r.status === filterStatus);
    }
    
    filtered = filtered.filter(r =>
      r.patient_name?.toLowerCase().includes(term) ||
      r.referring_doctor?.toLowerCase().includes(term) ||
      r.to_facility?.toLowerCase().includes(term) ||
      r.reason?.toLowerCase().includes(term)
    );
    
    setFilteredReferrals(filtered);
  };

  const getPriorityBadge = (priority) => {
    const priorityMap = {
      normal: { class: 'priority-normal', label: 'Normal' },
      urgent: { class: 'priority-urgent', label: '🚨 Urgent' },
      emergency: { class: 'priority-emergency', label: '🚑 Emergency' }
    };
    return priorityMap[priority] || priorityMap.normal;
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { class: 'status-pending', label: '⏳ Pending' },
      accepted: { class: 'status-accepted', label: '✅ Accepted' },
      completed: { class: 'status-completed', label: '✔️ Completed' },
      cancelled: { class: 'status-cancelled', label: '❌ Cancelled' }
    };
    return statusMap[status] || statusMap.pending;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-ZA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-ZA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };

  const filteredPatients = patients.filter(p =>
    p.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.phone_number?.includes(searchTerm) ||
    p.id_number?.includes(searchTerm)
  );

  // Check if user is at a hospital (can accept referrals)
  const isHospital = () => {
    const userFacility = facilities.find(f => f.facility_id == user?.facility_id);
    const hospitalLevels = ['district_hospital', 'regional_hospital', 'tertiary_hospital', 'specialist'];
    return userFacility && hospitalLevels.includes(userFacility.facility_level);
  };

  if (loading && referrals.length === 0) {
    return (
      <div className="referrals-container">
        <Sidebar role={role} />
        <div className="referrals-main">
          <Header role={role} />
          <div className="referrals-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
            <div style={{ textAlign: 'center' }}>
              <i className="fas fa-spinner fa-spin" style={{ fontSize: '40px', color: '#534AB7' }}></i>
              <p style={{ marginTop: '10px', color: '#6b7280' }}>Loading referrals...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="referrals-container">
      <Sidebar role={role} />
      <div className="referrals-main">
        <Header role={role} />
        <div className="referrals-content">
          {/* ─── HEADER ─── */}
          <div className="referrals-header">
            <div className="referrals-header-left">
              <h1>🚑 Referrals</h1>
              <p className="referrals-subtitle">
                {isHospital() ? 'Manage incoming referrals from clinics' : 'Refer patients to hospitals and specialists'}
              </p>
            </div>
            <div className="referrals-header-right">
              {!isHospital() && (
                <button 
                  className="btn-primary"
                  onClick={() => setShowReferralModal(true)}
                >
                  <i className="fas fa-ambulance"></i> New Referral
                </button>
              )}
            </div>
          </div>

          {/* ─── STATS CARDS ─── */}
          <div className="referrals-stats">
            <div className="stat-card total">
              <div className="stat-icon"><i className="fas fa-file-medical"></i></div>
              <div className="stat-info">
                <span className="stat-label">Total</span>
                <span className="stat-value">{referralStats.total}</span>
              </div>
            </div>
            <div className="stat-card pending">
              <div className="stat-icon"><i className="fas fa-clock"></i></div>
              <div className="stat-info">
                <span className="stat-label">Pending</span>
                <span className="stat-value">{referralStats.pending}</span>
              </div>
            </div>
            <div className="stat-card accepted">
              <div className="stat-icon"><i className="fas fa-check-circle"></i></div>
              <div className="stat-info">
                <span className="stat-label">Accepted</span>
                <span className="stat-value">{referralStats.accepted}</span>
              </div>
            </div>
            <div className="stat-card completed">
              <div className="stat-icon"><i className="fas fa-flag-checkered"></i></div>
              <div className="stat-info">
                <span className="stat-label">Completed</span>
                <span className="stat-value">{referralStats.completed}</span>
              </div>
            </div>
          </div>

          {/* ─── SEARCH & FILTER ─── */}
          <div className="referrals-controls">
            <div className="search-bar">
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Search referrals by patient, doctor, facility..."
                value={searchTerm}
                onChange={handleSearch}
                className="search-input"
              />
            </div>
            <div className="filter-controls">
              <select 
                value={filterStatus} 
                onChange={(e) => handleFilterChange(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Status</option>
                <option value="pending">⏳ Pending</option>
                <option value="accepted">✅ Accepted</option>
                <option value="completed">✔️ Completed</option>
                <option value="cancelled">❌ Cancelled</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="alert alert-error">
              <i className="fas fa-exclamation-circle"></i>
              <span>{error}</span>
            </div>
          )}

          {/* ─── REFERRALS TABLE ─── */}
          <div className="referrals-table-container">
            {filteredReferrals.length === 0 ? (
              <div className="no-referrals">
                <i className="fas fa-ambulance" style={{ fontSize: '48px', color: '#ccc' }}></i>
                <h3>No referrals found</h3>
                <p>No referrals match your search or filter criteria</p>
                {!isHospital() && (
                  <button 
                    className="btn-primary"
                    onClick={() => setShowReferralModal(true)}
                  >
                    <i className="fas fa-plus"></i> Create Referral
                  </button>
                )}
              </div>
            ) : (
              <table className="referrals-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Patient</th>
                    <th>From</th>
                    <th>To</th>
                    <th>Reason</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReferrals.map((referral) => {
                    const priority = getPriorityBadge(referral.priority);
                    const status = getStatusBadge(referral.status);
                    return (
                      <tr key={referral.referral_id}>
                        <td>{formatDate(referral.referral_date || referral.created_at)}</td>
                        <td><strong>{referral.patient_name}</strong></td>
                        <td>{referral.from_facility}</td>
                        <td>{referral.to_facility}</td>
                        <td>{referral.reason?.substring(0, 30)}...</td>
                        <td>
                          <span className={`priority-badge ${priority.class}`}>
                            {priority.label}
                          </span>
                        </td>
                        <td>
                          <span className={`status-badge ${status.class}`}>
                            {status.label}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button 
                              className="btn-view"
                              onClick={() => handleViewDetails(referral)}
                              title="View Details"
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                            {isHospital() && referral.status === 'pending' && (
                              <button 
                                className="btn-accept"
                                onClick={() => handleUpdateStatus(referral)}
                                title="Accept Referral"
                              >
                                <i className="fas fa-check"></i> Accept
                              </button>
                            )}
                            {!isHospital() && referral.status === 'pending' && (
                              <button 
                                className="btn-cancel"
                                onClick={() => handleUpdateStatus(referral)}
                                title="Cancel Referral"
                              >
                                <i className="fas fa-times"></i> Cancel
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* ─── REFERRAL MODAL ─── */}
      {showReferralModal && (
        <div className="modal-overlay" onClick={() => setShowReferralModal(false)}>
          <div className="modal-content referral-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                <i className="fas fa-ambulance" style={{ color: '#EF4444' }}></i>
                New Referral
              </h2>
              <button className="modal-close" onClick={() => setShowReferralModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmitReferral}>
                {/* ─── PATIENT SELECTION ─── */}
                <div className="form-group">
                  <label>Patient <span className="mandatory">*</span></label>
                  <select
                    name="patient_id"
                    value={referralForm.patient_id}
                    onChange={handleInputChange}
                    required
                    className="form-control"
                  >
                    <option value="">Select patient...</option>
                    {patients.map(patient => (
                      <option key={patient.patient_id} value={patient.patient_id}>
                        {patient.first_name} {patient.last_name} - {patient.id_number || patient.phone_number}
                      </option>
                    ))}
                  </select>
                </div>

                {/* ─── REASON FOR REFERRAL ─── */}
                <div className="form-group">
                  <label>Reason for Referral <span className="mandatory">*</span></label>
                  <textarea
                    name="reason"
                    value={referralForm.reason}
                    onChange={handleInputChange}
                    placeholder="Why is this patient being referred?"
                    rows="3"
                    required
                    className="form-control"
                  />
                </div>

                {/* ─── RECEIVING FACILITY ─── */}
                <div className="form-group">
                  <label>Receiving Facility <span className="mandatory">*</span></label>
                  <select
                    name="to_facility_id"
                    value={referralForm.to_facility_id}
                    onChange={handleInputChange}
                    required
                    className="form-control"
                  >
                    <option value="">Select facility...</option>
                    {facilities
                      .filter(f => f.facility_id != user?.facility_id)
                      .map(facility => (
                        <option key={facility.facility_id} value={facility.facility_id}>
                          {facility.facility_name} ({facility.facility_type}) - {facility.city}
                        </option>
                      ))}
                  </select>
                </div>

                {/* ─── PRIORITY ─── */}
                <div className="form-group">
                  <label>Priority <span className="mandatory">*</span></label>
                  <select
                    name="priority"
                    value={referralForm.priority}
                    onChange={handleInputChange}
                    required
                    className="form-control"
                  >
                    <option value="normal">Normal</option>
                    <option value="urgent">🚨 Urgent</option>
                    <option value="emergency">🚑 Emergency</option>
                  </select>
                </div>

                {/* ─── REFERRAL DATE ─── */}
                <div className="form-group">
                  <label>Referral Date</label>
                  <input
                    type="date"
                    name="referral_date"
                    value={referralForm.referral_date}
                    onChange={handleInputChange}
                    className="form-control"
                  />
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn-secondary" onClick={() => setShowReferralModal(false)}>
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="btn-primary"
                    disabled={loading || !referralForm.patient_id || !referralForm.to_facility_id || !referralForm.reason}
                  >
                    {loading ? (
                      <><i className="fas fa-spinner fa-spin"></i> Creating...</>
                    ) : (
                      <><i className="fas fa-paper-plane"></i> Submit Referral</>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ─── UPDATE STATUS MODAL ─── */}
      {showUpdateModal && selectedReferral && (
        <div className="modal-overlay" onClick={() => setShowUpdateModal(false)}>
          <div className="modal-content update-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                <i className="fas fa-edit" style={{ color: '#534AB7' }}></i>
                Update Referral Status
              </h2>
              <button className="modal-close" onClick={() => setShowUpdateModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="referral-summary">
                <div className="summary-grid">
                  <div className="summary-item">
                    <label>Patient</label>
                    <span>{selectedReferral.patient_name}</span>
                  </div>
                  <div className="summary-item">
                    <label>From</label>
                    <span>{selectedReferral.from_facility}</span>
                  </div>
                  <div className="summary-item">
                    <label>To</label>
                    <span>{selectedReferral.to_facility}</span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleUpdateReferral}>
                <div className="form-group">
                  <label>Status <span className="mandatory">*</span></label>
                  <select
                    name="status"
                    value={updateForm.status}
                    onChange={handleUpdateInputChange}
                    required
                    className="form-control"
                  >
                    <option value="pending">⏳ Pending</option>
                    <option value="accepted">✅ Accepted</option>
                    <option value="completed">✔️ Completed</option>
                    <option value="cancelled">❌ Cancelled</option>
                  </select>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn-secondary" onClick={() => setShowUpdateModal(false)}>
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="btn-primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <><i className="fas fa-spinner fa-spin"></i> Updating...</>
                    ) : (
                      <><i className="fas fa-save"></i> Update Status</>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ─── DETAILS MODAL ─── */}
      {showDetailsModal && selectedReferral && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="modal-content details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                <i className="fas fa-file-medical" style={{ color: '#534AB7' }}></i>
                Referral Details
              </h2>
              <button className="modal-close" onClick={() => setShowDetailsModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="details-grid">
                <div className="detail-item">
                  <label>Patient</label>
                  <span><strong>{selectedReferral.patient_name}</strong></span>
                </div>
                <div className="detail-item">
                  <label>Referral Date</label>
                  <span>{formatDate(selectedReferral.referral_date)}</span>
                </div>
                <div className="detail-item">
                  <label>From</label>
                  <span>{selectedReferral.from_facility}</span>
                </div>
                <div className="detail-item">
                  <label>To</label>
                  <span>{selectedReferral.to_facility}</span>
                </div>
                <div className="detail-item">
                  <label>Priority</label>
                  <span className={`priority-badge ${getPriorityBadge(selectedReferral.priority).class}`}>
                    {getPriorityBadge(selectedReferral.priority).label}
                  </span>
                </div>
                <div className="detail-item">
                  <label>Status</label>
                  <span className={`status-badge ${getStatusBadge(selectedReferral.status).class}`}>
                    {getStatusBadge(selectedReferral.status).label}
                  </span>
                </div>
                <div className="detail-item">
                  <label>Referring Doctor</label>
                  <span>{selectedReferral.referring_doctor}</span>
                </div>
                <div className="detail-item">
                  <label>Sent At</label>
                  <span>{formatDateTime(selectedReferral.sent_at || selectedReferral.created_at)}</span>
                </div>
                <div className="detail-item full-width">
                  <label>Reason</label>
                  <span>{selectedReferral.reason}</span>
                </div>
                {selectedReferral.accepted_at && (
                  <div className="detail-item">
                    <label>Accepted At</label>
                    <span>{formatDateTime(selectedReferral.accepted_at)}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              {isHospital() && selectedReferral.status === 'pending' && (
                <button 
                  className="btn-success"
                  onClick={() => {
                    setShowDetailsModal(false);
                    handleUpdateStatus(selectedReferral);
                  }}
                >
                  <i className="fas fa-check"></i> Accept Referral
                </button>
              )}
              <button className="btn-secondary" onClick={() => setShowDetailsModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Referrals;