const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const router = express.Router();

const db = require('../config/db');

const JWT_SECRET =
    process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error(
        'JWT_SECRET is missing from backend .env'
    );
}


function normalizeRows(result) {
    if (!result) {
        return [];
    }

    if (
        Array.isArray(result) &&
        Array.isArray(result[0])
    ) {
        return result[0];
    }

    if (Array.isArray(result)) {
        return result;
    }

    if (Array.isArray(result.rows)) {
        return result.rows;
    }

    if (
        Array.isArray(
            result.results
        )
    ) {
        return result.results;
    }

    return [];
}


function getUserId(user) {
    return (
        user?.user_id ??
        user?.id ??
        user?.userId ??
        null
    );
}


function safeUser(user) {
    return {
        id:
            getUserId(user),

        email:
            user?.email ?? '',

        first_name:
            user?.first_name ??
            user?.firstName ??
            '',

        last_name:
            user?.last_name ??
            user?.lastName ??
            '',

        role:
            user?.role ??
            null
    };
}


router.post(
    '/login',

    async (req, res) => {
        try {
            const {
                email,
                password
            } = req.body;

            console.log(
                '📸 Login attempt:',
                email
            );

            if (
                !email ||
                !password
            ) {
                return res.status(400).json({
                    success: false,

                    message:
                        'Email and password are required.'
                });
            }

            const cleanEmail =
                String(email)
                    .trim()
                    .toLowerCase();

            const queryResult =
                await db.query(
                    'SELECT * FROM users WHERE LOWER(email) = ? LIMIT 1',
                    [
                        cleanEmail
                    ]
                );

            const rows =
                normalizeRows(
                    queryResult
                );

            console.log(
                '🔎 Users found:',
                rows.length
            );

            if (!rows.length) {
                console.log(
                    '❌ User not found:',
                    cleanEmail
                );

                return res.status(401).json({
                    success: false,

                    message:
                        'Invalid email or password.'
                });
            }

            const user =
                rows[0];

            console.log(
                '📸 User found:',
                user.email
            );

            const passwordHash =
                user.password_hash ??
                user.password ??
                user.passwordHash;

            if (!passwordHash) {
                return res.status(500).json({
                    success: false,

                    message:
                        'User password is not configured correctly.'
                });
            }

            const passwordMatch =
                await bcrypt.compare(
                    password,
                    passwordHash
                );

            console.log(
                '📸 Password match:',
                passwordMatch
            );

            if (!passwordMatch) {
                return res.status(401).json({
                    success: false,

                    message:
                        'Invalid email or password.'
                });
            }

            const userId =
                getUserId(user);

            if (!userId) {
                return res.status(500).json({
                    success: false,

                    message:
                        'User ID is missing.'
                });
            }

            let faceRegistered =
                false;

            let fingerprintRegistered =
                false;

            try {
                const biometricResult =
                    await db.query(
                        `
                        SELECT
                            face_registered,
                            fingerprint_registered
                        FROM user_biometrics
                        WHERE user_id = ?
                        LIMIT 1
                        `,
                        [
                            userId
                        ]
                    );

                const biometricRows =
                    normalizeRows(
                        biometricResult
                    );

                if (
                    biometricRows.length >
                    0
                ) {
                    faceRegistered =
                        Boolean(
                            biometricRows[0]
                                .face_registered
                        );

                    fingerprintRegistered =
                        Boolean(
                            biometricRows[0]
                                .fingerprint_registered
                        );
                }

            } catch (error) {
                console.warn(
                    '⚠️ Unable to read biometric status:',
                    error.message
                );
            }

            const temporaryToken =
                jwt.sign(
                    {
                        userId,

                        email:
                            user.email,

                        role:
                            user.role ??
                            null,

                        purpose:
                            'biometric_verification'
                    },

                    JWT_SECRET,

                    {
                        expiresIn:
                            '10m'
                    }
                );

            console.log(
                '✅ Password verified for:',
                user.email
            );

            console.log(
                '🔐 Biometric verification required'
            );

            console.log(
                '   Face registered:',
                faceRegistered
            );

            return res.status(200).json({
                success: true,

                requiresBiometric:
                    true,

                temporaryToken,

                biometricStatus: {
                    faceRegistered,
                    fingerprintRegistered
                },

                user:
                    safeUser(user)
            });

        } catch (error) {
            console.error(
                '❌ Login error:',
                error
            );

            return res.status(500).json({
                success: false,

                message:
                    'Internal server error during login.'
            });
        }
    }
);


router.get(
    '/status',

    (req, res) => {
        res.json({
            success: true,

            message:
                'PulseLogic authentication API is running.'
        });
    }
);


module.exports = router;