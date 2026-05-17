import Docker from 'dockerode';

export class DockerService {
  private docker: Docker;

  constructor() {
    // Connects to the local Docker socket on Windows (//./pipe/docker_engine) automatically
    this.docker = new Docker();
  }

  public async listContainers() {
    try {
      const containers = await this.docker.listContainers({ all: true });
      return containers.map(c => ({
        id: c.Id.substring(0, 12),
        name: c.Names[0].replace(/^\//, ''),
        image: c.Image,
        state: c.State,
        status: c.Status,
      }));
    } catch (error: any) {
      throw new Error(`Failed to list containers: ${error.message}`);
    }
  }

  public async ping() {
    try {
      await this.docker.ping();
      return true;
    } catch (error) {
      return false;
    }
  }

  public async startContainer(id: string) {
    try {
      const container = this.docker.getContainer(id);
      await container.start();
      return `Container ${id} started successfully.`;
    } catch (error: any) {
      throw new Error(`Failed to start container ${id}: ${error.message}`);
    }
  }

  public async stopContainer(id: string) {
    try {
      const container = this.docker.getContainer(id);
      await container.stop();
      return `Container ${id} stopped successfully.`;
    } catch (error: any) {
      throw new Error(`Failed to stop container ${id}: ${error.message}`);
    }
  }

  public async restartContainer(id: string) {
    try {
      const container = this.docker.getContainer(id);
      await container.restart();
      return `Container ${id} restarted successfully.`;
    } catch (error: any) {
      throw new Error(`Failed to restart container ${id}: ${error.message}`);
    }
  }

  public async pullImage(imageName: string): Promise<string> {
    try {
      return new Promise((resolve, reject) => {
        this.docker.pull(imageName, (err: any, stream: any) => {
          if (err) return reject(err);
          this.docker.modem.followProgress(stream, onFinished, onProgress);
          function onFinished(err: any, output: any) {
            if (err) return reject(err);
            resolve(`Image ${imageName} pulled successfully.`);
          }
          function onProgress(event: any) {
            // we could emit this to a websocket, but for now we just wait
          }
        });
      });
    } catch (error: any) {
      throw new Error(`Failed to pull image ${imageName}: ${error.message}`);
    }
  }

  public async getContainerLogs(id: string): Promise<string> {
    try {
      const container = this.docker.getContainer(id);
      const logs = await container.logs({
        stdout: true,
        stderr: true,
        tail: 50,
        timestamps: false
      });
      return logs.toString('utf8');
    } catch (error: any) {
      throw new Error(`Failed to fetch logs for container ${id}: ${error.message}`);
    }
  }
}

export const dockerService = new DockerService();
