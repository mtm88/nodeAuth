const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const geoSchema = new Schema({
    title: String,
    geolocation: { 'type': { type: String, enum: "Point", default: "Point" },
     coordinates: { type: [Number], default: [0, 0] } }
}, { strict: true });

geoSchema.index({
    geolocation: '2dsphere',
    title: 'text'
});


module.exports = mongoose.model('businesses', geoSchema);