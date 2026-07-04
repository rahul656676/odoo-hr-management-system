// server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

console.log('GROQ_API_KEY loaded?', !!process.env.GROQ_API_KEY);
console.log('Current working directory:', process.cwd());


const store = require('./db/store');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const attendanceRoutes = require('./routes/attendance');
const leaveRoutes = require('./routes/leave');
const salaryRoutes = require('./routes/salary');
const resumeRoutes = require('./routes/resume');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Seed demo data (admin + 3 employees) on first run only.
store.seedIfEmpty();

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'HRMS API', time: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leave', leaveRoutes);
app.use('/api/salary', salaryRoutes);
app.use('/api/resume', resumeRoutes);

// 404 handler
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Route not found.' });
});

// Central error handler (safety net)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong on the server.' });
});

app.listen(PORT, () => {
  console.log(`HRMS backend running on http://localhost:${PORT}`);
  console.log('Demo Admin login   -> admin@hrms.com / Admin@123');
  console.log('Demo Employee login-> priya.sharma@hrms.com / Welcome@123');
});
