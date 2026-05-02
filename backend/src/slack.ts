import { App } from '@slack/bolt';
import { jenkinsService } from './services/JenkinsService';
import { dockerService } from './services/DockerService';

// Ensure the App is only initialized if tokens are present
export let slackApp: App | null = null;

if (process.env.SLACK_BOT_TOKEN && process.env.SLACK_APP_TOKEN) {
  slackApp = new App({
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    appToken: process.env.SLACK_APP_TOKEN,
    socketMode: true,
  });

  // Help command
  slackApp.message(/help/i, async ({ message, say }) => {
    await say(`Hi there! :wave: I am your ChatOps Assistant. Here's what I can do:
• \`status\` - View server status metrics
• \`build <job-name>\` - Trigger a Jenkins build
• \`docker ps\` - List running Docker containers
• \`docker restart <id>\` - Restart a Docker container`);
  });

  // Status command
  slackApp.message(/^status/i, async ({ message, say }) => {
    await say(`*Server:* Online :large_green_circle:\n*CPU:* 32%\n*RAM:* 58%\n*Containers:* 6 Running`);
  });

  // Build command
  slackApp.message(/^build (.+)/i, async ({ message, context, say }) => {
    const jobName = context.matches[1].trim();
    await say(`Triggering Jenkins build for job: *${jobName}*...`);
    try {
      const result = await jenkinsService.triggerBuild(jobName);
      await say(`:white_check_mark: ${result}`);
    } catch (error: any) {
      await say(`:x: [ERROR] ${error.message}`);
    }
  });

  // Docker PS command
  slackApp.message(/^docker ps/i, async ({ message, say }) => {
    try {
      const containers = await dockerService.listContainers();
      if (containers.length === 0) {
        await say(`No containers running.`);
      } else {
        let output = "```CONTAINER ID   IMAGE          STATUS\n";
        output += containers.map(c => `${c.id.padEnd(14)} ${c.image.substring(0, 14).padEnd(14)} ${c.status}`).join('\n');
        output += "```";
        await say(output);
      }
    } catch (error: any) {
      await say(`:x: [ERROR] Failed to list Docker containers: ${error.message}`);
    }
  });

  // Docker Restart command
  slackApp.message(/^docker restart (.+)/i, async ({ message, context, say }) => {
    const containerId = context.matches[1].trim();
    await say(`Restarting container *${containerId}*...`);
    try {
      const result = await dockerService.restartContainer(containerId);
      await say(`:white_check_mark: ${result}`);
    } catch (error: any) {
      await say(`:x: [ERROR] ${error.message}`);
    }
  });
}

export const startSlackBot = async () => {
  if (slackApp) {
    try {
      await slackApp.start();
      console.log('⚡️ Slack Bolt app is running in Socket Mode!');
    } catch (error) {
      console.error('Failed to start Slack Bot:', error);
    }
  } else {
    console.log('Slack credentials not fully provided. Slack Bot disabled.');
  }
};
