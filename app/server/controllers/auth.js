const User = require('../models/user');

module.exports = {
  // make sure user is logged in
  ensureAuthenticated: async (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    }
    return res.redirect('/splash');
  },
  // make sure user is not logged in
  ensureUnauthenticated: async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return next();
    }
    return res.redirect('/');
  }
}
