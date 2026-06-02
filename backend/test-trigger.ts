import * as dotenv from 'dotenv';
dotenv.config();
import { jenkinsService } from './src/services/JenkinsService';
jenkinsService.triggerBuild('ChatOps').then(console.log).catch(console.error);
