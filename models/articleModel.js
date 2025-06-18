// backend/models/articleModel.js

const mongoose = require('mongoose');

const articleSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a project/article title'],
      trim: true,
      maxlength: [200, 'Title cannot be more than 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please add a brief description'],
      maxlength: [500, 'Description cannot be more than 500 characters'],
    },
    image: {
      type: String, // URL to the main image
      required: [true, 'Please provide an image URL'],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: 'User', // Refers to your User model
    },
    published: {
      type: Boolean,
      default: false, // Can be a draft or unpublished
    },
    
    // Fields that were previously "project-specific" but are now always present
    contributors: {
      type: [String], 
    },
    status: {
      type: String,
      enum: ['upcoming', 'completed', 'in-progress', 'archived'],
      
    },

    
    background: {
      type: String,
      trim: true,
    },
    methodology: {
      type: String,
      trim: true,
    },
    results: { 
      type: String,
      trim: true,
    },
    conclusions: {
      type: String,
      trim: true,
    },
    recommendations: {
      type: String,
      trim: true,
    },
    application: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true, 
  }
);

module.exports = mongoose.model('Article', articleSchema);