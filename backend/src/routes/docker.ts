import { Router } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/authMiddleware';
import { dockerService } from '../services/DockerService';

const router = Router();

router.get('/containers', authenticateToken, async (req: AuthRequest, res) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  try {
    const containers = await dockerService.listContainers();
    res.json(containers);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/status', authenticateToken, async (req: AuthRequest, res) => {
  const isOnline = await dockerService.ping();
  res.json({ status: isOnline ? 'Online' : 'Offline' });
});

router.post('/containers/:id/:action', authenticateToken, async (req: AuthRequest, res) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const id = req.params.id as string;
  const action = req.params.action as string;

  try {
    let result = '';
    if (action === 'start') {
      result = await dockerService.startContainer(id);
    } else if (action === 'stop') {
      result = await dockerService.stopContainer(id);
    } else if (action === 'restart') {
      result = await dockerService.restartContainer(id);
    } else {
      return res.status(400).json({ error: 'Invalid action' });
    }
    
    res.json({ message: result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
