// ==========================================
// FlashlightSystem.ts - Soft Gradient Cone Flashlight (Canvas API)
// ==========================================

import * as Phaser from 'phaser';

export class FlashlightSystem {
    private scene: Phaser.Scene;
    private darkness: Phaser.GameObjects.RenderTexture | null;
    private light: Phaser.GameObjects.Image | null;
    private houseLights: Phaser.GameObjects.Image[];
    private readonly DARKNESS_ALPHA: number = 0.95; // From Constants (hardcoded safely)

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.darkness = null;
        this.light = null;
        this.houseLights = [];
    }

    create(): void {
        const worldWidth = this.scene.physics.world.bounds.width;
        const worldHeight = this.scene.physics.world.bounds.height;

        // 1. Create Darkness Overlay as RenderTexture
        // ใช้ RenderTexture เป็นตัว Darkness เลย (ไม่ต้องมี Rectangle สีดำแล้ว)
        this.darkness = this.scene.add.renderTexture(
            0,
            0,
            worldWidth,
            worldHeight
        );
        this.darkness.setDepth(100);
        this.darkness.setOrigin(0, 0);

        // 2. Create Gradient Cone using Canvas API
        const radius = 400;
        const canvas = document.createElement('canvas');
        canvas.width = radius * 2;
        canvas.height = radius * 2;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            console.error('Could not get 2D context for flashlight');
            return;
        }

        const centerX = radius;
        const centerY = radius;

        // สร้าง radial gradient จากกลางไปขอบ
        const gradient = ctx.createRadialGradient(
            centerX, centerY, 0,           // วงกลมใน (กลาง)
            centerX, centerY, radius * 0.9 // วงกลมนอก (ขอบ)
        );

        gradient.addColorStop(0, 'rgba(255, 255, 255, 1.0)');   // กลาง สว่างเต็มที่
        gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.9)'); // ยังค่อนข้างสว่าง
        gradient.addColorStop(0.6, 'rgba(255, 255, 255, 0.5)'); // จางลงครึ่งหนึ่ง
        gradient.addColorStop(0.85, 'rgba(255, 255, 255, 0.1)'); // เกือบมืด
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');     // มืดสนิท

        // วาดรูปกรวย (cone/slice)
        ctx.fillStyle = gradient;
        ctx.beginPath();

        // วาด arc (ส่วนโค้ง) สำหรับกรวยแสง
        const startAngle = Phaser.Math.DegToRad(-40); // มุมเริ่ม
        const endAngle = Phaser.Math.DegToRad(40);    // มุมสิ้นสุด

        ctx.arc(centerX, centerY, radius, startAngle, endAngle, false);
        ctx.lineTo(centerX, centerY); // เส้นกลับไปจุดกลาง
        ctx.closePath();
        ctx.fill();

        // วาดวงกลมรอบตัวผู้เล่น (ด้วย gradient เช่นกัน)
        const smallGradient = ctx.createRadialGradient(
            centerX, centerY, 0,
            centerX, centerY, 50
        );
        smallGradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        smallGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.8)');
        smallGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.fillStyle = smallGradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 50, 0, Math.PI * 2);
        ctx.fill();

        // แปลง Canvas เป็น Phaser Texture
        this.scene.textures.addCanvas('flashlightCone', canvas);

        // สร้าง texture สำหรับไฟบ้าน (วงกลมสว่าง)
        this.createHouseLightTexture();

        // 3. Create Light Sprite (Used as a brush)
        this.light = this.scene.make.image({
            x: 0,
            y: 0,
            key: 'flashlightCone',
            add: false
        });

        // No mask needed logic anymore
    }

    createHouseLightTexture(): void {
        const radius = 80;
        const canvas = document.createElement('canvas');
        canvas.width = radius * 2;
        canvas.height = radius * 2;
        const ctx = canvas.getContext('2d');

        if (!ctx) return;

        const centerX = radius;
        const centerY = radius;

        // สร้าง radial gradient สำหรับไฟบ้าน
        const gradient = ctx.createRadialGradient(
            centerX, centerY, 0,
            centerX, centerY, radius
        );

        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.8)');
        gradient.addColorStop(0.8, 'rgba(255, 255, 255, 0.3)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fill();

        this.scene.textures.addCanvas('houseLight', canvas);
    }

    addHouseLight(x: number, y: number): void {
        const lightSprite = this.scene.make.image({
            x: x,
            y: y,
            key: 'houseLight',
            add: false
        });

        this.houseLights.push(lightSprite);
    }

    update(playerX: number, playerY: number, rotation: number): void {
        if (this.darkness && this.light) {
            // 1. Fill darkness with black (reset)
            this.darkness.clear();
            this.darkness.fill(0x000000, this.DARKNESS_ALPHA);

            // 2. Update player flashlight position
            this.light.x = playerX;
            this.light.y = playerY;
            this.light.rotation = rotation;

            // Subtle flicker for atmosphere
            if (Math.random() > 0.98) {
                this.light.alpha = 0.9 + Math.random() * 0.1;
            } else {
                this.light.alpha = 1;
            }

            // 3. Erase darkness using flashlight (Source Alpha -> Destination Alpha subtraction)
            this.darkness.erase(this.light, this.light.x, this.light.y);

            // 4. Erase darkness using house lights
            for (let i = 0; i < this.houseLights.length; i++) {
                const hl = this.houseLights[i];
                this.darkness.erase(hl, hl.x, hl.y);
            }
        }
    }
}
