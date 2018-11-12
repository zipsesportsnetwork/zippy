const { google } = require('googleapis');

module.exports = async (input) => {
    const auth = await require('./auth.js')(input);

    const { spreadsheetId } = input;
    let config = null;

    const sheets = google.sheets({
        version: 'v4',
    });

    // naming skill: 100
    const objectify = (a) => a.reduce((o, [k, v]) => ({ ...o, [k]: v }), {});

    const out = {
        async refresh() {
            // okay nvm fuck gsheets
            config = objectify((await sheets.spreadsheets.get({
                spreadsheetId,
                includeGridData: true,
                auth,
            })).data.sheets.map((sheet) => [
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
    };

    setInterval(() => out.refresh().catch(console.error), 60 * 1000);

    await out.refresh();

    return out;
};
