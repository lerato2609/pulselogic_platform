// backend/create-users-with-first-login.js
const { db } = require('./src/config/db');
const bcrypt = require('bcryptjs');

async function createUsers() {
    const password = 'Pulse@2026';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const users = [
        ['admin@pl.com', hashedPassword, 'System Admin', 'admin', '0123456789', 0],
        ['doctor@pl.com', hashedPassword, 'Dr. John Doe', 'doctor', '0123456780', 1],
        ['nurse@pl.com', hashedPassword, 'Nurse Jane', 'nurse', '0123456781', 1],
        ['reception@pl.com', hashedPassword, 'Receptionist', 'reception', '0123456782', 1],
        ['pharma@pl.com', hashedPassword, 'Pharmacist', 'pharmacist', '0123456783', 1],
        ['patient@pl.com', hashedPassword, 'Patient John', 'patient', '0123456784', 1],
        ['test@pl.com', hashedPassword, 'Test User', 'doctor', '0821234567', 1]
    ];
    
    console.log('🔑 Creating users with first-time login flags...\n');
    
    for (const user of users) {
        try {
            await db.query(`
                INSERT INTO users (email, password_hash, full_name, role, phone, is_first_login, status) 
                VALUES (?, ?, ?, ?, ?, ?, 'active')
                ON DUPLICATE KEY UPDATE 
                    password_hash = VALUES(password_hash),
                    is_first_login = VALUES(is_first_login)
            `, user);
            console.log(`✅ ${user[0]} (First login: ${user[5] === 1 ? 'Yes' : 'No'})`);
        } catch (error) {
            console.error(`❌ Error creating ${user[0]}:`, error.message);
        }
    }
    
    console.log('\n🎉 All users created!');
    console.log('📋 Default password: Pulse@2026');
    console.log('🔑 Users with is_first_login = 1 will be prompted to change password\n');
    console.log('📧 Test Users:');
    console.log('   👤 Admin: admin@pl.com (No first login)');
    console.log('   👨‍⚕️ Doctor: doctor@pl.com (First login - will prompt for new password)');
    console.log('   👩‍⚕️ Nurse: nurse@pl.com (First login - will prompt for new password)');
    console.log('   🧑 Test: test@pl.com (First login - will prompt for new password)');
}

createUsers();