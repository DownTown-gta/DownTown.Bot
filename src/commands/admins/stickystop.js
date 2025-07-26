
require('dotenv').config();
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { stickyMessages } = require('./sticky');
const ADMIN_ROLE_ID = process.env.ADMIN_ROLE_ID;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stopsticky')
    .setDescription('Remove the sticky message from this channel.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const member = interaction.member;
    if (!member.roles.cache.has(ADMIN_ROLE_ID)) {
      return interaction.reply({ content: '❌ You do not have permission to use this command.', ephemeral: true });
    }

    const channel = interaction.channel;
    if (!stickyMessages.has(channel.id)) {
      return interaction.reply({ content: '❌ No sticky message set in this channel.', ephemeral: true });
    }

    stickyMessages.delete(channel.id);
    return interaction.reply({ content: '🧹 Sticky message removed.', ephemeral: true });
  }
};
