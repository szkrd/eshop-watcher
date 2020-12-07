const crypto = require('crypto');
const path = require('path');
const fs = require('fs').promises;
const Handlebars = require('handlebars');
const config = require('./config');
const axios = require('axios').default;
const PROJECT_ROOT_RELATIVE_PATH = '../';

function escapeRegExp (text = '') {
  return text.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&');
}

function toHash (text = '') {
  const shasum = crypto.createHash('sha1'); // yes, it is broken
  shasum.update(text);
  return shasum.digest('hex');
}

function formatDate (date = 0, formatString = 'M/D/Y') {
  date = date instanceof Date ? date : new Date(date);
  return formatString
    .replace(/Y+/gi, date.getFullYear())
    .replace(/M+/gi, String(date.getMonth() + 1).padStart(2, '0'))
    .replace(/D+/gi, String(date.getDate() + 1).padStart(2, '0'));
}

function getShortDate () {
  return new Date().toISOString().slice(0, 19).replace(/T.*/, '');
}

function roundPrice (value = 0, currency = '') {
  const currencies = { EUR: '€', USD: '$', YEN: '¥' };
  return config.roundPriceFormat
    .replace(/\{VALUE}/gi, Math.round(parseFloat(value)))
    .replace(/\{CURRENCY}/gi, currencies[currency.toUpperCase()] || currency);
}

function absolutePathTo (fn = '') {
  return path.normalize(path.join(__dirname, PROJECT_ROOT_RELATIVE_PATH, fn));
}

async function fileExists (fn) {
  try {
    await fs.stat(fn);
    return true;
  } catch (err) {
    if (err.code !== 'ENOENT') {
      throw err;
    }
  }
  return false;
}

async function writeJsonFile (fn = '', obj = {}) {
  return fs.writeFile(fn, JSON.stringify(obj, null, 2), 'utf8');
}

async function writeJsonFileIfNew (fn = '', obj = {}) {
  const exists = await fileExists(fn);
  if (!exists) {
    return writeJsonFile(fn, obj);
  }
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
  absolutePathTo,
  escapeRegExp,
  fileExists,
  formatDate,
  getShortDate,
  getUrlOrReadFile,
  renderHbs,
  roundPrice,
  toHash,
  writeJsonFile,
  writeJsonFileIfNew
};
