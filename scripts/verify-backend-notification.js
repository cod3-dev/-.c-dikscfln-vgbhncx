const http = require('http');

const body = JSON.stringify({
  patientId: 'patient-1',
  requestedSpecialty: 'General Medicine',
  symptoms: 'headache',
});

const appointmentReq = http.request(
  {
    method: 'POST',
    hostname: 'localhost',
    port: 4002,
    path: '/api/telemedicine/appointments',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Length': Buffer.byteLength(body),
    },
  },
  (res) => {
    let data = '';
    res.on('data', (chunk) => (data += chunk.toString()));
    res.on('end', () => {
      console.log('APPOINTMENT:', data);
      http.get('http://localhost:4003/api/notifications?recipientId=patient-1', (notifRes) => {
        let notifData = '';
        notifRes.on('data', (chunk) => (notifData += chunk.toString()));
        notifRes.on('end', () => {
          console.log('NOTIFICATIONS:', notifData);
        });
      }).on('error', (err) => {
        console.error('NOTIFICATION FETCH ERROR:', err.message);
      });
    });
  }
);

appointmentReq.on('error', (err) => {
  console.error('APPOINTMENT REQUEST ERROR:', err.message);
});

appointmentReq.write(body);
appointmentReq.end();
