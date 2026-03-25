import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject, switchMap, map, tap } from 'rxjs';
import { ReportService } from './report.service';
import { Report } from './report.model';

@Component({
    selector: 'app-report',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './report.component.html',
    styleUrls: ['./report.component.css']
})
export class ReportComponent {
    isModalOpen = false;
    modalType: 'approve' | 'reject' = 'approve';
    actionReason = '';
    isAll = false;

    // สำหรับแปลงค่าจาก Model (Eng) เป็น UI (Thai)
    statusLabel: { [key: string]: string } = {
        'pending': 'รออนุมัติ',
        'approved': 'อนุมัติ',
        'rejected': 'ไม่อนุมัติ'
    };

    private refresh$ = new BehaviorSubject<void>(undefined);

    reports$ = this.refresh$.pipe(
        switchMap(() => this.reportService.getAll()),
        // 1. แตกเอาเฉพาะ array ใน key 'data' ออกมา
        map((res: any) => res.data),
        // 2. เติม selected: false เข้าไปในแต่ละรายการ
        map((reports: any[]) => reports.map(r => ({ ...r, selected: false }))),
        tap(() => this.isAll = false)
    );
    constructor(private reportService: ReportService) { }

    private refresh() {
        this.refresh$.next();
    }

    // --- UI Logic ---

    toggleAll(event: any, currentReports: any[]) {
        const isChecked = event.target.checked;
        this.isAll = true;
        currentReports.forEach(r => {
            // เลือกได้เฉพาะรายการที่ยังไม่ได้ทำรายการ (pending)
            r.selected = isChecked;
        });
    }

    toggleNotAll(currentReports: any[]) {
        // ถ้าทุกอันถูกเช็ค isAll จะเป็น true, ถ้ามีอันใดอันหนึ่งไม่เช็ค จะเป็น false
        this.isAll = currentReports.every(r => r.selected);
    }

    openModal(type: 'approve' | 'reject', currentReports: any[]) {
        const selected = currentReports.filter(r => r.selected);
        if (selected.length === 0) {
            alert('กรุณาเลือกรายการที่ต้องการดำเนินการ');
            return;
        }
        this.modalType = type;
        this.isModalOpen = true;
    }

    confirmAction(currentReports: any[]) {
        // 1. ดึงเฉพาะ ID ของรายการที่ถูกเลือก (เก็บเป็น string ตามที่ API ต้องการ)
        const ids = currentReports
            .filter(r => r.selected)
            .map(r => r.id.toString()); // เปลี่ยนจาก Number เป็น toString() หรือ r.id เฉยๆ

        // 2. ตรวจสอบประเภท Action (Approve หรือ Reject)
        const request$ = this.modalType === 'approve'
            ? this.reportService.approve(ids, this.actionReason)
            : this.reportService.reject(ids, this.actionReason);

        // 3. ยิง Request ไปที่ Backend
        request$.subscribe({
            next: () => {
                console.log('Success!');
                this.refresh();    // โหลดข้อมูลใหม่ในตาราง
                this.closeModal(); // ปิด Modal
            },
            error: (err) => {
                console.error('API Error:', err);
                alert('เกิดข้อผิดพลาดในการส่งข้อมูล');
            }
        });
    }

    closeModal() {
        this.isModalOpen = false;
        this.actionReason = '';
    }

    getStatusClass(status: string) {
        return {
            'pending': status === 'รออนุมัติ',
            'approved': status === 'อนุมัติ',
            'rejected': status === 'ไม่อนุมัติ'
        };
    }
}