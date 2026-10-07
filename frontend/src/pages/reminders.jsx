// frontend/src/pages/Reminders.jsx
import React, { useState, useEffect } from 'react';
import Sidebar from '../components/common/Sidebar';
import Header from '../components/common/Header';
import './styles/reminders.css';

function Reminders() {
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [role, setRole] = useState('admin');
  const [patients, setPatients] = useState([]);
  const [filterDays, setFilterDays] = useState(7);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('call');
  const [voiceScript, setVoiceScript] = useState('');
  const [scriptInfo, setScriptInfo] = useState(null);
  const [callData, setCallData] = useState({ phone: '' });
  const [emailData, setEmailData] = useState({ email: '' });

  // Demo call state
  const [callStatus, setCallStatus] = useState('idle');
  const [callProgress, setCallProgress] = useState(0);
  const [callTimer, setCallTimer] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (userData) setRole(userData.role);
    fetchPatients();
  }, [filterDays]);

  useEffect(() => {
    return () => {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      if (callTimer) clearInterval(callTimer);
    };
  }, [callTimer]);

  const fetchPatients = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/reminders/upcoming?days=${filterDays}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setPatients(data.data || []);
      } else {
        setError(data.message || 'Failed to load reminders');
      }
    } catch (err) {
      setError('Failed to fetch reminders');
    } finally {
      setLoading(false);
    }
  };

  const openModal = async (patient, type) => {
    setSelectedPatient(patient);
    setModalType(type);
    setShowModal(true);
    setError('');
    setSuccess('');
    setVoiceScript('');
    setScriptInfo(null);
    setCallStatus('idle');
    setCallProgress(0);

    if (type === 'call') {
      setCallData({ phone: patient.phone || '' });
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/reminders/preview-script/${patient.patient_id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success) {
          setVoiceScript(data.data.script);
          setScriptInfo(data.data);
        }
      } catch (err) {
        console.error('Script preview error:', err);
      }
    } else if (type === 'email') {
      setEmailData({ email: patient.email || '' });
    }
  };

  // ═══════════════════════════════════════════════════════
  // DEMO CALL — Robot speaks through laptop
  // ═══════════════════════════════════════════════════════
  const startDemoCall = () => {
    if (!voiceScript) {
      setError('Voice script not loaded yet');
      return;
    }

    window.speechSynthesis.cancel();
    setCallStatus('dialing');
    setCallProgress(0);

    setTimeout(() => {
      setCallStatus('connected');

      setTimeout(() => {
        setCallStatus('speaking');

        const timer = setInterval(() => {
          setCallProgress(prev => prev + 1);
        }, 1000);
        setCallTimer(timer);

        const utterance = new SpeechSynthesisUtterance(voiceScript);

        const langMap = {
          'en': 'en-ZA', 'zu': 'zu-ZA', 'af': 'af-ZA',
          'st': 'st-ZA', 'ts': 'ts-ZA', 'tn': 'tn-ZA',
          'xh': 'xh-ZA', 've': 've-ZA', 'nso': 'nso-ZA'
        };

        const isElderly = (selectedPatient?.age || 0) >= 60;

        utterance.lang = langMap[selectedPatient?.language] || 'en-ZA';
        utterance.rate = isElderly ? 0.7 : 0.9;
        utterance.pitch = isElderly ? 1.05 : 1.0;
        utterance.volume = 1.0;

        const voices = window.speechSynthesis.getVoices();
        const targetLang = (langMap[selectedPatient?.language] || 'en-ZA').split('-')[0];
        const preferred = voices.find(v => v.lang.startsWith(targetLang) && v.name.includes('Female'))
                       || voices.find(v => v.lang.startsWith(targetLang))
                       || voices[0];
        if (preferred) utterance.voice = preferred;

        utterance.onend = () => {
          clearInterval(timer);
          setCallStatus('completed');
        };

        utterance.onerror = () => {
          clearInterval(timer);
          setCallStatus('completed');
        };

        window.speechSynthesis.speak(utterance);
      }, 1000);
    }, 2000);
  };

  const stopDemoCall = () => {
    window.speechSynthesis.cancel();
    if (callTimer) clearInterval(callTimer);
    setCallStatus('completed');
  };

  const resetDemoCall = () => {
    window.speechSynthesis.cancel();
    if (callTimer) clearInterval(callTimer);
    setCallStatus('idle');
    setCallProgress(0);
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();
    setSending(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/reminders/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          patient_id: selectedPatient.patient_id,
          email: emailData.email,
          appointment_id: selectedPatient.appointment_id
        })
      });
      const data = await response.json();

      if (data.success) {
        setSuccess(`📧 Email sent to ${emailData.email}`);
        setShowModal(false);
        setEmailData({ email: '' });
        setTimeout(() => setSuccess(''), 5000);
      } else {
        setError(data.message || 'Failed to send email');
      }
    } catch (err) {
      setError('Failed to send email');
    } finally {
      setSending(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-ZA', {
      weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
    });
  };

  const formatDuration = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const getLanguageLabel = (lang) => {
    const labels = {
      'en': '🇬🇧 English', 'zu': '🇿🇦 isiZulu', 'af': '🇿🇦 Afrikaans',
      'st': '🇿🇦 Sesotho', 'ts': '🇿🇦 Xitsonga', 'tn': '🇿🇦 Setswana',
      'xh': '🇿🇦 isiXhosa', 've': '🇿🇦 Tshivenda', 'nso': '🇿🇦 Sepedi'
    };
    return labels[lang] || '🇬🇧 English';
  };

  const filteredPatients = patients.filter(p =>
    !searchTerm ||
    `${p.first_name} ${p.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.patient_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.phone?.includes(searchTerm)
  );

  if (!localStorage.getItem('token')) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>Please Login First</h2>
        <button onClick={() => (window.location.href = '/')}>Go to Login</button>
      </div>
    );
  }

  return (
    <div className="reminders-container">
      <Sidebar role={role} />
      <div className="reminders-main">
        <Header role={role} />
        <div className="reminders-content">
          {/* HEADER */}
          <div className="reminders-header">
            <div>
              <h1>🔔 Patient Reminders</h1>
              <p className="reminders-subtitle">
                Send robot voice calls or email reminders to patients
              </p>
            </div>
            <button className="btn-refresh" onClick={fetchPatients}>
              <i className="fas fa-sync-alt"></i> Refresh
            </button>
          </div>

          {/* FILTERS */}
          <div className="reminders-filters">
            <div className="filter-group">
              <label><i className="fas fa-calendar"></i> Next:</label>
              <div className="button-group">
                {[3, 7, 14, 30].map(d => (
                  <button
                    key={d}
                    className={`filter-btn ${filterDays === d ? 'active' : ''}`}
                    onClick={() => setFilterDays(d)}
                  >
                    {d} days
                  </button>
                ))}
              </div>
            </div>
            <div className="search-box">
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Search by name, code, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* ALERTS */}
          {error && (
            <div className="alert alert-error">
              <i className="fas fa-exclamation-circle"></i> {error}
            </div>
          )}
          {success && (
            <div className="alert alert-success">
              <i className="fas fa-check-circle"></i> {success}
            </div>
          )}

          {/* STATS */}
          <div className="reminder-stats">
            <div className="stat-card">
              <div className="stat-icon blue"><i className="fas fa-users"></i></div>
              <div className="stat-info">
                <h3>{filteredPatients.length}</h3>
                <p>Patients to Remind</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon purple"><i className="fas fa-calendar-day"></i></div>
              <div className="stat-info">
                <h3>{filteredPatients.filter(p => p.days_until === 0).length}</h3>
                <p>Today</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon yellow"><i className="fas fa-clock"></i></div>
              <div className="stat-info">
                <h3>{filteredPatients.filter(p => p.days_until === 1).length}</h3>
                <p>Tomorrow</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon green"><i className="fas fa-user-friends"></i></div>
              <div className="stat-info">
                <h3>{filteredPatients.filter(p => p.age >= 60).length}</h3>
                <p>Elderly (60+)</p>
              </div>
            </div>
          </div>

          {/* TABLE */}
          <div className="reminders-table-container">
            {loading ? (
              <div className="loading-spinner">
                <i className="fas fa-spinner fa-spin"></i>
                <p>Loading reminders...</p>
              </div>
            ) : filteredPatients.length === 0 ? (
              <div className="empty-state">
                <i className="fas fa-bell-slash"></i>
                <h3>No Upcoming Appointments</h3>
                <p>No appointments in the next {filterDays} days</p>
              </div>
            ) : (
              <table className="reminders-table">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Age</th>
                    <th>Phone</th>
                    <th>Email</th>
                    <th>Language</th>
                    <th>Appointment</th>
                    <th>Days</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPatients.map((patient, idx) => (
                    <tr key={`${patient.patient_id}-${patient.appointment_id || idx}`}>
                      <td>
                        <div className="patient-info">
                          <div className="patient-avatar">
                            {patient.first_name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="patient-name">
                              {patient.first_name} {patient.last_name}
                              {patient.age >= 60 && (
                                <span className="elderly-badge" title="Elderly — extended reminder">
                                  👴 60+
                                </span>
                              )}
                            </div>
                            <div className="patient-code">{patient.patient_code}</div>
                          </div>
                        </div>
                      </td>
                      <td>{patient.age || 'N/A'}</td>
                      <td>
                        {patient.phone ? (
                          <span className="contact-badge phone">
                            <i className="fas fa-phone"></i> {patient.phone}
                          </span>
                        ) : <span className="contact-badge no-contact">No phone</span>}
                      </td>
                      <td>
                        {patient.email ? (
                          <span className="contact-badge email">
                            <i className="fas fa-envelope"></i>
                            {patient.email.substring(0, 18)}{patient.email.length > 18 ? '...' : ''}
                          </span>
                        ) : <span className="contact-badge no-contact">No email</span>}
                      </td>
                      <td>
                        <span className="language-badge">
                          {getLanguageLabel(patient.language)}
                        </span>
                      </td>
                      <td>
                        <div className="appointment-info">
                          <div>{formatDate(patient.appointment_date)}</div>
                          <div className="time-small">{patient.appointment_time || 'Not set'}</div>
                        </div>
                      </td>
                      <td>
                        <span className={`days-badge ${patient.days_until === 0 ? 'today' : patient.days_until <= 2 ? 'urgent' : ''}`}>
                          {patient.days_until === 0 ? 'Today' : 
                           patient.days_until === 1 ? 'Tomorrow' : 
                           `${patient.days_until}d`}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn-action btn-call"
                            onClick={() => openModal(patient, 'call')}
                            disabled={!patient.phone}
                            title="Call patient"
                          >
                            <i className="fas fa-phone"></i>
                          </button>
                          <button
                            className="btn-action btn-email"
                            onClick={() => openModal(patient, 'email')}
                            disabled={!patient.email}
                            title="Send email"
                          >
                            <i className="fas fa-envelope"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* ═══ CALL / DEMO MODAL ═══ */}
      {showModal && modalType === 'call' && selectedPatient && (
        <div className="modal-overlay" onClick={() => { stopDemoCall(); setShowModal(false); }}>
          <div className="modal-content demo-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                <i className="fas fa-phone"></i> 
                Call {selectedPatient.first_name} {selectedPatient.last_name}
                {(selectedPatient.age || 0) >= 60 && (
                  <span className="elderly-badge"> 👴 Elderly </span>
                )}
              </h2>
              <button className="modal-close" onClick={() => { stopDemoCall(); setShowModal(false); }}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="modal-body">
              <div className="phone-call-panel">
                <div className="call-status-bar">
                  <span className={`status-dot ${callStatus}`}></span>
                  <span className="status-text">
                    {callStatus === 'idle' && 'Ready to call'}
                    {callStatus === 'dialing' && `Dialing ${callData.phone}...`}
                    {callStatus === 'connected' && '☎️ Connected'}
                    {callStatus === 'speaking' && '🔊 Playing robot message...'}
                    {callStatus === 'completed' && '✅ Call completed'}
                  </span>
                  {callProgress > 0 && (
                    <span className="call-duration">{formatDuration(callProgress)}</span>
                  )}
                </div>

                {callStatus !== 'idle' && (
                  <div className="call-progress">
                    <div 
                      className="call-progress-bar" 
                      style={{ width: `${Math.min((callProgress / 60) * 100, 100)}%` }}
                    ></div>
                  </div>
                )}

                <div className="call-patient-card">
                  <div className="call-avatar">
                    {selectedPatient.first_name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="call-patient-info">
                    <h3>{selectedPatient.first_name} {selectedPatient.last_name}</h3>
                    <p>{callData.phone || 'No phone number'}</p>
                    <div className="call-language-badge">
                      {getLanguageLabel(selectedPatient.language)}
                    </div>
                  </div>
                </div>

                <div className="call-appointment-card">
                  <div className="info-row">
                    <i className="fas fa-calendar"></i>
                    <span>{formatDate(selectedPatient.appointment_date)}</span>
                  </div>
                  <div className="info-row">
                    <i className="fas fa-clock"></i>
                    <span>{selectedPatient.appointment_time || 'Not set'}</span>
                  </div>
                  <div className="info-row">
                    <i className="fas fa-hourglass-half"></i>
                    <span>
                      {selectedPatient.days_until === 0 ? 'Today' :
                       selectedPatient.days_until === 1 ? 'Tomorrow' :
                       `In ${selectedPatient.days_until} days`}
                    </span>
                  </div>
                </div>
              </div>

              <div className="script-panel">
                <div className="script-header">
                  <h4>
                    <i className="fas fa-robot"></i> 
                    Robot Voice Script
                    {scriptInfo?.is_elderly && (
                      <span className="elderly-badge"> 👴 Extended </span>
                    )}
                  </h4>
                  <span className="script-lang">
                    {getLanguageLabel(selectedPatient.language)}
                  </span>
                </div>
                <div className="script-content">
                  {voiceScript || 'Loading script...'}
                </div>
                {scriptInfo?.is_elderly && (
                  <div className="elderly-notes">
                    <i className="fas fa-info-circle"></i>
                    <span>
                      Extended script for elderly (60+) — includes medication reminders, 
                      BP check, diet, exercise, and lifestyle advice.
                    </span>
                  </div>
                )}
              </div>

              <div className="demo-controls">
                <div className="form-group">
                  <label>
                    <i className="fas fa-phone"></i> Phone Number
                  </label>
                  <input
                    type="tel"
                    value={callData.phone}
                    onChange={(e) => setCallData({ phone: e.target.value })}
                    placeholder="+27..."
                  />
                </div>

                <div className="demo-info">
                  <i className="fas fa-info-circle"></i>
                  <div>
                    <strong>🎙️ Demo Mode</strong><br/>
                    The robot will speak through your laptop's speakers.<br/>
                    Real phone calls require Twilio credentials in <code>.env</code>.
                  </div>
                </div>

                {callStatus === 'idle' && (
                  <button
                    type="button"
                    className="btn-demo-call"
                    onClick={startDemoCall}
                    disabled={!callData.phone || !voiceScript}
                  >
                    <i className="fas fa-play"></i>
                    🎙️ Play Robot Voice (Demo)
                  </button>
                )}

                {(callStatus === 'dialing' || callStatus === 'connected' || callStatus === 'speaking') && (
                  <button
                    type="button"
                    className="btn-demo-call btn-hangup"
                    onClick={stopDemoCall}
                  >
                    <i className="fas fa-phone-slash"></i>
                    End Call
                  </button>
                )}

                {callStatus === 'completed' && (
                  <div className="call-completed">
                    <i className="fas fa-check-circle"></i>
                    <h3>Call Completed</h3>
                    <p>Duration: {formatDuration(callProgress)}</p>
                    <p className="call-transcript-note">
                      The patient would have heard the message above.
                    </p>
                    <button
                      type="button"
                      className="btn-demo-call"
                      onClick={resetDemoCall}
                    >
                      <i className="fas fa-redo"></i> Try Again
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ EMAIL MODAL ═══ */}
      {showModal && modalType === 'email' && selectedPatient && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                <i className="fas fa-envelope"></i> Email {selectedPatient.first_name}
                {(selectedPatient.age || 0) >= 60 && (
                  <span className="elderly-badge"> 👴 Elderly </span>
                )}
              </h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleSendEmail}>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Email Address *</label>
                  <input
                    type="email"
                    value={emailData.email}
                    onChange={(e) => setEmailData({ email: e.target.value })}
                    placeholder="patient@example.com"
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label>Language</label>
                  <div className="language-display">
                    {getLanguageLabel(selectedPatient.language)}
                  </div>
                </div>

                <div className="form-group full-width">
                  <label>📧 Email Preview</label>
                  <div className="email-preview">
                    <p><strong>To:</strong> {emailData.email || '(not set)'}</p>
                    <p><strong>Subject:</strong> Appointment Reminder — PulseLogic Health</p>
                    <p><strong>Body:</strong> Dear {selectedPatient.first_name}, ...</p>
                    {(selectedPatient.age || 0) >= 60 && (
                      <p style={{ marginTop: '12px', padding: '10px', background: '#fef3c7', borderRadius: '6px', color: '#92400e' }}>
                        <strong>⭐ Elderly version</strong> will include:
                        <br/>• Medication reminders
                        <br/>• BP check reminder
                        <br/>• Diet & exercise tips
                        <br/>• Lifestyle advice
                      </p>
                    )}
                  </div>
                </div>

                <div className="info-box full-width">
                  <i className="fas fa-check-circle" style={{ color: '#10b981' }}></i>
                  <div>
                    <strong>Email works now!</strong> Your Gmail is already configured.<br />
                    Reminder will be sent immediately in the patient's language.
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={sending || !emailData.email}>
                  {sending ? (
                    <><i className="fas fa-spinner fa-spin"></i> Sending...</>
                  ) : (
                    <><i className="fas fa-paper-plane"></i> Send Email</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Reminders;