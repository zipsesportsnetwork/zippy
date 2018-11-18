module.exports = async (c, s) => {
    const { client } = await (await s).discord;

    client.on('raw', async (packet) => {
        const {
            discord,
            discord_games: mappings,
            _discord_channels: channels,
        } = c.get();

        const guild = client.guilds.get(discord.guild);

        // discord.js apparently doesn't bother caching reactions on old
        // messages (even if we `fetchMessages`), so we have to manually parse
        // packets to do this
        //
        // kill me

        if (![
            'MESSAGE_REACTION_ADD', 'MESSAGE_REACTION_REMOVE',
        ].includes(packet.t) || packet.d.channel_id !== channels.picker) {
            return;
        }

        const { emoji, user_id } = packet.d;

        if (emoji.id === null || guild.emojis.has(emoji.id)) {
            const mapped = mappings[emoji.name];

            if (typeof mapped !== 'undefined') {
                const member = await guild.fetchMember(user_id);
                const role = guild.roles.find((r) => r.name === mapped);

                if (typeof role === 'undefined') return;

                if (packet.t === 'MESSAGE_REACTION_ADD') {
                    await member.addRole(role);
                } else {
                    await member.removeRole(role);
                }
            }
        }
    });

    console.log('alive');

    return true;
};
