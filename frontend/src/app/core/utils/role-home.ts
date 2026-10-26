import { Role } from '../models/user.model';

const HOME_BY_ROLE: Record<Role, string> = {
  ADMIN: '/admin',
  OWNER: '/owner',
  USER: '/',
};

export function homeForRole(role: Role): string {
  return HOME_BY_ROLE[role];
}