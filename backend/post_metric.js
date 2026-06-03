const data = { command: 'testcmd', status: 'success', count: 3 };
(async () => {
  try {
    const res = await fetch('http://localhost:4000/api/metrics/increment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    console.log('status', res.status);
    const text = await res.text();
    console.log(text);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
