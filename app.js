var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressHbs = require('express-handlebars');
var mongoose = require('mongoose');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var flash = require('connect-flash');
var validator = require('express-validator');
var MongoStore = require('connect-mongo')(session);

var routes = require('./routes/index');
var userRoutes = require('./routes/user');
var elearn = require('./routes/elearn');
var users = require('./routes/user2');
//var socket = require('./routes/socket');

var app = express();
mongoose.connect('localhost:27017/shopping');
require('./config/passport');

// view engine setup
app.engine('.hbs', expressHbs({defaultLayout: 'layout', extname: '.hbs'}));
app.set('view engine', '.hbs');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(validator());
app.use(cookieParser());
app.use(session({
  secret: 'mysupersecret', 
  resave: false, 
  saveUninitialized: false,
  store: new MongoStore({ mongooseConnection: mongoose.connection }),
  cookie: { maxAge: 180 * 60 * 1000 }
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next) {
    res.locals.login = req.isAuthenticated();
    res.locals.session = req.session;
    next();
});

app.use('/user', userRoutes);
app.use('/',routes);
app.use('/',elearn);
//app.use('/',socket);
app.use('/users',users);

// io.on('connection', (socket) => {
//   console.log('New user connected');

//   socket.on('join', (params, callback) => {
//     if (!isRealString(params.name) || !isRealString(params.room)) {
//       return callback('Name and room name are required.');
//     }

//     socket.join(params.room);
//     users.removeUser(socket.id);
//     users.addUser(socket.id, params.name, params.room);

//     io.to(params.room).emit('updateUserList', users.getUserList(params.room));
//     socket.emit('newMessage', generateMessage('Admin', 'Welcome to the chat app'));
//     socket.broadcast.to(params.room).emit('newMessage', generateMessage('Admin', `${params.name} has joined.`));
//     callback();
//   });

//   socket.on('createMessage', (message, callback) => {
//     var user = users.getUser(socket.id);

//     if (user && isRealString(message.text)) {
//       io.to(user.room).emit('newMessage', generateMessage(user.name, message.text));
//     }

//     callback();
//   });

//   socket.on('createLocationMessage', (coords) => {
//     var user = users.getUser(socket.id);

//     if (user) {
//       io.to(user.room).emit('newLocationMessage', generateLocationMessage(user.name, coords.latitude, coords.longitude));  
//     }
//   });

//   socket.on('disconnect', () => {
//     var user = users.removeUser(socket.id);

//     if (user) {
//       io.to(user.room).emit('updateUserList', users.getUserList(user.room));
//       io.to(user.room).emit('newMessage', generateMessage('Admin', `${user.name} has left.`));
//     }
//   });
// });
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
