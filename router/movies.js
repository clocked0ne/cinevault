// Require formidable for form control file handling
var formidable = require('formidable'),
	fs = require('fs');

var mongo = require('mongodb');

var Server = mongo.Server,
MongoClient = mongo.MongoClient,
Db = mongo.Db,
BSON = mongo.BSONPure,
ObjectID = mongo.ObjectID;

var mongoClient = new MongoClient(new Server('localhost', 27017, { safe: true }));
var db = mongoClient.db("moviedb");

mongoClient.open(function(err, mongoClient) {
// when ready to close connections use mongoClient.close();

	if(!err) {
		console.log("Connected to 'moviedb' database");
		db.collection('movies', {strict:true}, function(err, collection) {
	if (err) {
		console.log("The 'movies' collection doesn't exist. Populating with sample data...");
		populateDB();
	}
		});
	}
});


exports.findById = function(req, res) {
    // At some point we may want to lock this api down!
    // If this is on the Internet someone could easily
    // steal, modify or delete your data! Need something like
    // this on our api (assuming we have people authenticate):
    // if (req.session.userAuthenticated) {

    // We don't want the browser to cache the results
    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');

console.log('Retrieving movie: ' + id);
var id = req.params.id;
    // need to validate the id is in a valid format (24 hex)
var regexObj = /^[A-Fa-f0-9]{24}$/;
	if (regexObj.test(id)) {
		db.collection('movies', function(err, collection) {
			// Search for all records with that ID
			collection.find({'_id':new ObjectID(id)}).toArray(function(err, items) {
				if (err) {
					// console.log('Error getting movie by ID: ' + id + ' Error: ' + err);
					res.json(500, {"error":"An error has occurred!"});
				} else if (items.length != 1) {
					// console.log('Movie not found. ID: ' + id);
					res.json(404, {"message":"Movie not found"});
				} else {
					// console.log('Success getting movie by ID: ' + id);
					res.json(200, items[0]);
				}
			});
		});
	} else {
		// console.log('Error invalid ID format: ' + id);
		res.json(500, {"error":"invalid ID format"});
	}
};


exports.findAll = function(req, res) {
    // We don't want the browser to cache the results
    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');

console.log('Retrieving all movies');
db.collection('movies', function(err, collection) {
collection.find().toArray(function(err, items) {
	if (err) {
        // console.log('Error getting all movies: ' + err);
        res.json(500, {"error":"An error has occurred!"});
    } else {
        // console.log('Success getting all movies.');
        res.json(200, items);
    }
});
});
};

exports.findRandom = function(req, res) {
    // We don't want the browser to cache the results
    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');

db.collection('movies', function(err, collection) {
var randomId = Math.floor(Math.random() * collection.count());
console.log('Retrieving random movie: ' + randomId);
collection.findOne({'_id':new ObjectID(randomId)}, function(err, item) {
	if (err) {
        // console.log('Error getting random movie with ID: ' + randomId + ' Error: ' + err);
        res.json(500, {"error":"An error has occurred!"});
    } else {
        // console.log('Success getting random movie.');
        res.json(200, item);
    }
});
});
};


exports.addMovie = function(req, res) {
    // We don't want the browser to cache the results
    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');

var movie = req.body;
console.log('Adding movie: ' + JSON.stringify(movie));
db.collection('movies', function(err, collection) {
collection.insert(movie, {safe:true}, function(err, result) {
if (err) {
	// console.log('Error adding movie: ' + err);
    res.json(500, {"error":"An error has occurred"});
} else {
	console.log('Success adding movie: ' + JSON.stringify(result[0]));
	res.json(201, result[0]);
}
});
});
}


exports.updateMovie = function(req, res) {
    // We don't want the browser to cache the results
    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');

var id = req.params.id;
var movie = req.body;
delete movie._id;        // remove the ID field

console.log('Attempting to update movie: ' + id);
console.log(JSON.stringify(movie));

    // need to validate the id is in a valid format (24 hex)
    var regexObj = /^[A-Fa-f0-9]{24}$/;
    if (regexObj.test(id)) {
		db.collection('movies', function(err, collection) {
		// Let's see if we find the item before we try to update it
            collection.find({'_id':new ObjectID(id)}).toArray(function(err, items) {
                if (err) {
                    // handle error (500)
                    //console.log('Error updating movie: ' + err);
                    res.send(500, {"error":"An error has occurred"});
                } else if (items.length != 1) {
                    // item doesn't exist (or we have bigger issues)
                    // console.log('movie to update not found: ' + id);
                    res.send(404, {"message":"movie to update not found: " + id});
                } else {
					collection.update({'_id':new ObjectID(id)}, movie, {safe:true}, function(err, result) {
					if (err) {
						console.log('Error updating movie with ID: ' + id + ' Error: ' + err);
						res.json(500, {"error":"An error has occurred!"});
					} else {
						console.log('Success updating movie: ' + result + ' document(s) updated');
						res.json(200, movie);
					}
					});
				}
			});
		});
	} else {
        // console.log('Error invalid ID format: ' + id);
        res.json(500, {"error":"invalid ID format"});
    }
}


exports.deleteMovie = function(req, res) {
    // We don't want the browser to cache the results
    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');

var id = req.params.id;
// need to validate the id is in a valid format (24 hex)
var regexObj = /^[A-Fa-f0-9]{24}$/;
	if (regexObj.test(id)) {
		db.collection('movies', function(err, collection) {
			// Let's see if we find the item before we try to delete it
			collection.find({'_id':new ObjectID(id)}).toArray(function(err, items) {
				if (err) {
					// handle error (500)
					console.log('Error deleting movie: ' + err);
					res.send(500, {"error":"An error has occurred"});
				} else if (items.length != 1) {
					// item doesn't exist (or we have bigger issues)
					console.log('Cannot delete, movie not found: ' + id);
					res.send(404, {"message":"Cannot delete, movie not found. ID: " + id});
				} else {
					// Remove item
					console.log('Deleting movie: ' + id);
					collection.remove({'_id':new ObjectID(id)}, {safe:true}, function(err, result) {
						if (err) {
							//console.log('Error deleting movie with ID: ' + id + ' Error: ' + err);
							res.json(500, {"error":"An error has occurred - " + err});
						} else {
						//	console.log('' + result + ' document(s) deleted');
						//	res.send(req.body);
							// console.log('Success deleting movie: ' + result + ' document(s) deleted');
							// HTTP 204 No Content: The server successfully processed the request, but is not returning any content
							res.json(204);
						}
					});
				}
			});
		});
	} else {
			// console.log('Error invalid ID format: ' + id);
			res.json(500, {"error":"invalid ID format"});
	}
}
 

// Image file upload method on form submission
exports.upload = function(req, res){
	var form = new formidable.IncomingForm();
console.log('Firing upload function: ' + form.files[0]);		
	// Parse file.
  form.parse(req, function(err, fields, files) {
  	
  	if(files.fileToUpload){
			
			// Read file.			
			fs.readFile(files.fileToUpload.path, function(err, data){

		  	// Save file.
				fs.writeFile('pics/' + 
					files.fileToUpload.name, 
					data, 
					'utf8', 
					function (err) {
						if (err){
							// throw err;
							res.writeHead(200, {'content-type': 'text/plain'});
							res.write(JSON.stringify({
								isSucessful: false,
								message: 'Something went wrong!'					
							}));
							res.end();
						} else {
							// Sucess, so update image displayed from src.
							this.pictureFile = files.fileToUpload.name;
							// Read the image file from the local file system and display it in the img tag
							var reader = new FileReader();
							reader.onloadend = function () {
								$('#picture').attr('src', reader.result);
							};
							reader.readAsDataURL(this.pictureFile);
							// Report hooray to server
							res.writeHead(200, {'content-type': 'text/plain'});
							res.write(JSON.stringify({
								isSucessful: true,
								message: 'File was updated!'
							}));
							res.end();
						}
				});
			});
		} else {
			res.writeHead(200, {'content-type': 'text/plain'});
			res.write(JSON.stringify({
				isSucessful: false,
				message: 'Did not receive any file!'					
			}));
			res.end();
		}
  });
}; 
 
 
 
/*-----------------------------------------------------------------------------------------------*/
// Populate database with sample data -- Only used once: the first time the application is started.
// You'd typically not find this code in a real-life app, since the database would already exist.

var populateDB = function() {

var movies = [
{
movie: "Gladiator",
year: "2000",
location: "Top shelf",
format: "BluRay",
imdb: "http://www.imdb.com/title/tt0172495/‎",
picture: null
},
{
movie: "Pulp Fiction",
year: "1994",
location: "Top shelf",
format: "BluRay",
imdb: "http://www.imdb.com/title/tt0110912/",
picture: null
}];
 
db.collection('movies', function(err, collection) {
	collection.insert(movies, {safe:true}, function(err, result) {
		if (err) {
			console.log('Error adding sample movies: ' + err);
		} else {
			console.log('Success adding sample movies');
		}
	});
});
 
}; 