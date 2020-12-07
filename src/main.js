const config = require('./config');
const { getSales } = require('./dal');
const { escapeRegExp } = require('./utils');
const DiscountedItem = require('./models/DiscounteItem');

module.exports = async function () {
  const sales = await getSales();
  let discountedItems = sales.map(item => new DiscountedItem(item));
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

  // TODO: render template
  console.log(wishListedItems);
  console.log(interestingItems);
};
