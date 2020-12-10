const config = require('../config');
const markOldSaleItems = require('./markOldSaleItems');
const DiscountedItem = require('../models/DiscounteItem');
const { escapeRegExp } = require('../utils/misc');

module.exports = async function sortSales (sales = []) {
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
  interestingItems = notOldInteresting.concat(interestingItems.filter(item => item.old));

  return { wishListedItems, interestingItems };
};
