const express = require('express');
// const logger = require('morgan');
const bodyParser = require('body-parser');
const path = require('path');
const passport = require('passport');
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

const authController = require('./app/server/controllers/auth');

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

app.get('/', authController.ensureAuthenticated, (req, res) => {
  res.render('home');
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
    res.render('form', {data: req.session.data});
  }
})

app.post('/uploadLocations', function(req, res, next) {
  //console.log(req.body.location_data[0][0]); - for reference
  req.session.data = req.body;
  res.render('map');
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
      console.log(trip_data);
    
      var trip_promises = [];
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
            api_call = api_call + "&origin=" + origin + "&destination=" + destination + "&departure_date=" + date;
            console.log(api_call);
            trip_promises.push(call_api(api_call, 2));
          }
        }
      }

      Promise.all(trip_promises)
        .then(function(data) {
          console.log(data);
          console.log(data['results']);
        }).catch(function(err){});

    }).catch(function(err){});
})

app.listen(8081, function() {
  console.log('app started on port 8081');
});
