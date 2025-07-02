// backend/controllers/partnerController.js

const Partner = require('../models/partners'); // Adjust path if necessary
const cloudinary = require('../config/cloudinaryConfig'); // Assuming you have Cloudinary config
const fs = require('fs'); // Node.js file system module for deleting local temp files (if multer uses disk storage)

// @desc    Create a new partner
// @route   POST /api/partners
// @access  Admin (implement auth later)
exports.createPartner = async (req, res) => {
  try {
    // After multer middleware, text fields from FormData are in req.body
    // The uploaded file (if any) is in req.file
    const { name, description, link } = req.body; // 'logo' will be handled from req.file or req.body.logo

    let logoUrl = null;

    // --- LOGO HANDLING LOGIC ---
    if (req.file) {
      // If a file was uploaded, upload it to Cloudinary
      console.log('File received for logo, uploading to Cloudinary:', req.file.path);
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'agridynamic/partners', // Recommended: specific folder for partners
      });
      logoUrl = result.secure_url; // Get the Cloudinary URL

      // Delete the temporary file stored by multer after upload to Cloudinary
      fs.unlinkSync(req.file.path);
    } else if (req.body.logo && typeof req.body.logo === 'string') {
      // If no file was uploaded, but a URL string was provided in the form data
      logoUrl = req.body.logo;
    } else {
      // If neither a file nor a URL was provided for a required logo
      return res.status(400).json({ message: 'Partner logo (file or URL) is required.' });
    }
    // --- END LOGO HANDLING LOGIC ---

    if (!name || !logoUrl || !link) { // Check for logoUrl which could be from file or URL input
      return res.status(400).json({ message: 'Please enter all required fields: name, logo, and link.' });
    }

    const newPartner = new Partner({
      name,
      logo: logoUrl, // Use the Cloudinary URL or the provided URL string
      description,
      link,
    });

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
// This function is new, but your frontend's handleEdit requires it.
exports.updatePartner = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, link } = req.body; // 'logo' will be handled separately

    let logoUrl = null;

    // Fetch existing partner to get current logo for comparison/deletion
    const existingPartner = await Partner.findById(id);
    if (!existingPartner) {
      return res.status(404).json({ message: 'Partner not found.' });
    }

    // --- LOGO HANDLING LOGIC for Update ---
    if (req.file) {
      // A new file was uploaded, upload it to Cloudinary
      console.log('New file received for update, uploading to Cloudinary:', req.file.path);
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'agridynamic/partners',
      });
      logoUrl = result.secure_url;
      fs.unlinkSync(req.file.path); // Delete temp file

      // Optional: Delete old image from Cloudinary if it existed and was hosted there
      if (existingPartner.logo && existingPartner.logo.includes('res.cloudinary.com')) {
          const publicId = existingPartner.logo.split('/').pop().split('.')[0]; // Extract public ID
          await cloudinary.uploader.destroy(`agridynamic/partners/${publicId}`);
          console.log(`Old Cloudinary image ${publicId} deleted.`);
      }
    } else if (req.body.logo && typeof req.body.logo === 'string') {
      // A URL was provided, use it. Check if it's different from the existing one.
      logoUrl = req.body.logo;
      // If the old logo was from Cloudinary and the new one is different, consider deleting the old one
      if (existingPartner.logo && existingPartner.logo.includes('res.cloudinary.com') && existingPartner.logo !== logoUrl) {
          const publicId = existingPartner.logo.split('/').pop().split('.')[0];
          await cloudinary.uploader.destroy(`agridynamic/partners/${publicId}`);
          console.log(`Old Cloudinary image ${publicId} deleted due to new URL.`);
      }
    } else {
      // No new file and no new URL provided, retain the existing logo
      logoUrl = existingPartner.logo;
    }
    // --- END LOGO HANDLING LOGIC for Update ---

    if (!name || !logoUrl || !link) { // Validate required fields for update
      return res.status(400).json({ message: 'Please enter all required fields: name, logo, and link.' });
    }

    const updatedPartner = await Partner.findByIdAndUpdate(
      id,
      { name, logo: logoUrl, description, link, updatedAt: new Date() }, // Add updatedAt if your schema supports it
      { new: true, runValidators: true } // Return the updated document and run schema validators
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

    // Optional: Delete logo from Cloudinary when partner is deleted
    if (partner.logo && partner.logo.includes('res.cloudinary.com')) {
      const publicId = partner.logo.split('/').pop().split('.')[0]; // Extract public ID
      await cloudinary.uploader.destroy(`agridynamic/partners/${publicId}`);
      console.log(`Cloudinary image ${publicId} deleted upon partner removal.`);
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