// ==========================================
// SoundSystem.ts - Manages all game audio
// ==========================================

import * as Phaser from 'phaser';
import { SOUND_VOLUMES, SOUND } from '../config/Constants';

export class SoundSystem {
    private scene: Phaser.Scene;
    // private sounds: Record<string, any>;
    private audioContext: AudioContext | null;
    private masterGain: GainNode | null;
    private musicGain: GainNode | null;
    private sfxGain: GainNode | null;
    private ambientGain: GainNode | null;

    // private playingSounds: Set<any>;
    private backgroundMusic: OscillatorNode | null;
    private lastFootstep: number;
    private ghostAmbientSource: any;

    private phaserBGM: Phaser.Sound.BaseSound | null;
    private forestAmbianceTimer: Phaser.Time.TimerEvent | null;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.audioContext = null;
        this.masterGain = null;
        this.musicGain = null;
        this.sfxGain = null;
        this.ambientGain = null;

        // Track playing sounds
        // this.playingSounds = new Set();
        this.backgroundMusic = null;
        this.lastFootstep = 0;
        this.ghostAmbientSource = null;

        // Phaser sound objects
        this.phaserBGM = null;
        this.forestAmbianceTimer = null;
    }

    create(): void {
        // Initialize Web Audio API
        try {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            this.audioContext = new AudioContextClass();

            if (!this.audioContext) return;

            // Create gain nodes for volume control
            this.masterGain = this.audioContext.createGain();
            this.masterGain.connect(this.audioContext.destination);
            this.masterGain.gain.value = SOUND_VOLUMES.MASTER;

            this.musicGain = this.audioContext.createGain();
            this.musicGain.connect(this.masterGain);
            this.musicGain.gain.value = SOUND_VOLUMES.MUSIC;

            this.sfxGain = this.audioContext.createGain();
            this.sfxGain.connect(this.masterGain);
            this.sfxGain.gain.value = SOUND_VOLUMES.SFX;

            this.ambientGain = this.audioContext.createGain();
            this.ambientGain.connect(this.masterGain);
            this.ambientGain.gain.value = SOUND_VOLUMES.AMBIENT;

        } catch (e) {
            console.warn('Web Audio API not supported', e);
        }
    }

    // ==========================================
    // BACKGROUND MUSIC
    // ==========================================
    playBackgroundMusic(): void {
        if (!this.audioContext) return;

        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }

        if (this.backgroundMusic) {
            this.backgroundMusic.stop();
        }

        const now = this.audioContext.currentTime;

        const drone = this.audioContext.createOscillator();
        drone.type = 'sine';
        drone.frequency.setValueAtTime(55, now);

        const droneGain = this.audioContext.createGain();
        droneGain.gain.setValueAtTime(0.15, now);

        drone.connect(droneGain);
        droneGain.connect(this.musicGain!);

        const lfo = this.audioContext.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(0.2, now);

        const lfoGain = this.audioContext.createGain();
        lfoGain.gain.setValueAtTime(5, now);

        lfo.connect(lfoGain);
        lfoGain.connect(drone.frequency);

        drone.start(now);
        lfo.start(now);

        this.backgroundMusic = drone;

    }

    stopBackgroundMusic(): void {
        if (this.backgroundMusic) {
            try {
                this.backgroundMusic.stop();
            } catch (e) { /* Check if already stopped */ }
            this.backgroundMusic = null;
        }

        if (this.phaserBGM) {
            this.phaserBGM.stop();
            this.phaserBGM = null;
        }

        if (this.forestAmbianceTimer) {
            this.forestAmbianceTimer.remove();
            this.forestAmbianceTimer = null;
        }
    }

    // ==========================================
    // FOREST AMBIANCE
    // ==========================================
    playForestAmbiance(): void {
        this.stopBackgroundMusic();

        const availableTracks = [
            'bgm_ambient_horror',
            'bgm_horror_ambient',
            'bgm_scary_wind',
            'bgm_dark_cavern'
        ].filter(key => this.scene.cache.audio.exists(key));

        if (availableTracks.length === 0) {
            console.warn('No BGM audio files found, using procedural sound');
            this.playBackgroundMusic();
            return;
        }

        const randomTrack = Phaser.Utils.Array.GetRandom(availableTracks);

        this.phaserBGM = this.scene.sound.add(randomTrack, {
            loop: true,
            volume: SOUND_VOLUMES.MUSIC * SOUND_VOLUMES.MASTER
        });
        this.phaserBGM.play();

        this.scheduleRandomSoundEffect();
    }

    scheduleRandomSoundEffect(): void {
        const interval = Phaser.Math.Between(20000, 40000);

        this.forestAmbianceTimer = this.scene.time.addEvent({
            delay: interval,
            callback: () => {
                this.playRandomHorrorEffect();
                this.scheduleRandomSoundEffect();
            },
            callbackScope: this
        });
    }

    playRandomHorrorEffect(): void {
        if (!this.audioContext) return;

        const effects = ['twig', 'whisper', 'wind', 'creak'];
        const randomEffect = Phaser.Utils.Array.GetRandom(effects);


        const now = this.audioContext.currentTime;

        switch (randomEffect) {
            case 'twig':
                this.playTwigSnap(now);
                break;
            case 'whisper':
                this.playCreepyWhisper(now);
                break;
            case 'wind':
                this.playWindGust(now);
                break;
            case 'creak':
                this.playCreak(now);
                break;
        }
    }

    // ... (Procedural Sound Generation Methods) ...

    playTwigSnap(now: number): void {
        if (!this.audioContext || !this.ambientGain) return;
        const noise = this.audioContext.createBufferSource();
        const bufferSize = this.audioContext.sampleRate * 0.15;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.2));
        }

        noise.buffer = buffer;

        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(800, now);

        const gain = this.audioContext.createGain();
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ambientGain);

        noise.start(now);
        noise.stop(now + 0.15);
    }

    playCreepyWhisper(now: number): void {
        if (!this.audioContext || !this.ambientGain) return;
        for (let i = 0; i < 3; i++) {
            const osc = this.audioContext.createOscillator();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(400 + (i * 150), now);

            const gain = this.audioContext.createGain();
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.05, now + 0.3);
            gain.gain.linearRampToValueAtTime(0, now + 2);

            osc.connect(gain);
            gain.connect(this.ambientGain);

            osc.start(now);
            osc.stop(now + 2);
        }
    }

    playWindGust(now: number): void {
        if (!this.audioContext || !this.ambientGain) return;
        const bufferSize = this.audioContext.sampleRate * 3;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * 0.5;
        }

        const noise = this.audioContext.createBufferSource();
        noise.buffer = buffer;

        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(400, now);
        filter.Q.setValueAtTime(0.5, now);

        const gain = this.audioContext.createGain();
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.15, now + 0.5);
        gain.gain.linearRampToValueAtTime(0.1, now + 2);
        gain.gain.linearRampToValueAtTime(0, now + 3);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ambientGain);

        noise.start(now);
        noise.stop(now + 3);
    }

    playCreak(now: number): void {
        if (!this.audioContext || !this.ambientGain) return;
        const osc = this.audioContext.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.8);

        const gain = this.audioContext.createGain();
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);

        osc.connect(gain);
        gain.connect(this.ambientGain);

        osc.start(now);
        osc.stop(now + 0.8);
    }

    playFootstep(isRunning: boolean = false): void {
        if (!this.audioContext || !this.sfxGain) return;

        const now = this.scene.time.now;
        const interval = isRunning ?
            SOUND.FOOTSTEP_INTERVAL / 2 :
            SOUND.FOOTSTEP_INTERVAL;

        if (now - this.lastFootstep < interval) return;
        this.lastFootstep = now;

        const audioNow = this.audioContext.currentTime;

        const bufferSize = this.audioContext.sampleRate * 0.1; // 100ms
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
        }

        const noise = this.audioContext.createBufferSource();
        noise.buffer = buffer;

        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(200, audioNow);

        const gain = this.audioContext.createGain();
        gain.gain.setValueAtTime(isRunning ? 0.15 : 0.08, audioNow);
        gain.gain.exponentialRampToValueAtTime(0.01, audioNow + 0.1);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);

        noise.start(audioNow);
        noise.stop(audioNow + 0.1);
    }

    playKnocking(): void {
        if (!this.audioContext || !this.sfxGain) return;

        const now = this.audioContext.currentTime;

        for (let i = 0; i < 3; i++) {
            const knockTime = now + (i * 0.15);

            const osc = this.audioContext.createOscillator();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(150, knockTime);

            const gain = this.audioContext.createGain();
            gain.gain.setValueAtTime(0, knockTime);
            gain.gain.linearRampToValueAtTime(0.3, knockTime + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.01, knockTime + 0.08);

            osc.connect(gain);
            gain.connect(this.sfxGain);

            osc.start(knockTime);
            osc.stop(knockTime + 0.1);
        }
    }

    playGhostAmbient(): void {
        if (!this.audioContext || !this.ambientGain) return;

        if (this.ghostAmbientSource) return;

        const now = this.audioContext.currentTime;

        const whisper = this.audioContext.createOscillator();
        whisper.type = 'sine';
        whisper.frequency.setValueAtTime(880, now);

        const vibrato = this.audioContext.createOscillator();
        vibrato.type = 'sine';
        vibrato.frequency.setValueAtTime(5, now);

        const vibratoGain = this.audioContext.createGain();
        vibratoGain.gain.setValueAtTime(10, now);

        vibrato.connect(vibratoGain);
        vibratoGain.connect(whisper.frequency);

        const gain = this.audioContext.createGain();
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.1, now + 1);

        whisper.connect(gain);
        gain.connect(this.ambientGain);

        whisper.start(now);
        vibrato.start(now);

        this.ghostAmbientSource = { whisper, vibrato, gain };
    }

    stopGhostAmbient(): void {
        if (!this.ghostAmbientSource) return;

        try {
            const now = this.audioContext?.currentTime || 0;

            // Fade out quickly (0.1s) instead of 0.5s to ensure it feels responsive
            if (this.ghostAmbientSource.gain) {
                this.ghostAmbientSource.gain.gain.cancelScheduledValues(now);
                this.ghostAmbientSource.gain.gain.setValueAtTime(this.ghostAmbientSource.gain.gain.value, now);
                this.ghostAmbientSource.gain.gain.linearRampToValueAtTime(0, now + 0.1);
            }

            if (this.ghostAmbientSource.whisper) {
                this.ghostAmbientSource.whisper.stop(now + 0.1);
            }
            if (this.ghostAmbientSource.vibrato) {
                this.ghostAmbientSource.vibrato.stop(now + 0.1);
            }

            this.ghostAmbientSource = null;
        } catch (e) {
            this.ghostAmbientSource = null;
        }
    }

    stopAllSounds(): void {
        this.stopBackgroundMusic();
        this.stopGhostAmbient();

        if (this.audioContext && this.masterGain) {
            const now = this.audioContext.currentTime;
            this.masterGain.gain.linearRampToValueAtTime(0, now + 0.1);
            setTimeout(() => {
                if (this.masterGain && this.audioContext) {
                    this.masterGain.gain.setValueAtTime(SOUND_VOLUMES.MASTER, this.audioContext.currentTime);
                }
            }, 200);
        }
    }

    // UI Sounds
    playButtonClick(): void {
        if (!this.audioContext || !this.sfxGain) return;

        const now = this.audioContext.currentTime;
        const osc = this.audioContext.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.1);

        const gain = this.audioContext.createGain();
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.1);
    }

    // New methods for GameScene interaction
    playWarning(): void {
        if (!this.audioContext || !this.sfxGain) return;
        const now = this.audioContext.currentTime;

        const osc = this.audioContext.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now); // A4
        osc.frequency.setValueAtTime(880, now + 0.1); // A5

        const gain = this.audioContext.createGain();
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.5);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.5);
    }

    playVictory(): void {
        if (!this.audioContext || !this.musicGain) return;
        const now = this.audioContext.currentTime;

        // Major chord arpeggio
        [440, 554, 659, 880].forEach((freq, i) => {
            const osc = this.audioContext!.createOscillator();
            osc.type = 'square';
            osc.frequency.setValueAtTime(freq, now + i * 0.1);

            const gain = this.audioContext!.createGain();
            gain.gain.setValueAtTime(0.1, now + i * 0.1);
            gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 1);

            osc.connect(gain);
            gain.connect(this.musicGain!);

            osc.start(now + i * 0.1);
            osc.stop(now + i * 0.1 + 1);
        });
    }

    playJumpscare(): void {
        if (!this.audioContext || !this.sfxGain) return;
        const now = this.audioContext.currentTime;

        // 1. High-pitched dissonant screech (Multiple oscillators)
        const frequencies = [800, 1100, 1350, 1600]; // Dissonant cluster
        frequencies.forEach((freq, i) => {
            const osc = this.audioContext!.createOscillator();
            osc.type = i % 2 === 0 ? 'sawtooth' : 'square';
            osc.frequency.setValueAtTime(freq, now);
            osc.frequency.exponentialRampToValueAtTime(freq * 0.5, now + 0.3); // Pitch drop
            osc.frequency.linearRampToValueAtTime(freq * 1.5, now + 0.6); // Pitch rise

            const gain = this.audioContext!.createGain();
            gain.gain.setValueAtTime(0.3, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);

            osc.connect(gain);
            gain.connect(this.sfxGain!);
            osc.start(now);
            osc.stop(now + 0.8);
        });

        // 2. Sub-bass Impact (Boom)
        const subOsc = this.audioContext.createOscillator();
        subOsc.type = 'sine';
        subOsc.frequency.setValueAtTime(150, now);
        subOsc.frequency.exponentialRampToValueAtTime(40, now + 0.5);

        const subGain = this.audioContext.createGain();
        subGain.gain.setValueAtTime(0.8, now);
        subGain.gain.exponentialRampToValueAtTime(0.01, now + 1.0);

        subOsc.connect(subGain);
        subGain.connect(this.sfxGain);
        subOsc.start(now);
        subOsc.stop(now + 1.0);

        // 3. White Noise Glitch Burst
        const bufferSize = this.audioContext.sampleRate * 0.5;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.8;

        const noise = this.audioContext.createBufferSource();
        noise.buffer = buffer;

        const noiseGain = this.audioContext.createGain();
        noiseGain.gain.setValueAtTime(0.5, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

        noise.connect(noiseGain);
        noiseGain.connect(this.sfxGain);
        noise.start(now);
        noise.stop(now + 0.3);
    }

    playGameOver(): void {
        if (!this.audioContext || !this.musicGain) return;
        const now = this.audioContext.currentTime;

        // Descending tone
        const osc = this.audioContext.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.linearRampToValueAtTime(50, now + 2);

        const gain = this.audioContext.createGain();
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0, now + 2);

        osc.connect(gain);
        gain.connect(this.musicGain);

        osc.start(now);
        osc.stop(now + 2);
    }
}
