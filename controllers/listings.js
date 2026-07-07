const Listing = require("../models/listing");
const axios = require("axios");


module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});

  res.render("listings/index.ejs", { allListings });
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
    let { id } = req.params;

    const listing = await Listing.findById(id)
.populate({
    path: "reviews",
    populate: {
        path: "author",
    },
})
.populate({
    path: "bookings",
    populate: {
        path: "user",
    },
})
.populate("owner");

    if (!listing) {
      req.flash("error", "Listing does not exist");
      return res.redirect("/listings");
    }

   console.log("OWNER =", listing.owner);

    console.log(listing);
    res.render("listings/show.ejs", { listing });
  };



module.exports.createListing = async (req, res, next) => {
  console.log("Reached createListing");

  const url = req.file.path;
  const filename = req.file.filename;

  console.log("Image URL:", url);
  console.log("Filename:", filename);

  const newListing = new Listing(req.body.listing);

  const location = req.body.listing.location;
  console.log("Location:", location);

  try {
    const response = await axios.get(
      `https://api.maptiler.com/geocoding/${encodeURIComponent(
        location
      )}.json?key=${process.env.MAPTILER_API_KEY}`
    );

    if (response.data.features.length > 0) {
      const coordinates = response.data.features[0].center;

      newListing.longitude = coordinates[0];
      newListing.latitude = coordinates[1];
    }

    console.log("Latitude:", newListing.latitude);
    console.log("Longitude:", newListing.longitude);

  } catch (err) {
    console.log("MapTiler Error:", err.message);
  }

  newListing.owner = req.user._id;
  newListing.image = {
    url,
    filename,
  };

  await newListing.save();

  console.log("Listing Saved");

  req.flash("success", "New Listing created!");
  res.redirect("/listings");
};


  module.exports.renderEditForm = async (req, res) => {
      let { id } = req.params;
  
      const listing = await Listing.findById(id);
  
      if (!listing) {
        req.flash("error", "Listing does not exist");
        return res.redirect("/listings");
     }

      let originalImageUrl = listing.image.url;
      originalImageUrl.replace("/upload","/upload/h_300,w_250");
      res.render("listings/edit.ejs", { listing });
    };

    module.exports.updateListing = async (req, res) => {
        let { id } = req.params;
    
        let listing = await Listing.findByIdAndUpdate(id, {
          ...req.body.listing,
        });
        if( typeof req.file !== "undefined"){
       let filename = req.file.filename;
let url = "/uploads/" + filename;
listing.image = { url, filename };
       await listing.save();
        }
    
        req.flash("success", "Listing updated!");
    
        res.redirect(`/listings/${id}`);
      };

      module.exports.deleteListing = async (req, res) => {
    let { id } = req.params;

    await Listing.findByIdAndDelete(id);

    req.flash("success", "Listing deleted!");

    res.redirect("/listings");
  };