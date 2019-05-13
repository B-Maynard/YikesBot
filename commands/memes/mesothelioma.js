const commando = require('discord.js-commando');
const YTDL = require('ytdl-core');
const ffmpeg = require('ffmpeg');
const opusscript = require('opusscript');

// function Play (connection, message) {
//   var server = message.guild.id;
//   console.log("/" + server);
//   server.dispatcher = connection.playStream(YTDL('https://www.youtube.com/watch?v=zIJErVlVOY8', {filter: 'audioonly'}));
//   console.log("//" + server.dispatcher);
//   server.dispatcher.on('end', function () {
//     connection.disconnect();
//   });
// }

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
          var voiceChannel = message.member.voiceChannel;
          voiceChannel.join().then (connection => {
            const stream = YTDL('https://www.youtube.com/watch?v=zIJErVlVOY8', { filter: 'audioonly'});
            const dispatcher = connection.playStream(stream);
            console.log(dispatcher);
            dispatcher.on("end", end => {
              voiceChannel.leave();
            });
          });
      }
    }
  }
}

module.exports = MesotheliomaCommand;
