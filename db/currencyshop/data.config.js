const itemShop = [

    // Explore items
    { name: 'Gold Coin', cost: 5, yield: 0, rarity: 'rare', prestige_tier: -1, recipe: null },
    { name: 'Scrap Metal', cost: 1, yield: 0, rarity: 'common', prestige_tier: -1, recipe: null },
    { name: 'Mysterious Liquid', cost: 1, yield: 0, rarity: 'common', prestige_tier: -1, recipe: null },
    { name: 'Tattered Scroll', cost: 3, yield: 0, rarity: 'uncommon', prestige_tier: -1, recipe: null },
    { name: 'Dragon Scale', cost: 10, yield: 0, rarity: 'rare', prestige_tier: -1, recipe: null },
    { name: 'Uncommon Gem', cost: 2, yield: 0, rarity: 'uncommon', prestige_tier: -1, recipe: null },
    { name: 'Rare Artifact', cost: 10, yield: 0, rarity: 'rare', prestige_tier: -1, recipe: null },

    // Prestige 0
    { name: 'Mana Dust', cost: 10, yield: .01, prestige_tier: 0, recipe: null },
    { name: 'Iron Ore', cost: 50, yield: .02, prestige_tier: 0, recipe: null },
    { name: 'Magic Orb', cost: -1, yield: .05, prestige_tier: 0, recipe: JSON.stringify({ 'Mana Dust': 5, 'Iron Ore': 2 }) },
    { name: 'Arcane Core', cost: -1, yield: .15, prestige_tier: 0, recipe: JSON.stringify({ 'Magic Orb': 10 }) },

    // Prestige 1
    { name: 'Star Shard', cost: 500, yield: .2, prestige_tier: 1, recipe: null },
    { name: 'Void Crystal', cost: -1, yield: .3, prestige_tier: 1, recipe: JSON.stringify({ 'Star Shard': 10 }) },
    { name: 'Astral Engine', cost: -1, yield: .5, prestige_tier: 1, recipe: JSON.stringify({ 'Void Crystal': 5, 'Arcane Core': 1 }) }
];

module.exports = { itemShop };