const express = require('express');
// const logger = require('morgan');
const bodyParser = require('body-parser');
const path = require('path');
const passport = require('passport');
const moment = require('moment');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
// const flash = require('express-flash');
// const reqFlash = require('req-flash');
const methodOverride = require('method-override');
const mongoose = require('mongoose');

const app = express();

// connect to database
const connection = 'mongodb://mongo:27017';
mongoose.connect(connection);
mongoose.Promise = global.Promise;
const db = mongoose.connection;
// bind mongo error
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

app.use(methodOverride('_method'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, './app/views'));

require('dotenv').config();
app.use(require('express-session')({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  store: new RedisStore({
    url: process.env.REDIS_URL
  })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use('/public', express.static(path.join(__dirname, '/app/public')));
app.use('/views/includes', express.static(path.join(__dirname, 'includes')));
require('./app/server/config/passport.js')(passport);

const authRouter = require('./app/server/routes/auth.js');
const mainRouter = require('./app/server/routes/main');
const tripRouter = require('./app/server/routes/trips');
const profileRouter = require('./app/server/routes/profiles');

const authController = require('./app/server/controllers/auth');

app.use('/auth', authRouter);
app.use('/trips', tripRouter);
app.use('/profiles', profileRouter);

app.use('/', mainRouter);

var sessions = require('client-sessions');
app.use(sessions({
	cookieName: 'session',
	secret: 'b0ilermaker',
	duration: 30 * 60 * 1000,
	cookie: {
        ephemeral: true //ends the cookie when the browser closes (not the window/tab but the browser itself)
    }
}));

app.listen(8081, function() {
  console.log('app started on port 8081');
});
