const express = require("express");
const router = express.Router({ mergeParams: true });

const wrapAsync = require("../utils/wrapAsync");
const bookingController = require("../controllers/booking");
const { isLoggedIn } = require("../middleware");

// Create Booking
router.post(
  "/book",
  isLoggedIn,
  wrapAsync(bookingController.createBooking)
);

router.get(
  "/host/bookings",
  isLoggedIn,
  wrapAsync(bookingController.hostBookings)
);


// My Bookings
router.get(
  "/my-bookings",
  isLoggedIn,
  wrapAsync(bookingController.myBookings)
);

module.exports = router;

router.post(
    "/bookings/:bookingId/cancel",
    isLoggedIn,
    wrapAsync(bookingController.cancelBooking)
);

router.put(
  "/host/bookings/:bookingId/confirm",
  isLoggedIn,
  wrapAsync(bookingController.confirmBooking)
);

router.put(
  "/host/bookings/:bookingId/cancel",
  isLoggedIn,
  wrapAsync(bookingController.cancelHostBooking)
);