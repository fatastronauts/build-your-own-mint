require('dotenv').config();

const { fetchTransactions, fetchBalances } = require('./lib/fetch');
const {
  transformTransactionsToUpdates,
  transformBalancesToUpdates,
} = require('./lib/transform');
const { updateSheet } = require('./lib/update');

(async () => {
  const transactions = await fetchTransactions();
  const balances = await fetchBalances();
  const updates = transformTransactionsToUpdates(transactions).concat(
    transformBalancesToUpdates(balances),
  );
  updateSheet(updates);
})();
