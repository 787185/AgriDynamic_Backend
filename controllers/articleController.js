// backend/controllers/articleController.js
const asyncHandler = require('express-async-handler');
const Article = require('../models/articleModel');
const User = require('../models/userModel'); // Keep if you use it for user-related logic
const cloudinary = require('../config/cloudinaryConfig');
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const uploadImage = upload.single('image'); // Declare it as a local constant

// @desc    Create a new project/article entry
// @route   POST /api/articles
// @access  Private (Admin or Authorized User)
const createArticle = asyncHandler(async (req, res) => {
  console.log('1. createArticle: Function entered.');
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

  console.log('2. createArticle: Destructured req.body. Title:', title, 'Description:', description);
  const file = req.file; // The uploaded file buffer (from multer)
  const imageUrlFromUrlInput = req.body.image; // The URL string if provided directly

  let finalImageUrl;

  if (!title || !description) {
    console.log('3a. createArticle: Missing title or description.');
    res.status(400);
    throw new Error('Please include title and description.');
  }

  console.log('3b. createArticle: Title and description present.');

  if (file) {
    console.log('4a. createArticle: File detected, attempting Cloudinary upload.');
    try {
      const uploadResult = await cloudinary.uploader.upload(`data:${file.mimetype};base64,${file.buffer.toString('base64')}`, {
        resource_type: "auto",
        folder: "agridynamic_articles"
      });
      finalImageUrl = uploadResult.secure_url;
      console.log('4a.i. createArticle: Cloudinary upload successful. URL:', finalImageUrl);
    } catch (error) {
      console.error("4a.ii. Cloudinary upload failed with specific error:", error); // This should definitely show up
      res.status(500);
      throw new Error('Image upload failed. Please try again.');
    }
  } else if (imageUrlFromUrlInput) {
    console.log('4b. createArticle: Image URL provided directly.');
    finalImageUrl = imageUrlFromUrlInput;
  } else {
    console.log('4c. createArticle: No file and no URL provided.');
    res.status(400);
    throw new Error('Please provide an image URL or upload an image file.');
  }

  console.log('5. createArticle: Image URL resolved to:', finalImageUrl);

  // Parse contributors before creating entry
  const parsedContributors = contributors ? JSON.parse(contributors) : [];
  console.log('6. createArticle: Parsed contributors:', parsedContributors);


  try {
    const newEntry = await Article.create({
      title,
      description,
      image: finalImageUrl,
      published: published !== undefined ? published : false,
      contributors: parsedContributors,
      status: status || 'upcoming',
      background,
      methodology,
      results,
      conclusions,
      recommendations,
      application,
    });
    console.log('7. createArticle: Article created in DB. ID:', newEntry._id);
    res.status(201).json(newEntry);
    console.log('8. createArticle: Response sent.');
  } catch (dbError) {
    console.error("9. createArticle: Database creation failed:", dbError);
    res.status(500);
    throw new Error('Failed to create article in database.');
  }
});

//   res.status(201).json(newEntry);
// });

// @desc    Get a subset of fields for cards view
// @route   GET /api/articles/cards
// @access  Public
const getArticlesForCards = asyncHandler(async (req, res) => {
  const articles = await Article.find({ status: { $in: ['completed', 'in-progress','archived','upcoming'] } })
          .select('title description image createdAt contributors status')
          .sort({ createdAt: -1 });

  res.status(200).json(articles);
});

// @desc    Get all fields for a single entry (article page)
// @route   GET /api/articles/:id
// @access  Public
const getArticleById = asyncHandler(async (req, res) => {
  const entry = await Article.findById(req.params.id);

  if (!entry) {
    res.status(404);
    throw new Error('Entry not found (Project or Article)');
  }

  res.status(200).json(entry);
});

// @desc    Update an existing entry
// @route   PUT /api/articles/:id
// @access  Private (Admin or Entry Author)
const updateArticle = asyncHandler(async (req, res) => {
  const entry = await Article.findById(req.params.id);

  if (!entry) {
    res.status(404);
    throw new Error('Entry not found');
  }

  // Optional: Check if the logged-in user is the author or an admin - uncomment if needed
  // if (entry.author && req.user && entry.author.toString() !== req.user.id.toString()) {
  //   res.status(401);
  //   throw new Error('Not authorized to update this entry');
  // }

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
  updateData.image = finalImageUrl; // Set the image field to the resolved URL

  const updatedEntry = await Article.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  );

  res.status(200).json(updatedEntry);
});

// @desc    Delete an entry
// @route   DELETE /api/articles/:id
// @access  Private (Admin or Entry Author)
const deleteArticle = asyncHandler(async (req, res) => {
  const entry = await Article.findById(req.params.id);

  if (!entry) {
    res.status(404);
    throw new Error('Entry not found');
  }

  // Optional: Check if the logged-in user is the author or an admin - uncomment if needed
  // if (entry.author && req.user && entry.author.toString() !== req.user.id.toString()) {
  //   res.status(401);
  //   throw new Error('Not authorized to delete this entry');
  // }

  // Optional: If you want to delete the image from Cloudinary when the article is deleted,
  // you'd extract the public ID from the URL and use cloudinary.uploader.destroy()
  /*
  if (entry.image && entry.image.includes('cloudinary.com')) {
    try {
      // Assuming a simple path structure for public ID
      const parts = entry.image.split('/');
      const publicIdWithExtension = parts[parts.length - 1]; // e.g., "my_image_123.jpg"
      const publicId = 'agridynamic_articles/' + publicIdWithExtension.split('.')[0]; // e.g., "agridynamic_articles/my_image_123"
      await cloudinary.uploader.destroy(publicId);
      console.log(`Deleted Cloudinary image: ${publicId}`);
    } catch (error) {
      console.error('Failed to delete image from Cloudinary:', error);
    }
  }
  */

  await entry.deleteOne();

  res.status(200).json({ id: req.params.id, message: 'Entry removed' });
});

// @desc    Get all articles (for admin panel, usually includes all fields)
// @route   GET /api/articles
// @access  Public (or Private if you add auth middleware)
const getArticles = asyncHandler(async (req, res) => {
  const articles = await Article.find().sort({ createdAt: -1 });
  res.status(200).json(articles);
});

module.exports = {
  createArticle,
  getArticlesForCards,
  getArticleById,
  updateArticle,
  deleteArticle,
  getArticles,
  uploadImage,
};