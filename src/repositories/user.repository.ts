import { User } from '../models/User';

export class UserRepository {
  findByEmail(email: string) { return User.findOne({ where: { email } }); }
  create(data: { name: string; email: string; passwordHash: string }) { return User.create(data as any); }
  findById(id: string) { return User.findByPk(id); }
}
