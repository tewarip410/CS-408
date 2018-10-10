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
};
