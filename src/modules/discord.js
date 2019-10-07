module.exports = (c) => {
    const { discord: config } = c.get();
    const deferred = require('p-defer')();
    const discord = require('discord.js');
    const client = new discord.Client();

    // todo: make this not look fucking stupid

    let status = false;

    const resolve = () => {
        if (!status) {
            deferred.resolve(client);
        }
        status = true;
    };

    const reject = () => {
        if (!status) {
            deferred.reject();
        }
        status = true;
    };

    client.on('ready', resolve);

    client.on('error', reject);
    client.on('disconnect', reject);

    client.login(config.token);

    return deferred.promise.then((ready) => ({
        client: ready,
        output(author, icon, title, description, attachment) {
            let out = (new discord.RichEmbed())
                .setAuthor(author, icon)
                .setTitle(title)
                .setDescription(description);

            if (typeof attachment !== 'undefined') {
                out = out.attachFile({ attachment, name: 'file.jpg' })
                    .setImage('attachment://file.jpg');
            }

            return out;
        },
    }));
};
