import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import { jenkinsService } from '../services/JenkinsService';

const router = Router();

// Get all Jenkins jobs
router.get('/jobs', authenticateToken, async (req: Request, res: Response) => {
  try {
    const jobs = await jenkinsService.getJobs();
    res.json(jobs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Trigger Jenkins build
router.post('/build/:jobName', authenticateToken, async (req: Request, res: Response) => {
  try {
    const jobName: string = String(req.params.jobName);

    const result = await jenkinsService.triggerBuild(jobName);

    res.json({
      success: true,
      message: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
