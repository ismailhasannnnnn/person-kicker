const Discord = require('discord.js');
const config = require('./config.json')
const client = new Discord.Client();
const webhookClient = new Discord.WebhookClient(config.webhook_id, config.webhook_token);

client.once('ready', () => {
    console.log('ready');
});



client.login(config.bot_token);


client.on("message", async message => {
        
});





/*
if(message.content == "later chris" && message.author.bot) {

            let user =  await client.users.fetch("292885865074655242");
            let chris = message.guild.member(user);
            chris.voice.kick();

        }
*/