const Discord = require('discord.js');
const config = require('./config.json')
const client = new Discord.Client();
const webhookClient = new Discord.WebhookClient(config.webhook_id, config.webhook_token);

client.once('ready', () => {
    console.log('ready');
});



client.login(config.bot_token);


client.on("message", async message => {
        if(message.content == "later chris" && message.author.bot) {

            let user =  await client.users.fetch("292885865074655242");
            let chris = message.guild.member(user);
            chris.voice.kick();

        } else if(message.content == "cya ismail" && message.author.bot) {

            let user =  await client.users.fetch("132331615056691200");
            let ismail = message.guild.member(user);
            ismail.voice.kick();

        } else if(message.content == "cya michael" && message.author.bot) {

            let user =  await client.users.fetch("191754197203550208");
            let michael = message.guild.member(user);
            michael.voice.kick();

        } else if(message.content == "cya marcus" && message.author.bot) {

            let user =  await client.users.fetch("216326109862690816");
            let marcus = message.guild.member(user);
            marcus.voice.kick();

        }
});