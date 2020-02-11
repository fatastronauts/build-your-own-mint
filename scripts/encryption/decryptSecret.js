require('dotenv').config();
const openpgp = require('openpgp');
const fs = require('fs');

const { ACCOUNTS_PASSWORD } = process.env;
const toReadPath = './accounts.public.txt';
const toWritePath = './accounts.secret.js';

const encryptedAccountContents = fs.readFileSync(toReadPath, {
  encoding: 'utf8',
});

(async () => {
  openpgp
    .decrypt({
      message: await openpgp.message.readArmored(encryptedAccountContents),
      passwords: [ACCOUNTS_PASSWORD],
    })
    .then(plaintext => {
      const decrypted = plaintext.data;
      fs.writeFileSync(toWritePath, decrypted);
      console.log('Wrote decrypted to: ' + toWritePath);
    });
})();
