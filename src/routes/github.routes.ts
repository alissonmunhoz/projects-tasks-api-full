import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth';
import { fetchAndLinkGithubRepos } from '../controllers/github.controller';

export const githubRouter = Router();
githubRouter.use(authMiddleware);
githubRouter.get('/projects/:id/github/:username', fetchAndLinkGithubRepos);
