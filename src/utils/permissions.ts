export type Role = 'admin' | 'regular' | 'viewer';

export interface Permissions {
  canMoveModules: boolean;
  canEditModules: boolean;
  canCreateModules: boolean;
  canDeleteModules: boolean;
  canAssign: boolean;
  canEditPhases: boolean;
  canAddPhases: boolean;
  canEditDates: boolean;
  canEditDocuments: boolean;
  canAttachFiles: boolean;
  canEditNotes: boolean;
  canAccessSettings: boolean;
  canImportExport: boolean;
  canReset: boolean;
}

const ROLE_PERMISSIONS: Record<Role, Permissions> = {
  admin: {
    canMoveModules: true,
    canEditModules: true,
    canCreateModules: true,
    canDeleteModules: true,
    canAssign: true,
    canEditPhases: true,
    canAddPhases: true,
    canEditDates: true,
    canEditDocuments: true,
    canAttachFiles: true,
    canEditNotes: true,
    canAccessSettings: true,
    canImportExport: true,
    canReset: true,
  },
  regular: {
    canMoveModules: true,
    canEditModules: true,
    canCreateModules: false,
    canDeleteModules: false,
    canAssign: true,
    canEditPhases: false,
    canAddPhases: false,
    canEditDates: true,
    canEditDocuments: true,
    canAttachFiles: true,
    canEditNotes: true,
    canAccessSettings: false,
    canImportExport: false,
    canReset: false,
  },
  viewer: {
    canMoveModules: false,
    canEditModules: false,
    canCreateModules: false,
    canDeleteModules: false,
    canAssign: false,
    canEditPhases: false,
    canAddPhases: false,
    canEditDates: false,
    canEditDocuments: false,
    canAttachFiles: false,
    canEditNotes: false,
    canAccessSettings: false,
    canImportExport: false,
    canReset: false,
  },
};

const USER_ROLES: Record<string, Role> = {
  qusai: 'admin',
  christian: 'admin',
  justin: 'viewer',
};

export function getUserRole(username: string): Role {
  return USER_ROLES[username] || 'viewer';
}

export function getPermissions(username: string): Permissions {
  return ROLE_PERMISSIONS[getUserRole(username)];
}
