module.exports = {
	name: 'toast',
	description: 'Calculates the number of toasts you could have every day depending on your salary. Also can do the reverse of that calculation.',
	execute(message, args) {
        if (args.length < 2) return message.channel.send('Arguments required: [toast/salary] [pieces of toast/annual salary]');

        if (args[0].toUpperCase() == 'TOAST') {
            var toastsAsInt = parseInt(args[1]);
            if (toastsAsInt > 0) {
                var numberOfLoafsPerDay = toastsAsInt / 20;

                var amountPerDay = numberOfLoafsPerDay * 2.55;

                var burntToasts = Math.floor((Math.random() * amountPerDay) + 1);
                var newAmount = amountPerDay - burntToasts;

                var potentialAnnualSalary = amountPerDay * 240;
                var burntAnnualSalary = newAmount * 240;

                message.channel.send("Your potential annual salary for that number of toasts was $" + potentialAnnualSalary.toFixed(2) + ", but you had " + burntToasts + " burnt toasts, so your new salary is $" + burntAnnualSalary.toFixed(2), {files:['../YikesBot/imgs/toast.jpeg']});
                return;
            }

        }
        else if (args[0].toUpperCase() == 'SALARY') {
            args[1] = args[1].replace(/\$/g, '');
            args[1] = args[1].replace(/\,/g, '');
            
            var salaryAsInt = parseFloat(args[1]);
            if (salaryAsInt > 0) {
                var numberOfLoafs = salaryAsInt / 2.55;

                var totalPiecesOfBread = numberOfLoafs * 20;

                var numberOfPiecesPerDay = totalPiecesOfBread / 240;

                if (numberOfPiecesPerDay < 1) {
                    message.channel.send("Number of toasts you can have per day: " + numberOfPiecesPerDay.toFixed(2), {files:['../YikesBot/imgs/toast.jpeg']});
                }
                else {
                    var burntToasts = Math.floor((Math.random() * numberOfPiecesPerDay) + 1);

                    var newSalary = (((numberOfPiecesPerDay - burntToasts) * 240) / 20) * 2.55;

                    message.channel.send("Number of toasts you can have per day: " + parseInt(numberOfPiecesPerDay) + ". But " + burntToasts + " toasts were burnt, so your new salary is $" + newSalary.toFixed(2), {files:['../YikesBot/imgs/toast.jpeg']});
                }
                return;
            }
        }
        else return message.channel.send('Invalid first argument. Must either be \'toast\' or \'salary\'');
	},};



