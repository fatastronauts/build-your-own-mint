require('dotenv').config();
import { fetchTransactions } from '../lib/fetch';

(async () => {
  const res = await fetchTransactions();
  console.log('Transactions fetch successful!');
  console.log(res);
})();
