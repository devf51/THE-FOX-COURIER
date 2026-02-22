// ==========================================
// GameScene.ts - ฉากหลักของเกม
// ==========================================

import * as Phaser from 'phaser';

// การตั้งค่าและชนิดข้อมูล
import { DEPTH, GAME, SOUND as SOUND_CONFIG } from '../config/Constants';

import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { BossNPC } from '../entities/BossNPC';

import { MapSystem, MapAssets } from '../systems/MapSystem';
import { NightSystem } from '../systems/NightSystem';
import { FlashlightSystem } from '../systems/FlashlightSystem';
import { UISystem } from '../systems/UISystem';
import { DialogueSystem } from '../systems/DialogueSystem';
import { BossDialogueSystem } from '../systems/BossDialogueSystem';
import { DirectionIndicator } from '../systems/DirectionIndicator';
import { SoundSystem } from '../systems/SoundSystem';
import { MinimapSystem } from '../systems/MinimapSystem';

export class GameScene extends Phaser.Scene {
    // ระบบต่างๆ
    public mapSystem!: MapSystem;
    public nightSystem!: NightSystem;
    public flashlightSystem!: FlashlightSystem;
    public uiSystem!: UISystem;
    public dialogueSystem!: DialogueSystem;
    public directionIndicator!: DirectionIndicator;
    public soundSystem!: SoundSystem;
    public minimapSystem!: MinimapSystem; // เพิ่มระบบ Minimap
    public bossNPC!: BossNPC | null;
    public bossDialogueSystem!: BossDialogueSystem;

    // เอนทิตี (ตัวละคร/วัตถุ)
    public player!: Player;
    public enemies!: Phaser.Physics.Arcade.Group;
    public enemyControllers!: Enemy[];
    public obstacles!: Phaser.Physics.Arcade.StaticGroup;
    public houses!: Phaser.Physics.Arcade.StaticGroup;

    // สถานะเกม
    public totalHouses!: number;
    public selectedNight!: number;
    public currentNight!: number;
    public totalHousesTarget!: number;
    public enemySpeed!: number;
    public deliveredCount!: number;
    public isDelivering!: boolean;
    public gameTime!: number;
    public timeWarningShown!: boolean;
    public isGameOver!: boolean;
    public isWin!: boolean;
    public isPaused!: boolean;

    private keys!: any;

    constructor() {
        super({ key: 'GameScene' });
    }

    init(data: any): void {
        // รับค่าคืนที่เลือกจากเมนู (ค่าเริ่มต้น = 1)
        this.selectedNight = (data && data.night) ? data.night : 1;
    }

    preload(): void {
        // สร้างวงกลม UI สำหรับตัวบ่งชี้การโต้ตอบ
        this.generateUICircle();

        // โหลดกราฟิกผู้เล่น
        this.load.image('player_front', 'assets/character/Player/mian_front.png');
        this.load.image('player_back', 'assets/character/Player/mian_behind.png');

        // โหลดกราฟิกศัตรู
        this.load.image('ghost_front', 'assets/character/Enemy/supakorn_font.png');
        this.load.image('ghost_back', 'assets/character/Enemy/supakorn_behind.png');

        // Monster 2 Assets
        this.load.image('monster_front', 'assets/character/Enemy/monster_font.png');
        this.load.image('monster_back', 'assets/character/Enemy/monster_behind.png');

        this.load.image('wall', 'assets/map/tree ลงสี2.png');

        // โหลดกราฟิกแผนที่ - บ้าน
        this.load.image('house_1', 'assets/map/house ลงฟิว 1.png');
        this.load.image('house_2', 'assets/map/house ลงฟิว 2.png');
        this.load.image('house_3', 'assets/map/house ลงฟิว 3.png');
        this.load.image('house_4', 'assets/map/house ลงฟิว 4.png');
        this.load.image('house_5', 'assets/map/house ลงฟิว 5.png');
        this.load.image('house', 'assets/map/house ลงฟิว 1.png'); // บ้านเริ่มต้น

        // โหลดกราฟิกไอเท็ม
        this.load.image('item_rabbit', 'assets/Item/Itemrabbit.png');
        this.load.image('item_fox', 'assets/Item/Itemfox.png');
        this.load.image('item_goat', 'assets/Item/Itemgoat.png');
        this.load.image('item_sheep', 'assets/Item/Itemsheep.png');

        // โหลดกราฟิก Boss NPC
        this.load.image('boss_npc', 'assets/character/npc/foxnpc.png');

        // โหลดไฟล์เสียง (ถ้ามี)
        // เพลงประกอบฉาก
        this.load.audio('bgm_ambient_horror', 'assets/audio/bgm/ambient_horror.ogg');
        this.load.audio('bgm_horror_ambient', 'assets/audio/bgm/horror ambient.ogg');
        this.load.audio('bgm_scary_wind', 'assets/audio/bgm/Scary Ambient Wind.ogg');
        this.load.audio('bgm_dark_cavern', 'assets/audio/bgm/dark_cavern_ambient_002.ogg');
    }

    create(): void {
        // เริ่มต้นสถานะเกม
        this.initGameState();

        // เริ่มต้นระบบต่างๆ
        this.mapSystem = new MapSystem(this);
        const mapData: MapAssets = this.mapSystem.create(this.currentNight);

        this.obstacles = mapData.obstacles;
        this.houses = mapData.houses;
        this.enemies = mapData.enemies;
        this.enemyControllers = mapData.enemyControllers;
        this.totalHouses = mapData.totalHouses;

        // สร้างผู้เล่น
        this.player = new Player(this, mapData.playerStart!.x, mapData.playerStart!.y);

        // ตั้งค่าระบบฟิสิกส์
        this.setupPhysics();

        // ตั้งค่ากล้อง
        this.setupCamera();

        // สร้างระบบไฟฉาย
        this.flashlightSystem = new FlashlightSystem(this);
        this.flashlightSystem.create();

        // เพิ่มไฟรอบบ้านทุกหลัง
        mapData.houses.getChildren().forEach((house: any) => {
            this.flashlightSystem.addHouseLight(house.x, house.y);
        });

        // สร้างระบบ UI
        this.uiSystem = new UISystem(this);
        this.uiSystem.create();

        // Ensure UI depth is set correctly for interaction
        this.input.topOnly = true;

        // สร้างระบบบทสนทนา
        this.dialogueSystem = new DialogueSystem(this, this.uiSystem);

        // สร้างตัวบ่งชี้ทิศทาง
        this.directionIndicator = new DirectionIndicator(this);
        this.directionIndicator.create();

        // สร้าง Boss NPC (ถ้ามีตำแหน่งในแผนที่)
        this.bossDialogueSystem = new BossDialogueSystem(this);
        if (mapData.bossStart) {
            this.bossNPC = new BossNPC(this, mapData.bossStart.x, mapData.bossStart.y);
        } else {
            this.bossNPC = null;
        }

        // สร้างระบบแผนที่ย่อ
        this.minimapSystem = new MinimapSystem(this);
        this.minimapSystem.create();

        // สร้างระบบเสียง
        this.soundSystem = new SoundSystem(this);
        this.soundSystem.create();
        this.soundSystem.playForestAmbiance(); // เล่นเสียงบรรยากาศป่า + เอฟเฟกต์สุ่ม

        // ตั้งค่าการควบคุม
        this.keys = this.input.keyboard!.addKeys('W,A,S,D,SHIFT,F,E,ESC');

        // เริ่มต้น UI
        this.updateStatusText();

        // ลูปเวลา - เก็บ reference เพื่อหยุดได้
        const gameTimeEvent = this.time.addEvent({
            delay: 100,
            callback: this.updateGameTime,
            callbackScope: this,
            loop: true
        });
        // เก็บ reference ไว้ clear ภายหลัง
        (this as any).gameTimeEvent = gameTimeEvent;

        // แสดง briefing จากบอสเมื่อเริ่มคืนใหม่
        this.isPaused = true;
        this.physics.pause();
        this.bossDialogueSystem.showBriefing(this.currentNight, () => {
            this.isPaused = false;
            this.physics.resume();
        });
    }

    initGameState(): void {
        this.isGameOver = false;
        this.isWin = false;
        this.isPaused = false;

        // สร้างระบบกลางคืน
        this.nightSystem = new NightSystem();
        this.currentNight = this.selectedNight;

        // กำหนดจำนวนการส่งของและความเร็วศัตรูตามคืน
        this.totalHousesTarget = this.nightSystem.getDeliveriesForNight(this.currentNight);
        this.enemySpeed = this.nightSystem.getEnemySpeedForNight(this.currentNight);

        this.deliveredCount = 0;
        this.isDelivering = false;
        this.gameTime = 0;
        this.timeWarningShown = false;
    }

    // ฟังก์ชันสร้างวงกลม UI
    generateUICircle(): void {
        const graphics = this.add.graphics();

        // แสงเรืองรองด้านนอก
        graphics.lineStyle(2, 0x00ff00, 0.3);
        graphics.strokeCircle(50, 50, 45);

        // วงแหวนหลัก
        graphics.lineStyle(4, 0x00ff00, 0.8);
        graphics.strokeCircle(50, 50, 40);

        // เติมสีด้านใน
        graphics.fillStyle(0x00ff00, 0.1);
        graphics.fillCircle(50, 50, 40);

        graphics.generateTexture('ui_circle', 100, 100);
        graphics.destroy();
    }

    setupPhysics(): void {
        this.physics.add.collider(this.player.sprite, this.obstacles);
        this.physics.add.collider(this.player.sprite, this.houses);

        // เพิ่ม callback เพื่อให้ผีหยุดเมื่อชนอุปสรรค
        this.physics.add.collider(this.enemies, this.obstacles, (enemy: any) => {
            // หยุดผีเมื่อชนกำแพง
            if (enemy.body) {
                enemy.body.velocity.x *= 0.3;
                enemy.body.velocity.y *= 0.3;
            }
        });

        // เพิ่ม callback เพื่อให้ผีหยุดเมื่อชนบ้าน
        this.physics.add.collider(this.enemies, this.houses, (enemy: any) => {
            if (enemy.body) {
                enemy.body.velocity.x *= 0.3;
                enemy.body.velocity.y *= 0.3;
            }
        });

        this.physics.add.overlap(
            this.player.sprite,
            this.enemies,
            this.hitGhost,
            undefined,
            this
        );
    }

    setupCamera(): void {
        const worldWidth = this.physics.world.bounds.width;
        const worldHeight = this.physics.world.bounds.height;
        this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
        this.cameras.main.startFollow(this.player.sprite, true, 0.08, 0.08);
        this.cameras.main.setZoom(1.0);
    }

    updateStatusText(): void {
        this.uiSystem.updateStatusText(
            this.deliveredCount,
            this.totalHouses,
            this.currentNight
        );
        // ลบการอัปเดต Stamina แบบชัดแจ้ง เนื่องจาก Player จัดการเองผ่าน drawStaminaBar
        // this.uiSystem.updateStaminaBar(this.player.getStaminaPercent());
    }

    updateGameTime(): void {
        if (this.isGameOver || this.isWin || this.isPaused) return;

        this.gameTime += GAME.TIME_SCALE;
        const hours = Math.floor(this.gameTime / 60);
        const minutes = Math.floor(this.gameTime % 60);
        this.uiSystem.updateTimeText(hours, minutes);

        if (this.gameTime >= GAME.TIME_WARNING_THRESHOLD && !this.timeWarningShown) {
            this.timeWarningShown = true;
            this.showWarning('⚠️ เหลือเวลาอีก 1 ชั่วโมง!');
        }

        if (this.gameTime >= GAME.TIME_LIMIT) {
            this.timeUp();
        }
    }

    showWarning(message: string): void {
        // เล่นเสียงเตือน
        this.soundSystem.playWarning();

        const { width } = this.scale;
        const warning = this.add.text(width / 2, 100, message, {
            fontSize: '24px',
            color: '#ff0000',
            backgroundColor: '#000',
            padding: { x: 10, y: 10 },
            stroke: '#ff0000',
            strokeThickness: 2
        })
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setDepth(DEPTH.OVERLAY);

        this.tweens.add({
            targets: warning,
            alpha: 0,
            y: 50,
            duration: 3000,
            onComplete: () => warning.destroy()
        });
    }

    update(): void {
        if (this.isGameOver || this.isWin) return;

        // สลับ UI
        if (Phaser.Input.Keyboard.JustDown(this.keys.ESC)) {
            this.togglePause();
        }

        // หยุดเกมถ้ากำลังส่งของ, หยุดเกม, หรือบอสกำลังพูด
        if (this.isDelivering ||
            this.isPaused ||
            this.bossDialogueSystem?.getIsShowing()) {
            this.player.stop();
            return;
        }

        // อัปเดตผู้เล่น
        if (this.player) {
            this.player.update(this.keys);
        }

        // จัดการเสียงฝีเท้า
        const isMoving = this.keys.W.isDown || this.keys.A.isDown || this.keys.S.isDown || this.keys.D.isDown;
        const isRunning = this.keys.SHIFT.isDown && this.player.canRun;
        if (isMoving) {
            this.soundSystem.playFootstep(isRunning);
        }

        // อัปเดตไฟฉาย
        const playerPos = this.player.getPosition();
        this.flashlightSystem.update(playerPos.x, playerPos.y, this.player.getRotation());

        // อัปเดต UI
        this.updateStatusText();

        // อัปเดตศัตรู
        this.handleEnemies();

        // จัดการการโต้ตอบ
        this.handleInteraction();

        // อัปเดตตัวบ่งชี้ทิศทาง
        if (this.directionIndicator) {
            this.directionIndicator.update();
        }

        // อัปเดตแผนที่ย่อ
        if (this.minimapSystem) {
            this.minimapSystem.update();
        }
    }

    handleEnemies(): void {
        if (!this.enemyControllers) return;

        const playerPos = this.player.getPosition();

        // ตรวจสอบว่ามีศัตรูอยู่ใกล้หรือไม่เพื่อเล่นเสียงบรรยากาศ
        let nearestDist = Infinity;

        // อัปเดต AI ของศัตรูแต่ละตัว
        this.enemyControllers.forEach(enemy => {
            enemy.update(playerPos, this.enemySpeed, this.player.getRotation());

            const dist = Phaser.Math.Distance.Between(
                playerPos.x,
                playerPos.y,
                enemy.sprite.x,
                enemy.sprite.y
            );

            if (dist < nearestDist) {
                nearestDist = dist;
            }
        });

        // เล่นเสียงบรรยากาศผีถ้าศัตรูอยู่ใกล้
        if (nearestDist < SOUND_CONFIG.GHOST_SOUND_DISTANCE) {
            this.soundSystem.playGhostAmbient();
        } else {
            this.soundSystem.stopGhostAmbient();
        }
    }

    handleInteraction(): void {
        const playerPos = this.player.getPosition();

        // ตรวจสอบ interaction กับ Boss NPC ก่อน
        if (this.bossNPC && !this.bossDialogueSystem.getIsShowing()) {
            const nearBoss = this.bossNPC.isPlayerNear(playerPos.x, playerPos.y);
            this.bossNPC.showIndicator(nearBoss);

            if (nearBoss && Phaser.Input.Keyboard.JustDown(this.keys.F)) {
                // เปิดสนทนากับบอส
                this.isPaused = true;
                this.physics.pause();
                this.player.stop();
                this.bossDialogueSystem.showInteraction(this.currentNight, () => {
                    this.isPaused = false;
                    this.physics.resume();
                });
                return;
            }
        }

        // ตรวจสอบ interaction กับบ้าน
        let nearHouse: Phaser.GameObjects.Sprite | null = null;
        let minDist: number = GAME.INTERACTION_RANGE;

        this.houses.getChildren().forEach((house: any) => {
            if (!house.getData('isDelivered')) {
                const dist = Phaser.Math.Distance.Between(
                    playerPos.x,
                    playerPos.y,
                    house.x,
                    house.y
                );
                if (dist < minDist) {
                    nearHouse = house;
                    minDist = dist;
                }
            }
        });

        if (nearHouse) {
            this.uiSystem.interactContainer?.setPosition(playerPos.x, playerPos.y - 70);
            this.uiSystem.interactContainer?.setVisible(true);

            if (Phaser.Input.Keyboard.JustDown(this.keys.F)) {
                this.startKnocking(nearHouse);
            }
        } else {
            this.uiSystem.interactContainer?.setVisible(false);
        }
    }

    startKnocking(house: Phaser.GameObjects.Sprite): void {
        this.isDelivering = true;
        this.uiSystem.interactContainer?.setVisible(false);

        // หยุดศัตรูทุกตัว
        if (this.enemyControllers) {
            this.enemyControllers.forEach(enemy => {
                if (enemy.sprite.body) {
                    (enemy.sprite.body as Phaser.Physics.Arcade.Body).setVelocity(0);
                }
            });
        }

        // ตรวจสอบให้แน่ใจว่าแถบเคาะประตูแสดงอยู่ - โดยใช้ properties สาธารณะจาก UISystem
        if (this.uiSystem.knockingBar && this.uiSystem.knockingContainer) {
            this.uiSystem.knockingContainer.setVisible(true);
            this.uiSystem.knockingBar.setVisible(true);
            this.uiSystem.knockingBar.width = 0;
        }

        // เล่นเสียงเคาะประตู
        this.soundSystem.playKnocking();

        if (this.uiSystem.knockingBar) {
            this.tweens.add({
                targets: this.uiSystem.knockingBar,
                width: 300,
                duration: GAME.KNOCKING_DURATION,
                ease: 'Linear',
                onComplete: () => {
                    if (this.uiSystem.knockingContainer) {
                        this.uiSystem.knockingContainer.setVisible(false);
                    }
                    // การเคาะประตูเสร็จสิ้น
                    this.dialogueSystem.showDialogue(house);
                }
            });
        }
    }

    togglePause(): void {
        this.isPaused = !this.isPaused;
        if (this.isPaused) {
            this.physics.pause();
            this.uiSystem.showPauseMenu();
        } else {
            this.physics.resume();
            this.uiSystem.hidePauseMenu();
        }
    }

    missionComplete(): void {
        if (this.isGameOver || this.isWin) return;
        this.isWin = true;

        // หยุด timer ทันที
        if ((this as any).gameTimeEvent) {
            (this as any).gameTimeEvent.remove();
        }

        this.physics.pause();

        // เล่นเสียงชนะและหยุดเพลงทั้งหมด
        this.soundSystem.stopAllSounds();
        this.soundSystem.stopBackgroundMusic();
        this.soundSystem.stopGhostAmbient();
        this.soundSystem.playVictory();

        // Delay เล็กน้อยเพื่อให้ sound effect เล่นก่อน
        this.time.delayedCall(300, () => {
            // คำนวณว่ามีด่านถัดไปหรือไม่
            const hasNextLevel = this.currentNight < 3;

            // ปลดล็อคคืนถัดไปถ้าเล่นผ่าน
            if (this.currentNight >= this.nightSystem.getCurrentNight()) {
                this.nightSystem.advanceNight();
            }

            // ถ้าจบคืนที่ 3 แสดงหน้าจอจบเกม
            if (!hasNextLevel) {
                const { restartBtn, menuBtn } = this.uiSystem.showGameCompleteScreen();
                restartBtn.once('pointerdown', () => this.scene.restart({ night: 1 }));
                menuBtn.once('pointerdown', () => this.scene.start('MainMenuScene'));
                return;
            }

            const { restartBtn, menuBtn, nextLevelBtn } = this.uiSystem.showWinScreen(this.currentNight, hasNextLevel);

            restartBtn.once('pointerdown', () => this.scene.restart({ night: this.currentNight }));
            menuBtn.once('pointerdown', () => this.scene.start('MainMenuScene'));

            if (nextLevelBtn) {
                nextLevelBtn.once('pointerdown', () => this.scene.restart({ night: this.currentNight + 1 }));
            }
        });
    }

    private hitGhost(_player: any, _ghost: any): void {
        if (this.isWin || this.isGameOver || this.isDelivering) return;
        this.isGameOver = true;

        // หยุด timers ทั้งหมดก่อน
        if ((this as any).gameTimeEvent) {
            (this as any).gameTimeEvent.remove();
        }

        this.physics.pause();
        this.player.sprite.setTint(0xff0000);

        // เล่นเสียง Jumpscare และหยุดเพลงทั้งหมด
        this.soundSystem.stopAllSounds();
        this.soundSystem.stopBackgroundMusic();
        this.soundSystem.stopGhostAmbient();
        this.soundSystem.playJumpscare();

        // เอฟเฟกต์ Jumpscare
        this.cameras.main.shake(500, 0.05); // สั่นแรง
        this.cameras.main.flash(200, 255, 0, 0); // แฟลชสีแดง

        // หยุดอนิเมชั่นผู้เล่น
        this.player.stop();

        // Delay เล็กน้อยเพื่อให้ effects แสดงก่อน
        this.time.delayedCall(300, () => {
            const { restartBtn, menuBtn } = this.uiSystem.showGameOverScreen(
                '👻 JUMPSCARE!',
                'โดนจับได้ซะแล้ว...'
            );
            // ใช้ .once() แทน .on() เพื่อป้องกัน duplicate listeners
            restartBtn.once('pointerdown', () => this.scene.restart({ night: this.currentNight }));
            menuBtn.once('pointerdown', () => this.scene.start('MainMenuScene'));
        });
    }

    timeUp(): void {
        if (this.isWin || this.isGameOver) return;
        this.isGameOver = true;

        // หยุด timer ทันที
        if ((this as any).gameTimeEvent) {
            (this as any).gameTimeEvent.remove();
        }

        this.physics.pause();

        // เล่นเสียง Game Over และหยุดเพลงทั้งหมด
        this.soundSystem.stopAllSounds();
        this.soundSystem.stopBackgroundMusic();
        this.soundSystem.stopGhostAmbient();
        this.soundSystem.playGameOver();

        // Delay เล็กน้อยเพื่อให้ sound effect เล่นก่อน
        this.time.delayedCall(200, () => {
            const { restartBtn, menuBtn } = this.uiSystem.showGameOverScreen(
                '🌅 เช้าแล้ว!',
                'ส่งของไม่ทันเวลา',
                '#ffa500' // สีส้มสำหรับหมดเวลา
            );
            // ใช้ .once() แทน .on() เพื่อป้องกัน duplicate listeners
            restartBtn.once('pointerdown', () => this.scene.restart({ night: this.currentNight }));
            menuBtn.once('pointerdown', () => this.scene.start('MainMenuScene'));
        });
    }

    shutdown(): void {
        // หยุดเสียงทั้งหมดเมื่อออกจากฉาก
        if (this.soundSystem) {
            this.soundSystem.stopAllSounds();
            this.soundSystem.stopBackgroundMusic();
            this.soundSystem.stopGhostAmbient();
        }
    }
}
