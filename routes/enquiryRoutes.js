// backend/routes/enquiryRoutes.js (Example)
const express = require('express');
const router = express.Router();
const { submitEnquiry, getEnquiries, updateEnquiry, deleteEnquiry } = require('../controllers/enquiryController'); // No .js

// Your route definitions
router.route('/').post(submitEnquiry);
router.route('/').get(getEnquiries);
router.route('/:id')
  .put(updateEnquiry)
  .delete(deleteEnquiry);

module.exports = router;