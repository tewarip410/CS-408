const express = require('express');
const router = express.Router();

const profileController = require('../controllers/profile');
const authController = require('../controllers/auth');

router.get('/:userId/trips', authController.ensureAuthenticated, profileController.tripsGet);
router.get('/trips', authController.ensureAuthenticated, profileController.otherTripsGet);
router.get('/', authController.ensureAuthenticated, profileController.profileGet);
router.get('/:userId', authController.ensureAuthenticated, profileController.otherProfileGet);
router.post('/', authController.ensureAuthenticated, profileController.profilePost);
router.post('/:userId', authController.ensureAuthenticated, profileController.profilePost);
router.delete('/', authController.ensureAuthenticated, profileController.profileDelete);
router.delete('/:userId', authController.ensureAuthenticated, profileController.profileDelete);

module.exports = router;
