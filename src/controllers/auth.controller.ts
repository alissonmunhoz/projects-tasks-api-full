import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';

const service = new AuthService();

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    const user = await service.register(name, email, password);
    res.status(201).json(user);
  } catch (e: any) {
    if (e.message === 'MISSING_FIELDS') return res.status(400).json({ message: 'name, email, password are required' });
    if (e.message === 'USER_EXISTS') return res.status(409).json({ message: 'User already exists' });
    res.status(500).json({ message: 'Internal error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const resp = await service.login(email, password);
    res.json(resp);
  } catch (e: any) {
    if (e.message === 'MISSING_FIELDS' || e.message === 'INVALID_CREDENTIALS')
      return res.status(401).json({ message: 'Invalid credentials' });
    res.status(500).json({ message: 'Internal error' });
  }
};
