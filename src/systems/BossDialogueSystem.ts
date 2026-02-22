// ==========================================
// BossDialogueSystem.ts - ระบบสนทนาของบอส (The Postmaster)
// วิทยุมอบหมายภารกิจ, เตือนภัย, กฎการเอาชีวิตรอด
// ==========================================

import * as Phaser from 'phaser';
import { DEPTH } from '../config/Constants';

// บทสนทนาแต่ละข้อความ
interface DialogueLine {
    speaker: string;
    text: string;
    color?: string;
}

// ข้อมูลบทสนทนาแต่ละคืน
interface NightDialogue {
    briefing: DialogueLine[];    // ข้อความเริ่มต้นเมื่อเริ่มคืน
    interaction: DialogueLine[]; // เมื่อเดินไปคุย
    warning: DialogueLine[];     // เตือนภัยในเกม
}

// ===========================================
// บทสนทนาของบอสตามคืน
// ===========================================
const BOSS_DIALOGUES: Record<number, NightDialogue> = {
    1: {
        briefing: [
            { speaker: '📻 วิทยุ', text: '... ซ่า ... ซ่า ... ได้ยินไหม? ...', color: '#88ff88' },
            { speaker: '🦉 บอส', text: 'เฮ้! ได้ยินดีมั้ย? นี่บอส... ผู้จัดการไปรษณีย์ของนาย' },
            { speaker: '🦉 บอส', text: 'คืนนี้มีพัสดุ 3 กล่องต้องส่ง ง่ายๆ... อย่าทำพัง' },
            { speaker: '🦉 บอส', text: 'กฎมีอยู่ข้อเดียว: อย่าให้ "พวกมัน" จับได้...' },
            { speaker: '🦉 บอส', text: 'ใช้ไฟฉายให้ดี แต่อย่าลืมว่าแสงดึงดูดพวกมัน' },
            { speaker: '🦉 บอส', text: 'ขอให้โชคดี... นายจะต้องมัน...', color: '#ffaa00' },
        ],
        interaction: [
            { speaker: '🦉 บอส', text: 'ยังไม่ส่งเสร็จเหรอ? เร็วๆ หน่อย!' },
            { speaker: '🦉 บอส', text: 'ฟังนะ จำไว้ว่า... กด F ที่หน้าบ้านเพื่อส่งพัสดุ' },
            { speaker: '🦉 บอส', text: 'อย่าวิ่งตลอดนะ ดูแถบพลังงานใต้เท้าให้ดี' },
            { speaker: '🦉 บอส', text: 'ไป! อย่ามัวมายืนคุยกับข้า!', color: '#ffaa00' },
        ],
        warning: [
            { speaker: '📻 วิทยุ', text: '... ซ่า ... ระวัง! มีอะไรเคลื่อนไหวใกล้นาย!', color: '#ff4444' },
        ]
    },
    2: {
        briefing: [
            { speaker: '📻 วิทยุ', text: '... ซ่า ... นาย ... คืนนี้มันจะหนักกว่าเดิม ...', color: '#88ff88' },
            { speaker: '🦉 บอส', text: 'คืนที่ 2 แล้ว... พัสดุ 4 กล่อง' },
            { speaker: '🦉 บอส', text: '"พวกมัน" เริ่มคุ้นเคยกับเส้นทางของนายแล้ว...' },
            { speaker: '🦉 บอส', text: 'คืนนี้มีของเพิ่มขึ้น... แต่เวลาน้อยลง' },
            { speaker: '🦉 บอส', text: 'ข้าเคยเห็นคนส่งของคนก่อน... เขาไม่ได้กลับมา', color: '#ff6666' },
            { speaker: '🦉 บอส', text: 'แต่นายไม่เหมือนเขา... ใช่มั้ย?', color: '#ffaa00' },
        ],
        interaction: [
            { speaker: '🦉 บอส', text: 'นายยังอยู่ได้ดีนี่... ข้าประทับใจ' },
            { speaker: '🦉 บอส', text: 'เคล็ดลับ: "พวกมัน" กลัวแสง แต่ก็ดึงดูดด้วย' },
            { speaker: '🦉 บอส', text: 'ถ้าได้ยินเสียงฝีเท้า... วิ่งไปทางตรงข้าม' },
            { speaker: '🦉 บอส', text: 'ลุยเลย ข้ารอข่าวดีจากนาย!', color: '#ffaa00' },
        ],
        warning: [
            { speaker: '📻 วิทยุ', text: '... ซ่า ... พวกมันมาเยอะขึ้น! ระวังตัวด้วย!', color: '#ff4444' },
        ]
    },
    3: {
        briefing: [
            { speaker: '📻 วิทยุ', text: '... ซ่า ... ซ่า ... สัญญาณไม่ดี ...', color: '#88ff88' },
            { speaker: '🦉 บอส', text: '... คืนสุดท้าย ... พัสดุ 5 กล่อง ...', color: '#ff8800' },
            { speaker: '🦉 บอส', text: 'ข้าจะพูดตรงๆ... คืนนี้อันตรายที่สุด' },
            { speaker: '🦉 บอส', text: '"พวกมัน" ออกหากินเต็มที่ เร็วขึ้น ฉลาดขึ้น' },
            { speaker: '🦉 บอส', text: 'แต่ถ้านายผ่านคืนนี้ไปได้...' },
            { speaker: '🦉 บอส', text: '...ข้าจะเล่าความจริงทั้งหมดของหมู่บ้านนี้ให้ฟัง', color: '#ffdd00' },
            { speaker: '🦉 บอส', text: 'ขอให้นายรอดกลับมา... ข้ารอนายอยู่', color: '#ffaa00' },
        ],
        interaction: [
            { speaker: '🦉 บอส', text: '... นาย ... นายข้ามมาไกลแล้ว' },
            { speaker: '🦉 บอส', text: 'ฟังให้ดี: อย่าหยุด อย่าเหลียวหลัง' },
            { speaker: '🦉 บอส', text: 'ถ้าได้ยินเสียงหายใจ... นั่นไม่ใช่ของนาย', color: '#ff6666' },
            { speaker: '🦉 บอส', text: 'ส่งให้หมด แล้วกลับมาหาข้า!', color: '#ffaa00' },
        ],
        warning: [
            { speaker: '📻 วิทยุ', text: '... ซ่า ... พวกมันรู้ว่านายอยู่ที่ไหน! หนีเร็ว!', color: '#ff0000' },
        ]
    }
};

export class BossDialogueSystem {
    private scene: Phaser.Scene;
    private dialogueContainer: Phaser.GameObjects.Container | null = null;
    private currentLines: DialogueLine[] = [];
    private currentLineIndex: number = 0;
    private isShowing: boolean = false;
    private onCompleteCallback: (() => void) | null = null;

    // UI elements
    private dialogueBg: Phaser.GameObjects.Rectangle | null = null;
    private speakerText: Phaser.GameObjects.Text | null = null;
    private messageText: Phaser.GameObjects.Text | null = null;
    private continueText: Phaser.GameObjects.Text | null = null;
    private portraitBorder: Phaser.GameObjects.Rectangle | null = null;
    private portraitImage: Phaser.GameObjects.Sprite | null = null;
    private scanlineOverlay: Phaser.GameObjects.Rectangle | null = null;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
    }

    /**
     * แสดง briefing เริ่มต้น (เมื่อเริ่มคืนใหม่)
     */
    showBriefing(night: number, onComplete?: () => void): void {
        const dialogue = BOSS_DIALOGUES[night] || BOSS_DIALOGUES[1];
        this.showDialogueSequence(dialogue.briefing, onComplete);
    }

    /**
     * แสดงบทสนทนาเมื่อผู้เล่นเข้าไปคุย
     */
    showInteraction(night: number, onComplete?: () => void): void {
        const dialogue = BOSS_DIALOGUES[night] || BOSS_DIALOGUES[1];
        this.showDialogueSequence(dialogue.interaction, onComplete);
    }

    /**
     * ข้อความเตือนภัย (แบบสั้น)
     */
    showWarning(night: number): void {
        const dialogue = BOSS_DIALOGUES[night] || BOSS_DIALOGUES[1];
        if (dialogue.warning.length > 0) {
            this.showQuickMessage(dialogue.warning[0]);
        }
    }

    /**
     * สถานะการแสดงผล
     */
    getIsShowing(): boolean {
        return this.isShowing;
    }

    // =========================================
    // ส่วน Internal
    // =========================================

    private showDialogueSequence(lines: DialogueLine[], onComplete?: () => void): void {
        if (this.isShowing) return;

        this.isShowing = true;
        this.currentLines = lines;
        this.currentLineIndex = 0;
        this.onCompleteCallback = onComplete || null;

        this.createDialogueUI();
        this.showCurrentLine();
    }

    private createDialogueUI(): void {
        const { width, height } = this.scene.scale;

        // Container หลัก (fixed to camera)
        this.dialogueContainer = this.scene.add.container(0, 0)
            .setScrollFactor(0)
            .setDepth(DEPTH.OVERLAY + 50);

        // พื้นหลังมืดทั้งจอ
        const overlay = this.scene.add.rectangle(
            width / 2, height / 2, width, height, 0x000000, 0.6
        );

        // กล่องสนทนาสไตล์ radio/walkie-talkie
        const boxW = Math.min(700, width - 40);
        const boxH = 200;
        const boxX = width / 2;
        const boxY = height - boxH / 2 - 30;

        // กรอบด้านนอก (เหมือนเครื่องรับวิทยุ)
        const outerBorder = this.scene.add.rectangle(boxX, boxY, boxW + 6, boxH + 6, 0x664400, 0.9);

        // พื้นหลังกล่อง
        this.dialogueBg = this.scene.add.rectangle(boxX, boxY, boxW, boxH, 0x0a0a0a, 0.95)
            .setStrokeStyle(2, 0x886633);

        // Scanline effect (เส้นแนวนอนจางๆ)
        this.scanlineOverlay = this.scene.add.rectangle(boxX, boxY, boxW, boxH, 0x00ff00, 0.02);

        // รูป Portrait ของบอส
        const portraitSize = 80;
        const portraitX = boxX - boxW / 2 + 60;
        const portraitY = boxY;

        this.portraitBorder = this.scene.add.rectangle(
            portraitX, portraitY, portraitSize + 6, portraitSize + 6, 0x886633
        );

        this.portraitImage = this.scene.add.sprite(portraitX, portraitY, 'boss_npc')
            .setDisplaySize(portraitSize, portraitSize);

        // ชื่อผู้พูด
        this.speakerText = this.scene.add.text(
            portraitX + portraitSize / 2 + 20,
            boxY - boxH / 2 + 20,
            '', {
            fontSize: '18px',
            color: '#ffcc00',
            stroke: '#000000',
            strokeThickness: 3,
            fontStyle: 'bold'
        }
        );

        // ข้อความหลัก
        this.messageText = this.scene.add.text(
            portraitX + portraitSize / 2 + 20,
            boxY - 15,
            '', {
            fontSize: '20px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2,
            wordWrap: { width: boxW - portraitSize - 100 },
            lineSpacing: 6
        }
        );

        // ข้อความ "กดเพื่อดำเนินต่อ"
        this.continueText = this.scene.add.text(
            boxX + boxW / 2 - 20,
            boxY + boxH / 2 - 20,
            '▶ คุยกันต่อหน้ามอบพัสดุให้ไปส่ง', {
            fontSize: '14px',
            color: '#888888',
            fontStyle: 'italic'
        }
        ).setOrigin(1, 1);

        // Blink animation สำหรับ continue text
        this.scene.tweens.add({
            targets: this.continueText,
            alpha: { from: 0.4, to: 1 },
            duration: 600,
            yoyo: true,
            repeat: -1
        });

        // สัญญาณ radio indicator (มุมซ้ายบน)
        const radioIndicator = this.scene.add.text(
            boxX - boxW / 2 + 10,
            boxY - boxH / 2 + 5,
            '📻 RADIO', {
            fontSize: '12px',
            color: '#00ff00'
        }
        );

        // Red recording dot
        const recDot = this.scene.add.circle(
            boxX + boxW / 2 - 20,
            boxY - boxH / 2 + 12,
            5, 0xff0000
        );
        this.scene.tweens.add({
            targets: recDot,
            alpha: { from: 0.3, to: 1 },
            duration: 500,
            yoyo: true,
            repeat: -1
        });

        // เพิ่มทุกอย่างใน container
        this.dialogueContainer.add([
            overlay, outerBorder, this.dialogueBg, this.scanlineOverlay,
            this.portraitBorder, this.portraitImage,
            this.speakerText, this.messageText, this.continueText,
            radioIndicator, recDot
        ]);

        // Scanline animation
        this.scene.tweens.add({
            targets: this.scanlineOverlay,
            alpha: { from: 0.01, to: 0.04 },
            duration: 300,
            yoyo: true,
            repeat: -1
        });

        // เปิดการรับ input (คลิกหรือกด Space/Enter)
        this.scene.input.keyboard!.once('keydown-SPACE', () => this.advanceLine());
        this.scene.input.keyboard!.once('keydown-ENTER', () => this.advanceLine());
        this.scene.input.keyboard!.once('keydown-F', () => this.advanceLine());
        overlay.setInteractive().once('pointerdown', () => this.advanceLine());

        // Entrance animation
        this.dialogueContainer.setAlpha(0);
        this.scene.tweens.add({
            targets: this.dialogueContainer,
            alpha: 1,
            duration: 300,
            ease: 'Power2'
        });
    }

    private showCurrentLine(): void {
        if (this.currentLineIndex >= this.currentLines.length) {
            this.closeDialogue();
            return;
        }

        const line = this.currentLines[this.currentLineIndex];

        if (this.speakerText) {
            this.speakerText.setText(line.speaker);
        }

        if (this.messageText) {
            this.messageText.setText(line.text);
            if (line.color) {
                this.messageText.setColor(line.color);
            } else {
                this.messageText.setColor('#ffffff');
            }
        }

        // Glitch effect เล็กน้อย
        if (this.dialogueContainer) {
            this.scene.tweens.add({
                targets: this.dialogueContainer,
                x: { from: -2, to: 0 },
                duration: 50,
                ease: 'Linear'
            });
        }
    }

    private advanceLine(): void {
        if (!this.isShowing) return;

        this.currentLineIndex++;

        if (this.currentLineIndex >= this.currentLines.length) {
            this.closeDialogue();
            return;
        }

        this.showCurrentLine();

        // Re-bind input
        this.scene.input.keyboard!.once('keydown-SPACE', () => this.advanceLine());
        this.scene.input.keyboard!.once('keydown-ENTER', () => this.advanceLine());
        this.scene.input.keyboard!.once('keydown-F', () => this.advanceLine());

        // Re-bind click on overlay (first child of container)
        if (this.dialogueContainer && this.dialogueContainer.list[0]) {
            (this.dialogueContainer.list[0] as Phaser.GameObjects.Rectangle)
                .once('pointerdown', () => this.advanceLine());
        }
    }

    private closeDialogue(): void {
        if (this.dialogueContainer) {
            this.scene.tweens.add({
                targets: this.dialogueContainer,
                alpha: 0,
                duration: 200,
                onComplete: () => {
                    this.dialogueContainer?.destroy();
                    this.dialogueContainer = null;
                    this.isShowing = false;

                    if (this.onCompleteCallback) {
                        this.onCompleteCallback();
                        this.onCompleteCallback = null;
                    }
                }
            });
        }
    }

    /**
     * ข้อความเตือนแบบสั้น (ไม่ต้อง interact)
     */
    private showQuickMessage(line: DialogueLine): void {
        const { width } = this.scene.scale;

        const msgContainer = this.scene.add.container(width / 2, 60)
            .setScrollFactor(0)
            .setDepth(DEPTH.OVERLAY + 30);

        const bg = this.scene.add.rectangle(0, 0, 500, 50, 0x0a0a0a, 0.9)
            .setStrokeStyle(2, 0xff4444);

        const text = this.scene.add.text(0, 0,
            `${line.speaker}: ${line.text}`, {
            fontSize: '16px',
            color: line.color || '#ff4444',
            stroke: '#000000',
            strokeThickness: 3,
            fontStyle: 'bold'
        }
        ).setOrigin(0.5);

        msgContainer.add([bg, text]);

        // Auto-dismiss
        this.scene.tweens.add({
            targets: msgContainer,
            alpha: { from: 1, to: 0 },
            y: 30,
            duration: 4000,
            delay: 2000,
            onComplete: () => msgContainer.destroy()
        });
    }
}
