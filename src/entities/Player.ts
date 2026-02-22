// ==========================================
// Player.ts - คลาสเอนทิตีผู้เล่น
// ==========================================

import * as Phaser from 'phaser';
import { PLAYER } from '../config/Constants';

export class Player {
    scene: Phaser.Scene;
    sprite: Phaser.Physics.Arcade.Sprite;
    maxStamina: number;
    currentStamina: number;
    canRun: boolean;
    speed: number;
    sprintSpeed: number;
    facingAngle: number;
    staminaBar: Phaser.GameObjects.Graphics;
    inventory: string[];

    constructor(scene: Phaser.Scene, x: number, y: number) {
        this.scene = scene;
        this.sprite = scene.physics.add.sprite(x, y, 'player_front');
        this.sprite.setDisplaySize(60, 90); // เดิม 40, 60 (1.5x)
        this.sprite.body!.setSize(
            PLAYER.COLLISION_WIDTH,
            PLAYER.COLLISION_HEIGHT
        );
        this.sprite.setCollideWorldBounds(true);

        // ค่าพลังงาน (Stamina)
        this.maxStamina = PLAYER.STAMINA_MAX;
        this.currentStamina = this.maxStamina;
        this.canRun = true;

        // การเคลื่อนที่
        this.speed = PLAYER.SPEED;
        this.sprintSpeed = PLAYER.SPRINT_SPEED;
        this.facingAngle = Math.PI / 2; // ค่าเริ่มต้นหันหน้าลง (90 องศา)

        // Stamina Bar
        this.staminaBar = scene.add.graphics();
        this.staminaBar.setDepth(110); // Above darkness (100)

        // ช่องเก็บของ - เก็บ item ที่ต้องส่ง
        this.inventory = [];
    }

    // เพิ่มไอเท็มเข้าช่องเก็บของ
    addItem(itemType: string): void {
        this.inventory.push(itemType);
    }

    // เช็คว่ามีไอเท็มนี้หรือไม่
    hasItem(itemType: string): boolean {
        return this.inventory.includes(itemType);
    }

    // ลบไอเท็มออกจากช่องเก็บของ
    removeItem(itemType: string): boolean {
        const index = this.inventory.indexOf(itemType);
        if (index > -1) {
            this.inventory.splice(index, 1);
            return true;
        }
        return false;
    }

    // ดูช่องเก็บของทั้งหมด
    getInventory(): string[] {
        return this.inventory.slice(); // ส่งคืนสำเนาข้อมูล
    }

    update(keys: Phaser.Types.Input.Keyboard.CursorKeys & {
        W: Phaser.Input.Keyboard.Key;
        A: Phaser.Input.Keyboard.Key;
        S: Phaser.Input.Keyboard.Key;
        D: Phaser.Input.Keyboard.Key;
        SHIFT: Phaser.Input.Keyboard.Key;
    }): void {
        // อัปเดตค่าพลังงาน
        this.handleStamina(keys);

        // อัปเดตการเคลื่อนที่
        this.handleMovement(keys);

        // Draw Stamina Bar
        this.drawStaminaBar();
    }

    private drawStaminaBar(): void {
        this.staminaBar.clear();

        // Stamina percentage
        const percent = this.currentStamina / this.maxStamina;

        // Hide if full (optional - user requested "under feet", implies visibility. But typically hidden if full is cleaner. 
        // User said "easily see your running energy", so maybe always show or show when not full. 
        // Let's always show for now as per "Add a visual stamina indicator" request without "auto-hide" constraint, 
        // but maybe fade it out if full? Let's keep it simple first.)

        const width = 40;
        const height = 6;
        const x = this.sprite.x - width / 2;
        const y = this.sprite.y + this.sprite.displayHeight / 2 + 5; // Under feet

        // Background
        this.staminaBar.fillStyle(0x000000, 0.6);
        this.staminaBar.fillRect(x, y, width, height);

        // Bar Color
        let color = 0x00ff00; // Green
        if (percent < 0.3) {
            color = 0xff0000; // Red
        } else if (percent < 0.6) {
            color = 0xffff00; // Yellow
        }

        // Foreground
        this.staminaBar.fillStyle(color, 1);
        this.staminaBar.fillRect(x + 1, y + 1, (width - 2) * percent, height - 2);
    }

    private handleStamina(keys: any): void {
        const isMoving = keys.W.isDown || keys.A.isDown || keys.S.isDown || keys.D.isDown;

        if (keys.SHIFT.isDown && this.canRun && isMoving) {
            // ลดพลังงาน - หารด้วย 60 เพื่อแปลงจาก per-second เป็น per-frame (60 FPS)
            this.currentStamina -= PLAYER.STAMINA_DRAIN_RATE / 60;
            if (this.currentStamina <= 0) {
                this.currentStamina = 0;
                this.canRun = false;
            }
        } else {
            if (this.currentStamina < this.maxStamina) {
                const recoveryRate = isMoving
                    ? PLAYER.RECOVERY_MOVING
                    : PLAYER.RECOVERY_IDLE;
                // ฟื้นฟูพลังงาน - ใช้ค่าโดยตรงเพราะเป็นค่าที่เล็กอยู่แล้ว
                this.currentStamina += recoveryRate;
                if (this.currentStamina >= PLAYER.MIN_TO_RUN && !this.canRun) {
                    this.canRun = true;
                }
            }
        }

        this.currentStamina = Phaser.Math.Clamp(this.currentStamina, 0, this.maxStamina);
    }

    private handleMovement(keys: any): void {
        let velocityX = 0;
        let velocityY = 0;

        const isShiftPressed = keys.SHIFT.isDown;
        const canRun = this.canRun;

        const currentSpeed = (isShiftPressed && canRun)
            ? this.sprintSpeed
            : this.speed;

        if (keys.A.isDown) velocityX = -currentSpeed;
        if (keys.D.isDown) velocityX = currentSpeed;
        if (keys.W.isDown) velocityY = -currentSpeed;
        if (keys.S.isDown) velocityY = currentSpeed;

        // คำนวณมุมที่หันถ้ามีการเคลื่อนที่
        if (velocityX !== 0 || velocityY !== 0) {
            this.facingAngle = Math.atan2(velocityY, velocityX);
        }

        // ปรับความเร็วในการเดินเฉียง (normalization)
        if (velocityX !== 0 && velocityY !== 0) {
            velocityX *= 0.707;
            velocityY *= 0.707;
        }

        this.sprite.setVelocity(velocityX, velocityY);

        // อัปเดต Texture ของตัวละครตามทิศทาง
        if (velocityY < 0) {
            this.sprite.setTexture('player_back');
        } else if (velocityY > 0) {
            this.sprite.setTexture('player_front');
        }

        if (velocityX !== 0) {
            if (velocityY === 0) this.sprite.setTexture('player_front');
            this.sprite.setFlipX(velocityX < 0);
        }
    }

    stop(): void {
        this.sprite.setVelocity(0);
    }

    getPosition(): { x: number; y: number } {
        return { x: this.sprite.x, y: this.sprite.y };
    }

    getRotation(): number {
        return this.facingAngle;
    }

    getStaminaPercent(): number {
        return this.currentStamina / this.maxStamina;
    }

    destroy(): void {
        if (this.staminaBar) {
            this.staminaBar.destroy();
        }
        // Sprite is usually destroyed by the scene/physics, but good practice if needed
    }
}
