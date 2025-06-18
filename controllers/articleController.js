const asyncHandler = require('express-async-handler');
const Article = require('../models/articleModel'); // Import the unified Article model
const User = require('../models/userModel'); // Assuming you use a User model for authoring

// @desc    Create a new project/article entry
// @route   POST /api/articles
// @access  Private (Admin or Authorized User)
const createArticle = asyncHandler(async (req, res) => {
  // All fields from the unified model are potentially accepted
  const {
    title,
    description,
    image,
    contributors,
    status,
    background,
    methodology,
    results, // Matches schema field name
    conclusions,
    recommendations,
    application,
    published,
  } = req.body;

  // Basic validation for core fields common to any entry
  if (!title || !description || !image) {
    res.status(400);
    throw new Error('Please include title, description, and image URL.');
  }

  // Check for user (author) via protect middleware
  // if (!req.user || !req.user.id) {
  //   res.status(401);
  //   throw new Error('Not authorized, user token required');
  // }

  const newEntry = await Article.create({
    title,
    description,
    image,
    // author: req.user._id, // Assign the logged-in user as author
    published: published !== undefined ? published : false, // Default to false if not provided
    contributors: contributors || [], // Default to empty array if not provided
    status: status || undefined, // Set status if provided, otherwise undefined
    background,
    methodology,
    results,
    conclusions,
    recommendations,
    application,
  });

  res.status(201).json(newEntry);
});

// @desc    Get a subset of fields for cards view
// @route   GET /api/articles/cards
// @access  Public
const getArticlesForCards = asyncHandler(async (req, res) => {
  // Check this line carefully!
  // It likely filters for published articles and specific statuses.
  const articles = await Article.find({ status: { $in: ['completed', 'in-progress','completed','upcoming'] } }) // <-- This is the key line
          .select('title description image createdAt contributors status') // Only selects fields for cards
          .sort({ createdAt: -1 });

  res.status(200).json(articles);
});

// @desc    Get all fields for a single entry (article page)
// @route   GET /api/articles/:id
// @access  Public
const getArticleById = asyncHandler(async (req, res) => {
  const entry = await Article.findById(req.params.id).populate('author', 'name email');

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

  // Check if the logged-in user is the author or an admin
  // if (entry.author.toString() !== req.user.id.toString()) {
  //   res.status(401);
  //   throw new Error('Not authorized to update this entry');
  // }

  const updatedEntry = await Article.findByIdAndUpdate(
    req.params.id,
    req.body, // Update with all fields sent in the request body
    { new: true, runValidators: true } // Return the updated document and run schema validators
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

  // Check if the logged-in user is the author or an admin
  // if (entry.author.toString() !== req.user.id.toString()) {
  //   res.status(401);
  //   throw new Error('Not authorized to delete this entry');
  // }

  await entry.deleteOne();

  res.status(200).json({ id: req.params.id, message: 'Entry removed' });
});

const getArticles = asyncHandler(async (req, res) => {
  // Fetch all articles, populate author details, and sort by creation date (newest first)
  const articles = await Article.find().populate('author', 'name email').sort({ createdAt: -1 });
  res.status(200).json(articles);
});

module.exports = {
  createArticle,
  getArticlesForCards,
  getArticleById,
  updateArticle,
  deleteArticle,
  getArticles,
};