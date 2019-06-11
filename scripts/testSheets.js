require('dotenv').config();

const { updateTransactions } = require('../lib/updaters/gsheets');

// sloppy but it works
// I wouldn't necessarily call this a supported use of that API.
// TODO: come up with a better way to test the sheets functionality (...separate package?)
updateTransactions([
  {
    range: 'A1',
    value: 'It worked!',
  },
]);
