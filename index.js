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
  const last = await getLastTransactionUpdateTime();
  console.log('last', last.format());
  const transactions = await fetchTransactions();
  const balances = await fetchBalances();
  console.log(balances.map(balance => balance.name));

  const transactionUpdates = transformTransactionsToUpdates(transactions);
  const balanceUpdates = transformBalancesToUpdates(balances);
  const smsUpdates = transformBalancesToSMSData(balances);

  updateTransactions(transactionUpdates);
  updateBalances(balanceUpdates);
  send(smsUpdates, true);
})();
