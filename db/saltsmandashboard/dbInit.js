const Sequelize = require('sequelize');

function runInit(db, force) {
    require('./models/BathroomEntry.js')(db, Sequelize.DataTypes);
}

function resolveFunc() {
    console.log("BathroomEntry synced");
}


module.exports = {runInit, resolveFunc};
