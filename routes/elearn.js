var express = require('express');
var router = express.Router();
var nodemailer = require('nodemailer');
const request = require('request');
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

var User = require('../models/user2');
var configAuth = require('../config/auth');

router.get('/e-learn', function (req, res, next) {
    res.render('e-learn/home',{title: 'Student Solutions'});
});

router.get('/contact', function(req,res,next){
    res.render('e-learn/contact',{title: 'Student Solutions'});
});

router.get('/e-learn/java', isLoggedIn, function(req,res,next){
  res.render('e-learn/courses/java');
});

router.get('/e-learn/java/test', function(req,res,next){
  res.render('e-learn/test/java_test');
});

router.post('/send', (req, res) => {
    const output = `
      <p>Thank you for contacting us, we will revert back to you soon!!!</p>
    `;
    if(
        req.body.captcha === undefined ||
        req.body.captcha === '' ||
        req.body.captcha === null
      ){
        return res.json({"success": false, "msg":"Please select captcha"});
      }
    
      // Secret Key
      const secretKey = '6LdIaE0UAAAAAIlsOjjeI8J-gWeemm-pNUz4l_pV';
    
      // Verify URL
      const verifyUrl = `https://google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${req.body.captcha}&remoteip=${req.connection.remoteAddress}`;
    
      // Make Request To VerifyURL
      request(verifyUrl, (err, response, body) => {
        body = JSON.parse(body);
        console.log(body);
    
        // If Not Successful
        if(body.success !== undefined && !body.success){
          return res.json({"success": false, "msg":"Failed captcha verification"});
        }
    
        //If Successful
        return mail();
        
      });
    function mail(){
        res.json({"success": true, "msg":"Message Sent! You will be contacted very soon."});
        let transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: 'jk031997@gmail.com', // generated ethereal user
                pass: 'mantalmaths'  // generated ethereal password
            },
            tls:{
              rejectUnauthorized:false
            }
          });
        
          // setup email data with unicode symbols
          let mailOptions = {
              from: '"Nodemailer Contact" <jk031997@gmail.com>', // sender address
              to: req.body.email, // list of receivers
              subject: 'Thank you!', // Subject line
              text: 'Hello world?', // plain text body
              html: output // html body
          };
        
          // send mail with defined transport object
          transporter.sendMail(mailOptions, (error, info) => {
              if (error) {
                  return console.log(error);
              }
              console.log('Message sent: %s', info.messageId);   
              console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        
              // res.render('e-learn/home');
          });    
    }
    // create reusable transporter object using the default SMTP transport
    
      });
      router.get('/auth/facebook', passport.authenticate('facebook'));

      router.get('/auth/facebook/callback', 
        passport.authenticate('facebook', { successRedirect: '/e-learn', failureRedirect: '/users/register' }));
      
      router.get('/auth/google', passport.authenticate('google', {scope: ['profile', 'email']}));
      
      router.get('/auth/google/callback', 
        passport.authenticate('google', { successRedirect: '/e-learn', failureRedirect: '/users/register' }));
      
      passport.use(new FacebookStrategy({
        clientID: configAuth.facebookAuth.clientID,
        clientSecret: configAuth.facebookAuth.clientSecret,
        callbackURL: configAuth.facebookAuth.callbackURL
      },
        function(accessToken, refreshToken, profile, done) {
            process.nextTick(function(){
              User.findOne({'facebook.id': profile.id}, function(err, user){
                if(err)
                  return done(err);
                if(user)
                  return done(null, user);
                else {
                  var newUser = new User();
                  newUser.facebook.id = profile.id;
                  newUser.facebook.token = accessToken;
                  newUser.facebook.name = profile.name.givenName + ' ' + profile.name.familyName;
                  // newUser.facebook.email = profile.emails[0].value;
      
                  newUser.save(function(err){
                    if(err)
                      throw err;
                    return done(null, newUser);
                  })
                  console.log(profile);
                }
              });
            });
          }
      
      ));
      
      passport.use(new GoogleStrategy({
          clientID: configAuth.googleAuth.clientID,
          clientSecret: configAuth.googleAuth.clientSecret,
          callbackURL: configAuth.googleAuth.callbackURL
        },
        function(accessToken, refreshToken, profile, done) {
            process.nextTick(function(){
              User.findOne({'google.id': profile.id}, function(err, user){
                if(err)
                  return done(err);
                if(user)
                  return done(null, user);
                else {
                  var newUser = new User();
                  newUser.google.id = profile.id;
                  newUser.google.token = accessToken;
                  newUser.google.name = profile.displayName;
                  newUser.google.email = profile.emails[0].value;
      
                  newUser.save(function(err){
                    if(err)
                      throw err;
                    return done(null, newUser);
                  })
                  console.log(profile);
                }
              });
            });
          }
      
      ));
module.exports = router;

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
      return next();
  }
  req.session.oldUrl = req.url;
  res.redirect('/users/login');
}