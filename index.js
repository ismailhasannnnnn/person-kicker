const Discord = require('discord.js');
const config = require('./config.json');
let data = require('./data.json');
const fs = require('fs'); //allows reading and writing to json file
const client = new Discord.Client();
const Database = require("@replit/database");
const db = new Database();

const {
  actionOutput,
  buildShortcut,
  withVariables,
} = require('@joshfarrant/shortcuts-js');

const {
  URL,
  getContentsOfURL
} = require('@joshfarrant/shortcuts-js/actions');



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
    }
  }

  data.Guilds[guildName] = newJson;
  writeToJson(data);
  setJsonData(await data);
});



client.login(config.bot_token);


//command list - (start with $)
client.on("message", async message => {

  let guildname = message.guild.name.replace(/\s+/g, '');

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
  if (message.content.startsWith("$shortcut") && message.content.includes('@')) {
    let serverData = data.Guilds[guildname].ServerData;
    let userId = message.mentions.members.first().id;
    let userName = message.mentions.members.first().displayName;
    let webhookUrl = serverData.webhookURL;
    let shortcutMuteName = userName + '_Mute.shortcut';
    let shortcutDcName = userName + '_Dc.shortcut';
    let dcPath = "./" + shortcutDcName;
    let mutePath = "./" + shortcutMuteName;

    makeMuteShortcut(webhookUrl, userId, userName);
    makeDcShortcut(webhookUrl, userId, userName);
    await message.author.send("In order to use Captain Hook to his fullest potential, you need an iOS shortcut! \n"
    + "1. Click this link, and then click 'Get Shortcut:' https://www.icloud.com/shortcuts/f30d01c66d4b4d4f890f445c0ba02db1 \n"
    + "2. From there, download the shortcut you generated below, and save it to 'Documents' under the iCloud Drive. \n"
    + "3. Now, run the 'Convert .shortcut to iCloud Link' shortcut, and select the shortcut you generated! \n"
    + "4. Once again, add the shortcut to your shortcuts, and rename it to 'kick {person's name goes here}'. \n"
    + "5. You're done! Enjoy kicking people when they make stupid jokes.");
    await message.author.send("Here are the shortcut you generated!", { files: [dcPath, mutePath] });

    deleteShortcut(dcPath);
    deleteShortcut(mutePath);
    console.clear();

  }

  if (message.content.startsWith('$shortcut music')) {

  }

  //dc function 
  try {

    if (message.content.includes('cya later') && message.author.bot) {
      let userId = message.mentions.members.first().id;
      let userName = message.mentions.members.first().displayName;
      let userData = data.Guilds[guildname].UserData;

      var member = message.mentions.members.first();
      member.voice.kick();

    }

  } catch (err) {
    console.log("$dc failed");
  }

  try {
    if(message.content.includes('shut up') && message.author.bot) {
      let userId = message.mentions.members.first().id;
      let userName = message.mentions.members.first().displayName;
      let userData = data.Guilds[guildname].UserData;

      var member = message.mentions.members.first();
      member.voice.setMute(true);
    }
  } catch (err) {
    console.log('mute failed');
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

function makeDcShortcut(webhookUrl, personID, userName) {
  const actions = [
    URL({
      url: webhookUrl,
    }),
    getContentsOfURL({
      headers: {},
      method: 'POST',
      requestBodyType: 'JSON',
      requestBody: {
        content: 'cya later <@' + personID + '>!',
      },
    }),
  ];

  const shortcut = buildShortcut(actions);

  let shortcutName = userName + '_Dc.shortcut';
  console.log(shortcutName);

  fs.writeFile(shortcutName, shortcut, (err) => {
    if (err) {
      console.log("something happened", err);
      return;
    }
    console.log("done");
  })
}

function makeMuteShortcut(webhookUrl, personID, userName) {
  const actions = [
    URL({
      url: webhookUrl,
    }),
    getContentsOfURL({
      headers: {},
      method: 'POST',
      requestBodyType: 'JSON',
      requestBody: {
        content: 'shut up <@' + personID + '>!',
      },
    }),
  ];

  const shortcut = buildShortcut(actions);

  let shortcutName = userName + '_Mute.shortcut';
  console.log(shortcutName);

  fs.writeFile(shortcutName, shortcut, (err) => {
    if (err) {
      console.log("something happened", err);
      return;
    }
    console.log("done");
  })
}

function deleteShortcut(path) {
  console.log(path);
  fs.unlink(path,function(err){
      if(err) return console.log(err);
      console.log('file deleted successfully');
  });  
}