function detectErrorType (err) {
  // let's add more fun errors when they arise
  if (err.code && err.syscall && err.hostname) {
    return 'network';
  }
  return 'other';
}

module.exports = {
  detectErrorType
};
