// ==========================================
// MinimapSystem.ts - Simple Minimap with Direction Arrow
// ==========================================

import { DEPTH } from '../config/Constants';

export class MinimapSystem {
    private scene: any; // Using any for custom scene props
    private ui: Phaser.GameObjects.Container | null;
    private playerDot: Phaser.GameObjects.Arc | null;
    private houseDots: any[]; // Combined wrapper objects
    private arrowEmoji: Phaser.GameObjects.Text | null;
    private distText: Phaser.GameObjects.Text | null;
    private mapSize: number;
    private worldW: number;
    private worldH: number;
    private lastUpdateTime: number; // Throttling
    private updateInterval: number; // Update every X ms

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.ui = null;
        this.playerDot = null;
        this.houseDots = [];
        this.arrowEmoji = null;
        this.distText = null;
        this.mapSize = 0;
        this.worldW = 0;
        this.worldH = 0;
        this.lastUpdateTime = 0;
        this.updateInterval = 100; // Update minimap every 100ms (10 FPS) instead of every frame
    }

    create(): void {
        // ขนาดและตำแหน่ง minimap
        const mapSize = 140;
        const margin = 15;
        const x = this.scene.scale.width - mapSize - margin;
        const y = margin + 60;

        // สร้าง Container สำหรับ UI (ติดหน้าจอ)
        const ui = this.scene.add.container(x, y)
            .setScrollFactor(0)
            .setDepth(DEPTH.MINIMAP);
        this.ui = ui;

        // === พื้นหลังแผนที่ (Gradient + Glassmorphism) ===
        const bg = this.scene.add.graphics();
        bg.fillGradientStyle(0x0a0a14, 0x0a0a14, 0x001a10, 0x001a10, 0.9, 0.9, 0.95, 0.95);
        bg.fillRoundedRect(0, 0, mapSize, mapSize, 12);

        // Inner shadow/border
        const innerBorder = this.scene.add.graphics();
        innerBorder.lineStyle(2, 0x00ff88, 0.3);
        innerBorder.strokeRoundedRect(2, 2, mapSize - 4, mapSize - 4, 10);

        // Outer glow layers
        const glow1 = this.scene.add.graphics();
        glow1.lineStyle(3, 0x00ff88, 0.6);
        glow1.strokeRoundedRect(0, 0, mapSize, mapSize, 12);

        const glow2 = this.scene.add.graphics();
        glow2.lineStyle(6, 0x00ff88, 0.2);
        glow2.strokeRoundedRect(-3, -3, mapSize + 6, mapSize + 6, 14);

        ui.add([glow2, glow1, bg, innerBorder]);

        // === หัวข้อ ===
        const titleBadge = this.scene.add.graphics();
        titleBadge.fillStyle(0x003311, 0.9);
        titleBadge.fillRoundedRect(mapSize / 2 - 30, -12, 60, 24, 12);
        titleBadge.lineStyle(1, 0x00ff88, 0.5);
        titleBadge.strokeRoundedRect(mapSize / 2 - 30, -12, 60, 24, 12);

        const title = this.scene.add.text(mapSize / 2, 0, '🗺️ แผนที่', {
            fontSize: '12px',
            color: '#00ff88',
            fontStyle: 'bold',
            shadow: { offsetX: 0, offsetY: 0, color: '#00ff88', blur: 4, fill: true }
        }).setOrigin(0.5);

        ui.add([titleBadge, title]);

        // === จุดผู้เล่น (วงกลมสีเขียว + Pulse) ===
        // Pulse ring
        const playerPulse = this.scene.add.circle(mapSize / 2, mapSize / 2, 8, 0x00ff00, 0.0);
        playerPulse.setStrokeStyle(2, 0x00ff00, 0.8);

        const playerDot = this.scene.add.circle(mapSize / 2, mapSize / 2, 5, 0x00ff00);
        playerDot.setStrokeStyle(2, 0xffffff);
        this.playerDot = playerDot;

        ui.add([playerPulse, playerDot]);

        // Animation for player pulse
        this.scene.tweens.add({
            targets: playerPulse,
            scaleX: 1.8,
            scaleY: 1.8,
            alpha: 0,
            duration: 1500,
            repeat: -1
        });

        // Update player dot ref to move both dot and pulse (hacky way, better to group them but this works for simple follow)
        (playerDot as any).pulseRef = playerPulse;

        // === จุดบ้าน (สี่เหลี่ยมเหลือง) ===
        this.houseDots = [];
        if (this.scene.houses) {
            this.scene.houses.getChildren().forEach((house: Phaser.GameObjects.Sprite) => {
                const dot = this.scene.add.rectangle(0, 0, 6, 6, 0xffff00) as any;
                dot.setStrokeStyle(1, 0x000000);
                dot.houseRef = house;
                ui.add(dot);
                this.houseDots.push(dot);
            });
        }


        // === กล่องบอกทิศทาง (Mini Box) ===
        const arrowBoxY = mapSize + 15;

        // Gradient background for info box
        const arrowBoxBg = this.scene.add.graphics();
        arrowBoxBg.fillGradientStyle(0x2a1a0a, 0x2a1a0a, 0x1a0f00, 0x1a0f00, 0.9, 0.9, 0.95, 0.95);
        arrowBoxBg.fillRoundedRect(0, arrowBoxY, mapSize, 45, 8);

        // Golden glow border
        const arrowBoxGlow = this.scene.add.graphics();
        arrowBoxGlow.lineStyle(2, 0xffaa00, 0.6);
        arrowBoxGlow.strokeRoundedRect(0, arrowBoxY, mapSize, 45, 8);

        ui.add([arrowBoxBg, arrowBoxGlow]);

        const arrowLabel = this.scene.add.text(mapSize / 2, arrowBoxY + 10, '📦 บ้านถัดไป', {
            fontSize: '10px',
            color: '#ffaa00',
            fontStyle: 'bold',
            shadow: { offsetX: 0, offsetY: 0, color: '#ffaa00', blur: 3, fill: true }
        }).setOrigin(0.5);
        ui.add(arrowLabel);

        const arrowEmoji = this.scene.add.text(mapSize / 2 - 20, arrowBoxY + 28, '➡️', {
            fontSize: '20px'
        }).setOrigin(0.5);
        this.arrowEmoji = arrowEmoji;
        ui.add(arrowEmoji);

        const distText = this.scene.add.text(mapSize / 2 + 15, arrowBoxY + 28, '0m', {
            fontSize: '14px',
            color: '#ffffff',
            fontStyle: 'bold',
            shadow: { offsetX: 1, offsetY: 1, color: '#000000', blur: 2, fill: true }
        }).setOrigin(0.5);
        this.distText = distText;
        ui.add(distText);

        // เก็บค่าสำหรับการคำนวณ
        this.mapSize = mapSize;
        this.worldW = this.scene.physics.world.bounds.width || 1920;
        this.worldH = this.scene.physics.world.bounds.height || 2400;

    }

    // แปลงพิกัดโลกเป็นพิกัดแผนที่
    private toMapPos(wx: number, wy: number): { x: number; y: number } {
        const pad = 8;
        const area = this.mapSize - pad * 2;
        return {
            x: pad + (wx / this.worldW) * area,
            y: pad + (wy / this.worldH) * area
        };
    }

    // หาทิศทาง emoji
    private getArrow(deg: number): string {
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

    update(): void {
        // Early exit guards
        if (!this.scene.player || !this.playerDot || !this.arrowEmoji || !this.distText || !this.ui) return;
        if (this.scene.isGameOver || this.scene.isWin) return;

        // Throttle updates to reduce CPU load (10 FPS instead of 60 FPS)
        const currentTime = this.scene.time.now;
        if (currentTime - this.lastUpdateTime < this.updateInterval) {
            return;
        }
        this.lastUpdateTime = currentTime;

        const pPos = this.scene.player.getPosition();
        const pMap = this.toMapPos(pPos.x, pPos.y);
        this.playerDot.setPosition(pMap.x, pMap.y);

        // Sync pulse position
        if ((this.playerDot as any).pulseRef) {
            (this.playerDot as any).pulseRef.setPosition(pMap.x, pMap.y);
        }

        // อัพเดทจุดบ้าน + หาบ้านที่ใกล้ที่สุด
        let nearest: Phaser.GameObjects.Sprite | null = null;
        let nearDist = Infinity;

        // Optimized: Cache length to avoid property access in loop
        const houseDotCount = this.houseDots.length;
        for (let i = 0; i < houseDotCount; i++) {
            const dot = this.houseDots[i];
            const h = dot.houseRef;
            if (!h) continue;

            const pos = this.toMapPos(h.x, h.y);
            dot.setPosition(pos.x, pos.y);

            if (h.getData('isDelivered')) {
                dot.setFillStyle(0x00ff00, 0.7); // สีเขียว = ส่งแล้ว
            } else {
                dot.setFillStyle(0xffff00, 1); // สีเหลือง = รอส่ง
                // Optimized distance calculation (squared distance, avoid sqrt)
                const dx = pPos.x - h.x;
                const dy = pPos.y - h.y;
                const distSq = dx * dx + dy * dy;
                if (distSq < nearDist * nearDist) {
                    nearDist = Math.sqrt(distSq);
                    nearest = h;
                }
            }
        }


        // อัพเดทลูกศรทิศทาง
        if (nearest) {
            const angle = Phaser.Math.Angle.Between(pPos.x, pPos.y, (nearest as Phaser.GameObjects.Sprite).x, (nearest as Phaser.GameObjects.Sprite).y);
            const deg = Phaser.Math.RadToDeg(angle);
            this.arrowEmoji.setText(this.getArrow(deg));
            this.distText.setText(Math.floor(nearDist / 10) + 'm');
        } else {
            this.arrowEmoji.setText('✅');
            this.distText.setText('หมด!');
        }
    }
}
