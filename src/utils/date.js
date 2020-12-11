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

module.exports = {
  formatDate,
  getShortDate
};
