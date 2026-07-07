
const Booking = require("../models/booking");
const Listing = require("../models/listing");

module.exports.createBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const listing = await Listing.findById(id);

    if (!listing) {
      req.flash("error", "Listing not found!");
      return res.redirect("/listings");
    }

    const { checkIn, checkOut, guests } = req.body;

    // Calculate number of nights
    const start = new Date(checkIn);
    const end = new Date(checkOut);

    const difference =
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);

    if (difference <= 0) {
      req.flash(
        "error",
        "Check-out date must be after check-in date."
      );
      return res.redirect(`/listings/${id}`);
    }

// Check if dates overlap with existing bookings

const existingBookings = await Booking.find({
    listing: listing._id,
    status: { $ne: "Cancelled" },
});

console.log("Listing ID:", listing._id);
console.log("Existing Bookings:", existingBookings);

const existingBooking = await Booking.findOne({
    listing: listing._id,
    status: { $ne: "Cancelled" },
    checkIn: { $lt: end },
    checkOut: { $gt: start },
});

console.log("Overlap Found:", existingBooking);

if (existingBooking) {
    req.flash(
        "error",
        "This property is unavailable for the selected dates."
    );
    return res.redirect(`/listings/${id}`);
}


    const totalPrice = difference * listing.price;

    const booking = new Booking({
      listing: listing._id,
      user: req.user._id,
      checkIn,
      checkOut,
      guests,
      totalPrice,
    });

    await booking.save();

    listing.bookings.push(booking._id);

    await listing.save();

  req.flash("success", "Booking Successful!");

res.render("bookings/confirmation.ejs", {
    booking,
    listing,
});
  } catch (err) {
    console.log(err);
    req.flash("error", "Something went wrong!");
    res.redirect("/listings");
  }
};


module.exports.myBookings = async (req, res) => {

    const bookings = await Booking.find({
        user: req.user._id
    })
    .populate("listing")
    .sort({ createdAt: -1 });

    const upcomingBookings = [];
    const completedBookings = [];
    const cancelledBookings = [];

    const today = new Date();

    bookings.forEach((booking) => {

        if (booking.status === "Cancelled") {
            cancelledBookings.push(booking);
        }
        else if (booking.checkOut < today) {
            completedBookings.push(booking);
        }
        else {
            upcomingBookings.push(booking);
        }

    });

    res.render("bookings/index.ejs", {
    upcomingBookings,
    completedBookings,
    cancelledBookings,
});
}


module.exports.cancelBooking = async (req, res) => {
    try {

        const { bookingId } = req.params;

        const booking = await Booking.findById(bookingId);

        if (!booking) {
            req.flash("error", "Booking not found!");
            return res.redirect("/my-bookings");
        }

        booking.status = "Cancelled";

        await booking.save();

        req.flash("success", "Booking cancelled successfully!");

        res.redirect("/my-bookings");

    } catch (err) {

        console.log(err);

        req.flash("error", "Something went wrong!");

        res.redirect("/my-bookings");
    }
};


module.exports.hostBookings = async (req, res) => {
  try {
    const listings = await Listing.find({ owner: req.user._id })
      .populate({
        path: "bookings",
        populate: [
          { path: "user" },
          { path: "listing" }
        ],
      });

    res.render("bookings/host.ejs", { listings });
  } catch (err) {
    console.log(err);
    req.flash("error", "Unable to load host bookings.");
    res.redirect("/listings");
  }
};


module.exports.confirmBooking = async (req, res) => {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId).populate("listing");

    if (!booking) {
        req.flash("error", "Booking not found.");
        return res.redirect("/host/bookings");
    }

    if (!booking.listing.owner.equals(req.user._id)) {
        req.flash("error", "Unauthorized.");
        return res.redirect("/listings");
    }

    booking.status = "Confirmed";
    await booking.save();

    req.flash("success", "Booking Confirmed!");

    res.redirect("/host/bookings");
};


module.exports.hostCancelBooking = async (req, res) => {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId).populate("listing");

    if (!booking) {
        req.flash("error", "Booking not found.");
        return res.redirect("/host/bookings");
    }

    if (!booking.listing.owner.equals(req.user._id)) {
        req.flash("error", "Unauthorized.");
        return res.redirect("/listings");
    }

    booking.status = "Cancelled";
    await booking.save();

    req.flash("success", "Booking Cancelled!");

    res.redirect("/host/bookings");
};