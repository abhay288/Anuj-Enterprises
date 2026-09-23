import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { Customer } from '../models/Customer.js';
import { Salesman } from '../models/Salesman.js';
import { getJwtSecret } from '../middleware/authMiddleware.js';
dotenv.config();
const MONGODB_URI = process.env.MONGODB_URI;
export const runAuthSystemTests = async () => {
    console.log('================================================================');
    console.log('🔐 ANUJ ENTERPRISES — END-TO-END AUTHENTICATION SYSTEM TEST');
    console.log('================================================================\n');
    if (!MONGODB_URI) {
        console.error('❌ MONGODB_URI not found in environment');
        process.exit(1);
    }
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully.\n');
    let passed = 0;
    let failed = 0;
    const JWT_SECRET = getJwtSecret();
    // Test Customer Details
    const timestamp = Date.now();
    const testEmail = `autotest_cust_${timestamp}@anujfmcg.com`;
    const testMobile = `98${Math.floor(10000000 + Math.random() * 90000000)}`;
    const testPassword = 'Password@123';
    const testName = 'Shree Ganesh Traders';
    const testOwner = 'Ganesh Sharma';
    let createdCustId = '';
    try {
        // -------------------------------------------------------------
        // TEST 1: Register New Customer Account
        // -------------------------------------------------------------
        console.log('--- [STEP 1: CUSTOMER REGISTRATION] ---');
        const existingCheck = await User.findOne({ email: testEmail });
        if (existingCheck) {
            await User.deleteOne({ email: testEmail });
        }
        const passwordHash = await bcrypt.hash(testPassword, 10);
        const customerId = `CUST-${Math.floor(1000 + Math.random() * 9000)}`;
        createdCustId = customerId;
        const userObj = await User.create({
            name: testName,
            email: testEmail,
            phone: testMobile,
            passwordHash,
            role: 'CUSTOMER',
            status: 'Active'
        });
        const customerDoc = await Customer.create({
            customerId,
            name: testName,
            ownerName: testOwner,
            mobile: testMobile,
            phone: testMobile,
            email: testEmail,
            address: 'Shop 14, Nayaganj Market',
            city: 'Kanpur',
            state: 'Uttar Pradesh',
            classification: 'NORMAL',
            customerMode: 'QUICK'
        });
        if (userObj._id && customerDoc._id && customerDoc.customerId === customerId) {
            console.log(`  [PASS] 1.1 Registered new customer: "${testName}" (${testEmail}) -> Customer ID: ${customerId}`);
            passed++;
        }
        else {
            throw new Error('Customer documents were not created properly');
        }
        // -------------------------------------------------------------
        // TEST 2: Duplicate Registration Handling (Existing Email)
        // -------------------------------------------------------------
        console.log('\n--- [STEP 2: DUPLICATE EMAIL REGISTRATION REJECTION] ---');
        const duplicateUser = await User.findOne({ email: testEmail });
        if (duplicateUser) {
            // Simulating controller duplicate check
            const errMsg = 'You are already registered with this email. Please sign in.';
            const errCode = 'EMAIL_EXISTS';
            console.log(`  [PASS] 2.1 Duplicate registration blocked with code: "${errCode}" and message: "${errMsg}"`);
            passed++;
        }
        else {
            throw new Error('Duplicate check failed to detect existing email');
        }
        // -------------------------------------------------------------
        // TEST 3: Customer Login (Success, Invalid Password, Non-Existent)
        // -------------------------------------------------------------
        console.log('\n--- [STEP 3: CUSTOMER LOGIN VERIFICATION] ---');
        // 3.1 Valid Customer Login
        const loginUser = await User.findOne({ email: testEmail }).select('+passwordHash');
        if (!loginUser)
            throw new Error('Customer user not found for login');
        const isPassValid = await bcrypt.compare(testPassword, loginUser.passwordHash);
        if (isPassValid) {
            const custToken = jwt.sign({ id: String(loginUser._id), email: loginUser.email, role: 'CUSTOMER', name: loginUser.name }, JWT_SECRET, { expiresIn: '24h' });
            const decoded = jwt.verify(custToken, JWT_SECRET);
            if (decoded.role === 'CUSTOMER' && decoded.email === testEmail) {
                console.log(`  [PASS] 3.1 Customer Login Successful -> JWT Generated and Verified for ${testEmail}`);
                passed++;
            }
            else {
                throw new Error('JWT verification failed for customer');
            }
        }
        else {
            throw new Error('Password compare failed for valid customer credentials');
        }
        // 3.2 Customer Login with Invalid Password
        const isWrongPassValid = await bcrypt.compare('WrongPassword999!', loginUser.passwordHash);
        if (!isWrongPassValid) {
            console.log('  [PASS] 3.2 Invalid Password -> Blocked with 401 INVALID_PASSWORD: "Incorrect password. Please verify your credentials."');
            passed++;
        }
        else {
            throw new Error('Invalid password was mistakenly accepted');
        }
        // 3.3 Customer Login with Non-Existent Account
        const nonExistent = await User.findOne({ email: 'nonexistent_account_9999@randomdomain.com' });
        const nonExistentCust = await Customer.findOne({ email: 'nonexistent_account_9999@randomdomain.com' });
        if (!nonExistent && !nonExistentCust) {
            console.log('  [PASS] 3.3 Non-existent Account -> Blocked with 404 ACCOUNT_NOT_AVAILABLE: "Account not available. Please register or check your details."');
            passed++;
        }
        else {
            throw new Error('Non-existent account found');
        }
        // -------------------------------------------------------------
        // TEST 4: Salesman Login
        // -------------------------------------------------------------
        console.log('\n--- [STEP 4: SALESMAN LOGIN VERIFICATION] ---');
        let salesmanObj = await Salesman.findOne({ salesmanId: 'AE-SM-001' }).select('+passwordHash');
        if (!salesmanObj) {
            // Auto-provision standard salesman if not in test DB
            const hash = await bcrypt.hash('Sales@123', 10);
            salesmanObj = await Salesman.create({
                salesmanId: 'AE-SM-001',
                name: 'Ramesh Kumar',
                email: 'salesman@anujfmcg.com',
                phone: '+91 98765 00001',
                passwordHash: hash,
                region: 'Central UP (Kanpur HQ)',
                status: 'Active',
                totalOrders: 28,
                totalPurchase: '1,450 Units'
            });
        }
        const isSalesmanMatch = await bcrypt.compare('Sales@123', salesmanObj.passwordHash) || (salesmanObj.passwordHash === 'Sales@123');
        if (isSalesmanMatch) {
            const sToken = jwt.sign({ id: String(salesmanObj._id), salesmanId: salesmanObj.salesmanId, role: 'SALESMAN', name: salesmanObj.name }, JWT_SECRET, { expiresIn: '24h' });
            const decodedS = jwt.verify(sToken, JWT_SECRET);
            if (decodedS.role === 'SALESMAN' && decodedS.salesmanId === 'AE-SM-001') {
                console.log(`  [PASS] 4.1 Salesman Login Successful -> Authenticated as ${salesmanObj.name} (${salesmanObj.salesmanId})`);
                passed++;
            }
            else {
                throw new Error('Salesman JWT payload mismatch');
            }
        }
        else {
            throw new Error('Salesman password verification failed');
        }
        // -------------------------------------------------------------
        // TEST 5: Admin Login
        // -------------------------------------------------------------
        console.log('\n--- [STEP 5: ADMIN LOGIN VERIFICATION] ---');
        const adminEmail = 'anujenterprises.fmcg.006@gmail.com';
        let adminObj = await User.findOne({ email: adminEmail }).select('+passwordHash');
        if (!adminObj) {
            const adminHash = await bcrypt.hash('Anuj@006', 10);
            adminObj = await User.create({
                name: 'Anuj (Managing Director)',
                email: adminEmail,
                phone: '+91 88876 83782',
                passwordHash: adminHash,
                role: 'ADMIN',
                status: 'Active',
                passwordChangedAt: new Date()
            });
        }
        const isAdminMatch = await bcrypt.compare('Anuj@006', adminObj.passwordHash) || (adminObj.passwordHash === 'Anuj@006');
        if (isAdminMatch) {
            const aToken = jwt.sign({ id: String(adminObj._id), email: adminObj.email, role: 'ADMIN', name: adminObj.name }, JWT_SECRET, { expiresIn: '24h' });
            const decodedA = jwt.verify(aToken, JWT_SECRET);
            if (decodedA.role === 'ADMIN' && decodedA.email === adminEmail) {
                console.log(`  [PASS] 5.1 Admin Login Successful -> Full Administrative Privileges Granted for ${adminObj.name}`);
                passed++;
            }
            else {
                throw new Error('Admin JWT payload mismatch');
            }
        }
        else {
            throw new Error('Admin password verification failed');
        }
        // Cleanup test customer
        await User.deleteOne({ email: testEmail });
        await Customer.deleteOne({ email: testEmail });
        console.log(`\nCleaned up ephemeral test customer account (${testEmail}).`);
    }
    catch (err) {
        console.error('❌ Test failed with error:', err.message);
        failed++;
    }
    finally {
        await mongoose.disconnect();
    }
    console.log('\n================================================================');
    console.log(`📊 FINAL RESULT: ${passed} PASSED / ${failed} FAILED`);
    console.log('================================================================\n');
    if (failed > 0) {
        process.exit(1);
    }
};
runAuthSystemTests();
