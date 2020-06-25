const d3 = require("d3");
const jsdom = require("jsdom");
const {JSDOM} = jsdom;
const sharp = require("sharp");
const fs = require("fs");

module.exports = {
	name: 'trackstats',
	description: 'Tracks win/losses for a game specified and shows the trend on a graph.',
	execute(message, args) {

		const availableGames = ['Overwatch'];

		// Args required: game, current sr (0 if not applicable), win/loss, currentSeason
		var dateNow = Date.now();
		var svgName = dateNow.toString() + ".svg";
		var pngName = dateNow.toString() + ".png";

		if (args[0] != null && args[0].toUpperCase() == 'GAMES') {
			var stringBuilder = "Games currently available to be tracked:\n";
			availableGames.forEach(el => {
				stringBuilder += "- " + el + "\n";
			});

			return message.channel.send(stringBuilder);
		}
		
		if (args.length < 4) return message.channel.send('Insufficient amount of arguments. Requires [gameName] [sr, 0 if not applicable] [win/loss] [currentSeason]');

		var svgSrc;

		switch(args[0].toUpperCase()) {
			case "OVERWATCH":
				svgSrc = overwatchTracker(args, message, dateNow);
				break;
			default:
				return message.channel.send("This doesn't currently support that game.");
		}


		fs.writeFileSync("./" + svgName, svgSrc);

		sharp("./" + svgName)
			.png()
			.toFile(pngName)
			.then(function() {

				message.channel.send('Testing', {embed: {
					title: 'Testing',
					image: {
						url: 'attachment://' + pngName
					},
					files: [{
						attachment: './' + pngName,
						name: pngName
					}]
				}}).then(function() {
					fs.unlinkSync('./' + pngName);
					fs.unlinkSync('./' + svgName);
				});
			})
			.catch(function(err) {
				console.log(err);
			});


	},};


function overwatchTracker(args, message, dateNow) {
	// Data validation
	var winLoss = 0;
	// if (typeof args[1] != "number" || args[1] == "0") return message.channel.send("Please specify a valid current SR.");
	// if (typeof args[3] != "number") return message.channel.send("Please specify a valid season.");
	if (args[2].toUpperCase() != "WIN" && args[2].toUpperCase() != "LOSS") {
		return message.channel.send("Please specify either win/loss for third argument.");
	}
	else if (args[2].toUpperCase() == "WIN") {
		winLoss = 1;
	}

	// New up variables for the things the user input
	var season = parseInt(args[3]);
	var currentUser = message.author.id;

	var userFilePath = `.\/storage\/OverwatchData\/${currentUser}\/`;
	var seasonFilePath = userFilePath + `${season}\/`;

	// New up a data entry for the user that called the message
	let newDataEntry = {
		win: winLoss,
		currentSR: parseInt(args[1])
	}

	let data = JSON.stringify(newDataEntry);

	// If the path for the specific user doesn't exist, create it and the current season's file path
	if (!fs.existsSync(userFilePath)) {
		fs.mkdirSync(userFilePath);
		fs.mkdirSync(seasonFilePath);
	}
	else if (!fs.existsSync(seasonFilePath)) {
		fs.mkdirSync(seasonFilePath);
	}

	fs.writeFileSync(seasonFilePath + dateNow + ".json", data);

	const dom = new JSDOM(`<!DOCTYPE html><html><body></body></html>`);

	let body = d3.select(dom.window.document).select('body');

	let svgContainer = body.append('div').attr('class', 'container')
		.append("svg")
		.attr("width", 1280)
		.attr("height", 1024);

	svgContainer.append("rect")
		.attr("width", "100%")
		.attr("height", "100%")
		.attr("fill", "white");


	var currentNode = 1;

	var listOfFiles = [];

	// Get all the files for a users' season
	fs.readdirSync(seasonFilePath).forEach(file => {
		listOfFiles.push(file);
	});

	//TODO need to convert the contents of the files to json objects and manipulate the data that way

	svgContainer.append("line")
		.attr("x1", 5)
		.attr("y1", 5)
		.attr("x2", 500)
		.attr("y2", 500)
		.attr("stroke-width", 2)
		.attr("stroke", "black");

	return body.select('.container').html();

}


