const http = require('http');

const url = 'http://localhost:3000';

http.get(url, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk.toString(); });
  res.on('end', () => {
    console.log('status', res.statusCode);
    console.log('found follow-up launcher:', data.includes('id="follow-up"'));
    console.log('found follow-up panel script:', data.includes('renderFollowUpPanel'));
  });
}).on('error', (err) => {
  console.error('error', err.message);
});
