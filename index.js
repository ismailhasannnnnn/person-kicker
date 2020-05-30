const Discord = require('discord.js');
const config = require('./config.json');
const data = require('./data.json');
const fs = require('fs'); //allows reading and writing to json file
const client = new Discord.Client();
const webhookClient = new Discord.WebhookClient(config.webhook_id, config.webhook_token);

client.once('ready', () => {
    console.log('ready');
});

//Creates data for server upon bot joining
client.on("guildCreate", function (guild) {
    if (!("Guilds" in data)) {
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

//command list - (start with $)
client.on("message", async message => {

    let guildname = message.guild.name.replace(/\s+/g, '');



    //add command 
    try {

        if (message.content.startsWith('$add')) {
            let userId = message.mentions.members.first().id;
            let userName = message.mentions.members.first().displayName;
            let userData = data.Guilds[guildname].UserData;

            if (userName in userData) {

                message.channel.send("<@" + userId + "> is already in the hit list!");

            } else {

                data.Guilds[guildname].UserData[userName] = userId;
                writeToJson(data);

                message.channel.send("<@" + userId + "> has successfully been added to the hit list!");

            }

            // add user id to json
        }

    } catch (err) {
        console.log("add failed");
    }



    //remove command
    try {

        if (message.content.startsWith("$remove")) {
            let userId = message.mentions.members.first().id;
            let userName = message.mentions.members.first().displayName;
            let userData = data.Guilds[guildname].UserData;

            if (userName in userData) {

                delete data.Guilds[guildname].UserData[userName];
                writeToJson(data);
                message.channel.send("<@" + userId + "> has been removed from the hit list. :(");

            } else {

                message.channel.send("<@" + userId + "> isn't even on the hit list!");

            }


            // remove user id from json
        }

    } catch (err) {
        console.log("remove failed");
    }



    //dc command
    try {

        if (message.content.startsWith('$dc')) {
            let userId = message.mentions.members.first().id;
            let userName = message.mentions.members.first().displayName;
            let userData = data.Guilds[guildname].UserData;

            if (userName in userData) {

                message.channel.send("cya later <@" + userId + ">!");
                var member = message.mentions.members.first();
                member.voice.kick();

            } else {

                message.channel.send("<@" + userId + "> is not on the hit list!");

            }

            // add user id to json
        }

    } catch (err) {
        console.log("$dc failed");
    }



    //setchannel command
    if (message.content == "$setchannel") {

        let channelId = message.channel.id;
        let serverData = data.Guilds[guildname].ServerData;

        if ("webhookChannelId" in serverData) {
            if (serverData["webhookChannelId"] !== channelId) {
                serverData["webhookChannelId"] = channelId;
                message.channel.send("Webhook channel updated successfully!");

                let webhook = await client.fetchWebhook(serverData["webhookId"], serverData["webhookToken"]);
                webhook.edit({ channel: serverData["webhookChannelId"] });

            } else {
                message.channel.send("This is the same webhook channel!");
            }
        } else {
            serverData.webhookChannelId = channelId;
            let newWebhook = message.channel.createWebhook("Captain Hook", 'https://i.imgur.com/p2qNFag.png')
                .then(webhook => webhook.edit("Captain Hook", 'https://i.imgur.com/p2qNFag.png', 'channelId'))
                .then(wb => wb.send("I am alive!"))
        }

        writeToJson(data);
    }

    if (message.content == "I am alive!" && message.author.bot) {
        let serverData = data.Guilds[guildname].ServerData;
        let webhook = await message.fetchWebhook(message.webhookID);
        serverData['webhookToken'] = webhook.token;
        serverData['webhookId'] = webhook.id;
        serverData['webhookURL'] = webhook.url
        writeToJson(data);
    }


    //shortcut command backup plan
    if (message.content == "$shortcut") {
        let serverData = data.Guilds[guildname].ServerData;
        message.channel.send('To use the $dc command with siri, follow the instructions below: \n' 
        + '1. If you know someone who has this shortcut already, ask them to send it to you, and do step 3. If not, go the shortcuts app and make a new shortcut. \n' 
        + '2. Press "Add Action" => "Web" => "Url" \n'
        + '3. Paste the webhook link below into the "URL" textbox: \n '
        +  serverData['webhookURL'] + '\n'  
        + '4. Press the "+" button => "Web" => "Get Contents of URL" \n'
        + '5. Press "Show More," then select "Method" => "POST" \n'
        + '6. Make sure the Request Body is "JSON" \n'
        + '7. Press "Add new field" => "Text." In the key box type in "content," and in the text box type in cya later <@"  ');
    }

    //dc function 
    try {

        if (message.content.includes('Cya later') && message.author.bot) {
            let userId = message.mentions.members.first().id;
            let userName = message.mentions.members.first().displayName;
            let userData = data.Guilds[guildname].UserData;
            if (userName in userData) {

                message.channel.send("<@" + userId + ">! has been successfully disconnected");
                var member = message.mentions.members.first();
                member.voice.kick();

            } else {

                message.channel.send("<@" + userId + "> is not on the hit list!");

            }

            // add user id to json
        }

    } catch (err) {
        console.log("$dc failed");
    }



});


//writes to data.json 
function writeToJson(data) {
    fs.writeFile("./data.json", JSON.stringify(data, null, 4), function (err) {
        if (err) throw err;
    });
}














/*

let serverData = data.Guilds[guildname].ServerData;
const {
    buildShortcut,
} = require('@joshfarrant/shortcuts-js');

const {
    URL,
    getContentsOfURL,
} = require('@joshfarrant/shortcuts-js/actions');


const actions = [
    URL({
        url: serverData['webhookURL']
    }),
    getContentsOfURL({
        method: 'POST',
        requestBodyType: 'JSON',
        requestBody: {
            myObj: { 
                Content: 'cya loser',
            },
        }
    })
    
]

// Generate the Shortcut data
const shortcut = buildShortcut(actions);


// Write the Shortcut to a file in the current directory
fs.writeFile('kickSomeone.shortcut', shortcut, (err) => {
if (err) {
    console.error('Something went wrong :(', err);
    return;
}
console.log('Shortcut created!');
});


*/

/*
original dc code
if(message.content == "later chris" && message.author.bot) {

            let user =  await client.users.fetch("292885865074655242");
            let chris = message.guild.member(user);
            chris.voice.kick();

        }
    */