// src/pages/prescriptions.jsx (or Prescriptions.jsx)
import React, { useState, useEffect } from 'react';
import Sidebar from '../components/common/Sidebar';
import Header from '../components/common/Header';
import './styles/prescriptions.css';

function Prescriptions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [role, setRole] = useState('doctor');
  const [user, setUser] = useState(null);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [prescriptions, setPrescriptions] = useState([]);
  const [patientPrescriptions, setPatientPrescriptions] = useState([]);
  const [pharmacies, setPharmacies] = useState([]);
  const [selectedPharmacy, setSelectedPharmacy] = useState('');
  const [prescriptionSuccess, setPrescriptionSuccess] = useState(false);

  // ─── PRESCRIPTION FORM ───
  const [prescriptionForm, setPrescriptionForm] = useState({
    patient_id: '',
    medication_name: '',
    dosage: '',
    frequency: '',
    duration: '',
    quantity: '',
    instructions: '',
    prescribing_healthcare_worker: '',
    pharmacy_id: '',
    status: 'prescribed',
    notes: ''
  });

  // ─── MEDICATION LIST ───
  const medications = [
    { name: 'Paracetamol', dosage: '500mg', form: 'Tablet' },
    { name: 'Ibuprofen', dosage: '400mg', form: 'Tablet' },
    { name: 'Amoxicillin', dosage: '500mg', form: 'Capsule' },
    { name: 'Ciprofloxacin', dosage: '500mg', form: 'Tablet' },
    { name: 'Metformin', dosage: '500mg', form: 'Tablet' },
    { name: 'Lisinopril', dosage: '10mg', form: 'Tablet' },
    { name: 'Atorvastatin', dosage: '20mg', form: 'Tablet' },
    { name: 'Omeprazole', dosage: '20mg', form: 'Capsule' },
    { name: 'Salbutamol', dosage: '100mcg', form: 'Inhaler' },
    { name: 'Insulin', dosage: '100IU', form: 'Injection' },
    { name: 'Diazepam', dosage: '5mg', form: 'Tablet' },
    { name: 'Amlodipine', dosage: '5mg', form: 'Tablet' },
    { name: 'Losartan', dosage: '50mg', form: 'Tablet' },
    { name: 'Pantoprazole', dosage: '40mg', form: 'Tablet' },
    { name: 'Azithromycin', dosage: '500mg', form: 'Tablet' }
  ];

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    console.log('Prescriptions component mounted');
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      if (userData) {
        setUser(userData);
        setRole(userData.role || 'doctor');
        setPrescriptionForm(prev => ({
          ...prev,
          prescribing_healthcare_worker: userData.full_name || userData.name || 'Dr. Unknown'
        }));
      }
      fetchPatients();
      fetchPharmacies();
      fetchAllPrescriptions();
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
          { patient_id: 4, first_name: 'Mary', last_name: 'Williams', phone_number: '0745678901', id_number: '8604045004089' },
          { patient_id: 5, first_name: 'David', last_name: 'Brown', phone_number: '0756789012', id_number: '8705055005090' }
        ]);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
      setPatients([
        { patient_id: 1, first_name: 'John', last_name: 'Doe', phone_number: '0712345678', id_number: '8001015001086' },
        { patient_id: 2, first_name: 'Jane', last_name: 'Smith', phone_number: '0723456789', id_number: '9002025002087' },
        { patient_id: 3, first_name: 'Peter', last_name: 'Jones', phone_number: '0734567890', id_number: '8503035003088' },
        { patient_id: 4, first_name: 'Mary', last_name: 'Williams', phone_number: '0745678901', id_number: '8604045004089' },
        { patient_id: 5, first_name: 'David', last_name: 'Brown', phone_number: '0756789012', id_number: '8705055005090' }
      ]);
    }
  };

  const fetchPharmacies = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/pharmacies`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setPharmacies(data.pharmacies || []);
      } else {
        setPharmacies([
          { id: 1, name: 'Clicks Pharmacy - Sandton', address: 'Sandton City Mall, Shop 123', phone: '011 123 4567' },
          { id: 2, name: 'Dis-Chem Pharmacy - Rosebank', address: 'The Zone, Rosebank, Shop 45', phone: '011 234 5678' },
          { id: 3, name: 'MediRite Pharmacy - Soweto', address: 'Maponya Mall, Soweto', phone: '011 345 6789' },
          { id: 4, name: 'Pharmacy Direct - Online', address: 'Online Delivery Service', phone: '0800 123 456' }
        ]);
      }
    } catch (error) {
      console.error('Error fetching pharmacies:', error);
      setPharmacies([
        { id: 1, name: 'Clicks Pharmacy - Sandton', address: 'Sandton City Mall, Shop 123', phone: '011 123 4567' },
        { id: 2, name: 'Dis-Chem Pharmacy - Rosebank', address: 'The Zone, Rosebank, Shop 45', phone: '011 234 5678' },
        { id: 3, name: 'MediRite Pharmacy - Soweto', address: 'Maponya Mall, Soweto', phone: '011 345 6789' },
        { id: 4, name: 'Pharmacy Direct - Online', address: 'Online Delivery Service', phone: '0800 123 456' }
      ]);
    }
  };

  const fetchAllPrescriptions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/prescriptions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setPrescriptions(data.prescriptions || []);
      }
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      // Mock data
      setPrescriptions([
        {
          id: 1,
          patient_name: 'John Doe',
          medication_name: 'Paracetamol',
          dosage: '500mg',
          frequency: '4 times daily',
          duration: '5 days',
          quantity: '20 tablets',
          instructions: 'Take after meals with plenty of water',
          prescribing_healthcare_worker: 'Dr. Smith',
          pharmacy_name: 'Clicks Pharmacy - Sandton',
          date_prescribed: '2026-08-20',
          status: 'dispensed'
        },
        {
          id: 2,
          patient_name: 'Jane Smith',
          medication_name: 'Amoxicillin',
          dosage: '500mg',
          frequency: '3 times daily',
          duration: '7 days',
          quantity: '21 capsules',
          instructions: 'Complete full course even if symptoms improve',
          prescribing_healthcare_worker: 'Dr. Jones',
          pharmacy_name: 'Dis-Chem Pharmacy - Rosebank',
          date_prescribed: '2026-08-21',
          status: 'sent_to_pharmacy'
        },
        {
          id: 3,
          patient_name: 'Peter Jones',
          medication_name: 'Metformin',
          dosage: '500mg',
          frequency: 'Twice daily',
          duration: '3 months',
          quantity: '180 tablets',
          instructions: 'Take with meals to reduce stomach upset',
          prescribing_healthcare_worker: 'Dr. Brown',
          pharmacy_name: 'MediRite Pharmacy - Soweto',
          date_prescribed: '2026-08-22',
          status: 'prescribed'
        }
      ]);
    }
  };

  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
    setPrescriptionForm(prev => ({ ...prev, patient_id: patient.patient_id }));
    // Filter prescriptions for this patient
    const filtered = prescriptions.filter(p => 
      p.patient_name?.toLowerCase().includes(`${patient.first_name} ${patient.last_name}`.toLowerCase())
    );
    setPatientPrescriptions(filtered);
    setPrescriptionSuccess(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPrescriptionForm(prev => ({ ...prev, [name]: value }));
  };

  const handleMedicationSelect = (e) => {
    const value = e.target.value;
    if (value === 'other') {
      setPrescriptionForm(prev => ({
        ...prev,
        medication_name: '',
        dosage: ''
      }));
      return;
    }
    const selectedMed = medications.find(m => m.name === value);
    if (selectedMed) {
      setPrescriptionForm(prev => ({
        ...prev,
        medication_name: selectedMed.name,
        dosage: selectedMed.dosage
      }));
    }
  };

  const handleSubmitPrescription = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      
      // Validate form
      if (!prescriptionForm.medication_name || !prescriptionForm.dosage || !prescriptionForm.frequency) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }

      if (!prescriptionForm.pharmacy_id && !selectedPharmacy) {
        setError('Please select a pharmacy');
        setLoading(false);
        return;
      }

      const pharmacyId = prescriptionForm.pharmacy_id || selectedPharmacy;
      const pharmacyName = pharmacies.find(p => p.id == pharmacyId)?.name || 'Pharmacy';

      const prescriptionData = {
        ...prescriptionForm,
        patient_id: selectedPatient.patient_id,
        pharmacy_id: parseInt(pharmacyId),
        pharmacy_name: pharmacyName,
        date_prescribed: new Date().toISOString().split('T')[0],
        prescribing_healthcare_worker: prescriptionForm.prescribing_healthcare_worker || user?.full_name || 'Dr. Unknown',
        status: 'sent_to_pharmacy'
      };

      console.log('Submitting prescription:', prescriptionData);

      const response = await fetch(`${API_URL}/prescriptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(prescriptionData)
      });

      const data = await response.json();

      if (data.success) {
        setPrescriptionSuccess(true);
        setShowPrescriptionModal(false);
        
        // Add to local lists
        const newPrescription = {
          ...prescriptionData,
          id: data.prescription_id || Date.now(),
          patient_name: `${selectedPatient.first_name} ${selectedPatient.last_name}`
        };
        setPrescriptions([newPrescription, ...prescriptions]);
        setPatientPrescriptions([newPrescription, ...patientPrescriptions]);
        
        alert('✅ Prescription sent electronically to pharmacy successfully!');
        
        // Reset form
        setPrescriptionForm({
          patient_id: '',
          medication_name: '',
          dosage: '',
          frequency: '',
          duration: '',
          quantity: '',
          instructions: '',
          prescribing_healthcare_worker: user?.full_name || 'Dr. Unknown',
          pharmacy_id: '',
          status: 'prescribed',
          notes: ''
        });
        setSelectedPharmacy('');
      } else {
        setError(data.message || 'Failed to create prescription');
      }
    } catch (err) {
      setError('Error creating prescription');
      console.error('Prescription error:', err);
    } finally {
      setLoading(false);
    }
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

  const filteredPatients = patients.filter(p =>
    p.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.phone_number?.includes(searchTerm) ||
    p.id_number?.includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="prescriptions-container">
        <Sidebar role={role} />
        <div className="prescriptions-main">
          <Header role={role} />
          <div className="prescriptions-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
            <div style={{ textAlign: 'center' }}>
              <i className="fas fa-spinner fa-spin" style={{ fontSize: '40px', color: '#534AB7' }}></i>
              <p style={{ marginTop: '10px', color: '#6b7280' }}>Loading prescriptions...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="prescriptions-container">
      <Sidebar role={role} />
      <div className="prescriptions-main">
        <Header role={role} />
        <div className="prescriptions-content">
          {/* ─── HEADER ─── */}
          <div className="prescriptions-header">
            <div className="prescriptions-header-left">
              <h1>💊 Prescriptions</h1>
              <p className="prescriptions-subtitle">
                {selectedPatient ? `Prescribing for: ${selectedPatient.first_name} ${selectedPatient.last_name}` : 'Select a patient to prescribe'}
              </p>
            </div>
            <div className="prescriptions-header-right">
              {selectedPatient && (
                <button 
                  className="btn-primary"
                  onClick={() => setShowPrescriptionModal(true)}
                >
                  <i className="fas fa-prescription"></i> New Prescription
                </button>
              )}
            </div>
          </div>

          {/* ─── SEARCH ─── */}
          <div className="search-bar">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Search patients by name, ID, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          {error && (
            <div className="alert alert-error">
              <i className="fas fa-exclamation-circle"></i>
              <span>{error}</span>
            </div>
          )}

          <div className="prescriptions-layout">
            {/* ─── PATIENT LIST ─── */}
            <div className="patient-list">
              <h3>Patients ({filteredPatients.length})</h3>
              {filteredPatients.length === 0 ? (
                <div className="empty-state-small">
                  <p>No patients found</p>
                </div>
              ) : (
                filteredPatients.map(patient => (
                  <div 
                    key={patient.patient_id}
                    className={`patient-list-item ${selectedPatient?.patient_id === patient.patient_id ? 'active' : ''}`}
                    onClick={() => handleSelectPatient(patient)}
                  >
                    <div className="patient-list-avatar">
                      {patient.first_name?.charAt(0)}{patient.last_name?.charAt(0)}
                    </div>
                    <div className="patient-list-info">
                      <div className="patient-list-name">
                        {patient.first_name} {patient.last_name}
                      </div>
                      <div className="patient-list-detail">
                        {patient.phone_number || patient.phone}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* ─── PRESCRIPTIONS LIST ─── */}
            <div className="prescriptions-list-container">
              {selectedPatient ? (
                <>
                  <div className="section-card">
                    <h3>
                      <i className="fas fa-prescription"></i>
                      {selectedPatient.first_name} {selectedPatient.last_name}'s Prescriptions
                      <span className="prescription-count">
                        {patientPrescriptions.length} prescriptions
                      </span>
                    </h3>
                    
                    {patientPrescriptions.length === 0 ? (
                      <div className="no-prescriptions">
                        <i className="fas fa-prescription" style={{ fontSize: '48px', color: '#ccc' }}></i>
                        <p>No prescriptions for this patient</p>
                        <button 
                          className="btn-primary"
                          onClick={() => setShowPrescriptionModal(true)}
                        >
                          <i className="fas fa-plus"></i> Create Prescription
                        </button>
                      </div>
                    ) : (
                      <div className="prescriptions-table-container">
                        <table className="prescriptions-table">
                          <thead>
                            <tr>
                              <th>Date</th>
                              <th>Medication</th>
                              <th>Dosage</th>
                              <th>Frequency</th>
                              <th>Duration</th>
                              <th>Instructions</th>
                              <th>Prescriber</th>
                              <th>Pharmacy</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {patientPrescriptions.map((prescription, index) => {
                              const status = getStatusBadge(prescription.status);
                              return (
                                <tr key={index}>
                                  <td>{formatDate(prescription.date_prescribed || prescription.created_at)}</td>
                                  <td><strong>{prescription.medication_name}</strong></td>
                                  <td>{prescription.dosage}</td>
                                  <td>{prescription.frequency}</td>
                                  <td>{prescription.duration}</td>
                                  <td>{prescription.instructions || 'N/A'}</td>
                                  <td>{prescription.prescribing_healthcare_worker}</td>
                                  <td>{prescription.pharmacy_name || prescription.pharmacy}</td>
                                  <td>
                                    <span className={`status-badge ${status.class}`}>
                                      {status.label}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {prescriptionSuccess && (
                    <div className="prescription-success-banner">
                      <i className="fas fa-check-circle"></i>
                      <span>✅ Prescription sent electronically to pharmacy successfully!</span>
                    </div>
                  )}
                </>
              ) : (
                <div className="no-patient-selected">
                  <i className="fas fa-user-md" style={{ fontSize: '48px', color: '#ccc' }}></i>
                  <h3>Select a patient</h3>
                  <p>Choose a patient from the list to view or create prescriptions</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ─── PRESCRIPTION MODAL ─── */}
      {showPrescriptionModal && selectedPatient && (
        <div className="modal-overlay" onClick={() => setShowPrescriptionModal(false)}>
          <div className="modal-content prescription-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                <i className="fas fa-prescription" style={{ color: '#534AB7' }}></i>
                New Prescription - {selectedPatient.first_name} {selectedPatient.last_name}
              </h2>
              <button className="modal-close" onClick={() => setShowPrescriptionModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmitPrescription}>
                {/* ─── PATIENT INFO ─── */}
                <div className="form-row">
                  <div className="form-group">
                    <label>Patient</label>
                    <input 
                      type="text" 
                      value={`${selectedPatient.first_name} ${selectedPatient.last_name}`}
                      disabled
                      className="form-control-disabled"
                    />
                  </div>
                  <div className="form-group">
                    <label>Date Prescribed</label>
                    <input 
                      type="date" 
                      value={new Date().toISOString().split('T')[0]}
                      disabled
                      className="form-control-disabled"
                    />
                  </div>
                </div>

                {/* ─── MEDICATION NAME ─── */}
                <div className="form-group">
                  <label>Medication Name <span className="mandatory">*</span></label>
                  <select
                    name="medication_name"
                    value={prescriptionForm.medication_name}
                    onChange={handleMedicationSelect}
                    required
                    className="form-control"
                  >
                    <option value="">Select medication...</option>
                    {medications.map(med => (
                      <option key={med.name} value={med.name}>
                        {med.name} - {med.dosage} ({med.form})
                      </option>
                    ))}
                    <option value="other">Other (Type manually)</option>
                  </select>
                </div>

                {/* ─── OR TYPE MANUALLY ─── */}
                {prescriptionForm.medication_name === 'other' && (
                  <div className="form-group">
                    <label>Medication Name <span className="mandatory">*</span></label>
                    <input
                      type="text"
                      name="medication_name"
                      value={prescriptionForm.medication_name}
                      onChange={handleInputChange}
                      placeholder="Enter medication name"
                      required
                      className="form-control"
                    />
                  </div>
                )}

                {/* ─── DOSAGE ─── */}
                <div className="form-group">
                  <label>Dosage <span className="mandatory">*</span></label>
                  <input
                    type="text"
                    name="dosage"
                    value={prescriptionForm.dosage}
                    onChange={handleInputChange}
                    placeholder="e.g., 500mg"
                    required
                    className="form-control"
                  />
                </div>

                {/* ─── FREQUENCY ─── */}
                <div className="form-group">
                  <label>Frequency <span className="mandatory">*</span></label>
                  <select
                    name="frequency"
                    value={prescriptionForm.frequency}
                    onChange={handleInputChange}
                    required
                    className="form-control"
                  >
                    <option value="">Select frequency...</option>
                    <option value="Once daily">Once daily</option>
                    <option value="Twice daily">Twice daily</option>
                    <option value="3 times daily">3 times daily</option>
                    <option value="4 times daily">4 times daily</option>
                    <option value="Every 4 hours">Every 4 hours</option>
                    <option value="Every 6 hours">Every 6 hours</option>
                    <option value="Every 8 hours">Every 8 hours</option>
                    <option value="As needed">As needed</option>
                    <option value="Before meals">Before meals</option>
                    <option value="After meals">After meals</option>
                    <option value="At bedtime">At bedtime</option>
                  </select>
                </div>

                {/* ─── DURATION ─── */}
                <div className="form-group">
                  <label>Duration <span className="mandatory">*</span></label>
                  <select
                    name="duration"
                    value={prescriptionForm.duration}
                    onChange={handleInputChange}
                    required
                    className="form-control"
                  >
                    <option value="">Select duration...</option>
                    <option value="1 day">1 day</option>
                    <option value="3 days">3 days</option>
                    <option value="5 days">5 days</option>
                    <option value="7 days">7 days</option>
                    <option value="10 days">10 days</option>
                    <option value="14 days">14 days</option>
                    <option value="21 days">21 days</option>
                    <option value="1 month">1 month</option>
                    <option value="2 months">2 months</option>
                    <option value="3 months">3 months</option>
                    <option value="Ongoing">Ongoing</option>
                  </select>
                </div>

                {/* ─── QUANTITY ─── */}
                <div className="form-group">
                  <label>Quantity</label>
                  <input
                    type="text"
                    name="quantity"
                    value={prescriptionForm.quantity}
                    onChange={handleInputChange}
                    placeholder="e.g., 20 tablets"
                    className="form-control"
                  />
                </div>

                {/* ─── INSTRUCTIONS ─── */}
                <div className="form-group">
                  <label>Instructions for Patient</label>
                  <textarea
                    name="instructions"
                    value={prescriptionForm.instructions}
                    onChange={handleInputChange}
                    placeholder="Special instructions for the patient..."
                    rows="3"
                    className="form-control"
                  />
                </div>

                {/* ─── PRESCRIBING HEALTHCARE WORKER ─── */}
                <div className="form-group">
                  <label>Prescribing Healthcare Worker <span className="mandatory">*</span></label>
                  <input
                    type="text"
                    name="prescribing_healthcare_worker"
                    value={prescriptionForm.prescribing_healthcare_worker}
                    onChange={handleInputChange}
                    placeholder="Enter doctor's name"
                    required
                    className="form-control"
                  />
                </div>

                {/* ─── PHARMACY SELECTION ─── */}
                <div className="form-group">
                  <label>Select Pharmacy <span className="mandatory">*</span></label>
                  <select
                    name="pharmacy_id"
                    value={prescriptionForm.pharmacy_id || selectedPharmacy}
                    onChange={(e) => {
                      setSelectedPharmacy(e.target.value);
                      setPrescriptionForm(prev => ({ ...prev, pharmacy_id: e.target.value }));
                    }}
                    required
                    className="form-control"
                  >
                    <option value="">Select pharmacy...</option>
                    {pharmacies.map(pharmacy => (
                      <option key={pharmacy.id} value={pharmacy.id}>
                        {pharmacy.name} - {pharmacy.address || 'No address'}
                      </option>
                    ))}
                  </select>
                  <small className="form-help">
                    <i className="fas fa-info-circle"></i> 
                    Prescription will be sent electronically to the selected pharmacy
                  </small>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn-secondary" onClick={() => setShowPrescriptionModal(false)}>
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="btn-primary"
                    disabled={loading || !prescriptionForm.medication_name || !prescriptionForm.dosage || !prescriptionForm.frequency || !prescriptionForm.duration || !prescriptionForm.pharmacy_id}
                  >
                    {loading ? (
                      <><i className="fas fa-spinner fa-spin"></i> Sending...</>
                    ) : (
                      <><i className="fas fa-paper-plane"></i> Send to Pharmacy</>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Prescriptions;