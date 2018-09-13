const express = require('express');
const router = express.Router();
const passport = require('passport');
const authController = require('../controllers/auth');

router.get('/google',
  authController.ensureUnauthenticated,
  passport.authenticate('google', {
    scope: ['https://www.googleapis.com/auth/plus.login','https://www.googleapis.com/auth/userinfo.email']
  }));

router.get('/google/callback', 
  authController.ensureUnauthenticated,
  passport.authenticate('google', { successRedirect: '/', failureRedirect: '/auth/login' }));

router.get('/logout', (req, res) => {
  authController.ensureAuthenticated,
  req.logout();
  return res.redirect('/');
});

router.get('/login', authController.ensureUnauthenticated, (req, res) => {
  return res.render('login');
});

module.exports = router;