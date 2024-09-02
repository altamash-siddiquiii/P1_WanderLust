const Listing = require("./models/listing.js"); // Importing the Listing model to interact with the 'listings' collection in MongoDB
const Review = require("./models/review.js"); // Importing the Review model to store reviews for a listing
const MyExpressErr = require("./utils/MyExpressErr.js"); // Importing the custom error class to handle app-specific errors
const { listingSchema, reviewSchema } = require("./schema_joi.js"); // Importing Joi validation schemas to validate listings and reviews


module.exports.isLoggedIn = (req, res, next) => {
    // console.log(req.user); // Shows current user info if user is logged in
    if (!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "You must be logged in!");
        return res.redirect("/login");
    }
    next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};

module.exports.isOwner = async (req, res, next) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if (!listing.owner.equals(res.locals.currentUser._id)) {
        req.flash("error", "You are not the owner of this listing!");
        return res.redirect(`/listings/${id}`);
    }
    next();
};

// Validating listing data with Joi schema and handling errors if validation fails
module.exports.validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((elmnt) => elmnt.message).join(", ");

        throw new MyExpressErr(400, errMsg);
    } else {
        next();
    }
};

// Validating review data with Joi schema and handling errors if validation fails
module.exports.validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((elmnt) => elmnt.message).join(", ");

        throw new MyExpressErr(400, errMsg);
    } else {
        next();
    }
};

module.exports.isReviewAuthor = async (req, res, next) => {
    let { id, reviewId } = req.params;
    let review = await Review.findById(reviewId);
    if (!review.author.equals(res.locals.currentUser._id)) {
        req.flash("error", "You are not the author of this review!");
        return res.redirect(`/listings/${id}`);
    }
    next();
};