const path = require('path');
const fs = require('fs').promises;
const config = require('./config');
const { fileExists, writeJsonFileIfNew, getUrlOrReadFile } = require('./utils');

function getSalesUrl (offset = 0) {
  return config.salesApiUrl
    .replace(/\{COUNTRY}/g, config.storeCountryCode)
    .replace(/\{COUNT}/g, config.salesApiCount)
    .replace(/\{OFFSET}/g, offset);
}

function getSalesFileName (offset = 0) {
  return `sales-${config.storeCountryCode.toLowerCase()}-${config.salesApiCount}-${offset}.json`;
}

function getPriceUrl (offset = 0, ids = []) {
  return config.priceApiUrl
    .replace(/\{COUNTRY}/g, config.storeCountryCode)
    .replace(/\{LANG}/g, config.storeLangCode)
    .replace(/\{IDS}/g, ids.slice(offset, offset + config.priceApiMaxIdCount).join(','));
}

function getPriceFileName (offset = 0) {
  return `price-${config.storeCountryCode.toLowerCase()}-${config.storeLangCode}-${config.priceApiMaxIdCount}-${offset}.json`;
}

async function getSales () {
  const date = new Date().toISOString().slice(0, 19).replace(/T.*/, '');
  const dbDir = path.normalize(path.join(__dirname, `../db/${date}`));
  const dbDirReady = await fileExists(dbDir);
  if (!dbDirReady) {
    console.info(`creating db dir ${date}`);
    await fs.mkdir(dbDir);
  }

  console.info('loading sales data...');
  let url = getSalesUrl();
  let count = config.salesApiCount;
  let dbFile = `${dbDir}/${getSalesFileName(0)}`;
  const result = await getUrlOrReadFile(url, dbFile);
  const salesItems = result.contents.slice();
  let total = result.total;
  let offset = count;
  if (total > count) {
    while (offset < total) {
      url = getSalesUrl(offset);
      dbFile = `${dbDir}/${getSalesFileName(offset)}`;
      const result = await getUrlOrReadFile(url, dbFile);
      salesItems.push(...result.contents);
      offset += count;
    }
  }
  console.info('number of items on sale:', salesItems.length);
  // save merged sale data in case you want to look things up
  let allFn = `${dbDir}/${getSalesFileName('all')}`;
  await writeJsonFileIfNew(allFn, salesItems);

  const itemIds = [];
  salesItems.forEach(item => {
    if (!itemIds.includes(item.id)) {
      itemIds.push(item.id);
    }
  });
  itemIds.sort();
  // junction table of sales and price
  await writeJsonFileIfNew(`${dbDir}/sales-price.json`, itemIds);

  // price data
  console.info('loading price data...');
  total = itemIds.length;
  count = config.priceApiMaxIdCount;
  offset = 0;
  const prices = [];
  while (offset < total) {
    url = getPriceUrl(offset, itemIds);
    dbFile = `${dbDir}/${getPriceFileName(offset)}`;
    const result = await getUrlOrReadFile(url, dbFile);
    prices.push(...result.prices);
    offset += count;
  }
  allFn = `${dbDir}/${getPriceFileName('all')}`;
  await writeJsonFileIfNew(allFn, prices);
  if (prices.length !== itemIds.length) {
    console.error('ERROR: could not download price data for some of the item ids?');
  }
  // let's massage price data into sales data
  salesItems.forEach(item => {
    item.price = prices.find(priceItem => priceItem.title_id === item.id);
  });
  await writeJsonFileIfNew(`${dbDir}/sales-normalized.json`, salesItems);
  console.info('sales has been hydrated with price');
  return salesItems;
}

module.exports = {
  getSales
};
