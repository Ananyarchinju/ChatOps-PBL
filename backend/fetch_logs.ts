import dotenv from 'dotenv';
dotenv.config();

import axios from 'axios';

async function fetchLogs() {
  const url = process.env.JENKINS_URL || '';
  const user = process.env.JENKINS_USER || '';
  const token = process.env.JENKINS_TOKEN || '';
  const credentials = Buffer.from(`${user}:${token}`).toString('base64');
  const authHeader = `Basic ${credentials}`;

  try {
    const chatOpsLog = await axios.get(`${url}/job/ChatOps/lastBuild/consoleText`, {
      headers: { 'Authorization': authHeader }
    });
    console.log("=== ChatOps Logs ===");
    console.log(chatOpsLog.data);
  } catch (e: any) {
    console.log("Error fetching ChatOps log", e.message);
  }

  try {
    const foodDeliveryLog = await axios.get(`${url}/job/food-delivery-app/lastBuild/consoleText`, {
      headers: { 'Authorization': authHeader }
    });
    console.log("=== food-delivery-app Logs ===");
    console.log(foodDeliveryLog.data);
  } catch (e: any) {
    console.log("Error fetching food-delivery-app log", e.message);
  }
}

fetchLogs();
