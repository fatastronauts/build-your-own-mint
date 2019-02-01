module.exports = require('fs')
  .readdirSync(__dirname + '/')
  .reduce((acc, file) => {
    if (file.match(/\.js$/) !== null && file !== 'index.js') {
      acc[file.replace('.js', '')] = require('./' + file);
    }
    return acc;
  }, {});
