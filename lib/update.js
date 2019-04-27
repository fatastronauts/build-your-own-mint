const { google } = require('googleapis'),
  twilio = require('twilio')(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN,
  ),
  currency = require('currency.js'),
  USD = value => currency(value, { symbol: '$', precision: 2 });
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

exports.updateTransactions = async updates => {
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

exports.updateBalances = async updateObject => {
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

  // TODO: I don't think this is doing anything....
  let totalOwned = currency(0),
    totalOwed = currency(0);
  updateObject.values[0].slice(2).forEach(el => {
    el = Number(el);
    // console.log(el);
    if (el < 0) totalOwed = totalOwed.subtract(el);
    else totalOwned = totalOwned.add(el);
  });
};

exports.sendSMS = async updateObject => {
  if (
    process.env.NODE_ENV === 'production' ||
    process.env.ENABLE_SMS === 'true'
  )
    twilio.messages
      .create({
        body: `As of right now, you have $${Number(updateObject.checking) +
          Number(updateObject.saving)} in assets ($${
          updateObject.checking
        } of that is in checkings accounts) but $${updateObject.debt} in debt.`,
        to: process.env.USER_PHONE_NUMBER, // Text this number
        from: process.env.TWILIO_PHONE_NUMBER, // From a valid Twilio number
      })
      .then(message => console.log(`Texting successful: ${message.sid}`))
      .catch(err => {
        throw new Error(`${err} texting did not work`);
      });
};
