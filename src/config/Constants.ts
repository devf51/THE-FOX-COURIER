// ==========================================
// Game Constants and Configuration
// ==========================================

import type { NightConfig, EnemySpeeds, SoundVolumes } from '../types/index.d';

// Canvas Configuration
export const CANVAS = {
    WIDTH: 1024,
    HEIGHT: 768
} as const;

// Player Configuration
export const PLAYER = {
    SPEED: 120,
    RUN_MULTIPLIER: 1.6,
    STAMINA_MAX: 100,
    STAMINA_DRAIN_RATE: 15,
    STAMINA_REGEN_RATE: 10,
    STAMINA_REGEN_DELAY: 1000,
    START_X: 512,
    START_Y: 650,
    SPRINT_SPEED: 220,
    COLLISION_WIDTH: 40,  // เดิม 30
    COLLISION_HEIGHT: 65, // เดิม 50
    RECOVERY_MOVING: 0.15,
    RECOVERY_IDLE: 0.3,
    MIN_TO_RUN: 30
} as const;

// Enemy Configuration
export const ENEMY = {
    DETECTION_RANGE: 200,
    CHASE_RANGE: 300,
    PATROL_SPEED: 60,
    BASE_SPEEDS: { 1: 85, 2: 100, 3: 120 } as EnemySpeeds,
    PATROL_CHANGE_INTERVAL: 3000,
    COLLISION_WIDTH: 40,
    COLLISION_HEIGHT: 60
} as const;

// World Configuration
export const WORLD = {
    WIDTH: 1600,
    HEIGHT: 1200,
    BOUNDARY_COLOR: 0x2d4a2e,
    TREE_COLOR: 0x1a3a1a
} as const;

// Item Configuration
export const ITEMS = {
    TYPES: ['rabbit', 'fox', 'goat', 'sheep'] as const,
    SCALE: 0.15
} as const;

// Night System Configuration
export const NIGHTS: Record<number, NightConfig> = {
    1: { deliveries: 3, timeLimit: 180, enemyCount: 2, enemySpeed: 85 },
    2: { deliveries: 4, timeLimit: 150, enemyCount: 3, enemySpeed: 100 },
    3: { deliveries: 5, timeLimit: 120, enemyCount: 4, enemySpeed: 120 }
} as const;

// UI Configuration
export const UI = {
    PADDING: 20,
    FONT_SIZE: 18,
    TITLE_FONT_SIZE: 32,
    WARNING_DURATION: 2000
} as const;

// Sound Configuration
export const SOUND_VOLUMES: SoundVolumes = {
    MASTER: 0.7,
    MUSIC: 0.3,
    SFX: 0.5,
    AMBIENT: 0.4
} as const;

export const SOUND = {
    FOOTSTEP_INTERVAL: 400,
    GHOST_SOUND_DISTANCE: 150
} as const;

// Flashlight Configuration
export const FLASHLIGHT = {
    RADIUS: 150,
    CONE_ANGLE: Math.PI / 3,
    ALPHA: 0.7
} as const;

// UI Depth Hierarchy
export const DEPTH = {
    UI: 100,
    MINIMAP: 200,
    PAUSE_MENU: 300,
    OVERLAY: 400
} as const;

// Game Logic
export const GAME = {
    TIME_SCALE: 0.5,
    TIME_LIMIT: 360,
    TIME_WARNING_THRESHOLD: 300,
    INTERACTION_RANGE: 100,
    KNOCKING_DURATION: 2000
} as const;

