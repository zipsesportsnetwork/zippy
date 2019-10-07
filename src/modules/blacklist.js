/* eslint-disable indent */
module.exports = async (c, s) => {
    const { client } = await (await s).discord;

    const {
        blacklist,
        _discord_channels: channels,
    } = c.get();

    client.on('message', async (message) => {
        if (message.channel.id === channels.welcome) {
            const text = message.cleanContent.toLowerCase();
            const action = Object.keys(blacklist)
                .find((phrase) => text.includes(phrase.toLowerCase()));

            if (typeof action !== 'undefined') {
                switch (blacklist[action].toLowerCase()) {
                    case 'delete':
                        await message.delete();
                        break;
                    case 'kick': // todo: add spot for reason in config
                        await message.author.kick(JSON.stringify(message.cleanContent));
                        break;
                    case 'ban':
                        await message.author.ban(JSON.stringify(message.cleanContent));
                        break;
                    default:
                        break;
                }
            }
        }
    });
};
