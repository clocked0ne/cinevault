var express = require('express'),
    path = require('path'),
    http = require('http'),
	movies = require('./router/movies');

var app = express();

app.configure(function () {
    app.set('port', process.env.PORT || 2001);
//	app.use(express.favicon(path.join(__dirname, 'public/img/favicon.ico')));
    app.use(express.logger('dev')); /* 'default', 'short', 'tiny', 'dev' */
    app.use(express.bodyParser()),
    app.use(express.static(path.join(__dirname, 'public')));
});

app.get('/movies', movies.findAll);
app.get('/movies/random', movies.findRandom);
app.get('/movies/:id', movies.findById);
app.post('/movies', movies.addMovie);
app.put('/movies/:id', movies.updateMovie);
app.delete('/movies/:id', movies.deleteMovie);
// Image upload
app.post('/movies/upload', movies.upload);

http.createServer(app).listen(app.get('port'), function () {
    console.log("Server listening on port " + app.get('port'));
});
