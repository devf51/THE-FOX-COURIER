// ==========================================
// BossNPC.ts - "บอส" (The Postmaster) NPC หลัก
// ==========================================

import * as Phaser from 'phaser';
import { DEPTH } from '../config/Constants';

export class BossNPC {
    public sprite: Phaser.GameObjects.Sprite;
    private glowCircle: Phaser.GameObjects.Arc;
    private indicatorText: Phaser.GameObjects.Text;
    private floatingTween: Phaser.Tweens.Tween | null = null;
    private glowTween: Phaser.Tweens.Tween | null = null;

    // ระยะทาง interaction
    public static readonly INTERACTION_RANGE = 120;
    // ขนาดบอสบนแผนที่ (ใกล้เคียงผู้เล่น 60x90)
    public static readonly DISPLAY_WIDTH = 55;
    public static readonly DISPLAY_HEIGHT = 70;

    constructor(scene: Phaser.Scene, x: number, y: number) {

        // สร้าง glow effect รอบตัวบอส (สีส้ม/ทองอำพัน)
        this.glowCircle = scene.add.circle(x, y, 45, 0xffaa00, 0.15)
            .setDepth(DEPTH.UI - 2);

        // Glow pulse animation
        this.glowTween = scene.tweens.add({
            targets: this.glowCircle,
            alpha: { from: 0.08, to: 0.2 },
            scale: { from: 0.9, to: 1.15 },
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // สร้าง sprite บอส (ขนาดใกล้เคียงผู้เล่น)
        this.sprite = scene.add.sprite(x, y, 'boss_npc')
            .setDisplaySize(BossNPC.DISPLAY_WIDTH, BossNPC.DISPLAY_HEIGHT)
            .setDepth(DEPTH.UI - 1);

        // Idle floating animation (หายใจ/ลอยเบาๆ)
        this.floatingTween = scene.tweens.add({
            targets: this.sprite,
            y: y - 4,
            duration: 1800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // สร้าง indicator ข้อความ (ซ่อนไว้ก่อน)
        this.indicatorText = scene.add.text(x, y - 55, '💬 คุยกับบอส [F]', {
            fontSize: '14px',
            color: '#ffcc00',
            stroke: '#000000',
            strokeThickness: 4,
            fontStyle: 'bold'
        })
            .setOrigin(0.5)
            .setDepth(DEPTH.UI)
            .setVisible(false);

        // Indicator bounce animation
        scene.tweens.add({
            targets: this.indicatorText,
            y: y - 62,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // ป้ายชื่อ "บอส"
        scene.add.text(x, y + 42, '🦉 บอส', {
            fontSize: '12px',
            color: '#ffdd88',
            stroke: '#000000',
            strokeThickness: 3,
            fontStyle: 'bold'
        })
            .setOrigin(0.5)
            .setDepth(DEPTH.UI - 1);
    }

    /**
     * ตรวจสอบว่าผู้เล่นอยู่ในระยะ interaction หรือไม่
     */
    isPlayerNear(playerX: number, playerY: number): boolean {
        const dist = Phaser.Math.Distance.Between(
            playerX, playerY,
            this.sprite.x, this.sprite.y
        );
        return dist < BossNPC.INTERACTION_RANGE;
    }

    /**
     * แสดง/ซ่อน indicator ตามระยะทาง
     */
    showIndicator(visible: boolean): void {
        this.indicatorText.setVisible(visible);
    }

    /**
     * รับตำแหน่ง
     */
    getPosition(): { x: number; y: number } {
        return { x: this.sprite.x, y: this.sprite.y };
    }

    /**
     * ทำลาย resources
     */
    destroy(): void {
        if (this.floatingTween) this.floatingTween.destroy();
        if (this.glowTween) this.glowTween.destroy();
        this.glowCircle.destroy();
        this.indicatorText.destroy();
        this.sprite.destroy();
    }
}
