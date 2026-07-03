
const express = require("express");
const router = express.Router();

const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing");
const listingController = require("../controllers/listings.js");
const multer = require("multer");
const { storage } = require("../cloudConfig");
const upload = multer({
    storage,
});

const {
  isLoggedIn,
  isOwner,
  validateListing,
} = require("../middleware.js");

// Index Route
router
.route("/")
.get(wrapAsync(listingController.index))
.post(
  isLoggedIn,
  upload.single("listing[image]"),
    validateListing,
  wrapAsync(listingController.createListing)
);


// New Route
router.get("/new", isLoggedIn, listingController.renderNewForm);




//Search Route
router.get("/search", async (req, res) => {
  const { q } = req.query;

  const allListings = await Listing.find({
    $or: [
      { title: { $regex: q, $options: "i" } },
      { location: { $regex: q, $options: "i" } },
      { country: { $regex: q, $options: "i" } },
    ],
  });

  res.render("listings/index.ejs", { allListings });
});


//Category
router.get("/category/:category", async (req, res) => {
    const { category } = req.params;

    const allListings = await Listing.find({ category });

    if (allListings.length === 0) {
        req.flash("error", `No ${category} listings found.`);
        return res.redirect("/listings");
    }

    res.render("listings/index.ejs", { allListings });
});


// Show, Update, Delete Route
router
  .route("/:id")
  .get(wrapAsync(listingController.showListing))
  .put(
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.updateListing)
  )
  .delete(
    isLoggedIn,
    isOwner,
    wrapAsync(listingController.deleteListing)
  );

// Edit Route
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.renderEditForm)
);

module.exports = router;