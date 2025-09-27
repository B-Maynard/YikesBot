const fs = require('node:fs');
const path = require('node:path');

const rootDir = `${__dirname}`;

function getAllCommandsAndFilepaths() {
    let commandObjArr = [];
    const foldersPath = path.join(rootDir, 'commands');
    const commandFolders = fs.readdirSync(foldersPath);

    for (const folder of commandFolders) {
        const commandsPath = path.join(foldersPath, folder);
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, file);

            let tempObj = {
                "path": filePath,
                "command": file.replace(".js", "")
            }

            commandObjArr.push(tempObj);
        }
    }

    return commandObjArr;
}

module.exports = {getAllCommandsAndFilepaths};