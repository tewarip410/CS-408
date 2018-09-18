const express = require('express');
const router = express.Router();

const mainController = require('../controllers/main');
const authController = require('../controllers/auth');

router.get('/', authController.ensureAuthenticated, (req, res) => {
  res.render('forms/main-form-layout',
    {
      page: 'map.ejs',
      stylesheet: 'map.css',
      title: 'Select Locations • Adventum'
    }
  );
});

router.post('/', authController.ensureAuthenticated, mainController.mapPost);

module.exports = router;