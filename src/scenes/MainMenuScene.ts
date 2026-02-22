// ==========================================
// MainMenuScene.ts - หน้าจอเมนูหลัก
// ==========================================

import * as Phaser from 'phaser';
import { NIGHTS } from '../config/Constants';
import { SoundSystem } from '../systems/SoundSystem';
import { NightSystem } from '../systems/NightSystem';

export class MainMenuScene extends Phaser.Scene {
    private soundSystem!: SoundSystem;
    private nightSystem!: NightSystem;
    // private fogParticles!: Phaser.GameObjects.Particles.ParticleEmitter; // ไม่ได้ใช้งาน

    constructor() {
        super({ key: 'MainMenuScene' });
    }

    init(): void {
        const loadingScreen = document.getElementById('loading-screen');
        const errorScreen = document.getElementById('error-screen');
        if (loadingScreen) loadingScreen.style.display = 'none';
        if (errorScreen) errorScreen.style.display = 'none';
    }

    create(): void {
        const { width, height } = this.scale;

        // ซ่อนหน้าจอโหลด HTML - Moved to init()
        // const loadingScreen = document.getElementById('loading-screen');
        // if (loadingScreen) {
        //     loadingScreen.style.display = 'none';
        // }

        // สร้างระบบเสียง
        this.soundSystem = new SoundSystem(this);
        this.soundSystem.create();

        // 1. พื้นหลังบรรยากาศ (Vignette + หมอก)
        this.createBackground(width, height);

        // 2. ชื่อเรื่องด้วยฟอนต์สยองขวัญ
        this.createTitle(width, height);

        // 3. ระบบกลางคืน & ปุ่มเมนู
        this.nightSystem = new NightSystem();
        this.createMenuButtons(width, height);

        // 4. ปุ่มวิธีเล่น
        this.createInstructionsButton(width, height);

        // 5. ปุ่มรีเซ็ต
        this.createResetButton(width, height);

        // 6. เวอร์ชัน/ส่วนท้าย
        this.add.text(width / 2, height * 0.95, 'กด ESC เพื่อออกจากเกม', {
            fontFamily: 'Roboto',
            fontSize: '14px',
            color: '#666666'
        }).setOrigin(0.5).setScrollFactor(0);

        // ปุ่ม ESC เพื่อออก
        this.input.keyboard!.on('keydown-ESC', () => {
            if (confirm('คุณต้องการออกจากเกมหรือไม่?')) {
                window.close();
            }
        });
    }

    private createBackground(width: number, height: number): void {
        // พื้นหลังสีเข้ม
        this.add.rectangle(width / 2, height / 2, width, height, 0x050505).setScrollFactor(0);

        // Radial Gradient Vignette (จำลองด้วย texture หรือ graphics)
        const vignette = this.make.graphics({})
            .fillStyle(0x000000, 1)
            .fillCircle(width / 2, height / 2, width * 0.8);

        const mask = vignette.createGeometryMask();
        mask.setInvertAlpha(true);

        const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7).setScrollFactor(0);
        overlay.setMask(mask);

        // หมอก Procedural (อนุภาคลอยง่ายๆ)
        // หมายเหตุ: ใช้วงกลมง่ายๆ หากไม่มี texture หรือใช้ 'flare' หากมี assets มาตรฐาน
        if (!this.textures.exists('fog')) {
            const graphics = this.make.graphics({ x: 0, y: 0 }); // 'add' ไม่ใช่ตัวเลือกที่ถูกต้องสำหรับ GraphicsOptions
            graphics.fillStyle(0x222222, 0.5);
            graphics.fillCircle(16, 16, 16);
            graphics.generateTexture('fog', 32, 32);
        }

        // this.fogParticles = this.add.particles(0, 0, 'fog', {
        this.add.particles(0, 0, 'fog', {
            x: { min: 0, max: width },
            y: { min: 0, max: height },
            lifespan: 6000,
            speedX: { min: -10, max: 10 },
            speedY: { min: -5, max: -20 },
            scale: { start: 2, end: 4 },
            // 'mid' ไม่ใช่ property ที่ถูกต้อง ใช้ steps หรือ callback หากต้องการ
            // สำหรับการกะพริบง่ายๆ random alpha ก็เพียงพอแล้ว
            alpha: { start: 0, end: 0.2 },
            blendMode: 'ADD',
            quantity: 1
        });
    }

    private createTitle(width: number, height: number): void {
        const titleText = 'THE FOX COURIER';

        // ชื่อเรื่องหลัก (สไตล์สยองขวัญ แดง/ส้ม)
        const title = this.add.text(width / 2, height * 0.2, titleText, {
            fontFamily: 'Creepster',
            fontSize: '84px',
            color: '#ff3300',
            stroke: '#000000',
            strokeThickness: 8,
            shadow: { offsetX: 4, offsetY: 4, color: '#330000', blur: 10, stroke: true, fill: true }
        }).setOrigin(0.5).setScrollFactor(0);

        // แอนิเมชันชีพจร
        this.tweens.add({
            targets: title,
            scale: { from: 1, to: 1.05 },
            alpha: { from: 0.9, to: 1 },
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // คำโปรย
        this.add.text(width / 2, height * 0.32, 'A Horror Delivery Experience', {
            fontFamily: 'Roboto',
            fontSize: '20px',
            color: '#cccccc',
            letterSpacing: 2
        }).setOrigin(0.5).setScrollFactor(0);
    }

    private createMenuButtons(width: number, height: number): void {
        const startY = height * 0.45;
        const spacing = 80;

        for (let night = 1; night <= 3; night++) {
            const isUnlocked = this.nightSystem.isNightUnlocked(night);
            const yPos = startY + (night - 1) * spacing;
            const deliveries = NIGHTS[night]?.deliveries || 3;

            this.createStyledButton(width / 2, yPos, 400, 60, isUnlocked, () => {
                this.soundSystem.playButtonClick();
                this.scene.start('GameScene', { night: night });
            }, `คืนที่ ${night} - ส่ง ${deliveries} บ้าน`, isUnlocked ? undefined : '🔒');
        }
    }

    private createStyledButton(x: number, y: number, w: number, h: number, enabled: boolean, onClick: () => void, text: string, icon?: string): Phaser.GameObjects.Container {
        const container = this.add.container(x, y).setScrollFactor(0);

        // พื้นหลังปุ่ม (ลักษณะคล้าย Gradient)
        const bg = this.add.rectangle(0, 0, w, h, 0x111111, 0.9)
            .setStrokeStyle(2, enabled ? 0x444444 : 0x222222);

        // ข้อความ
        const btnText = this.add.text(0, 0, text, {
            fontFamily: 'Roboto',
            fontSize: '24px',
            color: enabled ? '#ffffff' : '#444444',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        if (icon) {
            const iconText = this.add.text(w / 2 - 30, 0, icon, { fontSize: '20px' }).setOrigin(0.5);
            container.add(iconText);
        }

        container.add([bg, btnText]);

        if (enabled) {
            bg.setInteractive({ useHandCursor: true })
                .on('pointerover', () => {
                    bg.setFillStyle(0x330000, 0.9); // แดงเข้มเมื่อชี้
                    bg.setStrokeStyle(2, 0xff0000);
                    btnText.setColor('#ffcccc');
                    this.tweens.add({ targets: container, scale: 1.05, duration: 100 });
                })
                .on('pointerout', () => {
                    bg.setFillStyle(0x111111, 0.9);
                    bg.setStrokeStyle(2, 0x444444);
                    btnText.setColor('#ffffff');
                    this.tweens.add({ targets: container, scale: 1, duration: 100 });
                })
                .on('pointerdown', onClick);
        }

        return container;
    }

    private createInstructionsButton(width: number, height: number): void {
        const btn = this.add.text(width / 2, height * 0.78, '📖 วิธีเล่น', {
            fontFamily: 'Roboto',
            fontSize: '22px',
            color: '#aaaaaa'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        btn.on('pointerover', () => btn.setColor('#ffffff'))
            .on('pointerout', () => btn.setColor('#aaaaaa'))
            .on('pointerdown', () => {
                this.soundSystem.playButtonClick();
                this.showInstructions();
            });
    }

    private createResetButton(width: number, height: number): void {
        const btn = this.add.text(width / 2, height * 0.85, '⚠️ รีเซ็ตความคืบหน้า', {
            fontFamily: 'Roboto',
            fontSize: '16px',
            color: '#660000'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        btn.on('pointerover', () => btn.setColor('#ff0000'))
            .on('pointerout', () => btn.setColor('#660000'))
            .on('pointerdown', () => {
                this.soundSystem.playButtonClick();
                if (confirm('ยืนยันการลบเซฟเกมทั้งหมด?')) {
                    this.nightSystem.resetProgress();
                    this.scene.restart();
                }
            });
    }

    private showInstructions(): void {
        const { width, height } = this.scale;

        const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.85).setInteractive().setDepth(100);

        const panel = this.add.container(width / 2, height / 2).setDepth(101);
        const bg = this.add.rectangle(0, 0, 600, 500, 0x101010).setStrokeStyle(2, 0x666666);

        const title = this.add.text(0, -200, '🔦 คู่มือเอาตัวรอด', {
            fontFamily: 'Creepster',
            fontSize: '42px',
            color: '#ff3300'
        }).setOrigin(0.5);

        const content = [
            'WASD เพื่อเดิน  |  SHIFT เพื่อวิ่ง',
            'F เพื่อโต้ตอบ |  E เพื่อตรวจสอบกระเป๋า',
            '',
            'เป้าหมาย:',
            'ส่งพัสดุให้ครบทุกบ้านที่กำหนด',
            'หลีกเลี่ยงสิ่งลึกลับในความมืด',
            '',
            'ข้อแนะนำในการเอาชีวิตรอด:',
            '- ดูแลแถบพลังงาน (Stamina) ใต้เท้าของคุณ',
            '- ฟังเสียงฝีเท้าให้ดี',
            '- แสงไฟฉายจะดึงดูดความสนใจ'
        ];

        const text = this.add.text(0, 0, content, {
            fontFamily: 'Roboto',
            fontSize: '20px',
            color: '#cccccc',
            align: 'center',
            lineSpacing: 12
        }).setOrigin(0.5);

        const closeBtn = this.add.text(0, 200, '[ ปิด ]', {
            fontFamily: 'Roboto',
            fontSize: '20px',
            color: '#ffffff'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        closeBtn.on('pointerdown', () => {
            this.soundSystem.playButtonClick();
            overlay.destroy();
            panel.destroy();
        });

        panel.add([bg, title, text, closeBtn]);

        this.tweens.add({
            targets: panel,
            scale: { from: 0.8, to: 1 },
            alpha: { from: 0, to: 1 },
            duration: 200,
            ease: 'Back.out'
        });
    }
}
