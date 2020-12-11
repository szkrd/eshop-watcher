const chalk = require('chalk');
const { detectErrorType } = require('../utils/error');

const colorCodes = {
  warning: 'yellow',
  error: 'red',
  fatal: 'red'
};

function handleError (type = 'warning', message = '', err = {}) {
  const timeStamp = new Date().toISOString().substr(0, 16);
  const payload = { at: timeStamp, type: 'unknown', name: err.name, message: err.message, stack: err.stack };
  const detectedType = detectErrorType(err);
  if (detectedType === 'error') {
    Object.assign(payload, { type: 'network', url: (err.config || {}).url, code: err.code, syscall: err.syscall, hostname: err.hostname });
  }
  const color = colorCodes[type];
  console.warn(chalk[color](message) + chalk.grey(`\n${JSON.stringify(payload, null, 2)}`));
}

const log = {
  warn: (message = '', err = {}) => handleError('warning', message, err),
  error: (message = '', err = {}) => handleError('error', message, err),
  fatal: (message = '', err = {}) => handleError('fatal', message, err)
};

module.exports = log;
