import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: { id: string; email: string };
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: 'Missing Authorization header' });

  const [type, token] = header.split(' ');
  if (type !== 'Bearer' || !token) return res.status(401).json({ message: 'Invalid Authorization format' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string; email: string };
    req.user = { id: payload.id, email: payload.email };
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
}
