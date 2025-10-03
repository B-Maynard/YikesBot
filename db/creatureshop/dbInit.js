const { CREATURES } = require('./data.config.js');
const data = require('./data.config.js');
const Sequelize = require('sequelize');

let CreatureItems = null;
let Users = null;
let UserCreatures = null;
let Creatures = null;

function runInit(db, force) {

    CreatureItems = require('./models/CreatureItems.js')(db, Sequelize.DataTypes);
    Users = require('./models/Users.js')(db, Sequelize.DataTypes);
    UserCreatures = require('./models/UserCreatures.js')(db, Sequelize.DataTypes);
    Creatures = require('./models/Creatures.js')(db, Sequelize.DataTypes);
}

async function resolveFunc() {
    let shop = [];
    data.itemShop.forEach(item => {
        shop.push(CreatureItems.upsert(item));
    });

    let currentUserCreatures = await UserCreatures.findAll();
    let currentUsers = await Users.findAll();
    let currentCreatures = await Creatures.findAll();

    //TODO: need to init all creatures from creature config into the creatures database

    currentUsers.foreach(async user => {
        let currentUsersCreatures = currentUserCreatures.find(entry => entry.user_id === user.user_id);
        if (currentUsersCreatures.length === 0) {
            let defaultCreature = currentCreatures.find(creature => creature.name === CREATURES.FLUFFLET);
            await UserCreatures.addCreature(defaultCreature);
        }
    });

    await Promise.all(shop);
    console.log('CreatureItems synced');
    console.log('Creatures synced');
    console.log('Users synced');
    console.log('UserCreatures synced');
}


module.exports = {runInit, resolveFunc};
