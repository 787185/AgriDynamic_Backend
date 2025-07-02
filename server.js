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
const allowedOrigins = [
  'https://agri-dynamic-1kq7.vercel.app', 
  'http://localhost:5173',               
  
];


app.use(express.json());
app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      console.warn(`CORS violation: Request from origin ${origin} not allowed.`);
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true,
  optionsSuccessStatus: 204,
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/enquiries', enquiryRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/volunteers', volunteerRoutes);
app.use('/api/partners', partnerRoutes);

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
