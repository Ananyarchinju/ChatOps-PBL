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
}

export const dockerService = new DockerService();
