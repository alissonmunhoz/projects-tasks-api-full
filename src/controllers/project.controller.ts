import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { ProjectService } from '../services/project.service';

const service = new ProjectService();

export const createProject = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description } = req.body;
    const project = await service.create(req.user!.id, name, description);
    res.status(201).json(project);
  } catch (e: any) {
    if (e.message === 'NAME_REQUIRED') return res.status(400).json({ message: 'name is required' });
    res.status(500).json({ message: 'Internal error' });
  }
};

export const listMyProjects = async (req: AuthRequest, res: Response) => {
  const projects = await service.listByUser(req.user!.id);
  res.json(projects);
};
