import axios from 'axios';

export class JenkinsService {
  private get url(): string { return process.env.JENKINS_URL || ''; }
  private get user(): string { return process.env.JENKINS_USER || ''; }
  private get token(): string { return process.env.JENKINS_TOKEN || ''; }
  private get authHeader(): string {
    const credentials = Buffer.from(`${this.user}:${this.token}`).toString('base64');
    return `Basic ${credentials}`;
  }

  constructor() {
    // Environment variables are now read dynamically via getters to avoid hoisting issues
  }

  /**
   * Fetches the CSRF Crumb from Jenkins.
   */
  private async getCrumb(): Promise<{ field: string, value: string, cookies?: string[] } | null> {
    try {
      const response = await axios.get(`${this.url}/crumbIssuer/api/json`, {
        headers: {
          'Authorization': this.authHeader
        }
      });
      if (response.data && response.data.crumbRequestField && response.data.crumb) {
        return { 
          field: response.data.crumbRequestField, 
          value: response.data.crumb,
          cookies: response.headers['set-cookie'] as string[] | undefined
        };
      }
      return null;
    } catch (error: any) {
      // If 404, CSRF might be disabled or older Jenkins version
      if (error.response && error.response.status === 404) {
        return null;
      }
      console.warn("Failed to fetch Jenkins Crumb, continuing without it.", error.message);
      return null;
    }
  }

  /**
   * Triggers a build for the specified job name.
   */
  public async triggerBuild(jobName: string): Promise<string> {
    if (!this.url) {
      throw new Error("Jenkins URL is not configured.");
    }
    try {
      const crumb = await this.getCrumb();
      const headers: any = {
        'Authorization': this.authHeader
      };

      if (crumb) {
        headers[crumb.field] = crumb.value;
        if (crumb.cookies) {
          headers['Cookie'] = crumb.cookies.join('; ');
        }
      }

      const buildUrl = `${this.url}/job/${encodeURIComponent(jobName)}/build`;

      const response = await axios.post(buildUrl, {}, { headers });

      if (response.status === 201 || response.status === 200) {
        return `Successfully triggered build for job '${jobName}'. Check Jenkins UI for progress.`;
      } else {
        throw new Error(`Unexpected status code: ${response.status}`);
      }
    } catch (error: any) {
      if (error.response) {
        if (error.response.status === 404) {
          throw new Error(`Jenkins job '${jobName}' not found.`);
        } else if (error.response.status === 401 || error.response.status === 403) {
          throw new Error(`Authentication failed or forbidden to build '${jobName}'. Check your Jenkins token.`);
        }
      }
      throw new Error(`Failed to trigger Jenkins build: ${error.message}`);
    }
  }

  /**
   * Fetches the list of jobs from Jenkins.
   */
  public async getJobs(): Promise<any[]> {
    if (!this.url || !this.user || !this.token) {
      return []; // Return empty if not configured
    }

    try {
      const response = await axios.get(`${this.url}/api/json?tree=jobs[name,url,color]`, {
        headers: {
          'Authorization': this.authHeader
        }
      });

      if (response.data && response.data.jobs) {
        return response.data.jobs.map((job: any) => ({
          name: job.name,
          url: `${this.url}/job/${encodeURIComponent(job.name)}/`,
          // Convert Jenkins color code to a standardized status
          status: job.color === 'blue' ? 'success' :
            job.color === 'red' ? 'failed' :
              job.color?.includes('anime') ? 'building' : 'aborted'
        }));
      }
      return [];
    } catch (error) {
      console.error("Failed to fetch Jenkins jobs", error);
      return [];
    }
  }

  /**
   * Fetches the raw console text logs for the latest build of a specific job.
   */
  public async getLatestBuildLogs(jobName: string): Promise<string> {
    if (!this.url || !this.user || !this.token) {
      throw new Error("Jenkins credentials are not configured.");
    }
    try {
      const response = await axios.get(`${this.url}/job/${encodeURIComponent(jobName)}/lastBuild/consoleText`, {
        headers: {
          'Authorization': this.authHeader
        }
      });
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        throw new Error(`Logs not found for job '${jobName}'. It may not have been built yet.`);
      }
      throw new Error(`Failed to fetch logs for Jenkins job '${jobName}': ${error.message}`);
    }
  }
}

export const jenkinsService = new JenkinsService();
