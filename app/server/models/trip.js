const mongoose = require('mongoose');
const { Schema } = mongoose;


/*
 * name: city name
 * x: longitude (longitude first is the standard;
 *    x instead of lon because mongo automatically sorts by alpha)
 * y: latitude
 */
const location = Schema({
  name: String,
  x: {
    type: Number,
    min: -180.0,
    max: 180.0
  },
  y: {
    type: Number,
    min: -90.0,
    max: 90.0
  },
  departureDate: String,
  duration: {
    type: Number,
    min: 0
  },
  transportation: String,
});

const tripSchema = Schema({
  name: String,
  start_date: Date,
  start_date_str: String,
  total_duration: Number,
  _userId: Schema.Types.ObjectId,
  trpriority: String,
  roundtrip: Boolean,
  num_people: Number,
  locations: [location],
  favorite: Boolean
});

const Trip = mongoose.model('Trip', tripSchema);

module.exports = Trip;
