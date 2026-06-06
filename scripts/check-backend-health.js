const http = require('http');

function check(port) {
  const req = http.get({ hostname: 'localhost', port, path: '/health' }, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      console.log(`port ${port} status ${res.statusCode}`);
      console.log(`body: ${data}`);
    });
  });

  req.on('error', (err) => {
    console.error(`port ${port} error:`, err.code || err.message || err);
    console.error(err);
  });
}

check(4002);
check(4003);
