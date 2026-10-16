import mongoose from 'mongoose';
import dns from 'dns';

const connectDB = async () => {
    mongoose.connection.on('connected',()=>{
        console.log("DB Connected")
    })
    
    if (!process.env.MONGODB_URI) {
        throw new Error('MONGODB_URI environment variable is not set');
    }
    
    // Set reliable DNS servers (Cloudflare/Google) to resolve MongoDB SRV records
    try {
        dns.setServers(['1.1.1.1', '8.8.8.8']);
    } catch (err) {
        console.warn('Warning: Could not set custom DNS servers:', err.message);
    }
    
    await mongoose.connect(process.env.MONGODB_URI)
}


export default connectDB;