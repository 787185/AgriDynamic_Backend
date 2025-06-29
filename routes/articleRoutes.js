// backend/routes/articleRoutes.js

const express = require('express');
const router = express.Router();
const {
  createArticle,
  getArticlesForCards,
  getArticleById,
  updateArticle,
  deleteArticle,
  getArticles,
  uploadImage,
} = require('../controllers/articleController'); 

// const { protect } = require('../middleware/authMiddleware'); 

router.get('/', getArticles);

// Route for creating a new entry - ADD uploadImage middleware here
router.post('/', uploadImage, createArticle);

// Route for creating a new entry
router.post('/', createArticle); 

// Route for retrieving fields for cards view
router.get('/cards', getArticlesForCards); 

// Routes for getting, updating, and deleting a specific entry by ID
router.route('/:id')
  .get(getArticleById)
  .put(uploadImage, updateArticle)
  .delete( deleteArticle);



module.exports = router;