import AuditLog from '../models/AuditLog.js';

export const logAudit = async ({ user, role, action, entity, entityId, details }) => {
  try {
    await AuditLog.create({
      user,
      role,
      action,
      entity,
      entityId,
      details
    });
  } catch (error) {
    console.error('Audit Log Error:', error);
  }
};
