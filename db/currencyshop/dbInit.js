const data = require('./data.config.js');
const Sequelize = require('sequelize');

let CurrencyShop = null;

function runInit(db, force) {

    CurrencyShop = require('./models/CurrencyShop.js')(db, Sequelize.DataTypes);
    require('./models/Users.js')(db, Sequelize.DataTypes);
    require('./models/UserItems.js')(db, Sequelize.DataTypes);
}

async function resolveFunc() {
    let shop = [];
    data.itemShop.forEach(item => {
        shop.push(CurrencyShop.upsert(item));
    });

    await Promise.all(shop);
    console.log('CurrencyShop synced');
}


module.exports = {runInit, resolveFunc};
