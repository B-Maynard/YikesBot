const commando = require('discord.js-commando');
const YTDL = require('ytdl-core');

 function Play(connection, message) {
   var server = message.guild.id;
   server.dispatcher = connection.playStream(YTDL('https://www.youtube.com/watch?v=zIJErVlVOY8', {filter: "audioonly"}));
   server.dispatcher.on("end", function() {
     connection.disconnect();
   });
 }

class MesotheliomaCommand extends commando.Command {
  constructor(client) {
    super(client, {
      name: 'mesothelioma',
      group: 'memes',
      memberName: 'mesothelioma',
      description: 'If you or a loved one suffer from mesothelioma'
    });
  }

  async run(message, args) {
    if (message.member.voiceChannel) {
      if (!message.guild.voiceConnection) {
        message.member.voiceChannel.join()
        .then(connection => {
          Play(connection, message);
        });
      }
    }
  }
}

module.exports = MesotheliomaCommand;
