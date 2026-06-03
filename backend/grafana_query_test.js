const auth = Buffer.from('admin:admin123').toString('base64');
const query = {
  queries: [
    {
      refId: 'A',
      datasource: { uid: 'PBFA97CFB590B2093', type: 'prometheus' },
      expr: 'process_cpu_user_seconds_total',
      intervalMs: 15000,
      maxDataPoints: 500
    }
  ],
  from: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  to: new Date().toISOString()
};
(async () => {
  const res = await fetch('http://localhost:3001/api/ds/query', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(query)
  });
  console.log('status', res.status);
  const text = await res.text();
  console.log(text);
})();
