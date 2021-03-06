const { google } = require('googleapis');

module.exports = async (input) => {
    const auth = await require('./auth.js')(input);

    const { spreadsheetId } = input;
    let raw = null;
    let config = null;

    const sheets = google.sheets({
        version: 'v4',
    });

    // naming skill: 100
    const objectify = (a) => a.reduce((o, [k, v]) => ({ ...o, [k]: v }), {});

    const out = {
        async refresh() {
            // okay nvm fuck gsheets
            const temp = (await sheets.spreadsheets.get({
                spreadsheetId,
                includeGridData: true,
                auth,
            }));
            raw = temp.data.sheets.map((sheet) => {
                return [
                    sheet.properties.title,
                    sheet.data[0].rowData
                        .map((row) => (row.values || []).map((cell) => cell.formattedValue))
                        .slice(2)
                        .filter((row) => !row.every((value) => value === null)),
                ];
            }).reduce((rows, row) => {
                const obj = rows;
                // eslint-disable-next-line prefer-destructuring
                obj[row[0]] = row.slice(1)[0];
                return obj;
            }, {});
            config = objectify(temp.data.sheets.map((sheet) => [
                sheet.properties.title,
                objectify(
                    sheet.data[0].rowData
                        .map((row) => (row.values || []).map((cell) => cell.formattedValue))
                        .slice(2),
                ),
            ]));

            console.log('config reloaded');
        },
        get() {
            return JSON.parse(JSON.stringify(config));
        },
        raw() {
            return JSON.parse(JSON.stringify(raw));
        },
        input() {
            return JSON.parse(JSON.stringify(input));
        },
        auth() { // todo: make a 'google' module
            return auth;
        },
    };

    setInterval(() => out.refresh().catch(console.error), 60 * 1000);

    await out.refresh();

    return out;
};
