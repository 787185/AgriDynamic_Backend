// backend/routes/enquiryRoutes.js

const express = require('express');
const router = express.Router();
const { submitEnquiry, getEnquiries, updateEnquiry, deleteEnquiry } = require('../controllers/enquiryController');
const { protect } = require('../middleware/authMiddleware'); // <--- Import your authentication middleware

// Route to submit a new enquiry (typically public)
router.route('/').post(submitEnquiry);

// Routes for fetching, updating, and deleting enquiries (PROTECTED)
// These routes will now require a valid JWT from an authenticated user (e.g., admin)
router.route('/')
  .get(protect, getEnquiries); // <--- Apply 'protect' middleware here for GET requests

router.route('/:id')
  .put(protect, updateEnquiry)    // <--- Apply 'protect' middleware here for PUT requests
  .delete(protect, deleteEnquiry); // <--- Apply 'protect' middleware here for DELETE requests

module.exports = router;