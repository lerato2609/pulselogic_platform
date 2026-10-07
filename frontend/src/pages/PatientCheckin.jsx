import React, { useState, useEffect } from 'react';
import Sidebar from '../components/common/Sidebar';
import Header from '../components/common/Header';
import './styles/patientcheckin.css';

function PatientCheckin() {
  const [loading, setLoading] = useState(false);
  const [patient, setPatient] = useState(null);
  const [patientHistory, setPatientHistory] = useState(null);
  const [error, setError] = useState('');
  const [role, setRole] = useState('reception');
  const [scanMethod, setScanMethod] = useState('qr');
  const [identifier, setIdentifier] = useState('');
  const [qrData, setQrData] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [biometricScanning, setBiometricScanning] = useState(false);
  
  // ─── OTP STATE ───
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpExpiry, setOtpExpiry] = useState(null);
  const [patientIdForOtp, setPatientIdForOtp] = useState(null);
  const [otpTimer, setOtpTimer] = useState(600);
  const [otpResendDisabled, setOtpResendDisabled] = useState(false);
  const [otpPhone, setOtpPhone] = useState('');

  // ─── QR CODE STATE ───
  const [showQRCode, setShowQRCode] = useState(false);
  const [qrCodeImage, setQrCodeImage] = useState(null);
  const [qrCodeId, setQrCodeId] = useState('');

  const API_URL = 'http://localhost:5000';

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) setRole(user.role);
  }, []);

  // ─── OTP TIMER ───
  useEffect(() => {
    if (otpSent && otpTimer > 0) {
      const interval = setInterval(() => {
        setOtpTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else if (otpTimer === 0) {
      setOtpSent(false);
      setError('OTP has expired. Please request a new one.');
    }
  }, [otpSent, otpTimer]);

  // ─── GENERATE AND SEND OTP ───
  const sendOTP = async (patientId, phoneNumber) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/auth/patient-send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ patient_id: patientId, phone_number: phoneNumber })
      });
      const data = await response.json();
      
      if (data.success) {
        setOtpSent(true);
        setOtpTimer(600);
        setOtpResendDisabled(true);
        setOtpPhone(phoneNumber);
        setPatientIdForOtp(patientId);
        // For demo, show OTP in alert (in production, OTP is sent via SMS)
        alert(`📱 OTP sent to ${phoneNumber}\n\nYour OTP: ${data.otp}\nExpires in 10 minutes.`);
        setTimeout(() => {
          setOtpResendDisabled(false);
        }, 30000);
      } else {
        setError(data.message || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      setError('Failed to send OTP. Please try again.');
    }
  };

  // ─── VERIFY OTP ───
  const verifyOTP = async () => {
    if (!otpCode || otpCode.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/auth/patient-verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          patient_id: patientIdForOtp, 
          otp_code: otpCode 
        })
      });
      const data = await response.json();

      if (data.success) {
        setOtpVerified(true);
        setOtpSent(false);
        setError('');
        alert('✅ OTP verified successfully!');
        // Complete check-in after OTP verification
        await completeCheckin();
      } else {
        setError(data.message || 'Invalid OTP. Please try again.');
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      setError('Error verifying OTP');
    }
  };

  // ─── COMPLETE CHECK-IN ───
  const completeCheckin = async () => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));
      
      // Record check-in
      const response = await fetch(`${API_URL}/api/checkin/complete-checkin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          patient_id: patientIdForOtp,
          facility_id: user?.facility?.id || null,
          checkin_method: scanMethod
        })
      });
      
      const data = await response.json();
      if (data.success) {
        alert(`✅ Check-in complete!`);
        // Refresh patient info
        await getPatientHistory(patientIdForOtp);
      }
    } catch (error) {
      console.error('Error completing check-in:', error);
    }
  };

  // ─── RESEND OTP ───
  const resendOTP = () => {
    if (!patientIdForOtp || !otpPhone) return;
    sendOTP(patientIdForOtp, otpPhone);
  };

  // ─── GET PATIENT HISTORY ───
  const getPatientHistory = async (patientId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/patients/${patientId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setPatientHistory(data.data);
      }
    } catch (error) {
      console.error('Error fetching patient history:', error);
    }
  };

  // ─── SCAN QR CODE ───
  const handleQRScan = async () => {
    if (!identifier) {
      setError('Please scan or enter QR code');
      return;
    }
    
    setLoading(true);
    setError('');
    setOtpSent(false);
    setOtpVerified(false);
    setPatient(null);
    
    try {
      const token = localStorage.getItem('token');
      
      // Get patient by QR code
      const response = await fetch(`${API_URL}/api/checkin/smart-card/${identifier}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      
      if (data.success) {
        const patientData = data.data;
        setPatient(patientData);
        setPatientIdForOtp(patientData.patient_id);
        setOtpPhone(patientData.phone_number);
        
        // Send OTP
        await sendOTP(patientData.patient_id, patientData.phone_number);
        
        // Get patient history
        await getPatientHistory(patientData.patient_id);
        
      } else {
        setError(data.message || 'Patient not found');
      }
    } catch (err) {
      setError('Error scanning QR code. Please try again.');
      console.error('QR scan error:', err);
    } finally {
      setLoading(false);
    }
  };

  // ─── SCAN FINGERPRINT ───
  const scanFingerprint = () => {
    setBiometricScanning(true);
    setError('');
    
    setTimeout(() => {
      const fingerprintId = `FP${Date.now().toString().slice(-8)}`;
      setIdentifier(fingerprintId);
      setBiometricScanning(false);
      findPatientByBiometric('fingerprint', fingerprintId);
    }, 2000);
  };

  // ─── SCAN FACE ───
  const scanFace = () => {
    setBiometricScanning(true);
    setError('');
    
    setTimeout(() => {
      const faceId = `FC${Date.now().toString().slice(-8)}`;
      setIdentifier(faceId);
      setBiometricScanning(false);
      findPatientByBiometric('face', faceId);
    }, 2000);
  };

  // ─── FIND PATIENT BY BIOMETRIC ───
  const findPatientByBiometric = async (type, data) => {
    setLoading(true);
    setError('');
    setOtpSent(false);
    setOtpVerified(false);
    setPatient(null);
    
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));
      
      const response = await fetch(`${API_URL}/api/checkin/biometric-checkin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          biometric_data: data,
          biometric_type: type,
          facilityId: user?.facility?.id || null
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        const patientData = result.data.patient;
        setPatient(patientData);
        setPatientIdForOtp(patientData.id);
        setOtpPhone(patientData.phone);
        setPatientHistory(result.data.history);
        
        // Send OTP
        await sendOTP(patientData.id, patientData.phone);
        
      } else {
        setError(result.message || 'Patient not found');
      }
    } catch (err) {
      setError('Error during biometric check-in. Please try again.');
      console.error('Biometric error:', err);
    } finally {
      setLoading(false);
    }
  };

  // ─── SEARCH PATIENT ───
  const handleSearch = async () => {
    if (!searchTerm) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/patients`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success) {
        const results = data.data.filter(p => 
          p.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.phone_number?.includes(searchTerm) ||
          p.patient_code?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setSearchResults(results);
        setShowSearch(true);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  // ─── SELECT PATIENT FROM SEARCH ───
  const selectPatient = (patient) => {
    setPatient(patient);
    setPatientIdForOtp(patient.patient_id);
    setOtpPhone(patient.phone_number);
    setSearchResults([]);
    setShowSearch(false);
    setSearchTerm('');
    // Send OTP
    sendOTP(patient.patient_id, patient.phone_number);
    // Get patient history
    getPatientHistory(patient.patient_id);
  };

  // ─── FORMAT TIME ───
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // ─── GENERATE QR CODE ───
  const generateQRCode = async () => {
    if (!patientIdForOtp) {
      setError('Please find a patient first');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/checkin/generate-qr/${patientIdForOtp}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setQrCodeImage(data.data.qrCode);
        setQrCodeId(data.data.qrCodeId);
        setShowQRCode(true);
      } else {
        setError(data.message || 'Failed to generate QR code');
      }
    } catch (error) {
      console.error('QR generation error:', error);
      setError('Failed to generate QR code');
    }
  };

  return (
    <div className="checkin-container">
      <Sidebar role={role} />
      <div className="checkin-main">
        <Header role={role} />
        <div className="checkin-content">
          
          <div className="checkin-header">
            <div>
              <h1>📋 Patient Check-in</h1>
              <p className="checkin-subtitle">Scan QR Code, Fingerprint, or Face Recognition</p>
            </div>
          </div>

          <div className="scan-methods">
            <button 
              className={`scan-method-btn ${scanMethod === 'qr' ? 'active' : ''}`}
              onClick={() => setScanMethod('qr')}
            >
              <i className="fas fa-qrcode"></i> QR Code
            </button>
            <button 
              className={`scan-method-btn ${scanMethod === 'fingerprint' ? 'active' : ''}`}
              onClick={() => setScanMethod('fingerprint')}
            >
              <i className="fas fa-fingerprint"></i> Fingerprint
            </button>
            <button 
              className={`scan-method-btn ${scanMethod === 'face' ? 'active' : ''}`}
              onClick={() => setScanMethod('face')}
            >
              <i className="fas fa-face-smile"></i> Face Recognition
            </button>
            <button 
              className={`scan-method-btn ${scanMethod === 'manual' ? 'active' : ''}`}
              onClick={() => setScanMethod('manual')}
            >
              <i className="fas fa-keyboard"></i> Manual
            </button>
          </div>

          {/* ─── QR CODE SCAN ─── */}
          {scanMethod === 'qr' && (
            <div className="biometric-scanner">
              <div className="biometric-scanner-icon">
                <i className="fas fa-qrcode"></i>
              </div>
              <h3>Scan QR Code</h3>
              <p>Position QR code in the scanner</p>
              <div className="qr-scanner-box">
                <div className="qr-scanner-frame">
                  <div className="qr-scanner-line"></div>
                </div>
                <input
                  type="text"
                  className="qr-input"
                  placeholder="Enter QR Code ID..."
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleQRScan()}
                />
                <button className="btn-scan-big" onClick={handleQRScan} disabled={loading}>
                  {loading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-scan"></i>} Scan QR
                </button>
              </div>
            </div>
          )}

          {/* ─── FINGERPRINT SCAN ─── */}
          {scanMethod === 'fingerprint' && (
            <div className="biometric-scanner">
              <div className="biometric-scanner-icon">
                <i className="fas fa-fingerprint"></i>
              </div>
              <h3>Place your finger on the scanner</h3>
              <p>Fingerprint check-in is <strong>fast and secure</strong></p>
              {biometricScanning ? (
                <div className="scanning-animation">
                  <div className="pulse-ring"></div>
                  <p>Scanning fingerprint...</p>
                </div>
              ) : (
                <button className="btn-scan-big" onClick={scanFingerprint}>
                  <i className="fas fa-scan"></i> Start Fingerprint Scan
                </button>
              )}
            </div>
          )}

          {/* ─── FACE RECOGNITION ─── */}
          {scanMethod === 'face' && (
            <div className="biometric-scanner">
              <div className="biometric-scanner-icon">
                <i className="fas fa-face-smile"></i>
              </div>
              <h3>Look at the camera for face recognition</h3>
              <p>Face recognition is <strong>fast and secure</strong></p>
              {biometricScanning ? (
                <div className="scanning-animation">
                  <div className="pulse-ring"></div>
                  <p>Scanning face...</p>
                </div>
              ) : (
                <button className="btn-scan-big" onClick={scanFace}>
                  <i className="fas fa-camera"></i> Start Face Scan
                </button>
              )}
            </div>
          )}

          {/* ─── MANUAL SEARCH ─── */}
          {scanMethod === 'manual' && (
            <div className="manual-checkin">
              <div className="manual-input-wrapper">
                <input
                  type="text"
                  className="manual-input"
                  placeholder="Search by name, phone, or patient code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button className="btn-scan-big" onClick={handleSearch} disabled={loading}>
                  {loading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-search"></i>} Search
                </button>
              </div>
              
              {showSearch && searchResults.length > 0 && (
                <div className="search-results">
                  {searchResults.map((p) => (
                    <div key={p.patient_id} className="search-result-item" onClick={() => selectPatient(p)}>
                      <div className="result-avatar">
                        <i className="fas fa-user"></i>
                      </div>
                      <div className="result-info">
                        <div className="result-name">{p.first_name} {p.last_name}</div>
                        <div className="result-detail">{p.phone_number} | {p.patient_code}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ─── ERROR ─── */}
          {error && (
            <div className="alert alert-error">
              <i className="fas fa-exclamation-circle"></i>
              <span>{error}</span>
            </div>
          )}

          {/* ─── OTP VERIFICATION SECTION ─── */}
          {otpSent && !otpVerified && patient && (
            <div className="otp-section">
              <div className="otp-card">
                <div className="otp-header">
                  <i className="fas fa-shield-alt"></i>
                  <h3>OTP Verification</h3>
                </div>
                <p className="otp-info">
                  An OTP has been sent to <strong>{otpPhone}</strong>
                </p>
                <p className="otp-timer">
                  <i className="fas fa-clock"></i> Expires in: <strong>{formatTime(otpTimer)}</strong>
                </p>
                <div className="otp-input-group">
                  <input
                    type="text"
                    className="otp-input"
                    placeholder="Enter 6-digit OTP"
                    maxLength="6"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    onKeyPress={(e) => e.key === 'Enter' && verifyOTP()}
                  />
                  <button className="btn-verify-otp" onClick={verifyOTP}>
                    <i className="fas fa-check"></i> Verify
                  </button>
                </div>
                <button 
                  className="btn-resend-otp" 
                  onClick={resendOTP}
                  disabled={otpResendDisabled}
                >
                  {otpResendDisabled ? 'Resend available in 30s' : <><i className="fas fa-redo"></i> Resend OTP</>}
                </button>
              </div>
            </div>
          )}

          {/* ─── QR CODE DISPLAY ─── */}
          {showQRCode && qrCodeImage && (
            <div className="qr-display-overlay">
              <div className="qr-display-card">
                <div className="qr-display-header">
                  <h3><i className="fas fa-qrcode"></i> Patient QR Code</h3>
                  <button className="btn-close-qr" onClick={() => setShowQRCode(false)}>×</button>
                </div>
                <div className="qr-display-body">
                  <img src={qrCodeImage} alt="QR Code" className="qr-display-image" />
                  <div className="qr-display-info">
                    <p><strong>Patient:</strong> {patient?.first_name} {patient?.last_name}</p>
                    <p><strong>QR ID:</strong> {qrCodeId}</p>
                    <p><strong>Patient ID:</strong> {patientIdForOtp}</p>
                  </div>
                  <button 
                    className="btn-print-qr"
                    onClick={() => window.print()}
                  >
                    <i className="fas fa-print"></i> Print QR Code
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ─── PATIENT INFORMATION ─── */}
          {otpVerified && patient && (
            <div className="patient-info-card">
              <div className="patient-info-header">
                <div className="patient-avatar-large">
                  <i className="fas fa-user-circle"></i>
                </div>
                <div className="patient-info-summary">
                  <h2>{patient.name || `${patient.first_name} ${patient.last_name}`}</h2>
                  <div className="patient-badges">
                    <span className="badge badge-primary">{patient.patient_code || patient.code}</span>
                    <span className="badge badge-success">Visits: {patient.visit_count || patient.visitCount || 0}</span>
                    <span className="badge badge-info">Smart Card: {patient.smart_card_id || patient.smartCardId}</span>
                    {patient.fingerprint_registered && (
                      <span className="badge badge-success">✅ Fingerprint</span>
                    )}
                    {patient.face_registered && (
                      <span className="badge badge-success">✅ Face</span>
                    )}
                  </div>
                  <div className="patient-contact">
                    <span><i className="fas fa-phone"></i> {patient.phone_number || patient.phone}</span>
                    <span><i className="fas fa-envelope"></i> {patient.email || 'No email'}</span>
                    <span><i className="fas fa-calendar"></i> DOB: {patient.date_of_birth || 'Not provided'}</span>
                  </div>
                  <button className="btn-generate-qr" onClick={generateQRCode}>
                    <i className="fas fa-qrcode"></i> Generate QR Code
                  </button>
                </div>
              </div>

              <div className="patient-history">
                <h3><i className="fas fa-history"></i> Medical History</h3>
                {patientHistory && patientHistory.visits && patientHistory.visits.length > 0 ? (
                  <div className="history-list">
                    {patientHistory.visits.map((visit, index) => (
                      <div key={index} className="history-item">
                        <div className="history-date">
                          <i className="fas fa-calendar-day"></i>
                          {new Date(visit.visit_date).toLocaleDateString()}
                        </div>
                        <div className="history-details">
                          <span className="history-type">{visit.visit_type || 'Consultation'}</span>
                          {visit.diagnosis && (
                            <span className="history-diagnosis">
                              <i className="fas fa-stethoscope"></i> {visit.diagnosis}
                            </span>
                          )}
                          {visit.medication && (
                            <span className="history-medication">
                              <i className="fas fa-prescription"></i> {visit.medication}
                            </span>
                          )}
                          <span className={`history-status ${visit.status || 'completed'}`}>
                            {visit.status || 'Completed'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-history">No medical history found for this patient.</p>
                )}
              </div>

              <div className="quick-actions">
                <h3><i className="fas fa-bolt"></i> Quick Actions</h3>
                <div className="action-buttons">
                  <button className="action-btn primary">
                    <i className="fas fa-plus"></i> New Visit
                  </button>
                  <button className="action-btn success">
                    <i className="fas fa-heartbeat"></i> Capture Vitals
                  </button>
                  <button className="action-btn warning">
                    <i className="fas fa-prescription"></i> Prescribe
                  </button>
                  <button className="action-btn info">
                    <i className="fas fa-ambulance"></i> Refer
                  </button>
                  <button className="action-btn secondary" onClick={generateQRCode}>
                    <i className="fas fa-qrcode"></i> Generate QR
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default PatientCheckin;