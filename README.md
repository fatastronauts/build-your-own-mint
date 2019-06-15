Note: the below stuff is the instructions from the original [author](https://github.com/yyx990803) with documentation of my own added in. In my opinion, my version has more features and generally meets the financial needs of most people better.

# Build Your Own Mint

## Important Disclaimer

All this repo does is talking to Plaid/Google APIs and writing tokens to your local file system. If you don't feel safe entering real bank credentials, audit the code yourself to make sure.

## Setting up API keys

First things first - rename `.env.sample` to `.env`. Variables in this file will be loaded as environment variables. This file is ignored by Git.

### Plaid

- You will first need to sign up for [Plaid](https://plaid.com/) and apply for the development plan. You might need to wait for a day or two to get approved. It's free and limited to 100 items (i.e. banks), so it should be more than enough for your personal use.

- Once approved, fill out the following in `.env`:

  - `PLAID_CLIENT_ID`
  - `PLAID_SECRET`
  - `PLAID_PUBLIC_KEY`

- Now you need to connect to your financial institutions to generate access tokens.

  Run `npm run token-plaid <account>` where `account` is an id for the bank you want to connect (it's for your personal reference, so you can name it anything). This will start a local server which you can visit in your browser and go through the authentication flow. Once you've linked the bank, its associated access token will be saved in `.env`.

  This process needs to be repeated for each bank you want to connect. Make sure to run each with a different `account` name.

- If you've done everything correctly, running `npm run test-plaid` now should log the recent transactions in your connected accounts.

### Google Sheets

> I use a Google Sheet because it's convenient. If you don't trust Google or want to build your own fancy interface, you can totally do that - but that's out of scope for this demo.

- First, create a Google Sheets spreadsheet, and save its ID in `.env` as `SHEETS_SHEET_ID`.

- Then, go to [Google Sheets API Quickstart](https://developers.google.com/sheets/api/quickstart/nodejs), and click the "Enable the Google Sheets API" button. Follow instructions and download the credentials JSON file. Take a look at the file and fill in the following fields in `.env`:

  - `SHEETS_CLIENT_ID`
  - `SHEETS_CLIENT_SECRET`
  - `SHEETS_REDIRECT_URI` (use the first item in `redirect_uri`)

- Run `npm run token-sheets`. This will prompt for auth and save the token in `.env`.

- Now run `npm run test-sheets`. You should see your sheet's cell A1 with "It worked!".

## Transform your Data

I've already written the transform logic for the repo. You want to have your spreadsheet contain two sheets. One of them (called `transactions`) should have the following headers: Date,Account,Description,Amount,Type,Category1,Category2,Category3,Category4,Retrieval String.

You should have another sheet (called `balances`). This one is a little more tricky. Run `npm run get-setup`. It should give an error but before it does, it should print out an array of your bank accounts that should look familiar to you. Now, create a json that has each account's name (_exactly_ as it appears) as the key and a unique column (anything that is C or greater) in the balances sheets as the value. It should look something like this:

```
{
    "Bank1": "C",
    "Bank2": "D",
    ... etc
}

```

This JSON shows where each account goes in the sheet. Minify that JSON (if you google "minify json", you'll find many options. Note that I don't vouch for the security or trustworthiness of any of them) and set `ACCOUNT_MAPPING` in your `.env` to that minified JSON. Be very careful to not paste this in a js file or really anything but your `.env` - you don't want to tell the world what financial products you use.

After this, `npm run get` should populate the transactions and balances sheet whenever it's run. Note that `npm run get` logs no private information which is helpful if you use the CI feature below on a free plan. 

## Texting

This is a totally optional feature. If you don't want it, set `ENABLE_SMS` to false and you can stop reading. Note that it costs around \$1.20 a month.

If you are interested, go create a Twilio account and follow the instructions [here](https://www.twilio.com/docs/sms/quickstart/node). Then, set the environment variables that start with `TWILIO` in your `.env` to your Twilio account credentials. Set `USER_PHONE_NUMBER` to the number that should be texted. Finally, set `ENABLE_SMS` to true.

This feature will text you everytime the script is run. It works best with CircleCI (below). I've found it helpful for displining my spending by forcing me to be aware of how much I have and am spending.

## Automate the Updates

The repo contains a [CircleCI](https://circleci.com/) config file which runs the update every day at 14PM UTC (8AM America/Chicago). You can adjust the cron config to tweak the time/frequency of the updates. Note that your local `.env` is not checked into the repo, so you will need to copy all those env variables into your CircleCI project settings.

This is totally optional if you don't trust CI with your tokens. Just run it manually when you want to update things.
