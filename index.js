const Discord = require('discord.js');
const config = require('./config.json');
let data = require('./data.json');
const fs = require('fs'); //allows reading and writing to json file
const client = new Discord.Client();
const Database = require("@replit/database");
const db = new Database();



client.once('ready', async () => {
  console.log('ready');
  data = await db.get("jsonData");
  writeToJson(data);
});

//Creates data for server upon bot joining
client.on("guildCreate", async function(guild) {
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
  setJsonData(await data);
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
        setJsonData(await data);

        message.channel.send("<@" + userId + "> has successfully been added to the hit list!");

      }

      // add user id to json
    }

  } catch (err) {
    console.log("add failed");
    console.log(err);
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
        setJsonData(await data);
        message.channel.send("<@" + userId + "> has been removed from the hit list. :(");

      } else {

        message.channel.send("<@" + userId + "> isn't even on the hit list!");

      }


      // remove user id from json
    }

  } catch (err) {
    console.log("remove failed");
    console.log(err)
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
    setJsonData(await data);

  }

  if (message.content == "I am alive!" && message.author.bot) {
    let serverData = data.Guilds[guildname].ServerData;
    let webhook = await message.fetchWebhook(message.webhookID);
    serverData['webhookToken'] = webhook.token;
    serverData['webhookId'] = webhook.id;
    serverData['webhookURL'] = webhook.url;
    writeToJson(data);
    setJsonData(await data);
  }


  //shortcut command backup plan
  if (message.content == "$shortcut") {
    let serverData = data.Guilds[guildname].ServerData;
    message.author.send('To use the $dc command with siri, follow the instructions below: \n'
      + '1. If you know someone who has this shortcut already, ask them to send it to you, and do step _. If not, go the shortcuts app and make a new shortcut. \n'
      + '2. Press "Add Action" => "Scripting" => "Choose from Menu" \n'
      + '3. List every user you want to able to disconnect in the textboxes. Keep in mind, you will have to add the commands for every user you make, so try not to add too many. \n '
      + 'The following steps will be the same for every user: \n'
      + '4. Press the "+" button, then go to "web" => "URL" \n'
      + '5. Paste the following link into the URL textbox: \n'
      + serverData['webhookURL'] + '\n'
      + '6. Press the "+" button, then go to "web" => "Get Contents of URL"'
      + '7. Press "Method" and select "POST" and make sure the Request Body is JSON'
      + '8. Press "Add new field," select "Text," in the "Key" box type in "content," and in the "text" box type in "cya later <@ [USER ID HERE] >!"'
      + '9. Thats it! Just make sure those 2 commands are underneath each name with their proper user IDs'
    );
  }

  if (message.content == "$testdb") {
    console.log(await getJsonData());
  }


  //dc function 
  try {

    if (message.content.includes('cya later') && message.author.bot) {
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
  fs.writeFile("./data.json", JSON.stringify(data, null, 4), function(err) {
    if (err) throw err;
  });
}

async function getJsonData() {
  return db.get("jsonData");
}

async function setJsonData(data) {
  db.set("jsonData", data)
  
}