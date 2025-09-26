const Sequelize = require('sequelize');
const fs = require('node:fs');
const path = require('node:path');

const sequelize = new Sequelize('database', 'username', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	storage: 'database.sqlite',
});

const force = process.argv.includes('--force') || process.argv.includes('-f');

const dbFolders = fs.readdirSync(__dirname).filter(function(file) {
	return fs.statSync(path.join(__dirname, file)).isDirectory();
});

for (const folder of dbFolders) {
	const dbPath = path.join(__dirname, folder);
	const dbInitFiles = fs.readdirSync(dbPath).filter(file => file === 'dbInit.js');
	for (const file of dbInitFiles) {
		const filePath = path.join(dbPath, file);
		const initFile = require(filePath);

		if ('runInit' in initFile) {
			initFile.runInit(sequelize, force);
		}
	}
}