import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import adminRoutes from './route/adminRoute.js';
import employeeRoutes from './route/employeeRoute.js';
import connectDB from './config/mongoDB.js';
import communicationRoutes from './route/communicationRoute.js';
import noticeRoutes from './route/noticeRoute.js';
import attendanceRoute from './route/attendanceRoute.js';
import internRoute from "./route/internRoute.js";
import clientRoute from "./route/clientRoute.js";
import invoiceRoute from './route/invoiceRoute.js';
import projectRoute from './route/projectRoute.js';
import handoverRoute from './route/handoverRoute.js';
import salaryRoute from './route/salaryRoute.js';
import authRoutes from './route/authRoute.js';
import reportRoutes from './route/reportRoute.js';
import activityRoutes from './route/activityRoute.js';
dotenv.config();

const app = express();

// Middleware
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:8080', 'https://webflora-management-frontend.vercel.app'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Health check / Root route
app.get('/', (req, res) => {
    res.send('Hello From Backend!');
});
app.use('/api/admin', adminRoutes);
app.use('/api/employee', employeeRoutes);
app.use('/api/communication', communicationRoutes);
app.use('/api/notice', noticeRoutes);
app.use('/api/attendance', attendanceRoute);
app.use('/api/intern', internRoute);
app.use('/api/client', clientRoute);
app.use('/api/invoice', invoiceRoute);
app.use('/api/project', projectRoute);
app.use('/api/handover', handoverRoute);
app.use('/api/salary', salaryRoute);
app.use('/api/auth', authRoutes);
app.use('/api/report', reportRoutes);
app.use('/api/activity', activityRoutes);


// Connect to MongoDB
connectDB();

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

