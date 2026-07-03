const Listing = require("../models/listing.js");

const Review = require("../models/reviews.js");



module.exports.createReview = async (req, res) => {

  console.log(req.params.id);

  let listing = await Listing.findById(req.params.id);

  let newReview = new Review(req.body.review);

  newReview.author = req.user._id;

  listing.reviews.push(newReview);

  await newReview.save();

  await listing.save();

  console.log("the new review saved");

  res.redirect(`/listings/${listing._id}`);

};



module.exports.deleteReview = async (req, res) => {

  let { id, reviewId } = req.params;

  await Listing.findByIdAndUpdate(id, {
    $pull: { reviews: reviewId },
  });

  await Review.findByIdAndDelete(reviewId);

  res.redirect(`/listings/${id}`);

};