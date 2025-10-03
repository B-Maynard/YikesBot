const itemShop = [
    { name: 'Tea', shop_cost: 1, effect: 1, value: "1.2", qty: 10},
    { name: 'Coffee', shop_cost: 5, effect: 1, value: "2", qty: 10},
    { name: 'Sugar', shop_cost: 2, effect: 1, value: "1.5", qty: 10 }
];

const CREATURES = [
    { name: "Flufflet", base_rate: 0.01, rarity: 0, icon: "flufflet.png"},
    { name: "Glimblob", base_rate: 0.05, rarity: 0, icon: "glimblob.png" },
    { name: "Lumadrake", base_rate: 0.1, rarity: 0, icon: "lumadrake.png" },
    { name: "Neonix", base_rate: 0.15, rarity: 1, icon: "neonix.png" },
    { name: "Petalia", base_rate: 0.2, rarity: 1, icon: "petalia.png" },
    { name: "Prismuff", base_rate: 0.25, rarity: 1, icon: "prismuff.png" },
    { name: "Ripplefin", base_rate: 0.4, rarity: 2, icon: "ripplefin.png" },
    { name: "Verdini", base_rate: 0.5, rarity: 2, icon: "verdini.png" },
    { name: "Starpuff", base_rate: 1, rarity: 3, icon: "starpuff.png" },
];

module.exports = { itemShop, CREATURES };