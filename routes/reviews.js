const express = require('express');
const router = express.Router({mergeParams : true});
//mergeParams enables the use of req.params from the route in index
//without using mergeParams we cannot access params in disjoint route files
const ExpressError = require('../utils/ExpressError');
const catchAsync = require('../utils/catchAsync');
const {validateReview, isLoggedIn,isReviewAuthor} = require('../middleware')
const review = require('../controllers/reviews');

router.post('/',isLoggedIn, validateReview ,catchAsync(review.postNewReview));

router.delete('/:reviewId', isReviewAuthor,review.deleteReview);

module.exports = router;