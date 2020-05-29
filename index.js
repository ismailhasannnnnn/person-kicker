const Discord = require('discord.js');
const config = require('./config.json');
const data = require('./data.json');
const fs = require('fs'); //allows reading and writing to json file
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

    //check if server has data
    //let serverID = guild.id;

    if(!("Guilds" in data)){
        var gData = {
            Guilds : {}
        }
        writeToJson(gData);
    }

        let guildName = guild.name.replace(/\s+/g, ''); //removes whitespace from string
        let newJson = {
                "ServerData": {
                    "serverId": guild.id
                },
                "UserData": []
        }
    
        data.Guilds[guildName] = newJson;
        writeToJson(data);

    //create webhook
    //send webhook to server general chat
    //store webhook in json 
    //nice */
}); 



client.login(config.bot_token);


client.on("message", async message => {
    
    let guildname = message.guild.name.replace(/\s+/g, '');

    if (message.content.startsWith('$add')) {
            let userId = message.mentions.members.first().id;
            let userName = message.mentions.members.first().displayName;

            data.Guilds[guildname].UserData[userName] = userId;
            writeToJson(data);

        
        // add user id to json
    }

    if (message.content.startsWith == "$remove") {
        let user = message.mentions.members.first().id;
        // remove user id from json, shift all elements over.
    }

    if (message.content == "$setchannel") {

        let channelId = message.channel.id;
        let serverData = data.Guilds[guildname].ServerData;

        if ("webhookChannelId" in serverData) {
            if (serverData["webhookChannelId"] !== channelId) {
                serverData["webhookChannelId"] = channelId;
                message.channel.send("Webhook channel updated successfully!");
            } else {
                message.channel.send("This is the same webhook channel!");
            }
        } else {
            serverData.webhookChannelId = channelId;
            message.channel.send("Webhook set to send messages to this channel!");
        }

        writeToJson(data);
    }
});

function writeToJson(data){
    fs.writeFile("./data.json", JSON.stringify(data, null, 4), function (err) {
        if (err) throw err;
    });
}



/*
if(message.content == "later chris" && message.author.bot) {

            let user =  await client.users.fetch("292885865074655242");
            let chris = message.guild.member(user);
            chris.voice.kick();

        }
    */ 