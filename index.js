require('dotenv').config();
const { fetchTransactions, fetchBalances } = require('./lib/fetch');

const {
  transformTransactionsToUpdates,
  transformBalancesToUpdates,
  transformBalancesToSMSData,
} = require('./lib/transform');

const {
  updateTransactions,
  updateBalances,
  getLastTransactionUpdateTime,
} = require('./lib/updaters/gsheets');

const { send } = require('./lib/updaters/sms');

(async () => {
  // since this is often run in circleci free, it's probably wise to not log private stuff
  if (process.argv[2] !== '--public') {
    const last = await getLastTransactionUpdateTime();
    console.log('last', last.format());
  } else
    console.log(
      'Running in public mode, supressing logs with potentially private information. ',
    );

  const transactions = await fetchTransactions();
  const balances = await fetchBalances();
  if (process.argv[2] !== '--public')
    console.log(balances.map(balance => balance.name));

  const transactionUpdates = transformTransactionsToUpdates(transactions);
  const balanceUpdates = transformBalancesToUpdates(balances);
  const smsUpdates = transformBalancesToSMSData(balances);

  updateTransactions(transactionUpdates);
  updateBalances(balanceUpdates);
  send(smsUpdates, true);
})();
