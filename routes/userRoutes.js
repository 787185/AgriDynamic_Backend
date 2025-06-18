const express = require('express');
const router = express.Router();
const { getUsers, createUser } = require('../controllers/userControllers');
const protect = require('../middleware/authMiddleware');

router.get('/', getUsers);
router.post('/', createUser);

module.exports = router;
