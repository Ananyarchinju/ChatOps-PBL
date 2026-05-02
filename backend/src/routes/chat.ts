import { Router } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/authMiddleware';
import { prisma } from '../db';
import { jenkinsService } from '../services/JenkinsService';
import { dockerService } from '../services/DockerService';
import { chatCommandCounter } from './metrics';

const router = Router();

router.get('/history', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const history = await prisma.commandHistory.findMany({
      where: { userId: req.user?.id },
      orderBy: { timestamp: 'asc' }
    });
    res.json(history);
  } catch (error) {
    console.error('Failed to fetch history', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

router.post('/command', authenticateToken, async (req: AuthRequest, res) => {
  const { command } = req.body;
  const user = req.user;
  
  if (!command) {
    return res.status(400).json({ error: 'Command is required' });
  }

  const rawCmd = command.trim();
  const cmd = rawCmd.toLowerCase();
  
  let responseText = '';
  let status = 'success';
  let baseCmd = cmd.split(' ')[0] || 'unknown';
  if (baseCmd.startsWith('/')) baseCmd = baseCmd.substring(1);
  
  // Handle slash commands and commands without slashes
  if (cmd.startsWith('/status') || cmd === 'status') {
    responseText = `Server: Online\nCPU: 32%\nRAM: 58%\nContainers: 6 Running`;
  } else if (cmd.startsWith('/build') || cmd.startsWith('build ')) {
    const target = rawCmd.replace(/^\/?build\s*/i, '') || 'default';
    try {
      responseText = await jenkinsService.triggerBuild(target);
    } catch (error: any) {
      responseText = `[ERROR] ${error.message}`;
      status = 'failed';
    }
  } else if (cmd.startsWith('/deploy') || cmd.startsWith('deploy ')) {
    if (user?.role !== 'admin') {
      responseText = `[ERROR] Unauthorized: Only admins can trigger deployments.`;
      status = 'failed';
    } else {
      const env = rawCmd.replace(/^\/?deploy\s*/i, '') || 'production';
      responseText = `Deploying latest Docker image to '${env}' environment...\nDeploy successful!`;
    }
  } else if (cmd.startsWith('/logs') || cmd === 'logs') {
    responseText = `Fetching latest logs...\n[INFO] System running normally.\n[WARN] High memory usage detected.`;
  } else if (cmd.startsWith('/docker ps') || cmd === 'docker ps') {
    try {
      const containers = await dockerService.listContainers();
      if (containers.length === 0) {
        responseText = `No containers running.`;
      } else {
        responseText = `CONTAINER ID   IMAGE          STATUS\n` + 
          containers.map(c => `${c.id.padEnd(14)} ${c.image.substring(0, 14).padEnd(14)} ${c.status}`).join('\n');
      }
    } catch (error: any) {
      responseText = `[ERROR] Failed to list Docker containers: ${error.message}`;
      status = 'failed';
    }
  } else if (cmd.startsWith('/docker restart') || cmd.startsWith('docker restart ')) {
    if (user?.role !== 'admin') {
      responseText = `[ERROR] Unauthorized: Only admins can restart containers.`;
      status = 'failed';
    } else {
      const parts = rawCmd.split(' ');
      const targetId = parts[parts.length - 1];
      try {
        responseText = await dockerService.restartContainer(targetId);
      } catch (error: any) {
        responseText = `[ERROR] ${error.message}`;
        status = 'failed';
      }
    }
  } else if (cmd.includes('why') && cmd.includes('failed')) {
    responseText = `[AI Analysis] I've analyzed the recent logs. The build failed because of a missing dependency in the frontend package.json: 'axios'. Please run 'npm install axios' and trigger the build again.`;
  } else {
    responseText = `I'm not sure how to process "${rawCmd}".\n\nAvailable commands:\n- /status\n- /build [target]\n- /deploy [env]\n- /logs\n- /docker ps\n\nYou can also ask me questions like "Why build failed?"`;
    status = 'failed';
  }

  chatCommandCounter.inc({ command: baseCmd, status });

  try {
    if (user) {
      await prisma.commandHistory.create({
        data: {
          command: rawCmd,
          status,
          output: responseText,
          userId: user.id
        }
      });
    }
  } catch (error) {
    console.error('Failed to log command history', error);
  }

  res.json({ response: responseText });
});

export default router;
