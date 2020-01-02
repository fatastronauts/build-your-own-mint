const twilio = require('twilio')(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN,
);

exports.send = async updateObject => {
  // only text if sms is enabled OR (we're in production AND sms is not disabled)
  // (there's definitely more options I want here but I gave up when I got to a 5 var k-map)
  const shouldRun =
    process.env.ENABLE_SMS === 'true' ||
    (process.env.NODE_ENV === 'production' && process.env.ENABLE_SMS !== 'false');

  if (shouldRun)
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
        console.error('Texting has failed:\n' + JSON.stringify(err));
        process.exit(1);
      });
};
