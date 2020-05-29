const Discord = require('discord.js');
const config = require('./config.json');
const data = require('./data.json');
const fs = require('fs'); //allows reading and writing to json file
const client = new Discord.Client();
const webhookClient = new Discord.WebhookClient(config.webhook_id, config.webhook_token);

client.once('ready', () => {
    console.log('ready');
});

//Creates data for server upon bot joining server
client.on("guildCreate", function (guild) {

   if(!("Guilds" in data)) { 
        var gData = {
            Guilds: {}
        }
        writeToJson(gData);
    }

    let guildName = guild.name.replace(/\s+/g, ''); //removes whitespace from string
    let newJson = {
        "ServerData": {
            "serverId": guild.id
        },
        "UserData": {}
    }

    data.Guilds[guildName] = newJson;
    writeToJson(data);
});



client.login(config.bot_token);


client.on("message", async message => {

    let guildname = message.guild.name.replace(/\s+/g, '');

    try{

        if (message.content.startsWith('$add')) {
            let userId = message.mentions.members.first().id;
            let userName = message.mentions.members.first().displayName;
            let userData = data.Guilds[guildname].UserData;
    
            if (userName in userData) {
    
                message.channel.send("<@" + userId + "> is already in the kicking list!");
    
            } else {
    
                data.Guilds[guildname].UserData[userName] = userId;
                writeToJson(data);
    
                message.channel.send("<@" + userId + "> has successfully been added to the kicking list!");
    
            }
    
            // add user id to json
        }

    }catch(err){
        console.log("add failed");
    }
    

    try {

        if (message.content.startsWith("$remove")) {
            let userId = message.mentions.members.first().id;
            let userName = message.mentions.members.first().displayName;
            let userData = data.Guilds[guildname].UserData;
    
            if (userName in userData) {
    
                delete data.Guilds[guildname].UserData[userName];
                writeToJson(data);
                message.channel.send("<@" + userId + "> has been removed from the kicking list. :(");
    
            } else {
    
                message.channel.send("<@" + userId + "> isn't even on the kicking list!");
    
            }
    
    
            // remove user id from json
        }

    }catch(err){
        console.log("remove failed");
    }

    if (message.content == "$setchannel") {

        let channelId = message.channel.id;
        let serverData = data.Guilds[guildname].ServerData;

        if ("webhookChannelId" in serverData) {
            if (serverData["webhookChannelId"] !== channelId) {
                serverData["webhookChannelId"] = channelId;
                message.channel.send("Webhook channel updated successfully!");

                message.channel.createWebhook("Captain Hook", 'https://i.imgur.com/p2qNFag.png')
                .then(webhook => webhook.edit("Captain Hook", 'https://i.imgur.com/p2qNFag.png'))


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

function writeToJson(data) {
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