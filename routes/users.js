const express = require('express');
const router = express.Router({ mergeParams: true });
const passport = require('passport');
const usersController = require('../controllers/usersController')

router.route('/register')
    .get(usersController.renderRegisterForm)
    .post(usersController.registerUser)

router.route('/login')
    .get(usersController.renderLoginForm)
    .post(passport.authenticate('local',
        { failureFlash: true, failureRedirect: '/login', keepSessionInfo: true }),
        usersController.loginUser)

router.get('/logout', usersController.logoutUser)

module.exports = router;