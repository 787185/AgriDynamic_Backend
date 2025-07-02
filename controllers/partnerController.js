// backend/controllers/partnerController.js

const Partner = require('../models/partners');
const cloudinary = require('../config/cloudinaryConfig'); // Uses the shared Cloudinary config
const multer = require('multer'); // Multer needs to be imported here
const path = require('path');   // Path needs to be imported here for fileFilter

// --- MULTER CONFIGURATION SPECIFIC TO PARTNERS (DEFINED DIRECTLY IN THIS FILE) ---
const storage = multer.memoryStorage(); // Store files in memory (as discussed)

const fileFilter = (req, file, cb) => {
  const allowedFileTypes = /jpeg|jpg|png|gif/;
  const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedFileTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Error: Only images (jpeg, jpg, png, gif) are allowed!'), false);
  }
};

// Create a Multer instance specifically for partner uploads
const partnerUpload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 }, // 5MB file size limit
  fileFilter: fileFilter
});

// Export the Multer instance from this file so routes can use it
exports.partnerUpload = partnerUpload;

// --- PARTNER CONTROLLER LOGIC (remains the same) ---

// @desc    Create a new partner
// @route   POST /api/partners
// @access  Admin (implement auth later)
exports.createPartner = async (req, res) => {
  try {
    const { name, description, link } = req.body;
    let logoUrl = null;

    // The file is in req.file because 'partnerUpload.single()' middleware will be applied in the route
    if (req.file) {
      console.log('Partner: File received for logo, uploading to Cloudinary from buffer.');
      const result = await cloudinary.uploader.upload(
        `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`,
        { folder: 'agridynamic/partners', resource_type: "auto" }
      );
      logoUrl = result.secure_url;
      console.log('Partner: Cloudinary upload successful. URL:', logoUrl);
    } else if (req.body.logo && typeof req.body.logo === 'string') {
      logoUrl = req.body.logo;
    } else {
      return res.status(400).json({ message: 'Partner logo (file or URL) is required.' });
    }

    if (!name || !logoUrl || !link) {
      return res.status(400).json({ message: 'Please enter all required fields: name, logo, and link.' });
    }

    const newPartner = new Partner({ name, logo: logoUrl, description, link });
    const partner = await newPartner.save();
    console.log('Partner created in DB. ID:', partner._id);
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

// @desc    Update a partner
// @route   PUT /api/partners/:id
// @access  Admin (implement auth later)
exports.updatePartner = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, link } = req.body;
    let logoUrl = null;

    const existingPartner = await Partner.findById(id);
    if (!existingPartner) {
      return res.status(404).json({ message: 'Partner not found.' });
    }

    if (req.file) { // The file is in req.file
      console.log('Partner: New file received for update, uploading to Cloudinary from buffer.');
      const result = await cloudinary.uploader.upload(
        `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`,
        { folder: 'agridynamic/partners', resource_type: "auto" }
      );
      logoUrl = result.secure_url;

      if (existingPartner.logo && existingPartner.logo.includes('res.cloudinary.com')) {
          const publicId = existingPartner.logo.split('/').pop().split('.')[0];
          await cloudinary.uploader.destroy(`agridynamic/partners/${publicId}`);
          console.log(`Partner: Old Cloudinary image ${publicId} deleted.`);
      }
    } else if (req.body.logo && typeof req.body.logo === 'string') {
      logoUrl = req.body.logo;
      if (existingPartner.logo && existingPartner.logo.includes('res.cloudinary.com') && existingPartner.logo !== logoUrl) {
          const publicId = existingPartner.logo.split('/').pop().split('.')[0];
          await cloudinary.uploader.destroy(`agridynamic/partners/${publicId}`);
          console.log(`Partner: Old Cloudinary image ${publicId} deleted due to new URL.`);
      }
    } else {
      logoUrl = existingPartner.logo;
    }

    if (!name || !logoUrl || !link) {
      return res.status(400).json({ message: 'Please enter all required fields: name, logo, and link.' });
    }

    const updatedPartner = await Partner.findByIdAndUpdate(
      id,
      { name, logo: logoUrl, description, link, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!updatedPartner) {
      return res.status(404).json({ message: 'Partner not found.' });
    }

    res.status(200).json(updatedPartner);
  } catch (error) {
    console.error('Error updating partner:', error);
    res.status(500).json({ message: 'Server error while updating partner', error: error.message });
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

    if (partner.logo && partner.logo.includes('res.cloudinary.com')) {
      const publicId = partner.logo.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`agridynamic/partners/${publicId}`);
      console.log(`Partner: Cloudinary image ${publicId} deleted upon partner removal.`);
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