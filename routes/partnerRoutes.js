// backend/routes/partnerRoutes.js
const express = require('express');
const router = express.Router();
const {
  createPartner,
  getPartners,
  deletePartner
} = require('../controllers/partnerController'); // <--- Import from controller

// Define routes using controller functions
router.post('/', createPartner);
router.get('/', getPartners);
router.delete('/:id', deletePartner);

module.exports = router;