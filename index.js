const Discord = require('discord.js');
const client = new Discord.Client();
const webhookClient = new Discord.WebhookClient("712808667321335879", "XOnu_VtbfHGqM4UFvH9IbMBkfVguiBMgux1JyhBkIqjDDbqvOueTThnlhnyv4rPCmuST");

client.once('ready', () => {
    console.log('ready');
});



client.login('NzEyNzg4MzYyOTM4ODEwMzc4.XsW2jQ.Vk7mG_GB0l0Jb4ZHpIWiZid3ehg');


client.on("message", async message => {
        if(message.content == "later chris" && message.author.bot) {

            let user =  await client.users.fetch("292885865074655242");
            let chris = message.guild.member(user);
            chris.voice.kick();
        }
});