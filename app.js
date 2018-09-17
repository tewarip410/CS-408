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

app.post('/planTravel', function(req, res, next) { //Travel API calls go here!
  //TODO - add checks for valid date and valid order (ie. an invalid order would be 1,5 - should be 1,2)
  console.log(req.body)
  console.log(req.body.duration);
})

app.listen(8081, function() {
  console.log('app started on port 8081');
});
