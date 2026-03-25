// features/report/report.model.ts

export interface Report {
  id: string;
  title: string;
  status: 'pending' | 'approved' | 'rejected';
  reason?: string;
  created_at: string;
  updated_at: string;
}