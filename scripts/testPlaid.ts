require('dotenv').config();
import { fetchTransactions } from '../lib/fetch';

(async () => {
  const res = (await fetchTransactions()).slice(0, 5);
  console.log('Transactions fetch successful!');
  console.log(res);
})();
