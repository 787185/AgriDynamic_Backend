// backend/routes/partnerRoutes.js

const express = require('express');
const router = express.Router();
// Import the partner-specific Multer instance and the controller functions
const { partnerUpload, createPartner, getPartners, updatePartner, deletePartner } = require('../controllers/partnerController');

router.post('/', partnerUpload.single('logo'), createPartner); // Use partner-specific upload middleware
router.get('/', getPartners);
router.put('/:id', partnerUpload.single('logo'), updatePartner); // Use partner-specific upload middleware
router.delete('/:id', deletePartner);

module.exports = router;