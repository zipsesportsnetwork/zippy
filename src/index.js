module.exports = async (input) => {
    const config = await require('./config')(input);

    const deferred = require('p-defer')();

    let state = {};

    Object.keys(config.get()._).forEach((module) => {
        state[module] = require(`./modules/${module}`)(config, deferred.promise);
    });

    deferred.resolve(state);
};
