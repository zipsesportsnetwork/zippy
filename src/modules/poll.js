module.exports = async (c, s) => {
    const state = await s;
    const { client, output } = await state.discord;
    const { parse } = await state.command;

    const poll = (request, title, description) => {
        const attachments = request.attachments.array();

        let [img] = attachments;

        if (typeof img !== 'undefined') img = img.url;

        return request.channel.send('', output(request.member.displayName, request.author.displayAvatarURL, `**Poll:** ${title}`, description, img));
    };

    client.on('message', async (request) => {
        const {
            discord,
        } = c.get();

        const guild = client.guilds.get(discord.guild);

        const command = parse(request.content);

        if (command === null) return;

        // todo: actually do this

        /*
        if (command._[0] === 'emojipoll') {
            const title = command._[1];
            const description = command._[2];

            console.log(request.cleanContent);

            const message = await poll(request, title, description);
            for (const emoji of command._.slice(2)) {
                const match = /<:.+:(\d+)>/.exec(emoji);

                if (match === null) {
                    console.log(emoji);
                    await message.react(emoji);
                } else {
                    await message.react(match[1]);
                }
            }
        } else
        */ if (command._[0] === 'platformpoll') {
            const [, title, description] = command._;

            if (typeof title === 'undefined') return;

            const message = await poll(request, title, description || `What platforms would you like **${title}** on?`);

            // todo: don't hardcode emoji names
            for (const emoji of ['Playstation', 'Xbox', 'PCMasterRace'].map((name) => guild.emojis.find((e) => e.name === name))) {
                await message.react(emoji);
            }

            await request.delete();
        }
    });
};
