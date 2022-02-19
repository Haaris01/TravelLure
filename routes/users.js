const express = require('express');
const passport = require('passport');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const user = require('../controllers/users')

router.route('/register')
    .get(user.renderRegisterForm )
    .post(catchAsync(user.register))

router.route('/login')
    .get(user.renderLoginForm )
    .post(passport.authenticate('local',{failureFlash: true,failureRedirect:'/login'}),user.login)

router.get('/logout',user.logout);

module.exports = router;


// router.get('/register',user.renderRegisterForm );

// router.get('/login',user.renderLoginForm );

// router.post('/login',
//     passport.authenticate('local',{failureFlash: true,failureRedirect:'/login'}),user.login)

// router.post('/register',catchAsync(user.register))

// router.get('/logout',user.logout);