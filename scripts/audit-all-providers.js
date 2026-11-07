const http = require('http');

const req = http.request({
  hostname: '127.0.0.1',
  port: 20128,
  path: '/v1/models',
  headers: {
    'Authorization': 'Bearer sk-ant-api03-85702967f40fcc12-f121cd-a362127e'
  }
}, (res) => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => {
    try {
      const list = JSON.parse(d).data || [];
      console.log(`Total live models returned by gateway: ${list.length}`);
      const byProv = {};
      for (const m of list) {
        const p = m.id.split('/')[0];
        if (!byProv[p]) byProv[p] = [];
        byProv[p].push(m.id);
      }
      for (const [p, ms] of Object.entries(byProv)) {
        console.log(`\n=== Provider [${p}]: ${ms.length} models ===`);
        console.log(ms.join('\n'));
      }
    } catch (e) {
      console.error('Error:', e.message);
    }
  });
});
req.end();
