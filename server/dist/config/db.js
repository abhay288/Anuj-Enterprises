import mongoose from 'mongoose';
let cachedDbConnection = null;
export const connectDB = async () => {
    if (mongoose.connection.readyState === 1) {
        return mongoose.connection;
    }
    if (cachedDbConnection) {
        return cachedDbConnection;
    }
    try {
        const connStr = process.env.MONGODB_URI || 'mongodb://localhost:27017/anuj_enterprises';
        console.log(`📡 Connecting to MongoDB Atlas cluster...`);
        // Register connection reliability hooks
        mongoose.connection.on('disconnected', () => {
            console.warn('⚠️ [DATABASE] MongoDB disconnected. Re-establishing connection...');
        });
        mongoose.connection.on('reconnected', () => {
            console.log('✅ [DATABASE] MongoDB connection re-established.');
        });
        mongoose.connection.on('error', (err) => {
            console.error('❌ [DATABASE] MongoDB connection error:', err.message);
        });
        await mongoose.connect(connStr, {
            maxPoolSize: 20,
            minPoolSize: 2,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            autoIndex: true
        });
        console.log(`✅ [DATABASE] MongoDB Connected: ${mongoose.connection.host}`);
    }
    catch (error) {
        console.error(`❌ [DATABASE] MongoDB Initial Connection Error:`, error.message);
    }
};
