import { Request, Response, NextFunction } from 'express';

export type Role = 'doctor' | 'receptionist' | 'admin';

export type Permission =
    | 'VIEW_DASHBOARD_STATS'
    | 'MANAGE_USERS'
    | 'VIEW_PATIENTS'
    | 'EDIT_PATIENTS'
    | 'VIEW_MEDICAL_RECORDS' // Consultations, medical history
    | 'EDIT_MEDICAL_RECORDS'
    | 'VIEW_PRESCRIPTIONS'
    | 'CREATE_PRESCRIPTIONS'
    | 'VIEW_EXPENSES'
    | 'MANAGE_EXPENSES'
    | 'MANAGE_SETTINGS';

export const RolePermissions: Record<Role, Permission[]> = {
    admin: [
        'VIEW_DASHBOARD_STATS', 'MANAGE_USERS', 'VIEW_PATIENTS', 'EDIT_PATIENTS',
        'VIEW_MEDICAL_RECORDS', 'EDIT_MEDICAL_RECORDS', 'VIEW_PRESCRIPTIONS',
        'CREATE_PRESCRIPTIONS', 'VIEW_EXPENSES', 'MANAGE_EXPENSES', 'MANAGE_SETTINGS'
    ],
    doctor: [
        'VIEW_DASHBOARD_STATS', 'VIEW_PATIENTS', 'EDIT_PATIENTS',
        'VIEW_MEDICAL_RECORDS', 'EDIT_MEDICAL_RECORDS', 'VIEW_PRESCRIPTIONS',
        'CREATE_PRESCRIPTIONS', 'VIEW_EXPENSES', 'MANAGE_EXPENSES', 'MANAGE_SETTINGS'
    ],
    receptionist: [
        'VIEW_PATIENTS', 'EDIT_PATIENTS'
    ]
};

export const hasPermission = (role: Role, permission: Permission): boolean => {
    return RolePermissions[role]?.includes(permission) || false;
};

export const authorize = (required: Permission | Permission[] | Role | Role[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Authentication required' });
        }

        const userRole = req.user.role as Role;
        const requirements = Array.isArray(required) ? required : [required];

        // Check if any requirement is met (OR logic)
        const isAuthorized = requirements.some(reqItem => {
            // Check if it's a direct role match
            if (reqItem === userRole) return true;

            // Check if it's a permission the role has
            return hasPermission(userRole, reqItem as Permission);
        });

        if (!isAuthorized) {
            return res.status(403).json({ success: false, message: 'Forbidden: Insufficient permissions' });
        }

        next();
    };
};
