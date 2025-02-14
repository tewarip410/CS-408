const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth');
const tripController = require('../controllers/trips');

// TODO access control for trips (in authController)

router.get('/create/:page', authController.ensureAuthenticated, tripController.createGet);
/* create page; map that allows user to click where they would like to go */
router.get('/create', authController.ensureAuthenticated, tripController.createGet);
/* go to the tourist map, which allows the user to find locations wherever they search */
router.get('/tourist-map', authController.ensureAuthenticated, tripController.createTouristGet);
/* go back to the map, saving the markers */
router.get('/prev_map', authController.ensureAuthenticated, tripController.createPrevMapGet);
/* create trip in database and re-render trip page */
router.post('/', authController.ensureAuthenticated, tripController.tripsPost);
/* form to set dates, order, etc. */
router.post('/create/details', authController.ensureAuthenticated, tripController.detailsPost);
/* trip ideas page */
router.get('/ideas', authController.ensureAuthenticated, tripController.tripIdeasGet);
/* single trip page */
router.get('/:tripId', authController.ensureAuthenticated, tripController.tripGet);
/* send back json with flight and hotel info for single trip page*/
router.get('/:tripId/transportation', authController.ensureAuthenticated, tripController.transportationGet);
/* delete trip */
router.delete('/:tripId', authController.ensureAuthenticated, tripController.tripDelete);
/* favorite/unfavorite trip */
router.post('/:tripId-favorite', authController.ensureAuthenticated, tripController.tripFavorite);
router.post('/:tripId-unfavorite', authController.ensureAuthenticated, tripController.tripUnFavorite);

module.exports = router;
