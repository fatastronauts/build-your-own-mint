require('dotenv').config();

import readline from 'readline';
import oAuth2Client from '../lib/updaters/googleClient';
import saveEnv from './saveEnv';
import { Credentials } from 'google-auth-library';

const authUrl = oAuth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: ['https://www.googleapis.com/auth/spreadsheets'],
});

console.log('Authorize Google Sheets by visiting this url:', authUrl);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('Enter the code from that page here: ', code => {
  rl.close();
  oAuth2Client.getToken(code, (err, token) => {
    if (err) return console.error('Error while trying to retrieve access token', err);
    if (token == null) return console.error('Got a null access token returned', err);

    const vars: { [index: string]: string } = {};
    (Object.keys(token) as Array<keyof Credentials>).forEach((key: keyof Credentials) => {
      vars[`SHEETS_${key.toUpperCase()}`] = token[key] as string;
    });

    saveEnv(vars);
    console.log(`Token stored in .env.`);
  });
});
