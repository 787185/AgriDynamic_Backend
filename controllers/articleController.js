// backend/controllers/articleController.js
const asyncHandler = require('express-async-handler');
const Article = require('../models/articleModel');
const cloudinary = require('../config/cloudinaryConfig'); // Import Cloudinary config
const multer = require('multer'); // Import multer

// Configure multer for memory storage
// Files are stored in memory (as buffers) before being uploaded to Cloudinary.
// This is crucial because Render's file system is ephemeral.
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Export a middleware function to use in routes.
// 'image' here refers to the name of the field in your FormData from the frontend.
exports.uploadImage = upload.single('image');

// @desc    Create a new project/article entry
// @route   POST /api/articles
// @access  Private (Admin or Authorized User) - Adjust access as needed
const createArticle = asyncHandler(async (req, res) => {
  // Deconstruct necessary fields from req.body
  const {
    title,
    description,
    contributors,
    status,
    background,
    methodology,
    results,
    conclusions,
    recommendations,
    application,
    published,
  } = req.body;

  // Access the uploaded file (if any) from req.file (thanks to multer)
  const file = req.file;
  // Access the image URL directly provided (if any) from req.body.image
  const imageUrlFromUrlInput = req.body.image;

  // Basic validation for core fields
  if (!title || !description) {
    res.status(400);
    throw new Error('Please include title and description.');
  }

  let finalImageUrl;

  if (file) {
    // If a file was uploaded, upload it to Cloudinary
    try {
      // Upload the buffer to Cloudinary (base64 string representation)
      const uploadResult = await cloudinary.uploader.upload(file.buffer.toString('base64'), {
        resource_type: "auto", // Automatically detect image/video type
        folder: "agridynamic_articles" // Optional: organize uploads in a specific folder
      });
      finalImageUrl = uploadResult.secure_url; // Get the secure URL from Cloudinary
    } catch (error) {
      console.error("Cloudinary upload failed:", error);
      res.status(500);
      throw new Error('Image upload failed. Please try again.');
    }
  } else if (imageUrlFromUrlInput) {
    // If no file, but a URL was provided in the form
    finalImageUrl = imageUrlFromUrlInput;
  } else {
    // If neither a file nor a URL was provided and image is considered required
    res.status(400);
    throw new Error('Please provide an image URL or upload an image file.');
  }

  // Create the new article/project entry in MongoDB
  const newEntry = await Article.create({
    title,
    description,
    image: finalImageUrl, // Save the Cloudinary URL or direct URL
    published: published !== undefined ? published : false, // Default to false if not provided
    contributors: contributors ? JSON.parse(contributors) : [], // Parse if sent as JSON string from FormData
    status: status || 'upcoming', // Default status if not provided
    background,
    methodology,
    results,
    conclusions,
    recommendations,
    application,
  });

  res.status(201).json(newEntry);
});

// @desc    Update an existing entry
// @route   PUT /api/articles/:id
// @access  Private (Admin or Entry Author) - Adjust access as needed
const updateArticle = asyncHandler(async (req, res) => {
  const entry = await Article.findById(req.params.id);

  if (!entry) {
    res.status(404);
    throw new Error('Entry not found');
  }

  const file = req.file; // The uploaded file from multer
  const imageUrlFromUrlInput = req.body.image; // If user provides a URL directly

  let finalImageUrl = entry.image; // Start with the existing image URL

  if (file) {
    // If a new file is uploaded, upload to Cloudinary
    try {
      const uploadResult = await cloudinary.uploader.upload(file.buffer.toString('base64'), {
        resource_type: "auto",
        folder: "agridynamic_articles"
      });
      finalImageUrl = uploadResult.secure_url;
    } catch (error) {
      console.error("Cloudinary upload failed:", error);
      res.status(500);
      throw new Error('Image upload failed. Please try again.');
    }
  } else if (imageUrlFromUrlInput && imageUrlFromUrlInput !== entry.image) {
    // If no file, but a new URL was provided and it's different from the current one
    finalImageUrl = imageUrlFromUrlInput;
  }
  // If neither a new file nor a different URL is provided, finalImageUrl remains the existing one.

  // Construct update data, including the new image URL if it changed
  const updateData = { ...req.body };
  if (req.body.contributors && typeof req.body.contributors === 'string') {
      updateData.contributors = JSON.parse(req.body.contributors); // Parse if sent as JSON string
  }
  updateData.image = finalImageUrl;

  const updatedEntry = await Article.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  );

  res.status(200).json(updatedEntry);
});

// IMPORTANT: Make sure your getArticleById function does NOT use .populate('author')
// based on our previous conversation. It should look like this:
const getArticleById = asyncHandler(async (req, res) => {
  const entry = await Article.findById(req.params.id); // No .populate('author')

  if (!entry) {
    res.status(404);
    throw new Error('Entry not found (Project or Article)');
  }

  res.status(200).json(entry);
});

// ... (other controller functions like getArticles, getArticlesForCards, deleteArticle) ...

module.exports = {
  createArticle,
  getArticlesForCards,
  getArticleById,
  updateArticle,
  deleteArticle,
  getArticles,
  uploadImage, // Export the multer middleware
};