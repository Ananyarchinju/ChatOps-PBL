import axios from 'axios';

export class JenkinsService {
  private url: string;
  private user: string;
  private token: string;
  private authHeader: string;

  constructor() {
    this.url = process.env.JENKINS_URL || '';
    this.user = process.env.JENKINS_USER || '';
    this.token = process.env.JENKINS_TOKEN || '';
    
    const credentials = Buffer.from(`${this.user}:${this.token}`).toString('base64');
    this.authHeader = `Basic ${credentials}`;
  }

  /**
   * Fetches the CSRF Crumb from Jenkins.
   */
  private async getCrumb(): Promise<{ field: string, value: string } | null> {
    try {
      const response = await axios.get(`${this.url}/crumbIssuer/api/json`, {
        headers: {
          'Authorization': this.authHeader
        }
      });
      if (response.data && response.data.crumbRequestField && response.data.crumb) {
        return { field: response.data.crumbRequestField, value: response.data.crumb };
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
    if (!this.url || !this.user || !this.token) {
      throw new Error("Jenkins credentials are not fully configured in the environment.");
    }

    try {
      const crumb = await this.getCrumb();
      const headers: any = {
        'Authorization': this.authHeader
      };
      
      if (crumb) {
        headers[crumb.field] = crumb.value;
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
          url: job.url,
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
}

export const jenkinsService = new JenkinsService();
