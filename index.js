const Discord = require('discord.js');
const config = require('./config.json')
const client = new Discord.Client();
const webhookClient = new Discord.WebhookClient(config.webhook_id, config.webhook_token);

client.once('ready', () => {
    console.log('ready');
});

client.guildCreate("guildCreate",function(guild){
    const fs = require('fs') //allows reading and writing to json file

    //check if server has data
    //let serverID = client.guilds.id;
    
    fs.readFile('./data.json', (err, jsonString) => {
        if (err) {
            console.log("File read failed:", err)
            return
        }
        try {
            const guildInfo = JSON.parse(jsonString)
    } catch(err) {
            console.log('Error parsing JSON string:', err)
        } 
    })

    //create webhook
    //send webhook to server general chat
    //store webhook in json 
    //nice
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