const User = require("../models/users");
const Listing = require("../models/listing");

module.exports.addToWishlist = async (req, res) => {
    const { id } = req.params;

    const user = await User.findById(req.user._id);

    if (!user.wishlist.includes(id)) {
        user.wishlist.push(id);
        await user.save();
        req.flash("success", "Added to Wishlist!");
    } else {
        req.flash("error", "Already in Wishlist!");
    }

    res.redirect(`/listings/${id}`);
};

module.exports.removeFromWishlist = async (req, res) => {
    const { id } = req.params;

    await User.findByIdAndUpdate(req.user._id, {
        $pull: {
            wishlist: id,
        },
    });

    req.flash("success", "Removed from Wishlist!");

    res.redirect(`/wishlist`);
};

module.exports.showWishlist = async (req, res) => {

    const user = await User.findById(req.user._id)
        .populate("wishlist");

    res.render("wishlist/index.ejs", {
        wishlist: user.wishlist,
    });
};