// ==========================================
// DirectionIndicator.ts - Direction Arrow to Nearest House
// ==========================================

import * as Phaser from 'phaser';
import { DEPTH } from '../config/Constants';

export class DirectionIndicator {
    private scene: any; // Using any to access custom scene properties like player, houses
    private container: Phaser.GameObjects.Container | null;
    private arrowText: Phaser.GameObjects.Text | null;
    private distanceText: Phaser.GameObjects.Text | null;
    private labelText: Phaser.GameObjects.Text | null;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.container = null;
        this.arrowText = null;
        this.distanceText = null;
        this.labelText = null;
    }

    create(): void {
        const { width } = this.scene.scale;

        // สร้าง Container ตรงกลางบนของหน้าจอ
        const container = this.scene.add.container(width / 2, 70)
            .setScrollFactor(0)
            .setDepth(DEPTH.UI + 5);
        this.container = container;

        // === พื้นหลัง (Pill Shape Gradient) ===
        const bg = this.scene.add.graphics();
        bg.fillGradientStyle(0x2a1a0f, 0x2a1a0f, 0x3d261a, 0x3d261a, 0.95, 0.95, 1.0, 1.0);
        bg.fillRoundedRect(-90, -30, 180, 60, 30);

        // Inner border/shadow
        const innerBorder = this.scene.add.graphics();
        innerBorder.lineStyle(2, 0xffaa00, 0.3);
        innerBorder.strokeRoundedRect(-88, -28, 176, 56, 28);

        // Outer glow
        const glow = this.scene.add.graphics();
        glow.lineStyle(4, 0xffaa00, 0.5);
        glow.strokeRoundedRect(-90, -30, 180, 60, 30);

        container.add([glow, bg, innerBorder]);

        // === ป้ายข้อความ ===
        this.labelText = this.scene.add.text(0, -18, '📦 บ้านถัดไป', {
            fontSize: '12px',
            color: '#ffaa00',
            stroke: '#000',
            strokeThickness: 2,
            fontStyle: 'bold',
            shadow: { offsetX: 0, offsetY: 0, color: '#ffaa00', blur: 4, fill: true }
        }).setOrigin(0.5);
        container.add(this.labelText);

        // === ลูกศรทิศทาง ===
        this.arrowText = this.scene.add.text(-35, 8, '➡️', {
            fontSize: '28px'
        }).setOrigin(0.5);
        container.add(this.arrowText);

        // === ระยะทาง ===
        this.distanceText = this.scene.add.text(25, 8, '0m', {
            fontSize: '24px',
            color: '#ffffff',
            stroke: '#000',
            strokeThickness: 3,
            fontStyle: 'bold',
            shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 4, fill: true }
        }).setOrigin(0.5);
        container.add(this.distanceText);

        // === Animation: Floating ===
        this.scene.tweens.add({
            targets: container,
            y: 75,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // === Animation: Glow Pulse ===
        this.scene.tweens.add({
            targets: glow,
            alpha: 0.2,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Set visible from start
        container.setVisible(true);
    }

    update(): void {
        if (!this.scene.player || !this.scene.houses || !this.container || !this.arrowText || !this.distanceText) {
            return;
        }

        const playerPos = this.scene.player.getPosition();

        // หาบ้านที่ใกล้ที่สุดที่ยังไม่ได้ส่ง
        let nearestHouse: Phaser.GameObjects.Sprite | null = null;
        let nearestDist = Infinity;

        this.scene.houses.getChildren().forEach((house: Phaser.GameObjects.Sprite) => {
            if (!house.getData('isDelivered')) {
                const dist = Phaser.Math.Distance.Between(
                    playerPos.x, playerPos.y,
                    house.x, house.y
                );
                if (dist < nearestDist) {
                    nearestDist = dist;
                    nearestHouse = house;
                }
            }
        });

        // อัพเดทลูกศรและระยะทาง
        if (nearestHouse) {
            // คำนวณมุม
            const angle = Phaser.Math.Angle.Between(
                playerPos.x, playerPos.y,
                (nearestHouse as Phaser.GameObjects.Sprite).x, (nearestHouse as Phaser.GameObjects.Sprite).y
            );
            const deg = Phaser.Math.RadToDeg(angle);

            // เลือก emoji ตามทิศทาง
            this.arrowText.setText(this.getDirectionArrow(deg));

            // แสดงระยะทาง (หารด้วย 10 เพื่อแปลงเป็น "เมตร")
            const meters = Math.floor(nearestDist / 10);
            this.distanceText.setText(meters + 'm');

            this.container.setVisible(true);
        } else {
            // ส่งครบแล้ว!
            this.arrowText.setText('✅');
            this.distanceText.setText('หมดแล้ว!');
            this.container.setVisible(true);
        }
    }

    private getDirectionArrow(deg: number): string {
        // แปลงองศาเป็นลูกศร 8 ทิศ
        if (deg >= -22.5 && deg < 22.5) return '➡️';
        if (deg >= 22.5 && deg < 67.5) return '↘️';
        if (deg >= 67.5 && deg < 112.5) return '⬇️';
        if (deg >= 112.5 && deg < 157.5) return '↙️';
        if (deg >= 157.5 || deg < -157.5) return '⬅️';
        if (deg >= -157.5 && deg < -112.5) return '↖️';
        if (deg >= -112.5 && deg < -67.5) return '⬆️';
        if (deg >= -67.5 && deg < -22.5) return '↗️';
        return '➡️';
    }
}
