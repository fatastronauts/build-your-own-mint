const moment = require('moment');

exports.transformTransactionsToUpdates = transactions => {
  /**
   * Implement your custom logic of transforming transactions into
   * Google Sheet cell updates.
   *
   * Transactions come in the format of:
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
  transactions.sort((a, b) => moment(b.date) - moment(a.date));
  return transactions.reduce((acc, transaction, idx) => {
    return acc.concat([
      {
        range: `A${idx + 2}`,
        value: transaction.date,
      },
      {
        range: `B${idx + 2}`,
        value: transaction.account,
      },
      {
        range: `C${idx + 2}`,
        value: transaction.name,
      },
      {
        range: `D${idx + 2}`,
        value: transaction.amount,
      },
      ...transaction.category
        .sort((a, b) => a.localeCompare(b))
        .map((value, i) => ({
          range: `${['E', 'F', 'G', 'H', 'I'][i]}${idx + 2}`,
          value,
        })),
    ]);
  }, []);
};
// console.log('DEBUG: updates to be made:');
// console.log(updates);
