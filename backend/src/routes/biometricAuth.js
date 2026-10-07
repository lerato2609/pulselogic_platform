const express = require('express');
const jwt = require('jsonwebtoken');

const router = express.Router();

const db = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error(
        'JWT_SECRET is missing from backend .env'
    );
}


// ============================================================
// DATABASE RESULT NORMALIZER
// ============================================================

function normalizeRows(result) {
    if (!result) {
        return [];
    }

    // mysql2/promise:
    // [rows, fields]
    if (
        Array.isArray(result) &&
        Array.isArray(result[0])
    ) {
        return result[0];
    }

    // Custom wrapper returning rows directly
    if (Array.isArray(result)) {
        return result;
    }

    // { rows: [...] }
    if (
        result &&
        Array.isArray(result.rows)
    ) {
        return result.rows;
    }

    // { results: [...] }
    if (
        result &&
        Array.isArray(result.results)
    ) {
        return result.results;
    }

    return [];
}


// ============================================================
// VERIFY TEMPORARY BIOMETRIC TOKEN
// ============================================================

function verifyBiometricToken(
    req,
    res,
    next
) {
    try {
        const authHeader =
            req.headers.authorization;

        if (
            !authHeader ||
            !authHeader.startsWith('Bearer ')
        ) {
            return res.status(401).json({
                success: false,
                message:
                    'Biometric session token required.'
            });
        }

        const token =
            authHeader.substring(7);

        const decoded =
            jwt.verify(
                token,
                JWT_SECRET
            );

        if (
            decoded.purpose !==
            'biometric_verification'
        ) {
            return res.status(401).json({
                success: false,
                message:
                    'Invalid biometric session.'
            });
        }

        if (!decoded.userId) {
            return res.status(401).json({
                success: false,
                message:
                    'Biometric session does not contain a user ID.'
            });
        }

        req.biometricUser =
            decoded;

        next();

    } catch (error) {
        console.error(
            '❌ Biometric token error:',
            error.message
        );

        return res.status(401).json({
            success: false,
            message:
                'Biometric session expired. Please login again.'
        });
    }
}


// ============================================================
// VALIDATE FACE EMBEDDING
// ============================================================

function validEmbedding(embedding) {
    if (!Array.isArray(embedding)) {
        return false;
    }

    if (embedding.length !== 128) {
        return false;
    }

    return embedding.every(
        (value) =>
            Number.isFinite(
                Number(value)
            )
    );
}


// ============================================================
// EUCLIDEAN DISTANCE
// ============================================================

function calculateDistance(
    first,
    second
) {
    if (
        !Array.isArray(first) ||
        !Array.isArray(second) ||
        first.length !== second.length
    ) {
        return Infinity;
    }

    let total = 0;

    for (
        let index = 0;
        index < first.length;
        index++
    ) {
        const difference =
            Number(first[index]) -
            Number(second[index]);

        total +=
            difference * difference;
    }

    return Math.sqrt(total);
}


// ============================================================
// CREATE FINAL LOGIN TOKEN
// ============================================================

function createFinalToken(
    biometricUser
) {
    return jwt.sign(
        {
            userId:
                biometricUser.userId,

            email:
                biometricUser.email,

            role:
                biometricUser.role || null,

            biometricVerified:
                true,

            purpose:
                'authenticated'
        },

        JWT_SECRET,

        {
            expiresIn: '8h'
        }
    );
}


// ============================================================
// STATUS
// GET /api/auth/biometric/status
// ============================================================

router.get(
    '/status',

    verifyBiometricToken,

    async (req, res) => {
        try {
            const userId =
                req.biometricUser.userId;

            console.log(
                '🔎 Checking biometric status for user:',
                userId
            );

            const result =
                await db.query(
                    `
                    SELECT
                        face_registered,
                        fingerprint_registered
                    FROM user_biometrics
                    WHERE user_id = ?
                    LIMIT 1
                    `,
                    [userId]
                );

            const rows =
                normalizeRows(result);

            console.log(
                '🔎 Biometric rows found:',
                rows.length
            );

            if (rows.length === 0) {
                return res.status(200).json({
                    success: true,
                    faceRegistered: false,
                    fingerprintRegistered: false
                });
            }

            return res.status(200).json({
                success: true,

                faceRegistered:
                    Boolean(
                        rows[0]
                            .face_registered
                    ),

                fingerprintRegistered:
                    Boolean(
                        rows[0]
                            .fingerprint_registered
                    )
            });

        } catch (error) {
            console.error(
                '❌ Biometric status error:',
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    'Unable to get biometric status.'
            });
        }
    }
);


// ============================================================
// FACE ENROLLMENT
// POST /api/auth/biometric/face/enroll
// ============================================================

router.post(
    '/face/enroll',

    verifyBiometricToken,

    async (req, res) => {
        try {
            const userId =
                req.biometricUser.userId;

            const {
                embedding
            } = req.body;

            if (
                !validEmbedding(
                    embedding
                )
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        'Invalid face embedding.'
                });
            }

            await db.query(
                `
                INSERT INTO user_biometrics (
                    user_id,
                    face_embedding,
                    face_registered,
                    face_registered_at
                )

                VALUES (
                    ?,
                    ?,
                    TRUE,
                    NOW()
                )

                ON DUPLICATE KEY UPDATE
                    face_embedding =
                        VALUES(face_embedding),

                    face_registered =
                        TRUE,

                    face_registered_at =
                        NOW(),

                    updated_at =
                        CURRENT_TIMESTAMP
                `,
                [
                    userId,
                    JSON.stringify(
                        embedding
                    )
                ]
            );

            console.log(
                '✅ Face registered for user:',
                userId
            );

            const finalToken =
                createFinalToken(
                    req.biometricUser
                );

            return res.status(200).json({
                success: true,

                verified: true,

                faceRegistered: true,

                message:
                    'Face registered successfully.',

                token:
                    finalToken,

                user: {
                    id:
                        userId,

                    email:
                        req.biometricUser.email,

                    role:
                        req.biometricUser.role ||
                        null
                }
            });

        } catch (error) {
            console.error(
                '❌ Face enrollment error:',
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    'Unable to register face.'
            });
        }
    }
);


// ============================================================
// FACE VERIFICATION
// POST /api/auth/biometric/face/verify
// ============================================================

router.post(
    '/face/verify',

    verifyBiometricToken,

    async (req, res) => {
        try {
            const userId =
                req.biometricUser.userId;

            const {
                embedding
            } = req.body;

            if (
                !validEmbedding(
                    embedding
                )
            ) {
                return res.status(400).json({
                    success: false,
                    verified: false,
                    message:
                        'Invalid face embedding.'
                });
            }

            const result =
                await db.query(
                    `
                    SELECT
                        face_embedding,
                        face_registered
                    FROM user_biometrics
                    WHERE user_id = ?
                    LIMIT 1
                    `,
                    [userId]
                );

            const rows =
                normalizeRows(result);

            if (
                rows.length === 0 ||
                !Boolean(
                    rows[0]
                        .face_registered
                )
            ) {
                return res.status(404).json({
                    success: false,
                    verified: false,
                    message:
                        'No registered face found.'
                });
            }

            let storedEmbedding =
                rows[0]
                    .face_embedding;

            if (
                typeof storedEmbedding ===
                'string'
            ) {
                storedEmbedding =
                    JSON.parse(
                        storedEmbedding
                    );
            }

            if (
                !validEmbedding(
                    storedEmbedding
                )
            ) {
                console.error(
                    '❌ Stored face embedding invalid'
                );

                return res.status(500).json({
                    success: false,
                    verified: false,
                    message:
                        'Stored face embedding is invalid.'
                });
            }

            const distance =
                calculateDistance(
                    storedEmbedding,
                    embedding
                );

            console.log(
                `📸 Face distance for user ${userId}:`,
                distance
            );

            const FACE_THRESHOLD =
                0.50;

            if (
                !Number.isFinite(
                    distance
                ) ||
                distance >
                    FACE_THRESHOLD
            ) {
                console.log(
                    '❌ ACCESS DENIED'
                );

                return res.status(403).json({
                    success: false,
                    verified: false,
                    message:
                        'ACCESS DENIED: Face does not match registered user.',
                    distance
                });
            }

            const finalToken =
                createFinalToken(
                    req.biometricUser
                );

            console.log(
                '✅ FACE VERIFIED - ACCESS GRANTED'
            );

            return res.status(200).json({
                success: true,

                verified: true,

                message:
                    'Identity verified.',

                token:
                    finalToken,

                distance,

                user: {
                    id:
                        userId,

                    email:
                        req.biometricUser.email,

                    role:
                        req.biometricUser.role ||
                        null
                }
            });

        } catch (error) {
            console.error(
                '❌ Face verification error:',
                error
            );

            return res.status(500).json({
                success: false,
                verified: false,
                message:
                    'Unable to verify face.'
            });
        }
    }
);


// ============================================================
// EXPORT
// ============================================================

module.exports = router;