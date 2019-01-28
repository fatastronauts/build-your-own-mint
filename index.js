require('dotenv').config();

const { fetchTransactions, fetchBalances } = require('./lib/fetch'),
  {
    transformTransactionsToUpdates,
    transformBalancesToUpdates,
  } = require('./lib/transform'),
  { updateTransactions, updateBalances } = require('./lib/update');

(async () => {
  const transactions = await fetchTransactions();
  const balances = await fetchBalances();

  const transactionUpdates = transformTransactionsToUpdates(transactions);
  const balanceUpdates = transformBalancesToUpdates(balances);

  updateTransactions(transactionUpdates);
  updateBalances(balanceUpdates);
})();
