const config = require('./config');
const { getSales } = require('./dal');

module.exports = async function () {
  const sales = await getSales();
  // just a quick emo
  console.log(sales.length);
  sales
    .filter(item => item.price.regular_price.raw_value > config.minimumOrigPriceOfInterestingItems)
    .sort((a, b) => a.formal_name.localeCompare(b.formal_name))
    .forEach(item => {
      const icon = parseFloat(item.price.discount_price.raw_value) < 10 ? '!' : '-';
      console.info(`${icon} ${item.formal_name}: ${item.price.regular_price.amount} -> ${item.price.discount_price.amount}`);
    });
};
