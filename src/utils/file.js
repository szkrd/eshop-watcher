const path = require('path');
const fs = require('fs').promises;
const PROJECT_ROOT_RELATIVE_PATH = '../../';

function absolutePathTo (fn = '') {
  return path.normalize(path.join(__dirname, PROJECT_ROOT_RELATIVE_PATH, fn));
}

// TODO: use with every fn?
function resolvePath (fn = '') {
  return fn.startsWith('~/') ? absolutePathTo(fn.replace(/^~\//, '')) : fn;
}

async function readDir (fn = '', filterRex = /.*/) {
  const items = await fs.readdir(resolvePath(fn));
  return items.filter(name => !name.startsWith('.') && filterRex.test(name));
}

async function keepLastXDirectories (fn = '', num = 9999, filterRex = /.*/) {
  fn = resolvePath(fn);
  const items = await readDir(fn, filterRex);
  const itemsToDelete = items.slice(0, items.length - num);
  return Promise.all(itemsToDelete.map(name => fs.rm(path.join(fn, name), { recursive: true, force: true })));
}

async function deleteEmptySubDirs (fn = '') {
  fn = resolvePath(fn);
  let items = await fs.readdir(fn, { withFileTypes: true });
  items = items.filter(ent => ent.isDirectory()).map(ent => ent.name);
  const collection = await Promise.all(items.map(dir => {
    const target = path.join(fn, dir);
    return fs.readdir(target).then(result => ({ target, count: result.length }));
  }));
  return Promise.all(collection.filter(item => item.count === 0).map(item => fs.rmdir(item.target)));
}

async function touch (fn = '') {
  fn = resolvePath(fn);
  return fs.writeFile(fn, '');
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
  fn = resolvePath(fn);
  const exists = await fileExists(fn);
  if (!exists) {
    return writeJsonFile(fn, obj);
  }
}

async function readFile (fn = '', parse = true, throwError = false) {
  fn = resolvePath(fn);
  const exists = await fileExists(fn);
  if (!exists) return null;
  const text = await fs.readFile(fn, 'utf8');
  if (!fn.endsWith('.json')) return text; // non json files returned as is
  let result = null;
  try {
    result = JSON.parse(text);
  } catch (err) {
    if (throwError) {
      throw err;
    }
  }
  return result;
}

module.exports = {
  absolutePathTo,
  deleteEmptySubDirs,
  readDir,
  readFile,
  fileExists,
  touch,
  writeJsonFile,
  writeJsonFileIfNew,
  keepLastXDirectories
};
