const Discord = require('discord.js');
const config = require('./config.json');
const data = require('./data.json');
const client = new Discord.Client();
const webhookClient = new Discord.WebhookClient(config.webhook_id, config.webhook_token);

client.once('ready', () => {
    console.log('ready');
    //check if server has data
    //create webhook
    //store webhook in json
    //nice
});



client.login(config.bot_token);


client.on("message", async message => {
    console.log("working");
    if(message.content.startsWith('$add')){
        let user = message.mentions.members.first().id;
        // add user id to json
    }

    if(message.content.startsWith == "$remove"){
        let user = message.mentions.members.first().id;
        // remove user id from json, shift all elements over.
    }
});





/*
if(message.content == "later chris" && message.author.bot) {

            let user =  await client.users.fetch("292885865074655242");
            let chris = message.guild.member(user);
            chris.voice.kick();

        }
*/