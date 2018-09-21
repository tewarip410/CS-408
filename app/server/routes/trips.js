const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth');
const tripController = require('../controllers/trips');

router.get('/create/:page', authController.ensureAuthenticated, tripController.createGet);
router.get('/create', authController.ensureAuthenticated, tripController.createGet);
router.post('/', authController.ensureAuthenticated, tripController.tripsPost);
router.post('/create/details', authController.ensureAuthenticated, tripController.detailsPost);
module.exports = router;