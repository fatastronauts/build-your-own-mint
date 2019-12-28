require('dotenv').config();
const open = require('open');
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
  const isPublic = process.argv[2] !== '--public'; // not public -> private
  // since this is often run in circleci free, it's probably wise to not log private stuff
  if (isPublic) {
    const last = await getLastTransactionUpdateTime();
    console.log('last', last.format());
  } else
    console.log(
      'Running in public mode, suppressing logs with potentially private information.',
    );

  const transactions = await fetchTransactions(isPublic);
  const balances = await fetchBalances(isPublic);
  if (isPublic) console.log(balances.map(balance => balance.name));

  const transactionUpdates = transformTransactionsToUpdates(transactions);
  const balanceUpdates = transformBalancesToUpdates(balances);
  const smsUpdates = transformBalancesToSMSData(balances);

  await updateTransactions(transactionUpdates);
  await updateBalances(balanceUpdates);
  await send(smsUpdates);

  open(`https://docs.google.com/spreadsheets/d/${process.env.SHEETS_SHEET_ID}`);
})();
