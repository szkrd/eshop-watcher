const { renderHbs } = require('../utils/misc');
const { absolutePathTo, writeJsonFileIfNew } = require('../utils/file');

module.exports = async function buildHtmlTemplate (wishListedItems = [], interestingItems = [], sales = {}) {
  const fromHbsFn = absolutePathTo('./templates/index.hbs');
  const toHtmlFn = absolutePathTo('./dist/index.html');
  const notOldInterestingCount = interestingItems.filter(item => !item.old).length;
  const templateData = { wishListedItems, interestingItems, notOldInterestingCount, runDate: sales.runDate };
  await writeJsonFileIfNew(`${sales.dbDir}/template-data.json`, templateData);
  await renderHbs(fromHbsFn, templateData, toHtmlFn);
  console.info('wishlist items: ', wishListedItems.length);
  console.info('interesting items:', interestingItems.length);
};
