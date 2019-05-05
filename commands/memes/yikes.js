const commando = require('discord.js-commando');

//file reader
const fs = require('fs');

//Open userdata file
var userData = JSON.parse(fs.readFileSync('storage/userData.json', 'utf8'));

class YikesCommand extends commando.Command {
  //Class constructor
  constructor(client) {
    super(client, {
      name: 'yikes',
      group: 'memes',
      memberName: 'yikes',
      description: 'Grant a yike to someone whos being a yikes.'
    });
  }

  async run(message, args) {
    //If the user didn't mention someone, return
    if (!message.mentions.users.size) {
      return message.reply("You have to specify a user.");
    }

    //otherwise, save the user as the tagged user
    const taggedUser = message.mentions.users.first();

    //Find if the user has a value in the storage file
    if (!userData[taggedUser.id]) userData[taggedUser.id] = {
        yikes: 0
    }

    //Increment the users yikes counter
    userData[taggedUser.id].yikes++;

    //Write the yikes counter to the file
    fs.writeFile('storage/userData.json', JSON.stringify(userData), (err) => {
      if (err) console.err(err);
    });

    //Display the success message
    message.reply( `you have given ${taggedUser.username} one yike.\nThey now have a total of ${userData[taggedUser.id].yikes} yikes.`, {
      file: 'imgs/yikes.jpg'
    });

  }
}

module.exports = YikesCommand;
