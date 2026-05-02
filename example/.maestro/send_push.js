// Maestro runScript helper - calls local push-relay
const title = typeof PUSH_TITLE !== 'undefined' ? PUSH_TITLE : 'Test';
const body = typeof PUSH_BODY !== 'undefined' ? PUSH_BODY : 'Test body';
const port = typeof PUSH_RELAY_PORT !== 'undefined' ? PUSH_RELAY_PORT : '8765';
const payload = JSON.stringify({ title, body });

output.result = http.post(`http://127.0.0.1:${port}/push`, {
  headers: { 'Content-Type': 'application/json' },
  body: payload,
});
