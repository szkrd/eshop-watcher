let userConfig = {};
try {
  userConfig = require('../config.user.json');
} catch (err) {}

module.exports = Object.assign({
  storeCountryCode: 'HU',
  storeLangCode: 'hu',
  // there is Intl date format, but I want localized date in the email;
  // the only supported template vars are Y (2020), D (01), M (01)
  dateFormat: 'Y. M. D.',
  // no, it's not possible to get a direct, regional store url to a game
  // but since I'd like to have a link to "something", at least link to a search engine
  moreInfoSearchText: 'switch "{ITEM_NAME}"',
  moreInfoUrl: 'https://www.google.com/search?q={SEARCH_TEXT}',
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
  // up in the deals list will be deemed as "interesting"
  minimumOrigPriceOfInterestingItems: 25,
  // mark interesting items that are below this value;
  // value / 2 (dirt cheap) will also be marked in the rendered html
  mustBuyInterestingItemBelowPrice: 10,
  // I'm not buying invisible software
  ignoreUnreleased: true,
  // because 9.99 is a cheap and stupid trick
  roundDisplayPrice: true,
  roundPriceFormat: '{VALUE}{CURRENCY}',
  // wishlist
  // - use string or regex, matcher is case insensitive, whitespaces are normalized;
  // - wishlist items will always be above the interesting items;
  // - wishlist items will never be marked old, it's up to you to remove them from this config
  wishList: [
    'friends of mineral town',
    /Legend of Zelda™?: Breath of the Wild/,
    /^mega\s?man/,
    /^indie/
  ],
  // if launched with the --cron param, then number of days to wait between runs (minimum is 1)
  sleepDays: 1,
  // if launched with the --server param, then a static server will be instanciated here
  listenHost: '127.0.0.1',
  listenPort: 8080,
  sendGridApiKey: '',
  emailFrom: 'your@email.com',
  // if set to falsy, then it will fallback to the from address
  // (note: whatever I do, I can't make gmail understand that this is not spam,
  // so it asks for confirmation every time; at least the mail lands in the inbox)
  emailTo: 'John Doe <foobar@mail.com>'
}, userConfig);
