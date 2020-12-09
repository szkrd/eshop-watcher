const handler = require('serve-handler');
const http = require('http');
const config = require('../config');
const { absolutePathTo } = require('../utils/file');

const server = http.createServer((request, response) => {
  // options: https://github.com/vercel/serve-handler#options
  return handler(request, response, {
    public: absolutePathTo('dist'),
    directoryListing: false
  });
});

const port = config.listenPort || 8080;
const host = config.listenHost || '127.0.0.1';
server.listen(port, host, () => {
  console.log(`serve running at http://${host}:${port}`);
});
