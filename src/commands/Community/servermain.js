const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { MessageFlags } = require('discord-api-types/v10');

const ADMIN_ROLE = process.env.ADMIN_ROLE // base admin role ID

module.exports = {
  data: new SlashCommandBuilder()
    .setName('server-maint')
    .setDescription('Command for server maintenance'),

  async execute(interaction) {
    const memberRoles = interaction.member.roles.cache;
    
    // Check if the user has the base admin role or higher
    const hasPermission = memberRoles.some(role => {
      const rolePosition = interaction.guild.roles.cache.get(role.id)?.position || 0;
      const adminRolePosition = interaction.guild.roles.cache.get(ADMIN_ROLE)?.position || 0;
      return rolePosition >= adminRolePosition;
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
        name: 'Crystal is Under Maintenance',
        value: '```We will be back Soon!```'
      })
      .setImage('https://r2.fivemanage.com/BlnxrKfJGmkvrHn8FlEdF/maintenances.png');

    // Send public announcement as bot
    await interaction.channel.send({
      content: "@everyone",
      embeds: [embed]
    });

    // Reply to the slash user silently
    await interaction.reply({
      content: "✅ Announcement sent.",
      flags: MessageFlags.Ephemeral
    });
  }
};
