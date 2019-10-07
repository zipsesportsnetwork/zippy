const request = require('request-promise');

const login = async (email, password) => (await request({
    uri: 'https://api.sling.is/v1/account/login',
    method: 'POST',
    resolveWithFullResponse: true,
    body: {
        email,
        password,
    },
    json: true,
})).headers.authorization;

module.exports = async (c) => {
    const { sling: config } = c.get();
    const { email, password } = config;

    const authorization = await login(email, password);

    // todo: compile mentionables from these:

    const groups = await request({
        uri: 'https://api.sling.is/v1/groups',
        headers: { authorization },
        json: true,
    });

    /*
    const users = await request({
        uri: 'https://api.sling.is/v1/users',
        headers: { authorization },
        json: true,
    });
    */

    const mentionablesIncoming = groups
        .filter((group) => group.type === 'everyone')
        .map((everyone) => [new RegExp(`@everyone\\[${everyone.id}\\]`, 'g'), '@everyone']);

    const mentionablesOutgoing = groups
        .filter((group) => group.type === 'everyone')
        .map((everyone) => [new RegExp('@everyone', 'g'), `@everyone[${everyone.id}]`]);

    return {
        async sendMessage(conversation, message, attachments) {
            let content = message;

            mentionablesOutgoing.forEach((mentionable) => {
                const [regexp, replacement] = mentionable;
                content = content.replace(regexp, replacement);
            });

            return request({
                uri: `https://api.sling.is/v1/conversations/${conversation}/messages`,
                method: 'POST',
                headers: { authorization },
                body: {
                    attachments,
                    content,
                },
                json: true,
            });
        },
        async getMessages(conversation) {
            return (await request({
                uri: `https://api.sling.is/v1/conversations/${conversation}/messages`,
                headers: { authorization },
                json: true,
            })).map((m) => {
                const message = m;
                mentionablesIncoming.forEach((mentionable) => {
                    const [regexp, replacement] = mentionable;
                    message.content = message.content.replace(regexp, replacement);
                });
                return message;
            });
        },
        async uploadFile(file) {
            return request({
                uri: 'https://api.sling.is/v1/upload/image',
                method: 'POST',
                headers: { authorization },
                formData: {
                    file,
                },
                json: true,
            });
        },
    };
};
