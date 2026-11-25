import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService } from '../src/services/auth.service';
import { AppError } from '../src/utils/errors';

// Mock the user repository
vi.mock('../src/repositories/user.repository', () => ({
  userRepository: {
    findByEmail: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
  },
}));

import { userRepository } from '../src/repositories/user.repository';

const mockUserRepository = userRepository as {
  findByEmail: ReturnType<typeof vi.fn>;
  findById: ReturnType<typeof vi.fn>;
  create: ReturnType<typeof vi.fn>;
};

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('register', () => {
    it('should throw 409 when email is already registered', async () => {
      mockUserRepository.findByEmail.mockResolvedValue({
        _id: '123',
        name: 'Existing',
        email: 'test@example.com',
        passwordHash: 'hash',
        role: 'user',
        createdAt: new Date(),
      });

      await expect(
        authService.register({ name: 'Test', email: 'test@example.com', password: 'password123' })
      ).rejects.toThrow(AppError);

      await expect(
        authService.register({ name: 'Test', email: 'test@example.com', password: 'password123' })
      ).rejects.toMatchObject({ statusCode: 409, message: 'Email already registered' });
    });
  });

  describe('login', () => {
    it('should throw 401 when password is wrong', async () => {
      mockUserRepository.findByEmail.mockResolvedValue({
        _id: '123',
        name: 'Test',
        email: 'test@example.com',
        // bcrypt hash of "correctpassword"
        passwordHash: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
        role: 'user',
        createdAt: new Date(),
      });

      await expect(
        authService.login({ email: 'test@example.com', password: 'wrongpassword' })
      ).rejects.toMatchObject({ statusCode: 401, message: 'Invalid email or password' });
    });

    it('should return user and token on successful login', async () => {
      // We'll store a known hash for "mypassword"
      const bcrypt = await import('bcryptjs');
      const hash = await bcrypt.hash('mypassword', 10);

      mockUserRepository.findByEmail.mockResolvedValue({
        _id: 'user-id-1',
        name: 'Alice',
        email: 'alice@example.com',
        passwordHash: hash,
        role: 'user',
        createdAt: new Date(),
      });

      const result = await authService.login({ email: 'alice@example.com', password: 'mypassword' });

      expect(result).toHaveProperty('token');
      expect(result.user).toMatchObject({ email: 'alice@example.com', name: 'Alice' });
      expect(result.user).not.toHaveProperty('passwordHash');
    });
  });
});
