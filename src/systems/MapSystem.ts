// ==========================================
// MapSystem.ts - Map Creation & Management
// ==========================================

import * as Phaser from 'phaser';
import { Enemy } from '../entities/Enemy';
import { Level1, Level2, Level3 } from '../data/Levels';

export interface MapAssets {
    obstacles: Phaser.Physics.Arcade.StaticGroup;
    houses: Phaser.Physics.Arcade.StaticGroup;
    enemies: Phaser.Physics.Arcade.Group;
    enemyControllers: Enemy[];
    playerStart: { x: number, y: number } | null;
    bossStart: { x: number, y: number } | null;
    totalHouses: number;
}

export class MapSystem {
    private scene: Phaser.Scene;
    private tileSize: number;

    private obstacles: Phaser.Physics.Arcade.StaticGroup | null;
    private houses: Phaser.Physics.Arcade.StaticGroup | null;
    private enemies: Phaser.Physics.Arcade.Group | null;
    private enemyControllers: Enemy[];
    private playerStart: { x: number, y: number } | null;
    private bossStart: { x: number, y: number } | null;
    private totalHouses: number;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.tileSize = 48; // เดิม 64 -> 48 (Map เล็กลง)

        this.obstacles = null;
        this.houses = null;
        this.enemies = null;
        this.enemyControllers = [];
        this.playerStart = null;
        this.bossStart = null;
        this.totalHouses = 0;
    }

    create(level: number = 1): MapAssets {
        // Select Level
        let mapData: string[] = Level1;
        if (level === 2) mapData = Level2;
        if (level >= 3) mapData = Level3;

        const worldWidth = mapData[0].length * this.tileSize;
        const worldHeight = mapData.length * this.tileSize;

        // Background
        this.scene.add.rectangle(0, 0, worldWidth, worldHeight, 0x1a1a2e)
            .setOrigin(0);

        // Physics bounds
        this.scene.physics.world.setBounds(0, 0, worldWidth, worldHeight);

        // Groups
        this.obstacles = this.scene.physics.add.staticGroup();
        this.houses = this.scene.physics.add.staticGroup();
        this.enemies = this.scene.physics.add.group();

        // Parse ASCII map data
        mapData.forEach((row, y) => {
            for (let x = 0; x < row.length; x++) {
                const type = row[x];
                const posX = (x * this.tileSize) + (this.tileSize / 2);
                const posY = (y * this.tileSize) + (this.tileSize / 2);

                this.createTile(type, posX, posY);
            }
        });

        // Ensure player start is set (fallback)
        if (!this.playerStart) {
            this.playerStart = {
                x: 2 * this.tileSize,
                y: 2 * this.tileSize
            };
        }

        return {
            obstacles: this.obstacles!,
            houses: this.houses!,
            enemies: this.enemies!,
            enemyControllers: this.enemyControllers,
            playerStart: this.playerStart,
            bossStart: this.bossStart,
            totalHouses: this.totalHouses
        };
    }

    private createTile(type: string, x: number, y: number): void {
        // WALL: '#'
        if (type === '#') {
            const wall = this.obstacles!.create(x, y, 'wall'); // Assumes 'wall' key exists
            wall.setDisplaySize(this.tileSize, this.tileSize).refreshBody();
        }
        // HOUSES: ['1'...'9', 'A'...'Z']
        // Check for alphanumeric but not reserved chars (E, M, P, B, #, .)
        else if (type.match(/[1-9A-Z]/) && type !== 'E' && type !== 'M' && type !== 'P' && type !== 'B') {
            // Random house texture
            const houseTexture = `house_${Phaser.Math.Between(1, 4)}`;
            const house = this.houses!.create(x, y, houseTexture);

            // ขยายขนาดบ้านให้ใหญ่ขึ้นมาก (2.5x ของ Tile ใหม่) -> 48 * 2.5 = 120px
            const houseSize = this.tileSize * 2.5;
            house.setDisplaySize(houseSize, houseSize).refreshBody();

            house.setData('isDelivered', false);
            house.setData('houseId', type);

            // เพิ่มไฟเรืองรอบบ้าน (yellow glow)
            const glow = this.scene.add.circle(x, y, this.tileSize * 0.8, 0xffdd44, 0.15);
            glow.setDepth(-1); // ให้อยู่ด้านหลังบ้าน

            // เก็บ reference ของ glow ไว้ในบ้าน (สำหรับลบทีหลังถ้าจำเป็น)
            house.setData('glowCircle', glow);

            this.totalHouses++;

            // Optional: Debud label
            // this.scene.add.text(x - 10, y - 10, type, { fontSize: '20px' });
        }
        // ENEMY: 'E' (Ghost)
        else if (type === 'E') {
            const enemy = new Enemy(this.scene, x, y, 'ghost');
            this.enemies!.add(enemy.sprite);
            this.enemyControllers.push(enemy);
        }
        // MONSTER 2: 'M' (Monster)
        else if (type === 'M') {
            const enemy = new Enemy(this.scene, x, y, 'monster');
            this.enemies!.add(enemy.sprite);
            this.enemyControllers.push(enemy);
        }
        // PLAYER_START: 'P'
        else if (type === 'P') {
            this.playerStart = { x, y };
        }
        // BOSS NPC: 'B' (The Postmaster)
        else if (type === 'B') {
            this.bossStart = { x, y };
        }
    }
}
