const fs = require('fs-extra');

const http = require('http');

const { google } = require('googleapis');
const { OAuth2 } = google.auth;

module.exports = async (input) => {
    let tokens;

    const auth = new OAuth2(
        input.google.client_id,
        input.google.client_secret,
        input.google.redirect_uri
    );

    const url = auth.generateAuthUrl({
        access_type: 'offline',
        scope: [
            'https://www.googleapis.com/auth/spreadsheets.readonly'
        ],
    });

    if (!fs.pathExistsSync('./tokens.json') || !(tokens = fs.readJsonSync('./tokens.json'))) {
        await new Promise((resolve) => {
            // todo: see if my laziness towards working with `http` directly is unfounded

            const Koa = require('koa');
            const Router = require('koa-router');

            let app = new Koa();
            let router = new Router();

            router.get('/bot/', (ctx) => ctx.redirect(url));

            router.get('/bot/redirect', async (ctx) => {
                const { code } = ctx.request.query;

                if (typeof code !== 'undefined') {
                    let credentials = await auth.getToken(code);

                    tokens = credentials.tokens;

                    await fs.writeJson('./tokens.json', tokens);
                }

                ctx.body = 'OK';
                ctx.status = 200;

                server.close(resolve);
            });

            app.use(router.routes());

            const server = require('http').createServer(app.callback()).listen(3001);

            console.log('waiting for auth');
        });
    }

    auth.credentials = tokens;

    return auth;
}
