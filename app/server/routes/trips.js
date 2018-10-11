const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth');
const tripController = require('../controllers/trips');

router.get('/create/:page', authController.ensureAuthenticated, tripController.createGet);
router.get('/create', authController.ensureAuthenticated, tripController.createGet);
router.get('/tourist-map', authController.ensureAuthenticated, tripController.createTouristGet);
router.get('/prev_map', authController.ensureAuthenticated, tripController.createPrevMapGet);
router.post('/', authController.ensureAuthenticated, tripController.tripsPost);
router.post('/create/details', authController.ensureAuthenticated, tripController.detailsPost);
// TODO access control for trips (in authController)
router.get('/ideas', authController.ensureAuthenticated, tripController.tripIdeasGet);
router.get('/:tripId', authController.ensureAuthenticated, tripController.tripGet);
router.get('/:tripId/transportation', authController.ensureAuthenticated, tripController.transportationGet);
router.delete('/:tripId', authController.ensureAuthenticated, tripController.tripDelete);
router.post('/:tripId-favorite', authController.ensureAuthenticated, tripController.tripFavorite);
router.post('/:tripId-unfavorite', authController.ensureAuthenticated, tripController.tripUnFavorite);

module.exports = router;
