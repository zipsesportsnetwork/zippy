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

        // hacky shit until we rewrite
        let tempConfig = JSON.parse(channels.customEmotes || '{}');
        tempConfig[channels.picker] = mappings;

        const channelsToListenTo = Object.keys(tempConfig).concat(channels.picker);

        if (![
            'MESSAGE_REACTION_ADD', 'MESSAGE_REACTION_REMOVE',
        ].includes(packet.t) || !channelsToListenTo.includes(packet.d.channel_id)) {
            return;
        }

        const { emoji, user_id } = packet.d;

        let emote;

        if (emoji.id === null) {
            emote = emoji.name;
        } else {
            emote = emoji.id;
        }

        const mapped = tempConfig[packet.d.channel_id][emote];

        if (typeof mapped !== 'undefined') {
            const member = await guild.fetchMember(user_id);
            const role = guild.roles.find((r) => r.id === mapped);
                
            if (typeof role === 'undefined') return;

            if (packet.t === 'MESSAGE_REACTION_ADD') {
                await member.addRole(role);
            } else {
                await member.removeRole(role);
            }
        }
    });

    console.log('alive');

    return true;
};


