
const express = require("express");
const router = express.Router();

const wrapAsync = require("../utils/wrapAsync");
const { isLoggedIn } = require("../middleware");

const profileController = require("../controllers/profile");

router.get(
    "/profile",
    isLoggedIn,
    wrapAsync(profileController.profile)
);

module.exports = router;