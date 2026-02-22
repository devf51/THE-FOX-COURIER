// ==========================================
// UISystem.ts - UI Creation & Management
// ==========================================

import * as Phaser from 'phaser';
import { DEPTH } from '../config/Constants';

export class UISystem {
    public scene: any; // Using any for scene to access custom properties like deliveredCount
    public width: number;
    public height: number;
    public uiDepth: number;

    public mainUI: Phaser.GameObjects.Container | null;
    public dialogueUI: Phaser.GameObjects.Container | null;
    public interactContainer: Phaser.GameObjects.Container | null;
    public knockingContainer: Phaser.GameObjects.Container | null;
    public knockingBar: Phaser.GameObjects.Rectangle | null;
    public pauseMenu: Phaser.GameObjects.Container | null;

    // UI Elements
    public nightText: Phaser.GameObjects.Text | null;
    public timeText: Phaser.GameObjects.Text | null;
    public statusText: Phaser.GameObjects.Text | null;
    // public staminaBar: Phaser.GameObjects.Rectangle | null; // deprecated
    public npcNameText: Phaser.GameObjects.Text | null;
    public dialogueText: Phaser.GameObjects.Text | null;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.width = scene.scale.width;
        this.height = scene.scale.height;
        this.uiDepth = DEPTH.UI;

        this.mainUI = null;
        this.dialogueUI = null;
        this.interactContainer = null;
        this.knockingContainer = null;
        this.knockingBar = null;
        this.pauseMenu = null;

        // UI Elements
        this.nightText = null;
        this.timeText = null;
        this.statusText = null;

        this.npcNameText = null;
        this.dialogueText = null;
    }

    create(): void {
        this.createMainUI();
        this.createDialogueUI();
        this.createInteractionPrompt();
        this.createKnockingProgress();
    }



    private createMainUI(): void {
        const barHeight = 60;
        const mainUI = this.scene.add.container(0, 0)
            .setScrollFactor(0)
            .setDepth(this.uiDepth)
            .setVisible(true);
        this.mainUI = mainUI;

        // === Top Bar Background (Gradient + Glass) ===
        const barBg = this.scene.add.graphics();
        barBg.fillGradientStyle(0x0a0a0a, 0x0a0a0a, 0x000000, 0x000000, 0.95, 0.95, 0.8, 0.8);
        barBg.fillRect(0, 0, this.width, barHeight);

        // Bottom border glow
        const borderGlow = this.scene.add.graphics();
        borderGlow.fillGradientStyle(0x00ff88, 0x00ff88, 0x000000, 0x000000, 0, 0, 0.5, 0.5); // Vertical gradient for glow
        borderGlow.fillRect(0, barHeight, this.width, 20); // Extends below bar

        const borderLine = this.scene.add.graphics();
        borderLine.lineStyle(2, 0x00ff88, 0.8);
        borderLine.beginPath();
        borderLine.moveTo(0, barHeight);
        borderLine.lineTo(this.width, barHeight);
        borderLine.strokePath();

        // === Layout Containers ===
        // 1. Night (Left)
        const nightContainer = this.scene.add.container(30, barHeight / 2);
        const moonIcon = this.scene.add.text(0, 0, '🌙', { fontSize: '24px' }).setOrigin(0, 0.5);
        this.nightText = this.scene.add.text(35, 0, 'คืนที่ 1/3', {
            fontSize: '20px',
            color: '#00ff88',
            fontStyle: 'bold',
            shadow: { offsetX: 0, offsetY: 0, color: '#00ff88', blur: 6, fill: true }
        }).setOrigin(0, 0.5);
        nightContainer.add([moonIcon, this.nightText]);

        // 2. Time (Center)
        const timeContainer = this.scene.add.container(this.width / 2, barHeight / 2);
        this.timeText = this.scene.add.text(0, 0, '00:00', {
            fontSize: '32px',
            color: '#ffd700',
            fontStyle: 'bold',
            shadow: { offsetX: 0, offsetY: 0, color: '#ffd700', blur: 8, fill: true }
        }).setOrigin(0.5);
        timeContainer.add(this.timeText);

        // 3. Status/Delivery (Right - Adjusted to not overlap Minimap usually on right)
        // Keeping it slightly left of the minimap area (assuming minimap takes ~160px)
        const statusX = this.width - 200;
        const statusContainer = this.scene.add.container(statusX, barHeight / 2);

        this.statusText = this.scene.add.text(0, 0, '📦 0/5', {
            fontSize: '20px',
            color: '#ffffff',
            fontStyle: 'bold',
            shadow: { offsetX: 1, offsetY: 1, color: '#000000', blur: 2, fill: true }
        }).setOrigin(1, 0.5); // Right aligned
        statusContainer.add(this.statusText);

        // 4. Controls Hint (Bottom Right Corner, discreet)
        this.scene.add.text(this.width - 20, this.height - 20, 'F: โต้ตอบ | ESC: หยุด | SHIFT: วิ่ง', {
            fontSize: '14px',
            color: '#888888',
            fontStyle: 'italic',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(1, 1).setScrollFactor(0).setDepth(this.uiDepth);

        mainUI.add([barBg, borderGlow, borderLine, nightContainer, timeContainer, statusContainer]);
        // Note: controlHint is added directly to scene to be at bottom, not in top bar container

        // Pulsing effect for Time (Subtle)
        this.scene.tweens.add({
            targets: this.timeText,
            scale: 1.05,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    private createDialogueUI(): void {
        const panelWidth = this.width - 80;
        const panelHeight = Math.min(260, this.height * 0.35);
        const x = this.width / 2;
        const y = this.height - (panelHeight / 2) - 20;

        // สร้าง container
        const dialogueUI = this.scene.add.container(x, y)
            .setScrollFactor(0)
            .setDepth(this.uiDepth + 100)
            .setVisible(false);
        this.dialogueUI = dialogueUI;

        // สร้าง gradient background
        const dlgBg = this.scene.add.graphics();
        dlgBg.fillGradientStyle(
            0x0f0f1e, 0x0f0f1e, 0x1a1a3e, 0x1a1a3e,
            0.94, 0.94, 0.98, 0.98
        );
        dlgBg.fillRoundedRect(
            -panelWidth / 2, -panelHeight / 2,
            panelWidth, panelHeight, 16
        );

        // เพิ่ม outer glow layers
        const dlgGlow1 = this.scene.add.graphics();
        dlgGlow1.lineStyle(4, 0x4a9eff, 0.6);
        dlgGlow1.strokeRoundedRect(
            -panelWidth / 2 - 2, -panelHeight / 2 - 2,
            panelWidth + 4, panelHeight + 4, 16
        );

        const dlgGlow2 = this.scene.add.graphics();
        dlgGlow2.lineStyle(8, 0x4a9eff, 0.3);
        dlgGlow2.strokeRoundedRect(
            -panelWidth / 2 - 4, -panelHeight / 2 - 4,
            panelWidth + 8, panelHeight + 8, 16
        );

        // Main border with glow
        const dlgBorder = this.scene.add.graphics();
        dlgBorder.lineStyle(3, 0x88ccff, 1);
        dlgBorder.strokeRoundedRect(
            -panelWidth / 2, -panelHeight / 2,
            panelWidth, panelHeight, 16
        );

        // คำนวณตำแหน่งและขนาด
        const contentPadding = 24;
        const contentWidth = panelWidth - (contentPadding * 2);
        const nameX = -panelWidth / 2 + contentPadding;
        const nameY = -panelHeight / 2 + contentPadding;
        const textY = -panelHeight / 2 + contentPadding + 30;
        const textMaxHeight = panelHeight - (contentPadding * 2) - 50;

        // สร้าง NPC Name Text with enhanced styling
        this.npcNameText = this.scene.add.text(
            nameX,
            nameY,
            'NPC Name',
            {
                fontSize: '20px',
                color: '#88ccff',
                fontStyle: 'bold',
                stroke: '#000000',
                strokeThickness: 3,
                shadow: {
                    offsetX: 0,
                    offsetY: 0,
                    color: '#4a9eff',
                    blur: 10,
                    fill: true
                }
            }
        )
            .setOrigin(0)
            .setScrollFactor(0)
            .setVisible(false);

        // สร้าง Dialogue Text with enhanced styling
        this.dialogueText = this.scene.add.text(
            -panelWidth / 2 + contentPadding,
            textY,
            'Dialogue text here',
            {
                fontSize: '17px',
                color: '#ffffff',
                wordWrap: { width: contentWidth },
                stroke: '#000000',
                strokeThickness: 2,
                shadow: {
                    offsetX: 2,
                    offsetY: 2,
                    color: '#000000',
                    blur: 4,
                    fill: true
                }
            }
        )
            .setOrigin(0)
            .setWordWrapWidth(contentWidth, true)
            .setFixedSize(contentWidth, textMaxHeight)
            .setScrollFactor(0)
            .setVisible(false);

        // สร้าง Continue Text with glow
        const continueText = this.scene.add.text(
            panelWidth / 2 - contentPadding,
            panelHeight / 2 - contentPadding,
            '[ F ] ต่อไป',
            {
                fontSize: '16px',
                color: '#00ff88',
                fontStyle: 'bold',
                stroke: '#000000',
                strokeThickness: 2,
                shadow: {
                    offsetX: 0,
                    offsetY: 0,
                    color: '#00ff88',
                    blur: 8,
                    fill: true
                }
            }
        )
            .setOrigin(1, 1)
            .setScrollFactor(0)
            .setVisible(false);

        dialogueUI.add([dlgGlow2, dlgGlow1, dlgBg, dlgBorder]);
        dialogueUI.add([this.npcNameText, this.dialogueText, continueText]);

        // เพิ่ม pulse animation ให้กับ continue text
        this.scene.tweens.add({
            targets: continueText,
            alpha: 0.6,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // เพิ่ม glow animation
        this.scene.tweens.add({
            targets: dlgBorder,
            alpha: 0.8,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    private createInteractionPrompt(): void {
        const interactContainer = this.scene.add.container(0, 0)
            .setDepth(this.uiDepth)
            .setVisible(false);
        this.interactContainer = interactContainer;

        // Background gradient
        const bg = this.scene.add.graphics();
        bg.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x0f0f1e, 0x0f0f1e, 0.92, 0.92, 0.95, 0.95);
        bg.fillRoundedRect(-75, -28, 150, 56, 28);

        // Outer glow
        const glowOuter = this.scene.add.graphics();
        glowOuter.lineStyle(6, 0x00ff88, 0.4);
        glowOuter.strokeRoundedRect(-77, -30, 154, 60, 30);

        // Inner border
        const borderInner = this.scene.add.graphics();
        borderInner.lineStyle(3, 0x00ff88, 1);
        borderInner.strokeRoundedRect(-75, -28, 150, 56, 28);

        // Key Hint (Enhanced circle)
        const keyGlow = this.scene.add.circle(-40, 0, 20, 0x00ff88, 0.3);
        const keyBg = this.scene.add.circle(-40, 0, 18, 0xffffff);
        const keyText = this.scene.add.text(-40, 0, 'F', {
            fontSize: '22px',
            color: '#000000',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Label Text with glow
        const actionText = this.scene.add.text(20, 0, 'เคาะประตู', {
            fontSize: '20px',
            color: '#ffffff',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 2,
            shadow: {
                offsetX: 0,
                offsetY: 0,
                color: '#00ff88',
                blur: 6,
                fill: true
            }
        }).setOrigin(0.5);

        interactContainer.add([glowOuter, bg, borderInner, keyGlow, keyBg, keyText, actionText]);

        // Floating Animation
        this.scene.tweens.add({
            targets: interactContainer,
            y: 5,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Glow pulse
        this.scene.tweens.add({
            targets: glowOuter,
            alpha: 0.6,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Key glow pulse
        this.scene.tweens.add({
            targets: keyGlow,
            alpha: 0.5,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 1200,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    private createKnockingProgress(): void {
        const knockingContainer = this.scene.add.container(
            this.width / 2,
            this.height - 100
        )
            .setScrollFactor(0)
            .setDepth(this.uiDepth)
            .setVisible(false);
        this.knockingContainer = knockingContainer;

        // Background with gradient
        const knockBg = this.scene.add.graphics();
        knockBg.fillGradientStyle(0x0a0a0a, 0x0a0a0a, 0x1a1a2e, 0x1a1a2e, 0.93, 0.93, 0.96, 0.96);
        knockBg.fillRoundedRect(-154, -19, 308, 38, 19);

        // Outer glow
        const knockGlow = this.scene.add.graphics();
        knockGlow.lineStyle(5, 0xffd700, 0.5);
        knockGlow.strokeRoundedRect(-156, -21, 312, 42, 21);

        // Border
        const knockBorder = this.scene.add.graphics();
        knockBorder.lineStyle(3, 0xffd700, 1);
        knockBorder.strokeRoundedRect(-154, -19, 308, 38, 19);

        // Progress bar background
        const barBg = this.scene.add.graphics();
        barBg.fillStyle(0x000000, 0.6);
        barBg.fillRoundedRect(-150, -15, 300, 30, 15);

        // Progress bar as Rectangle (not Graphics) to support width animation
        this.knockingBar = this.scene.add.rectangle(-150, 0, 0, 30, 0xffd700)
            .setOrigin(0, 0.5);

        const knockText = this.scene.add.text(0, -35, '🚪 กำลังเคาะประตู...', {
            fontSize: '18px',
            color: '#ffd700',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 3,
            shadow: {
                offsetX: 0,
                offsetY: 0,
                color: '#ffd700',
                blur: 10,
                fill: true
            }
        }).setOrigin(0.5);

        knockingContainer.add([knockGlow, knockBg, barBg, knockBorder, this.knockingBar, knockText]);

        // Pulse animation for glow
        this.scene.tweens.add({
            targets: knockGlow,
            alpha: 0.7,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    updateStatusText(deliveredCount: number, totalHouses: number, currentNight: number): void {
        const remaining = totalHouses - deliveredCount;
        this.statusText?.setText(
            `📦 ส่งแล้ว: ${deliveredCount}/${totalHouses}\n⏳ เหลือ: ${remaining} หลัง`
        );
        this.nightText?.setText(`🌙 คืนที่ ${currentNight}/3`);
    }



    updateTimeText(hours: number, minutes: number): void {
        this.timeText?.setText(
            `⏰ ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
        );
    }

    showPauseMenu(): void {
        const pauseMenu = this.scene.add.container(
            this.width / 2,
            this.height / 2
        )
            .setScrollFactor(0)
            .setDepth(DEPTH.PAUSE_MENU);
        this.pauseMenu = pauseMenu;

        // Background gradient
        const bg = this.scene.add.graphics();
        bg.fillGradientStyle(
            0x0a0a14, 0x0a0a14, 0x141428, 0x141428,
            0.96, 0.96, 0.98, 0.98
        );
        bg.fillRoundedRect(-220, -170, 440, 340, 20);

        // Outer glow layers
        const glow1 = this.scene.add.graphics();
        glow1.lineStyle(6, 0xffd700, 0.4);
        glow1.strokeRoundedRect(-223, -173, 446, 346, 20);

        const glow2 = this.scene.add.graphics();
        glow2.lineStyle(10, 0xffd700, 0.2);
        glow2.strokeRoundedRect(-227, -177, 454, 354, 20);

        // Main border
        const border = this.scene.add.graphics();
        border.lineStyle(3, 0xffd700, 1);
        border.strokeRoundedRect(-220, -170, 440, 340, 20);

        const title = this.scene.add.text(0, -100, '⏸️ หยุดชั่วคราว', {
            fontSize: '36px',
            color: '#ffd700',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4,
            shadow: {
                offsetX: 0,
                offsetY: 0,
                color: '#ffd700',
                blur: 15,
                fill: true
            }
        }).setOrigin(0.5);

        const resume = this.scene.add.text(0, 0, 'กด ESC เพื่อเล่นต่อ', {
            fontSize: '22px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        const quitInfo = this.scene.add.text(0, 70, '(เกมจะหยุดเวลาและฟิสิกส์)', {
            fontSize: '16px',
            color: '#aaaaaa',
            fontStyle: 'italic'
        }).setOrigin(0.5);

        pauseMenu.add([glow2, glow1, bg, border, title, resume, quitInfo]);

        // Pulse animations
        this.scene.tweens.add({
            targets: border,
            alpha: 0.8,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    hidePauseMenu(): void {
        if (this.pauseMenu) {
            this.pauseMenu.destroy();
            this.pauseMenu = null;
        }
    }

    showGameOverScreen(message: string, subtitle: string, titleColor: string = '#ff0000'): { restartBtn: Phaser.GameObjects.Text, menuBtn: Phaser.GameObjects.Text } {
        // Dark gradient overlay
        const bgOverlay = this.scene.add.graphics();
        bgOverlay.fillGradientStyle(
            0x000000, 0x000000, 0x0a0000, 0x0a0000,
            0.85, 0.85, 0.95, 0.95
        );
        bgOverlay.fillRect(0, 0, this.width, this.height);
        bgOverlay.setDepth(DEPTH.PAUSE_MENU);
        bgOverlay.setScrollFactor(0);

        const titleText = this.scene.add.text(this.width / 2, this.height / 2 - 60, message, {
            fontSize: '56px',
            color: titleColor,
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 6,
            shadow: {
                offsetX: 0,
                offsetY: 0,
                color: titleColor,
                blur: 20,
                fill: true
            }
        })
            .setOrigin(0.5)
            .setDepth(DEPTH.PAUSE_MENU + 1)
            .setScrollFactor(0);

        this.scene.add.text(this.width / 2, this.height / 2 + 20, subtitle, {
            fontSize: '24px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3,
            shadow: {
                offsetX: 2,
                offsetY: 2,
                color: '#000000',
                blur: 6,
                fill: true
            }
        })
            .setOrigin(0.5)
            .setDepth(DEPTH.PAUSE_MENU + 1)
            .setScrollFactor(0);

        const restartBtn = this.scene.add.text(
            this.width / 2,
            this.height / 2 + 90,
            '[ คลิกเพื่อเล่นใหม่ ]',
            {
                fontSize: '24px',
                color: '#00ff88',
                fontStyle: 'bold',
                stroke: '#000000',
                strokeThickness: 3,
                shadow: {
                    offsetX: 0,
                    offsetY: 0,
                    color: '#00ff88',
                    blur: 10,
                    fill: true
                }
            }
        )
            .setOrigin(0.5)
            .setDepth(DEPTH.PAUSE_MENU + 1)
            .setScrollFactor(0)
            .setInteractive({ useHandCursor: true });

        const menuBtn = this.scene.add.text(
            this.width / 2,
            this.height / 2 + 140,
            '[ กลับไปเมนูหลัก ]',
            {
                fontSize: '22px',
                color: '#ffd700',
                fontStyle: 'bold',
                stroke: '#000000',
                strokeThickness: 2,
                shadow: {
                    offsetX: 0,
                    offsetY: 0,
                    color: '#ffd700',
                    blur: 8,
                    fill: true
                }
            }
        )
            .setOrigin(0.5)
            .setDepth(DEPTH.PAUSE_MENU + 1)
            .setScrollFactor(0)
            .setInteractive({ useHandCursor: true });

        // Enhanced hover effects with scale
        restartBtn.on('pointerover', () => {
            restartBtn.setStyle({ color: '#88ffcc' });
            this.scene.tweens.add({
                targets: restartBtn,
                scaleX: 1.1,
                scaleY: 1.1,
                duration: 200,
                ease: 'Back.easeOut'
            });
        });
        restartBtn.on('pointerout', () => {
            restartBtn.setStyle({ color: '#00ff88' });
            this.scene.tweens.add({
                targets: restartBtn,
                scaleX: 1.0,
                scaleY: 1.0,
                duration: 200,
                ease: 'Back.easeIn'
            });
        });

        menuBtn.on('pointerover', () => {
            menuBtn.setStyle({ color: '#ffee88' });
            this.scene.tweens.add({
                targets: menuBtn,
                scaleX: 1.1,
                scaleY: 1.1,
                duration: 200,
                ease: 'Back.easeOut'
            });
        });
        menuBtn.on('pointerout', () => {
            menuBtn.setStyle({ color: '#ffd700' });
            this.scene.tweens.add({
                targets: menuBtn,
                scaleX: 1.0,
                scaleY: 1.0,
                duration: 200,
                ease: 'Back.easeIn'
            });
        });

        // Add click sounds
        restartBtn.on('pointerdown', () => this.scene.soundSystem?.playButtonClick());
        menuBtn.on('pointerdown', () => this.scene.soundSystem?.playButtonClick());

        // Title pulse animation
        this.scene.tweens.add({
            targets: titleText,
            scaleX: 1.05,
            scaleY: 1.05,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        return { restartBtn, menuBtn };
    }

    showWinScreen(currentNight: number, hasNextLevel: boolean = false): {
        restartBtn: Phaser.GameObjects.Text,
        menuBtn: Phaser.GameObjects.Text,
        nextLevelBtn?: Phaser.GameObjects.Text
    } {
        // Victory gradient overlay
        const bgOverlay = this.scene.add.graphics();
        bgOverlay.fillGradientStyle(
            0x001410, 0x001410, 0x002820, 0x002820,
            0.85, 0.85, 0.92, 0.92
        );
        bgOverlay.fillRect(0, 0, this.width, this.height);
        bgOverlay.setDepth(DEPTH.PAUSE_MENU);
        bgOverlay.setScrollFactor(0);

        const titleText = this.scene.add.text(
            this.width / 2,
            this.height / 2 - 80,
            '🎉 ภารกิจสำเร็จ! 🎉',
            {
                fontSize: '52px',
                color: '#00ff88',
                fontStyle: 'bold',
                stroke: '#ffffff',
                strokeThickness: 4,
                shadow: {
                    offsetX: 0,
                    offsetY: 0,
                    color: '#00ff88',
                    blur: 25,
                    fill: true
                }
            }
        )
            .setOrigin(0.5)
            .setDepth(DEPTH.PAUSE_MENU + 1)
            .setScrollFactor(0);

        this.scene.add.text(
            this.width / 2,
            this.height / 2,
            `คุณรอดพ้นคืนที่ ${currentNight} แล้ว`,
            {
                fontSize: '26px',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 3,
                shadow: {
                    offsetX: 2,
                    offsetY: 2,
                    color: '#000000',
                    blur: 6,
                    fill: true
                }
            }
        )
            .setOrigin(0.5)
            .setDepth(DEPTH.PAUSE_MENU + 1)
            .setScrollFactor(0);

        let nextLevelBtn: Phaser.GameObjects.Text | undefined;
        let restartY = this.height / 2 + 80;
        let menuY = this.height / 2 + 130;

        // ถ้ามีด่านถัดไป ให้แสดงปุ่มไปต่อ
        if (hasNextLevel) {
            nextLevelBtn = this.scene.add.text(
                this.width / 2,
                this.height / 2 + 60,
                '[ ไปยังคืนถัดไป > ]',
                {
                    fontSize: '28px',
                    color: '#00ffff', // สีฟ้าสว่าง
                    fontStyle: 'bold',
                    stroke: '#000000',
                    strokeThickness: 3,
                    shadow: {
                        offsetX: 0,
                        offsetY: 0,
                        color: '#00ffff',
                        blur: 15,
                        fill: true
                    }
                }
            )
                .setOrigin(0.5)
                .setDepth(DEPTH.PAUSE_MENU + 1)
                .setScrollFactor(0)
                .setInteractive({ useHandCursor: true });

            // เลื่อนปุ่มอื่นลงมา
            restartY += 40;
            menuY += 40;

            // Hover effects for next level button
            nextLevelBtn!.on('pointerover', () => {
                nextLevelBtn!.setStyle({ color: '#ccffff' });
                this.scene.tweens.add({
                    targets: nextLevelBtn,
                    scaleX: 1.1,
                    scaleY: 1.1,
                    duration: 200,
                    ease: 'Back.easeOut'
                });
            });
            nextLevelBtn!.on('pointerout', () => {
                nextLevelBtn!.setStyle({ color: '#00ffff' });
                this.scene.tweens.add({
                    targets: nextLevelBtn,
                    scaleX: 1.0,
                    scaleY: 1.0,
                    duration: 200,
                    ease: 'Back.easeIn'
                });
            });
            nextLevelBtn!.on('pointerdown', () => this.scene.soundSystem?.playButtonClick());
        }

        const restartBtn = this.scene.add.text(
            this.width / 2,
            restartY,
            '[ คลิกเพื่อเล่นใหม่ ]',
            {
                fontSize: '24px',
                color: '#00ff88',
                fontStyle: 'bold',
                stroke: '#000000',
                strokeThickness: 3,
                shadow: {
                    offsetX: 0,
                    offsetY: 0,
                    color: '#00ff88',
                    blur: 10,
                    fill: true
                }
            }
        )
            .setOrigin(0.5)
            .setDepth(DEPTH.PAUSE_MENU + 1)
            .setScrollFactor(0)
            .setInteractive({ useHandCursor: true });

        const menuBtn = this.scene.add.text(
            this.width / 2,
            menuY,
            '[ กลับไปเมนูหลัก ]',
            {
                fontSize: '22px',
                color: '#ffd700',
                fontStyle: 'bold',
                stroke: '#000000',
                strokeThickness: 2,
                shadow: {
                    offsetX: 0,
                    offsetY: 0,
                    color: '#ffd700',
                    blur: 8,
                    fill: true
                }
            }
        )
            .setOrigin(0.5)
            .setDepth(DEPTH.PAUSE_MENU + 1)
            .setScrollFactor(0)
            .setInteractive({ useHandCursor: true });

        // Enhanced hover effects
        restartBtn.on('pointerover', () => {
            restartBtn.setStyle({ color: '#88ffcc' });
            this.scene.tweens.add({
                targets: restartBtn,
                scaleX: 1.1,
                scaleY: 1.1,
                duration: 200,
                ease: 'Back.easeOut'
            });
        });
        restartBtn.on('pointerout', () => {
            restartBtn.setStyle({ color: '#00ff88' });
            this.scene.tweens.add({
                targets: restartBtn,
                scaleX: 1.0,
                scaleY: 1.0,
                duration: 200,
                ease: 'Back.easeIn'
            });
        });

        menuBtn.on('pointerover', () => {
            menuBtn.setStyle({ color: '#ffee88' });
            this.scene.tweens.add({
                targets: menuBtn,
                scaleX: 1.1,
                scaleY: 1.1,
                duration: 200,
                ease: 'Back.easeOut'
            });
        });
        menuBtn.on('pointerout', () => {
            menuBtn.setStyle({ color: '#ffd700' });
            this.scene.tweens.add({
                targets: menuBtn,
                scaleX: 1.0,
                scaleY: 1.0,
                duration: 200,
                ease: 'Back.easeIn'
            });
        });

        // Add click sounds
        restartBtn.on('pointerdown', () => this.scene.soundSystem?.playButtonClick());
        menuBtn.on('pointerdown', () => this.scene.soundSystem?.playButtonClick());

        // Celebration animations
        this.scene.tweens.add({
            targets: titleText,
            scaleX: 1.08,
            scaleY: 1.08,
            duration: 1200,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        return { restartBtn, menuBtn, nextLevelBtn };
    }

    showGameCompleteScreen(): { restartBtn: Phaser.GameObjects.Text, menuBtn: Phaser.GameObjects.Text } {
        // Final Victory gradient overlay (Gold/Platinum theme)
        const bgOverlay = this.scene.add.graphics();
        bgOverlay.fillGradientStyle(
            0x2a2a00, 0x2a2a00, 0x000000, 0x000000,
            0.9, 0.9, 0.95, 0.95
        );
        bgOverlay.fillRect(0, 0, this.width, this.height);
        bgOverlay.setDepth(DEPTH.PAUSE_MENU);
        bgOverlay.setScrollFactor(0);

        // Particle effects for celebration (if possible, simple circles)
        for (let i = 0; i < 50; i++) {
            const x = Phaser.Math.Between(0, this.width);
            const y = Phaser.Math.Between(0, this.height);
            const size = Phaser.Math.Between(2, 6);
            const circle = this.scene.add.circle(x, y, size, 0xffd700, Phaser.Math.FloatBetween(0.3, 0.7));
            circle.setDepth(DEPTH.PAUSE_MENU);
            circle.setScrollFactor(0);

            this.scene.tweens.add({
                targets: circle,
                y: y - 100,
                alpha: 0,
                duration: Phaser.Math.Between(2000, 4000),
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }

        const titleText = this.scene.add.text(
            this.width / 2,
            this.height / 2 - 80,
            '🏆 ยินดีด้วย! 🏆',
            {
                fontSize: '64px',
                color: '#ffd700',
                fontStyle: 'bold',
                stroke: '#ffffff',
                strokeThickness: 4,
                shadow: {
                    offsetX: 0,
                    offsetY: 0,
                    color: '#ffd700',
                    blur: 30,
                    fill: true
                }
            }
        )
            .setOrigin(0.5)
            .setDepth(DEPTH.PAUSE_MENU + 1)
            .setScrollFactor(0);

        this.scene.add.text(
            this.width / 2,
            this.height / 2 + 10,
            'คุณรอดชีวิตครบทุกคืนแล้ว',
            {
                fontSize: '32px',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 3,
                shadow: {
                    offsetX: 2,
                    offsetY: 2,
                    color: '#000000',
                    blur: 6,
                    fill: true
                }
            }
        )
            .setOrigin(0.5)
            .setDepth(DEPTH.PAUSE_MENU + 1)
            .setScrollFactor(0);

        const restartBtn = this.scene.add.text(
            this.width / 2,
            this.height / 2 + 100,
            '[ เล่นใหม่อีกครั้ง ]',
            {
                fontSize: '28px',
                color: '#00ff88',
                fontStyle: 'bold',
                stroke: '#000000',
                strokeThickness: 3,
                shadow: {
                    offsetX: 0,
                    offsetY: 0,
                    color: '#00ff88',
                    blur: 10,
                    fill: true
                }
            }
        )
            .setOrigin(0.5)
            .setDepth(DEPTH.PAUSE_MENU + 1)
            .setScrollFactor(0)
            .setInteractive({ useHandCursor: true });

        const menuBtn = this.scene.add.text(
            this.width / 2,
            this.height / 2 + 160,
            '[ กลับไปเมนูหลัก ]',
            {
                fontSize: '24px',
                color: '#ffd700',
                fontStyle: 'bold',
                stroke: '#000000',
                strokeThickness: 2,
                shadow: {
                    offsetX: 0,
                    offsetY: 0,
                    color: '#ffd700',
                    blur: 8,
                    fill: true
                }
            }
        )
            .setOrigin(0.5)
            .setDepth(DEPTH.PAUSE_MENU + 1)
            .setScrollFactor(0)
            .setInteractive({ useHandCursor: true });

        // Enhanced hover effects
        restartBtn.on('pointerover', () => {
            restartBtn.setStyle({ color: '#88ffcc' });
            this.scene.tweens.add({
                targets: restartBtn,
                scaleX: 1.1,
                scaleY: 1.1,
                duration: 200,
                ease: 'Back.easeOut'
            });
        });
        restartBtn.on('pointerout', () => {
            restartBtn.setStyle({ color: '#00ff88' });
            this.scene.tweens.add({
                targets: restartBtn,
                scaleX: 1.0,
                scaleY: 1.0,
                duration: 200,
                ease: 'Back.easeIn'
            });
        });

        menuBtn.on('pointerover', () => {
            menuBtn.setStyle({ color: '#ffee88' });
            this.scene.tweens.add({
                targets: menuBtn,
                scaleX: 1.1,
                scaleY: 1.1,
                duration: 200,
                ease: 'Back.easeOut'
            });
        });
        menuBtn.on('pointerout', () => {
            menuBtn.setStyle({ color: '#ffd700' });
            this.scene.tweens.add({
                targets: menuBtn,
                scaleX: 1.0,
                scaleY: 1.0,
                duration: 200,
                ease: 'Back.easeIn'
            });
        });

        // Add click sounds
        restartBtn.on('pointerdown', () => this.scene.soundSystem?.playButtonClick());
        menuBtn.on('pointerdown', () => this.scene.soundSystem?.playButtonClick());

        // Celebration animations (Title Scaling)
        this.scene.tweens.add({
            targets: titleText,
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        return { restartBtn, menuBtn };
    }
}

