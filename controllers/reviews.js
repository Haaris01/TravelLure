const Review = require('../models/review');
const Campground = require('../models/campground');


module.exports.postNewReview = async (req, res, next) => {
    req.session.returnTo = req.originalUrl;
    const review = new Review(req.body.review);
    const { id } = req.params;
    const campground = await Campground.findById(id);
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success','Posted a new review')

    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.deleteReview = async (req, res, next) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { review: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success','Deleted the review');
    res.redirect(`/campgrounds/${id}`);
};