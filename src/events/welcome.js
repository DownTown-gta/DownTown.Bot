const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "guildMemberAdd",
  async execute(member) {
    const welcomeChannelId = process.env.WELCOME_CHANNEL; // Replace with your welcome channel ID
    const autoRoleId = process.env.WELCOME_ROLE_ID; // Replace with the ID of the role you want to assign

    const channel = member.guild.channels.cache.get(welcomeChannelId);
    if (!channel) return;

    // Auto role assign
    const role = member.guild.roles.cache.get(autoRoleId);
    if (role) {
      await member.roles.add(role).catch(console.error);
    }

    // Welcome embed
    const embed = new EmbedBuilder()
      .setColor("#00CFFF")
      .setAuthor({
        name: "CRYSTAL ROLEPLAY",
        iconURL:
          "https://r2.fivemanage.com/BlnxrKfJGmkvrHn8FlEdF/crystalroleply_bg.png",
      }) // Optional: Add your server icon
      .setTitle(`ᴡᴇʟᴄᴏᴍᴇ ᴛᴏ ᴛʜᴇ ᴄɪᴛʏ ᴏꜰ ᴄʀʏꜱᴛᴀʟ`)
      .setThumbnail("https://r2.fivemanage.com/BlnxrKfJGmkvrHn8FlEdF/discord_logo.png")
      .setDescription(
        `<@${member.id}>!\n\n ᴡᴇ'ʀᴇ ᴇxᴄɪᴛᴇᴅ ᴛᴏ ʜᴀᴠᴇ ʏᴏᴜ ᴡɪᴛʜ ᴜꜱ — ʏᴏᴜʀ ɴᴇᴡ \n\n ᴀᴅᴠᴇɴᴛᴜʀᴇ ꜱᴛᴀʀᴛꜱ ʜᴇʀᴇ!
                                ɢᴇᴛ ʀᴇᴀᴅʏ ᴛᴏ ᴇxᴘᴇʀɪᴇɴᴄᴇ ɴᴇxᴛ-ʟᴇᴠᴇʟ ʀᴘ ɪɴ ᴛʜᴇ ᴡᴏʀʟᴅ ᴏꜰ ᴄʀʏꜱᴛᴀʟ ᴄɪᴛʏ. 🌟 ✨`
      )
      .setImage("https://media.discordapp.net/attachments/1246352925945757801/1361264545347145859/ff81dee1dcdd40d560569fe2ae94b6d3.gif?ex=67fe1fe6&is=67fcce66&hm=355574fcc9cb9a06f97799d0650fc6c3c974feb1ffd36cece151caf2e508ce77&=") // Replace with your welcome GIF link
      .setFooter({ text: "@CRYSTAL ROLEPLAY" });

    await channel.send({ embeds: [embed] });
  },
};
