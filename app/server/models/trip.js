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
  duration: {
    type: Number,
    min: 0
  },
  transportation: String,
});

const tripSchema = Schema({
  name: String,
  start_data: Date,
  _userId: Schema.Types.ObjectId,
  locations: [location]
});

const Trip = mongoose.model('Trip', tripSchema);

module.exports = Trip;
