const Discord = require("discord.js");
const config = require("./config.json");
let data = require("./data.json");
const fs = require("fs"); //allows reading and writing to json file
const client = new Discord.Client();
const Database = require("@replit/database");
const db = new Database();

/**
 * ! IMPORT OF SHORTCUTS.JS LIBRARY
 */
const { buildShortcut } = require("@joshfarrant/shortcuts-js");

const { URL, getContentsOfURL } = require("@joshfarrant/shortcuts-js/actions");

/**
 *  * Code to execute once the Discord Bot has been booted and is ready to go. *
 */
client.once("ready", async () => {
  console.log("Captain Hook reporting for duty");
  data = await db.get("jsonData");
  writeToJson(data);
});

/**
 * * Code to execute once the bot joins a server for the first time. *
 */
client.on("guildCreate", async function (guild) {
  if (!("Guilds" in data)) {
    var gData = {
      Guilds: {},
    };
    writeToJson(gData);
  }

  let guildName = guild.name.replace(/\s+/g, ""); //removes whitespace from string
  let newJson = {
    ServerData: {
      serverId: guild.id,
    },
  };

  data.Guilds[guildName] = newJson;
  writeToJson(data);
  setJsonData(await data);
});

client.login(config.bot_token);

/**
 * ! BEGINNING OF COMMAND LIST
 */
client.on("message", async (message) => {
  let guildname = message.guild.name.replace(/\s+/g, "");

  /**
   * * SetChannel Command *
   */

  if (message.content == "$setchannel") {
    let channelId = message.channel.id;
    let serverData = data.Guilds[guildname].ServerData;

    if ("webhookChannelId" in serverData) {
      if (serverData["webhookChannelId"] !== channelId) {
        serverData["webhookChannelId"] = channelId;
        message.channel.send("Webhook channel updated successfully!");

        let webhook = await client.fetchWebhook(
          serverData["webhookId"],
          serverData["webhookToken"]
        );
        webhook.edit({ channel: serverData["webhookChannelId"] });
      } else {
        message.channel.send("This is the same webhook channel!");
      }
    } else {
      serverData.webhookChannelId = channelId;
      let newWebhook = message.channel
        .createWebhook("Captain Hook", "https://i.imgur.com/p2qNFag.png")
        .then((webhook) =>
          webhook.edit(
            "Captain Hook",
            "https://i.imgur.com/p2qNFag.png",
            "channelId"
          )
        )
        .then((wb) => wb.send("I am alive!"));
    }

    writeToJson(data);
    setJsonData(await data);
  }

  /**
   * * Update JSON with newly created Webhook Data.
   */

  if (message.content == "I am alive!" && message.author.bot) {
    let serverData = data.Guilds[guildname].ServerData;
    let webhook = await message.fetchWebhook(message.webhookID);
    serverData["webhookToken"] = webhook.token;
    serverData["webhookId"] = webhook.id;
    serverData["webhookURL"] = webhook.url;
    writeToJson(data);
    setJsonData(await data);
  }

  /**
   * * Shortcut Command *
   */

  if (
    message.content.startsWith("$shortcut") &&
    message.content.includes("@")
  ) {
    let serverData = data.Guilds[guildname].ServerData;
    let userId = message.mentions.members.first().id;
    let userName = message.mentions.members.first().displayName;
    let webhookUrl = serverData.webhookURL;
    let shortcutMuteName = userName + "_Mute.shortcut";
    let shortcutDcName = userName + "_Dc.shortcut";
    let dcPath = "./" + shortcutDcName;
    let mutePath = "./" + shortcutMuteName;

    makeMuteShortcut(webhookUrl, userId, userName);
    makeDcShortcut(webhookUrl, userId, userName);

    let dmEmbed = new Discord.MessageEmbed()
      .setColor("#F7D10F")
      .setTitle("iOS Shortcuts")
      .setAuthor('Ziploc & Dogbert')
      .setDescription('In order to use Captain Hook to his fullest potential, you need an iOS shortcut!')
      .addFields(
        {name: "Step 1", value: "Click this link, and then click 'Get Shortcut:' https://www.icloud.com/shortcuts/f30d01c66d4b4d4f890f445c0ba02db1"},
        {name: "Step 2", value: "From there, download the shortcut you generated below, and save it to 'Documents' under the iCloud Drive."},
        {name: "Step 3", value: "Now, run the 'Convert .shortcut to iCloud Link' shortcut, and select the shortcut you generated!"},
        {name: "Step 4", value: "Once again, add the shortcut to your shortcuts, and rename it to 'kick {person's name goes here}'."},
        {name: "Step 5", value: "You're done! Enjoy kicking people when they make stupid jokes."}
      )
      .attachFiles([dcPath, mutePath])

    // await message.author.send(
    //   "In order to use Captain Hook to his fullest potential, you need an iOS shortcut! \n" +
    //   "1. Click this link, and then click 'Get Shortcut:' https://www.icloud.com/shortcuts/f30d01c66d4b4d4f890f445c0ba02db1 \n" +
    //   "2. From there, download the shortcut you generated below, and save it to 'Documents' under the iCloud Drive. \n" +
    //   "3. Now, run the 'Convert .shortcut to iCloud Link' shortcut, and select the shortcut you generated! \n" +
    //   "4. Once again, add the shortcut to your shortcuts, and rename it to 'kick {person's name goes here}'. \n" +
    //   "5. You're done! Enjoy kicking people when they make stupid jokes."
    // );
    // await message.author.send("Here are the shortcut you generated!", {
    //   files: [dcPath, mutePath],
    // });

    deleteShortcut(dcPath);
    deleteShortcut(mutePath);
    console.clear();
  }

  /**
   *  * Disconnect Function *
   */

  try {
    if (message.content.includes("cya later") && message.author.bot) {
      let userId = message.mentions.members.first().id;
      let userName = message.mentions.members.first().displayName;
      let userData = data.Guilds[guildname].UserData;

      var member = message.mentions.members.first();
      member.voice.kick();
    }
  } catch (err) {
    console.log("$dc failed");
  }

  /**
   * * Mute Function *
   */

  try {
    if (message.content.includes("shut up") && message.author.bot) {
      let userId = message.mentions.members.first().id;
      let userName = message.mentions.members.first().displayName;
      let userData = data.Guilds[guildname].UserData;

      var member = message.mentions.members.first();
      member.voice.setMute(true);
    }
  } catch (err) {
    console.log("mute failed");
  }
});

/**
 * * Function which writes updated JSON data to the data.json file.
 * @param {JSON} data
 */
function writeToJson(data) {
  fs.writeFile("./data.json", JSON.stringify(data, null, 4), function (err) {
    if (err) throw err;
  });
}

/**
 * * Function to retrieve the Database in Replit
 * @returns database from replit
 */
async function getJsonData() {
  return db.get("jsonData");
}

/**
 * * Function to set the JSON Data that the bot created to the Replit Database.
 * @param {string} data
 */
async function setJsonData(data) {
  db.set("jsonData", data);
}

/**
 * * Function that uses ShortcutsJS library to generate the Disconnect iOS shortcut for the mentioned peron.
 * @param {string} webhookUrl
 * @param {string} personID
 * @param {string} userName
 */
function makeDcShortcut(webhookUrl, personID, userName) {
  const actions = [
    URL({
      url: webhookUrl,
    }),
    getContentsOfURL({
      headers: {},
      method: "POST",
      requestBodyType: "JSON",
      requestBody: {
        content: "cya later <@" + personID + ">!",
      },
    }),
  ];

  const shortcut = buildShortcut(actions);

  let shortcutName = userName + "_Dc.shortcut";
  console.log(shortcutName);

  fs.writeFile(shortcutName, shortcut, (err) => {
    if (err) {
      console.log("something happened", err);
      return;
    }
    console.log("done");
  });
}

/**
 * * Function that uses ShortcutsJS library to generate the Mute iOS shortcut for the mentioned peron.
 * @param {string} webhookUrl
 * @param {string} personID
 * @param {string} userName
 */
function makeMuteShortcut(webhookUrl, personID, userName) {
  const actions = [
    URL({
      url: webhookUrl,
    }),
    getContentsOfURL({
      headers: {},
      method: "POST",
      requestBodyType: "JSON",
      requestBody: {
        content: "shut up <@" + personID + ">!",
      },
    }),
  ];

  const shortcut = buildShortcut(actions);

  let shortcutName = userName + "_Mute.shortcut";
  console.log(shortcutName);

  fs.writeFile(shortcutName, shortcut, (err) => {
    if (err) {
      console.log("something happened", err);
      return;
    }
    console.log("done");
  });
}

/**
 * * Function used to delete the shortcut generated once it has been sent to the user. *
 * @param {string} path The path where the generated shortcut is.
 */
function deleteShortcut(path) {
  console.log(path);
  fs.unlink(path, function (err) {
    if (err) return console.log(err);
    console.log("file deleted successfully");
  });
}
