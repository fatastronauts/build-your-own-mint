require('dotenv').config();

const { fetchTransactions, fetchBalances } = require('./lib/fetch'),
  {
    transformTransactionsToUpdates,
    transformBalancesToUpdates,
    transformBalancesToSMSData,
  } = require('./lib/transform'),
  { updateTransactions, updateBalances, sendSMS } = require('./lib/update');

(async () => {
  const transactions = await fetchTransactions();
  const balances = await fetchBalances();

  const transactionUpdates = transformTransactionsToUpdates(transactions);
  const balanceUpdates = transformBalancesToUpdates(balances);
  const smsUpdates = transformBalancesToSMSData(balances);

  updateTransactions(transactionUpdates);
  updateBalances(balanceUpdates);
  sendSMS(smsUpdates);
})();
