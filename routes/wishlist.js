const express = require("express");
const router = express.Router();

const wrapAsync = require("../utils/wrapAsync");
const { isLoggedIn } = require("../middleware");

const wishlistController = require("../controllers/wishlist");

router.post(
    "/wishlist/:id",
    isLoggedIn,
    wrapAsync(wishlistController.addToWishlist)
);

router.delete(
    "/wishlist/:id",
    isLoggedIn,
    wrapAsync(wishlistController.removeFromWishlist)
);

router.get(
    "/wishlist",
    isLoggedIn,
    wrapAsync(wishlistController.showWishlist)
);

module.exports = router;