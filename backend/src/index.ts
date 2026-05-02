import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import chatRoutes from './routes/chat';
import metricsRoutes from './routes/metrics';
import dockerRoutes from './routes/docker';
import jenkinsRoutes from './routes/jenkins';
import { prisma } from './db';
import bcrypt from 'bcryptjs';
import { startSlackBot } from './slack';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/docker', dockerRoutes);
app.use('/api/metrics', metricsRoutes);
app.use('/api/jenkins', jenkinsRoutes);

app.get('/api/status', (req, res) => {
  res.json({ status: 'Online', version: '1.0.0' });
});

async function seedDatabase() {
  const adminExists = await prisma.user.findUnique({ where: { email: 'admin@chatops.local' } });
  if (!adminExists) {
    await prisma.user.create({
      data: {
        email: 'admin@chatops.local',
        password: await bcrypt.hash('password123', 10),
        name: 'System Admin',
        role: 'admin'
      }
    });
    console.log('Seeded admin@chatops.local');
  }

  const userExists = await prisma.user.findUnique({ where: { email: 'dev@chatops.local' } });
  if (!userExists) {
    await prisma.user.create({
      data: {
        email: 'dev@chatops.local',
        password: await bcrypt.hash('password123', 10),
        name: 'Developer User',
        role: 'user'
      }
    });
    console.log('Seeded dev@chatops.local');
  }
}

app.listen(PORT, async () => {
  await seedDatabase();
  console.log(`ChatOps Backend running on http://localhost:${PORT}`);
  await startSlackBot();
});
