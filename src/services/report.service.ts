import { api } from './api';
import { ReportData, ReportPeriod } from '@types';

export interface GenerateReportParams {
  period: ReportPeriod;
  startDate?: Date;
  endDate?: Date;
  employeeId?: string;
  companyId?: string;
}

export const reportService = {
  async generate(params: GenerateReportParams): Promise<ReportData> {
    const queryParams = new URLSearchParams();
    queryParams.append('period', params.period);
    if (params.startDate) {
      queryParams.append('startDate', params.startDate.toISOString());
    }
    if (params.endDate) {
      queryParams.append('endDate', params.endDate.toISOString());
    }
    if (params.employeeId) {
      queryParams.append('employeeId', params.employeeId);
    }
    if (params.companyId) {
      queryParams.append('companyId', params.companyId);
    }
    return api.get<ReportData>(`/reports?${queryParams.toString()}`);
  },
};


