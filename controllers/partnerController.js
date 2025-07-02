// backend/controllers/partnerController.js
const Partner = require('../models/Partner'); // Adjust path if necessary

// @desc    Create a new partner
// @route   POST /api/partners
// @access  Admin (implement auth later)
exports.createPartner = async (req, res) => {
  try {
    const { name, logo, description, link } = req.body;

    if (!name || !logo || !link) {
      return res.status(400).json({ message: 'Please enter all required fields: name, logo, and link.' });
    }

    const newPartner = new Partner({
      name,
      logo,
      description,
      link,
    });

    const partner = await newPartner.save();
    res.status(201).json(partner);
  } catch (error) {
    console.error('Error creating partner:', error);
    res.status(500).json({ message: 'Server error while creating partner', error: error.message });
  }
};

// @desc    Get all partners
// @route   GET /api/partners
// @access  Public
exports.getPartners = async (req, res) => {
  try {
    const partners = await Partner.find({}).sort({ name: 1 });
    res.json(partners);
  } catch (error) {
    console.error('Error fetching partners:', error);
    res.status(500).json({ message: 'Server error while fetching partners', error: error.message });
  }
};

// @desc    Delete a partner
// @route   DELETE /api/partners/:id
// @access  Admin (implement auth later)
exports.deletePartner = async (req, res) => {
  try {
    const partner = await Partner.findById(req.params.id);

    if (!partner) {
      return res.status(404).json({ message: 'Partner not found' });
    }

    await Partner.deleteOne({ _id: req.params.id });
    res.json({ message: 'Partner removed' });
  } catch (error) {
    console.error('Error deleting partner:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid Partner ID format' });
    }
    res.status(500).json({ message: 'Server error while deleting partner', error: error.message });
  }
};