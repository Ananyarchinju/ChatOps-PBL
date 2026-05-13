import { App } from '@slack/bolt';
import { jenkinsService } from './services/JenkinsService';
import { dockerService } from './services/DockerService';
import { prisma } from './db';

// Ensure the App is only initialized if tokens are present
export let slackApp: App | null = null;

const logSlackCommand = async (slackUserId: string | undefined, command: string, status: string, output: string) => {
  try {
    const slackUser = await prisma.user.findUnique({ where: { email: 'slack@chatops.local' } });
    if (slackUser) {
      await prisma.commandHistory.create({
        data: {
          command: `[Slack:${slackUserId || 'unknown'}] ${command}`,
          status,
          output,
          userId: slackUser.id
        }
      });
    }
  } catch (error) {
    console.error('Failed to log Slack command:', error);
  }
};

if (process.env.SLACK_BOT_TOKEN && process.env.SLACK_APP_TOKEN) {
  slackApp = new App({
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    appToken: process.env.SLACK_APP_TOKEN,
    socketMode: true,
  });

  // Help command
  slackApp.message(/help/i, async ({ message, say }) => {
    const text = `Hi there! :wave: I am your ChatOps Assistant. Here's what I can do:
• \`status\` - View server status metrics
• \`build <job-name>\` - Trigger a Jenkins build
• \`docker ps\` - List running Docker containers
• \`docker restart <id>\` - Restart a Docker container`;
    await say(text);
    if ('user' in message) await logSlackCommand(message.user, 'help', 'success', text);
  });

  // Status command
  slackApp.message(/^status/i, async ({ message, say }) => {
    const blocks = [
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": "*System Status Report* :bar_chart:"
        }
      },
      {
        "type": "divider"
      },
      {
        "type": "section",
        "fields": [
          { "type": "mrkdwn", "text": "*Server:*\n:large_green_circle: Online" },
          { "type": "mrkdwn", "text": "*Version:*\n1.0.0" },
          { "type": "mrkdwn", "text": "*CPU Usage:*\n32%" },
          { "type": "mrkdwn", "text": "*Memory Usage:*\n58%" }
        ]
      }
    ];
    await say({ blocks });
    if ('user' in message) await logSlackCommand(message.user, 'status', 'success', 'Status blocks sent');
  });

  // Build command
  slackApp.message(/^build (.+)/i, async ({ message, context, say }) => {
    const jobName = context.matches[1].trim();
    await say(`:hourglass_flowing_sand: Triggering Jenkins build for job: *${jobName}*...`);
    try {
      const result = await jenkinsService.triggerBuild(jobName);
      await say(`:white_check_mark: ${result}`);
      if ('user' in message) await logSlackCommand(message.user, `build ${jobName}`, 'success', result);
    } catch (error: any) {
      await say(`:x: [ERROR] ${error.message}`);
      if ('user' in message) await logSlackCommand(message.user, `build ${jobName}`, 'failed', error.message);
    }
  });

  // Docker PS command
  slackApp.message(/^docker ps/i, async ({ message, say }) => {
    try {
      const containers = await dockerService.listContainers();
      if (containers.length === 0) {
        await say(`No containers running.`);
        if ('user' in message) await logSlackCommand(message.user, 'docker ps', 'success', 'No containers');
      } else {
        const blocks: any[] = [
          {
            "type": "section",
            "text": { "type": "mrkdwn", "text": "*Docker Container Inventory* :docker:" }
          },
          { "type": "divider" }
        ];

        containers.forEach(c => {
          blocks.push({
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": `*${c.name}* (${c.id})\nImage: \`${c.image}\`\nStatus: _${c.status}_`
            },
            "accessory": {
              "type": "button",
              "text": { "type": "plain_text", "text": "Restart", "emoji": true },
              "value": c.id,
              "action_id": "restart_container"
            }
          });
        });

        await say({ blocks });
        if ('user' in message) await logSlackCommand(message.user, 'docker ps', 'success', `${containers.length} containers found`);
      }
    } catch (error: any) {
      await say(`:x: [ERROR] Failed to list Docker containers: ${error.message}`);
      if ('user' in message) await logSlackCommand(message.user, 'docker ps', 'failed', error.message);
    }
  });

  // Handle Button Actions
  slackApp.action('restart_container', async ({ body, action, ack, respond }) => {
    await ack();
    const containerId = (action as any).value;
    await respond(`:arrows_counterclockwise: Restarting container *${containerId}* via interactive button...`);
    try {
      const result = await dockerService.restartContainer(containerId);
      await respond(`:white_check_mark: ${result}`);
      await logSlackCommand(body.user.id, `button:restart ${containerId}`, 'success', result);
    } catch (error: any) {
      await respond(`:x: [ERROR] ${error.message}`);
      await logSlackCommand(body.user.id, `button:restart ${containerId}`, 'failed', error.message);
    }
  });

  // Docker Restart command (text version)
  slackApp.message(/^docker restart (.+)/i, async ({ message, context, say }) => {
    const containerId = context.matches[1].trim();
    await say(`:arrows_counterclockwise: Restarting container *${containerId}*...`);
    try {
      const result = await dockerService.restartContainer(containerId);
      await say(`:white_check_mark: ${result}`);
      if ('user' in message) await logSlackCommand(message.user, `docker restart ${containerId}`, 'success', result);
    } catch (error: any) {
      await say(`:x: [ERROR] ${error.message}`);
      if ('user' in message) await logSlackCommand(message.user, `docker restart ${containerId}`, 'failed', error.message);
    }
  });

  // Catch-all handler for any other messages
  slackApp.message(async ({ message, say }) => {
    // Only respond if it's a message with text that hasn't been handled yet
    if ('text' in message && message.text) {
      const text = message.text.toLowerCase();
      // Skip if it was already handled by specific regex (bolt usually handles this, but being safe)
      const handledCommands = ['help', 'status', 'build', 'docker'];
      if (!handledCommands.some(cmd => text.includes(cmd))) {
        await say(`I didn't quite catch that. Try typing \`help\` to see what I can do! :robot_face:`);
      }
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
