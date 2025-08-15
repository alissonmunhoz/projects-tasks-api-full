import { ProjectRepository } from '../repositories/project.repository';

export class ProjectService {
  constructor(private projects = new ProjectRepository()) {}

  create(userId: string, name: string, description?: string) {
    if (!name) throw new Error('NAME_REQUIRED');
    return this.projects.create({ name, description, userId });
  }

  listByUser(userId: string) {
    return this.projects.findAllByUser(userId);
  }

  async getOwned(projectId: string, userId: string) {
    const project = await this.projects.findById(projectId);
    if (!project) throw new Error('NOT_FOUND');
    if (project.userId !== userId) throw new Error('FORBIDDEN');
    return project;
  }
}
