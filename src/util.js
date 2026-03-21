const fs = require('node:fs');
const path = require('node:path');

const rootDir = `${__dirname}`;

function getAllCommandsAndFilepaths(dirPath = path.join(rootDir, 'commands')) {
    let commandObjArr = [];
    if (!fs.existsSync(dirPath)) return commandObjArr;

    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        if (entry.isDirectory()) {
            commandObjArr = commandObjArr.concat(getAllCommandsAndFilepaths(fullPath));
        } else if (entry.isFile() && entry.name.endsWith('.js')) {
            let tempObj = {
                "path": fullPath,
                "command": entry.name.replace(".js", "")
            }
            commandObjArr.push(tempObj);
        }
    }

    return commandObjArr;
}

module.exports = {getAllCommandsAndFilepaths};