const crypto = require('crypto');
const fs = require('fs').promises;
const Handlebars = require('handlebars');
const config = require('../config');
const { fileExists } = require('./file');
const axios = require('axios').default;

function sleep (n = 0) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), n);
  });
}

function sleepDays (n = 1) {
  return sleep(1000 * 60 * 60 * 24);
}

function escapeRegExp (text = '') {
  return text.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&');
}

function toHash (text = '') {
  const shasum = crypto.createHash('sha1'); // yes, it is broken
  shasum.update(text);
  return shasum.digest('hex');
}

function roundPrice (value = 0, currency = '') {
  const currencies = { EUR: '€', USD: '$', YEN: '¥' };
  return config.roundPriceFormat
    .replace(/\{VALUE}/gi, Math.round(parseFloat(value)))
    .replace(/\{CURRENCY}/gi, currencies[currency.toUpperCase()] || currency);
}

async function getUrlOrReadFile (url = '', fn = '') {
  const alreadyExists = await fileExists(fn);
  if (alreadyExists) {
    const json = await fs.readFile(fn, 'utf8');
    return JSON.parse(json);
  }
  const response = await axios.get(url);
  await fs.writeFile(fn, JSON.stringify(response.data, null, 2), 'utf8');
  return response.data;
}

const _hbsTemplates = {};
async function renderHbs (fn = '', data = {}, targetFn = '') {
  if (_hbsTemplates[fn]) {
    return _hbsTemplates[fn](data);
  }
  const text = await fs.readFile(fn, 'utf8');
  const tpl = _hbsTemplates[fn] = Handlebars.compile(text);
  const result = tpl(data);
  if (!targetFn) return result;
  return fs.writeFile(targetFn, result, 'utf8');
}

module.exports = {
  escapeRegExp,
  getUrlOrReadFile,
  renderHbs,
  roundPrice,
  sleep,
  sleepDays,
  toHash
};
