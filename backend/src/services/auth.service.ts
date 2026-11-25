import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { userRepository } from '../repositories/user.repository';
import { AppError } from '../utils/errors';
import { IUser } from '../types';

const SALT_ROUNDS = 10;

function getJwtSecret(): string {
  return process.env.JWT_SECRET || 'dev_secret';
}

function signToken(user: IUser): string {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    getJwtSecret(),
    { expiresIn: '7d' }
  );
}

export const authService = {
  async register(data: {
    name: string;
    email: string;
    password: string;
    role?: 'user' | 'admin';
  }): Promise<{ user: Omit<IUser, 'passwordHash'>; token: string }> {
    const existing = await userRepository.findByEmail(data.email);
    if (existing) {
      throw new AppError('Email already registered', 409);
    }

    const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);
    const user = await userRepository.create({
      name: data.name,
      email: data.email,
      passwordHash,
      role: data.role,
    });

    const token = signToken(user);
    const { passwordHash: _ph, ...safeUser } = user;
    return { user: safeUser, token };
  },

  async login(data: {
    email: string;
    password: string;
  }): Promise<{ user: Omit<IUser, 'passwordHash'>; token: string }> {
    const user = await userRepository.findByEmail(data.email);
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    const valid = await bcrypt.compare(data.password, user.passwordHash);
    if (!valid) {
      throw new AppError('Invalid email or password', 401);
    }

    const token = signToken(user);
    const { passwordHash: _ph, ...safeUser } = user;
    return { user: safeUser, token };
  },

  async getMe(userId: string): Promise<Omit<IUser, 'passwordHash'>> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    const { passwordHash: _ph, ...safeUser } = user;
    return safeUser;
  },
};
