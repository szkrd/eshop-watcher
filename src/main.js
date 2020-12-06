const config = require('./config');
const { getSales } = require('./dal');
const { escapeRegExp } = require('./utils');
const DiscountedItem = require('./models/DiscounteItem');

module.exports = async function () {
  const sales = await getSales();
  const discountedItems = sales.map(item => new DiscountedItem(item));

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

  // get interesting items
  const interestingItems = discountedItems
    .filter(item => item.interesting)
    .sort((a, b) => a.name.localeCompare(b.name));
    // const icon = parseFloat(item.price.discount_price.raw_value) < 10 ? '!' : '-';
    // console.info(`${icon} ${item.formal_name}: ${item.price.regular_price.amount} -> ${item.price.discount_price.amount}`);

  // TODO: render template
  console.log(wishListedItems);
  console.log(interestingItems);
};
