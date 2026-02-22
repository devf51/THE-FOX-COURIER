// ==========================================
// NightSystem.ts - Night Progression System
// ==========================================

import { NIGHTS, ENEMY } from '../config/Constants';

export class NightSystem {
    private currentNight: number;
    private maxNights: number;

    constructor() {
        this.currentNight = 1;
        this.maxNights = 3;
        this.loadProgress();
    }

    // โหลดความคืบหน้าจาก localStorage
    private loadProgress(): void {
        const saved = localStorage.getItem('foxCourierNight');
        if (saved) {
            this.currentNight = parseInt(saved, 10);
        }
    }

    // บันทึกความคืบหน้า
    private saveProgress(): void {
        localStorage.setItem('foxCourierNight', this.currentNight.toString());
    }

    // รีเซ็ตความคืบหน้า
    resetProgress(): void {
        this.currentNight = 1;
        localStorage.removeItem('foxCourierNight');
    }

    // รับจำนวน deliveries สำหรับคืนนี้
    getDeliveriesForNight(night: number): number {
        return NIGHTS[night]?.deliveries || 3;
    }

    // รับความเร็ว enemy สำหรับคืนนี้
    getEnemySpeedForNight(night: number): number {
        const baseSpeed = ENEMY.BASE_SPEEDS[1] || 85;
        // ใช้ค่าความเร็วตาม night ถ้ามี
        if (ENEMY.BASE_SPEEDS[night]) {
            return ENEMY.BASE_SPEEDS[night];
        }

        // Fallback calculation if not in lookup
        const multiplier = Math.pow(1.2, night - 1); // 1.2 is implicit difficulty multiplier
        return Math.floor(baseSpeed * multiplier);
    }

    // ไปคืนถัดไป
    advanceNight(): boolean {
        if (this.currentNight < this.maxNights) {
            this.currentNight++;
            this.saveProgress();
            return true;
        }
        return false; // จบทุกคืนแล้ว
    }

    // เช็คว่าคืนนี้ unlock แล้วหรือยัง
    isNightUnlocked(night: number): boolean {
        return night <= this.currentNight;
    }

    // รับคืนปัจจุบัน
    getCurrentNight(): number {
        return this.currentNight;
    }

    // เช็คว่าเกมจบแล้วหรือยัง
    isGameComplete(): boolean {
        return this.currentNight > this.maxNights;
    }
}
