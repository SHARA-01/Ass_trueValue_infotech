import { User } from '../models/User';
import { IUser } from '../types';

function toPlain(doc: unknown): IUser {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const obj = (doc as any).toObject ? (doc as any).toObject() : doc;
  return {
    _id: obj._id.toString(),
    name: obj.name,
    email: obj.email,
    passwordHash: obj.passwordHash,
    role: obj.role,
    createdAt: obj.createdAt,
  };
}

export const userRepository = {
  async findByEmail(email: string): Promise<IUser | null> {
    const doc = await User.findOne({ email: email.toLowerCase() });
    return doc ? toPlain(doc) : null;
  },

  async findById(id: string): Promise<IUser | null> {
    const doc = await User.findById(id);
    return doc ? toPlain(doc) : null;
  },

  async create(data: { name: string; email: string; passwordHash: string; role?: 'user' | 'admin' }): Promise<IUser> {
    const doc = await User.create(data);
    return toPlain(doc);
  },
};
