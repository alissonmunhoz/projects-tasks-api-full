import { Project } from '../models/Project';

export class ProjectRepository {
  create(data: { name: string; description?: string; userId: string }) { return Project.create(data as any); }
  findById(id: string) { return Project.findByPk(id); }
  findAllByUser(userId: string) { return Project.findAll({ where: { userId } }); }
  update(id: string, data: Partial<Pick<Project, 'name' | 'description'>>) { return Project.update(data, { where: { id } }); }
  remove(id: string) { return Project.destroy({ where: { id } }); }
}
