const { MessageFlags } = require('discord-api-types/v10');
const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits
} = require('discord.js');

const ADMIN_ROLE_ID = process.env.ADMIN_ROLE; // Make sure this exists in your .env

module.exports = {
  data: new SlashCommandBuilder()
    .setName('staffping-setup')
    .setDescription('Send staff availability panel')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    // Check if member has ADMIN_ROLE
    if (!interaction.member.roles.cache.has(ADMIN_ROLE_ID)) {
      return interaction.reply({
        content: '❌ You do not have permission to use this command.',
        ephemeral: true
      });
    }

    const embed = new EmbedBuilder()
      .setTitle('👨‍💼 Staff Availability')
      .setDescription('Check if staff are online or request assistance.')
      .setColor('Blurple');

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('check-staff')
        .setLabel('Check Staff Availability')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('ping-staff')
        .setLabel('Ping Staff')
        .setStyle(ButtonStyle.Danger)
    );

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    await interaction.deleteReply();

    await interaction.channel.send({
      embeds: [embed],
      components: [row]
    });
  }
};
