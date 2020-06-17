module.exports = {
	name: 'change',
	description: 'Changes things around.',
	execute(message, args) {

        var guild = message.guild;
        var users = guild.members;

        // Need this because bots can't edit owners
        var baileyID = '189200564020707328';

        var usernames = [];
        var userIDs = [];

        // Grab all the usernames in the server besides mine and the bots
        users.forEach(element => {
            if (element.user.id != baileyID && !element.user.bot) {
                usernames.push(element.user.username);
                userIDs.push(element.user.id);
            }
        })

        // Loop through all the users and update their usernames
        users.forEach(element => {
            if (element.user.id != baileyID && !element.user.bot) {
                var currentUsername = element.user.username;
                // Grab a random username from the list
                var userName = usernames[Math.floor(Math.random() * usernames.length)];

                // make sure we're not just updating the username to the same thing, that's boring
                while (userName == currentUsername && usernames.length > 1) {
                    userName = usernames[Math.floor(Math.random() * usernames.length)];
                }
    
                // Get the index of the new username and remove it from the list so two people can't have the same usernames
                var index = usernames.indexOf(userName);
                element.setNickname(userName);
                usernames.splice(index, 1);
            }
        })

        return message.channel.send('Changing things up.');

	},
};