const http = require('http');

http.get('http://localhost:3000/src/app/main.js', (res) => {
  let data = '';
  res.on('data', (chunk) => (data += chunk.toString()));
  res.on('end', () => {
    console.log('status', res.statusCode);
    console.log('has renderFollowUpPanel', data.includes('renderFollowUpPanel'));
  });
}).on('error', (err) => {
  console.error('error', err.message);
});
