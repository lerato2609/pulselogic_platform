import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Sidebar from '../components/common/Sidebar';
import Header from '../components/common/Header';
import { API_URL } from '../config';

import './styles/vitals.css';

// ============================================================
// EMPTY VITALS FORM
// ============================================================

const emptyVitals = {
  temperature: '',
  heartRate: '',
  systolic: '',
  diastolic: '',
  oxygenSaturation: '',
  respiratoryRate: '',
  bloodGlucose: '',
  weight: '',
  height: '',
  painScore: '',
  symptoms: [],
  notes: ''
};

// ============================================================
// SYMPTOMS
// ============================================================

const symptomsList = [
  'Fever',
  'Headache',
  'Dizziness',
  'Fatigue',
  'Chest pain',
  'Palpitations',
  'Shortness of breath',
  'Wheezing',
  'Cough',
  'Confusion',
  'Fainting',
  'Seizure',
  'Blurred vision',
  'Nausea',
  'Vomiting',
  'Abdominal pain',
  'Diarrhea',
  'Excessive thirst',
  'Frequent urination',
  'Weight loss',
  'Weight gain',
  'Leg swelling',
  'Swelling',
  'Weakness',
  'Numbness',
  'Difficulty speaking',
  'Night sweats',
  'Blood in urine',
  'Blood in stool'
];

// ============================================================
// HELPERS
// ============================================================

const toNumber = value => {
  if (
    value === '' ||
    value === null ||
    value === undefined
  ) {
    return null;
  }

  const converted = Number(value);

  return Number.isFinite(converted)
    ? converted
    : null;
};

const getPatientId = patient => {
  return (
    patient.patient_id ??
    patient.patientId ??
    patient.id ??
    patient.patient_code ??
    ''
  );
};

const getPatientCode = patient => {
  return (
    patient.patient_code ??
    patient.patient_number ??
    patient.medical_record_number ??
    getPatientId(patient)
  );
};

const getPatientStatus = patient => {
  return (
    patient.check_in_status ??
    patient.registration_status ??
    patient.status ??
    'Registered'
  );
};

const getPatientSource = patient => {
  if (
    patient.check_in_status ||
    patient.checked_in_at
  ) {
    return 'Check-in';
  }

  return 'Registration';
};

// ============================================================
// IMMEDIATE TEMPERATURE CHECK
// ============================================================

const analyseTemperature = value => {
  const temperature =
    toNumber(value);

  if (temperature === null) {
    return null;
  }

  if (temperature < 35) {
    return {
      type: 'critical',
      title: 'LOW TEMPERATURE',
      message:
        'Very low body temperature detected. Possible hypothermia. Urgent clinical assessment is required.'
    };
  }

  if (temperature < 36) {
    return {
      type: 'warning',
      title: 'TEMPERATURE BELOW NORMAL',
      message:
        'Temperature is lower than expected. Repeat the reading and assess the patient.'
    };
  }

  if (temperature >= 40) {
    return {
      type: 'critical',
      title: 'VERY HIGH FEVER',
      message:
        'Very high body temperature detected. Urgent assessment is required.'
    };
  }

  if (temperature >= 38) {
    return {
      type: 'warning',
      title: 'FEVER',
      message:
        'Temperature is elevated. Possible infection or inflammatory illness should be assessed.'
    };
  }

  return {
    type: 'normal',
    title: 'NORMAL TEMPERATURE',
    message:
      'Temperature is within the expected screening range.'
  };
};

// ============================================================
// IMMEDIATE BP CHECK
// ============================================================

const analyseBloodPressure = (
  systolicValue,
  diastolicValue
) => {
  const systolic =
    toNumber(systolicValue);

  const diastolic =
    toNumber(diastolicValue);

  if (
    systolic === null ||
    diastolic === null
  ) {
    return null;
  }

  if (
    systolic >= 180 ||
    diastolic >= 120
  ) {
    return {
      type: 'critical',
      title: 'VERY HIGH BLOOD PRESSURE',
      message:
        'Severely elevated blood pressure detected. Possible severe hypertension. Repeat the reading and arrange urgent clinical assessment.'
    };
  }

  if (
    systolic >= 140 ||
    diastolic >= 90
  ) {
    return {
      type: 'warning',
      title: 'HIGH BLOOD PRESSURE',
      message:
        'The patient may have hypertension. Repeat blood pressure measurements are required before hypertension can be confirmed.'
    };
  }

  if (
    systolic >= 130 ||
    diastolic >= 80
  ) {
    return {
      type: 'warning',
      title: 'ELEVATED BLOOD PRESSURE',
      message:
        'Blood pressure is elevated. The patient should be monitored for hypertension.'
    };
  }

  if (systolic < 90) {
    return {
      type: 'warning',
      title: 'LOW BLOOD PRESSURE',
      message:
        'Blood pressure is low. Assess for dizziness, weakness, dehydration or fainting.'
    };
  }

  return {
    type: 'normal',
    title: 'NORMAL BLOOD PRESSURE',
    message:
      'Blood pressure is within the expected screening range.'
  };
};

// ============================================================
// HEART RATE
// ============================================================

const analyseHeartRate = value => {
  const heartRate =
    toNumber(value);

  if (heartRate === null) {
    return null;
  }

  if (heartRate >= 130) {
    return {
      type: 'critical',
      title: 'VERY FAST HEART RATE',
      message:
        'Marked tachycardia detected. Cardiac assessment may be required.'
    };
  }

  if (heartRate > 100) {
    return {
      type: 'warning',
      title: 'FAST HEART RATE',
      message:
        'Possible tachycardia. Causes may include fever, dehydration, stress, anaemia or cardiac rhythm disturbance.'
    };
  }

  if (heartRate < 45) {
    return {
      type: 'critical',
      title: 'VERY SLOW HEART RATE',
      message:
        'Marked bradycardia detected. Clinical and ECG assessment may be required.'
    };
  }

  if (heartRate < 60) {
    return {
      type: 'warning',
      title: 'SLOW HEART RATE',
      message:
        'Possible bradycardia. Assess symptoms and repeat the measurement.'
    };
  }

  return {
    type: 'normal',
    title: 'NORMAL HEART RATE',
    message:
      'Heart rate is within the expected resting screening range.'
  };
};

// ============================================================
// OXYGEN
// ============================================================

const analyseOxygen = value => {
  const oxygen =
    toNumber(value);

  if (oxygen === null) {
    return null;
  }

  if (oxygen < 90) {
    return {
      type: 'critical',
      title: 'CRITICALLY LOW OXYGEN',
      message:
        'Severe low oxygen saturation detected. Urgent respiratory assessment is required.'
    };
  }

  if (oxygen < 94) {
    return {
      type: 'warning',
      title: 'LOW OXYGEN',
      message:
        'Oxygen saturation is below the expected range. Possible respiratory or cardiopulmonary problem.'
    };
  }

  return {
    type: 'normal',
    title: 'NORMAL OXYGEN',
    message:
      'Oxygen saturation is within the expected screening range.'
  };
};

// ============================================================
// RESPIRATORY RATE
// ============================================================

const analyseRespiratoryRate = value => {
  const rate =
    toNumber(value);

  if (rate === null) {
    return null;
  }

  if (
    rate < 8 ||
    rate >= 30
  ) {
    return {
      type: 'critical',
      title: 'CRITICAL RESPIRATORY RATE',
      message:
        'Respiratory rate is significantly abnormal and requires urgent clinical assessment.'
    };
  }

  if (rate > 20) {
    return {
      type: 'warning',
      title: 'FAST BREATHING',
      message:
        'Respiratory rate is elevated. Possible respiratory or systemic illness should be assessed.'
    };
  }

  return {
    type: 'normal',
    title: 'NORMAL RESPIRATORY RATE',
    message:
      'Respiratory rate is within the expected screening range.'
  };
};

// ============================================================
// GLUCOSE
// ============================================================

const analyseGlucose = value => {
  const glucose =
    toNumber(value);

  if (glucose === null) {
    return null;
  }

  if (glucose < 3) {
    return {
      type: 'critical',
      title: 'VERY LOW BLOOD GLUCOSE',
      message:
        'Severe hypoglycaemia may be present. Urgent clinical assessment is required.'
    };
  }

  if (glucose < 3.9) {
    return {
      type: 'warning',
      title: 'LOW BLOOD GLUCOSE',
      message:
        'Blood glucose is below the expected range. Possible hypoglycaemia.'
    };
  }

  if (glucose >= 11.1) {
    return {
      type: 'warning',
      title: 'HIGH BLOOD GLUCOSE',
      message:
        'Blood glucose is elevated. The patient may require screening for diabetes or hyperglycaemia.'
    };
  }

  return {
    type: 'normal',
    title: 'GLUCOSE NOT CRITICALLY ABNORMAL',
    message:
      'Interpret the result according to whether the glucose reading was fasting or random.'
  };
};

// ============================================================
// FINAL CLINICAL SCREENING
// ============================================================

const calculateClinicalAssessment =
  vitals => {

    const temperature =
      toNumber(
        vitals.temperature
      );

    const heartRate =
      toNumber(
        vitals.heartRate
      );

    const systolic =
      toNumber(
        vitals.systolic
      );

    const diastolic =
      toNumber(
        vitals.diastolic
      );

    const oxygen =
      toNumber(
        vitals.oxygenSaturation
      );

    const respiratoryRate =
      toNumber(
        vitals.respiratoryRate
      );

    const glucose =
      toNumber(
        vitals.bloodGlucose
      );

    const weight =
      toNumber(
        vitals.weight
      );

    const height =
      toNumber(
        vitals.height
      );

    const symptoms =
      vitals.symptoms || [];

    const has = symptom =>
      symptoms.includes(symptom);

    let emergency = false;
    let riskScore = 0;

    const chronicConditions = [];

    // ========================================================
    // EMERGENCY CHECK
    // ========================================================

    if (
      oxygen !== null &&
      oxygen < 90
    ) {
      emergency = true;
      riskScore += 5;
    }

    if (
      temperature !== null &&
      (
        temperature < 35 ||
        temperature >= 40
      )
    ) {
      emergency = true;
      riskScore += 5;
    }

    if (
      respiratoryRate !== null &&
      (
        respiratoryRate < 8 ||
        respiratoryRate >= 30
      )
    ) {
      emergency = true;
      riskScore += 5;
    }

    if (
      heartRate !== null &&
      (
        heartRate < 40 ||
        heartRate >= 140
      )
    ) {
      emergency = true;
      riskScore += 5;
    }

    if (
      systolic !== null &&
      diastolic !== null &&
      (
        systolic >= 180 ||
        diastolic >= 120
      )
    ) {
      riskScore += 4;

      if (
        has('Chest pain') ||
        has('Shortness of breath') ||
        has('Confusion') ||
        has('Blurred vision') ||
        has('Difficulty speaking')
      ) {
        emergency = true;
      }
    }

    if (
      has('Chest pain') &&
      (
        has('Shortness of breath') ||
        has('Fainting') ||
        has('Palpitations')
      )
    ) {
      emergency = true;
      riskScore += 5;
    }

    if (
      has('Difficulty speaking') ||
      has('Seizure')
    ) {
      emergency = true;
      riskScore += 5;
    }

    // ========================================================
    // POSSIBLE HYPERTENSION
    // ========================================================

    if (
      systolic !== null &&
      diastolic !== null &&
      (
        systolic >= 140 ||
        diastolic >= 90
      )
    ) {
      chronicConditions.push({
        name:
          'POSSIBLE HYPERTENSION',

        reason:
          `Blood pressure recorded at ${systolic}/${diastolic} mmHg.`,

        tests: [
          'Repeat blood pressure measurements',
          'Home or ambulatory blood pressure monitoring',
          'Kidney function: creatinine and eGFR',
          'Electrolytes',
          'Urinalysis / urine albumin-creatinine ratio',
          'Blood glucose or HbA1c',
          'Lipid profile',
          'ECG if clinically indicated'
        ]
      });
    }

    // ========================================================
    // POSSIBLE DIABETES
    // ========================================================

    if (
      (
        glucose !== null &&
        glucose >= 11.1
      ) ||
      (
        has('Excessive thirst') &&
        has('Frequent urination')
      )
    ) {
      chronicConditions.push({
        name:
          'POSSIBLE DIABETES MELLITUS',

        reason:
          glucose !== null &&
          glucose >= 11.1
            ? `Elevated glucose reading of ${glucose} mmol/L.`
            : 'Excessive thirst and frequent urination were reported.',

        tests: [
          'Repeat blood glucose',
          'Fasting plasma glucose',
          'HbA1c',
          'Oral glucose tolerance test if clinically indicated',
          'Urinalysis',
          'Kidney function assessment'
        ]
      });
    }

    // ========================================================
    // POSSIBLE ASTHMA / AIRWAY DISEASE
    // ========================================================

    if (
      has('Wheezing') ||
      (
        has('Shortness of breath') &&
        has('Cough')
      )
    ) {
      chronicConditions.push({
        name:
          'POSSIBLE ASTHMA / CHRONIC AIRWAY DISEASE',

        reason:
          'Respiratory symptoms such as wheezing, coughing or shortness of breath were reported.',

        tests: [
          'Pulse oximetry',
          'Spirometry',
          'Bronchodilator response testing',
          'Peak expiratory flow',
          'Clinical respiratory examination',
          'Chest X-ray if clinically indicated'
        ]
      });
    }

    // ========================================================
    // POSSIBLE CARDIOVASCULAR DISEASE
    // ========================================================

    if (
      has('Chest pain') ||
      has('Palpitations') ||
      (
        heartRate !== null &&
        (
          heartRate > 100 ||
          heartRate < 50
        )
      )
    ) {
      chronicConditions.push({
        name:
          'POSSIBLE CARDIOVASCULAR / RHYTHM DISORDER',

        reason:
          'Cardiac symptoms or an abnormal heart rate were identified.',

        tests: [
          '12-lead ECG',
          'Repeat blood pressure',
          'Electrolytes',
          'Full blood count',
          'Thyroid function if clinically indicated',
          'Troponin for acute chest pain when clinically indicated',
          'Echocardiogram if indicated'
        ]
      });
    }

    // ========================================================
    // POSSIBLE HEART FAILURE
    // ========================================================

    if (
      has('Leg swelling') &&
      has('Shortness of breath')
    ) {
      chronicConditions.push({
        name:
          'POSSIBLE HEART FAILURE / CARDIAC DISEASE',

        reason:
          'Leg swelling together with shortness of breath may require cardiac assessment.',

        tests: [
          'ECG',
          'Chest X-ray',
          'Kidney function',
          'Electrolytes',
          'BNP or NT-proBNP if available',
          'Echocardiogram'
        ]
      });
    }

    // ========================================================
    // POSSIBLE ANAEMIA
    // ========================================================

    if (
      has('Fatigue') &&
      (
        has('Dizziness') ||
        has('Shortness of breath') ||
        (
          heartRate !== null &&
          heartRate > 100
        )
      )
    ) {
      chronicConditions.push({
        name:
          'POSSIBLE ANAEMIA',

        reason:
          'Fatigue with dizziness, breathlessness or fast heart rate may occur with anaemia.',

        tests: [
          'Full blood count',
          'Haemoglobin level',
          'Ferritin',
          'Iron studies',
          'Vitamin B12 and folate if clinically indicated'
        ]
      });
    }

    // ========================================================
    // POSSIBLE CHRONIC KIDNEY DISEASE
    // ========================================================

    if (
      (
        systolic !== null &&
        diastolic !== null &&
        (
          systolic >= 140 ||
          diastolic >= 90
        )
      ) &&
      (
        has('Swelling') ||
        has('Leg swelling') ||
        has('Blood in urine')
      )
    ) {
      chronicConditions.push({
        name:
          'POSSIBLE CHRONIC KIDNEY DISEASE',

        reason:
          'High blood pressure together with swelling or urinary symptoms may require kidney assessment.',

        tests: [
          'Serum creatinine',
          'eGFR',
          'Electrolytes',
          'Urinalysis',
          'Urine albumin-creatinine ratio',
          'Renal ultrasound if clinically indicated'
        ]
      });
    }

    // ========================================================
    // POSSIBLE OBESITY / METABOLIC RISK
    // ========================================================

    if (
      weight !== null &&
      height !== null &&
      height > 0
    ) {
      const heightM =
        height / 100;

      const bmi =
        weight /
        (
          heightM *
          heightM
        );

      if (bmi >= 30) {
        chronicConditions.push({
          name:
            'OBESITY / METABOLIC RISK',

          reason:
            `Calculated BMI is ${bmi.toFixed(1)}.`,

          tests: [
            'Blood pressure assessment',
            'HbA1c',
            'Fasting blood glucose',
            'Lipid profile',
            'Liver function tests if clinically indicated'
          ]
        });
      }
    }

    // ========================================================
    // REMOVE DUPLICATES
    // ========================================================

    const uniqueConditions =
      chronicConditions.filter(
        (
          condition,
          index,
          array
        ) =>
          array.findIndex(
            item =>
              item.name ===
              condition.name
          ) === index
      );

    return {
      emergency,
      riskScore,

      status:
        emergency
          ? 'EMERGENCY PATIENT'
          : 'NORMAL / NON-EMERGENCY PATIENT',

      chronicConditions:
        uniqueConditions
    };
  };

// ============================================================
// MAIN COMPONENT
// ============================================================

function Vitals() {
  const navigate =
    useNavigate();

  const [patients, setPatients] =
    useState([]);

  const [
    selectedPatient,
    setSelectedPatient
  ] = useState(null);

  const [vitals, setVitals] =
    useState(emptyVitals);

  const [
    loadingPatients,
    setLoadingPatients
  ] = useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState('');

  const [
    searchTerm,
    setSearchTerm
  ] = useState('');

  // ==========================================================
  // LOAD REGISTERED / CHECKED-IN PATIENTS
  // ==========================================================

  useEffect(() => {
    const loadPatients =
      async () => {

        try {
          setLoadingPatients(
            true
          );

          setError('');

          const token =
            localStorage.getItem(
              'token'
            );

          const response =
            await fetch(
              `${API_URL}/patients`,
              {
                headers: {
                  Authorization:
                    `Bearer ${token}`,

                  'Content-Type':
                    'application/json'
                }
              }
            );

          const data =
            await response.json();

          if (
            !response.ok ||
            !data.success
          ) {
            throw new Error(
              data.message ||
              'Unable to load patients.'
            );
          }

          setPatients(
            data.patients ||
            data.data ||
            []
          );

        } catch (
          patientError
        ) {

          console.error(
            'Patient load error:',
            patientError
          );

          setError(
            patientError.message ||
            'Unable to load patients.'
          );

        } finally {
          setLoadingPatients(
            false
          );
        }
      };

    loadPatients();

  }, []);

  // ==========================================================
  // IMMEDIATE RESULTS
  // ==========================================================

  const temperatureStatus =
    analyseTemperature(
      vitals.temperature
    );

  const heartRateStatus =
    analyseHeartRate(
      vitals.heartRate
    );

  const bpStatus =
    analyseBloodPressure(
      vitals.systolic,
      vitals.diastolic
    );

  const oxygenStatus =
    analyseOxygen(
      vitals.oxygenSaturation
    );

  const respiratoryStatus =
    analyseRespiratoryRate(
      vitals.respiratoryRate
    );

  const glucoseStatus =
    analyseGlucose(
      vitals.bloodGlucose
    );

  // ==========================================================
  // CHECK IF CORE VITALS ARE COMPLETE
  // ==========================================================

  const allVitalsComplete =
    Boolean(
      vitals.temperature !== '' &&
      vitals.heartRate !== '' &&
      vitals.systolic !== '' &&
      vitals.diastolic !== '' &&
      vitals.oxygenSaturation !== '' &&
      vitals.respiratoryRate !== '' &&
      vitals.bloodGlucose !== ''
    );

  // ==========================================================
  // FINAL CLINICAL RESULT
  // ==========================================================

  const assessment =
    useMemo(
      () =>
        calculateClinicalAssessment(
          vitals
        ),
      [vitals]
    );

  // ==========================================================
  // SELECT PATIENT
  // ==========================================================

  const attendPatient =
    patient => {

      setSelectedPatient(
        patient
      );

      setVitals(
        emptyVitals
      );

      setError('');

      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    };

  // ==========================================================
  // CHANGE VITAL
  // ==========================================================

  const handleChange =
    event => {

      const {
        name,
        value
      } = event.target;

      setVitals(
        previous => ({
          ...previous,
          [name]: value
        })
      );
    };

  // ==========================================================
  // SYMPTOM
  // ==========================================================

  const toggleSymptom =
    symptom => {

      setVitals(
        previous => {

          const selected =
            previous.symptoms.includes(
              symptom
            );

          return {
            ...previous,

            symptoms:
              selected
                ? previous.symptoms.filter(
                    item =>
                      item !==
                      symptom
                  )
                : [
                    ...previous.symptoms,
                    symptom
                  ]
          };
        }
      );
    };

  // ==========================================================
  // FILTER PATIENT TABLE
  // ==========================================================

  const filteredPatients =
    patients.filter(
      patient => {

        const term =
          searchTerm
            .trim()
            .toLowerCase();

        if (!term) {
          return true;
        }

        const patientId =
          String(
            getPatientId(
              patient
            )
          ).toLowerCase();

        const patientCode =
          String(
            getPatientCode(
              patient
            )
          ).toLowerCase();

        const status =
          String(
            getPatientStatus(
              patient
            )
          ).toLowerCase();

        return (
          patientId.includes(
            term
          ) ||
          patientCode.includes(
            term
          ) ||
          status.includes(
            term
          )
        );
      }
    );

  // ==========================================================
  // COMPLETE VITALS
  // ==========================================================

  const completeVitals =
    async event => {

      event.preventDefault();

      if (!selectedPatient) {
        setError(
          'Please select a patient.'
        );

        return;
      }

      if (!allVitalsComplete) {
        setError(
          'Please complete all core vital signs before continuing.'
        );

        return;
      }

      try {
        setSaving(true);
        setError('');

        const token =
          localStorage.getItem(
            'token'
          );

        const patientId =
          getPatientId(
            selectedPatient
          );

        // ====================================================
        // SAVE VITALS
        // ====================================================

        const vitalsResponse =
          await fetch(
            `${API_URL}/vitals`,
            {
              method:
                'POST',

              headers: {
                Authorization:
                  `Bearer ${token}`,

                'Content-Type':
                  'application/json'
              },

              body:
                JSON.stringify({
                  patient_id:
                    patientId,

                  temperature:
                    toNumber(
                      vitals.temperature
                    ),

                  heart_rate:
                    toNumber(
                      vitals.heartRate
                    ),

                  blood_pressure_systolic:
                    toNumber(
                      vitals.systolic
                    ),

                  blood_pressure_diastolic:
                    toNumber(
                      vitals.diastolic
                    ),

                  oxygen_saturation:
                    toNumber(
                      vitals.oxygenSaturation
                    ),

                  respiratory_rate:
                    toNumber(
                      vitals.respiratoryRate
                    ),

                  blood_glucose:
                    toNumber(
                      vitals.bloodGlucose
                    ),

                  weight:
                    toNumber(
                      vitals.weight
                    ),

                  height:
                    toNumber(
                      vitals.height
                    ),

                  pain_score:
                    toNumber(
                      vitals.painScore
                    ),

                  symptoms:
                    vitals.symptoms.join(
                      ', '
                    ),

                  notes:
                    vitals.notes,

                  risk_score:
                    assessment.riskScore,

                  risk_level:
                    assessment.status,

                  emergency:
                    assessment.emergency,

                  possible_conditions:
                    assessment
                      .chronicConditions
                      .map(
                        item =>
                          item.name
                      )
                      .join(', ')
                })
            }
          );

        const vitalsData =
          await vitalsResponse.json();

        if (
          !vitalsResponse.ok ||
          !vitalsData.success
        ) {
          throw new Error(
            vitalsData.message ||
            'Unable to save patient vitals.'
          );
        }

        // ====================================================
        // QUEUE PRIORITY
        // ====================================================

        const priority =
          assessment.emergency
            ? 'emergency'
            : 'normal';

        // ====================================================
        // AUTOMATICALLY SEND TO QUEUE
        // ====================================================

        const queueResponse =
          await fetch(
            `${API_URL}/queue`,
            {
              method:
                'POST',

              headers: {
                Authorization:
                  `Bearer ${token}`,

                'Content-Type':
                  'application/json'
              },

              body:
                JSON.stringify({
                  patient_id:
                    patientId,

                  status:
                    'waiting',

                  priority,

                  risk_score:
                    assessment.riskScore,

                  risk_level:
                    assessment.status,

                  emergency:
                    assessment.emergency,

                  source:
                    'vitals'
                })
            }
          );

        const queueData =
          await queueResponse.json();

        if (
          !queueResponse.ok ||
          !queueData.success
        ) {
          throw new Error(
            queueData.message ||
            'Vitals were saved, but the patient could not be added to the queue.'
          );
        }

        setSelectedPatient(
          null
        );

        setVitals(
          emptyVitals
        );

        navigate('/queue');

      } catch (
        saveError
      ) {

        console.error(
          'Vitals error:',
          saveError
        );

        setError(
          saveError.message ||
          'Unable to complete vitals.'
        );

      } finally {
        setSaving(false);
      }
    };

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div className="vitals-container">

      <Sidebar />

      <div className="vitals-main">

        <Header />

        <main className="vitals-content">

          <div className="vitals-page-header">

            <div>
              <h1>
                Patient Vitals
              </h1>

              <p>
                Select a patient,
                record vitals and
                complete clinical
                screening.
              </p>
            </div>

          </div>

          {error && (
            <div className="vitals-error">
              {error}
            </div>
          )}

          {/* ================================================= */}
          {/* PATIENT SELECTION */}
          {/* ================================================= */}

          {!selectedPatient && (

            <section className="vitals-panel">

              <div className="patient-table-header">

                <div>
                  <h2>
                    Select Patient
                  </h2>

                  <p>
                    Choose the patient
                    you are attending.
                  </p>
                </div>

                <input
                  type="search"
                  className="patient-search"
                  placeholder="Search patient ID..."
                  value={
                    searchTerm
                  }
                  onChange={
                    event =>
                      setSearchTerm(
                        event.target.value
                      )
                  }
                />

              </div>

              {loadingPatients ? (

                <div className="vitals-loading">
                  Loading patients...
                </div>

              ) : filteredPatients.length ===
                0 ? (

                <div className="vitals-empty">
                  No patients available.
                </div>

              ) : (

                <div className="patient-table-wrapper">

                  <table className="patient-selection-table">

                    <thead>

                      <tr>

                        <th>
                          Patient ID
                        </th>

                        <th>
                          Patient Code
                        </th>

                        <th>
                          Source
                        </th>

                        <th>
                          Status
                        </th>

                        <th>
                          Action
                        </th>

                      </tr>

                    </thead>

                    <tbody>

                      {filteredPatients.map(
                        patient => {

                          const patientId =
                            getPatientId(
                              patient
                            );

                          return (

                            <tr
                              key={
                                patientId
                              }
                            >

                              <td className="patient-id-cell">
                                {patientId}
                              </td>

                              <td>
                                {getPatientCode(
                                  patient
                                )}
                              </td>

                              <td>
                                {getPatientSource(
                                  patient
                                )}
                              </td>

                              <td>

                                <span className="patient-status-badge">

                                  {getPatientStatus(
                                    patient
                                  )}

                                </span>

                              </td>

                              <td>

                                <button
                                  type="button"
                                  className="attend-patient-button"
                                  onClick={() =>
                                    attendPatient(
                                      patient
                                    )
                                  }
                                >
                                  Attend
                                </button>

                              </td>

                            </tr>
                          );
                        }
                      )}

                    </tbody>

                  </table>

                </div>
              )}

            </section>
          )}

          {/* ================================================= */}
          {/* VITAL FORM */}
          {/* ================================================= */}

          {selectedPatient && (

            <form
              onSubmit={
                completeVitals
              }
            >

              <section className="selected-patient-bar">

                <div>

                  <span className="selected-patient-label">
                    Attending Patient
                  </span>

                  <strong>
                    {getPatientCode(
                      selectedPatient
                    )}
                  </strong>

                </div>

                <button
                  type="button"
                  className="change-patient-button"
                  onClick={() => {

                    setSelectedPatient(
                      null
                    );

                    setVitals(
                      emptyVitals
                    );
                  }}
                >
                  Change Patient
                </button>

              </section>

              {/* ============================================= */}
              {/* TEMPERATURE */}
              {/* ============================================= */}

              <VitalCard
                title="Temperature"
                status={
                  temperatureStatus
                }
              >

                <VitalInput
                  label="Temperature"
                  name="temperature"
                  value={
                    vitals.temperature
                  }
                  unit="°C"
                  step="0.1"
                  onChange={
                    handleChange
                  }
                />

              </VitalCard>

              {/* ============================================= */}
              {/* HEART RATE */}
              {/* ============================================= */}

              <VitalCard
                title="Heart Rate"
                status={
                  heartRateStatus
                }
              >

                <VitalInput
                  label="Heart Rate"
                  name="heartRate"
                  value={
                    vitals.heartRate
                  }
                  unit="BPM"
                  onChange={
                    handleChange
                  }
                />

              </VitalCard>

              {/* ============================================= */}
              {/* BLOOD PRESSURE */}
              {/* ============================================= */}

              <VitalCard
                title="Blood Pressure"
                status={
                  bpStatus
                }
              >

                <div className="two-column-input">

                  <VitalInput
                    label="Systolic"
                    name="systolic"
                    value={
                      vitals.systolic
                    }
                    unit="mmHg"
                    onChange={
                      handleChange
                    }
                  />

                  <VitalInput
                    label="Diastolic"
                    name="diastolic"
                    value={
                      vitals.diastolic
                    }
                    unit="mmHg"
                    onChange={
                      handleChange
                    }
                  />

                </div>

              </VitalCard>

              {/* ============================================= */}
              {/* OXYGEN */}
              {/* ============================================= */}

              <VitalCard
                title="Oxygen Saturation"
                status={
                  oxygenStatus
                }
              >

                <VitalInput
                  label="SpO₂"
                  name="oxygenSaturation"
                  value={
                    vitals.oxygenSaturation
                  }
                  unit="%"
                  onChange={
                    handleChange
                  }
                />

              </VitalCard>

              {/* ============================================= */}
              {/* RESPIRATORY RATE */}
              {/* ============================================= */}

              <VitalCard
                title="Respiratory Rate"
                status={
                  respiratoryStatus
                }
              >

                <VitalInput
                  label="Respiratory Rate"
                  name="respiratoryRate"
                  value={
                    vitals.respiratoryRate
                  }
                  unit="/min"
                  onChange={
                    handleChange
                  }
                />

              </VitalCard>

              {/* ============================================= */}
              {/* GLUCOSE */}
              {/* ============================================= */}

              <VitalCard
                title="Blood Glucose"
                status={
                  glucoseStatus
                }
              >

                <VitalInput
                  label="Blood Glucose"
                  name="bloodGlucose"
                  value={
                    vitals.bloodGlucose
                  }
                  unit="mmol/L"
                  step="0.1"
                  onChange={
                    handleChange
                  }
                />

              </VitalCard>

              {/* ============================================= */}
              {/* OPTIONAL MEASUREMENTS */}
              {/* ============================================= */}

              <section className="vitals-panel">

                <h2>
                  Additional Measurements
                </h2>

                <div className="three-column-input">

                  <VitalInput
                    label="Weight"
                    name="weight"
                    value={
                      vitals.weight
                    }
                    unit="kg"
                    step="0.1"
                    onChange={
                      handleChange
                    }
                  />

                  <VitalInput
                    label="Height"
                    name="height"
                    value={
                      vitals.height
                    }
                    unit="cm"
                    onChange={
                      handleChange
                    }
                  />

                  <VitalInput
                    label="Pain Score"
                    name="painScore"
                    value={
                      vitals.painScore
                    }
                    unit="/10"
                    onChange={
                      handleChange
                    }
                  />

                </div>

              </section>

              {/* ============================================= */}
              {/* SYMPTOMS */}
              {/* ============================================= */}

              <section className="vitals-panel">

                <h2>
                  Symptoms
                </h2>

                <p className="panel-description">
                  Select all symptoms
                  reported by the patient.
                </p>

                <div className="symptom-grid">

                  {symptomsList.map(
                    symptom => {

                      const selected =
                        vitals.symptoms.includes(
                          symptom
                        );

                      return (

                        <button
                          key={
                            symptom
                          }
                          type="button"
                          className={
                            selected
                              ? 'symptom-button symptom-selected'
                              : 'symptom-button'
                          }
                          onClick={() =>
                            toggleSymptom(
                              symptom
                            )
                          }
                        >
                          {selected
                            ? '✓ '
                            : ''}

                          {symptom}
                        </button>

                      );
                    }
                  )}

                </div>

              </section>

              {/* ============================================= */}
              {/* FINAL RESULT */}
              {/* ============================================= */}

              {allVitalsComplete && (

                <section className="clinical-assessment-panel">

                  <h2>
                    Final Clinical Screening
                  </h2>

                  <div
                    className={
                      assessment.emergency
                        ? 'patient-risk patient-risk-emergency'
                        : 'patient-risk patient-risk-normal'
                    }
                  >
                    {assessment.emergency
                      ? '🚨 EMERGENCY PATIENT'
                      : '✅ NORMAL / NON-EMERGENCY PATIENT'}
                  </div>

                  <p className="screening-warning">
                    Screening result only.
                    Abnormal findings and
                    possible chronic conditions
                    require clinical confirmation.
                  </p>

                  {/* ========================================= */}
                  {/* CHRONIC DISEASES */}
                  {/* ========================================= */}

                  <div className="chronic-section">

                    <h3>
                      Possible Chronic Diseases / Conditions
                    </h3>

                    {assessment
                      .chronicConditions
                      .length === 0 ? (

                      <div className="no-chronic-condition">

                        No specific chronic
                        disease screening
                        pattern has been
                        identified from the
                        information entered.

                      </div>

                    ) : (

                      <div className="chronic-condition-list">

                        {assessment
                          .chronicConditions
                          .map(
                            (
                              condition,
                              index
                            ) => (

                              <article
                                className="chronic-condition-card"
                                key={
                                  `${condition.name}-${index}`
                                }
                              >

                                <h4>
                                  {condition.name}
                                </h4>

                                <p>
                                  <strong>
                                    Why it was flagged:
                                  </strong>
                                </p>

                                <p>
                                  {condition.reason}
                                </p>

                                <div className="further-tests">

                                  <strong>
                                    Further Tests Recommended
                                  </strong>

                                  <ul>

                                    {condition.tests.map(
                                      test => (

                                        <li
                                          key={
                                            test
                                          }
                                        >
                                          {test}
                                        </li>

                                      )
                                    )}

                                  </ul>

                                </div>

                              </article>

                            )
                          )}

                      </div>
                    )}

                  </div>

                </section>
              )}

              {/* ============================================= */}
              {/* NOTES */}
              {/* ============================================= */}

              <section className="vitals-panel">

                <h2>
                  Clinical Notes
                </h2>

                <textarea
                  className="vitals-notes"
                  name="notes"
                  value={
                    vitals.notes
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Add clinical notes..."
                />

              </section>

              {/* ============================================= */}
              {/* SUBMIT */}
              {/* ============================================= */}

              <div className="vitals-actions">

                <button
                  type="submit"
                  className="complete-vitals-button"
                  disabled={
                    saving ||
                    !allVitalsComplete
                  }
                >
                  {saving
                    ? 'Saving...'
                    : 'Complete Vitals & Send to Queue'}
                </button>

              </div>

            </form>
          )}

        </main>

      </div>

    </div>
  );
}

// ============================================================
// VITAL CARD
// ============================================================

function VitalCard({
  title,
  status,
  children
}) {
  return (

    <section className="vitals-panel vital-reading-panel">

      <h2>
        {title}
      </h2>

      {children}

      {status && (

        <div
          className={
            `vital-status vital-status-${status.type}`
          }
        >

          <strong>
            {status.title}
          </strong>

          <p>
            {status.message}
          </p>

        </div>
      )}

    </section>
  );
}

// ============================================================
// VITAL INPUT
// ============================================================

function VitalInput({
  label,
  name,
  value,
  unit,
  step = '1',
  onChange
}) {
  return (

    <div className="vital-input-group">

      <label htmlFor={name}>
        {label}
      </label>

      <div className="vital-input-row">

        <input
          id={name}
          name={name}
          type="number"
          step={step}
          value={value}
          onChange={onChange}
          className="vital-input"
        />

        <span className="vital-unit">
          {unit}
        </span>

      </div>

    </div>
  );
}

export default Vitals;