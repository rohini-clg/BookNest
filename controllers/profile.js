
const User = require("../models/users");
const Listing = require("../models/listing");
const Booking = require("../models/booking");

module.exports.profile = async (req, res) => {

    const user = await User.findById(req.user._id);

    const listings = await Listing.find({
        owner: req.user._id,
    });

    const bookings = await Booking.find({
        user: req.user._id,
    }).populate("listing");

    res.render("profile/index.ejs", {
        user,
        listings,
        bookings,
    });

};