// features/report/report.service.ts

import { Injectable } from '@angular/core';
import { ApiService } from 'src/app/core/services/api.service';
import { Report } from './report.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  constructor(private api: ApiService) {}

  getAll(): Observable<Report[]> {
    return this.api.get<Report[]>('/reports');
  }

  create(title: string) {
    return this.api.post('/reports', { title });
  }

  approve(ids: string[], reason: string) {
    // สังเกตว่าโครงสร้าง { ids, reason } ตรงกับ --data ใน curl เป๊ะๆ
    return this.api.post('/reports/approve', { ids, reason });
}
  reject(ids: number[], reason: string) {
    return this.api.post('/reports/reject', { ids, reason });
  }
}