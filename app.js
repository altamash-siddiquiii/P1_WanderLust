// My first full stack project - Explorebnb

if (process.env.NODE_ENV != "production") {
    require('dotenv').config();
}

const express = require('express'); const app = express(); // Importing the Express framework to create a web application and initializing express app
const mongoose = require('mongoose'); // Importing Mongoose to interact with MongoDB
const path = require("path"); // Importing the 'path' module to work with file and directory paths
const methodOverride = require("method-override"); // Importing method-override to use HTTP verbs such as PUT or DELETE in places where the client doesn't support it
const ejsMate = require("ejs-mate"); // Importing ejs-mate to use EJS layouts and partials more efficiently
const MyExpressErr = require("./utils/MyExpressErr.js"); // Importing the custom error class to handle app-specific errors
const listingRoutes = require("./routes/listing.js"); // Importing the routes for managing listing-related operations
const reviewRoutes = require("./routes/review.js"); // Importing the routes for handling review-related operations
const session = require("express-session"); // Importing express-session to manage session data (development)
const MongoStore = require("connect-mongo"); // Importing connect-mongo for session store (production)
const flash = require("connect-flash"); // Importing connect-flash to display temporary messages
const passport = require("passport"); // Importing passport to handle user authentication
const LocalStrategy = require("passport-local"); // Importing the LocalStrategy
const User = require("./models/user.js");
const userRoutes = require("./routes/user.js");
const { error } = require('console');


// const dbUrl = "mongodb://127.0.0.1:27017/wanderlust"; // local
const dbUrl = process.env.MONGODB_ATLAS_URL; // cloud


app.set("view engine", "ejs"); // Setting the view engine to EJS to render dynamic HTML templates
app.set("views", path.join(__dirname, "/views")); // Setting the directory for the EJS views

app.engine("ejs", ejsMate); // Setting ejsMate as the template engine to use EJS layouts

app.use(express.urlencoded({ extended: true })); // Middleware to parse incoming requests with URL-encoded payloads (from forms)
app.use(methodOverride("_method")); // Middleware to override HTTP methods using a query parameter or form input
app.use(express.static(path.join(__dirname, "/public"))); // Serving static files from the 'public' directory

const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET
    },
    touchAfter: 24 * 60 * 60 // 1 day
});
store.on("error", () => {
    console.log("Mongo session store error", error);
});
app.use(session({ // Configures the session middleware with a secret key for session management
    store,
    secret: process.env.SECRET, // sessionOptions
    resave: false,
    saveUninitialized: true,
    cookie: { // cookieOptions
        expires: Date.now() + (7 * 24 * 60 * 60 * 1000),
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true
    }
}));
app.use(flash()); // Initializes the flash middleware to store and display flash message

app.use(passport.initialize()); // Initializes the passport middleware to handle user authentication
app.use(passport.session()); // Initializes the passport session middleware to handle user authentication
passport.use(new LocalStrategy(User.authenticate())); // Passport configuration
passport.serializeUser(User.serializeUser()); // Passport configuration
passport.deserializeUser(User.deserializeUser()); // Passport configuration


app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currentUser = req.user;
    next();
});
app.use("/listings", listingRoutes); // Using listing routes for all '/listings' paths
app.use("/listings/:id/reviews", reviewRoutes); // Using review routes for all '/listings/:id/reviews' paths
app.use("/", userRoutes);

// Connecting to the MongoDB database using Mongoose
async function main() {
    await mongoose.connect(dbUrl);
}
main().then((res) => {
    console.log("Connection successful.");
}).catch((err) => {
    console.log(err);
});

// Starting the server on 8080 port
app.listen(8080, () => {
    console.log("App is listening on 8080 port...");
});

// Defining the root path route
// app.get("/", (req, res) => {
//     res.render("listings/home.ejs");
// });


// Catching all undefined routes and throwing a 404 error.
app.all("*", (req, res, next) => {
    next(new MyExpressErr(404, "Page Not Found!"));
});

// Global error handling middleware
app.use( (err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong!" } = err;
    
    res.status(statusCode).render("error.ejs", { err });
});