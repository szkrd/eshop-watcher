let userConfig = {};
try {
  userConfig = require('../config.user.json');
} catch (err) {}

module.exports = Object.assign({
  storeCountryCode: 'HU',
  storeLangCode: 'hu',
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
  minimumOrigPriceOfInterestingItems: 20
}, userConfig);
