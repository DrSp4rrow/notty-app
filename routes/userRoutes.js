const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const { getUser } = require('../controllers/userController');

const router = express.Router();

router.get('/profile', authMiddleware, getUser);

module.exports = router;
