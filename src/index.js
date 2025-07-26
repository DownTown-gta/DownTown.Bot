const { Client, GatewayIntentBits, Collection } = require('discord.js');

require('dotenv').config();
const fs = require('fs');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMembers
  ]
});

// Collections
client.commands = new Collection();

// Load commands & events
const functions = fs.readdirSync('./src/functions').filter(file => file.endsWith('.js'));
const commandFolders = fs.readdirSync('./src/commands');


(async () => {
  for (const file of functions) {
    require(`./functions/${file}`)(client);
  }
  client.handleCommnds(commandFolders, './src/commands');
  await client.login(process.env.TOKEN);
})();

// Slash command handler
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;
  const command = client.commands.get(interaction.commandName);
  if (!command) return;
  try {
    await command.execute(interaction, client); // pass client for music
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: '❌ There was an error while executing this command!',
      ephemeral: true
    });
  }
});
