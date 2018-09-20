const express = require('express');
// const logger = require('morgan');
const bodyParser = require('body-parser');
const path = require('path');
const passport = require('passport');
const moment = require('moment');
const session = require('express-session');
// const RedisStore = require('connect-redis')(session);
// const flash = require('express-flash');
// const reqFlash = require('req-flash');
// const methodOverride = require('method-override');
const mongoose = require('mongoose');

const app = express();

// connect to database
const connection = 'mongodb://mongo:27017';
mongoose.connect(connection);
mongoose.Promise = global.Promise;
const db = mongoose.connection;
// bind mongo error
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, './app/views'));

require('dotenv').config();
app.use(require('express-session')({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  cookie : { secure : false, maxAge : (4 * 60 * 60 * 1000) }, // 4 hours
}));
app.use(passport.initialize());
app.use(passport.session());
app.use('/public', express.static(path.join(__dirname, '/app/public')));
app.use('/views/includes', express.static(path.join(__dirname, 'includes')));
require('./app/server/config/passport.js')(passport);

const authRouter = require('./app/server/routes/auth.js');
const indexRouter = require('./app/server/routes/index.js');
const mainRouter = require('./app/server/routes/main');

const authController = require('./app/server/controllers/auth');

app.use('/', mainRouter);
app.use('/auth', authRouter);
app.use('/index', indexRouter);

var sessions = require('client-sessions');
app.use(sessions({
	cookieName: 'session',
	secret: 'b0ilermaker',
	duration: 30 * 60 * 1000,
	cookie: {
        ephemeral: true //ends the cookie when the browser closes (not the window/tab but the browser itself)
    }
}));

var request = require('request');

app.get('/splash', authController.ensureUnauthenticated, (req, res) => {
  res.render('splash');
});

app.get('/*', (req, res) => {
  res.render('notfound');
});

app.get('/profile', authController.ensureAuthenticated, (req, res) => {
  res.render('profile', {user: req.user});
});

app.get('/map', function(req, res) {
  res.render('map');
})

app.get('/test', function(req, res) {
  res.render('test');
})

app.get('/form', function(req, res) {
  if (!req.session.data) {
		res.redirect('/map');
  }
  else {
    console.log(req.session.data);
    res.render('form', {data: req.session.data});
  }
})

app.post('/uploadLocations', function(req, res, next) {
  //console.log(req.body.location_data[0][0]); - for reference
  req.session.data = req.body;
  res.render('forms/map');
})

function call_api(api_call, return_info) {
  return new Promise(function(resolve, reject) {
    request(api_call, function(error, response, body) {
      if (error) {
        return reject(error);
      }

      var json = JSON.parse(body);
      if (return_info === 1) { //return airport code
        return resolve(json[0].airport);
      }
      else if (return_info === 2) { //return airfare information
        return resolve(json);
      }
      else if (return_info === 3) { //return hotel information
        return resolve(json);
      }
    });
  });
}

app.post('/planTravel', function(req, res, next) { //Travel API calls go here!
  //TODO - add checks for valid date and valid order (ie. an invalid order would be 1,5 - should be 1,2)
  var date = (req.body.date).split('/');
  date = date[2] + '-' + date[0] + '-' + date[1];
  console.log(date);
  var round_trip = req.body.rt;
  var trip_data = [];
  var promises = [];

  for (var i = 0; i < req.body.duration.length; i++) {
    var lat = req.session.data.location_data[i][1];
    var lng = req.session.data.location_data[i][2];
    var api_call = "https://api.sandbox.amadeus.com/v1.2/airports/nearest-relevant?apikey=wrrt6wCJMvGOywCv2FNXc4GtQtYXXsoH";
    var get_airport_code = api_call + "&latitude=" + lat + "&longitude=" + lng;
    promises.push(call_api(get_airport_code, 1));
  }

  Promise.all(promises)
    .then(function(data){
      for (var i = 0; i < data.length; i++) {
        var radio = "exampleRadios " + i;
        var name = req.session.data.location_data[i][0];
        var lat = req.session.data.location_data[i][1];
        var lng = req.session.data.location_data[i][2];
        var td = [req.body.duration[i], req.body.order[i], req.body[radio], name, lat, lng, data[i]];
        trip_data.push(td)
      }

      trip_data = trip_data.sort(function(a,b) {
        return a[1] - b[1];
      });

      var dates = [];
      //compute start and end dates for all parts of a trip
      for (var i = 0; i < trip_data.length; i++) {
        var start_date;
        if (i == 0) {
          dates.push([date, date]);
        }
        else {
          start_date = date;
          var date_split = date.split('-');
          date = moment([Number(date_split[0]), Number(date_split[1]) - 1, Number(date_split[2])]).add(Number(trip_data[i][0]) + 1, 'days');
          date = moment(date).format("YYYY-MM-DD");
          dates.push([start_date, date]);
        }
      }
      console.log(trip_data);
      console.log(dates);
    
      var trip_promises = [];
      var hotel_promises = [];
      for (var i = 0; i < trip_data.length; i++) {
        if (trip_data[i][2] === 'plane') {
          if (i < 1) {
            console.log("Cannot route flight from origin to origin!");
            continue;
          }
          else {
            var origin = trip_data[i-1][6];
            var destination = trip_data[i][6];

            api_call = "https://api.sandbox.amadeus.com/v1.2/flights/low-fare-search?apikey=wrrt6wCJMvGOywCv2FNXc4GtQtYXXsoH";
            api_call = api_call + "&origin=" + origin + "&destination=" + destination + "&departure_date=" + dates[i][0];
            console.log(api_call);
            trip_promises.push(call_api(api_call, 2));
          }
        }

        if (i > 0) {
          var location = trip_data[i][6];
          var check_in = dates[i][0];
          var check_out = dates[i][1];
          api_call = "https://api.sandbox.amadeus.com/v1.2/hotels/search-airport?apikey=wrrt6wCJMvGOywCv2FNXc4GtQtYXXsoH";
          api_call = api_call + "&location=" + location + "&check_in=" + check_in + "&check_out=" + check_out + "&lang=EN&currency=USD";
          hotel_promises.push(call_api(api_call, 3));
        }
      }

      var itinerary = [];
      var flight_prices = [];
      var hotels = [];
      var hotel_prices = [];

      Promise.all(trip_promises)
        .then(function(data) {
          for (var j = 0; j < data.length; j++) {
            var flight = data[j].results[0].itineraries[0].outbound.flights;
            flight_prices.push(data[j].results[0].fare.total_price);
            for (var i = 0 ; i < flight.length; i++) {
              var origin = flight[i].origin.airport;
              var dest = flight[i].destination.airport;
              var departure = flight[i].departs_at;
              var arrival = flight[i].arrives_at;
              var airline = flight[i].operating_airline;
              var flight_number = flight[i].flight_number;
              var travel_class = flight[i].booking_info.travel_class;
              var plan = [departure, arrival, origin, dest, airline, flight_number, travel_class];
              itinerary.push(plan);
            }
          }

          Promise.all(hotel_promises)
            .then(function(data) {
              console.log(itinerary);
              console.log('------')
              console.log(flight_prices);
              for (var i = 0; i < data.length; i++) {
                var result = data[i].results[0];
                hotel_prices.push(result.total_price.amount);
                var name = result.property_name;
                var addr = result.address.line1 + " " + result.address.city + ", " + result.address.region + " " + result.address.postal_code + ", " + result.address.country;
                hotels.push([name, addr]);
              }

              console.log('-----');
              console.log(hotels);
              console.log('-----');
              console.log(hotel_prices);
              console.log('here')
              res.render('itinerary', {flights: itinerary, flight_prices: flight_prices, hotels: hotels, hotel_prices: hotel_prices});
            }).catch(function(err){});

        }).catch(function(err){});

    }).catch(function(err){});
})

app.listen(8081, function() {
  console.log('app started on port 8081');
});
