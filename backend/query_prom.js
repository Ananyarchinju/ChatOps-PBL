const queries = [
  'process_cpu_user_seconds_total',
  'nodejs_heap_space_size_used_bytes',
  'sum(chatops_commands_total)'
];
(async () => {
  for (const q of queries) {
    const res = await fetch(`http://localhost:9090/api/v1/query?query=${encodeURIComponent(q)}`);
    const json = await res.json();
    console.log(q, 'status=', json.status, 'count=', json.data?.result?.length ?? 0);
  }
})();
