module.exports = async (c, s) => {
    const state = await s;
    const { client, output } = await state.discord;
    const { parse } = await state.command;

    const _ = require('lodash');
    const request = require('request');
    const { parseEmoji } = require('discord.js').Util;

    const poll = (req, title, description) => {
        const attachments = req.attachments.array();

        let [img] = attachments;

        if (typeof img !== 'undefined') img = request(img.url);

        return req.channel.send('', output(req.member.displayName, req.author.displayAvatarURL, `**Poll:** ${title}`, description, img));
    };

    client.on('message', async (request) => {
        const {
            discord,
        } = c.get();

        const {
            _poll_commands: commands,
        } = c.raw();

        const guild = client.guilds.get(discord.guild);

        let command = parse(request.content);

        if (command === null) return;

        command = command._;

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
        */

        //console.log(commands);

        const template = commands.find((row) => row[0] === command[0]);

        if (typeof template !== 'undefined') {
            const [, title, description, emojis] = template.map((arg) => {
                let out = arg;
                for (let i = 0; i < command.length; i += 1) {
                    if (out !== null) {
                        out = out.replace(new RegExp(`\\$${i}`, 'g'), command[i]);
                    }
                }
                return out;
            });

            const message = await poll(request, title, description);

            for (const emoji of emojis.split(' ').map((name) => (guild.emojis.find((e) => e.name === name) || name))) {
                await message.react(emoji);
            }

            await request.delete();
        } else if (command[0] === 'emojipoll') {
            const [, title, description, ...pairs] = command;

            const chunks = _.chunk(pairs.map((arg, idx) => {
                const parsed = parseEmoji(arg);

                if (idx % 2 === 1 && parsed.id !== null) {
                    return client.emojis.get(parsed.id);
                }

                return arg;
            }), 2);

            const message = await poll(request, title, `${description}\n\n${chunks.map(([choice, emoji]) => `${emoji}: ${choice}`).join('\n')}`);

            for (const [, emoji] of chunks) {
                await message.react(emoji);
            }

            await request.delete();
        }
        /*

        if (command._[0] === 'platformpoll') {
            const [, title, description] = command._;

            if (typeof title === 'undefined') return;

            const message = await poll(request, title, description || `What platforms would you like **${title}** on?`);

            // todo: don't hardcode emoji names
            for (const emoji of ['Playstation', 'Xbox', 'PCMasterRace'].map((name) => guild.emojis.find((e) => e.name === name))) {
                await message.react(emoji);
            }

            await request.delete();
        }

        */
    });
};
