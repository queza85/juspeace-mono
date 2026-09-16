import type { AuthUser } from '@/lib/api/types';

export const adminUser: AuthUser = {
  id: 'admin-1',
  email: 'admin@juspeace.local',
  role: 'ADMIN',
  name: 'Admin',
  isActive: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

export const loginSuccessEnvelope = {
  success: true,
  message: 'LOGIN_SUCCESSFULLY',
  data: {
    accessToken: 'access-token',
    user: adminUser,
  },
} as const;
