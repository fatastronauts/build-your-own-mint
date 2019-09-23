const moment = require('moment');
const client = require('./plaidClient');

// start from beginning of last month...
const targetMonth = Math.max(1, moment().month() - 1);
const startDate = moment()
  .month(targetMonth - 60)
  .date(1)
  .format('YYYY-MM-DD');
// ends now.
// this ensures we always fully update last month,
// and keep current month up-to-date
const endDate = moment().format('YYYY-MM-DD');

const transactionFetchOptions = [
  {
    count: 250,
    offset: 0,
  },
];

const plaidAccountTokens = Object.keys(process.env)
  .filter(key => key.startsWith(`PLAID_TOKEN`))
  .map(key => ({
    account: key.replace(/^PLAID_TOKEN_/, ''),
    token: process.env[key],
  }));

exports.fetchTransactions = async function() {
  const rawTransactions = await Promise.all(
    plaidAccountTokens.map(({ account, token }) => {
      // @ts-ignore
      return client
        .getTransactions(token, startDate, endDate, ...transactionFetchOptions)
        .then(({ accounts, transactions }) => ({
          transactions: transactions.map(transaction => {
            const matchedAccount = accounts.find(
              account => account.account_id === transaction.account_id,
            );

            return {
              ...transaction,
              account:
                matchedAccount.official_name == null
                  ? matchedAccount.name
                  : matchedAccount.official_name,
            };
          }),
        }))
        .catch(err => {
          throw new Error(JSON.stringify({ err, account }));
        });
    }),
  );

  // concat all transactions
  return rawTransactions.reduce(
    (all, { transactions }) =>
      all.concat(
        transactions.map(
          ({ name, date, amount, category, account, transaction_type }) => ({
            name,
            date,
            amount: -amount,
            category,
            account,
            type: transaction_type,
          }),
        ),
      ),
    [],
  );
};

exports.fetchBalances = async function() {
  const rawBalances = await Promise.all(
    plaidAccountTokens.map(({ token }) => {
      return client.getBalance(token);
    }),
  ).catch(err => {
    throw new Error(JSON.stringify(err));
  });

  return rawBalances.reduce((all, { accounts }) => {
    return all.concat(
      accounts.map(({ balances, official_name, name, type, subtype }) => ({
        name: official_name == null ? name : official_name,
        balance: balances.current,
        type,
        subtype,
      })),
    );
  }, []);
};
