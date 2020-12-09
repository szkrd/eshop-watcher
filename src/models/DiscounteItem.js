const config = require('../config');
const { formatDate } = require('../utils/date');
const { toHash, roundPrice } = require('../utils/misc');
const prettyDate = require('../vendor/prettyDate');

module.exports = class DiscountedItem {
  constructor (rawObj) {
    this.id = String(rawObj.id);
    this.old = false;
    this.name = rawObj.formal_name.replace(/\s+/g, ' ');
    this.banner = rawObj.hero_banner_url;
    this.releaseDate = new Date(rawObj.release_date_on_eshop); // orig: 2020-10-10
    this.releaseDateFormatted = formatDate(rawObj.release_date_on_eshop, config.dateFormat);
    this.releaseDatePretty = prettyDate(new Date(rawObj.release_date_on_eshop)); // in an email it may look "old"
    this.notYetReleased = new Date(rawObj.release_date_on_eshop) > new Date();
    this.screenshots = (rawObj.screenshots || []).reduce((acc, item) => { // array of urls
      item.images.forEach(img => acc.push(img.url));
      return acc;
    }, []);
    this.interesting = rawObj.price.regular_price.raw_value > config.minimumOrigPriceOfInterestingItems;
    this.mustBuy = rawObj.price.discount_price.raw_value <= config.mustBuyInterestingItemBelowPrice;
    this.bargainBin = rawObj.price.discount_price.raw_value <= config.mustBuyInterestingItemBelowPrice / 2;

    const priceRegular = (rawObj.price || {}).regular_price;
    const priceDiscounted = (rawObj.price || {}).discount_price;
    this.price = {
      regular: {
        amount: priceRegular.amount,
        amountFormatted: config.roundDisplayPrice ? roundPrice(priceRegular.raw_value, priceRegular.currency) : priceRegular.amount,
        currency: priceRegular.currency,
        value: parseFloat(priceRegular.raw_value)
      },
      discounted: {
        amount: priceDiscounted.amount,
        amountFormatted: config.roundDisplayPrice ? roundPrice(priceDiscounted.raw_value, priceDiscounted.currency) : priceDiscounted.amount,
        currency: priceDiscounted.currency,
        value: parseFloat(priceDiscounted.raw_value),
        startDate: new Date(priceDiscounted.start_datetime),
        startDateFormatted: formatDate(new Date(priceDiscounted.start_datetime), config.dateFormat),
        startDatePretty: prettyDate(new Date(priceDiscounted.start_datetime)),
        endDate: new Date(priceDiscounted.end_datetime),
        endDateFormatted: formatDate(new Date(priceDiscounted.end_datetime), config.dateFormat),
        endDatePretty: prettyDate(new Date(priceDiscounted.end_datetime))
      }
    };
    this.uid = this.getUid();
    this.moreInfoUrl = config.moreInfoUrl
      .replace(/\{SEARCH_TEXT}/g, encodeURIComponent(config.moreInfoSearchText.replace(/\{ITEM_NAME}/g, this.name)));
  }

  getUid () {
    // if these are not changed, I'm not going to resend this item as a suggestion
    return toHash([
      this.id,
      this.name,
      this.notYetReleased,
      this.interesting,
      this.mustBuy,
      this.price.regular.amount,
      this.price.discounted.amount,
      this.price.discounted.endDate * 1
    ].join(''));
  }

  asObject () {
    return Object.assign({}, this);
  }
};
