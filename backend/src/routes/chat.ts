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
  if (baseCmd.startsWith('/')) {
    baseCmd = baseCmd.substring(1);
  }

  // HELP COMMAND
  if (cmd === '/help' || cmd === 'help') {
    responseText = `🤖 Available Commands:

📊 Monitoring
/status → View system status

🚀 Jenkins
/build <job-name> → Trigger Jenkins build

🐳 Docker
/docker ps → List containers
/docker restart <container-id> → Restart container

🚀 Deployment
/deploy <environment> → Deploy application

📜 Logs
/logs → View recent logs

💡 Example Commands:
status
build chatops-project
docker ps`;

  }

  // STATUS
  else if (cmd.startsWith('/status') || cmd === 'status') {
    try {
      const containers = await dockerService.listContainers();
      const running = containers.filter((c: any) => c.state === 'running').length;
      responseText = `✅ Server: Online
📊 Process Memory: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB
🐳 Containers: ${running} Running / ${containers.length} Total`;
    } catch (e) {
      responseText = `✅ Server: Online
📊 Process Memory: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB
🐳 Containers: Unable to reach Docker`;
    }
  }

  // BUILD
  else if (cmd.startsWith('/build') || cmd.startsWith('build ')) {
    const target = rawCmd.replace(/^\/?build\s*/i, '') || 'default';

    try {
      responseText = await jenkinsService.triggerBuild(target);
    } catch (error: any) {
      responseText = `[ERROR] ${error.message}`;
      status = 'failed';
    }
  }

  // DEPLOY
  else if (cmd.startsWith('/deploy') || cmd.startsWith('deploy ')) {
    if (user?.role !== 'admin') {
      responseText = `[ERROR] Unauthorized: Only admins can trigger deployments.`;
      status = 'failed';
    } else {
      const env = rawCmd.replace(/^\/?deploy\s*/i, '') || 'production';
      responseText = `🚀 Deploying latest code to '${env}' environment via CI/CD pipeline...`;
      try {
        // Trigger the actual 'ChatOps' Jenkins job which now has the deploy stage!
        const result = await jenkinsService.triggerBuild('ChatOps');
        responseText += `\n✅ ${result}`;
      } catch (error: any) {
        responseText += `\n❌ Deployment Failed: ${error.message}`;
        status = 'failed';
      }
    }
  }

  // LOGS
  else if (cmd.startsWith('/logs') || cmd.startsWith('logs ')) {
    const targetId = rawCmd.replace(/^\/?logs\s*/i, '').trim();
    if (!targetId || targetId === '/logs' || targetId === 'logs') {
      responseText = `[ERROR] Please provide a container ID. Example: /logs <container-id>`;
      status = 'failed';
    } else {
      try {
        responseText = await dockerService.getContainerLogs(targetId);
        if (!responseText) responseText = `[INFO] No logs found for container ${targetId}`;
      } catch (error: any) {
        responseText = `[ERROR] ${error.message}`;
        status = 'failed';
      }
    }
  }

  // DOCKER PS
  else if (cmd.startsWith('/docker ps') || cmd === 'docker ps') {
    try {
      const containers = await dockerService.listContainers();

      if (containers.length === 0) {
        responseText = `No containers running.`;
      } else {
        responseText =
          `CONTAINER ID   IMAGE                STATUS\n` +
          containers
            .map(
              (c) =>
                `${c.id.padEnd(14)} ${c.image.substring(0, 20).padEnd(20)} ${c.status}`
            )
            .join('\n');
      }
    } catch (error: any) {
      responseText = `[ERROR] Failed to list Docker containers: ${error.message}`;
      status = 'failed';
    }
  }

  // DOCKER RESTART
  else if (
    cmd.startsWith('/docker restart') ||
    cmd.startsWith('docker restart ')
  ) {
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
  }

  // UNKNOWN COMMAND
  else {
    responseText = `❌ I'm not sure how to process "${rawCmd}"

Try:
/help
/status
/build chatops-project
/docker ps`;

    status = 'failed';
  }

  chatCommandCounter.inc({
    command: baseCmd,
    status
  });

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
