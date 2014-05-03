var express = require('express');
var app = express()
  , http = require('http')
  , server = http.createServer(app)
  , io = require('socket.io').listen(server);
server.listen(3000, "0.0.0.0");

var net = require('net');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes');
var users = require('./routes/user');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(app.router);

app.get('/', routes.index);
app.get('/users', users.list);

var tcp = net.createServer(function(socket) {
	socket.on('data', function(data) {
        try{
            var pack = JSON.parse(data);
            if(pack.text) {
                io.sockets.volatile.emit('tweets', {
                    text: pack.text,
                    coordinates: pack.coordinates[0],
                    classification: pack.classifcation
                });
            }
            else {
                io.sockets.volatile.emit('words', {
                    word: pack.word,
                    percent: pack.percent,
                    classifcation: pack.classification
                });
            }

        } catch (e){
            console.log(e);
        }
        
	});
});

tcp.listen(1337, "0.0.0.0");

/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
