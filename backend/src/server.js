// backend/src/server.js

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

require('dotenv').config();

const app = express();

const PORT = process.env.PORT || 5000;


// ============================================================
// MIDDLEWARE
// ============================================================

app.use(
    helmet({
        crossOriginResourcePolicy: {
            policy: 'cross-origin'
        }
    })
);


app.use(
    cors({
        origin: [
            process.env.FRONTEND_URL || 'http://localhost:3000',
            'http://localhost:3000',
            'http://localhost:5000'
        ],

        credentials: true,

        methods: [
            'GET',
            'POST',
            'PUT',
            'DELETE',
            'PATCH',
            'OPTIONS'
        ],

        allowedHeaders: [
            'Content-Type',
            'Authorization'
        ]
    })
);


app.use(
    morgan('dev')
);


app.use(
    express.json({
        limit: '10mb'
    })
);


app.use(
    express.urlencoded({
        extended: true,
        limit: '10mb'
    })
);


// ============================================================
// RATE LIMITING
// ============================================================

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,

    max: 1000,

    standardHeaders: true,

    legacyHeaders: false,

    message: {
        success: false,
        message:
            'Too many requests from this IP. Please try again later.'
    }
});


app.use(
    '/api',
    limiter
);


// ============================================================
// DATABASE
// ============================================================

const db = require('./config/db');

if (!db) {
    console.error(
        'Database module failed to load.'
    );
}


// ============================================================
// ROUTE LOADER
// ============================================================

const loadRoute = (
    mountPath,
    routePath
) => {
    try {

        const route = require(routePath);

        app.use(
            mountPath,
            route
        );

        console.log(
            'Loaded route: ' + mountPath
        );

        return true;

    } catch (error) {

        console.error(
            'Failed to load route: ' + mountPath
        );

        console.error(
            'File: ' + routePath
        );

        console.error(
            'Error: ' + error.message
        );

        if (
            process.env.NODE_ENV ===
            'development'
        ) {
            console.error(
                error.stack
            );
        }

        return false;
    }
};


// ============================================================
// AUTHENTICATION
// ============================================================

// POST /api/auth/login

loadRoute(
    '/api/auth',
    './routes/auth'
);


// ============================================================
// BIOMETRICS
// ============================================================

// GET  /api/auth/biometric/status
// POST /api/auth/biometric/face/enroll
// POST /api/auth/biometric/face/verify

loadRoute(
    '/api/auth/biometric',
    './routes/biometricAuth'
);


// ============================================================
// PATIENTS
// ============================================================

loadRoute(
    '/api/patients',
    './routes/patients'
);


// ============================================================
// APPOINTMENTS
// ============================================================

loadRoute(
    '/api/appointments',
    './routes/appointments'
);


// ============================================================
// QUEUE
// ============================================================

loadRoute(
    '/api/queue',
    './routes/queue'
);


// ============================================================
// MATERNITY
// ============================================================

loadRoute(
    '/api/maternity',
    './routes/maternity'
);


// ============================================================
// REPORTS
// ============================================================

loadRoute(
    '/api/reports',
    './routes/reports'
);


// ============================================================
// FACILITIES
// ============================================================

loadRoute(
    '/api/facilities',
    './routes/facilities'
);


// ============================================================
// USERS
// ============================================================

loadRoute(
    '/api/users',
    './routes/users'
);


// ============================================================
// VITALS
// ============================================================

loadRoute(
    '/api/vitals',
    './routes/vitals'
);


// ============================================================
// DASHBOARD
// ============================================================

loadRoute(
    '/api/dashboard',
    './routes/dashboard'
);


// ============================================================
// LAB
// ============================================================

loadRoute(
    '/api/lab',
    './routes/lab'
);


// ============================================================
// MEDICATIONS
// ============================================================

loadRoute(
    '/api/medications',
    './routes/medications'
);


// ============================================================
// REMINDERS
// ============================================================

loadRoute(
    '/api/reminders',
    './routes/reminders'
);


// ============================================================
// HEALTH CHECK
// ============================================================

app.get(
    '/api/health',
    (req, res) => {

        res.status(200).json({
            success: true,

            status:
                'OK',

            timestamp:
                new Date().toISOString(),

            uptime:
                process.uptime(),

            environment:
                process.env.NODE_ENV ||
                'development'
        });
    }
);


// ============================================================
// API ROOT
// ============================================================

app.get(
    '/api',
    (req, res) => {

        res.status(200).json({
            success: true,

            message:
                'PulseLogic Health API is running',

            endpoints: {
                health:
                    '/api/health',

                login:
                    '/api/auth/login',

                biometricStatus:
                    '/api/auth/biometric/status',

                faceEnroll:
                    '/api/auth/biometric/face/enroll',

                faceVerify:
                    '/api/auth/biometric/face/verify'
            }
        });
    }
);


// ============================================================
// 404 HANDLER
// ============================================================

app.use(
    (req, res) => {

        const routeMessage =
            'Route not found: ' +
            req.method +
            ' ' +
            req.originalUrl;

        console.warn(
            routeMessage
        );

        res.status(404).json({
            success: false,
            message: routeMessage
        });
    }
);


// ============================================================
// GLOBAL ERROR HANDLER
// ============================================================

app.use(
    (
        err,
        req,
        res,
        next
    ) => {

        console.error(
            'Server error:',
            err
        );

        if (
            res.headersSent
        ) {
            return next(
                err
            );
        }

        const response = {
            success: false,

            message:
                err.message ||
                'Internal server error'
        };

        if (
            process.env.NODE_ENV ===
            'development'
        ) {
            response.stack =
                err.stack;
        }

        return res
            .status(
                err.status ||
                500
            )
            .json(
                response
            );
    }
);


// ============================================================
// START SERVER
// ============================================================

app.listen(
    PORT,
    () => {

        console.log(
            'PulseLogic Health Server Running'
        );

        console.log(
            'Port: ' + PORT
        );

        console.log(
            'API: http://localhost:' +
            PORT +
            '/api'
        );

        console.log(
            'Health: http://localhost:' +
            PORT +
            '/api/health'
        );

        console.log(
            'Login: http://localhost:' +
            PORT +
            '/api/auth/login'
        );

        console.log(
            'Biometrics: http://localhost:' +
            PORT +
            '/api/auth/biometric'
        );
    }
);


// ============================================================
// EXPORT
// ============================================================

module.exports = app;