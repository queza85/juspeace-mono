export class AdminAccessDeniedError extends Error {
  constructor() {
    super('ADMIN_ACCESS_DENIED');
    this.name = 'AdminAccessDeniedError';
  }
}

export function isAdminUser(role: string): boolean {
  return role === 'ADMIN';
}
