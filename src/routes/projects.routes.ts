import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth';
import { createProject, listMyProjects } from '../controllers/project.controller';

export const projectsRouter = Router();
projectsRouter.use(authMiddleware);
projectsRouter.post('/projects', createProject);
projectsRouter.get('/projects', listMyProjects);
