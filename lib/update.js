const { google } = require('googleapis');
// const moment = require('moment');
const oAuth2Client = require('./googleClient');

oAuth2Client.setCredentials({
  access_token: process.env.SHEETS_ACCESS_TOKEN,
  refresh_token: process.env.SHEETS_REFRESH_TOKEN,
  scope: process.env.SHEETS_SCOPE,
  token_type: process.env.SHEETS_TOKEN_TYPE,
  // @ts-ignore
  expiry_date: process.env.SHEETS_EXPIRY_DATE,
});

const sheets = google.sheets({
  version: 'v4',
  auth: oAuth2Client,
});

exports.updateTransactionsSheet = async updates => {
  sheets.spreadsheets.values.batchUpdate(
    {
      spreadsheetId: process.env.SHEETS_SHEET_ID,
      resource: {
        valueInputOption: `USER_ENTERED`,
        data: updates.map(p => ({
          range: p.range,
          values: [[p.value]],
        })),
      },
    },
    (err, res) => {
      if (err) {
        return console.log('Update failed: ', err);
      }
      console.log(
        `Success! ${res.data.totalUpdatedCells} transaction cells updated.`,
      );
    },
  );
};

exports.updateBalanceSheet = async updateObject => {
  sheets.spreadsheets.values.append(
    {
      spreadsheetId: process.env.SHEETS_SHEET_ID,

      valueInputOption: `USER_ENTERED`,
      range: updateObject.range,
      resource: {
        range: updateObject.range,
        values: updateObject.values,
        majorDimension: 'ROWS',

        // data: updates.map(p => ({
        //   range: p.range,
        //   majorDimension: "ROWS",
        //   values: [[p.value]],
        // })),
      },
    },
    (err, res) => {
      if (err) {
        return console.log('Update failed: ', err);
      }

      console.log(
        `Success! ${res.data.updates.updatedCells} balance cells updated.`,
      );
    },
  );
};
