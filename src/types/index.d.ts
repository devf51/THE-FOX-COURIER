// ==========================================
// Type Definitions for Game
// ==========================================

declare global {
    interface Window {
        game?: Phaser.Game;
    }
}

// Night configuration
export interface NightConfig {
    deliveries: number;
    timeLimit: number;
    enemyCount: number;
    enemySpeed: number;
}

// Enemy speeds by night
export interface EnemySpeeds {
    [night: number]: number;
}

// Sound volumes configuration
export interface SoundVolumes {
    MASTER: number;
    MUSIC: number;
    SFX: number;
    AMBIENT: number;
}

// House configuration
export interface HouseConfig {
    x: number;
    y: number;
    active: boolean;
    hasDelivery: boolean;
}

export { };
