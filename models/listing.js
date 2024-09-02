const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");

// Schema for listing
const listingSchema = new Schema({
    title: {
        type: String,
        require: true
    },
    description: String,
    image: {
        url: String,
        filename: String
    },
    price: Number,
    location: String,
    country: String,
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review"
        }
    ],
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    geometry: {
        type: {
            type: String,
            enum: ['Point']
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    category: {
        type: String,
        enum: ['Trending', 'Rooms', 'Iconic Cities', 'Mountains', 
            'Castles', 'Amazing Pools', 'Camping', 'Farms', 
            'Arctic', 'Domes', 'Boats'],
        required: true
    }
});

// Mongoose Middleware - To delete associated reviews when a listing is deleted
listingSchema.post("findOneAndDelete", async (listingData) => {
    if (listingData) {
        await Review.deleteMany({ _id: {$in: listingData.reviews} });
    }
});

const Listing = mongoose.model("Listing", listingSchema );

module.exports = Listing;