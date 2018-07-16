var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const Nexmo = require('nexmo');
const nexmo = new Nexmo({
  apiKey: '5f97b94f',
  apiSecret: 'Wou9oorDgH5k9Q3A'
});

var User = require('../models/user2');
var configAuth = require('../config/auth');
// Register
router.get('/register', function(req, res){
	res.render('e-learn/register');
});

// Login
router.get('/login', function(req, res){
	res.render('e-learn/login');
});

// Register User
router.post('/register', function(req, res){
	var name = req.body.name;
	var email = req.body.email;
	var username = req.body.username;
	var mobile = req.body.mobile;
	var password = req.body.password;
	var password2 = req.body.password2;

	// Validation
	req.checkBody('name', 'Name is required').notEmpty();
	req.checkBody('email', 'Email is required').notEmpty();
	req.checkBody('email', 'Email is not valid').isEmail().notEmpty();
	req.checkBody('mobile','Mobile No is required').notEmpty();
	req.checkBody('username', 'Username is required').notEmpty();
	req.checkBody('password', 'Password is required').notEmpty();
	req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

	var errors = req.validationErrors();

	if(errors){
		res.render('e-learn/register',{
			errors:errors
		});
	} else {
		var newUser = new User({
			name: name,
			email:email,
			username: username,
			mobile:mobile,
			password: password
		});

		User.createUser(newUser, function(err, user){
			if(err) throw err;
			console.log(user);
		});
		console.log(mobile);
  	nexmo.verify.request({number: '91'+ mobile, brand: 'Student Solutions'}, (err, result) => {
    if(err) {
      //res.sendStatus(500);
      res.render('status', {message: 'Server Error'});
    } else {
      console.log(result);
      let requestId = result.request_id;
      if(result.status == '0') {
        res.render('e-learn/verify', {requestId: requestId});
      } else {
        //res.status(401).send(result.error_text);
        res.render('e-learn/verify', {message: result.error_text, requestId: requestId});
      }
    }
  });
		req.flash('success_msg', 'You are registered and can now login');
	}
});
router.post('/verify', (req, res) => {
  // Checking to see if the code matches
  let pin = req.body.pin;
  let requestId = req.body.requestId;

  nexmo.verify.check({request_id: requestId, code: pin}, (err, result) => {
    if(err) {
      res.status(500).send(err);
      //res.render('status', {message: 'Server Error'});
    } else {
      console.log(result);
      // Error status code: https://docs.nexmo.com/verify/api-reference/api-reference#check
      if(result && result.status == '0') {
        //res.status(200).send('Account verified!');
        res.redirect('/users/login');
      } else {
        res.status(401).send(result.error_text);
        //res.render('status', {message: result.error_text, requestId: requestId});
      }
    }
  });
});

passport.use(new LocalStrategy(
  function(username, password, done) {
   User.getUserByUsername(username, function(err, user){
   	if(err) throw err;
   	if(!user){
   		return done(null, false, {message: 'Unknown User'});
   	}

   	User.comparePassword(password, user.password, function(err, isMatch){
   		if(err) throw err;
   		if(isMatch){
   			return done(null, user);
   		} else {
   			return done(null, false, {message: 'Invalid password'});
   		}
   	});
   });
  }));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});

router.post('/login',
  passport.authenticate('local', {successRedirect:'/e-learn', failureRedirect:'/users/login',failureFlash: true}),
  function(req, res) {
    res.redirect('/');
  });

router.get('/logout', function(req, res){
	req.logout();

	req.flash('success_msg', 'You are logged out');

	res.redirect('/users/login');
});

// router.use('/e-comm', notLoggedIn, function (req, res, next) {
// 	next();
// });

module.exports = router;