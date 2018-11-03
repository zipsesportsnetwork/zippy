const request = require('request');

// todo: make bridged messages cleaner (maybe using rich embeds on discord?)

module.exports = async (c, s) => {
    const {
        sling: config,
        sling_bridge: mappings,
    } = c.get();

    const state = await s;
    const discord = await state.discord;
    const sling = await state.sling;

    const getMapping = (position, id) => (Object.entries(mappings).find((mapping) => mapping[1 - position] === id) || [null, null])[position];

    // based on column number (and subsequently the position in the resulting array) from sheet
    const getSlingConversation = (id) => getMapping(0, id);
    const getDiscordChannel = (id) => getMapping(1, id);

    let slingKeys;
    let slingCache = {};

    const checkSling = async () => {
        slingKeys = Object.keys(mappings);

        for (var i = 0; i < slingKeys.length; i++) {
            const conversation = slingKeys[i];
            const messages = await sling.getMessages(conversation);

            if (typeof slingCache[conversation] === 'undefined') {
                slingCache[conversation] = messages[0].id;
            } else {
                // todo: add nicer way to check for mentions in sling messages

                let newMessages = messages
                    .slice(0, messages.findIndex((message) => message.id === slingCache[conversation]))
                    .filter((message) => message.author.email !== config.email && message.content.indexOf('@everyone') > -1);

                if (newMessages.length > 0) {
                    slingCache[conversation] = newMessages[newMessages.length - 1].id;
                }

                newMessages.reverse();

                for (var j = 0; j < newMessages.length; j++) {
                    const newMessage = newMessages[j];

                    await discord.channels.get(getDiscordChannel(conversation)).send(`**${newMessage.author.name} ${newMessage.author.lastname}** (bridged): \n\n${newMessage.content} ${newMessage.attachments.map((attachment) => attachment.url).join(' ')}`);
                }
            }
        }
    };

    const uploadSling = async (attachments) => {
        let out = [];

        for (var i = 0; i < attachments.length; i++) {
            const attachment = attachments[i];

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
            await sling.sendMessage(mapped, '**' + message.member.nickname + '** (bridged): \n\n' + message.content, await uploadSling(message.attachments.array()));
        }
    });

    // todo: decide if 15 second interval should be a constant somewhere else
    setInterval(() => checkSling().catch(console.error), 15 * 1000);
};