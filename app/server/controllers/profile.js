const moment = require('moment');
const User = require('../models/user');
const Trip = require('../models/trip');

module.exports = {
  profileGet: async (req, res) => {
    const { userId } = req.params;
    res.render('profiles/layout', {
      title: 'Profile • Adventum',
      stylesheet: 'profile.css',
      user: req.user
    });
  },
  otherProfileGet: async (req, res) => {
    const { userId } = req.params;
    // TODO get user's profile with their id
    res.render('profiles/layout', {
      title: 'Profile • Adventum',
      stylesheet: 'profile.css',
      user: req.user
    });
  },
  profilePost: async (req, res) => {
    const {googleId} = req.user;
    const {name} = req.body;
    const {bio} = req.body;

    const user = await User.findOne({ googleId });

    user.name = name;
    user.bio = bio;

    if (!name)
      user.name = 'NULL'; // BUG
    if (!bio)
      user.bio = 'NULL';  // BUG
    await user.save();

    res.redirect(`/profiles/${googleId}`);
  },
  profileDelete: async (req, res) => {
    const { user } = req;
    await user.remove();
    req.logout();
    res.redirect('/');
  },
  tripsGet: async (req, res) => {
    let {userId} = req.params;
    if (!userId) { userId = req.user._id; }
    
    let {user} = req;
    if (userId !== req.user._id) {
      try {
        user = await User.findById(userId);
      } catch (e) {
        console.log(e);
        req.flash('error', 'Sorry, there was a problem finding the user.');
        return res.redirect('/');
      }
    }

    let trips;
    try {
      trips = await Trip.find({_userId: userId});
    } catch (e) {
      console.log(e);
      req.flash('error', 'Sorry, there was a problem finding the trips.');
      return res.redirect('/')
    }

    res.render('forms/create-form-layout',
      {
        page: 'all-trips.ejs',
        title: `All Trips • Adventum`,
        user: req.user,
        tripUser: user,
        trips
      });
  },
  otherTripsGet: async (req, res) => {
    let {userId} = req.params;
    if (!userId) { userId = req.user._id; }
    
    let {user} = req;
    if (userId !== req.user._id) {
      try {
        user = await User.findById(userId);
      } catch (e) {
        console.log(e);
        req.flash('error', 'Sorry, there was a problem finding the user.');
        return res.redirect('/');
      }
    }

    let user_trips;
    try {
      user_trips = await Trip.find({_userId: userId});
    } catch (e) {
      console.log(e);
      req.flash('error', 'Sorry, there was a problem finding the trips.');
      return res.redirect('/')
    }

    var trips = user_trips;
    if (req.query.return) {
      if (req.query.return === 'al_inc') {
        trips.sort(function(a, b) {
          return (a.name < b.name) - (a.name > b.name);
        });
      }
      else if (req.query.return === 'al_dec') {
        trips.sort(function(a, b) {
          return (a.name > b.name) - (a.name < b.name);
        });
      }
      else if (req.query.return === 'favorite') {
        var favorite_trips = [];
        for (var i = 0; i < trips.length; i++) {
          if (trips[i].favorite === true) {
            favorite_trips.push(trips[i]);
          }
        }

        for (var i = 0; i < trips.length; i++) {
          if (trips[i].favorite === false) {
            favorite_trips.push(trips[i]);
          }
        }

        trips = favorite_trips;
      }
      else if (req.query.return === 'furthest') {
        trips.sort(function(a, b) {
          return moment(b.start_date - a.start_date);
        });
      }
      else if (req.query.return === 'closest') {
        trips.sort(function(a, b) {
          return moment(a.start_date - b.start_date);
        });
      }
      else if (req.query.return === 'future') {
        var future_trips = [];

        for (var i = 0; i < trips.length; i++) {
          if (moment(trips[i].start_date - moment()) >= 0) {
            future_trips.push(trips[i]);
          }
        }

        trips = future_trips;
      }
      else if (req.query.return === 'previous') {
        var previous_trips = [];

        for (var i = 0; i < trips.length; i++) {
          if (moment(trips[i].start_date - moment()) < 0) {
            previous_trips.push(trips[i]);
          }
        }

        trips = previous_trips;
      }
    }

    res.render('forms/create-form-layout',
      {
        page: 'all-trips.ejs',
        title: `All Trips • Adventum`,
        user: req.user,
        tripUser: user,
        trips
      });
  },
};
