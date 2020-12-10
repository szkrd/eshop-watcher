const config = require('./config');
const getSales = require('./logic/getSales');
const sortSales = require('./logic/sortSales');
const sendMail = require('./logic/sendMail');
const serveDist = require('./logic/serveDist');
const getChangedItems = require('./logic/getChangedItems');
const buildHtmlTemplate = require('./logic/buildHtmlTemplate');
const { keepLastXDirectories } = require('./utils/file');
const { sleepDays } = require('./utils/misc');
const { getShortDate } = require('./utils/date');
const paramMail = process.argv.includes('--mail');
const paramServer = process.argv.includes('--server');
const paramCron = process.argv.includes('--cron');

async function run () {
  await keepLastXDirectories('~/db', config.numberOfDirsKeptInDb, /^\d{4}-\d{2}-\d{2}$/);
  const sales = await getSales();
  const { wishListedItems, interestingItems } = await sortSales(sales);

  const changedItems = await getChangedItems([...wishListedItems, ...interestingItems]);
  const itemsChangedSinceLastJob = changedItems.length > 0;
  let templateRendered = false;

  if (itemsChangedSinceLastJob) {
    console.log('changes since last time:', changedItems.length);
    await buildHtmlTemplate(wishListedItems, interestingItems, sales);
    templateRendered = true;
  } else {
    console.info('no relevant changes since last time, not rendering the template');
  }

  if (paramMail && templateRendered) {
    await sendMail();
  } else {
    console.info('mail sending skipped');
  }
}

module.exports = async function () {
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
