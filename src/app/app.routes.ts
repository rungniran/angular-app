import { Routes } from '@angular/router';
import { ReportComponent } from '../features/report/report.component';

export const routes: Routes = [
  {
    path: 'reports',
    component: ReportComponent
  },
  {
    path: '',
    redirectTo: 'reports',
    pathMatch: 'full'
  }
];