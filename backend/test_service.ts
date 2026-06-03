import dotenv from 'dotenv';
dotenv.config();

import { jenkinsService } from './src/services/JenkinsService';

async function test() {
  console.log("JENKINS_URL from env:", process.env.JENKINS_URL);
  
  // Try to call getJobs just like the route does
  const jobs = await jenkinsService.getJobs();
  console.log("Returned jobs count:", jobs.length);
  console.log("Jobs data:", jobs);
}

test();
