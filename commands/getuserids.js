module.exports = {
	name: 'getuserids',
	description: 'Responds with each users ID that is currently on the discord channel',
	execute(message, args) {

        var guild = message.guild;
        var users = guild.members;

        var usersFormattedString = '';

        users.forEach(element => {
            usersFormattedString += element.user.id + ':' + element.user.username + '\n';
        })

        return message.channel.send(usersFormattedString);
	},
};