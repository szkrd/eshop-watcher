const { renderHbs } = require('../utils/misc');
const { absolutePathTo, writeJsonFileIfNew } = require('../utils/file');

module.exports = async function buildHtmlTemplate (wishListedItems = [], interestingItems = [], sales = {}, jsonOutputOnly = false) {
  const fromHbsFn = absolutePathTo('./templates/index.hbs');
  const toHtmlFn = absolutePathTo('./dist/index.html');
  const notOldInterestingCount = interestingItems.filter(item => !item.old).length;
  const templateData = {
    wishListedItems,
    interestingItems,
    notOldInterestingCount,
    runDate: sales.runDate,
    runDateExact: (new Date()).toISOString()
  };
  await writeJsonFileIfNew(`${sales.dbDir}/template-data.json`, templateData);
  if (jsonOutputOnly) {
    console.info('skipped template rendering, saved json only');
    return false;
  }
  await renderHbs(fromHbsFn, templateData, toHtmlFn);
  console.info('wishlist items: ', wishListedItems.length);
  console.info('interesting items:', interestingItems.length);
  return true;
};
