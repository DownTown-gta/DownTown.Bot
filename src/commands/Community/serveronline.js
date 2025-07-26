const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { MessageFlags } = require('discord-api-types/v10');

const ADMIN_ROLE = process.env.ADMIN_ROLE// Base admin role ID

module.exports = {
  data: new SlashCommandBuilder()
    .setName('server-online')
    .setDescription('Command for restarting server'),

  async execute(interaction) {
    const memberRoles = interaction.member.roles.cache;

    // Check if user has the admin role or higher
    const hasPermission = memberRoles.some(role => {
      const roleData = interaction.guild.roles.cache.get(role.id);
      const adminRoleData = interaction.guild.roles.cache.get(ADMIN_ROLE);
      return roleData && adminRoleData && roleData.position >= adminRoleData.position;
    });

    if (!hasPermission) {
      return await interaction.reply({
        content: "❌ You do not have permission to use this command.",
        flags: MessageFlags.Ephemeral
      });
    }

    const embed = new EmbedBuilder()
      .setColor('Blue')
      .setAuthor({
        name: "CRYSTAL ROLEPLAY",
        iconURL: "https://r2.fivemanage.com/BlnxrKfJGmkvrHn8FlEdF/crystalroleply_bg.png",
      })
      .setTitle('Announcement')
      .setThumbnail('https://r2.fivemanage.com/BlnxrKfJGmkvrHn8FlEdF/discord_logo.png')
      .setDescription('To Crystal Citizens 💙')
      .addFields({
        name: 'Crystal is Back Online',
        value: '```Enjoy Your Roleplay!```'
      })
      .setImage('https://r2.fivemanage.com/BlnxrKfJGmkvrHn8FlEdF/online.png');

    await interaction.channel.send({
      content: "@everyone",
      embeds: [embed]
    });

    await interaction.reply({
      content: "✅ Announcement sent.",
      flags: MessageFlags.Ephemeral
    });
  }
};
