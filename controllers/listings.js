const Listing = require("../models/listing.js");

const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });


module.exports.searchedListings = async (req, res) => {
    let country = req.query.for || '';
    let searchedListings = await Listing.find({ country: new RegExp(country, 'i') });
    if (searchedListings.length === 0) {
        req.flash("error", "No Listings Found!");
        return res.redirect("/listings");
    }
    res.render("listings/index.ejs", {allListings: searchedListings, searchedQuery: country});
}

module.exports.index = async (req, res) => {
    const allListings = await Listing.find();
    res.render("listings/index.ejs", { allListings });
}

module.exports.renderNewListingForm = (req, res) => {
    res.render("listings/new.ejs");
}

module.exports.createListing = async (req, res) => {
    let listing = req.body.listing;
    let url = req.file.path;
    let filename = req.file.filename;
    let fullLocation = listing.location + ", " + listing.country;

    let response = await geocodingClient.forwardGeocode({
        query: fullLocation,
        limit: 1
    }).send();

    let newListing = new Listing(listing);
    newListing.owner = req.user._id;
    newListing.image = { url, filename };
    newListing.geometry = response.body.features[0].geometry;
    newListing.category = listing.category;
    let result = await newListing.save();
    console.log(result);
    
    req.flash("success", "New Listing Added!");
    res.redirect("/listings");
}

module.exports.showListings = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
    .populate({path: "reviews", populate: {path: "author"}}).populate("owner");
    if (!listing) {
        req.flash("error", "Oops! We couldn't find the listing you requested.");
        res.redirect("/listings");
    }
    res.render("listings/show.ejs", { listing });
}

module.exports.renderEditListingForm = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Oops! We couldn't find the listing you requested.");
        res.redirect("/listings");
    }
    let originalListingImgUrl = listing.image.url;
    originalListingImgUrl.replace("/upload", "/upload/w_250");
    res.render("listings/edit.ejs", { listing, originalListingImgUrl });
}

module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    let updatedListingData = req.body.listing;
    let fullLocation = updatedListingData.location + ", " + updatedListingData.country;
    let response = await geocodingClient.forwardGeocode({
        query: fullLocation,
        limit: 1
    }).send();
    let updatedListing = await Listing.findByIdAndUpdate(id, {...updatedListingData,
                                                category: updatedListingData.category,
                                                geometry: response.body.features[0].geometry
                                                });
    if (typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        updatedListing.image = { url, filename };
        await updatedListing.save();
    }
    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
}

module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log("Deleted Listing :", deletedListing);

    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
}

module.exports.filteredListings = async (req, res) => {
    let { category } = req.params;
    let filteredListings = await Listing.find({ category: category });
    if (filteredListings.length === 0) {
        req.flash("error", `No Listings Found for Category: '${category}'`);
        return res.redirect("/listings");
    }
    res.render("listings/index.ejs", {allListings: filteredListings, category: category});
}