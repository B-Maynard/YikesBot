var exec = require("child_process").execSync;
var path = require('path');


var methods = {

    getZombiesWorldRecordsData: function(nameOfGame, nameOfMap) {
        var currentDirectory = process.cwd();
        var pathToPython = path.join(currentDirectory, "utils", "python", "webscraper.py");

        var result = exec(`python ${pathToPython} ${nameOfGame} ${nameOfMap}`);

        if (result) {
            var convert = result.toString("utf8");
            return convert;
        }
        else {
            return "Something happened running the scraper";
        }
    }
};

 
// Export the methods above
module.exports = methods;