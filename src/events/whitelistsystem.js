const { MessageFlags } = require('discord-api-types/v10');
const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle
} = require('discord.js');
require('dotenv').config();

function generateID() {
  return 'APP-' + Math.random().toString(36).substring(2, 10).toUpperCase();
}

module.exports = {
  name: 'interactionCreate',
  async execute(interaction) {
    if (interaction.isButton()) {
      const [action, userId, appId] = interaction.customId.split('-');

      if (interaction.customId === 'get-whitelist') {
        const modal = new ModalBuilder()
          .setCustomId('whitelist-application')
          .setTitle('Whitelist Application');

        const realName = new TextInputBuilder()
          .setCustomId('realName')
          .setLabel("Real Name")
          .setStyle(TextInputStyle.Short)
          .setRequired(true);

        const igName = new TextInputBuilder()
          .setCustomId('igName')
          .setLabel("In Game Name")
          .setStyle(TextInputStyle.Short)
          .setRequired(true);

        const experience = new TextInputBuilder()
          .setCustomId('experience')
          .setLabel("RP Experience")
          .setStyle(TextInputStyle.Short)
          .setRequired(true);

        const readRules = new TextInputBuilder()
          .setCustomId('readRules')
          .setLabel("Have you read the rules? (yes/no)")
          .setStyle(TextInputStyle.Short)
          .setRequired(true);

        modal.addComponents(
          new ActionRowBuilder().addComponents(realName),
          new ActionRowBuilder().addComponents(igName),
          new ActionRowBuilder().addComponents(experience),
          new ActionRowBuilder().addComponents(readRules)
        );

        return await interaction.showModal(modal);
      }

      // REVIEW
      if (action === 'review') {
        try {
          const member = await interaction.guild.members.fetch(userId);
          const pendingRole = interaction.guild.roles.cache.get(process.env.WHITELIST_PENDING_ROLE_ID);
          await member.roles.add(pendingRole);

          const embed = new EmbedBuilder()
            .setTitle('👮‍♂️ Visa Under Review')
            .setDescription(`<@${userId}> Your Visa Application is Reviewing By Our Team`)
            .addFields(
              { name: "Note", value: "Read city rules and guidelines for voice verification!", inline: false }
            )
            .setThumbnail(member.displayAvatarURL({ dynamic: true }))
            .setImage("https://r2.fivemanage.com/BlnxrKfJGmkvrHn8FlEdF/pending.png")
            .setColor('Yellow')
            .setTimestamp();

          const pendingChannel = await interaction.guild.channels.fetch(process.env.PENDING_CHANNEL_ID);
          await pendingChannel.send({ embeds: [embed] });

          // Disable Review & Show Accept + Reject
          const disabledReviewRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId(`review-${userId}-${appId}`)
              .setLabel('🟡 Review')
              .setStyle(ButtonStyle.Secondary)
              .setDisabled(true)
          );

          const acceptRejectRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId(`accept-${userId}-${appId}`)
              .setLabel('✅ Accept')
              .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
              .setCustomId(`reject-${userId}-${appId}`)
              .setLabel('❌ Reject')
              .setStyle(ButtonStyle.Danger)
          );

          await interaction.message.edit({ components: [disabledReviewRow, acceptRejectRow] });

          await interaction.reply({ content: `✅ Marked <@${userId}> as pending.`, ephemeral: true });

        } catch (error) {
          console.error('❌ Error marking as pending:', error);
          return interaction.reply({ content: 'Failed to mark user as pending.', ephemeral: true });
        }
      }

      // ACCEPT
      if (action === 'accept') {
        try {
          const member = await interaction.guild.members.fetch(userId);
          const acceptedRole = interaction.guild.roles.cache.get(process.env.WHITELIST_ACCEPTED_ROLE_ID);
          const pendingRole = interaction.guild.roles.cache.get(process.env.WHITELIST_PENDING_ROLE_ID);
          await member.roles.add(acceptedRole);
          if (pendingRole) await member.roles.remove(pendingRole);

          const embed = new EmbedBuilder()
            .setTitle('🌆 Visa Application Accepted')
            .setDescription(`<@${userId}> your visa application has been accepted \n\n **Welcome to CRYSTAL ROLEPLAY**`)
            .addFields(
              { name: "Note", value: "Always follow city rules and get involved. \n\n If you need any help create a ticket", inline: false }
            )
            .setThumbnail(member.displayAvatarURL({ dynamic: true }))
            .setColor('Green')
            .setImage("https://r2.fivemanage.com/BlnxrKfJGmkvrHn8FlEdF/accepted.png")
            .setTimestamp();

          const acceptedChannel = await interaction.guild.channels.fetch(process.env.ACCEPTED_CHANNEL_ID);
          await acceptedChannel.send({ embeds: [embed] });

          await member.send(`🎉 Congratulations! Your whitelist application has been accepted.`)
            .catch(() => console.log('Failed to DM user'));

          await interaction.reply({ content: `✅ Accepted <@${userId}>.`, ephemeral: true });

          // Disable all buttons
          const disabledComponents = interaction.message.components.map(row => {
            return new ActionRowBuilder().addComponents(
              row.components.map(button => ButtonBuilder.from(button).setDisabled(true))
            );
          });

          await interaction.message.edit({ components: disabledComponents });

        } catch (error) {
          console.error('❌ Error accepting application:', error);
          return interaction.reply({ content: 'Failed to accept application.', ephemeral: true });
        }
      }

      // REJECT
      if (action === 'reject') {
        try {
          const member = await interaction.guild.members.fetch(userId);
          const pendingRole = interaction.guild.roles.cache.get(process.env.WHITELIST_PENDING_ROLE_ID);
          if (pendingRole) await member.roles.remove(pendingRole);

          const embed = new EmbedBuilder()
            .setTitle('❌ Visa Rejected')
            .setDescription(`<@${userId}> Your Visa Application is rejected.`)
            .setColor('Red')
            .addFields(
              { name: "Note", value: "Go through the rules and try again for visa!", inline: false }
            )
            .setThumbnail(member.displayAvatarURL({ dynamic: true }))
            .setImage("https://r2.fivemanage.com/BlnxrKfJGmkvrHn8FlEdF/rejected.png")
            .setTimestamp();

          const rejectedChannel = await interaction.guild.channels.fetch(process.env.REJECTED_CHANNEL_ID);
          await rejectedChannel.send({ embeds: [embed] });

          await member.send(`❌ Your whitelist application has been rejected. You may retry later.`)
            .catch(() => console.log('Failed to DM user'));

          await interaction.reply({ content: `❌ Rejected <@${userId}>.`, ephemeral: true });

          // Disable all buttons
          const disabledComponents = interaction.message.components.map(row => {
            return new ActionRowBuilder().addComponents(
              row.components.map(button => ButtonBuilder.from(button).setDisabled(true))
            );
          });

          await interaction.message.edit({ components: disabledComponents });

        } catch (error) {
          console.error('❌ Error rejecting application:', error);
          return interaction.reply({ content: 'Failed to reject application.', ephemeral: true });
        }
      }
    }

    // WHITELIST FORM SUBMIT
    if (interaction.isModalSubmit() && interaction.customId === 'whitelist-application') {
      const realName = interaction.fields.getTextInputValue('realName');
      const igName = interaction.fields.getTextInputValue('igName');
      const experience = interaction.fields.getTextInputValue('experience');
      const readRules = interaction.fields.getTextInputValue('readRules');
      const appId = generateID();
      const user = interaction.user;

      const embed = new EmbedBuilder()
        .setTitle('📩 New Whitelist Application')
        .addFields(
          { name: 'Applicant', value: `<@${user.id}> (${user.tag})`, inline: false },
          { name: 'Application ID', value: appId, inline: false },
          { name: 'Real Name', value: realName, inline: true },
          { name: 'Ig Name', value: igName, inline: true },
          { name: 'Experience', value: experience, inline: false },
          { name: 'Read Rules?', value: readRules, inline: true }
        )
        .setColor('Blue')
        .setTimestamp();

      const buttons = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`review-${user.id}-${appId}`)
          .setLabel('🟡 Review')
          .setStyle(ButtonStyle.Secondary)
      );

      try {
        const staffChannel = await interaction.guild.channels.fetch(process.env.STAFF_REVIEW_CHANNEL_ID);
        await staffChannel.send({ embeds: [embed], components: [buttons] });
        await interaction.reply({ content: `✅ Application submitted. Your ID is \`${appId}\`.`, flags: MessageFlags.Ephemeral });
        await user.send(`📝 Your whitelist application has been submitted.\n📄 Application ID: \`${appId}\``)
          .catch(() => console.log('Could not DM user.'));
      } catch (err) {
        console.error('❌ Error sending application:', err);
        await interaction.reply({ content: 'Failed to submit application.', flags: MessageFlags.Ephemeral });
      }
    }
  }
};
