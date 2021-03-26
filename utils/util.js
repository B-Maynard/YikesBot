var exec = require("child_process").execSync;
var path = require('path');


var methods = {

    getZombiesWorldRecordsData: function(nameOfGame, nameOfMap) {
        var currentDirectory = process.cwd();
        var pathToPython = path.join(currentDirectory, "utils", "python", "webscraper.py");

        var result = exec(`python3 ${pathToPython} ${nameOfGame} ${nameOfMap}`);

        if (result) {
            var convert = result.toString("utf8");
            return convert;
        }
        else {
            return "Something happened running the scraper";
        }
    },
    convertBloonsImageToRoundCount: function(imgUrl) {
        var currentDirectory = process.cwd();
        var pathToPython = path.join(currentDirectory, "utils", "python", "bloonsImageParser.py");

        var result = exec(`python3 ${pathToPython} ${imgUrl}`);

        if (result) {
            var convert = result.toString("utf8");
            return convert;
        }
        else {
            return "Something happened attempting to convert image.";
        }
    }
};

 
// Export the methods above
module.exports = methods;