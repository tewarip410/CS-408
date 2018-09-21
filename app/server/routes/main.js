const express = require('express');
const router = express.Router();

const mainController = require('../controllers/main');
const authController = require('../controllers/auth');

router.get('/', authController.ensureAuthenticated, (req, res) => {
  res.render('forms/create-form-layout',
    {
      page: 'create-map.ejs',
      stylesheet: 'map.css',
      title: 'Select Locations • Adventum',
      user: req.user
    }
  );
});

router.get('/splash', authController.ensureUnauthenticated, (req, res) => {
  res.render('splash');
});

router.get('/*', (req, res) => {
  res.render('notfound');
});

module.exports = router;