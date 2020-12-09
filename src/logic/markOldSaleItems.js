const { readDir, readFile } = require('../utils/file');

async function markOldSaleItems (interestingItems = []) {
  const dbDirs = await readDir('~/db', /^\d{4}-\d{2}-\d{2}$/);
  const penultimateDir = dbDirs[dbDirs.length - 2];
  const oldTemplateData = await readFile(`~/db/${penultimateDir}/template-data.json`);
  const oldItemIds = (oldTemplateData.interestingItems || []).map(item => item.id);
  interestingItems.forEach(item => { item.old = oldItemIds.includes(item.id); });
  return interestingItems;
}

module.exports = markOldSaleItems;
