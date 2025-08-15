import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { TaskService } from '../services/task.service';

const service = new TaskService();

export const createTask = async (req: AuthRequest, res: Response) => {
  try {
    const { projectId } = req.params;
    const { title, description } = req.body;
    const task = await service.create(req.user!.id, projectId, title, description);
    res.status(201).json(task);
  } catch (e: any) {
    if (e.message === 'TITLE_REQUIRED') return res.status(400).json({ message: 'title is required' });
    if (e.message === 'NOT_FOUND') return res.status(404).json({ message: 'Project not found' });
    if (e.message === 'FORBIDDEN') return res.status(403).json({ message: 'You do not own this project' });
    res.status(500).json({ message: 'Internal error' });
  }
};

export const listTasksByProject = async (req: AuthRequest, res: Response) => {
  try {
    const { projectId } = req.params;
    const tasks = await service.listByProject(req.user!.id, projectId);
    res.json(tasks);
  } catch (e: any) {
    if (e.message === 'NOT_FOUND') return res.status(404).json({ message: 'Project not found' });
    if (e.message === 'FORBIDDEN') return res.status(403).json({ message: 'You do not own this project' });
    res.status(500).json({ message: 'Internal error' });
  }
};

export const updateTask = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const task = await service.update(req.user!.id, id, req.body);
    res.json(task);
  } catch (e: any) {
    if (e.message === 'NOT_FOUND') return res.status(404).json({ message: 'Task not found' });
    if (e.message === 'FORBIDDEN') return res.status(403).json({ message: 'You do not own this project' });
    res.status(500).json({ message: 'Internal error' });
  }
};

export const deleteTask = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await service.remove(req.user!.id, id);
    res.status(204).send();
  } catch (e: any) {
    if (e.message === 'NOT_FOUND') return res.status(404).json({ message: 'Task not found' });
    if (e.message === 'FORBIDDEN') return res.status(403).json({ message: 'You do not own this project' });
    res.status(500).json({ message: 'Internal error' });
  }
};
