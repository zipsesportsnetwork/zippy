module.exports = async (c) => {
    const minimist = require('minimist-string');

    return {
        parse(message) {
            const {
                command,
            } = c.get();

            if (message.startsWith(command.prefix)) {
                return minimist(message.slice(command.prefix.length));
            }

            return null;
        },
    };
};
