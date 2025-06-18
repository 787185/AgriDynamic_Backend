const express = require('express');
const mongoose = require('mongoose');
const { port, mongoUri } = require('./config');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/auth');
const articleRoutes = require('./routes/articleRoutes');
const volunteerRoutes = require('./routes/volunteerRoute');
const enquiryRoutes = require('./routes/enquiryRoutes.js')
const cors = require('cors');
require('dotenv').config();
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: 'https://agri-dynamic-1kq7.vercel.app/', // IMPORTANT: Replace with your React app's URL
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true,
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/enquiries', enquiryRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/volunteers', volunteerRoutes);

// Connect to MongoDB
mongoose.connect(mongoUri)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message);
  });
