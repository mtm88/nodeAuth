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
    time: String,
    price: Number,
    urls: [String],
    type: String,
    location: [String],
    genre: [String],
    source: String,
    tags: [String],
    id: String,
    ticketLink: String,
    teams: String,
});

 eventSchema.index({
    title: 'text',
  });

module.exports = mongoose.model('event', eventSchema);
