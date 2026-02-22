// ==========================================
// Enemy.ts - คลาสเอนทิตีศัตรูพร้อมระบบ AI State Machine
// ==========================================

import * as Phaser from 'phaser';
import { ENEMY } from '../config/Constants';

enum EnemyState {
    IDLE = 0,   // ยืนเฉยๆ
    PATROL = 1, // เดินลาดตระเวน
    CHASE = 2,  // ไล่ล่าผู้เล่น
    RETURN = 3  // กลับจุดเริ่มต้น
}

export class Enemy {
    scene: Phaser.Scene;
    sprite: Phaser.Physics.Arcade.Sprite;
    currentState: EnemyState;
    startPos: Phaser.Math.Vector2;
    patrolTarget: { x: number; y: number } | null;
    patrolRadius: number;
    waitTime: number;
    target: any;
    texturePrefix: string;

    constructor(scene: Phaser.Scene, x: number, y: number, texturePrefix: string = 'ghost') {
        this.scene = scene;
        this.texturePrefix = texturePrefix;
        this.sprite = scene.physics.add.sprite(x, y, `${this.texturePrefix}_front`);
        this.sprite.setDisplaySize(64, 64);
        this.sprite.body!.setSize(
            ENEMY.COLLISION_WIDTH,
            ENEMY.COLLISION_HEIGHT
        );

        this.currentState = EnemyState.PATROL;
        this.startPos = new Phaser.Math.Vector2(x, y);
        this.patrolTarget = null;
        this.patrolRadius = 150; // รัศมีลาดตระเวนรอบจุดเริ่มต้น
        this.waitTime = 0;
        this.target = null;
    }

    update(playerPosition: { x: number; y: number }, enemySpeed: number, playerRotation: number): void {
        if (!this.sprite.body) return;

        const distToPlayer = Phaser.Math.Distance.Between(
            this.sprite.x,
            this.sprite.y,
            playerPosition.x,
            playerPosition.y
        );

        // Check if exposed to flashlight
        if (this.isExposedToFlashlight(distToPlayer, playerPosition, playerRotation)) {
            this.currentState = EnemyState.CHASE;
            // Increase speed significantly when spotted
            enemySpeed *= 1.8;
        }

        // ตรรกะ State Machine
        switch (this.currentState) {
            case EnemyState.PATROL:
                this.handlePatrolState(distToPlayer, playerPosition, enemySpeed);
                break;

            case EnemyState.CHASE:
                this.handleChaseState(distToPlayer, playerPosition, enemySpeed);
                break;

            case EnemyState.RETURN:
                this.handleReturnState(distToPlayer, playerPosition, enemySpeed);
                break;

            case EnemyState.IDLE:
                this.handleIdleState(distToPlayer, playerPosition);
                break;
        }

        // แอนิเมชัน / ภาพ
        this.updateAnimation();
    }

    private isExposedToFlashlight(dist: number, playerPos: { x: number, y: number }, playerRot: number): boolean {
        // 1. Check distance (Flashlight radius is approx 400)
        if (dist > 400) return false;

        // 2. Check angle
        const angleToEnemy = Phaser.Math.Angle.Between(
            playerPos.x,
            playerPos.y,
            this.sprite.x,
            this.sprite.y
        );

        // Normalize angles to -PI to PI
        let diff = angleToEnemy - playerRot;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;

        // Flashlight field of view is approx +/- 40 degrees (0.7 radians)
        return Math.abs(diff) < 0.7;
    }

    private handlePatrolState(distToPlayer: number, _playerPosition: any, speed: number): void {
        // เปลี่ยนเป็นสถานะไล่ล่า
        if (distToPlayer < ENEMY.DETECTION_RANGE) {
            this.currentState = EnemyState.CHASE;
            return;
        }

        // เลือกจุดใหม่แบบสุ่มหากไม่มีเป้าหมาย
        if (!this.patrolTarget) {
            this.patrolTarget = this.getRandomPatrolPoint();
        }

        // เดินไปยังเป้าหมาย
        this.scene.physics.moveToObject(this.sprite, this.patrolTarget, speed * 0.5); // ความเร็วลาดตระเวนจะช้ากว่าปกติ

        // ตรวจสอบว่าถึงเป้าหมายหรือยัง
        const dist = Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, this.patrolTarget.x, this.patrolTarget.y);
        if (dist < 10) {
            (this.sprite.body as Phaser.Physics.Arcade.Body).setVelocity(0);
            this.patrolTarget = null;
            this.currentState = EnemyState.IDLE;
            this.waitTime = this.scene.time.now + 2000; // รอ 2 วินาที
        }
    }

    private handleIdleState(distToPlayer: number, _playerPosition: any): void {
        if (distToPlayer < ENEMY.DETECTION_RANGE) {
            this.currentState = EnemyState.CHASE;
            return;
        }

        if (this.scene.time.now > this.waitTime) {
            this.currentState = EnemyState.PATROL;
        }
    }

    private handleChaseState(distToPlayer: number, playerPosition: any, speed: number): void {
        if (distToPlayer > ENEMY.DETECTION_RANGE * 1.5) {
            // คลาดกับผู้เล่น
            this.currentState = EnemyState.RETURN;
            this.patrolTarget = { x: this.startPos.x, y: this.startPos.y }; // กลับไปจุดเริ่มต้น
            return;
        }

        // ไล่ล่าผู้เล่น
        this.scene.physics.moveToObject(this.sprite, playerPosition, speed);
    }

    private handleReturnState(distToPlayer: number, _playerPosition: any, speed: number): void {
        if (distToPlayer < ENEMY.DETECTION_RANGE) {
            this.currentState = EnemyState.CHASE;
            return;
        }

        // เดินกลับไปจุดเริ่มต้น
        this.scene.physics.moveToObject(this.sprite, this.startPos, speed * 0.7);

        const dist = Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, this.startPos.x, this.startPos.y);
        if (dist < 10) {
            (this.sprite.body as Phaser.Physics.Arcade.Body).setVelocity(0);
            this.currentState = EnemyState.PATROL; // กลับไปลาดตระเวน
        }
    }

    private getRandomPatrolPoint(): { x: number; y: number } {
        const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
        const distance = Phaser.Math.FloatBetween(50, this.patrolRadius);
        const x = this.startPos.x + Math.cos(angle) * distance;
        const y = this.startPos.y + Math.sin(angle) * distance;
        return { x, y };
    }

    private updateAnimation(): void {
        const velocity = (this.sprite.body as Phaser.Physics.Arcade.Body).velocity;

        if (velocity.length() > 5) {
            if (velocity.y < -20) {
                this.sprite.setTexture(`${this.texturePrefix}_back`);
            } else if (velocity.y > 20) {
                this.sprite.setTexture(`${this.texturePrefix}_front`);
            }

            if (Math.abs(velocity.x) > 20) {
                this.sprite.setFlipX(velocity.x < 0);
            }
        }
    }
}
