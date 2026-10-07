// frontend/src/pages/Maternity.jsx
import React, { useState, useEffect } from 'react';
import Sidebar from '../components/common/Sidebar';
import Header from '../components/common/Header';
import './styles/maternity.css';

// ─── FORM STATE CONSTANTS ───
const INITIAL_FORM_DATA = {
  patient_id: '',
  lmp: '',
  edd: '',
  gestational_weeks: '',
  gravida: '',
  para: '',
  previous_pregnancies: '',
  previous_complications: '',
  risk_level: 'low',
  status: 'active',
  first_visit_date: '',
  referred_from: '',
  height: '',
  blood_pressure_systolic: '',
  blood_pressure_diastolic: '',
  pulse_rate: '',
  oxygen_saturation: '',
  weight: '',
  blood_glucose: ''
};

const INITIAL_VITALS_DATA = {
  weight: '',
  blood_pressure_systolic: '',
  blood_pressure_diastolic: '',
  pulse_rate: '',
  oxygen_saturation: '',
  temperature: '',
  height: '',
  fundal_height: '',
  fetal_heart_rate: '',
  fetal_movement: 'Normal',
  urine_protein: 'Negative',
  blood_glucose: '',
  swelling: 'None',
  blurred_vision: false,
  headache: false,
  vaginal_bleeding: false,
  abdominal_pain: false,
  fluid_leakage: false,
  contractions: false,
  dizziness: false,
  shortness_of_breath: false,
  symptoms: ''
};

const INITIAL_VISIT_DATA = {
  visit_date: '',
  visit_time: '',
  visit_type: 'routine',
  gestational_weeks: '',
  status: 'completed',
  notes: '',
  symptoms: '',
  weight: '',
  blood_pressure_systolic: '',
  blood_pressure_diastolic: '',
  pulse_rate: '',
  oxygen_saturation: '',
  fetal_heart_rate: '',
  fundal_height: '',
  blood_glucose: '',
  temperature: ''
};

const INITIAL_MEDICATION_DATA = {
  medication_name: '',
  dosage: '',
  frequency: '',
  start_date: '',
  end_date: '',
  notes: '',
  supplement_name: '',
  supplement_dosage: '',
  supplement_frequency: ''
};

const INITIAL_FETAL_DATA = {
  assessment_date: '',
  gestational_weeks: '',
  fetal_heart_rate: '',
  fetal_movement: 'Normal',
  fundal_height: '',
  presentation: '',
  amniotic_fluid: '',
  placenta_position: '',
  doppler_study: '',
  biophysical_profile: '',
  notes: '',
  assessed_by: ''
};

const INITIAL_LAB_DATA = {
  test_name: '',
  test_date: '',
  result: '',
  normal_range: '',
  interpretation: '',
  notes: '',
  ordered_by: ''
};

const INITIAL_REFERRAL_DATA = {
  referred_to_facility: '',
  reason_for_referral: '',
  urgency: 'normal',
  referral_date: '',
  notes: '',
  referred_by: ''
};

const INITIAL_REMINDER_DATA = {
  reminder_type: 'appointment',
  reminder_date: '',
  reminder_time: '08:00',
  message: '',
  send_sms: true,
  phone_number: ''
};

const INITIAL_INVESTIGATION_DATA = {
  blood_group: '',
  rh_status: '',
  haemoglobin: '',
  blood_glucose: '',
  urinalysis: '',
  hiv_test: '',
  syphilis_test: '',
  ultrasound: '',
  other_investigations: ''
};

const INITIAL_BIRTH_PLAN_DATA = {
  preferred_facility: '',
  birth_preferences: '',
  emergency_contact: '',
  support_person: '',
  previous_delivery_method: '',
  special_considerations: '',
  delivery_notes: ''
};

const INITIAL_DELIVERY_DATA = {
  delivery_date: '',
  delivery_time: '',
  gestational_age: '',
  delivery_method: '',
  baby_sex: '',
  birth_weight: '',
  apgar_1: '',
  apgar_5: '',
  number_of_babies: '1',
  maternal_outcome: 'alive',
  newborn_outcome: 'alive',
  delivery_complications: '',
  clinician_notes: '',
  baby_condition: '',
  stillborn_reason: '',
  maternal_death_reason: '',
  baby_death_reason: '',
  resuscitation_performed: false,
  maternal_complications: '',
  newborn_complications: ''
};

const INITIAL_POSTNATAL_DATA = {
  follow_up_date: '',
  maternal_observations: '',
  recovery_notes: '',
  follow_up_visits: '',
  baby_weight: '',
  baby_feeding: '',
  baby_observations: '',
  baby_follow_up: '',
  maternal_condition: '',
  baby_condition: '',
  send_reminder: true
};

function Maternity() {
  // ─── STATE ───
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [role, setRole] = useState('admin');
  const [records, setRecords] = useState([]);
  const [patients, setPatients] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [diagnosisResults, setDiagnosisResults] = useState([]);
  const [patientDetails, setPatientDetails] = useState(null);
  const [visitHistory, setVisitHistory] = useState([]);
  const [visitStats, setVisitStats] = useState({ total_visits: 0, completed_visits: 0, missed_visits: 0, scheduled_visits: 0 });
  const [outcomeSummary, setOutcomeSummary] = useState({ 
    total_deliveries: 0, 
    mothers_alive: 0, 
    mothers_deceased: 0,
    babies_alive: 0,
    stillborn_babies: 0,
    babies_deceased: 0,
    both_alive: 0,
    both_deceased: 0,
    mother_alive_baby_deceased: 0,
    mother_deceased_baby_alive: 0
  });
  const [pregnancyTimeline, setPregnancyTimeline] = useState([]);
  const [medications, setMedications] = useState([]);
  const [fetalAssessments, setFetalAssessments] = useState([]);
  const [labTests, setLabTests] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [nextAppointment, setNextAppointment] = useState(null);

  // ─── QUEUE STATE ───
  const [queueData, setQueueData] = useState([]);
  const [queueStats, setQueueStats] = useState({
    total: 0,
    emergency: 0,
    critical: 0,
    waiting: 0,
    in_progress: 0,
    completed: 0
  });
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showQueue, setShowQueue] = useState(false);

  // ─── MODAL STATES ───
  const [showModal, setShowModal] = useState(false);
  const [showVitalsModal, setShowVitalsModal] = useState(false);
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [showMedicationModal, setShowMedicationModal] = useState(false);
  const [showFetalModal, setShowFetalModal] = useState(false);
  const [showLabModal, setShowLabModal] = useState(false);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [showInvestigationModal, setShowInvestigationModal] = useState(false);
  const [showBirthPlanModal, setShowBirthPlanModal] = useState(false);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [showPostnatalModal, setShowPostnatalModal] = useState(false);

  // ─── FORM STATES ───
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [vitalsData, setVitalsData] = useState(INITIAL_VITALS_DATA);
  const [visitData, setVisitData] = useState(INITIAL_VISIT_DATA);
  const [medicationData, setMedicationData] = useState(INITIAL_MEDICATION_DATA);
  const [fetalData, setFetalData] = useState(INITIAL_FETAL_DATA);
  const [labData, setLabData] = useState(INITIAL_LAB_DATA);
  const [referralData, setReferralData] = useState(INITIAL_REFERRAL_DATA);
  const [reminderData, setReminderData] = useState(INITIAL_REMINDER_DATA);
  const [investigationData, setInvestigationData] = useState(INITIAL_INVESTIGATION_DATA);
  const [birthPlanData, setBirthPlanData] = useState(INITIAL_BIRTH_PLAN_DATA);
  const [deliveryData, setDeliveryData] = useState(INITIAL_DELIVERY_DATA);
  const [postnatalData, setPostnatalData] = useState(INITIAL_POSTNATAL_DATA);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  // ─── FETCH DATA ───
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (userData) setRole(userData.role);
    fetchAllData();
    fetchQueueData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([fetchMaternityRecords(), fetchPatients(), fetchFacilities()]);
    setLoading(false);
  };

  const fetchMaternityRecords = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/maternity`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setRecords(data.data || []);
    } catch (error) {
      console.error('Error fetching maternity records:', error);
    }
  };

  const fetchPatients = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/patients`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setPatients(data.patients || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const fetchFacilities = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/facilities`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setFacilities(data.data || []);
    } catch (error) {
      console.error('Error fetching facilities:', error);
    }
  };

  const fetchQueueData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/queue`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setQueueData(data.data || []);
        calculateQueueStats(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching queue data:', error);
    }
  };

  const calculateQueueStats = (data) => {
    const stats = {
      total: data.length,
      emergency: data.filter(q => q.priority_level === 'emergency').length,
      critical: data.filter(q => q.priority_level === 'critical').length,
      waiting: data.filter(q => q.status === 'waiting').length,
      in_progress: data.filter(q => q.status === 'in_progress').length,
      completed: data.filter(q => q.status === 'completed').length
    };
    setQueueStats(stats);
  };

  const fetchPatientDetails = async (recordId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/maternity/${recordId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setPatientDetails(data.data);
        setVisitHistory(data.data.visits || []);
        setVisitStats(data.data.visit_stats || { total_visits: 0, completed_visits: 0, missed_visits: 0, scheduled_visits: 0 });
        setOutcomeSummary(data.data.outcome_summary || { 
          total_deliveries: 0, 
          mothers_alive: 0, 
          mothers_deceased: 0,
          babies_alive: 0,
          stillborn_babies: 0,
          babies_deceased: 0,
          both_alive: 0,
          both_deceased: 0,
          mother_alive_baby_deceased: 0,
          mother_deceased_baby_alive: 0
        });
        setMedications(data.data.medications || []);
        setFetalAssessments(data.data.fetal_assessments || []);
        setLabTests(data.data.lab_tests || []);
        setReminders(data.data.reminders || []);
        setReferrals(data.data.referrals || []);
        setNextAppointment(data.data.next_appointment || null);
        generateTimeline(data.data);
      }
    } catch (error) {
      console.error('Error fetching patient details:', error);
    }
  };

  const generateTimeline = (data) => {
    const timeline = [];
    
    if (data.created_at) {
      timeline.push({
        date: data.created_at.split('T')[0],
        event: 'Initial Registration',
        description: 'Patient enrolled in maternity care',
        icon: 'fa-user-plus',
        color: '#3B82F6'
      });
    }

    if (data.first_visit_date) {
      timeline.push({
        date: data.first_visit_date,
        event: 'First Visit',
        description: `Initial assessment at ${data.gestational_weeks || 'N/A'} weeks`,
        icon: 'fa-stethoscope',
        color: '#8B5CF6'
      });
    }

    if (data.visits) {
      data.visits.forEach(visit => {
        const statusIcon = visit.status === 'completed' ? 'fa-check-circle' : visit.status === 'missed' ? 'fa-times-circle' : 'fa-clock';
        const statusColor = visit.status === 'completed' ? '#10B981' : visit.status === 'missed' ? '#EF4444' : '#F59E0B';
        timeline.push({
          date: visit.visit_date,
          event: `${visit.visit_type?.charAt(0).toUpperCase() + visit.visit_type?.slice(1) || 'Routine'} Visit`,
          description: `Gestational age: ${visit.gestational_weeks || 'N/A'} weeks - ${visit.status}`,
          icon: statusIcon,
          color: statusColor
        });
      });
    }

    if (data.deliveries && data.deliveries.length > 0) {
      data.deliveries.forEach(delivery => {
        const outcomeIcon = delivery.maternal_outcome === 'alive' && delivery.newborn_outcome === 'alive' 
          ? 'fa-heart' 
          : 'fa-heart-broken';
        const outcomeColor = delivery.maternal_outcome === 'alive' && delivery.newborn_outcome === 'alive' 
          ? '#10B981' 
          : '#EF4444';
        timeline.push({
          date: delivery.delivery_date,
          event: 'Delivery',
          description: `${delivery.delivery_method || 'N/A'} - ${delivery.baby_sex || 'N/A'} baby, ${delivery.birth_weight || 'N/A'}kg`,
          icon: outcomeIcon,
          color: outcomeColor
        });
      });
    }

    timeline.sort((a, b) => new Date(a.date) - new Date(b.date));
    setPregnancyTimeline(timeline);
  };

  // ─── HANDLE INPUTS ───
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleVitalsChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    setVitalsData({ ...vitalsData, [name]: newValue });

    if (
      [
        'blood_pressure_systolic',
        'blood_pressure_diastolic',
        'urine_protein',
        'swelling',
        'blurred_vision',
        'headache',
        'blood_glucose',
        'fetal_movement',
        'fetal_heart_rate',
        'vaginal_bleeding',
        'fluid_leakage',
        'contractions',
        'pulse_rate',
        'oxygen_saturation',
        'temperature'
      ].includes(name)
    ) {
      autoDiagnose();
    }
  };

  const handleVisitChange = (e) => {
    const { name, value } = e.target;
    setVisitData({ ...visitData, [name]: value });
  };

  const handleMedicationChange = (e) => {
    const { name, value } = e.target;
    setMedicationData({ ...medicationData, [name]: value });
  };

  const handleFetalChange = (e) => {
    const { name, value } = e.target;
    setFetalData({ ...fetalData, [name]: value });
  };

  const handleLabChange = (e) => {
    const { name, value } = e.target;
    setLabData({ ...labData, [name]: value });
  };

  const handleReferralChange = (e) => {
    const { name, value } = e.target;
    setReferralData({ ...referralData, [name]: value });
  };

  const handleReminderChange = (e) => {
    const { name, value, type, checked } = e.target;
    setReminderData({ ...reminderData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleInvestigationChange = (e) => {
    const { name, value } = e.target;
    setInvestigationData({ ...investigationData, [name]: value });
  };

  const handleBirthPlanChange = (e) => {
    const { name, value } = e.target;
    setBirthPlanData({ ...birthPlanData, [name]: value });
  };

  const handleDeliveryChange = (e) => {
    const { name, value, type, checked } = e.target;
    setDeliveryData({ ...deliveryData, [name]: type === 'checkbox' ? checked : value });
  };

  const handlePostnatalChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPostnatalData({ ...postnatalData, [name]: type === 'checkbox' ? checked : value });
  };

  // ─── AUTO-DIAGNOSE ───
  const autoDiagnose = () => {
    const diagnoses = [];
    const v = vitalsData;

    // Pre-eclampsia detection
    if (v.blood_pressure_systolic >= 140 || v.blood_pressure_diastolic >= 90) {
      if (v.urine_protein === 'Positive' || v.urine_protein === 'Trace') {
        diagnoses.push({
          condition: 'Pre-eclampsia',
          risk: 'High',
          description: 'High blood pressure with protein in urine. Requires immediate clinical review.',
          action: 'Urgent referral to obstetrician',
          warningSigns: ['Severe headache', 'Visual disturbances', 'Upper abdominal pain']
        });
      } else if (v.swelling === 'Severe' || v.blurred_vision || v.headache) {
        diagnoses.push({
          condition: 'Possible Pre-eclampsia',
          risk: 'Medium',
          description: 'High blood pressure with severe symptoms. Monitor closely.',
          action: 'Clinical review within 24 hours',
          warningSigns: ['Monitor for worsening symptoms']
        });
      } else {
        diagnoses.push({
          condition: 'Hypertension in Pregnancy',
          risk: 'Medium',
          description: 'Elevated blood pressure detected. Monitor regularly.',
          action: 'Monitor blood pressure weekly',
          warningSigns: ['Check for proteinuria']
        });
      }
    }

    // Gestational Diabetes
    if (v.blood_glucose && parseFloat(v.blood_glucose) > 7.8) {
      diagnoses.push({
        condition: 'Gestational Diabetes',
        risk: 'Medium',
        description: 'Elevated blood glucose levels. Requires glucose tolerance test.',
        action: 'Schedule glucose tolerance test and diet review',
        warningSigns: ['Excessive thirst', 'Frequent urination', 'Blurred vision']
      });
    } else if (v.blood_glucose && parseFloat(v.blood_glucose) > 6.7) {
      diagnoses.push({
        condition: 'Impaired Glucose Tolerance',
        risk: 'Low',
        description: 'Borderline elevated blood glucose. Monitor closely.',
        action: 'Repeat blood glucose test in 2 weeks',
        warningSigns: ['Monitor for diabetes symptoms']
      });
    }

    // Fetal distress
    if (v.fetal_movement === 'Reduced' || v.fetal_movement === 'Absent') {
      diagnoses.push({
        condition: 'Reduced Fetal Movement',
        risk: 'High',
        description: 'Decreased fetal movement detected. Requires immediate assessment.',
        action: 'Urgent fetal monitoring and clinical review',
        warningSigns: ['No fetal movement for 12 hours', 'Decreased kick count']
      });
    }

    if (v.fetal_heart_rate) {
      const fhr = parseInt(v.fetal_heart_rate);
      if (fhr < 110) {
        diagnoses.push({
          condition: 'Fetal Bradycardia',
          risk: 'High',
          description: `Fetal heart rate is ${fhr} bpm (normal: 110-160 bpm).`,
          action: 'Immediate fetal monitoring required',
          warningSigns: ['Fetal distress', 'Hypoxia']
        });
      } else if (fhr > 160) {
        diagnoses.push({
          condition: 'Fetal Tachycardia',
          risk: 'Medium',
          description: `Fetal heart rate is ${fhr} bpm (normal: 110-160 bpm).`,
          action: 'Fetal monitoring and maternal assessment',
          warningSigns: ['Fetal infection', 'Maternal fever']
        });
      }
    }

    // Severe Hypertension
    if (v.blood_pressure_systolic >= 160 || v.blood_pressure_diastolic >= 110) {
      diagnoses.push({
        condition: 'Severe Hypertension',
        risk: 'Critical',
        description: 'Dangerously high blood pressure. Immediate intervention required.',
        action: 'Emergency referral to hospital',
        warningSigns: ['Stroke risk', 'Organ damage risk']
      });
    }

    // Preterm labour
    if (v.contractions) {
      diagnoses.push({
        condition: 'Preterm Labour Risk',
        risk: 'High',
        description: 'Contractions detected before 37 weeks. Assess for preterm labour.',
        action: 'Immediate clinical assessment',
        warningSigns: ['Regular contractions', 'Lower back pain', 'Pelvic pressure']
      });
    }

    // Vaginal bleeding
    if (v.vaginal_bleeding) {
      diagnoses.push({
        condition: 'Vaginal Bleeding in Pregnancy',
        risk: 'Critical',
        description: 'Vaginal bleeding detected. Requires immediate assessment.',
        action: 'Emergency referral to hospital',
        warningSigns: ['Heavy bleeding', 'Abdominal pain', 'Dizziness']
      });
    }

    // Fluid leakage
    if (v.fluid_leakage) {
      diagnoses.push({
        condition: 'Possible Premature Rupture of Membranes',
        risk: 'High',
        description: 'Fluid leakage detected. Assess for membrane rupture.',
        action: 'Urgent clinical assessment',
        warningSigns: ['Continuous leakage', 'Infection risk']
      });
    }

    // Abnormal pulse
    if (v.pulse_rate && (v.pulse_rate < 60 || v.pulse_rate > 100)) {
      diagnoses.push({
        condition: v.pulse_rate < 60 ? 'Bradycardia' : 'Tachycardia',
        risk: 'Medium',
        description: `Pulse rate is ${v.pulse_rate} bpm (normal: 60-100 bpm).`,
        action: 'Monitor pulse rate and assess for underlying cause',
        warningSigns: ['Dizziness', 'Shortness of breath', 'Chest pain']
      });
    }

    // Low oxygen saturation
    if (v.oxygen_saturation && parseFloat(v.oxygen_saturation) < 95) {
      diagnoses.push({
        condition: 'Low Oxygen Saturation',
        risk: 'High',
        description: `Oxygen saturation is ${v.oxygen_saturation}% (normal: >95%).`,
        action: 'Administer oxygen and assess respiratory function',
        warningSigns: ['Shortness of breath', 'Cyanosis', 'Chest pain']
      });
    }

    // Fever
    if (v.temperature && parseFloat(v.temperature) > 38.0) {
      diagnoses.push({
        condition: 'Fever in Pregnancy',
        risk: 'Medium',
        description: `Temperature is ${v.temperature}°C. Possible infection.`,
        action: 'Assess for source of infection and treat accordingly',
        warningSigns: ['Chills', 'Sweating', 'Body aches']
      });
    }

    // Severe swelling
    if (v.swelling === 'Severe' && v.blood_pressure_systolic >= 130) {
      diagnoses.push({
        condition: 'Severe Oedema with Hypertension',
        risk: 'High',
        description: 'Severe swelling with elevated blood pressure.',
        action: 'Monitor for pre-eclampsia',
        warningSigns: ['Pulmonary oedema', 'Renal impairment']
      });
    }

    setDiagnosisResults(diagnoses);
  };

  // ─── RESET FORMS ───
  const resetForm = () => setFormData(INITIAL_FORM_DATA);
  const resetVitalsForm = () => {
    setVitalsData(INITIAL_VITALS_DATA);
    setDiagnosisResults([]);
  };
  const resetVisitForm = () => setVisitData(INITIAL_VISIT_DATA);
  const resetMedicationForm = () => setMedicationData(INITIAL_MEDICATION_DATA);
  const resetFetalForm = () => setFetalData(INITIAL_FETAL_DATA);
  const resetLabForm = () => setLabData(INITIAL_LAB_DATA);
  const resetReferralForm = () => setReferralData(INITIAL_REFERRAL_DATA);
  const resetReminderForm = () => setReminderData(INITIAL_REMINDER_DATA);
  const resetInvestigationForm = () => setInvestigationData(INITIAL_INVESTIGATION_DATA);
  const resetBirthPlanForm = () => setBirthPlanData(INITIAL_BIRTH_PLAN_DATA);
  const resetDeliveryForm = () => setDeliveryData(INITIAL_DELIVERY_DATA);
  const resetPostnatalForm = () => setPostnatalData(INITIAL_POSTNATAL_DATA);

  // ─── SUBMIT HANDLERS ───
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/maternity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData)
      });
      const data = await response.json();

      if (data.success) {
        setShowModal(false);
        resetForm();
        fetchMaternityRecords();
        alert('✅ Maternity record created successfully!');
      } else {
        setError(data.message || 'Failed to create record');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to create record');
    } finally {
      setLoading(false);
    }
  };

  const handleVitalsSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/maternity/vitals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          patient_id: selectedRecord?.patient_id,
          ...vitalsData
        })
      });
      const data = await response.json();

      if (data.success) {
        setShowVitalsModal(false);
        alert(`✅ Vitals recorded! ${data.diagnoses?.length || 0} diagnoses identified.`);
        resetVitalsForm();
        fetchMaternityRecords();
        fetchQueueData();
        if (selectedRecord?.record_id) {
          fetchPatientDetails(selectedRecord.record_id);
        }
      } else {
        setError(data.message || 'Failed to record vitals');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to record vitals');
    } finally {
      setLoading(false);
    }
  };

  const handleVisitSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/maternity/visits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          patient_id: selectedRecord?.patient_id,
          ...visitData
        })
      });
      const data = await response.json();

      if (data.success) {
        setShowVisitModal(false);
        alert('✅ Visit recorded successfully!');
        resetVisitForm();
        fetchMaternityRecords();
        if (selectedRecord?.record_id) {
          fetchPatientDetails(selectedRecord.record_id);
        }
      } else {
        setError(data.message || 'Failed to record visit');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to record visit');
    } finally {
      setLoading(false);
    }
  };

  const handleMedicationSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/maternity/medications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          patient_id: selectedRecord?.patient_id,
          ...medicationData
        })
      });
      const data = await response.json();

      if (data.success) {
        setShowMedicationModal(false);
        alert('✅ Medication recorded successfully!');
        resetMedicationForm();
        fetchMaternityRecords();
        if (selectedRecord?.record_id) {
          fetchPatientDetails(selectedRecord.record_id);
        }
      } else {
        setError(data.message || 'Failed to record medication');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to record medication');
    } finally {
      setLoading(false);
    }
  };

  const handleFetalSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/maternity/fetal-assessment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          patient_id: selectedRecord?.patient_id,
          ...fetalData
        })
      });
      const data = await response.json();

      if (data.success) {
        setShowFetalModal(false);
        alert('✅ Fetal assessment recorded successfully!');
        resetFetalForm();
        fetchMaternityRecords();
        if (selectedRecord?.record_id) {
          fetchPatientDetails(selectedRecord.record_id);
        }
      } else {
        setError(data.message || 'Failed to record fetal assessment');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to record fetal assessment');
    } finally {
      setLoading(false);
    }
  };

  const handleLabSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/maternity/lab-tests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          patient_id: selectedRecord?.patient_id,
          ...labData
        })
      });
      const data = await response.json();

      if (data.success) {
        setShowLabModal(false);
        alert('✅ Lab test recorded successfully!');
        resetLabForm();
        fetchMaternityRecords();
        if (selectedRecord?.record_id) {
          fetchPatientDetails(selectedRecord.record_id);
        }
      } else {
        setError(data.message || 'Failed to record lab test');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to record lab test');
    } finally {
      setLoading(false);
    }
  };

  const handleReferralSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/maternity/referral`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          patient_id: selectedRecord?.patient_id,
          ...referralData
        })
      });
      const data = await response.json();

      if (data.success) {
        setShowReferralModal(false);
        alert('✅ Patient referred successfully!');
        resetReferralForm();
        fetchMaternityRecords();
        if (selectedRecord?.record_id) {
          fetchPatientDetails(selectedRecord.record_id);
        }
      } else {
        setError(data.message || 'Failed to refer patient');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to refer patient');
    } finally {
      setLoading(false);
    }
  };

  const handleReminderSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/maternity/reminders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          patient_id: selectedRecord?.patient_id,
          ...reminderData
        })
      });
      const data = await response.json();

      if (data.success) {
        setShowReminderModal(false);
        alert('✅ Reminder created successfully!');
        resetReminderForm();
        fetchMaternityRecords();
        if (selectedRecord?.record_id) {
          fetchPatientDetails(selectedRecord.record_id);
        }
      } else {
        setError(data.message || 'Failed to create reminder');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to create reminder');
    } finally {
      setLoading(false);
    }
  };

  const handleInvestigationSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/maternity/investigations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          patient_id: selectedRecord?.patient_id,
          ...investigationData
        })
      });
      const data = await response.json();

      if (data.success) {
        setShowInvestigationModal(false);
        alert('✅ Investigations recorded successfully!');
        resetInvestigationForm();
        fetchMaternityRecords();
        if (selectedRecord?.record_id) {
          fetchPatientDetails(selectedRecord.record_id);
        }
      } else {
        setError(data.message || 'Failed to record investigations');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to record investigations');
    } finally {
      setLoading(false);
    }
  };

  const handleBirthPlanSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/maternity/birth-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          patient_id: selectedRecord?.patient_id,
          ...birthPlanData
        })
      });
      const data = await response.json();

      if (data.success) {
        setShowBirthPlanModal(false);
        alert('✅ Birth plan saved successfully!');
        resetBirthPlanForm();
        fetchMaternityRecords();
        if (selectedRecord?.record_id) {
          fetchPatientDetails(selectedRecord.record_id);
        }
      } else {
        setError(data.message || 'Failed to save birth plan');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to save birth plan');
    } finally {
      setLoading(false);
    }
  };

  const handleDeliverySubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/maternity/delivery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          patient_id: selectedRecord?.patient_id,
          ...deliveryData
        })
      });
      const data = await response.json();

      if (data.success) {
        setShowDeliveryModal(false);
        const outcomeMsg = deliveryData.maternal_outcome === 'deceased' 
          ? '⚠️ Mother: Deceased' 
          : deliveryData.newborn_outcome === 'stillborn' 
          ? '⚠️ Baby: Stillborn' 
          : deliveryData.newborn_outcome === 'deceased' 
          ? '⚠️ Baby: Deceased' 
          : '✅ Mother and Baby: Alive';
        alert(`✅ Delivery recorded successfully! ${outcomeMsg}`);
        resetDeliveryForm();
        fetchMaternityRecords();
        if (selectedRecord?.record_id) {
          fetchPatientDetails(selectedRecord.record_id);
        }
      } else {
        setError(data.message || 'Failed to record delivery');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to record delivery');
    } finally {
      setLoading(false);
    }
  };

  const handlePostnatalSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/maternity/postnatal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          patient_id: selectedRecord?.patient_id,
          ...postnatalData
        })
      });
      const data = await response.json();

      if (data.success) {
        setShowPostnatalModal(false);
        alert('✅ Postnatal record created successfully! Reminder sent if enabled.');
        resetPostnatalForm();
        fetchMaternityRecords();
        if (selectedRecord?.record_id) {
          fetchPatientDetails(selectedRecord.record_id);
        }
      } else {
        setError(data.message || 'Failed to create postnatal record');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to create postnatal record');
    } finally {
      setLoading(false);
    }
  };

  // ─── QUEUE HANDLERS ───
  const updateQueueStatus = async (queueId, status) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/queue/${queueId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status })
      });
      const data = await response.json();
      if (data.success) {
        fetchQueueData();
        alert(`✅ Queue status updated to ${status}`);
      }
    } catch (error) {
      console.error('Error updating queue:', error);
      alert('Failed to update queue status');
    }
  };

  const addToQueue = async (patientId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/queue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ patient_id: patientId })
      });
      const data = await response.json();
      if (data.success) {
        fetchQueueData();
        alert('✅ Patient added to queue successfully!');
      }
    } catch (error) {
      console.error('Error adding to queue:', error);
      alert('Failed to add patient to queue');
    }
  };

  // ─── FILTER QUEUE ───
  const filteredQueue = queueData.filter(item => {
    const matchesDepartment = selectedDepartment === 'all' || item.department === selectedDepartment;
    const matchesSearch = !searchQuery || 
      item.patient_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.priority_level?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDepartment && matchesSearch;
  });

  // ─── HELPER FUNCTIONS ───
  const getTrimester = (weeks) => {
    if (!weeks) return 'Unknown';
    const w = parseInt(weeks);
    if (w <= 12) return '1st Trimester';
    if (w <= 26) return '2nd Trimester';
    return '3rd Trimester';
  };

  const getRiskBadge = (risk) => {
    const risks = {
      low: { color: '#10B981', bg: '#D1FAE5', label: '✅ Low Risk' },
      moderate: { color: '#F59E0B', bg: '#FEF3C7', label: '⚠️ Moderate Risk' },
      high: { color: '#EF4444', bg: '#FEE2E2', label: '🚨 High Risk' },
      critical: { color: '#DC2626', bg: '#FEE2E2', label: '🆘 Critical' }
    };
    const r = risks[risk] || risks.low;
    return (
      <span className="risk-badge" style={{ background: r.bg, color: r.color }}>
        {r.label}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const statuses = {
      active: { color: '#3B82F6', bg: '#DBEAFE', label: '🔵 Active' },
      completed: { color: '#10B981', bg: '#D1FAE5', label: '✅ Completed' },
      referred: { color: '#F59E0B', bg: '#FEF3C7', label: '🔄 Referred' },
      maternal_deceased: { color: '#DC2626', bg: '#FEE2E2', label: '💔 Mother Deceased' },
      baby_deceased: { color: '#DC2626', bg: '#FEE2E2', label: '💔 Baby Deceased' }
    };
    const s = statuses[status] || statuses.active;
    return (
      <span className="status-badge" style={{ background: s.bg, color: s.color }}>
        {s.label}
      </span>
    );
  };

  const getQueueStatusBadge = (status) => {
    const statuses = {
      waiting: { color: '#F59E0B', bg: '#FEF3C7', label: '⏳ Waiting' },
      in_progress: { color: '#3B82F6', bg: '#DBEAFE', label: '🔄 In Progress' },
      completed: { color: '#10B981', bg: '#D1FAE5', label: '✅ Completed' },
      cancelled: { color: '#EF4444', bg: '#FEE2E2', label: '❌ Cancelled' }
    };
    const s = statuses[status] || statuses.waiting;
    return (
      <span className="queue-status-badge" style={{ background: s.bg, color: s.color }}>
        {s.label}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorities = {
      normal: { color: '#10B981', bg: '#D1FAE5', label: '✅ Normal' },
      urgent: { color: '#F59E0B', bg: '#FEF3C7', label: '⚠️ Urgent' },
      emergency: { color: '#EF4444', bg: '#FEE2E2', label: '🚨 Emergency' },
      critical: { color: '#DC2626', bg: '#FEE2E2', label: '🆘 Critical' }
    };
    const p = priorities[priority] || priorities.normal;
    return (
      <span className="priority-badge" style={{ background: p.bg, color: p.color }}>
        {p.label}
      </span>
    );
  };

  const getOutcomeBadge = (outcome) => {
    const outcomes = {
      alive: { color: '#10B981', bg: '#D1FAE5', label: '✅ Alive' },
      deceased: { color: '#DC2626', bg: '#FEE2E2', label: '💔 Deceased' },
      stillborn: { color: '#8B5CF6', bg: '#EDE9FE', label: '🕊️ Stillborn' }
    };
    const o = outcomes[outcome] || outcomes.alive;
    return (
      <span className="outcome-badge" style={{ background: o.bg, color: o.color }}>
        {o.label}
      </span>
    );
  };

  const getStageIcon = (stage) => {
    const icons = {
      '1st Trimester': 'fa-seedling',
      '2nd Trimester': 'fa-seedling',
      '3rd Trimester': 'fa-tree',
      Delivery: 'fa-baby'
    };
    return icons[stage] || 'fa-seedling';
  };

  // ─── RENDER ───
  if (!localStorage.getItem('token')) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>Please Login First</h2>
        <button onClick={() => (window.location.href = '/')}>Go to Login</button>
      </div>
    );
  }

  return (
    <div className="maternity-container">
      <Sidebar role={role} />
      <div className="maternity-main">
        <Header role={role} />
        <div className="maternity-content">
          {/* ─── HEADER ─── */}
          <div className="maternity-header">
            <div>
              <h1>🤰 Maternity Care</h1>
              <p className="maternity-subtitle">Complete pregnancy journey with vitals, medications, fetal assessment, lab tests, referrals & reminders</p>
            </div>
            <div className="header-actions">
              <button className="btn-primary" onClick={() => setShowModal(true)}>
                <i className="fas fa-plus"></i> New Record
              </button>
              <button className="btn-queue" onClick={() => setShowQueue(!showQueue)}>
                <i className="fas fa-users"></i> {showQueue ? 'Hide Queue' : 'Show Queue'}
              </button>
            </div>
          </div>

          {/* ─── QUEUE SECTION ─── */}
          {showQueue && (
            <div className="queue-section">
              <div className="queue-header">
                <h2><i className="fas fa-users"></i> Patient Queue</h2>
                <span className="queue-total">{queueStats.total} patients in queue</span>
                <button className="btn-refresh" onClick={fetchQueueData}>
                  <i className="fas fa-sync-alt"></i> Refresh
                </button>
              </div>

              {/* Queue Stats */}
              <div className="queue-stats">
                <div className="stat-card">
                  <div className="stat-icon blue"><i className="fas fa-users"></i></div>
                  <div className="stat-info">
                    <h3>{queueStats.total}</h3>
                    <p>Total</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon red"><i className="fas fa-exclamation-circle"></i></div>
                  <div className="stat-info">
                    <h3>{queueStats.emergency}</h3>
                    <p>🚨 Emergency</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon orange"><i className="fas fa-exclamation-triangle"></i></div>
                  <div className="stat-info">
                    <h3>{queueStats.critical}</h3>
                    <p>⚠️ Critical</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon yellow"><i className="fas fa-clock"></i></div>
                  <div className="stat-info">
                    <h3>{queueStats.waiting}</h3>
                    <p>⏳ Waiting</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon purple"><i className="fas fa-spinner"></i></div>
                  <div className="stat-info">
                    <h3>{queueStats.in_progress}</h3>
                    <p>🔄 In Progress</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon green"><i className="fas fa-check-circle"></i></div>
                  <div className="stat-info">
                    <h3>{queueStats.completed}</h3>
                    <p>✅ Completed</p>
                  </div>
                </div>
              </div>

              {/* Queue Filters */}
              <div className="queue-filters">
                <div className="search-box">
                  <i className="fas fa-search"></i>
                  <input
                    type="text"
                    placeholder="Search by patient name or priority..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="department-filters">
                  <button 
                    className={`filter-btn ${selectedDepartment === 'all' ? 'active' : ''}`}
                    onClick={() => setSelectedDepartment('all')}
                  >
                    All
                  </button>
                  <button 
                    className={`filter-btn ${selectedDepartment === 'emergency' ? 'active' : ''}`}
                    onClick={() => setSelectedDepartment('emergency')}
                  >
                    🚨 Emergency
                  </button>
                  <button 
                    className={`filter-btn ${selectedDepartment === 'maternity' ? 'active' : ''}`}
                    onClick={() => setSelectedDepartment('maternity')}
                  >
                    🤰 Maternity
                  </button>
                  <button 
                    className={`filter-btn ${selectedDepartment === 'pediatrics' ? 'active' : ''}`}
                    onClick={() => setSelectedDepartment('pediatrics')}
                  >
                    👶 Pediatrics
                  </button>
                  <button 
                    className={`filter-btn ${selectedDepartment === 'cardiology' ? 'active' : ''}`}
                    onClick={() => setSelectedDepartment('cardiology')}
                  >
                    ❤️ Cardiology
                  </button>
                  <button 
                    className={`filter-btn ${selectedDepartment === 'orthopedics' ? 'active' : ''}`}
                    onClick={() => setSelectedDepartment('orthopedics')}
                  >
                    🦴 Orthopedics
                  </button>
                </div>
              </div>

              {/* Queue Table */}
              <div className="queue-table-container">
                {loading ? (
                  <div className="loading-spinner">
                    <i className="fas fa-spinner fa-spin"></i>
                    <p>Loading queue...</p>
                  </div>
                ) : filteredQueue.length === 0 ? (
                  <div className="empty-state">
                    <i className="fas fa-users"></i>
                    <h3>No patients in queue</h3>
                    <p>Queue is currently empty</p>
                  </div>
                ) : (
                  <table className="queue-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Patient</th>
                        <th>Priority</th>
                        <th>Department</th>
                        <th>Status</th>
                        <th>Check In</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredQueue.map((item, index) => (
                        <tr key={item.queue_id} className={`priority-${item.priority_level}`}>
                          <td>{index + 1}</td>
                          <td>
                            <span className="patient-name">{item.patient_name || `Patient #${item.patient_id}`}</span>
                          </td>
                          <td>{getPriorityBadge(item.priority_level)}</td>
                          <td>{item.department || 'General'}</td>
                          <td>{getQueueStatusBadge(item.status)}</td>
                          <td>{new Date(item.check_in_time).toLocaleTimeString()}</td>
                          <td>
                            <div className="queue-actions">
                              {item.status === 'waiting' && (
                                <button 
                                  className="btn-start"
                                  onClick={() => updateQueueStatus(item.queue_id, 'in_progress')}
                                  title="Start"
                                >
                                  <i className="fas fa-play"></i>
                                </button>
                              )}
                              {item.status === 'in_progress' && (
                                <>
                                  <button 
                                    className="btn-vitals"
                                    onClick={() => {
                                      setSelectedRecord({ patient_id: item.patient_id, patient_name: item.patient_name });
                                      setShowVitalsModal(true);
                                      resetVitalsForm();
                                    }}
                                    title="Record Vitals"
                                  >
                                    <i className="fas fa-heartbeat"></i>
                                  </button>
                                  <button 
                                    className="btn-complete"
                                    onClick={() => updateQueueStatus(item.queue_id, 'completed')}
                                    title="Complete"
                                  >
                                    <i className="fas fa-check-double"></i>
                                  </button>
                                </>
                              )}
                              {item.status === 'waiting' && (
                                <button 
                                  className="btn-cancel"
                                  onClick={() => updateQueueStatus(item.queue_id, 'cancelled')}
                                  title="Cancel"
                                >
                                  <i className="fas fa-times"></i>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* ─── STATS ─── */}
          <div className="maternity-stats">
            <div className="stat-card">
              <div className="stat-icon purple">
                <i className="fas fa-baby"></i>
              </div>
              <div className="stat-info">
                <h3>{records.filter((r) => r.status === 'active').length}</h3>
                <p>Active Pregnancies</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon red">
                <i className="fas fa-exclamation-triangle"></i>
              </div>
              <div className="stat-info">
                <h3>
                  {records.filter((r) => r.risk_level === 'high' || r.risk_level === 'critical')
                    .length}
                </h3>
                <p>High Risk</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon green">
                <i className="fas fa-heart"></i>
              </div>
              <div className="stat-info">
                <h3>{records.filter((r) => r.status === 'completed' && r.risk_level !== 'critical').length}</h3>
                <p>Successful Outcomes</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon yellow">
                <i className="fas fa-ambulance"></i>
              </div>
              <div className="stat-info">
                <h3>{records.filter((r) => r.risk_level === 'critical').length}</h3>
                <p>Critical Alerts</p>
              </div>
            </div>
          </div>

          {/* ─── TABLE ─── */}
          <div className="maternity-table-container">
            {loading ? (
              <div className="loading-spinner">
                <i className="fas fa-spinner fa-spin"></i>
                <p>Loading records...</p>
              </div>
            ) : records.length === 0 ? (
              <div className="empty-state">
                <i className="fas fa-baby"></i>
                <h3>No Maternity Records</h3>
                <p>Click "New Record" to add a maternity record</p>
              </div>
            ) : (
              <table className="maternity-table">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Weeks</th>
                    <th>Trimester</th>
                    <th>Visits</th>
                    <th>Missed</th>
                    <th>EDD</th>
                    <th>Risk</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record) => (
                    <tr key={record.record_id}>
                      <td>
                        <span className="patient-name">
                          {record.patient_name || `Patient #${record.patient_id}`}
                        </span>
                      </td>
                      <td>{record.gestational_weeks || 'N/A'}</td>
                      <td>
                        <span className="stage-badge">
                          <i className={`fas ${getStageIcon(getTrimester(record.gestational_weeks))}`}></i>
                          {getTrimester(record.gestational_weeks)}
                        </span>
                      </td>
                      <td>{record.total_visits || 0}</td>
                      <td>
                        {record.missed_visits > 0 ? (
                          <span style={{ color: '#EF4444', fontWeight: 'bold' }}>
                            {record.missed_visits} missed
                          </span>
                        ) : (
                          <span style={{ color: '#10B981' }}>✅ None</span>
                        )}
                      </td>
                      <td>{record.edd || 'N/A'}</td>
                      <td>{getRiskBadge(record.risk_level)}</td>
                      <td>{getStatusBadge(record.status)}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn-visit"
                            onClick={() => {
                              setSelectedRecord(record);
                              setShowVisitModal(true);
                              resetVisitForm();
                            }}
                            title="Record Visit"
                          >
                            <i className="fas fa-calendar-check"></i>
                          </button>
                          <button
                            className="btn-vitals"
                            onClick={() => {
                              setSelectedRecord(record);
                              setShowVitalsModal(true);
                              resetVitalsForm();
                            }}
                            title="Record Vitals"
                          >
                            <i className="fas fa-heartbeat"></i>
                          </button>
                          <button
                            className="btn-queue-add"
                            onClick={() => {
                              if (record.patient_id) {
                                addToQueue(record.patient_id);
                              }
                            }}
                            title="Add to Queue"
                          >
                            <i className="fas fa-users"></i>
                          </button>
                          <button
                            className="btn-medication"
                            onClick={() => {
                              setSelectedRecord(record);
                              setShowMedicationModal(true);
                              resetMedicationForm();
                            }}
                            title="Medications"
                          >
                            <i className="fas fa-pills"></i>
                          </button>
                          <button
                            className="btn-fetal"
                            onClick={() => {
                              setSelectedRecord(record);
                              setShowFetalModal(true);
                              resetFetalForm();
                            }}
                            title="Fetal Assessment"
                          >
                            <i className="fas fa-baby"></i>
                          </button>
                          <button
                            className="btn-lab"
                            onClick={() => {
                              setSelectedRecord(record);
                              setShowLabModal(true);
                              resetLabForm();
                            }}
                            title="Lab Tests"
                          >
                            <i className="fas fa-flask"></i>
                          </button>
                          <button
                            className="btn-referral"
                            onClick={() => {
                              setSelectedRecord(record);
                              setShowReferralModal(true);
                              resetReferralForm();
                            }}
                            title="Refer Patient"
                          >
                            <i className="fas fa-ambulance"></i>
                          </button>
                          <button
                            className="btn-reminder"
                            onClick={() => {
                              setSelectedRecord(record);
                              setShowReminderModal(true);
                              resetReminderForm();
                            }}
                            title="Set Reminder"
                          >
                            <i className="fas fa-bell"></i>
                          </button>
                          <button
                            className="btn-delivery"
                            onClick={() => {
                              setSelectedRecord(record);
                              setShowDeliveryModal(true);
                              resetDeliveryForm();
                            }}
                            title="Record Delivery"
                          >
                            <i className="fas fa-baby-carriage"></i>
                          </button>
                          <button
                            className="btn-postnatal"
                            onClick={() => {
                              setSelectedRecord(record);
                              setShowPostnatalModal(true);
                              resetPostnatalForm();
                            }}
                            title="Postnatal"
                          >
                            <i className="fas fa-heart"></i>
                          </button>
                          <button
                            className="btn-view"
                            onClick={() => {
                              setSelectedPatient(record);
                              fetchPatientDetails(record.record_id);
                              setActiveTab('overview');
                            }}
                            title="View Details"
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* ─── PATIENT DETAILS ─── */}
          {selectedPatient && patientDetails && (
            <div className="patient-details">
              <div className="details-header">
                <h2>
                  <i className="fas fa-user-md"></i> {selectedPatient.patient_name}
                  {patientDetails.status && (
                    <span style={{ marginLeft: '10px', fontSize: '14px' }}>
                      {getStatusBadge(patientDetails.status)}
                    </span>
                  )}
                </h2>
                <button
                  className="btn-close"
                  onClick={() => {
                    setSelectedPatient(null);
                    setPatientDetails(null);
                  }}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="details-tabs">
                <button
                  className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
                  onClick={() => setActiveTab('overview')}
                >
                  <i className="fas fa-info-circle"></i> Overview
                </button>
                <button
                  className={`tab ${activeTab === 'timeline' ? 'active' : ''}`}
                  onClick={() => setActiveTab('timeline')}
                >
                  <i className="fas fa-clock"></i> Timeline
                </button>
                <button
                  className={`tab ${activeTab === 'visits' ? 'active' : ''}`}
                  onClick={() => setActiveTab('visits')}
                >
                  <i className="fas fa-calendar-check"></i> Visits
                </button>
                <button
                  className={`tab ${activeTab === 'vitals' ? 'active' : ''}`}
                  onClick={() => setActiveTab('vitals')}
                >
                  <i className="fas fa-heartbeat"></i> Vitals
                </button>
                <button
                  className={`tab ${activeTab === 'medications' ? 'active' : ''}`}
                  onClick={() => setActiveTab('medications')}
                >
                  <i className="fas fa-pills"></i> Medications
                </button>
                <button
                  className={`tab ${activeTab === 'fetal' ? 'active' : ''}`}
                  onClick={() => setActiveTab('fetal')}
                >
                  <i className="fas fa-baby"></i> Fetal
                </button>
                <button
                  className={`tab ${activeTab === 'lab' ? 'active' : ''}`}
                  onClick={() => setActiveTab('lab')}
                >
                  <i className="fas fa-flask"></i> Lab Tests
                </button>
                <button
                  className={`tab ${activeTab === 'referrals' ? 'active' : ''}`}
                  onClick={() => setActiveTab('referrals')}
                >
                  <i className="fas fa-ambulance"></i> Referrals
                </button>
                <button
                  className={`tab ${activeTab === 'reminders' ? 'active' : ''}`}
                  onClick={() => setActiveTab('reminders')}
                >
                  <i className="fas fa-bell"></i> Reminders
                </button>
                <button
                  className={`tab ${activeTab === 'outcomes' ? 'active' : ''}`}
                  onClick={() => setActiveTab('outcomes')}
                >
                  <i className="fas fa-chart-bar"></i> Outcomes
                </button>
              </div>
              <div className="details-content">
                {/* OVERVIEW TAB */}
                {activeTab === 'overview' && (
                  <div className="overview-grid">
                    <div className="info-card">
                      <h4><i className="fas fa-calendar"></i> Pregnancy Details</h4>
                      <p><strong>LMP:</strong> {patientDetails.lmp || 'N/A'}</p>
                      <p><strong>EDD:</strong> {patientDetails.edd || 'N/A'}</p>
                      <p><strong>Weeks:</strong> {patientDetails.gestational_weeks || 'N/A'}</p>
                      <p><strong>Trimester:</strong> {getTrimester(patientDetails.gestational_weeks)}</p>
                      <p><strong>Gravida:</strong> {patientDetails.gravida || 0}</p>
                      <p><strong>Para:</strong> {patientDetails.para || 0}</p>
                      <p><strong>Risk Level:</strong> {getRiskBadge(patientDetails.risk_level)}</p>
                      <p><strong>First Visit:</strong> {patientDetails.first_visit_date || 'N/A'}</p>
                      <p><strong>Referred From:</strong> {patientDetails.referred_from || 'None'}</p>
                    </div>
                    <div className="info-card">
                      <h4><i className="fas fa-heart"></i> Current Vitals</h4>
                      <p><strong>Weight:</strong> {patientDetails.weight || 'N/A'} kg</p>
                      <p><strong>Height:</strong> {patientDetails.height || 'N/A'} cm</p>
                      <p><strong>Blood Pressure:</strong> {patientDetails.blood_pressure_systolic || 'N/A'}/{patientDetails.blood_pressure_diastolic || 'N/A'}</p>
                      <p><strong>Pulse Rate:</strong> {patientDetails.pulse_rate || 'N/A'} bpm</p>
                      <p><strong>Oxygen Saturation:</strong> {patientDetails.oxygen_saturation || 'N/A'}%</p>
                      <p><strong>Blood Glucose:</strong> {patientDetails.blood_glucose || 'N/A'} mmol/L</p>
                    </div>
                    <div className="info-card">
                      <h4><i className="fas fa-chart-line"></i> Visit Summary</h4>
                      <p><strong>Total Visits:</strong> {visitStats.total_visits || 0}</p>
                      <p><strong>Completed:</strong> {visitStats.completed_visits || 0}</p>
                      <p><strong>Missed:</strong> {visitStats.missed_visits || 0}</p>
                      <p><strong>Scheduled:</strong> {visitStats.scheduled_visits || 0}</p>
                      <p><strong>Missed Rate:</strong> {visitStats.total_visits > 0 
                        ? Math.round((visitStats.missed_visits / visitStats.total_visits) * 100) 
                        : 0}%</p>
                      {nextAppointment && (
                        <>
                          <p><strong>Next Appointment:</strong> {nextAppointment.visit_date}</p>
                          <p><strong>Type:</strong> {nextAppointment.visit_type || 'Routine'}</p>
                        </>
                      )}
                    </div>
                    <div className="info-card">
                      <h4><i className="fas fa-baby"></i> Outcome Summary</h4>
                      <p><strong>Total Deliveries:</strong> {outcomeSummary.total_deliveries || 0}</p>
                      <p><strong>Mothers Alive:</strong> {outcomeSummary.mothers_alive || 0}</p>
                      <p><strong>Mothers Deceased:</strong> {outcomeSummary.mothers_deceased || 0}</p>
                      <p><strong>Babies Alive:</strong> {outcomeSummary.babies_alive || 0}</p>
                      <p><strong>Stillborn:</strong> {outcomeSummary.stillborn_babies || 0}</p>
                      <p><strong>Babies Deceased:</strong> {outcomeSummary.babies_deceased || 0}</p>
                    </div>
                  </div>
                )}

                {/* TIMELINE TAB */}
                {activeTab === 'timeline' && (
                  <div className="timeline-container">
                    {pregnancyTimeline.length === 0 ? (
                      <p style={{ textAlign: 'center', color: '#94a3b8', padding: '40px' }}>
                        No timeline events yet
                      </p>
                    ) : (
                      <div className="timeline">
                        {pregnancyTimeline.map((event, index) => (
                          <div key={index} className="timeline-item">
                            <div className="timeline-dot" style={{ background: event.color }}></div>
                            <div className="timeline-content">
                              <div className="timeline-date">{event.date}</div>
                              <div className="timeline-event">
                                <i className={`fas ${event.icon}`} style={{ color: event.color }}></i>
                                <span className="timeline-event-name">{event.event}</span>
                              </div>
                              <div className="timeline-description">{event.description}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* VISITS TAB */}
                {activeTab === 'visits' && (
                  <div className="visits-container">
                    <button 
                      className="btn-primary" 
                      style={{ marginBottom: '16px' }}
                      onClick={() => {
                        setSelectedRecord(selectedPatient);
                        setShowVisitModal(true);
                        resetVisitForm();
                      }}
                    >
                      <i className="fas fa-plus"></i> Record Visit
                    </button>
                    {visitHistory.length === 0 ? (
                      <p style={{ textAlign: 'center', color: '#94a3b8', padding: '40px' }}>
                        No visits recorded yet
                      </p>
                    ) : (
                      <table className="details-table">
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Time</th>
                            <th>Type</th>
                            <th>Weeks</th>
                            <th>Status</th>
                            <th>BP</th>
                            <th>Weight</th>
                            <th>Notes</th>
                          </tr>
                        </thead>
                        <tbody>
                          {visitHistory.map((visit) => (
                            <tr key={visit.visit_id}>
                              <td>{visit.visit_date}</td>
                              <td>{visit.visit_time || '-'}</td>
                              <td>{visit.visit_type || 'N/A'}</td>
                              <td>{visit.gestational_weeks || 'N/A'}</td>
                              <td>
                                <span style={{
                                  color: visit.status === 'completed' ? '#10B981' : 
                                         visit.status === 'missed' ? '#EF4444' : '#F59E0B',
                                  fontWeight: 'bold'
                                }}>
                                  {visit.status === 'completed' ? '✅' : 
                                   visit.status === 'missed' ? '❌' : '⏰'} {visit.status}
                                </span>
                              </td>
                              <td>{visit.blood_pressure_systolic || '-'}/{visit.blood_pressure_diastolic || '-'}</td>
                              <td>{visit.weight || '-'} kg</td>
                              <td>{visit.notes || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}

                {/* VITALS TAB */}
                {activeTab === 'vitals' && (
                  <div className="vitals-container">
                    <button 
                      className="btn-primary" 
                      style={{ marginBottom: '16px' }}
                      onClick={() => {
                        setSelectedRecord(selectedPatient);
                        setShowVitalsModal(true);
                        resetVitalsForm();
                      }}
                    >
                      <i className="fas fa-plus"></i> Record Vitals
                    </button>
                    {patientDetails.vitals && patientDetails.vitals.length > 0 ? (
                      <table className="details-table">
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Weight</th>
                            <th>BP</th>
                            <th>Pulse</th>
                            <th>O2 Sat</th>
                            <th>Temp</th>
                            <th>Fetal HR</th>
                            <th>Fundal Height</th>
                          </tr>
                        </thead>
                        <tbody>
                          {patientDetails.vitals.map((vital) => (
                            <tr key={vital.vitals_id}>
                              <td>{new Date(vital.recorded_at).toLocaleDateString()}</td>
                              <td>{vital.weight || '-'} kg</td>
                              <td>{vital.blood_pressure_systolic || '-'}/{vital.blood_pressure_diastolic || '-'}</td>
                              <td>{vital.pulse_rate || '-'}</td>
                              <td>{vital.oxygen_saturation || '-'}%</td>
                              <td>{vital.temperature || '-'}°C</td>
                              <td>{vital.fetal_heart_rate || '-'}</td>
                              <td>{vital.fundal_height || '-'} cm</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <p style={{ textAlign: 'center', color: '#94a3b8', padding: '40px' }}>
                        No vitals recorded yet
                      </p>
                    )}
                  </div>
                )}

                {/* MEDICATIONS TAB */}
                {activeTab === 'medications' && (
                  <div className="medications-container">
                    <button 
                      className="btn-primary" 
                      style={{ marginBottom: '16px' }}
                      onClick={() => {
                        setSelectedRecord(selectedPatient);
                        setShowMedicationModal(true);
                        resetMedicationForm();
                      }}
                    >
                      <i className="fas fa-plus"></i> Add Medication
                    </button>
                    {medications.length === 0 ? (
                      <p style={{ textAlign: 'center', color: '#94a3b8', padding: '40px' }}>
                        No medications recorded yet
                      </p>
                    ) : (
                      <table className="details-table">
                        <thead>
                          <tr>
                            <th>Medication</th>
                            <th>Dosage</th>
                            <th>Frequency</th>
                            <th>Start Date</th>
                            <th>End Date</th>
                            <th>Supplement</th>
                            <th>Notes</th>
                          </tr>
                        </thead>
                        <tbody>
                          {medications.map((med) => (
                            <tr key={med.medication_id}>
                              <td>{med.medication_name || '-'}</td>
                              <td>{med.dosage || '-'}</td>
                              <td>{med.frequency || '-'}</td>
                              <td>{med.start_date || '-'}</td>
                              <td>{med.end_date || '-'}</td>
                              <td>{med.supplement_name ? `${med.supplement_name} ${med.supplement_dosage || ''}` : '-'}</td>
                              <td>{med.notes || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}

                {/* FETAL ASSESSMENTS TAB */}
                {activeTab === 'fetal' && (
                  <div className="fetal-container">
                    <button 
                      className="btn-primary" 
                      style={{ marginBottom: '16px' }}
                      onClick={() => {
                        setSelectedRecord(selectedPatient);
                        setShowFetalModal(true);
                        resetFetalForm();
                      }}
                    >
                      <i className="fas fa-plus"></i> Add Fetal Assessment
                    </button>
                    {fetalAssessments.length === 0 ? (
                      <p style={{ textAlign: 'center', color: '#94a3b8', padding: '40px' }}>
                        No fetal assessments recorded yet
                      </p>
                    ) : (
                      <table className="details-table">
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Weeks</th>
                            <th>Fetal HR</th>
                            <th>Movement</th>
                            <th>Fundal Height</th>
                            <th>Presentation</th>
                            <th>Amniotic Fluid</th>
                            <th>Notes</th>
                          </tr>
                        </thead>
                        <tbody>
                          {fetalAssessments.map((fetal) => (
                            <tr key={fetal.assessment_id}>
                              <td>{fetal.assessment_date}</td>
                              <td>{fetal.gestational_weeks || '-'}</td>
                              <td>{fetal.fetal_heart_rate || '-'}</td>
                              <td>{fetal.fetal_movement || '-'}</td>
                              <td>{fetal.fundal_height || '-'} cm</td>
                              <td>{fetal.presentation || '-'}</td>
                              <td>{fetal.amniotic_fluid || '-'}</td>
                              <td>{fetal.notes || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}

                {/* LAB TESTS TAB */}
                {activeTab === 'lab' && (
                  <div className="lab-container">
                    <button 
                      className="btn-primary" 
                      style={{ marginBottom: '16px' }}
                      onClick={() => {
                        setSelectedRecord(selectedPatient);
                        setShowLabModal(true);
                        resetLabForm();
                      }}
                    >
                      <i className="fas fa-plus"></i> Add Lab Test
                    </button>
                    {labTests.length === 0 ? (
                      <p style={{ textAlign: 'center', color: '#94a3b8', padding: '40px' }}>
                        No lab tests recorded yet
                      </p>
                    ) : (
                      <table className="details-table">
                        <thead>
                          <tr>
                            <th>Test Name</th>
                            <th>Date</th>
                            <th>Result</th>
                            <th>Normal Range</th>
                            <th>Interpretation</th>
                            <th>Notes</th>
                          </tr>
                        </thead>
                        <tbody>
                          {labTests.map((lab) => (
                            <tr key={lab.test_id}>
                              <td>{lab.test_name || '-'}</td>
                              <td>{lab.test_date || '-'}</td>
                              <td>{lab.result || '-'}</td>
                              <td>{lab.normal_range || '-'}</td>
                              <td>
                                <span style={{
                                  color: lab.interpretation === 'Abnormal' ? '#EF4444' : 
                                         lab.interpretation === 'Normal' ? '#10B981' : '#64748b'
                                }}>
                                  {lab.interpretation || '-'}
                                </span>
                              </td>
                              <td>{lab.notes || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}

                {/* REFERRALS TAB */}
                {activeTab === 'referrals' && (
                  <div className="referrals-container">
                    <button 
                      className="btn-primary" 
                      style={{ marginBottom: '16px' }}
                      onClick={() => {
                        setSelectedRecord(selectedPatient);
                        setShowReferralModal(true);
                        resetReferralForm();
                      }}
                    >
                      <i className="fas fa-ambulance"></i> Refer Patient
                    </button>
                    {referrals.length === 0 ? (
                      <p style={{ textAlign: 'center', color: '#94a3b8', padding: '40px' }}>
                        No referrals recorded yet
                      </p>
                    ) : (
                      <table className="details-table">
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Referred To</th>
                            <th>Reason</th>
                            <th>Urgency</th>
                            <th>Status</th>
                            <th>Notes</th>
                          </tr>
                        </thead>
                        <tbody>
                          {referrals.map((ref) => (
                            <tr key={ref.referral_id}>
                              <td>{ref.referral_date}</td>
                              <td>{ref.referred_to_facility || '-'}</td>
                              <td>{ref.reason_for_referral || '-'}</td>
                              <td>
                                <span style={{
                                  color: ref.urgency === 'emergency' ? '#DC2626' :
                                         ref.urgency === 'urgent' ? '#F59E0B' : '#10B981'
                                }}>
                                  {ref.urgency || 'Normal'}
                                </span>
                              </td>
                              <td>
                                <span style={{
                                  color: ref.status === 'completed' ? '#10B981' : '#F59E0B'
                                }}>
                                  {ref.status || 'Pending'}
                                </span>
                              </td>
                              <td>{ref.notes || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}

                {/* REMINDERS TAB */}
                {activeTab === 'reminders' && (
                  <div className="reminders-container">
                    <button 
                      className="btn-primary" 
                      style={{ marginBottom: '16px' }}
                      onClick={() => {
                        setSelectedRecord(selectedPatient);
                        setShowReminderModal(true);
                        resetReminderForm();
                      }}
                    >
                      <i className="fas fa-bell"></i> Set Reminder
                    </button>
                    {reminders.length === 0 ? (
                      <p style={{ textAlign: 'center', color: '#94a3b8', padding: '40px' }}>
                        No reminders set yet
                      </p>
                    ) : (
                      <table className="details-table">
                        <thead>
                          <tr>
                            <th>Type</th>
                            <th>Date</th>
                            <th>Time</th>
                            <th>Message</th>
                            <th>SMS</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reminders.map((rem) => (
                            <tr key={rem.reminder_id}>
                              <td>{rem.reminder_type || '-'}</td>
                              <td>{rem.reminder_date}</td>
                              <td>{rem.reminder_time}</td>
                              <td>{rem.message || '-'}</td>
                              <td>{rem.send_sms ? '✅ Yes' : '❌ No'}</td>
                              <td>
                                <span style={{
                                  color: rem.status === 'sent' ? '#10B981' : 
                                         rem.status === 'scheduled' ? '#3B82F6' : '#EF4444'
                                }}>
                                  {rem.status || 'Scheduled'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}

                {/* OUTCOMES TAB */}
                {activeTab === 'outcomes' && (
                  <div className="outcomes-container">
                    <div className="outcomes-grid">
                      <div className="outcome-card">
                        <h4>Maternal Outcomes</h4>
                        <div className="outcome-stat">
                          <span>Alive:</span>
                          <span className="outcome-value alive">{outcomeSummary.mothers_alive || 0}</span>
                        </div>
                        <div className="outcome-stat">
                          <span>Deceased:</span>
                          <span className="outcome-value deceased">{outcomeSummary.mothers_deceased || 0}</span>
                        </div>
                      </div>
                      <div className="outcome-card">
                        <h4>Newborn Outcomes</h4>
                        <div className="outcome-stat">
                          <span>Alive:</span>
                          <span className="outcome-value alive">{outcomeSummary.babies_alive || 0}</span>
                        </div>
                        <div className="outcome-stat">
                          <span>Stillborn:</span>
                          <span className="outcome-value stillborn">{outcomeSummary.stillborn_babies || 0}</span>
                        </div>
                        <div className="outcome-stat">
                          <span>Deceased:</span>
                          <span className="outcome-value deceased">{outcomeSummary.babies_deceased || 0}</span>
                        </div>
                      </div>
                      <div className="outcome-card">
                        <h4>Combined Outcomes</h4>
                        <div className="outcome-stat">
                          <span>Both Alive:</span>
                          <span className="outcome-value alive">{outcomeSummary.both_alive || 0}</span>
                        </div>
                        <div className="outcome-stat">
                          <span>Both Deceased:</span>
                          <span className="outcome-value deceased">{outcomeSummary.both_deceased || 0}</span>
                        </div>
                        <div className="outcome-stat">
                          <span>Mother Alive, Baby Deceased:</span>
                          <span className="outcome-value warning">{outcomeSummary.mother_alive_baby_deceased || 0}</span>
                        </div>
                        <div className="outcome-stat">
                          <span>Mother Deceased, Baby Alive:</span>
                          <span className="outcome-value warning">{outcomeSummary.mother_deceased_baby_alive || 0}</span>
                        </div>
                      </div>
                    </div>

                    {patientDetails.deliveries && patientDetails.deliveries.length > 0 && (
                      <div className="delivery-records">
                        <h4>Delivery Records</h4>
                        <table className="details-table">
                          <thead>
                            <tr>
                              <th>Date</th>
                              <th>Method</th>
                              <th>Baby Sex</th>
                              <th>Weight</th>
                              <th>Apgar 1/5</th>
                              <th>Maternal Outcome</th>
                              <th>Newborn Outcome</th>
                              <th>Complications</th>
                              <th>Notes</th>
                            </tr>
                          </thead>
                          <tbody>
                            {patientDetails.deliveries.map((delivery) => (
                              <tr key={delivery.delivery_id}>
                                <td>{delivery.delivery_date}</td>
                                <td>{delivery.delivery_method || 'N/A'}</td>
                                <td>{delivery.baby_sex || 'N/A'}</td>
                                <td>{delivery.birth_weight || '-'} kg</td>
                                <td>{delivery.apgar_1 || '-'}/{delivery.apgar_5 || '-'}</td>
                                <td>{getOutcomeBadge(delivery.maternal_outcome)}</td>
                                <td>
                                  {delivery.newborn_outcome === 'stillborn' 
                                    ? getOutcomeBadge('stillborn')
                                    : getOutcomeBadge(delivery.newborn_outcome)}
                                </td>
                                <td>
                                  {delivery.maternal_complications || delivery.newborn_complications ? (
                                    <span style={{ fontSize: '12px', color: '#EF4444' }}>
                                      {delivery.maternal_complications && `M: ${delivery.maternal_complications}`}
                                      {delivery.maternal_complications && delivery.newborn_complications && ' | '}
                                      {delivery.newborn_complications && `N: ${delivery.newborn_complications}`}
                                    </span>
                                  ) : '-'}
                                </td>
                                <td>{delivery.clinician_notes || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── CREATE MODAL ─── */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2><i className="fas fa-baby"></i> New Maternity Record</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                {/* ─── PATIENT INFORMATION ─── */}
                <div className="form-section full-width">
                  <h4><i className="fas fa-user"></i> Patient Information</h4>
                </div>
                
                <div className="form-group">
                  <label>Patient *</label>
                  <select name="patient_id" value={formData.patient_id} onChange={handleInputChange} required>
                    <option value="">-- Select Patient --</option>
                    {patients.map((p) => (
                      <option key={p.patient_id} value={p.patient_id}>
                        {p.first_name} {p.last_name} - {p.patient_code}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>First Visit Date</label>
                  <input type="date" name="first_visit_date" value={formData.first_visit_date} onChange={handleInputChange} />
                </div>

                {/* ─── PREGNANCY DETAILS ─── */}
                <div className="form-section full-width">
                  <h4><i className="fas fa-calendar"></i> Pregnancy Details</h4>
                </div>

                <div className="form-group">
                  <label>LMP (Last Menstrual Period)</label>
                  <input type="date" name="lmp" value={formData.lmp} onChange={handleInputChange} />
                </div>
                
                <div className="form-group">
                  <label>EDD (Expected Due Date)</label>
                  <input type="date" name="edd" value={formData.edd} onChange={handleInputChange} />
                </div>
                
                <div className="form-group">
                  <label>Gestational Weeks</label>
                  <input type="number" name="gestational_weeks" value={formData.gestational_weeks} onChange={handleInputChange} min="0" max="42" placeholder="e.g., 24" />
                </div>
                
                <div className="form-group">
                  <label>Referred From</label>
                  <input type="text" name="referred_from" value={formData.referred_from} onChange={handleInputChange} placeholder="Facility name" />
                </div>

                {/* ─── OBSTETRIC HISTORY ─── */}
                <div className="form-section full-width">
                  <h4><i className="fas fa-history"></i> Obstetric History</h4>
                </div>

                <div className="form-group">
                  <label>Gravida (Total Pregnancies)</label>
                  <input type="number" name="gravida" value={formData.gravida} onChange={handleInputChange} min="0" placeholder="0" />
                </div>
                
                <div className="form-group">
                  <label>Para (Deliveries)</label>
                  <input type="number" name="para" value={formData.para} onChange={handleInputChange} min="0" placeholder="0" />
                </div>
                
                <div className="form-group full-width">
                  <label>Previous Pregnancies History</label>
                  <textarea name="previous_pregnancies" value={formData.previous_pregnancies} onChange={handleInputChange} rows="2" placeholder="Details of previous pregnancies..." />
                </div>
                
                <div className="form-group full-width">
                  <label>Previous Complications</label>
                  <textarea name="previous_complications" value={formData.previous_complications} onChange={handleInputChange} rows="2" placeholder="Any previous complications..." />
                </div>

                {/* ─── RISK & STATUS ─── */}
                <div className="form-section full-width">
                  <h4><i className="fas fa-shield-alt"></i> Risk Assessment & Status</h4>
                </div>

                <div className="form-group">
                  <label>Risk Level</label>
                  <select name="risk_level" value={formData.risk_level} onChange={handleInputChange}>
                    <option value="low">✅ Low Risk</option>
                    <option value="moderate">⚠️ Moderate Risk</option>
                    <option value="high">🚨 High Risk</option>
                    <option value="critical">🆘 Critical</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Status</label>
                  <select name="status" value={formData.status} onChange={handleInputChange}>
                    <option value="active">🔵 Active</option>
                    <option value="completed">✅ Completed</option>
                    <option value="referred">🔄 Referred</option>
                  </select>
                </div>

                {/* ─── INITIAL VITALS ─── */}
                <div className="form-section full-width">
                  <h4><i className="fas fa-heartbeat"></i> Initial Vitals</h4>
                </div>

                <div className="form-group">
                  <label>Weight (kg)</label>
                  <input type="number" step="0.1" name="weight" value={formData.weight} onChange={handleInputChange} placeholder="e.g., 65.5" />
                </div>
                
                <div className="form-group">
                  <label>Height (cm)</label>
                  <input type="number" step="0.1" name="height" value={formData.height} onChange={handleInputChange} placeholder="e.g., 165" />
                </div>
                
                <div className="form-group">
                  <label>Blood Pressure (Systolic)</label>
                  <input type="number" name="blood_pressure_systolic" value={formData.blood_pressure_systolic} onChange={handleInputChange} placeholder="e.g., 120" />
                </div>
                
                <div className="form-group">
                  <label>Blood Pressure (Diastolic)</label>
                  <input type="number" name="blood_pressure_diastolic" value={formData.blood_pressure_diastolic} onChange={handleInputChange} placeholder="e.g., 80" />
                </div>
                
                <div className="form-group">
                  <label>Pulse Rate (bpm)</label>
                  <input type="number" name="pulse_rate" value={formData.pulse_rate} onChange={handleInputChange} placeholder="e.g., 72" />
                </div>
                
                <div className="form-group">
                  <label>Oxygen Saturation (%)</label>
                  <input type="number" step="0.1" name="oxygen_saturation" value={formData.oxygen_saturation} onChange={handleInputChange} placeholder="e.g., 98.5" />
                </div>
                
                <div className="form-group">
                  <label>Blood Glucose (mmol/L)</label>
                  <input type="number" step="0.1" name="blood_glucose" value={formData.blood_glucose} onChange={handleInputChange} placeholder="e.g., 5.4" />
                </div>
                
                <div className="form-group">
                  <label>BMI (Auto-calculated)</label>
                  <input type="text" value={formData.weight && formData.height ? 
                    (parseFloat(formData.weight) / ((parseFloat(formData.height)/100) ** 2)).toFixed(1) : ''} 
                    disabled style={{background: '#f1f5f9'}} placeholder="Auto-calculated" />
                </div>
              </div>

              {error && (
                <div className="form-error">
                  <i className="fas fa-exclamation-circle"></i>
                  <span>{error}</span>
                </div>
              )}

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? (
                    <><i className="fas fa-spinner fa-spin"></i> Creating...</>
                  ) : (
                    <><i className="fas fa-save"></i> Create Record</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── VITALS MODAL ─── */}
      {showVitalsModal && selectedRecord && (
        <div className="modal-overlay" onClick={() => setShowVitalsModal(false)}>
          <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2><i className="fas fa-heartbeat"></i> Record Vitals & Diagnose - {selectedRecord.patient_name}</h2>
              <button className="modal-close" onClick={() => setShowVitalsModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleVitalsSubmit}>
              <div className="form-grid">
                {/* ─── VITAL SIGNS ─── */}
                <div className="form-section full-width">
                  <h4><i className="fas fa-heart"></i> Vital Signs</h4>
                </div>
                <div className="form-group">
                  <label>Blood Pressure (Systolic) mmHg</label>
                  <input type="number" name="blood_pressure_systolic" value={vitalsData.blood_pressure_systolic} onChange={handleVitalsChange} placeholder="e.g., 120" />
                </div>
                <div className="form-group">
                  <label>Blood Pressure (Diastolic) mmHg</label>
                  <input type="number" name="blood_pressure_diastolic" value={vitalsData.blood_pressure_diastolic} onChange={handleVitalsChange} placeholder="e.g., 80" />
                </div>
                <div className="form-group">
                  <label>Pulse Rate (bpm)</label>
                  <input type="number" name="pulse_rate" value={vitalsData.pulse_rate} onChange={handleVitalsChange} placeholder="e.g., 72" />
                </div>
                <div className="form-group">
                  <label>Oxygen Saturation (%)</label>
                  <input type="number" step="0.1" name="oxygen_saturation" value={vitalsData.oxygen_saturation} onChange={handleVitalsChange} placeholder="e.g., 98.5" />
                </div>
                <div className="form-group">
                  <label>Temperature (°C)</label>
                  <input type="number" step="0.1" name="temperature" value={vitalsData.temperature} onChange={handleVitalsChange} placeholder="e.g., 36.5" />
                </div>
                
                {/* ─── ANTHROPOMETRICS ─── */}
                <div className="form-section full-width">
                  <h4><i className="fas fa-weight"></i> Anthropometrics</h4>
                </div>
                <div className="form-group">
                  <label>Weight (kg)</label>
                  <input type="number" step="0.1" name="weight" value={vitalsData.weight} onChange={handleVitalsChange} placeholder="e.g., 65.5" />
                </div>
                <div className="form-group">
                  <label>Height (cm)</label>
                  <input type="number" step="0.1" name="height" value={vitalsData.height} onChange={handleVitalsChange} placeholder="e.g., 165" />
                </div>
                <div className="form-group">
                  <label>BMI (calculated)</label>
                  <input type="text" value={vitalsData.weight && vitalsData.height ? 
                    (parseFloat(vitalsData.weight) / ((parseFloat(vitalsData.height)/100) ** 2)).toFixed(1) : ''} 
                    disabled style={{background: '#f1f5f9'}} placeholder="Auto-calculated" />
                </div>
                <div className="form-group">
                  <label>Blood Glucose (mmol/L)</label>
                  <input type="number" step="0.1" name="blood_glucose" value={vitalsData.blood_glucose} onChange={handleVitalsChange} placeholder="e.g., 5.4" />
                </div>
                
                {/* ─── OBSTETRIC ─── */}
                <div className="form-section full-width">
                  <h4><i className="fas fa-baby"></i> Obstetric Measurements</h4>
                </div>
                <div className="form-group">
                  <label>Fundal Height (cm)</label>
                  <input type="number" name="fundal_height" value={vitalsData.fundal_height} onChange={handleVitalsChange} placeholder="e.g., 24" />
                </div>
                <div className="form-group">
                  <label>Fetal Heart Rate (bpm)</label>
                  <input type="number" name="fetal_heart_rate" value={vitalsData.fetal_heart_rate} onChange={handleVitalsChange} placeholder="e.g., 140" />
                </div>
                <div className="form-group">
                  <label>Fetal Movement</label>
                  <select name="fetal_movement" value={vitalsData.fetal_movement} onChange={handleVitalsChange}>
                    <option value="Normal">Normal</option>
                    <option value="Reduced">Reduced</option>
                    <option value="Absent">Absent</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Urine Protein</label>
                  <select name="urine_protein" value={vitalsData.urine_protein} onChange={handleVitalsChange}>
                    <option value="Negative">Negative</option>
                    <option value="Trace">Trace</option>
                    <option value="Positive">Positive</option>
                  </select>
                </div>
                
                {/* ─── SYMPTOMS ─── */}
                <div className="form-section full-width">
                  <h4><i className="fas fa-notes-medical"></i> Symptoms & Warning Signs</h4>
                </div>
                <div className="form-group">
                  <label>Swelling</label>
                  <select name="swelling" value={vitalsData.swelling} onChange={handleVitalsChange}>
                    <option value="None">None</option>
                    <option value="Mild">Mild</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Severe">Severe</option>
                  </select>
                </div>
                <div className="form-group full-width">
                  <div className="checkbox-grid">
                    <label><input type="checkbox" name="blurred_vision" checked={vitalsData.blurred_vision} onChange={handleVitalsChange} /> Blurred Vision</label>
                    <label><input type="checkbox" name="headache" checked={vitalsData.headache} onChange={handleVitalsChange} /> Severe Headache</label>
                    <label><input type="checkbox" name="vaginal_bleeding" checked={vitalsData.vaginal_bleeding} onChange={handleVitalsChange} /> Vaginal Bleeding</label>
                    <label><input type="checkbox" name="abdominal_pain" checked={vitalsData.abdominal_pain} onChange={handleVitalsChange} /> Abdominal Pain</label>
                    <label><input type="checkbox" name="fluid_leakage" checked={vitalsData.fluid_leakage} onChange={handleVitalsChange} /> Fluid Leakage</label>
                    <label><input type="checkbox" name="contractions" checked={vitalsData.contractions} onChange={handleVitalsChange} /> Contractions</label>
                    <label><input type="checkbox" name="dizziness" checked={vitalsData.dizziness} onChange={handleVitalsChange} /> Dizziness</label>
                    <label><input type="checkbox" name="shortness_of_breath" checked={vitalsData.shortness_of_breath} onChange={handleVitalsChange} /> Shortness of Breath</label>
                  </div>
                </div>
                <div className="form-group full-width">
                  <label>Symptoms / Notes</label>
                  <textarea name="symptoms" value={vitalsData.symptoms} onChange={handleVitalsChange} rows="2" placeholder="Additional symptoms or notes..." />
                </div>
              </div>

              {/* ─── DIAGNOSIS RESULTS ─── */}
              {diagnosisResults.length > 0 && (
                <div className="diagnosis-results">
                  <h4><i className="fas fa-stethoscope"></i> Automated Clinical Insights</h4>
                  {diagnosisResults.map((d, i) => (
                    <div key={i} className={`diagnosis-item ${d.risk.toLowerCase()}`}>
                      <div className="diagnosis-header">
                        <span className="diagnosis-name">{d.condition}</span>
                        <span className={`diagnosis-risk ${d.risk.toLowerCase()}`}>{d.risk} Risk</span>
                      </div>
                      <p className="diagnosis-description">{d.description}</p>
                      <p className="diagnosis-action"><strong>Action:</strong> {d.action}</p>
                      {d.warningSigns && (
                        <p className="diagnosis-warning"><strong>⚠️ Warning Signs:</strong> {d.warningSigns.join(', ')}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowVitalsModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? <><i className="fas fa-spinner fa-spin"></i> Recording...</> : 'Record Vitals & Diagnose'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── VISIT MODAL ─── */}
      {showVisitModal && selectedRecord && (
        <div className="modal-overlay" onClick={() => setShowVisitModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2><i className="fas fa-calendar-check"></i> Record Visit - {selectedRecord.patient_name}</h2>
              <button className="modal-close" onClick={() => setShowVisitModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleVisitSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Visit Date *</label>
                  <input type="date" name="visit_date" value={visitData.visit_date} onChange={handleVisitChange} required />
                </div>
                <div className="form-group">
                  <label>Visit Time</label>
                  <input type="time" name="visit_time" value={visitData.visit_time} onChange={handleVisitChange} />
                </div>
                <div className="form-group">
                  <label>Visit Type</label>
                  <select name="visit_type" value={visitData.visit_type} onChange={handleVisitChange}>
                    <option value="routine">Routine</option>
                    <option value="emergency">Emergency</option>
                    <option value="follow_up">Follow-up</option>
                    <option value="antenatal">Antenatal</option>
                    <option value="initial">Initial</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Gestational Weeks</label>
                  <input type="number" name="gestational_weeks" value={visitData.gestational_weeks} onChange={handleVisitChange} min="0" max="42" placeholder="e.g., 24" />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select name="status" value={visitData.status} onChange={handleVisitChange}>
                    <option value="completed">Completed</option>
                    <option value="missed">Missed</option>
                    <option value="scheduled">Scheduled</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Weight (kg)</label>
                  <input type="number" step="0.1" name="weight" value={visitData.weight} onChange={handleVisitChange} placeholder="e.g., 65.5" />
                </div>
                <div className="form-group">
                  <label>Blood Pressure (Systolic)</label>
                  <input type="number" name="blood_pressure_systolic" value={visitData.blood_pressure_systolic} onChange={handleVisitChange} placeholder="e.g., 120" />
                </div>
                <div className="form-group">
                  <label>Blood Pressure (Diastolic)</label>
                  <input type="number" name="blood_pressure_diastolic" value={visitData.blood_pressure_diastolic} onChange={handleVisitChange} placeholder="e.g., 80" />
                </div>
                <div className="form-group">
                  <label>Pulse Rate (bpm)</label>
                  <input type="number" name="pulse_rate" value={visitData.pulse_rate} onChange={handleVisitChange} placeholder="e.g., 72" />
                </div>
                <div className="form-group">
                  <label>Oxygen Saturation (%)</label>
                  <input type="number" step="0.1" name="oxygen_saturation" value={visitData.oxygen_saturation} onChange={handleVisitChange} placeholder="e.g., 98.5" />
                </div>
                <div className="form-group">
                  <label>Fetal Heart Rate (bpm)</label>
                  <input type="number" name="fetal_heart_rate" value={visitData.fetal_heart_rate} onChange={handleVisitChange} placeholder="e.g., 140" />
                </div>
                <div className="form-group">
                  <label>Fundal Height (cm)</label>
                  <input type="number" name="fundal_height" value={visitData.fundal_height} onChange={handleVisitChange} placeholder="e.g., 24" />
                </div>
                <div className="form-group">
                  <label>Blood Glucose (mmol/L)</label>
                  <input type="number" step="0.1" name="blood_glucose" value={visitData.blood_glucose} onChange={handleVisitChange} placeholder="e.g., 5.4" />
                </div>
                <div className="form-group">
                  <label>Temperature (°C)</label>
                  <input type="number" step="0.1" name="temperature" value={visitData.temperature} onChange={handleVisitChange} placeholder="e.g., 36.5" />
                </div>
                <div className="form-group full-width">
                  <label>Symptoms</label>
                  <textarea name="symptoms" value={visitData.symptoms} onChange={handleVisitChange} rows="2" placeholder="Any symptoms..." />
                </div>
                <div className="form-group full-width">
                  <label>Notes</label>
                  <textarea name="notes" value={visitData.notes} onChange={handleVisitChange} rows="2" placeholder="Additional notes..." />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowVisitModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? <><i className="fas fa-spinner fa-spin"></i> Recording...</> : 'Record Visit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MEDICATION MODAL ─── */}
      {showMedicationModal && selectedRecord && (
        <div className="modal-overlay" onClick={() => setShowMedicationModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2><i className="fas fa-pills"></i> Medications & Supplements - {selectedRecord.patient_name}</h2>
              <button className="modal-close" onClick={() => setShowMedicationModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleMedicationSubmit}>
              <div className="form-grid">
                <div className="form-section full-width">
                  <h4><i className="fas fa-prescription"></i> Medication</h4>
                </div>
                <div className="form-group">
                  <label>Medication Name</label>
                  <input type="text" name="medication_name" value={medicationData.medication_name} onChange={handleMedicationChange} placeholder="e.g., Folic Acid" />
                </div>
                <div className="form-group">
                  <label>Dosage</label>
                  <input type="text" name="dosage" value={medicationData.dosage} onChange={handleMedicationChange} placeholder="e.g., 5mg" />
                </div>
                <div className="form-group">
                  <label>Frequency</label>
                  <input type="text" name="frequency" value={medicationData.frequency} onChange={handleMedicationChange} placeholder="e.g., Once daily" />
                </div>
                <div className="form-group">
                  <label>Start Date</label>
                  <input type="date" name="start_date" value={medicationData.start_date} onChange={handleMedicationChange} />
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <input type="date" name="end_date" value={medicationData.end_date} onChange={handleMedicationChange} />
                </div>
                <div className="form-group full-width">
                  <label>Notes</label>
                  <textarea name="notes" value={medicationData.notes} onChange={handleMedicationChange} rows="2" placeholder="Additional notes..." />
                </div>
                
                <div className="form-section full-width">
                  <h4><i className="fas fa-vitamins"></i> Supplements</h4>
                </div>
                <div className="form-group">
                  <label>Supplement Name</label>
                  <input type="text" name="supplement_name" value={medicationData.supplement_name} onChange={handleMedicationChange} placeholder="e.g., Iron" />
                </div>
                <div className="form-group">
                  <label>Supplement Dosage</label>
                  <input type="text" name="supplement_dosage" value={medicationData.supplement_dosage} onChange={handleMedicationChange} placeholder="e.g., 200mg" />
                </div>
                <div className="form-group">
                  <label>Supplement Frequency</label>
                  <input type="text" name="supplement_frequency" value={medicationData.supplement_frequency} onChange={handleMedicationChange} placeholder="e.g., Twice daily" />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowMedicationModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? <><i className="fas fa-spinner fa-spin"></i> Saving...</> : 'Save Medication'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── FETAL ASSESSMENT MODAL ─── */}
      {showFetalModal && selectedRecord && (
        <div className="modal-overlay" onClick={() => setShowFetalModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2><i className="fas fa-baby"></i> Fetal Assessment - {selectedRecord.patient_name}</h2>
              <button className="modal-close" onClick={() => setShowFetalModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleFetalSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Assessment Date</label>
                  <input type="date" name="assessment_date" value={fetalData.assessment_date} onChange={handleFetalChange} />
                </div>
                <div className="form-group">
                  <label>Gestational Weeks</label>
                  <input type="number" name="gestational_weeks" value={fetalData.gestational_weeks} onChange={handleFetalChange} min="0" max="42" placeholder="e.g., 24" />
                </div>
                <div className="form-group">
                  <label>Fetal Heart Rate (bpm)</label>
                  <input type="number" name="fetal_heart_rate" value={fetalData.fetal_heart_rate} onChange={handleFetalChange} placeholder="e.g., 140" />
                </div>
                <div className="form-group">
                  <label>Fetal Movement</label>
                  <select name="fetal_movement" value={fetalData.fetal_movement} onChange={handleFetalChange}>
                    <option value="Normal">Normal</option>
                    <option value="Reduced">Reduced</option>
                    <option value="Absent">Absent</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Fundal Height (cm)</label>
                  <input type="number" name="fundal_height" value={fetalData.fundal_height} onChange={handleFetalChange} placeholder="e.g., 24" />
                </div>
                <div className="form-group">
                  <label>Presentation</label>
                  <select name="presentation" value={fetalData.presentation} onChange={handleFetalChange}>
                    <option value="">Select</option>
                    <option value="cephalic">Cephalic</option>
                    <option value="breech">Breech</option>
                    <option value="transverse">Transverse</option>
                    <option value="oblique">Oblique</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Amniotic Fluid</label>
                  <select name="amniotic_fluid" value={fetalData.amniotic_fluid} onChange={handleFetalChange}>
                    <option value="">Select</option>
                    <option value="normal">Normal</option>
                    <option value="polyhydramnios">Polyhydramnios</option>
                    <option value="oligohydramnios">Oligohydramnios</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Placenta Position</label>
                  <select name="placenta_position" value={fetalData.placenta_position} onChange={handleFetalChange}>
                    <option value="">Select</option>
                    <option value="anterior">Anterior</option>
                    <option value="posterior">Posterior</option>
                    <option value="fundal">Fundal</option>
                    <option value="lateral">Lateral</option>
                    <option value="previa">Previa</option>
                  </select>
                </div>
                <div className="form-group full-width">
                  <label>Doppler Study</label>
                  <textarea name="doppler_study" value={fetalData.doppler_study} onChange={handleFetalChange} rows="2" placeholder="Doppler study results..." />
                </div>
                <div className="form-group full-width">
                  <label>Biophysical Profile</label>
                  <textarea name="biophysical_profile" value={fetalData.biophysical_profile} onChange={handleFetalChange} rows="2" placeholder="Biophysical profile results..." />
                </div>
                <div className="form-group full-width">
                  <label>Notes</label>
                  <textarea name="notes" value={fetalData.notes} onChange={handleFetalChange} rows="2" placeholder="Additional notes..." />
                </div>
                <div className="form-group full-width">
                  <label>Assessed By</label>
                  <input type="text" name="assessed_by" value={fetalData.assessed_by} onChange={handleFetalChange} placeholder="Clinician name" />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowFetalModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? <><i className="fas fa-spinner fa-spin"></i> Saving...</> : 'Save Fetal Assessment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── LAB TEST MODAL ─── */}
      {showLabModal && selectedRecord && (
        <div className="modal-overlay" onClick={() => setShowLabModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2><i className="fas fa-flask"></i> Lab Test - {selectedRecord.patient_name}</h2>
              <button className="modal-close" onClick={() => setShowLabModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleLabSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Test Name *</label>
                  <input type="text" name="test_name" value={labData.test_name} onChange={handleLabChange} placeholder="e.g., Haemoglobin" required />
                </div>
                <div className="form-group">
                  <label>Test Date</label>
                  <input type="date" name="test_date" value={labData.test_date} onChange={handleLabChange} />
                </div>
                <div className="form-group">
                  <label>Result</label>
                  <input type="text" name="result" value={labData.result} onChange={handleLabChange} placeholder="Test result" />
                </div>
                <div className="form-group">
                  <label>Normal Range</label>
                  <input type="text" name="normal_range" value={labData.normal_range} onChange={handleLabChange} placeholder="e.g., 11-15 g/dL" />
                </div>
                <div className="form-group">
                  <label>Interpretation</label>
                  <select name="interpretation" value={labData.interpretation} onChange={handleLabChange}>
                    <option value="">Select</option>
                    <option value="Normal">Normal</option>
                    <option value="Abnormal">Abnormal</option>
                    <option value="Borderline">Borderline</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
                <div className="form-group full-width">
                  <label>Notes</label>
                  <textarea name="notes" value={labData.notes} onChange={handleLabChange} rows="2" placeholder="Additional notes..." />
                </div>
                <div className="form-group full-width">
                  <label>Ordered By</label>
                  <input type="text" name="ordered_by" value={labData.ordered_by} onChange={handleLabChange} placeholder="Clinician name" />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowLabModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? <><i className="fas fa-spinner fa-spin"></i> Saving...</> : 'Save Lab Test'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── REFERRAL MODAL ─── */}
      {showReferralModal && selectedRecord && (
        <div className="modal-overlay" onClick={() => setShowReferralModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2><i className="fas fa-ambulance"></i> Refer Patient - {selectedRecord.patient_name}</h2>
              <button className="modal-close" onClick={() => setShowReferralModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleReferralSubmit}>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Referred To Facility *</label>
                  <input type="text" name="referred_to_facility" value={referralData.referred_to_facility} 
                    onChange={handleReferralChange} placeholder="Enter facility name" required />
                </div>
                <div className="form-group full-width">
                  <label>Reason for Referral *</label>
                  <textarea name="reason_for_referral" value={referralData.reason_for_referral} 
                    onChange={handleReferralChange} rows="3" placeholder="Detailed reason for referral..." required />
                </div>
                <div className="form-group">
                  <label>Urgency</label>
                  <select name="urgency" value={referralData.urgency} onChange={handleReferralChange}>
                    <option value="normal">Normal</option>
                    <option value="urgent">Urgent</option>
                    <option value="emergency">Emergency</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Referral Date</label>
                  <input type="date" name="referral_date" value={referralData.referral_date} onChange={handleReferralChange} />
                </div>
                <div className="form-group full-width">
                  <label>Notes</label>
                  <textarea name="notes" value={referralData.notes} onChange={handleReferralChange} rows="2" placeholder="Additional notes..." />
                </div>
                <div className="form-group full-width">
                  <label>Referred By</label>
                  <input type="text" name="referred_by" value={referralData.referred_by} onChange={handleReferralChange} placeholder="Clinician name" />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowReferralModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? <><i className="fas fa-spinner fa-spin"></i> Processing...</> : 'Refer Patient'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── REMINDER MODAL ─── */}
      {showReminderModal && selectedRecord && (
        <div className="modal-overlay" onClick={() => setShowReminderModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2><i className="fas fa-bell"></i> Set Reminder - {selectedRecord.patient_name}</h2>
              <button className="modal-close" onClick={() => setShowReminderModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleReminderSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Reminder Type</label>
                  <select name="reminder_type" value={reminderData.reminder_type} onChange={handleReminderChange}>
                    <option value="appointment">Appointment</option>
                    <option value="postnatal">Postnatal</option>
                    <option value="medication">Medication</option>
                    <option value="lab_test">Lab Test</option>
                    <option value="fetal_assessment">Fetal Assessment</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Reminder Date *</label>
                  <input type="date" name="reminder_date" value={reminderData.reminder_date} onChange={handleReminderChange} required />
                </div>
                <div className="form-group">
                  <label>Reminder Time</label>
                  <input type="time" name="reminder_time" value={reminderData.reminder_time} onChange={handleReminderChange} />
                </div>
                <div className="form-group full-width">
                  <label>Message</label>
                  <textarea name="message" value={reminderData.message} onChange={handleReminderChange} rows="2" placeholder="Reminder message..." />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input type="text" name="phone_number" value={reminderData.phone_number} onChange={handleReminderChange} placeholder="Phone number for SMS" />
                </div>
                <div className="form-group">
                  <label>
                    <input type="checkbox" name="send_sms" checked={reminderData.send_sms} onChange={handleReminderChange} />
                    Send SMS Reminder
                  </label>
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowReminderModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? <><i className="fas fa-spinner fa-spin"></i> Saving...</> : 'Set Reminder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── DELIVERY MODAL ─── */}
      {showDeliveryModal && selectedRecord && (
        <div className="modal-overlay" onClick={() => setShowDeliveryModal(false)}>
          <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2><i className="fas fa-baby-carriage"></i> Record Delivery - {selectedRecord.patient_name}</h2>
              <button className="modal-close" onClick={() => setShowDeliveryModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleDeliverySubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Delivery Date *</label>
                  <input type="date" name="delivery_date" value={deliveryData.delivery_date} onChange={handleDeliveryChange} required />
                </div>
                <div className="form-group">
                  <label>Delivery Time</label>
                  <input type="time" name="delivery_time" value={deliveryData.delivery_time} onChange={handleDeliveryChange} />
                </div>
                <div className="form-group">
                  <label>Gestational Age (weeks)</label>
                  <input type="number" name="gestational_age" value={deliveryData.gestational_age} onChange={handleDeliveryChange} min="0" max="42" placeholder="e.g., 40" />
                </div>
                <div className="form-group">
                  <label>Delivery Method</label>
                  <select name="delivery_method" value={deliveryData.delivery_method} onChange={handleDeliveryChange}>
                    <option value="">Select</option>
                    <option value="vaginal">Vaginal</option>
                    <option value="caesarean">Caesarean Section</option>
                    <option value="assisted">Assisted Delivery</option>
                    <option value="vacuum">Vacuum Extraction</option>
                    <option value="forceps">Forceps Delivery</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Baby Sex</label>
                  <select name="baby_sex" value={deliveryData.baby_sex} onChange={handleDeliveryChange}>
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="unknown">Unknown</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Birth Weight (kg)</label>
                  <input type="number" step="0.01" name="birth_weight" value={deliveryData.birth_weight} onChange={handleDeliveryChange} placeholder="e.g., 3.2" />
                </div>
                <div className="form-group">
                  <label>Apgar Score (1 min)</label>
                  <input type="number" name="apgar_1" value={deliveryData.apgar_1} onChange={handleDeliveryChange} min="0" max="10" placeholder="0-10" />
                </div>
                <div className="form-group">
                  <label>Apgar Score (5 min)</label>
                  <input type="number" name="apgar_5" value={deliveryData.apgar_5} onChange={handleDeliveryChange} min="0" max="10" placeholder="0-10" />
                </div>
                <div className="form-group">
                  <label>Number of Babies</label>
                  <select name="number_of_babies" value={deliveryData.number_of_babies} onChange={handleDeliveryChange}>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3+">3+</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Baby Condition</label>
                  <select name="baby_condition" value={deliveryData.baby_condition} onChange={handleDeliveryChange}>
                    <option value="">Select</option>
                    <option value="good">Good</option>
                    <option value="stable">Stable</option>
                    <option value="needs_care">Needs Special Care</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Resuscitation Performed</label>
                  <select name="resuscitation_performed" value={deliveryData.resuscitation_performed} onChange={(e) => {
                    setDeliveryData({ ...deliveryData, resuscitation_performed: e.target.value === 'true' });
                  }}>
                    <option value="false">No</option>
                    <option value="true">Yes</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Maternal Outcome *</label>
                  <select name="maternal_outcome" value={deliveryData.maternal_outcome} onChange={handleDeliveryChange} required>
                    <option value="alive">✅ Alive</option>
                    <option value="deceased">💔 Deceased</option>
                  </select>
                </div>
                {deliveryData.maternal_outcome === 'deceased' && (
                  <div className="form-group full-width">
                    <label>Maternal Death Reason</label>
                    <textarea name="maternal_death_reason" value={deliveryData.maternal_death_reason} onChange={handleDeliveryChange} rows="2" placeholder="Reason for maternal death..." />
                  </div>
                )}
                <div className="form-group">
                  <label>Newborn Outcome *</label>
                  <select name="newborn_outcome" value={deliveryData.newborn_outcome} onChange={handleDeliveryChange} required>
                    <option value="alive">✅ Alive</option>
                    <option value="stillborn">🕊️ Stillborn</option>
                    <option value="deceased">💔 Deceased</option>
                  </select>
                </div>
                {deliveryData.newborn_outcome === 'stillborn' && (
                  <div className="form-group full-width">
                    <label>Stillborn Reason</label>
                    <textarea name="stillborn_reason" value={deliveryData.stillborn_reason} onChange={handleDeliveryChange} rows="2" placeholder="Reason for stillbirth..." />
                  </div>
                )}
                {deliveryData.newborn_outcome === 'deceased' && (
                  <div className="form-group full-width">
                    <label>Baby Death Reason</label>
                    <textarea name="baby_death_reason" value={deliveryData.baby_death_reason} onChange={handleDeliveryChange} rows="2" placeholder="Reason for baby death..." />
                  </div>
                )}
                <div className="form-group full-width">
                  <label>Maternal Complications</label>
                  <textarea name="maternal_complications" value={deliveryData.maternal_complications} onChange={handleDeliveryChange} rows="2" placeholder="Any maternal complications..." />
                </div>
                <div className="form-group full-width">
                  <label>Newborn Complications</label>
                  <textarea name="newborn_complications" value={deliveryData.newborn_complications} onChange={handleDeliveryChange} rows="2" placeholder="Any newborn complications..." />
                </div>
                <div className="form-group full-width">
                  <label>Delivery Complications</label>
                  <textarea name="delivery_complications" value={deliveryData.delivery_complications} onChange={handleDeliveryChange} rows="2" placeholder="Any complications during delivery..." />
                </div>
                <div className="form-group full-width">
                  <label>Clinician Notes</label>
                  <textarea name="clinician_notes" value={deliveryData.clinician_notes} onChange={handleDeliveryChange} rows="2" placeholder="Additional clinical notes..." />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowDeliveryModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? <><i className="fas fa-spinner fa-spin"></i> Recording...</> : 'Record Delivery'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── POSTNATAL MODAL ─── */}
      {showPostnatalModal && selectedRecord && (
        <div className="modal-overlay" onClick={() => setShowPostnatalModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2><i className="fas fa-heart"></i> Postnatal Follow-up - {selectedRecord.patient_name}</h2>
              <button className="modal-close" onClick={() => setShowPostnatalModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handlePostnatalSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Follow-up Date</label>
                  <input type="date" name="follow_up_date" value={postnatalData.follow_up_date} onChange={handlePostnatalChange} />
                </div>
                <div className="form-group full-width">
                  <label>Maternal Observations</label>
                  <textarea name="maternal_observations" value={postnatalData.maternal_observations} onChange={handlePostnatalChange} rows="2" placeholder="Maternal recovery observations..." />
                </div>
                <div className="form-group full-width">
                  <label>Recovery Notes</label>
                  <textarea name="recovery_notes" value={postnatalData.recovery_notes} onChange={handlePostnatalChange} rows="2" placeholder="Recovery progress notes..." />
                </div>
                <div className="form-group">
                  <label>Maternal Condition</label>
                  <select name="maternal_condition" value={postnatalData.maternal_condition} onChange={handlePostnatalChange}>
                    <option value="">Select</option>
                    <option value="good">Good</option>
                    <option value="stable">Stable</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Follow-up Visits Scheduled</label>
                  <input type="text" name="follow_up_visits" value={postnatalData.follow_up_visits} onChange={handlePostnatalChange} placeholder="Scheduled follow-up dates" />
                </div>
                <div className="form-group">
                  <label>Baby Weight (kg)</label>
                  <input type="number" step="0.01" name="baby_weight" value={postnatalData.baby_weight} onChange={handlePostnatalChange} placeholder="e.g., 3.2" />
                </div>
                <div className="form-group">
                  <label>Baby Condition</label>
                  <select name="baby_condition" value={postnatalData.baby_condition} onChange={handlePostnatalChange}>
                    <option value="">Select</option>
                    <option value="good">Good</option>
                    <option value="stable">Stable</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Baby Feeding</label>
                  <select name="baby_feeding" value={postnatalData.baby_feeding} onChange={handlePostnatalChange}>
                    <option value="">Select</option>
                    <option value="breastfeeding">Breastfeeding</option>
                    <option value="formula">Formula</option>
                    <option value="mixed">Mixed</option>
                    <option value="struggling">Struggling</option>
                  </select>
                </div>
                <div className="form-group full-width">
                  <label>Baby Observations</label>
                  <textarea name="baby_observations" value={postnatalData.baby_observations} onChange={handlePostnatalChange} rows="2" placeholder="Baby's health observations..." />
                </div>
                <div className="form-group full-width">
                  <label>Baby Follow-up Required</label>
                  <textarea name="baby_follow_up" value={postnatalData.baby_follow_up} onChange={handlePostnatalChange} rows="2" placeholder="Any follow-up needed for baby..." />
                </div>
                <div className="form-group">
                  <label>
                    <input type="checkbox" name="send_reminder" checked={postnatalData.send_reminder} onChange={handlePostnatalChange} />
                    Send SMS Reminder 2 Days Before
                  </label>
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowPostnatalModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? <><i className="fas fa-spinner fa-spin"></i> Saving...</> : 'Save Postnatal Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── INVESTIGATIONS MODAL ─── */}
      {showInvestigationModal && selectedRecord && (
        <div className="modal-overlay" onClick={() => setShowInvestigationModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2><i className="fas fa-flask"></i> Investigations - {selectedRecord.patient_name}</h2>
              <button className="modal-close" onClick={() => setShowInvestigationModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleInvestigationSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Blood Group</label>
                  <input type="text" name="blood_group" value={investigationData.blood_group} onChange={handleInvestigationChange} placeholder="e.g., A, B, AB, O" />
                </div>
                <div className="form-group">
                  <label>Rh Status</label>
                  <select name="rh_status" value={investigationData.rh_status} onChange={handleInvestigationChange}>
                    <option value="">Select</option>
                    <option value="Positive">Positive</option>
                    <option value="Negative">Negative</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Haemoglobin (g/dL)</label>
                  <input type="number" step="0.1" name="haemoglobin" value={investigationData.haemoglobin} onChange={handleInvestigationChange} placeholder="e.g., 12.5" />
                </div>
                <div className="form-group">
                  <label>Blood Glucose (mmol/L)</label>
                  <input type="number" step="0.1" name="blood_glucose" value={investigationData.blood_glucose} onChange={handleInvestigationChange} placeholder="e.g., 5.4" />
                </div>
                <div className="form-group">
                  <label>Urinalysis</label>
                  <select name="urinalysis" value={investigationData.urinalysis} onChange={handleInvestigationChange}>
                    <option value="">Select</option>
                    <option value="Normal">Normal</option>
                    <option value="Abnormal">Abnormal</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>HIV Test</label>
                  <select name="hiv_test" value={investigationData.hiv_test} onChange={handleInvestigationChange}>
                    <option value="">Select</option>
                    <option value="Negative">Negative</option>
                    <option value="Positive">Positive</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Syphilis Test</label>
                  <select name="syphilis_test" value={investigationData.syphilis_test} onChange={handleInvestigationChange}>
                    <option value="">Select</option>
                    <option value="Negative">Negative</option>
                    <option value="Positive">Positive</option>
                  </select>
                </div>
                <div className="form-group full-width">
                  <label>Ultrasound Results</label>
                  <textarea name="ultrasound" value={investigationData.ultrasound} onChange={handleInvestigationChange} rows="2" placeholder="Ultrasound findings..." />
                </div>
                <div className="form-group full-width">
                  <label>Other Investigations</label>
                  <textarea name="other_investigations" value={investigationData.other_investigations} onChange={handleInvestigationChange} rows="2" placeholder="Any other investigation results..." />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowInvestigationModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? <><i className="fas fa-spinner fa-spin"></i> Saving...</> : 'Save Investigations'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── BIRTH PLAN MODAL ─── */}
      {showBirthPlanModal && selectedRecord && (
        <div className="modal-overlay" onClick={() => setShowBirthPlanModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2><i className="fas fa-clipboard-list"></i> Birth Plan - {selectedRecord.patient_name}</h2>
              <button className="modal-close" onClick={() => setShowBirthPlanModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleBirthPlanSubmit}>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Preferred Facility</label>
                  <select name="preferred_facility" value={birthPlanData.preferred_facility} onChange={handleBirthPlanChange}>
                    <option value="">Select Facility</option>
                    {facilities.map((f) => (
                      <option key={f.facility_id} value={f.facility_id}>
                        {f.facility_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group full-width">
                  <label>Birth Preferences</label>
                  <textarea name="birth_preferences" value={birthPlanData.birth_preferences} onChange={handleBirthPlanChange} rows="3" placeholder="Pain management preferences, position preferences, etc." />
                </div>
                <div className="form-group">
                  <label>Emergency Contact</label>
                  <input type="text" name="emergency_contact" value={birthPlanData.emergency_contact} onChange={handleBirthPlanChange} placeholder="Name and phone number" />
                </div>
                <div className="form-group">
                  <label>Support Person</label>
                  <input type="text" name="support_person" value={birthPlanData.support_person} onChange={handleBirthPlanChange} placeholder="Name of support person" />
                </div>
                <div className="form-group">
                  <label>Previous Delivery Method</label>
                  <select name="previous_delivery_method" value={birthPlanData.previous_delivery_method} onChange={handleBirthPlanChange}>
                    <option value="">Select</option>
                    <option value="vaginal">Vaginal</option>
                    <option value="caesarean">Caesarean Section</option>
                    <option value="assisted">Assisted Delivery</option>
                    <option value="none">None</option>
                  </select>
                </div>
                <div className="form-group full-width">
                  <label>Special Considerations</label>
                  <textarea name="special_considerations" value={birthPlanData.special_considerations} onChange={handleBirthPlanChange} rows="2" placeholder="Any special considerations or requests..." />
                </div>
                <div className="form-group full-width">
                  <label>Delivery Notes</label>
                  <textarea name="delivery_notes" value={birthPlanData.delivery_notes} onChange={handleBirthPlanChange} rows="2" placeholder="Additional delivery notes..." />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowBirthPlanModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? <><i className="fas fa-spinner fa-spin"></i> Saving...</> : 'Save Birth Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Maternity;