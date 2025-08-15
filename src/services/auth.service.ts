import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/user.repository';

export class AuthService {
  constructor(private users = new UserRepository()) {}

  async register(name: string, email: string, password: string) {
    if (!name || !email || !password) throw new Error('MISSING_FIELDS');
    const exists = await this.users.findByEmail(email);
    if (exists) throw new Error('USER_EXISTS');
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await this.users.create({ name, email, passwordHash });
    return { id: user.id, name: user.name, email: user.email };
  }

  async login(email: string, password: string) {
    if (!email || !password) throw new Error('MISSING_FIELDS');
    const user = await this.users.findByEmail(email);
    if (!user) throw new Error('INVALID_CREDENTIALS');
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new Error('INVALID_CREDENTIALS');
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET as string, {
      expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    });
    return { token };
  }
}
