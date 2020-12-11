const log = require('./src/utils/log');
const main = require('./src/main');
main().catch(err => log.fatal('uncaught fatal error, exiting', err));
