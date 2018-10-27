const async = require('async');

const { google } = require('googleapis');

const { promisify } = require('util');

module.exports = async (input) => {
    const auth = await require('./auth.js')(input);

    const { spreadsheetId } = input;
    let config = null;

    const sheets = google.sheets({
        version: 'v4',
    });

    // naming skill: 100
    const objectify = (a) => a.reduce((o, [k, v]) => ({...o, [k]: v}), {});

    let out = {
        async refresh() {
            // okay nvm fuck gsheets
            config = objectify((await sheets.spreadsheets.get({
                spreadsheetId,
                includeGridData: true,
                auth,
            })).data.sheets.map((sheet) => {
                return [
                    sheet.properties.title,
                    objectify(sheet.data[0].rowData.map((row) => {
                        return (row.values || []).map((cell) => {
                            return cell.formattedValue
                        });
                    }).slice(2))
                ];
            }));
        },
        get() {
            return JSON.parse(JSON.stringify(config));
        },
    };

    await out.refresh();

    return out;
};
