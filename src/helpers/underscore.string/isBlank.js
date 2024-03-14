var makeString = require('./makeString');

module.exports = function isBlank(str) {
  return (/^\s*$/).test(makeString(str));
};
