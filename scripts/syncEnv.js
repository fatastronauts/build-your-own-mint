const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

dotenv.config();
const { GITHUB_USERNAME, GITHUB_PROJECT, CIRCLE_CI_TOKEN } = process.env;

// variables that shouldn't be synced
const FILTERED_VARIABLES = [
  'CIRCLE_CI_TOKEN',
  'ENABLE_SMS', // sms is typically different for debugging and otherwise
  'GITHUB_USERNAME',
  'GITHUB_PROJECT',
];

const deleteCurrentEnvironmentVariables = async () => {
  const envVars = await (
    await fetch(
      `https://circleci.com/api/v1.1/project/github/${GITHUB_USERNAME}/${GITHUB_PROJECT}/envvar?circle-token=${CIRCLE_CI_TOKEN}`,
      { method: 'get' },
    )
  ).json();

  for (let { name, value } of envVars) {
    try {
      await fetch(
        `https://circleci.com/api/v1.1/project/github/${GITHUB_USERNAME}/${GITHUB_PROJECT}/envvar/${name}?circle-token=${CIRCLE_CI_TOKEN}`,
        { method: 'DELETE' },
      );
      console.log(`Successfully deleted ${name}: ${value}`);
    } catch (err) {
      console.log(`Failed to delete ${name}: ${value}`);
    }
  }

  console.log('Finished deleting env vars');
};

const updateSingleToken = async nameValToken => {
  console.log(
    'Updated this pair: ' +
      JSON.stringify(
        await fetch(
          `https://circleci.com/api/v1.1/project/github/${GITHUB_USERNAME}/${GITHUB_PROJECT}/envvar?circle-token=${CIRCLE_CI_TOKEN}`,
          {
            method: 'post',
            body: JSON.stringify(nameValToken),
            headers: { 'Content-Type': 'application/json' },
          },
        ).then(res => res.json()),
      ),
  );
};

const syncAllVariables = async () => {
  await deleteCurrentEnvironmentVariables(); // clear out current env vars

  const envPath = path.resolve(__dirname, '../.env');
  const envVars = dotenv.parse(fs.readFileSync(envPath));

  // converts to an array of name-value pairs that we can send to circleci
  const filteredPairs = Object.entries(
    Object.keys(envVars)
      .filter(key => !FILTERED_VARIABLES.includes(key))
      .reduce((obj, key) => {
        obj[key] = envVars[key];
        return obj;
      }, {}),
  ).map(([name, value]) => {
    return { name, value };
  });

  for (let i = 0; i < filteredPairs.length; i++) {
    await updateSingleToken(filteredPairs[i]);
  }
};

syncAllVariables();
