require('dotenv').config();
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

const stickyMessages = new Map(); // ChannelID -> { content, messageId }
const ADMIN_ROLE_ID = process.env.ADMIN_ROLE_ID;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('sticky')
    .setDescription('Send a sticky message that stays at the bottom of the chat.')
    .addStringOption(option =>
      option.setName('message')
        .setDescription('The sticky message to send')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const member = interaction.member;
    if (!member.roles.cache.has(ADMIN_ROLE_ID)) {
      return interaction.reply({ content: '❌ You do not have permission to use this command.', ephemeral: true });
    }

    const content = interaction.options.getString('message');
    const channel = interaction.channel;

    const sentMessage = await channel.send(content);
    stickyMessages.set(channel.id, { content, messageId: sentMessage.id });

    await interaction.reply({ content: '✅ Sticky message set!', ephemeral: true });
  },

  stickyMessages
};
