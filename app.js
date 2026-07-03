
require("dotenv").config();

const express = require("express");
const app = express();

console.log(process.env.MAPTILER_API_KEY);
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

const ExpressError = require("./utils/ExpressError.js");

const session = require("express-session");
const flash = require("connect-flash");

const passport = require("passport");
const LocalStrategy = require("passport-local");

const User = require("./models/users.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");



const dbUrl =
  process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/wanderlust";

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(dbUrl);
}







app.set("view engine", "ejs");

app.set("views", path.join(__dirname, "views"));



app.engine("ejs", ejsMate);







app.use((req, res, next) => {
  res.locals.maptilerKey = process.env.MAPTILER_API_KEY;
  next();
});




app.use(express.urlencoded({ extended: true }));

app.use(methodOverride("_method"));



app.use(express.static(path.join(__dirname, "/public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));



const sessionOptions = {
  secret: process.env.SECRET,

  resave: false,

  saveUninitialized: true,

  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

app.use(session(sessionOptions));

app.use(flash());



app.use(passport.initialize());

app.use(passport.session());



passport.use(new LocalStrategy(User.authenticate()));



passport.serializeUser(User.serializeUser());

passport.deserializeUser(User.deserializeUser());



app.use((req, res, next) => {
  res.locals.success = req.flash("success");

  res.locals.error = req.flash("error");

  res.locals.currUser = req.user;

  next();
});


//app.get("/",(req,res)=>{
  //res.send("Hi I am root");
//});



app.get("/demouser", async (req, res) => {

  let fakeUser = new User({
    email: "student@gmail.com",
    username: "delta-student",
  });


  let registeredUser = await User.register(
    fakeUser,
    "helloworld"
  );

  res.send(registeredUser);

});



app.use("/listings", listingRouter);

app.use("/listings/:id/reviews", reviewRouter);

app.use("/", userRouter);




// app.get("/testListing", async (req, res) => {

//   let sampleListing = new Listing({
//     title: "My New Villa",
//     description: "By the beach",
//     price: 1200,
//     location: "Calangute, Goa",
//     country: "India",
//   });

//   await sampleListing.save();

//   console.log("sample was saved");

//   res.send("successful testing");

// });

app.all("*", (req, res, next) => {
  console.log("404 URL =", req.originalUrl);
  next(new ExpressError(404, "Page Not Found"));
});

app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found"));
});


app.use((err, req, res, next) => {
  console.log("========== REAL ERROR ==========");
  console.log(err);
  console.log("================================");

  if (res.headersSent) {
    return next(err);
  }

  let {
    statusCode = 500,
    message = "Something went wrong",
  } = err;

  res.status(statusCode).render("error.ejs", { err });
});


app.listen(8080, () => {
  console.log("server is listening to port 8080");
});