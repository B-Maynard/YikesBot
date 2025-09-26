const data = require('./data.config.js');
const Sequelize = require('sequelize');

function runInit(db, force) {

    const CurrencyShop = require('./models/CurrencyShop.js')(db, Sequelize.DataTypes);
    require('./models/Users.js')(db, Sequelize.DataTypes);
    require('./models/UserItems.js')(db, Sequelize.DataTypes);

    db.sync({ force }).then(async () => {
        shop = [];
        data.itemShop.forEach(item => {
            shop.push(CurrencyShop.upsert(item));
        });

        await Promise.all(shop);
        console.log('CurrencyShop synced');

        db.close();
    }).catch(console.error);
}


module.exports = {runInit};
