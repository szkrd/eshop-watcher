const { readDir, readFile } = require('../utils/file');

async function getChangedItems (allItems = []) {
  const dbDirs = await readDir('~/db', /^\d{4}-\d{2}-\d{2}$/);
  if (dbDirs.length < 2) return allItems;
  const otherDir = dbDirs[dbDirs.length - 2];
  const lastTemplateData = await readFile(`~/db/${otherDir}/template-data.json`);
  if (!lastTemplateData) {
    console.warn('could not find the previous template data!');
    return allItems; // force caller to create a new template data json
  }
  const lastAllUids = [...lastTemplateData.interestingItems, ...lastTemplateData.wishListedItems].map(item => item.uid);
  const changed = [];
  allItems.forEach(item => {
    if (!lastAllUids.includes(item.uid)) {
      changed.push(item);
    }
  });
  return changed;
}

module.exports = getChangedItems;
