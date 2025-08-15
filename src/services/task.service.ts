import { TaskRepository } from '../repositories/task.repository';
import { ProjectService } from './project.service';
import { TaskStatus } from '../models/Task';

export class TaskService {
  constructor(
    private tasks = new TaskRepository(),
    private projects = new ProjectService(),
  ) {}

  async create(userId: string, projectId: string, title: string, description?: string) {
    if (!title) throw new Error('TITLE_REQUIRED');
    await this.projects.getOwned(projectId, userId);
    return this.tasks.create({ title, description, status: 'todo', projectId });
  }

  async listByProject(userId: string, projectId: string) {
    await this.projects.getOwned(projectId, userId);
    return this.tasks.findAllByProject(projectId);
  }

  async update(userId: string, taskId: string, data: Partial<{ title: string; description?: string; status: TaskStatus }>) {
    const task = await this.tasks.findById(taskId);
    if (!task) throw new Error('NOT_FOUND');
    await this.projects.getOwned(task.projectId, userId);
    await this.tasks.update(taskId, data);
    return this.tasks.findById(taskId);
  }

  async remove(userId: string, taskId: string) {
    const task = await this.tasks.findById(taskId);
    if (!task) throw new Error('NOT_FOUND');
    await this.projects.getOwned(task.projectId, userId);
    await this.tasks.remove(taskId);
  }
}
