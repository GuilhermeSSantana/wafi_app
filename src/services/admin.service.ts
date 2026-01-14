import { api } from './api';

export interface PermissionDefinition {
  module: string;
  actions: string[];
  description: string;
}

export interface FeatureFlag {
  key: string;
  enabled: boolean;
  description?: string | null;
}

export interface PermissionsResponse {
  availablePermissions: PermissionDefinition[];
  featureFlags: FeatureFlag[];
}

export interface UpdateFeatureFlagData {
  enabled: boolean;
  description?: string | null;
}

export interface AuditLog {
  id: string;
  actorUserId: string | null;
  action: string;
  targetType: string;
  targetId: string | null;
  metadata: any;
  createdAt: string;
  actor: {
    id: string;
    name: string;
    email: string;
  } | null;
}

export interface AuditLogsResponse {
  data: AuditLog[];
  total: number;
}

export interface GetAuditLogsParams {
  limit?: number;
  offset?: number;
  action?: string;
  targetType?: string;
  actorUserId?: string;
}

export const adminService = {
  async getPermissions(): Promise<PermissionsResponse> {
    return api.get<PermissionsResponse>('/admin/permissions');
  },

  async updateFeatureFlag(key: string, data: UpdateFeatureFlagData): Promise<void> {
    return api.patch<void>(`/admin/feature-flags/${key}`, data);
  },

  async getAuditLogs(params?: GetAuditLogsParams): Promise<AuditLogsResponse> {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    if (params?.action) queryParams.append('action', params.action);
    if (params?.targetType) queryParams.append('targetType', params.targetType);
    if (params?.actorUserId) queryParams.append('actorUserId', params.actorUserId);
    
    const queryString = queryParams.toString();
    const url = queryString ? `/admin/audit-logs?${queryString}` : '/admin/audit-logs';
    return api.get<AuditLogsResponse>(url);
  },
};

