const twilio = require('twilio')(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN,
);
const moment = require('moment');

// const currency = require('currency.js');
// const USD = value => currency(value, { symbol: '$', precision: 2 });

// override env happens regardless of env variables
exports.send = async (updateObject, overrideEnv) => {
  const shoudldRun =
    process.env.ENABLE_SMS === 'true' ||
    process.env.NODE_ENV === 'production' ||
    (overrideEnv != undefined && overrideEnv === true);

  if (!shoudldRun) return;
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
