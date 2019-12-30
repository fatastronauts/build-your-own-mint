require('dotenv').config();
const openpgp = require('openpgp');
const fs = require('fs');

const { ACCOUNTS_PASSWORD } = process.env;
const toReadPath = './accounts.secret.js';
const toWritePath = './accounts.public.txt';

const privateAccountContents = fs.readFileSync(toReadPath, {
  encoding: 'utf8',
});

openpgp
  .encrypt({
    message: openpgp.message.fromText(privateAccountContents),
    passwords: [ACCOUNTS_PASSWORD],
    armor: true,
  })
  .then(ciphertext => {
    const encrypted = ciphertext.data; // get raw encrypted packets as Uint8Array
    fs.writeFileSync(toWritePath, encrypted);
    console.log('Written encrypted to: ' + toWritePath);
  });
