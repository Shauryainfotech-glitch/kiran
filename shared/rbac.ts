// Role-Based Access Control (RBAC) Configuration

export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager', 
  USER: 'user',
  FINANCE: 'finance',
  VENDOR: 'vendor'
} as const;

export const PERMISSIONS = {
  // Tender Management
  TENDER_CREATE: 'tender:create',
  TENDER_READ: 'tender:read',
  TENDER_UPDATE: 'tender:update',
  TENDER_DELETE: 'tender:delete',
  TENDER_PUBLISH: 'tender:publish',
  
  // Vendor Management
  VENDOR_CREATE: 'vendor:create',
  VENDOR_READ: 'vendor:read',
  VENDOR_UPDATE: 'vendor:update',
  VENDOR_DELETE: 'vendor:delete',
  VENDOR_APPROVE: 'vendor:approve',
  
  // Finance Management
  FINANCE_READ: 'finance:read',
  FINANCE_WRITE: 'finance:write',
  FINANCE_EMD: 'finance:emd',
  FINANCE_APPROVE: 'finance:approve',
  
  // Task Management
  TASK_CREATE: 'task:create',
  TASK_READ: 'task:read',
  TASK_UPDATE: 'task:update',
  TASK_DELETE: 'task:delete',
  TASK_ASSIGN: 'task:assign',
  
  // System Administration
  SYSTEM_CONFIG: 'system:config',
  USER_MANAGE: 'user:manage',
  ROLE_MANAGE: 'role:manage',
  
  // AI & Analytics
  AI_ACCESS: 'ai:access',
  ANALYTICS_READ: 'analytics:read',
  BLOCKCHAIN_VERIFY: 'blockchain:verify',
  
  // Reports
  REPORT_READ: 'report:read',
  REPORT_EXPORT: 'report:export'
} as const;

export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: [
    PERMISSIONS.TENDER_CREATE,
    PERMISSIONS.TENDER_READ,
    PERMISSIONS.TENDER_UPDATE,
    PERMISSIONS.TENDER_DELETE,
    PERMISSIONS.TENDER_PUBLISH,
    PERMISSIONS.VENDOR_CREATE,
    PERMISSIONS.VENDOR_READ,
    PERMISSIONS.VENDOR_UPDATE,
    PERMISSIONS.VENDOR_DELETE,
    PERMISSIONS.VENDOR_APPROVE,
    PERMISSIONS.FINANCE_READ,
    PERMISSIONS.FINANCE_WRITE,
    PERMISSIONS.FINANCE_EMD,
    PERMISSIONS.FINANCE_APPROVE,
    PERMISSIONS.TASK_CREATE,
    PERMISSIONS.TASK_READ,
    PERMISSIONS.TASK_UPDATE,
    PERMISSIONS.TASK_DELETE,
    PERMISSIONS.TASK_ASSIGN,
    PERMISSIONS.SYSTEM_CONFIG,
    PERMISSIONS.USER_MANAGE,
    PERMISSIONS.ROLE_MANAGE,
    PERMISSIONS.AI_ACCESS,
    PERMISSIONS.ANALYTICS_READ,
    PERMISSIONS.BLOCKCHAIN_VERIFY,
    PERMISSIONS.REPORT_READ,
    PERMISSIONS.REPORT_EXPORT
  ],
  
  [ROLES.MANAGER]: [
    PERMISSIONS.TENDER_CREATE,
    PERMISSIONS.TENDER_READ,
    PERMISSIONS.TENDER_UPDATE,
    PERMISSIONS.TENDER_PUBLISH,
    PERMISSIONS.VENDOR_READ,
    PERMISSIONS.VENDOR_UPDATE,
    PERMISSIONS.VENDOR_APPROVE,
    PERMISSIONS.FINANCE_READ,
    PERMISSIONS.TASK_CREATE,
    PERMISSIONS.TASK_READ,
    PERMISSIONS.TASK_UPDATE,
    PERMISSIONS.TASK_ASSIGN,
    PERMISSIONS.AI_ACCESS,
    PERMISSIONS.ANALYTICS_READ,
    PERMISSIONS.BLOCKCHAIN_VERIFY,
    PERMISSIONS.REPORT_READ,
    PERMISSIONS.REPORT_EXPORT
  ],
  
  [ROLES.USER]: [
    PERMISSIONS.TENDER_READ,
    PERMISSIONS.TENDER_UPDATE,
    PERMISSIONS.VENDOR_READ,
    PERMISSIONS.TASK_READ,
    PERMISSIONS.TASK_UPDATE,
    PERMISSIONS.AI_ACCESS,
    PERMISSIONS.REPORT_READ
  ],
  
  [ROLES.FINANCE]: [
    PERMISSIONS.TENDER_READ,
    PERMISSIONS.VENDOR_READ,
    PERMISSIONS.FINANCE_READ,
    PERMISSIONS.FINANCE_WRITE,
    PERMISSIONS.FINANCE_EMD,
    PERMISSIONS.FINANCE_APPROVE,
    PERMISSIONS.TASK_READ,
    PERMISSIONS.ANALYTICS_READ,
    PERMISSIONS.REPORT_READ,
    PERMISSIONS.REPORT_EXPORT
  ],
  
  [ROLES.VENDOR]: [
    PERMISSIONS.TENDER_READ,
    PERMISSIONS.VENDOR_READ,
    PERMISSIONS.TASK_READ,
    PERMISSIONS.REPORT_READ
  ]
};

export type Role = typeof ROLES[keyof typeof ROLES];
export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

export function hasPermission(userRole: Role, permission: Permission): boolean {
  const rolePermissions = ROLE_PERMISSIONS[userRole];
  return rolePermissions?.includes(permission) || false;
}

export function canAccess(userRole: Role, requiredPermissions: Permission[]): boolean {
  return requiredPermissions.every(permission => hasPermission(userRole, permission));
}

export function getRoleDisplayName(role: Role): string {
  const roleNames = {
    [ROLES.ADMIN]: 'System Administrator',
    [ROLES.MANAGER]: 'Project Manager',
    [ROLES.USER]: 'Team Member',
    [ROLES.FINANCE]: 'Finance Officer',
    [ROLES.VENDOR]: 'Vendor User'
  };
  return roleNames[role] || role;
}