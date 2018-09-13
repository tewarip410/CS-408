const express = require('express');
const router = express.Router();
const passport = require('passport');

router.get('/google',
  passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login'] }));

router.get('/google/callback', 
  passport.authenticate('google', { successRedirect: '/', failureRedirect: '/login' }));

router.get('/logout', (req, res) => {
  if (req.isAuthenticated()) {
    req.logout();
  }
  return res.redirect('/');
})
module.exports = router;