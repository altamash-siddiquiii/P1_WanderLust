// Importing Joi library for schema validation
const Joi = require("joi");

module.exports.listingSchema = Joi.object({
    listing: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        location: Joi.string().required(),
        country: Joi.string().required(),
        price: Joi.number().min(0).required(),
        image: Joi.string().allow("", null),
        category: Joi.string().valid('Trending', 'Rooms', 'Iconic Cities', 'Mountains', 
            'Castles', 'Amazing Pools', 'Camping', 'Farms', 
            'Arctic', 'Domes', 'Boats').required()
    }).required()
});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().min(1).max(5).required(),
        comment: Joi.string().required()
    }).required()
});