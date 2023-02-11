const fs = require('fs');
var _ = require('lodash');
var userData = JSON.parse(fs.readFileSync('storage/userData.json', 'utf8'));

module.exports = {
	name: 'ratemovie',
	description: 'Lets you rate a specific movie under specific 0.0 - 10.0 rating scale. Usage: !ratemovie [movie_name or imdb_tag] [rating]',
	execute(message, args) {
		
        if (args.length != 2) return message.channel.send('Incorrect amount of arguments. Parameters required: [movie_name] [rating]');

        // only allow numbers and letters
        let movieName = args[0].replace(/[^A-Za-z0-9]+/i, "");
		let movieRating = args[1].replace(/[^0-9\.]+/i, "");

        let ratingCheck = (/^[0-9]+\.[0-9]+$/i.test(movieRating)) || (/^[0-9]+$/i.test(movieRating));

        if (!ratingCheck) return message.channel.send("Invalid rating. Please rate movie from 0.0 - 10.0");

        var user = message.author;
        
        //Find if the user has a value in the storage file
        if (!userData.users[user.id]) {
            userData.users[user.id] = {
                movieRatings: [
                    {
                        id: 1,
                        name: movieName,
                        rating: _.round(movieRating, 1)
                    }
                ]
            }
        }
        // otherwise, if they have don't have a current movie rating, just do the same as above
        else if (!userData.users[user.id].movieRatings) {
            userData.users[user.id].movieRatings = [
                {
                    id: 1,
                    name: movieName,
                    rating: _.round(movieRating, 1)
                }
            ];
        }
        // otherwise, they have a user profile and they've rated a movie before. add the new movie to their dataset
        else {
            let userMovies = userData.users[user.id].movieRatings;

            let arraySort = userMovies.sort((a, b) => {
                return +b.id - (+a.id);
            });

            let highestID = parseInt(arraySort[0].id) + 1;

            let newMovie = {
                id: highestID,
                name: movieName,
                rating: _.round(movieRating, 1)
            };

            userMovies.push(newMovie);
            userData.users[user.id].movieRatings = userMovies;
        }

        //Write the data to the file
        fs.writeFile('storage/userData.json', JSON.stringify(userData), (err) => {
            if (err) console.err(err);
        });

        return message.channel.send("Movies updated.");

	},
};