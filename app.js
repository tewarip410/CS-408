const express = require('express');
// const logger = require('morgan');
const bodyParser = require('body-parser');
const path = require('path');
const passport = require('passport');
// const session = require('express-session');
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

app.use(passport.initialize());
app.use(passport.session());

require('./app/server/config/passport.js')(passport);

app.get('/', (req, res) => {
  res.render('map');
});
const authRouter = require('./app/server/routes/auth.js');
const indexRouter = require('./app/server/routes/index.js');

app.use('/auth', authRouter);
app.use('/index', indexRouter);

app.get('/map', function(req, res) {
  res.render('map');
})

app.get('/test', function(req, res) {
  res.render('test');
})

app.listen(8081, function() {
  console.log('app started on port 8081');
});
