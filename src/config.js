let userConfig = {};
try {
  userConfig = require('../config.user.json');
} catch (err) {}

module.exports = Object.assign({
  storeCountryCode: 'HU',
  storeLangCode: 'hu',
  // no, it's not possible to get a direct, regional store url to a game
  // but since I'd like to have a link to "something", at least link to a search engine
  _moreInfoSearchText_TODO: 'switch {ITEM_NAME}',
  _moreInfoUrl_TODO: 'https://www.google.com/search?q={SEARCH_TEXT}',
  // a mapped url list can be found at:
  // https://gist.github.com/Shy07/822eff655ec8da2717f269bc21c65976
  salesApiUrl: 'https://ec.nintendo.com/api/{COUNTRY}/en/search/sales?count={COUNT}&offset={OFFSET}',
  // so far the maximum seems to be 30
  salesApiCount: 30,
  priceApiUrl: 'https://api.ec.nintendo.com/v1/price?country={COUNTRY}&ids={IDS}&lang={LANG}',
  // it happily served 50 last time I checked
  priceApiMaxIdCount: 50,
  // api responses will be stored in the _db_ folder for the current day,
  // number of days/folders kept around
  numberOfDirsKeptInDb: 5,
  // any game that's original price is above this value and it pops
  // up in the deals list will be deemed "interesting"
  minimumOrigPriceOfInterestingItems: 20,
  // mark interesting items that are below this value
  mustBuyInterestingItemBelowPrice: 10,
  // use string or regex, matcher is case insensitive, whitespaces are normalized
  // wishliste items will always be above the interesting items
  wishList: [
    'the legend of zelda: breath of the wild',
    'friends of mineral town',
    /^indie/
  ]
}, userConfig);
