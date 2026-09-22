const http = require('http');

const OMNIROUTE_URL = 'http://127.0.0.1:20128';
const PORT = 20129;

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/v1/models') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      object: 'list',
      data: [
        { id: 'limitless-opus', object: 'model', created: 1700000000, owned_by: 'limitless' },
        { id: 'limitless-sonnet', object: 'model', created: 1700000000, owned_by: 'limitless' },
        { id: 'limitless-haiku', object: 'model', created: 1700000000, owned_by: 'limitless' }
      ]
    }));
    return;
  }

  // Proxy everything else
  const options = {
    hostname: '127.0.0.1',
    port: 20128,
    path: req.url,
    method: req.method,
    headers: req.headers
  };
  options.headers.host = '127.0.0.1:20128';

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });

  proxyReq.on('error', (err) => {
    console.error('Proxy error:', err.message);
    res.writeHead(502);
    res.end('Bad Gateway');
  });

  req.pipe(proxyReq, { end: true });
});

server.listen(PORT, () => {
  console.log('Limitless proxy running on http://127.0.0.1:' + PORT);
});
