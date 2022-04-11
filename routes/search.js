const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const campground = require('../controllers/campgrounds');
const { isLoggedIn, validateCampground, isAuthor } = require('../middleware');

router.get('/:searchCampground',  isLoggedIn, campground.searchCampground);

module.exports = router;