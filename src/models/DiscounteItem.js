const config = require('../config');
const prettyDate = require('../vendor/prettyDate');

module.exports = class DiscountedItem {
  constructor (rawObj) {
    this.name = rawObj.formal_name;
    this.banner = rawObj.hero_banner_url;
    this.releaseDate = new Date(rawObj.release_date_on_eshop); // orig: 2020-10-10
    this.releaseDatePretty = prettyDate(new Date(rawObj.release_date_on_eshop));
    this.notYetReleased = new Date(rawObj.release_date_on_eshop) > new Date();
    this.screenshots = (rawObj.screenshots || []).reduce((acc, item) => { // array of urls
      item.images.forEach(img => acc.push(img.url));
      return acc;
    }, []);
    this.interesting = rawObj.price.regular_price.raw_value > config.minimumOrigPriceOfInterestingItems;
    this.mustBuy = rawObj.price.discount_price.raw_value <= config.mustBuyInterestingItemBelowPrice;

    const priceRegular = (rawObj.price || {}).regular_price;
    const priceDiscounted = (rawObj.price || {}).discount_price;
    this.price = {
      regular: {
        amount: priceRegular.amount,
        currency: priceRegular.currency,
        value: parseFloat(priceRegular.raw_value)
      },
      discounted: {
        amount: priceDiscounted.amount,
        currency: priceDiscounted.currency,
        value: parseFloat(priceDiscounted.raw_value),
        startDate: new Date(priceDiscounted.start_datetime),
        startDatePretty: prettyDate(new Date(priceDiscounted.start_datetime)),
        endDate: new Date(priceDiscounted.end_datetime),
        endDatePretty: prettyDate(new Date(priceDiscounted.end_datetime))
      }
    };
  }

  asObject () {
    return Object.assign({}, this);
  }
};
