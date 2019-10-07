const fs = require('fs-extra');

const { google } = require('googleapis');
const { OAuth2 } = google.auth;

module.exports = async (input) => {
    let tokens;

    const auth = new OAuth2(
        input.google.client_id,
        input.google.client_secret,
        input.google.redirect_uri,
    );

    const url = auth.generateAuthUrl({
        access_type: 'offline',
        scope: [
            'https://www.googleapis.com/auth/spreadsheets',
        ],
    });

    if (!fs.pathExistsSync('./tokens.json') || !(tokens = fs.readJsonSync('./tokens.json'))) {
        await new Promise((resolve) => {
            // todo: see if my laziness towards working with `http` directly is unfounded

            const Koa = require('koa');
            const Router = require('koa-router');

            const app = new Koa();
            const router = new Router();

            let server;

            router.get('/bot/', (ctx) => ctx.redirect(url));

            router.get('/bot/redirect', async (ctx) => {
                const { code } = ctx.request.query;

                if (typeof code !== 'undefined') {
                    ({ tokens } = await auth.getToken(code));

                    await fs.writeJson('./tokens.json', tokens);
                }

                ctx.body = 'OK';
                ctx.status = 200;

                server.close(resolve);
            });

            app.use(router.routes());

            server = require('http').createServer(app.callback()).listen(3001);

            console.log('waiting for auth');
        });
    }

    auth.credentials = tokens;

    return auth;
};
