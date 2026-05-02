import { Router } from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import { jenkinsService } from '../services/JenkinsService';

const router = Router();

router.get('/jobs', authenticateToken, async (req, res) => {
  try {
    const jobs = await jenkinsService.getJobs();
    res.json(jobs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
