import { Task, TaskStatus } from '../models/Task';

export class TaskRepository {
  create(data: { title: string; description?: string; status: TaskStatus; projectId: string }) {
    return Task.create(data as any);
  }
  findById(id: string) { return Task.findByPk(id); }
  findAllByProject(projectId: string) { return Task.findAll({ where: { projectId } }); }
  update(id: string, data: Partial<{ title: string; description?: string; status: TaskStatus }>) {
    return Task.update(data, { where: { id } });
  }
  remove(id: string) { return Task.destroy({ where: { id } }); }
}
