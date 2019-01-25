const moment = require('moment'),
  os = require('os');

exports.transformTransactionsToUpdates = transactions => {
  const SHEET_NAMES = {
    TRANSACTIONS: 'transactions',
    BALANCES: 'balances',
  };

  const now = moment().format();
  return transactions
    .sort((a, b) => moment(b.date) - moment(a.date))
    .reduce((acc, transaction, idx) => {
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
        // this statement will split up the category array and puts into consecutive cells
        ...transaction.category
          .sort((a, b) => a.localeCompare(b))
          .map((value, i) => ({
            range: `${SHEET_NAMES.TRANSACTIONS}!${
              ['E', 'F', 'G', 'H'][i]
            }${idx + 2}`,
            value,
          })),
        {
          range: `${SHEET_NAMES.TRANSACTIONS}!I${idx + 2}`,
          value: `${os.hostname()} at ${now}`,
        },
      ]);
    }, []);
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
