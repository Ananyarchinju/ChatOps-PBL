import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

import authRoutes from './routes/auth';
import chatRoutes from './routes/chat';
import metricsRoutes from './routes/metrics';
import dockerRoutes from './routes/docker';
import jenkinsRoutes from './routes/jenkins';
import systemRoutes from './routes/system';
import { prisma } from './db';
import bcrypt from 'bcryptjs';
import { startSlackBot } from './slack';

const app = express();
const PORT = 4000; // Hardcoded to 4000 to free up 3000 for Jenkins deployments

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/docker', dockerRoutes);
app.use('/api/metrics', metricsRoutes);
app.use('/api/jenkins', jenkinsRoutes);
app.use('/api/system', systemRoutes);

app.get('/api/status', (req, res) => {
  res.json({ status: 'Online', version: '1.0.1' });
});

async function seedDatabase() {
  await prisma.user.upsert({
    where: { email: 'admin@chatops.local' },
    update: {},
    create: {
      email: 'admin@chatops.local',
      password: await bcrypt.hash('password123', 10),
      name: 'System Admin',
      role: 'admin'
    }
  });

  await prisma.user.upsert({
    where: { email: 'user@chatops.local' },
    update: {},
    create: {
      email: 'user@chatops.local',
      password: await bcrypt.hash('password123', 10),
      name: 'Standard User',
      role: 'user'
    }
  });

  await prisma.user.upsert({
    where: { email: 'slack@chatops.local' },
    update: {},
    create: {
      email: 'slack@chatops.local',
      password: await bcrypt.hash('slack-internal-pass', 10),
      name: 'Slack Integration',
      role: 'user'
    }
  });
  
  console.log('Database seeded successfully (upsert).');
}

app.listen(PORT, async () => {
  await seedDatabase();
  console.log(`ChatOps Backend running on http://localhost:${PORT}`);
  await startSlackBot();
});
