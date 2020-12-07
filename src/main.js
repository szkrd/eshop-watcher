const config = require('./config');
const { getSales } = require('./dal');
const { escapeRegExp, renderHbs, absolutePathTo, writeJsonFileIfNew } = require('./utils');
const DiscountedItem = require('./models/DiscounteItem');

module.exports = async function () {
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
  const interestingItems = discountedItems
    .filter(item => item.interesting)
    .filter(item => !wishListedItemIds.includes(item.id))
    .sort((a, b) => a.name.localeCompare(b.name));

  // render template
  const fromHbsFn = absolutePathTo('./templates/index.hbs');
  const toHtmlFn = absolutePathTo('./dist/index.html');
  const templateData = { wishListedItems, interestingItems, runDate: sales.runDate };
  await writeJsonFileIfNew(`${sales.dbDir}/template-data.json`, templateData);

  await renderHbs(fromHbsFn, templateData, toHtmlFn);
  console.info('wishlist items: ', wishListedItems.length);
  console.info('interesting items:', interestingItems.length);
};
