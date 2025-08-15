import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth';
import { createTask, listTasksByProject, updateTask, deleteTask } from '../controllers/task.controller';

export const tasksRouter = Router();
tasksRouter.use(authMiddleware);

tasksRouter.post('/projects/:projectId/tasks', createTask);
tasksRouter.get('/projects/:projectId/tasks', listTasksByProject);
tasksRouter.put('/tasks/:id', updateTask);
tasksRouter.delete('/tasks/:id', deleteTask);
