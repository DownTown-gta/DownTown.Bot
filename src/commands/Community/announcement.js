const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
require('dotenv').config();
const { MessageFlags } = require('discord-api-types/v10');
module.exports = {
  data: new SlashCommandBuilder()
    .setName('announce')
    .setDescription('Send an announcement embed to a channel')
    .addStringOption(option =>
      option.setName('title')
        .setDescription('Embed title')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('message')
        .setDescription('Embed message')
        .setRequired(true))
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Channel to send the embed')
        .setRequired(true))
    .setDMPermission(false), // No DM usage

  async execute(interaction) {
    const adminRoleId = process.env.ADMIN_ROLE || '1361333504281022596';
    const member = interaction.member;
    const authorHighest = member.roles.highest;
    const adminRole = interaction.guild.roles.cache.get(adminRoleId);

    if (!adminRole || authorHighest.position < adminRole.position) {
      return await interaction.reply({
        content: `❌ You do not have permission to use this command.`,
        flags: MessageFlags.Ephemeral
      });
    }

    const title = interaction.options.getString('title');
    const message = interaction.options.getString('message');
    const channel = interaction.options.getChannel('channel');

    const embed = new EmbedBuilder()
      .setTitle(title)
      .setDescription(message)
      .setColor('Blue')
      .setTimestamp()
      .setFooter({ text: `Sent by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) });

    try {
      await channel.send({ embeds: [embed] });
      await interaction.reply({ content: '✅ Announcement sent.', ephemeral: true });
    } catch (error) {
      console.error('Failed to send announcement:', error);
      await interaction.reply({ content: '❌ Failed to send the announcement.', ephemeral: true });
    }
  }
};
