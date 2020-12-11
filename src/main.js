const config = require('./config');
const getSales = require('./logic/getSales');
const sortSales = require('./logic/sortSales');
const sendMail = require('./logic/sendMail');
const serveDist = require('./logic/serveDist');
const getChangedItems = require('./logic/getChangedItems');
const buildHtmlTemplate = require('./logic/buildHtmlTemplate');
const { keepLastXDirectories, deleteEmptySubDirs, touch } = require('./utils/file');
const { sleepDays } = require('./utils/misc');
const { getShortDate } = require('./utils/date');
const log = require('./utils/log');
const { detectErrorType } = require('./utils/error');
const paramMail = process.argv.includes('--mail');
const paramServer = process.argv.includes('--server');
const paramCron = process.argv.includes('--cron');

async function run () {
  await deleteEmptySubDirs('~/db'); // probably wiping out dirs wo .success would be better
  await keepLastXDirectories('~/db', config.numberOfDirsKeptInDb, /^\d{4}-\d{2}-\d{2}$/);

  // download sales and prices from api
  let sales = { items: [] };
  try {
    sales = await getSales();
  } catch (err) {
    if (detectErrorType(err) === 'network') {
      log.warn('error getting sales data, there is not much to do here', err);
    } else {
      throw err;
    }
    return;
  }

  const { wishListedItems, interestingItems } = await sortSales(sales);
  const changedItems = await getChangedItems([...wishListedItems, ...interestingItems]);
  const itemsChangedSinceLastJob = changedItems.length > 0;
  let templateRendered = false;

  // let's try to detect relevancy compared to the previous run
  if (itemsChangedSinceLastJob) {
    console.log('changes since last time:', changedItems.length);
    await buildHtmlTemplate(wishListedItems, interestingItems, sales);
    templateRendered = true;
  } else {
    console.info('no relevant changes since last time, not rendering the template');
  }

  // if we're still around and sales managed to use the dbDir, let's flag it as successful
  if (sales.dbDir && sales.items.length) {
    await touch(`${sales.dbDir}/.success`);
  }

  // send email
  if (paramMail && templateRendered) {
    try {
      await sendMail();
    } catch (err) {
      log.warn('mail sending failed', err);
    }
  } else {
    console.info('mail sending skipped');
  }
}

// ---

module.exports = async function main () {
  if (paramServer) {
    serveDist();
  }
  if (!paramCron) {
    console.info('single run');
    return run();
  } else {
    let iterCount = 1;
    while (iterCount) {
      console.info(`iteration: ${iterCount} at ${getShortDate()}`);
      await run();
      await sleepDays(Math.max(config.sleepDays, 1));
      iterCount++;
    }
  }
};
