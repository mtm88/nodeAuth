const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var eventSchema = new Schema ({
    title: String,
    summary: String,
    description: String,
    thumbnailImage: String,
    image: String,
    startDate: String,
    endDate: String,
    price: Number,
    urls: [String],
    type: String,
    location: String,
    venue: String,
    genre: String,
    tags: [String],
});

module.exports = mongoose.model('event', eventSchema);
