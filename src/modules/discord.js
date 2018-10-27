let state;

module.exports = (c, s) => {
    const { discord: config } = c.get();
    const deferred = require('p-defer')();
    const client = new (require('discord.js')).Client();

    // todo: make this not look fucking stupid

    let status = false;

    const resolve = () => {
        !status && deferred.resolve(client);
        status = true;
    };

    const reject = () => {
        !status && deferred.reject();
        status = true;
    };

    client.on('ready', resolve);

    client.on('error', reject);
    client.on('disconnect', reject);

    client.login(config.token);

    return deferred.promise;
};
