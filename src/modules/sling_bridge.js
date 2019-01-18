const request = require('request');

// todo: make bridged messages cleaner (maybe using rich embeds on discord?)

module.exports = async (c, s) => {
    const {
        sling: config,
        sling_bridge: mappings,
    } = c.get();

    const state = await s;
    const { client: discord } = await state.discord;
    const sling = await state.sling;

    const getMapping = (position, id) => (
        Object.entries(mappings)
            .find((mapping) => mapping[1 - position] === id) || [null, null]
    )[position];

    // based on column number (and subsequently the position in the resulting array) from sheet
    const getSlingConversation = (id) => getMapping(0, id);
    const getDiscordChannel = (id) => getMapping(1, id);

    let slingKeys;
    const slingCache = {};

    const checkSling = async () => {
        slingKeys = Object.keys(mappings);

        for (const conversation of slingKeys) {
            const messages = await sling.getMessages(conversation);

            if (typeof slingCache[conversation] === 'undefined') {
                slingCache[conversation] = messages[0].id;
            } else {
                // todo: add nicer way to check for mentions in sling messages

                const newMessages = messages
                    .slice(0, messages.findIndex((message) => message.id
                        === slingCache[conversation])) // reeeeeeeee this looks so stupid
                    .filter((message) => message.author.email !== config.email
                        && message.content.indexOf('@everyone') > -1);

                if (newMessages.length > 0) {
                    slingCache[conversation] = newMessages[newMessages.length - 1].id;
                }

                newMessages.reverse();

                for (const newMessage of newMessages) {
                    await discord.channels.get(getDiscordChannel(conversation)).send(`**${newMessage.author.name} ${newMessage.author.lastname}** (bridged): \n\n${newMessage.content} ${newMessage.attachments.map((attachment) => attachment.url).join(' ')}`);
                }
            }
        }
    };

    const uploadSling = async (attachments) => {
        const out = [];

        // todo: use array.map and promise.all here instead

        for (const attachment of attachments) {
            out.push(await sling.uploadFile(request({
                uri: attachment.url,
                encoding: null,
            })));
        }

        return out;
    };

    await checkSling();

    discord.on('message', async (message) => {
        const mapped = getSlingConversation(message.channel.id);

        if (mapped !== null && message.author.id !== discord.user.id && message.mentions.everyone) {
            await sling.sendMessage(mapped, `**${message.member.displayName}** (bridged): \n\n${message.cleanContent}`, await uploadSling(message.attachments.array()));
        }
    });

    // todo: decide if 15 second interval should be a constant somewhere else
    setInterval(() => checkSling().catch(console.error), 15 * 1000);
};
