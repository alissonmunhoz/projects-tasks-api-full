import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { GithubService } from '../services/github.service';

const service = new GithubService();

export const fetchAndLinkGithubRepos = async (req: AuthRequest, res: Response) => {
  try {
    const { id, username } = req.params;
    const repos = await service.fetchAndLink(req.user!.id, id, username);
  
    res.json({ projectId: id, repos });
  } catch (e: any) {
    if (e.message === 'NOT_FOUND') return res.status(404).json({ message: 'Project not found' });
    if (e.message === 'FORBIDDEN') return res.status(403).json({ message: 'You do not own this project' });
    res.status(500).json({ message: 'Internal error' });
  }
};
