const User = require('../models/user');

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
  }
};
