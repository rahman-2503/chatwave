import { io } from 'socket.io-client';

const API = 'http://localhost:5000';
const results = [];
const ok = (n) => results.push(`PASS  ${n}`);
const bad = (n) => results.push(`FAIL  ${n}`);

const a = io(API, { transports: ['websocket'] });
const b = io(API, { transports: ['websocket'] });

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  await Promise.all([
    new Promise((r) => a.on('connect', r)),
    new Promise((r) => b.on('connect', r)),
  ]);
  ok('two clients connected');

  a.emit('user_join', 'alice');
  b.emit('user_join', 'bob');
  await wait(500);

  const seen = new Promise((r) => b.on('receive_message', r));
  const deliveredEvt = new Promise((r) => a.on('message_status_update', r));
  a.emit('send_message', { username: 'alice', text: 'Hello from Alice' });
  const m1 = await seen;
  m1.username === 'alice' && m1.text === 'Hello from Alice'
    ? ok('A -> B real-time delivery')
    : bad('A -> B real-time delivery');

  const d = await Promise.race([deliveredEvt, wait(2000).then(() => null)]);
  d && d.status === 'delivered' && d.messageId === m1._id
    ? ok('delivered receipt to sender')
    : bad('delivered receipt to sender');

  const seen2 = new Promise((r) => a.on('receive_message', r));
  b.emit('send_message', { username: 'bob', text: 'Hi Alice from Bob' });
  const m2 = await seen2;
  m2.username === 'bob' ? ok('B -> A real-time delivery') : bad('B -> A real-time delivery');

  const typing = new Promise((r) => b.on('user_typing', r));
  a.emit('typing', 'alice');
  (await typing) === 'alice' ? ok('typing indicator') : bad('typing indicator');

  const delivered = await Promise.race([deliveredEvt, wait(1500).then(() => null)]);

  const readEvt = new Promise((r) => a.on('message_status_update', r));
  b.emit('message_read', { messageId: m1._id, reader: 'bob' });
  const rd = await Promise.race([readEvt, wait(2000).then(() => null)]);
  rd && rd.status === 'read' && rd.messageId === m1._id
    ? ok('read receipt back to sender')
    : bad('read receipt back to sender');

  const stopped = new Promise((r) => b.on('user_stop_typing', r));
  a.emit('stop_typing', 'alice');
  (await stopped) === 'alice' ? ok('stop typing') : bad('stop typing');

  let online = [];
  a.on('online_users', (u) => { online = u; });
  await wait(200);
  a.emit('user_join', 'alice');
  await wait(500);
  online.length >= 2 ? ok('online user list') : bad('online user list');

  const off = new Promise((r) => a.on('user_offline', r));
  b.close();
  (await off) === 'bob' ? ok('disconnect / offline event') : bad('disconnect / offline event');

  const res = await fetch(`${API}/api/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'carol', text: 'posted via REST' }),
  });
  const created = await res.json();
  created.username === 'carol' && created.text === 'posted via REST'
    ? ok('REST POST /api/messages')
    : bad('REST POST /api/messages');

  const invalid = await fetch(`${API}/api/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: '', text: '' }),
  });
  invalid.status === 400 ? ok('validation returns 400') : bad('validation returns 400');

  const hist = await (await fetch(`${API}/api/messages/history?limit=100`)).json();
  hist.length >= 3 ? ok(`REST GET history (${hist.length} msgs)`) : bad('REST GET history');
  hist.every((m) => m.timestamp) ? ok('timestamps stored') : bad('timestamps stored');

  const h = await (await fetch(`${API}/health`)).json();
  h.status === 'ok' ? ok('health endpoint') : bad('health endpoint');

  a.close();
  await wait(300);
  console.log(results.join('\n'));
  const failed = results.filter((r) => r.startsWith('FAIL')).length;
  console.log(`\n${results.length - failed}/${results.length} passed`);
  process.exit(failed ? 1 : 0);
}

main().catch((e) => {
  console.log(results.join('\n'));
  console.log('ERROR: ' + e.message);
  process.exit(1);
});
