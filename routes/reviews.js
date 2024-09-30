const express = require('express');
const router = express.Router({ mergeParams: true });

const { reviewSchema } = require('../joiSchemas')
const { isLoggedIn, validate, isReviewAuthor } = require('../middleware')
const reviewsController = require('../controllers/reviewsController')




router.post('/', isLoggedIn, validate(reviewSchema), reviewsController.createReview);

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, reviewsController.destroyReview)


module.exports = router;