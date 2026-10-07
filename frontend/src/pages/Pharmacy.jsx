// src/pages/Pharmacy.jsx
import React, { useState, useEffect } from 'react';
import Sidebar from '../components/common/Sidebar';
import Header from '../components/common/Header';
import './styles/pharmacy.css';

function Pharmacy() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [role, setRole] = useState('pharmacist');
  const [user, setUser] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [filteredPrescriptions, setFilteredPrescriptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [showDispenseModal, setShowDispenseModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [pharmacyStats, setPharmacyStats] = useState({
    total: 0,
    pending: 0,
    dispensed: 0,
    completed: 0
  });

  // ─── DISPENSE FORM ───
  const [dispenseForm, setDispenseForm] = useState({
    dispensed_by: '',
    dispensed_date: '',
    notes: '',
    status: 'dispensed'
  });

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    console.log('Pharmacy component mounted');
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      if (userData) {
        setUser(userData);
        setRole(userData.role || 'pharmacist');
        setDispenseForm(prev => ({
          ...prev,
          dispensed_by: userData.full_name || userData.name || 'Pharmacist'
        }));
      }
      fetchPrescriptions();
    } catch (err) {
      console.error('Error in useEffect:', err);
      setError('Error loading data');
      setLoading(false);
    }
  }, []);

  const fetchPrescriptions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/prescriptions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setPrescriptions(data.prescriptions || []);
        setFilteredPrescriptions(data.prescriptions || []);
        updateStats(data.prescriptions || []);
      } else {
        // Mock data for demo
        const mockData = [
          {
            id: 1,
            patient_name: 'John Doe',
            patient_id: 1,
            medication_name: 'Paracetamol',
            dosage: '500mg',
            frequency: '4 times daily',
            duration: '5 days',
            quantity: '20 tablets',
            instructions: 'Take after meals with plenty of water',
            prescribing_healthcare_worker: 'Dr. Smith',
            pharmacy_name: 'Clicks Pharmacy - Sandton',
            pharmacy_id: 1,
            date_prescribed: '2026-08-20',
            status: 'sent_to_pharmacy',
            notes: 'Patient has allergies to aspirin'
          },
          {
            id: 2,
            patient_name: 'Jane Smith',
            patient_id: 2,
            medication_name: 'Amoxicillin',
            dosage: '500mg',
            frequency: '3 times daily',
            duration: '7 days',
            quantity: '21 capsules',
            instructions: 'Complete full course even if symptoms improve',
            prescribing_healthcare_worker: 'Dr. Jones',
            pharmacy_name: 'Dis-Chem Pharmacy - Rosebank',
            pharmacy_id: 2,
            date_prescribed: '2026-08-21',
            status: 'sent_to_pharmacy',
            notes: 'Check for penicillin allergy'
          },
          {
            id: 3,
            patient_name: 'Peter Jones',
            patient_id: 3,
            medication_name: 'Metformin',
            dosage: '500mg',
            frequency: 'Twice daily',
            duration: '3 months',
            quantity: '180 tablets',
            instructions: 'Take with meals to reduce stomach upset',
            prescribing_healthcare_worker: 'Dr. Brown',
            pharmacy_name: 'MediRite Pharmacy - Soweto',
            pharmacy_id: 3,
            date_prescribed: '2026-08-22',
            status: 'prescribed',
            notes: 'Monitor blood sugar levels'
          },
          {
            id: 4,
            patient_name: 'Mary Williams',
            patient_id: 4,
            medication_name: 'Lisinopril',
            dosage: '10mg',
            frequency: 'Once daily',
            duration: '3 months',
            quantity: '90 tablets',
            instructions: 'Take in the morning',
            prescribing_healthcare_worker: 'Dr. Wilson',
            pharmacy_name: 'Clicks Pharmacy - Sandton',
            pharmacy_id: 1,
            date_prescribed: '2026-08-23',
            status: 'dispensed',
            notes: 'Monitor blood pressure',
            dispensed_by: 'Pharmacist Mike',
            dispensed_date: '2026-08-24'
          },
          {
            id: 5,
            patient_name: 'David Brown',
            patient_id: 5,
            medication_name: 'Atorvastatin',
            dosage: '20mg',
            frequency: 'Once daily',
            duration: '6 months',
            quantity: '180 tablets',
            instructions: 'Take at bedtime',
            prescribing_healthcare_worker: 'Dr. Taylor',
            pharmacy_name: 'Dis-Chem Pharmacy - Rosebank',
            pharmacy_id: 2,
            date_prescribed: '2026-08-24',
            status: 'completed',
            notes: 'Check liver function tests',
            dispensed_by: 'Pharmacist Sarah',
            dispensed_date: '2026-08-25'
          }
        ];
        setPrescriptions(mockData);
        setFilteredPrescriptions(mockData);
        updateStats(mockData);
      }
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      // Mock data
      const mockData = [
        {
          id: 1,
          patient_name: 'John Doe',
          patient_id: 1,
          medication_name: 'Paracetamol',
          dosage: '500mg',
          frequency: '4 times daily',
          duration: '5 days',
          quantity: '20 tablets',
          instructions: 'Take after meals with plenty of water',
          prescribing_healthcare_worker: 'Dr. Smith',
          pharmacy_name: 'Clicks Pharmacy - Sandton',
          pharmacy_id: 1,
          date_prescribed: '2026-08-20',
          status: 'sent_to_pharmacy',
          notes: 'Patient has allergies to aspirin'
        },
        {
          id: 2,
          patient_name: 'Jane Smith',
          patient_id: 2,
          medication_name: 'Amoxicillin',
          dosage: '500mg',
          frequency: '3 times daily',
          duration: '7 days',
          quantity: '21 capsules',
          instructions: 'Complete full course even if symptoms improve',
          prescribing_healthcare_worker: 'Dr. Jones',
          pharmacy_name: 'Dis-Chem Pharmacy - Rosebank',
          pharmacy_id: 2,
          date_prescribed: '2026-08-21',
          status: 'sent_to_pharmacy',
          notes: 'Check for penicillin allergy'
        }
      ];
      setPrescriptions(mockData);
      setFilteredPrescriptions(mockData);
      updateStats(mockData);
    } finally {
      setLoading(false);
    }
  };

  const updateStats = (data) => {
    const total = data.length;
    const pending = data.filter(p => p.status === 'prescribed' || p.status === 'sent_to_pharmacy').length;
    const dispensed = data.filter(p => p.status === 'dispensed').length;
    const completed = data.filter(p => p.status === 'completed').length;
    setPharmacyStats({ total, pending, dispensed, completed });
  };

  const handleFilterChange = (status) => {
    setFilterStatus(status);
    if (status === 'all') {
      setFilteredPrescriptions(prescriptions);
    } else {
      setFilteredPrescriptions(prescriptions.filter(p => p.status === status));
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    let filtered = prescriptions;
    
    // Apply status filter first
    if (filterStatus !== 'all') {
      filtered = filtered.filter(p => p.status === filterStatus);
    }
    
    // Then apply search
    filtered = filtered.filter(p =>
      p.patient_name?.toLowerCase().includes(term) ||
      p.medication_name?.toLowerCase().includes(term) ||
      p.prescribing_healthcare_worker?.toLowerCase().includes(term) ||
      p.pharmacy_name?.toLowerCase().includes(term)
    );
    
    setFilteredPrescriptions(filtered);
  };

  const handleDispense = (prescription) => {
    setSelectedPrescription(prescription);
    setDispenseForm({
      ...dispenseForm,
      dispensed_date: new Date().toISOString().split('T')[0]
    });
    setShowDispenseModal(true);
  };

  const handleViewDetails = (prescription) => {
    setSelectedPrescription(prescription);
    setShowDetailsModal(true);
  };

  const handleDispenseSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      
      const updateData = {
        status: 'dispensed',
        dispensed_by: dispenseForm.dispensed_by,
        dispensed_date: dispenseForm.dispensed_date,
        notes: dispenseForm.notes
      };

      const response = await fetch(`${API_URL}/prescriptions/${selectedPrescription.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'dispensed' })
      });

      const data = await response.json();

      if (data.success) {
        // Update local state
        const updatedPrescriptions = prescriptions.map(p => {
          if (p.id === selectedPrescription.id) {
            return {
              ...p,
              status: 'dispensed',
              dispensed_by: dispenseForm.dispensed_by,
              dispensed_date: dispenseForm.dispensed_date,
              notes: dispenseForm.notes || p.notes
            };
          }
          return p;
        });
        setPrescriptions(updatedPrescriptions);
        setFilteredPrescriptions(updatedPrescriptions);
        updateStats(updatedPrescriptions);
        
        alert('✅ Prescription dispensed successfully!');
        setShowDispenseModal(false);
        setSelectedPrescription(null);
      } else {
        setError(data.message || 'Failed to dispense prescription');
      }
    } catch (err) {
      setError('Error dispensing prescription');
      console.error('Dispense error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDispenseInputChange = (e) => {
    const { name, value } = e.target;
    setDispenseForm(prev => ({ ...prev, [name]: value }));
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      prescribed: { class: 'status-prescribed', label: '💊 Prescribed' },
      sent_to_pharmacy: { class: 'status-sent', label: '📤 Sent to Pharmacy' },
      dispensed: { class: 'status-dispensed', label: '✅ Dispensed' },
      completed: { class: 'status-completed', label: '✔️ Completed' },
      cancelled: { class: 'status-cancelled', label: '❌ Cancelled' }
    };
    return statusMap[status] || statusMap.prescribed;
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

  const canDispense = (status) => {
    return status === 'sent_to_pharmacy' || status === 'prescribed';
  };

  if (loading) {
    return (
      <div className="pharmacy-container">
        <Sidebar role={role} />
        <div className="pharmacy-main">
          <Header role={role} />
          <div className="pharmacy-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
            <div style={{ textAlign: 'center' }}>
              <i className="fas fa-spinner fa-spin" style={{ fontSize: '40px', color: '#534AB7' }}></i>
              <p style={{ marginTop: '10px', color: '#6b7280' }}>Loading pharmacy...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pharmacy-container">
      <Sidebar role={role} />
      <div className="pharmacy-main">
        <Header role={role} />
        <div className="pharmacy-content">
          {/* ─── HEADER ─── */}
          <div className="pharmacy-header">
            <div className="pharmacy-header-left">
              <h1>🏪 Pharmacy</h1>
              <p className="pharmacy-subtitle">Manage and dispense prescriptions</p>
            </div>
            <div className="pharmacy-header-right">
              <span className="pharmacy-badge">
                <i className="fas fa-prescription"></i> {pharmacyStats.total} Total
              </span>
            </div>
          </div>

          {/* ─── STATS CARDS ─── */}
          <div className="pharmacy-stats">
            <div className="stat-card total">
              <div className="stat-icon">
                <i className="fas fa-prescription"></i>
              </div>
              <div className="stat-info">
                <span className="stat-label">Total Prescriptions</span>
                <span className="stat-value">{pharmacyStats.total}</span>
              </div>
            </div>
            <div className="stat-card pending">
              <div className="stat-icon">
                <i className="fas fa-clock"></i>
              </div>
              <div className="stat-info">
                <span className="stat-label">Pending</span>
                <span className="stat-value">{pharmacyStats.pending}</span>
              </div>
            </div>
            <div className="stat-card dispensed">
              <div className="stat-icon">
                <i className="fas fa-check-circle"></i>
              </div>
              <div className="stat-info">
                <span className="stat-label">Dispensed</span>
                <span className="stat-value">{pharmacyStats.dispensed}</span>
              </div>
            </div>
            <div className="stat-card completed">
              <div className="stat-icon">
                <i className="fas fa-flag-checkered"></i>
              </div>
              <div className="stat-info">
                <span className="stat-label">Completed</span>
                <span className="stat-value">{pharmacyStats.completed}</span>
              </div>
            </div>
          </div>

          {/* ─── SEARCH & FILTER ─── */}
          <div className="pharmacy-controls">
            <div className="search-bar">
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Search prescriptions by patient, medication, or doctor..."
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
                <option value="prescribed">💊 Prescribed</option>
                <option value="sent_to_pharmacy">📤 Sent to Pharmacy</option>
                <option value="dispensed">✅ Dispensed</option>
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

          {/* ─── PRESCRIPTIONS TABLE ─── */}
          <div className="pharmacy-table-container">
            {filteredPrescriptions.length === 0 ? (
              <div className="no-prescriptions">
                <i className="fas fa-prescription" style={{ fontSize: '48px', color: '#ccc' }}></i>
                <h3>No prescriptions found</h3>
                <p>No prescriptions match your search or filter criteria</p>
              </div>
            ) : (
              <table className="pharmacy-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Patient</th>
                    <th>Medication</th>
                    <th>Dosage</th>
                    <th>Frequency</th>
                    <th>Prescriber</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPrescriptions.map((prescription) => {
                    const status = getStatusBadge(prescription.status);
                    return (
                      <tr key={prescription.id}>
                        <td>{formatDate(prescription.date_prescribed || prescription.created_at)}</td>
                        <td>
                          <strong>{prescription.patient_name}</strong>
                        </td>
                        <td>{prescription.medication_name}</td>
                        <td>{prescription.dosage}</td>
                        <td>{prescription.frequency}</td>
                        <td>{prescription.prescribing_healthcare_worker}</td>
                        <td>
                          <span className={`status-badge ${status.class}`}>
                            {status.label}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button 
                              className="btn-view"
                              onClick={() => handleViewDetails(prescription)}
                              title="View Details"
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                            {canDispense(prescription.status) && (
                              <button 
                                className="btn-dispense"
                                onClick={() => handleDispense(prescription)}
                                title="Dispense"
                              >
                                <i className="fas fa-prescription"></i> Dispense
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

      {/* ─── DISPENSE MODAL ─── */}
      {showDispenseModal && selectedPrescription && (
        <div className="modal-overlay" onClick={() => setShowDispenseModal(false)}>
          <div className="modal-content dispense-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                <i className="fas fa-prescription" style={{ color: '#10B981' }}></i>
                Dispense Prescription
              </h2>
              <button className="modal-close" onClick={() => setShowDispenseModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="prescription-summary">
                <h3>Prescription Details</h3>
                <div className="summary-grid">
                  <div className="summary-item">
                    <label>Patient</label>
                    <span>{selectedPrescription.patient_name}</span>
                  </div>
                  <div className="summary-item">
                    <label>Medication</label>
                    <span>{selectedPrescription.medication_name} - {selectedPrescription.dosage}</span>
                  </div>
                  <div className="summary-item">
                    <label>Frequency</label>
                    <span>{selectedPrescription.frequency}</span>
                  </div>
                  <div className="summary-item">
                    <label>Duration</label>
                    <span>{selectedPrescription.duration}</span>
                  </div>
                  <div className="summary-item">
                    <label>Quantity</label>
                    <span>{selectedPrescription.quantity}</span>
                  </div>
                  <div className="summary-item">
                    <label>Prescriber</label>
                    <span>{selectedPrescription.prescribing_healthcare_worker}</span>
                  </div>
                  <div className="summary-item full-width">
                    <label>Instructions</label>
                    <span>{selectedPrescription.instructions || 'No instructions'}</span>
                  </div>
                  <div className="summary-item full-width">
                    <label>Notes</label>
                    <span>{selectedPrescription.notes || 'No additional notes'}</span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleDispenseSubmit}>
                <div className="form-group">
                  <label>Dispensed By <span className="mandatory">*</span></label>
                  <input
                    type="text"
                    name="dispensed_by"
                    value={dispenseForm.dispensed_by}
                    onChange={handleDispenseInputChange}
                    placeholder="Enter pharmacist name"
                    required
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label>Dispensed Date <span className="mandatory">*</span></label>
                  <input
                    type="date"
                    name="dispensed_date"
                    value={dispenseForm.dispensed_date}
                    onChange={handleDispenseInputChange}
                    required
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label>Notes</label>
                  <textarea
                    name="notes"
                    value={dispenseForm.notes}
                    onChange={handleDispenseInputChange}
                    placeholder="Any additional notes about dispensing..."
                    rows="3"
                    className="form-control"
                  />
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn-secondary" onClick={() => setShowDispenseModal(false)}>
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="btn-success"
                    disabled={loading || !dispenseForm.dispensed_by || !dispenseForm.dispensed_date}
                  >
                    {loading ? (
                      <><i className="fas fa-spinner fa-spin"></i> Processing...</>
                    ) : (
                      <><i className="fas fa-check-circle"></i> Confirm Dispense</>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ─── DETAILS MODAL ─── */}
      {showDetailsModal && selectedPrescription && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="modal-content details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                <i className="fas fa-file-medical" style={{ color: '#534AB7' }}></i>
                Prescription Details
              </h2>
              <button className="modal-close" onClick={() => setShowDetailsModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="details-grid">
                <div className="detail-item">
                  <label>Patient</label>
                  <span><strong>{selectedPrescription.patient_name}</strong></span>
                </div>
                <div className="detail-item">
                  <label>Date Prescribed</label>
                  <span>{formatDate(selectedPrescription.date_prescribed || selectedPrescription.created_at)}</span>
                </div>
                <div className="detail-item">
                  <label>Medication</label>
                  <span>{selectedPrescription.medication_name}</span>
                </div>
                <div className="detail-item">
                  <label>Dosage</label>
                  <span>{selectedPrescription.dosage}</span>
                </div>
                <div className="detail-item">
                  <label>Frequency</label>
                  <span>{selectedPrescription.frequency}</span>
                </div>
                <div className="detail-item">
                  <label>Duration</label>
                  <span>{selectedPrescription.duration}</span>
                </div>
                <div className="detail-item">
                  <label>Quantity</label>
                  <span>{selectedPrescription.quantity}</span>
                </div>
                <div className="detail-item">
                  <label>Status</label>
                  <span className={`status-badge ${getStatusBadge(selectedPrescription.status).class}`}>
                    {getStatusBadge(selectedPrescription.status).label}
                  </span>
                </div>
                <div className="detail-item">
                  <label>Prescriber</label>
                  <span>{selectedPrescription.prescribing_healthcare_worker}</span>
                </div>
                <div className="detail-item">
                  <label>Pharmacy</label>
                  <span>{selectedPrescription.pharmacy_name}</span>
                </div>
                <div className="detail-item full-width">
                  <label>Instructions</label>
                  <span>{selectedPrescription.instructions || 'No instructions'}</span>
                </div>
                <div className="detail-item full-width">
                  <label>Notes</label>
                  <span>{selectedPrescription.notes || 'No additional notes'}</span>
                </div>
                {selectedPrescription.dispensed_by && (
                  <>
                    <div className="detail-item">
                      <label>Dispensed By</label>
                      <span>{selectedPrescription.dispensed_by}</span>
                    </div>
                    <div className="detail-item">
                      <label>Dispensed Date</label>
                      <span>{formatDate(selectedPrescription.dispensed_date)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className="modal-footer">
              {canDispense(selectedPrescription.status) && (
                <button 
                  className="btn-success"
                  onClick={() => {
                    setShowDetailsModal(false);
                    handleDispense(selectedPrescription);
                  }}
                >
                  <i className="fas fa-prescription"></i> Dispense
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

export default Pharmacy;