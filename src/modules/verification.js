/* eslint-disable camelcase */
const request = require('request-promise');
const parseEmail = require('email-addresses').parseOneAddress;

const Koa = require('koa');
const Router = require('koa-router');
const LRU = require('lru-cache');

module.exports = async (c, s) => {
    const { discord: discordConfig, verification: config } = c.get();
    const { client } = await (await s).discord;

    const oauth2 = require('simple-oauth2');
    const discordOauth = oauth2.create({
        client: {
            id: discordConfig.id,
            secret: discordConfig.secret,
        },
        auth: {
            authorizePath: '/api/oauth2/authorize',
            tokenHost: 'https://discordapp.com',
            tokenPath: '/api/oauth2/token',
            revokePath: '/api/oauth2/revoke',
        },
    });
    const googleOauth = oauth2.create({
        client: {
            id: config.google_verify_id,
            secret: config.google_verify_secret,
        },
        auth: {
            authorizeHost: 'https://accounts.google.com',
            authorizePath: '/o/oauth2/v2/auth',
            tokenHost: 'https://oauth2.googleapis.com',
            tokenPath: '/token',
            revokePath: '/revoke',
        },
    });

    const guild = client.guilds.get(discordConfig.guild);

    const app = new Koa();
    const router = new Router();
    const cache = new LRU();

    const googleCallback = `${config.host}${config.root}/google/callback`;
    const discordCallback = `${config.host}${config.root}/discord/callback`;

    const { google: googleApis } = require('googleapis');
    const sheets = googleApis.sheets('v4');

    router
        .get('/verify', async (ctx) => ctx.redirect(googleOauth.authorizationCode.authorizeURL({
            redirect_uri: googleCallback,
            scope: [
                'https://www.googleapis.com/auth/userinfo.profile',
                'https://www.googleapis.com/auth/userinfo.email'
            ].join(' '),
        })))
        .get('/verify/google/callback', async (ctx) => {
            const { access_token, expires_in } = await googleOauth.authorizationCode.getToken({
                code: ctx.query.code,
                redirect_uri: googleCallback,
                scope: ctx.query.scope,
            });

            const {
                sub: state, name, email, email_verified,
            } = await request('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                },
                json: true,
            });

            const uakron = parseEmail(email).domain.split('.').slice(-2).join('.') === 'uakron.edu';

            if (email_verified && uakron) {
                cache.set(`${state}`, { name, email }, expires_in * 1000);
                ctx.redirect(discordOauth.authorizationCode.authorizeURL({
                    redirect_uri: discordCallback,
                    scope: [
                        'identify',
                        'guilds.join',
                    ].join(' '),
                    state,
                }));
            } else {
                ctx.redirect('/verify');
            }
        })
        .get('/verify/discord/callback', async (ctx) => {
            if (typeof ctx.query.error !== 'undefined') {
                ctx.redirect('/verify');
                return;
            }

            const { code, scope, state } = ctx.query;

            const token = await discordOauth.authorizationCode.getToken({
                code,
                redirect_uri: discordCallback,
                scope,
            });

            const { access_token } = token;

            const { username, discriminator, id } = await request('https://discordapp.com/api/users/@me', {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                },
                json: true,
            });

            const cached = cache.get(`${state}`);

            if (typeof cached === 'undefined') {
                ctx.redirect('/verify');
                return;
            }

            cache.del(`${state}`);

            let member = guild.members.get(id);

            if (typeof member === 'undefined') {
                member = await guild.addMember({ id }, {
                    accessToken: access_token,
                    nick: cached.name,
                });
            }
            if (!member.roles.has(config.verified_role)) {
                await member.addRoles([config.verified_role, config.zip_role]);

                sheets.spreadsheets.values.append({
                    spreadsheetId: '11hLPBeXinfMUUkcS61dmWGSG-pDh7XHCdgyMWlrr-60',
                    range: 'Sheet',
                    valueInputOption: 'USER_ENTERED',
                    insertDataOption: 'INSERT_ROWS',
                    resource: {
                        values: [
                            [cached.name, cached.email, `${username}#${discriminator}`, id],
                        ],
                    },
                    auth: c.auth(),
                });
            }

            ctx.redirect(config.redirect_link);
        });

    app.use(router.routes());

    app.listen(config.port);

    return true;
};
