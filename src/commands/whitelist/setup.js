const { MessageFlags } = require('discord-api-types/v10');
const {
    SlashCommandBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    PermissionFlagsBits
  } = require('discord.js');
  
  module.exports = {
    data: new SlashCommandBuilder()
      .setName('whitelist-setup')
      .setDescription('Send whitelist panel')
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  
    async execute(interaction) {
      const embed = new EmbedBuilder()
            .setAuthor({
        name: "CRYSTAL ROLEPLAY",
        iconURL:
          "https://r2.fivemanage.com/BlnxrKfJGmkvrHn8FlEdF/crystalroleply_bg.png",
      })
        .setTitle('📋 Whitelist Application')
        .setDescription('Click below to apply for whitelist to get started')
        .setColor('#00CFFF')
        .setImage('https://r2.fivemanage.com/BlnxrKfJGmkvrHn8FlEdF/whitelistapplcations.png')
        .setThumbnail('https://r2.fivemanage.com/BlnxrKfJGmkvrHn8FlEdF/discord_logo.png')
        .addFields(
            { name: "Note", value: "Give your legit information in application.applcations which are not with legit will be rejcted!", inline: false }
        );
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('get-whitelist')
          .setLabel('📝 Apply for Whitelist')
          .setStyle(ButtonStyle.Success)
      );
  
      await interaction.deferReply({ flags: MessageFlags.Ephemeral }); // hide command response
      await interaction.channel.send({ embeds: [embed], components: [row] });
      await interaction.editReply({ content: '✅ Whitelist panel sent.', flags: MessageFlags.Ephemeral });
    }
  };
  