const User = require('../models/user');

module.exports = {
  profileGet: async (req, res) => {
    const { userId } = req.params;
    res.render('forms/profile-layout', {
      page: 'profile.ejs',
      title: 'Profile • Adventum',
      user: req.user
    });
  },
  otherProfileGet: async (req, res) => {
    const { userId } = req.params;
    // TODO get user's profile with their id
    res.render('forms/profile-layout', {
      page: 'profile.ejs',
      title: 'Profile • Adventum',
      user: req.user
    });
  },
  profilePost: async (req, res) => {
    const {googleId} = req.user;
    console.log(req.body);
    const {name} = req.body;
    const {bio} = req.body;
    
    const user = await User.findOne({ googleId });

    user.name = name;
    user.bio = bio;
    user.save();

    res.redirect(`/profiles/${googleId}`);    

  }
};