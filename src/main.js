const config = require('./config');
const getSales = require('./logic/getSales');
const sendMail = require('./logic/sendMail');
const serveDist = require('./logic/serveDist');
const markOldSaleItems = require('./logic/markOldSaleItems');
const { escapeRegExp, renderHbs } = require('./utils/misc');
const { absolutePathTo, writeJsonFileIfNew, keepLastXDirectories } = require('./utils/file');
const DiscountedItem = require('./models/DiscounteItem');
const paramMail = process.argv.includes('--mail');
const paramServer = process.argv.includes('--server');

module.exports = async function () {
  if (paramServer) {
    serveDist();
  }
  await keepLastXDirectories('~/db', config.numberOfDirsKeptInDb, /^\d{4}-\d{2}-\d{2}$/);
  const sales = await getSales();
  let discountedItems = sales.items.map(item => new DiscountedItem(item));
  if (config.ignoreUnreleased) {
    discountedItems = discountedItems.filter(item => !item.notYetReleased);
  }

  // get wished items
  const wishList = config.wishList;
  const wishListedItems = discountedItems
    .filter(item => {
      let matches = false;
      wishList.forEach(rule => {
        const rex = rule instanceof RegExp ? new RegExp(rule, 'i') : new RegExp(escapeRegExp(String(rule)), 'i');
        if (matches) return;
        if (rex.test(item.name)) matches = true;
      });
      return matches;
    });
  const wishListedItemIds = wishListedItems.map(item => item.id);

  // get interesting items
  let interestingItems = discountedItems
    .filter(item => item.interesting)
    .filter(item => !wishListedItemIds.includes(item.id))
    .sort((a, b) => a.name.localeCompare(b.name));

  // mark items that we've seen the last time, and move them to the bottom
  await markOldSaleItems(interestingItems);
  const notOldInteresting = interestingItems.filter(item => !item.old);
  const notOldInterestingCount = notOldInteresting.length;
  interestingItems = notOldInteresting.concat(interestingItems.filter(item => item.old));

  // render template
  const fromHbsFn = absolutePathTo('./templates/index.hbs');
  const toHtmlFn = absolutePathTo('./dist/index.html');
  const templateData = { wishListedItems, interestingItems, notOldInterestingCount, runDate: sales.runDate };
  await writeJsonFileIfNew(`${sales.dbDir}/template-data.json`, templateData);

  await renderHbs(fromHbsFn, templateData, toHtmlFn);
  console.info('wishlist items: ', wishListedItems.length);
  console.info('interesting items:', interestingItems.length);

  // TODO: do not send mail if nothing changed compared to the last template data (by uids)
  if (paramMail) {
    await sendMail();
  }
};
