// @ts-nocheck
const moment = require('moment'),
  os = require('os'),
  SHEET_NAMES = {
    TRANSACTIONS: 'transactions',
    BALANCES: 'balances',
  },
  currency = require('currency.js');

exports.transformTransactionsToUpdates = transactions => {
  const now = moment().format();
  return (
    transactions
      // @ts-ignore
      .sort((a, b) => moment(b.date) - moment(a.date))
      .reduce((acc, transaction, idx) => {
        if (transaction.category == null) transaction.category = [];
        return acc.concat([
          {
            range: `${SHEET_NAMES.TRANSACTIONS}!A${idx + 2}`,
            value: transaction.date,
          },
          {
            range: `${SHEET_NAMES.TRANSACTIONS}!B${idx + 2}`,
            value: transaction.account,
          },
          {
            range: `${SHEET_NAMES.TRANSACTIONS}!C${idx + 2}`,
            value: transaction.name,
          },
          {
            range: `${SHEET_NAMES.TRANSACTIONS}!D${idx + 2}`,
            value: transaction.amount,
          },
          {
            range: `${SHEET_NAMES.TRANSACTIONS}!E${idx + 2}`,
            value: transaction.type,
          },
          // this statement will split up the category array and puts into consecutive cells
          ...transaction.category
            .sort((a, b) => a.localeCompare(b))
            .map((value, i) => ({
              range: `${SHEET_NAMES.TRANSACTIONS}!${
                ['F', 'G', 'H', 'I'][i]
              }${idx + 2}`,
              value,
            })),
          {
            range: `${SHEET_NAMES.TRANSACTIONS}!J${idx + 2}`,
            value: `${os.hostname()} at ${now}`,
          },
        ]);
      }, [])
  );
};

exports.transformBalancesToUpdates = accounts => {
  const alphabet = 'ABCDEFGHIJK'; // column locations
  const rtn = {
    range: `${SHEET_NAMES.BALANCES}!A1:${alphabet[accounts.length + 3]}1`,
    values: [
      [
        moment()
          .utc()
          .format('L LTS'),
        os.hostname(),
      ],
    ],
  };

  const accountMapping = JSON.parse(process.env.ACCOUNT_MAPPING);
  let have = 0,
    owed = 0;

  accounts.forEach(account => {
    const idx = alphabet.indexOf(accountMapping[account.name]);
    if (idx === -1) throw new Error('CANNOT FIND THIS ACCOUNT IN MAPPING');

    rtn.values[0][idx] =
      account.type === 'depository'
        ? Number(account.balance)
        : -Number(account.balance);

    if (rtn.values[0][idx] > 0) have += rtn.values[0][idx];
    else owed += rtn.values[0][idx];
  });

  rtn.values[0].push(have, owed, have + owed);
  return rtn;
};

exports.transformBalancesToSMSData = accounts => {
  const amounts = accounts.reduce(
    (acc, el) => {
      if (el.type === 'credit') acc.debt = acc.debt.add(el.balance);
      if (el.type === 'depository' && el.subtype === 'savings')
        acc.saving = acc.saving.add(el.balance);
      if (el.type === 'depository' && el.subtype === 'checking')
        acc.checking = acc.checking.add(el.balance);
      return acc;
    },
    {
      checking: currency(0, { separator: '' }),
      saving: currency(0, { separator: '' }),
      debt: currency(0, { separator: '' }),
    },
  );

  return {
    checking: amounts.checking.format(),
    saving: amounts.saving.format(),
    debt: amounts.debt.format(),
  };
};
/**
 * {
 *   account: 'paypal',
 *   name: 'Payment from XXX',
 *   date: 2019-xx-xx,
 *   amount: 123
 * }
 *
 * Updates should be in the form of:
 * {
 *   range: 'A1',
 *   value: 123
 * }
 */
