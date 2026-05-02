import { Router } from 'express';
import client from 'prom-client';

const router = Router();

const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({ register: client.register });

export const chatCommandCounter = new client.Counter({
  name: 'chatops_commands_total',
  help: 'Total number of chat commands executed',
  labelNames: ['command', 'status']
});

router.get('/', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  const metrics = await client.register.metrics();
  res.send(metrics);
});

export default router;
