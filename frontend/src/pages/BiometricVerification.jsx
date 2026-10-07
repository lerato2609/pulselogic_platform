import React, {
    useCallback,
    useEffect,
    useRef,
    useState
} from 'react';

import { useNavigate } from 'react-router-dom';
import * as faceapi from 'face-api.js';

import './styles/biometricVerification.css';

const API_URL =
    process.env.REACT_APP_API_URL ||
    'http://localhost:5000/api';

const MODEL_URL =
    `${process.env.PUBLIC_URL || ''}/models`;

function BiometricVerification() {
    const navigate = useNavigate();

    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const captureBusyRef = useRef(false);

    // Prevent login redirect after successful biometric auth.
    const authenticationCompleteRef = useRef(false);

    const [user, setUser] = useState(null);
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [statusLoading, setStatusLoading] = useState(true);
    const [faceRegistered, setFaceRegistered] = useState(false);
    const [cameraActive, setCameraActive] = useState(false);
    const [processing, setProcessing] = useState(false);

    const [status, setStatus] = useState(
        'Preparing face recognition...'
    );

    const [error, setError] = useState('');

    const biometricToken =
        sessionStorage.getItem(
            'biometricToken'
        );


    // ========================================================
    // REQUEST HEADERS
    // ========================================================

    const getHeaders =
        useCallback(() => {
            return {
                'Content-Type':
                    'application/json',

                Authorization:
                    `Bearer ${biometricToken}`
            };
        }, [
            biometricToken
        ]);


    // ========================================================
    // TEMPORARY SESSION GUARD
    // ========================================================

    useEffect(() => {
        if (
            !biometricToken &&
            !authenticationCompleteRef.current
        ) {
            console.log(
                '❌ No biometric session - returning to login'
            );

            navigate(
                '/login',
                {
                    replace: true
                }
            );
        }
    }, [
        biometricToken,
        navigate
    ]);


    // ========================================================
    // LOAD USER
    // ========================================================

    useEffect(() => {
        const storedUser =
            sessionStorage.getItem(
                'biometricUser'
            );

        if (!storedUser) {
            return;
        }

        try {
            setUser(
                JSON.parse(
                    storedUser
                )
            );
        } catch (err) {
            console.error(
                'Unable to parse biometric user:',
                err
            );

            setUser(null);
        }
    }, []);


    // ========================================================
    // LOAD FACE MODELS
    // ========================================================

    useEffect(() => {
        let mounted = true;

        const loadModels =
            async () => {
                try {
                    setError('');

                    setStatus(
                        'Loading face recognition models...'
                    );

                    await Promise.all([
                        faceapi
                            .nets
                            .tinyFaceDetector
                            .loadFromUri(
                                MODEL_URL
                            ),

                        faceapi
                            .nets
                            .faceLandmark68Net
                            .loadFromUri(
                                MODEL_URL
                            ),

                        faceapi
                            .nets
                            .faceRecognitionNet
                            .loadFromUri(
                                MODEL_URL
                            )
                    ]);

                    if (!mounted) {
                        return;
                    }

                    setModelsLoaded(
                        true
                    );

                    setStatus(
                        'Face recognition ready.'
                    );

                    console.log(
                        '✅ Face recognition models loaded'
                    );

                } catch (err) {
                    console.error(
                        '❌ Face model error:',
                        err
                    );

                    if (!mounted) {
                        return;
                    }

                    setModelsLoaded(
                        false
                    );

                    setError(
                        'Unable to load face recognition models.'
                    );

                    setStatus(
                        'Face recognition unavailable.'
                    );
                }
            };

        loadModels();

        return () => {
            mounted = false;
        };

    }, []);


    // ========================================================
    // LOAD BIOMETRIC STATUS
    // ========================================================

    useEffect(() => {
        if (!biometricToken) {
            return;
        }

        const loadStatus =
            async () => {
                try {
                    const response =
                        await fetch(
                            `${API_URL}/auth/biometric/status`,
                            {
                                method: 'GET',
                                headers:
                                    getHeaders()
                            }
                        );

                    const data =
                        await response.json();

                    console.log(
                        'Biometric status:',
                        data
                    );

                    if (!response.ok) {
                        throw new Error(
                            data?.message ||
                            'Unable to check biometric status.'
                        );
                    }

                    setFaceRegistered(
                        Boolean(
                            data.faceRegistered
                        )
                    );

                    setStatus(
                        'Start the camera, then choose Register Face or Verify Face.'
                    );

                } catch (err) {
                    console.error(
                        'Biometric status error:',
                        err
                    );

                    setError(
                        err?.message ||
                        'Unable to check biometric status.'
                    );

                } finally {
                    setStatusLoading(
                        false
                    );
                }
            };

        loadStatus();

    }, [
        biometricToken,
        getHeaders
    ]);


    // ========================================================
    // STOP CAMERA
    // ========================================================

    const stopCamera =
        useCallback(() => {
            if (
                streamRef.current
            ) {
                streamRef.current
                    .getTracks()
                    .forEach(
                        (track) => {
                            track.stop();
                        }
                    );

                streamRef.current =
                    null;
            }

            if (
                videoRef.current
            ) {
                videoRef.current.srcObject =
                    null;
            }

            setCameraActive(
                false
            );
        }, []);


    // ========================================================
    // STOP CAMERA WITHOUT STATE CHANGE
    // ========================================================

    const stopCameraSilently =
        useCallback(() => {
            if (
                streamRef.current
            ) {
                streamRef.current
                    .getTracks()
                    .forEach(
                        (track) => {
                            track.stop();
                        }
                    );

                streamRef.current =
                    null;
            }

            if (
                videoRef.current
            ) {
                videoRef.current.srcObject =
                    null;
            }
        }, []);


    // ========================================================
    // START CAMERA
    // ========================================================

    const startCamera =
        useCallback(async () => {
            setError('');

            if (!modelsLoaded) {
                setError(
                    'Face recognition models are still loading.'
                );

                return false;
            }

            try {
                stopCamera();

                const stream =
                    await navigator
                        .mediaDevices
                        .getUserMedia({
                            video: {
                                width: {
                                    ideal: 640
                                },

                                height: {
                                    ideal: 480
                                },

                                facingMode:
                                    'user'
                            },

                            audio:
                                false
                        });

                streamRef.current =
                    stream;

                const video =
                    videoRef.current;

                if (!video) {
                    throw new Error(
                        'Video element is unavailable.'
                    );
                }

                video.srcObject =
                    stream;

                await video.play();

                let attempts =
                    0;

                while (
                    (
                        !video.videoWidth ||
                        !video.videoHeight
                    ) &&
                    attempts < 30
                ) {
                    await new Promise(
                        (resolve) =>
                            setTimeout(
                                resolve,
                                50
                            )
                    );

                    attempts++;
                }

                if (
                    !video.videoWidth ||
                    !video.videoHeight
                ) {
                    throw new Error(
                        'Camera is not ready.'
                    );
                }

                setCameraActive(
                    true
                );

                setStatus(
                    'Camera ready. Choose Register Face or Verify Face.'
                );

                console.log(
                    '📷 Camera started:',
                    video.videoWidth,
                    'x',
                    video.videoHeight
                );

                return true;

            } catch (err) {
                console.error(
                    '❌ Camera error:',
                    err
                );

                setCameraActive(
                    false
                );

                setError(
                    'Unable to access the camera. Please allow camera permission.'
                );

                return false;
            }
        }, [
            modelsLoaded,
            stopCamera
        ]);


    // ========================================================
    // VALIDATE DETECTION
    // ========================================================

    const validateDetection =
        useCallback(
            (detection) => {
                if (!detection) {
                    return false;
                }

                const landmarks =
                    detection?.landmarks;

                const descriptor =
                    detection?.descriptor;

                if (
                    !landmarks ||
                    !descriptor
                ) {
                    return false;
                }

                const points =
                    landmarks.positions;

                if (
                    !Array.isArray(
                        points
                    ) ||
                    points.length !== 68
                ) {
                    return false;
                }

                const values =
                    Array.from(
                        descriptor
                    );

                if (
                    values.length !== 128
                ) {
                    return false;
                }

                return values.every(
                    (value) =>
                        Number.isFinite(
                            Number(value)
                        )
                );
            },
            []
        );


    // ========================================================
    // CAPTURE FACE
    // ========================================================

    const captureFace =
        useCallback(async () => {
            if (
                captureBusyRef.current
            ) {
                throw new Error(
                    'Face capture already in progress.'
                );
            }

            const video =
                videoRef.current;

            if (
                !video ||
                video.readyState < 2 ||
                video.videoWidth <= 0 ||
                video.videoHeight <= 0
            ) {
                throw new Error(
                    'Camera is not ready.'
                );
            }

            captureBusyRef.current =
                true;

            try {
                const detections =
                    await faceapi
                        .detectAllFaces(
                            video,

                            new faceapi
                                .TinyFaceDetectorOptions({
                                    inputSize: 224,
                                    scoreThreshold: 0.4
                                })
                        )
                        .withFaceLandmarks()
                        .withFaceDescriptors();

                console.log(
                    '📸 Faces detected:',
                    detections.length
                );

                if (
                    detections.length === 0
                ) {
                    throw new Error(
                        'No face detected. Look directly at the camera.'
                    );
                }

                if (
                    detections.length > 1
                ) {
                    throw new Error(
                        'More than one face detected.'
                    );
                }

                const detection =
                    detections[0];

                if (
                    !validateDetection(
                        detection
                    )
                ) {
                    throw new Error(
                        'Unable to capture a valid face.'
                    );
                }

                return Array.from(
                    detection.descriptor
                );

            } finally {
                captureBusyRef.current =
                    false;
            }
        }, [
            validateDetection
        ]);


    // ========================================================
    // COMPLETE AUTHENTICATION
    // ========================================================

    const completeLogin =
        useCallback(
            (data) => {
                console.log(
                    '🔐 Completing login:',
                    data
                );

                if (!data?.token) {
                    throw new Error(
                        'Final authentication token was not returned.'
                    );
                }

                /*
                 * IMPORTANT:
                 * Prevent the biometric session guard
                 * from sending us back to /login.
                 */
                authenticationCompleteRef.current =
                    true;


                // --------------------------------------------
                // SAVE FINAL AUTH TOKEN
                // --------------------------------------------

                localStorage.setItem(
                    'token',
                    data.token
                );

                localStorage.setItem(
                    'authToken',
                    data.token
                );


                if (data.user) {
                    localStorage.setItem(
                        'user',
                        JSON.stringify(
                            data.user
                        )
                    );
                }


                const savedToken =
                    localStorage.getItem(
                        'token'
                    );

                const savedAuthToken =
                    localStorage.getItem(
                        'authToken'
                    );


                console.log(
                    '✅ Final token saved:',
                    Boolean(savedToken)
                );

                console.log(
                    '✅ authToken saved:',
                    Boolean(
                        savedAuthToken
                    )
                );


                if (
                    !savedToken &&
                    !savedAuthToken
                ) {
                    throw new Error(
                        'Unable to save final login token.'
                    );
                }


                // --------------------------------------------
                // STOP CAMERA WITHOUT SETSTATE
                // --------------------------------------------

                stopCameraSilently();


                // --------------------------------------------
                // GO TO DASHBOARD FIRST
                // --------------------------------------------

                console.log(
                    '➡️ Going to dashboard'
                );

                navigate(
                    '/dashboard',
                    {
                        replace: true
                    }
                );


                // --------------------------------------------
                // REMOVE TEMPORARY SESSION AFTER SUCCESS
                // --------------------------------------------

                sessionStorage.removeItem(
                    'biometricToken'
                );

                sessionStorage.removeItem(
                    'biometricUser'
                );

                sessionStorage.removeItem(
                    'biometricStatus'
                );
            },
            [
                navigate,
                stopCameraSilently
            ]
        );


    // ========================================================
    // REGISTER FACE
    // ========================================================

    const registerFace =
        async () => {
            if (processing) {
                return;
            }

            setProcessing(
                true
            );

            setError('');

            try {
                if (!cameraActive) {
                    const started =
                        await startCamera();

                    if (!started) {
                        return;
                    }
                }

                setStatus(
                    'Capturing face...'
                );

                const embedding =
                    await captureFace();

                setStatus(
                    'Registering face...'
                );

                const response =
                    await fetch(
                        `${API_URL}/auth/biometric/face/enroll`,
                        {
                            method:
                                'POST',

                            headers:
                                getHeaders(),

                            body:
                                JSON.stringify({
                                    embedding
                                })
                        }
                    );

                const data =
                    await response.json();

                console.log(
                    '✅ Registration response:',
                    data
                );

                if (!response.ok) {
                    throw new Error(
                        data?.message ||
                        'Face registration failed.'
                    );
                }

                if (
                    !data.success ||
                    !data.token
                ) {
                    throw new Error(
                        'Face registered but login token was not returned.'
                    );
                }

                setFaceRegistered(
                    true
                );

                setStatus(
                    'Face registered. Access granted.'
                );

                completeLogin(
                    data
                );

            } catch (err) {
                console.error(
                    '❌ Registration error:',
                    err
                );

                setStatus(
                    'Face registration failed.'
                );

                setError(
                    err?.message ||
                    'Unable to register face.'
                );

            } finally {
                setProcessing(
                    false
                );
            }
        };


    // ========================================================
    // VERIFY FACE
    // ========================================================

    const verifyFace =
        async () => {
            if (processing) {
                return;
            }

            setProcessing(
                true
            );

            setError('');

            try {
                setStatus(
                    'Capturing face...'
                );

                const embedding =
                    await captureFace();

                setStatus(
                    'Verifying face...'
                );

                const response =
                    await fetch(
                        `${API_URL}/auth/biometric/face/verify`,
                        {
                            method:
                                'POST',

                            headers:
                                getHeaders(),

                            body:
                                JSON.stringify({
                                    embedding
                                })
                        }
                    );

                const data =
                    await response.json();

                console.log(
                    '✅ Verification response:',
                    data
                );

                if (!response.ok) {
                    throw new Error(
                        data?.message ||
                        'ACCESS DENIED'
                    );
                }

                if (
                    !data.success ||
                    !data.verified
                ) {
                    throw new Error(
                        data?.message ||
                        'ACCESS DENIED'
                    );
                }

                if (!data.token) {
                    throw new Error(
                        'Face verified but final login token was not returned.'
                    );
                }

                setStatus(
                    'Face verified. Access granted.'
                );

                completeLogin(
                    data
                );

            } catch (err) {
                console.error(
                    '❌ Face verification error:',
                    err
                );

                setStatus(
                    'Face verification failed.'
                );

                setError(
                    err?.message ||
                    'ACCESS DENIED'
                );

            } finally {
                setProcessing(
                    false
                );
            }
        };


    // ========================================================
    // CANCEL
    // ========================================================

    const cancelLogin =
        () => {
            authenticationCompleteRef.current =
                false;

            stopCamera();

            sessionStorage.removeItem(
                'biometricToken'
            );

            sessionStorage.removeItem(
                'biometricUser'
            );

            sessionStorage.removeItem(
                'biometricStatus'
            );

            localStorage.removeItem(
                'token'
            );

            localStorage.removeItem(
                'authToken'
            );

            navigate(
                '/login',
                {
                    replace: true
                }
            );
        };


    // ========================================================
    // CLEANUP
    // ========================================================

    useEffect(() => {
        return () => {
            if (
                streamRef.current
            ) {
                streamRef.current
                    .getTracks()
                    .forEach(
                        (track) => {
                            track.stop();
                        }
                    );
            }
        };
    }, []);


    // ========================================================
    // LOADING
    // ========================================================

    if (statusLoading) {
        return (
            <div className="biometric-loading">
                Checking face registration...
            </div>
        );
    }


    // ========================================================
    // PAGE
    // ========================================================

    return (
        <div className="biometric-page">

            <div className="biometric-card">

                <header className="biometric-header">

                    <div className="biometric-logo">
                        ❤️
                    </div>

                    <h1>
                        Face Verification
                    </h1>

                    <p>
                        Welcome{' '}
                        {
                            user?.first_name ||
                            user?.email ||
                            ''
                        }
                    </p>

                </header>


                <div className="biometric-status">
                    {status}
                </div>


                {error && (
                    <div className="biometric-error">
                        {error}
                    </div>
                )}


                <div className="camera-container">

                    <video
                        ref={videoRef}
                        autoPlay
                        muted
                        playsInline
                        className="camera-video"
                    />


                    {!cameraActive && (
                        <div className="camera-placeholder">

                            <div className="camera-placeholder-icon">
                                📷
                            </div>

                            <p>
                                Camera is off
                            </p>

                        </div>
                    )}

                </div>


                {!cameraActive && (
                    <button
                        type="button"
                        className="biometric-primary"
                        onClick={startCamera}
                        disabled={
                            !modelsLoaded ||
                            processing
                        }
                    >
                        {
                            modelsLoaded
                                ? 'Start Camera'
                                : 'Loading Face Recognition...'
                        }
                    </button>
                )}


                {cameraActive && (
                    <div className="biometric-choice-buttons">

                        <button
                            type="button"
                            className="biometric-primary"
                            onClick={
                                registerFace
                            }
                            disabled={
                                processing
                            }
                        >
                            Register Face
                        </button>


                        <button
                            type="button"
                            className="biometric-primary"
                            onClick={
                                verifyFace
                            }
                            disabled={
                                processing
                            }
                        >
                            Verify Face
                        </button>

                    </div>
                )}


                {cameraActive && (
                    <button
                        type="button"
                        className="biometric-secondary"
                        onClick={
                            stopCamera
                        }
                        disabled={
                            processing
                        }
                    >
                        Stop Camera
                    </button>
                )}


                <button
                    type="button"
                    className="biometric-cancel"
                    onClick={
                        cancelLogin
                    }
                    disabled={
                        processing
                    }
                >
                    Cancel and return to login
                </button>

            </div>

        </div>
    );
}

export default BiometricVerification;