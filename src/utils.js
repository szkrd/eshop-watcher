const fs = require('fs').promises;
const axios = require('axios').default;

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

module.exports = {
  fileExists,
  writeJsonFile,
  writeJsonFileIfNew,
  getUrlOrReadFile
};
