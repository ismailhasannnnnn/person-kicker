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

client.on("guildCreate", function (guild) {
    const fs = require('fs') //allows reading and writing to json file

    //check if server has data
    //let serverID = guild.id;

   if(!("Guilds" in data)) { 
        var gData = {
            Guilds : [] 
            
        }; 
   }
        let guildName = guild.name.replace(/\s+/g, ''); //removes whitespace from string
        let newJson = {
            [guildName]: {
                "ServerData": {
                    "serverId": guild.id
                },
                "UserData": []
            }
        }
    
        data.Guilds.push(newJson);
        fs.writeFile("./data.json", JSON.stringify(data, null, 4), function (err) {
            if (err) throw err;
            console.log('Saved!');
        });

    //create webhook
    //send webhook to server general chat
    //store webhook in json 
    //nice */
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