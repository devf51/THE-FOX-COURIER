// ==========================================
// DialogueSystem.ts - Simplified Delivery System (No Items)
// ==========================================

import * as Phaser from 'phaser';

// Define Interface for GameScene to avoid circular deps and type errors
// containing only what DialogueSystem needs
interface IGameScene extends Phaser.Scene {
    deliveredCount: number;
    totalHouses: number;
    isDelivering: boolean;
    updateStatusText: () => void;
    missionComplete: () => void;
}

export class DialogueSystem {
    private scene: IGameScene;
    // private uiSystem: any; // unused

    constructor(scene: Phaser.Scene, _uiSystem: any) {
        this.scene = scene as IGameScene;
        // this.uiSystem = uiSystem;
    }

    showDialogue(house: Phaser.GameObjects.GameObject): void {
        // Displays "Delivering..." text
        this.showFloatingText(house as Phaser.GameObjects.Sprite, '📦 กำลังส่งของ...', '#ffff00');

        // Wait 2 seconds then complete delivery
        this.scene.time.delayedCall(2000, () => {
            this.deliverPackage(house as Phaser.GameObjects.Sprite);
        });
    }

    private deliverPackage(house: Phaser.GameObjects.Sprite): void {
        // Update house status
        house.setData('isDelivered', true);
        house.setTint(0x555555);

        this.scene.deliveredCount++;
        this.scene.updateStatusText();

        // Show success message
        this.showDeliverySuccess(house);

        // Unlock movement
        this.scene.isDelivering = false;

        // Check win condition
        if (this.scene.deliveredCount >= this.scene.totalHouses) {
            this.scene.time.delayedCall(1500, () => this.scene.missionComplete());
        }
    }

    private showDeliverySuccess(house: Phaser.GameObjects.Sprite): void {
        const floatText = this.scene.add.text(house.x, house.y - 40, '✓ ส่งสำเร็จ!', {
            fontSize: '28px',
            color: '#00ff00',
            stroke: '#000',
            strokeThickness: 5,
            fontStyle: 'bold'
        })
            .setOrigin(0.5)
            .setDepth(999999);

        this.scene.tweens.add({
            targets: floatText,
            y: house.y - 100,
            alpha: 0,
            duration: 2000,
            ease: 'Power2',
            onComplete: () => floatText.destroy()
        });
    }

    private showFloatingText(house: Phaser.GameObjects.Sprite, text: string, color: string): void {
        const floatText = this.scene.add.text(house.x, house.y - 40, text, {
            fontSize: '24px',
            color: color,
            stroke: '#000',
            strokeThickness: 4,
            fontStyle: 'bold'
        })
            .setOrigin(0.5)
            .setDepth(999999);

        this.scene.tweens.add({
            targets: floatText,
            y: house.y - 80,
            alpha: 0,
            duration: 1500,
            ease: 'Power2',
            onComplete: () => floatText.destroy()
        });
    }
}
