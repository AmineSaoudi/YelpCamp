const Campground = require('../models/campground')
const Review = require('../models/review')
const catchAsync = require('../utils/catchAsync');

module.exports.createReview = catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);

    const review = req.body.review;
    const newReview = new Review(review);

    newReview.author = req.user._id;
    await campground.reviews.push(newReview);

    await newReview.save();
    await campground.save();

    req.flash('success', 'Review added!');
    res.redirect(`/campgrounds/${id}`)
})

module.exports.destroyReview = catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Review.findByIdAndDelete(reviewId);
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    req.flash('success', 'Review deleted!');
    res.redirect(`/campgrounds/${id}`)
})