import dotenv from 'dotenv';
dotenv.config();

import axios from 'axios';

async function testJenkins() {
  const url = process.env.JENKINS_URL || '';
  const user = process.env.JENKINS_USER || '';
  const token = process.env.JENKINS_TOKEN || '';
  const credentials = Buffer.from(`${user}:${token}`).toString('base64');
  const authHeader = `Basic ${credentials}`;

  console.log("JENKINS_URL:", url);
  console.log("JENKINS_USER:", user);
  
  try {
    const response = await axios.get(`${url}/api/json?tree=jobs[name,url,color]`, {
      headers: {
        'Authorization': authHeader
      }
    });

    console.log("Status:", response.status);
    console.log("Data:", response.data);
  } catch (error: any) {
    console.log("Error:", error.message);
    if (error.response) {
      console.log("Error status:", error.response.status);
      console.log("Error data:", error.response.data);
    }
  }
}

testJenkins();
