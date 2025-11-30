/**
 * Audio System for Aetherial Vanguard
 * @fileoverview Comprehensive audio management with in-engine composition
 */

import { AudioData } from '../types';
import { logger, LogSource } from './GlobalLogger';

/**
 * Audio playback state
 */
enum AudioState {
  STOPPED = 'STOPPED',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  LOADING = 'LOADING'
}

/**
 * Audio track configuration
 */
interface AudioTrack {
  /** Unique track identifier */
  id: string;
  /** Audio data */
  audioData: AudioData;
  /** Whether track should loop */
  loop: boolean;
  /** Volume level (0-1) */
  volume: number;
  /** Current playback state */
  state: AudioState;
  /** Audio buffer source */
  source?: AudioBufferSourceNode;
  /** Gain node for volume control */
  gainNode?: GainNode;
  /** Start time for looping */
  startTime?: number;
  /** Pause time for resuming */
  pauseTime?: number;
}

/**
 * Audio system configuration
 */
interface AudioConfig {
  /** Master volume (0-1) */
  masterVolume: number;
  /** BGM volume multiplier (0-1) */
  bgmVolume: number;
  /** SFX volume multiplier (0-1) */
  sfxVolume: number;
  /** Maximum number of simultaneous SFX */
  maxSFXChannels: number;
  /** Whether audio is enabled */
  enabled: boolean;
}

/**
 * Hardcoded audio compositions
 * Contains all game audio as constant static data
 */
export const HARDCODED_AUDIO: Record<string, AudioData> = {
  // BGM Tracks
  'title_theme': {
    sampleRate: 44100,
    channels: 2,
    data: generateTitleTheme()
  },
  'overworld_theme': {
    sampleRate: 44100,
    channels: 2,
    data: generateOverworldTheme()
  },
  'battle_theme': {
    sampleRate: 44100,
    channels: 2,
    data: generateBattleTheme()
  },
  'victory_fanfare': {
    sampleRate: 44100,
    channels: 2,
    data: generateVictoryFanfare()
  },
  
  // SFX Tracks
  'sword_swing': {
    sampleRate: 44100,
    channels: 1,
    data: generateSwordSwing()
  },
  'sword_hit': {
    sampleRate: 44100,
    channels: 1,
    data: generateSwordHit()
  },
  'spell_cast': {
    sampleRate: 44100,
    channels: 1,
    data: generateSpellCast()
  },
  'heal_spell': {
    sampleRate: 44100,
    channels: 1,
    data: generateHealSpell()
  },
  'explosion': {
    sampleRate: 44100,
    channels: 1,
    data: generateExplosion()
  },
  'level_up': {
    sampleRate: 44100,
    channels: 1,
    data: generateLevelUp()
  },
  'item_pickup': {
    sampleRate: 44100,
    channels: 1,
    data: generateItemPickup()
  },
  'door_open': {
    sampleRate: 44100,
    channels: 1,
    data: generateDoorOpen()
  },
  'menu_select': {
    sampleRate: 44100,
    channels: 1,
    data: generateMenuSelect()
  },
  'menu_confirm': {
    sampleRate: 44100,
    channels: 1,
    data: generateMenuConfirm()
  },
  'menu_cancel': {
    sampleRate: 44100,
    channels: 1,
    data: generateMenuCancel()
  }
};

/**
 * Audio Manager class
 * Handles all audio playback and management
 */
export class AudioManager {
  /** Web Audio API context */
  private audioContext: AudioContext | null = null;
  
  /** Audio buffer cache */
  private audioBuffers: Map<string, AudioBuffer> = new Map();
  
  /** Currently playing tracks */
  private tracks: Map<string, AudioTrack> = new Map();
  
  /** Active SFX channels */
  private sfxChannels: AudioBufferSourceNode[] = [];
  
  /** Audio configuration */
  private config: AudioConfig = {
    masterVolume: 1.0,
    bgmVolume: 0.7,
    sfxVolume: 0.8,
    maxSFXChannels: 8,
    enabled: true
  };

  /**
   * Creates a new AudioManager instance
   */
  constructor() {
    this.initializeAudioContext();
    this.loadAudioData();
  }

  /**
   * Initializes the Web Audio API context
   */
  private initializeAudioContext(): void {
    try {
      // Try to create audio context
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      
      if (!AudioContextClass) {
        logger.warn(LogSource.AUDIO, 'Web Audio API not supported');
        return;
      }

      this.audioContext = new AudioContextClass();
      
      // Handle autoplay policy
      if (this.audioContext.state === 'suspended') {
        logger.info(LogSource.AUDIO, 'Audio context suspended, waiting for user interaction');
      }

      logger.info(LogSource.AUDIO, `Audio context initialized (${this.audioContext.sampleRate}Hz)`);
      
    } catch (error) {
      logger.error(LogSource.AUDIO, `Failed to initialize audio context: ${error}`);
    }
  }

  /**
   * Loads all hardcoded audio data into buffers
   */
  private loadAudioData(): void {
    if (!this.audioContext) return;

    for (const [id, audioData] of Object.entries(HARDCODED_AUDIO)) {
      try {
        const buffer = this.audioContext.createBuffer(
          audioData.channels,
          audioData.data.length / audioData.channels,
          audioData.sampleRate
        );

        // Copy audio data to buffer
        if (audioData.channels === 1) {
          const channelData = new Float32Array(audioData.data.length);
          channelData.set(audioData.data);
          buffer.copyToChannel(channelData, 0);
        } else {
          // Split stereo data
          const leftChannel = new Float32Array(audioData.data.length / 2);
          const rightChannel = new Float32Array(audioData.data.length / 2);
          
          for (let i = 0; i < leftChannel.length; i++) {
            leftChannel[i] = audioData.data[i * 2];
            rightChannel[i] = audioData.data[i * 2 + 1];
          }
          
          buffer.copyToChannel(leftChannel, 0);
          buffer.copyToChannel(rightChannel, 1);
        }

        this.audioBuffers.set(id, buffer);
        logger.debug(LogSource.AUDIO, `Loaded audio: ${id}`);
        
      } catch (error) {
        logger.error(LogSource.AUDIO, `Failed to load audio ${id}: ${error}`);
      }
    }

    logger.info(LogSource.AUDIO, `Loaded ${this.audioBuffers.size} audio buffers`);
  }

  /**
   * Resumes audio context (must be called after user interaction)
   */
  public async resumeAudioContext(): Promise<void> {
    if (!this.audioContext) return;

    if (this.audioContext.state === 'suspended') {
      try {
        await this.audioContext.resume();
        logger.info(LogSource.AUDIO, 'Audio context resumed');
      } catch (error) {
        logger.error(LogSource.AUDIO, `Failed to resume audio context: ${error}`);
      }
    }
  }

  /**
   * Plays a BGM track
   * @param trackId - Track identifier
   * @param loop - Whether to loop the track (default: true)
   * @param volume - Volume level (0-1, default: 1)
   */
  public playBGM(trackId: string, loop: boolean = true, volume: number = 1): void {
    if (!this.audioContext || !this.config.enabled) return;

    // Stop current BGM
    this.stopBGM();

    const buffer = this.audioBuffers.get(trackId);
    if (!buffer) {
      logger.warn(LogSource.AUDIO, `BGM track not found: ${trackId}`);
      return;
    }

    try {
      // Create gain node for volume control
      const gainNode = this.audioContext.createGain();
      gainNode.gain.value = volume * this.config.bgmVolume * this.config.masterVolume;

      // Create source
      const source = this.audioContext.createBufferSource();
      source.buffer = buffer;
      source.loop = loop;
      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // Start playback
      const startTime = this.audioContext.currentTime;
      source.start(startTime);

      // Create track record
      const track: AudioTrack = {
        id: trackId,
        audioData: HARDCODED_AUDIO[trackId],
        loop,
        volume,
        state: AudioState.PLAYING,
        source,
        gainNode,
        startTime
      };

      this.tracks.set('bgm', track);
      logger.info(LogSource.AUDIO, `Started BGM: ${trackId}`);

    } catch (error) {
      logger.error(LogSource.AUDIO, `Failed to play BGM ${trackId}: ${error}`);
    }
  }

  /**
   * Stops the current BGM track
   */
  public stopBGM(): void {
    const bgmTrack = this.tracks.get('bgm');
    if (bgmTrack) {
      this.stopTrack('bgm');
    }
  }

  /**
   * Plays a sound effect
   * @param sfxId - SFX identifier
   * @param volume - Volume level (0-1, default: 1)
   * @param pitch - Pitch multiplier (default: 1)
   */
  public playSFX(sfxId: string, volume: number = 1, pitch: number = 1): void {
    if (!this.audioContext || !this.config.enabled) return;

    const buffer = this.audioBuffers.get(sfxId);
    if (!buffer) {
      logger.warn(LogSource.AUDIO, `SFX not found: ${sfxId}`);
      return;
    }

    // Clean up finished SFX channels - simplified for now
    // Note: In a real implementation, you'd track onended events

    // Check channel limit
    if (this.sfxChannels.length >= this.config.maxSFXChannels) {
      logger.debug(LogSource.AUDIO, 'SFX channel limit reached, skipping playback');
      return;
    }

    try {
      // Create gain node
      const gainNode = this.audioContext.createGain();
      gainNode.gain.value = volume * this.config.sfxVolume * this.config.masterVolume;

      // Create source
      const source = this.audioContext.createBufferSource();
      source.buffer = buffer;
      source.playbackRate.value = pitch;
      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // Start playback
      source.start();

      // Add to channels
      this.sfxChannels.push(source);

      // Clean up when finished
      source.onended = () => {
        const index = this.sfxChannels.indexOf(source);
        if (index !== -1) {
          this.sfxChannels.splice(index, 1);
        }
      };

      logger.debug(LogSource.AUDIO, `Played SFX: ${sfxId}`);

    } catch (error) {
      logger.error(LogSource.AUDIO, `Failed to play SFX ${sfxId}: ${error}`);
    }
  }

  /**
   * Stops a specific track
   * @param trackKey - Track key ('bgm' or custom)
   */
  public stopTrack(trackKey: string): void {
    const track = this.tracks.get(trackKey);
    if (!track) return;

    try {
      if (track.source) {
        track.source.stop();
        track.source.disconnect();
      }

      if (track.gainNode) {
        track.gainNode.disconnect();
      }

      track.state = AudioState.STOPPED;
      this.tracks.delete(trackKey);

      logger.debug(LogSource.AUDIO, `Stopped track: ${trackKey}`);

    } catch (error) {
      logger.error(LogSource.AUDIO, `Failed to stop track ${trackKey}: ${error}`);
    }
  }

  /**
   * Pauses a specific track
   * @param trackKey - Track key
   */
  public pauseTrack(trackKey: string): void {
    const track = this.tracks.get(trackKey);
    if (!track || track.state !== AudioState.PLAYING) return;

    try {
      if (track.source && this.audioContext) {
        track.source.stop();
        track.pauseTime = this.audioContext.currentTime - (track.startTime || 0);
      }

      track.state = AudioState.PAUSED;
      logger.debug(LogSource.AUDIO, `Paused track: ${trackKey}`);

    } catch (error) {
      logger.error(LogSource.AUDIO, `Failed to pause track ${trackKey}: ${error}`);
    }
  }

  /**
   * Resumes a paused track
   * @param trackKey - Track key
   */
  public resumeTrack(trackKey: string): void {
    const track = this.tracks.get(trackKey);
    if (!track || track.state !== AudioState.PAUSED) return;

    // Recreate source for resumed playback
    this.playBGM(track.id, track.loop, track.volume);
  }

  /**
   * Sets the master volume
   * @param volume - Volume level (0-1)
   */
  public setMasterVolume(volume: number): void {
    this.config.masterVolume = Math.max(0, Math.min(1, volume));
    this.updateAllVolumes();
    logger.debug(LogSource.AUDIO, `Master volume set to ${this.config.masterVolume}`);
  }

  /**
   * Sets the BGM volume multiplier
   * @param volume - Volume multiplier (0-1)
   */
  public setBGMVolume(volume: number): void {
    this.config.bgmVolume = Math.max(0, Math.min(1, volume));
    this.updateAllVolumes();
    logger.debug(LogSource.AUDIO, `BGM volume set to ${this.config.bgmVolume}`);
  }

  /**
   * Sets the SFX volume multiplier
   * @param volume - Volume multiplier (0-1)
   */
  public setSFXVolume(volume: number): void {
    this.config.sfxVolume = Math.max(0, Math.min(1, volume));
    logger.debug(LogSource.AUDIO, `SFX volume set to ${this.config.sfxVolume}`);
  }

  /**
   * Enables or disables audio
   * @param enabled - Whether audio should be enabled
   */
  public setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
    
    if (!enabled) {
      this.stopAll();
    }

    logger.info(LogSource.AUDIO, `Audio ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Updates volumes for all active tracks
   */
  private updateAllVolumes(): void {
    for (const track of this.tracks.values()) {
      if (track.gainNode) {
        const targetVolume = track.volume * 
          (track.id.includes('theme') ? this.config.bgmVolume : this.config.sfxVolume) * 
          this.config.masterVolume;
        track.gainNode.gain.value = targetVolume;
      }
    }
  }

  /**
   * Stops all audio playback
   */
  public stopAll(): void {
    // Stop all tracks
    for (const trackKey of this.tracks.keys()) {
      this.stopTrack(trackKey);
    }

    // Stop all SFX
    this.sfxChannels.forEach(channel => {
      try {
        channel.stop();
      } catch (error) {
        // Ignore errors from already stopped channels
      }
    });
    this.sfxChannels = [];

    logger.debug(LogSource.AUDIO, 'Stopped all audio');
  }

  /**
   * Gets audio system statistics
   * @returns Audio statistics
   */
  public getStats(): {
    enabled: boolean;
    contextState: string;
    loadedBuffers: number;
    activeTracks: number;
    activeSFXChannels: number;
    masterVolume: number;
    bgmVolume: number;
    sfxVolume: number;
  } {
    return {
      enabled: this.config.enabled,
      contextState: this.audioContext?.state || 'unavailable',
      loadedBuffers: this.audioBuffers.size,
      activeTracks: this.tracks.size,
      activeSFXChannels: this.sfxChannels.length,
      masterVolume: this.config.masterVolume,
      bgmVolume: this.config.bgmVolume,
      sfxVolume: this.config.sfxVolume
    };
  }

  /**
   * Disposes of the audio manager
   */
  public dispose(): void {
    this.stopAll();
    
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
    }

    this.audioBuffers.clear();
    this.tracks.clear();
    this.sfxChannels = [];

    logger.info(LogSource.AUDIO, 'Audio manager disposed');
  }
}

// ============= AUDIO GENERATION FUNCTIONS =============

/**
 * Generates title theme music
 * @returns Audio sample data
 */
function generateTitleTheme(): Float32Array {
  const duration = 8; // 8 seconds
  const sampleRate = 44100;
  const samples = duration * sampleRate;
  const data = new Float32Array(samples * 2); // Stereo

  // Simple epic theme with multiple layers
  for (let i = 0; i < samples; i++) {
    const t = i / sampleRate;
    
    // Base melody (square wave)
    const melodyFreq = 220 * Math.pow(2, [0, 2, 4, 2, 0, 3, 5, 4][Math.floor(t * 2) % 8] / 12);
    const melody = Math.sign(Math.sin(2 * Math.PI * melodyFreq * t)) * 0.3;
    
    // Harmony (sine wave)
    const harmonyFreq = melodyFreq * 0.75;
    const harmony = Math.sin(2 * Math.PI * harmonyFreq * t) * 0.2;
    
    // Bass (sine wave)
    const bassFreq = 110;
    const bassPattern = [1, 0, 0, 1, 0, 0, 1, 0][Math.floor(t * 2) % 8];
    const bass = bassPattern * Math.sin(2 * Math.PI * bassFreq * t) * 0.4;
    
    // Mix and apply envelope
    const envelope = 0.5 + 0.5 * Math.sin(2 * Math.PI * 0.25 * t);
    const mixed = (melody + harmony + bass) * envelope;
    
    // Write to stereo buffer
    data[i * 2] = mixed;
    data[i * 2 + 1] = mixed;
  }

  return data;
}

/**
 * Generates overworld theme music
 * @returns Audio sample data
 */
function generateOverworldTheme(): Float32Array {
  const duration = 12;
  const sampleRate = 44100;
  const samples = duration * sampleRate;
  const data = new Float32Array(samples * 2);

  for (let i = 0; i < samples; i++) {
    const t = i / sampleRate;
    
    // Cheerful melody
    const melodyNotes = [261.63, 293.66, 329.63, 349.23, 392.00, 349.23, 329.63, 293.66];
    const noteIndex = Math.floor(t * 4) % melodyNotes.length;
    const melodyFreq = melodyNotes[noteIndex];
    const melody = Math.sin(2 * Math.PI * melodyFreq * t) * 0.3;
    
    // Counter-melody
    const counterFreq = melodyFreq * 2;
    const counter = Math.sin(2 * Math.PI * counterFreq * t) * 0.1;
    
    // Rhythm guitar
    const rhythm = (Math.sin(2 * Math.PI * 8 * t) > 0 ? 0.2 : 0);
    
    const mixed = melody + counter + rhythm;
    
    data[i * 2] = mixed;
    data[i * 2 + 1] = mixed;
  }

  return data;
}

/**
 * Generates battle theme music
 * @returns Audio sample data
 */
function generateBattleTheme(): Float32Array {
  const duration = 6;
  const sampleRate = 44100;
  const samples = duration * sampleRate;
  const data = new Float32Array(samples * 2);

  for (let i = 0; i < samples; i++) {
    const t = i / sampleRate;
    
    // Intense battle melody
    const melodyFreq = 440 * Math.pow(2, [0, -3, -5, -3, 0, -2, -3, -2][Math.floor(t * 8) % 8] / 12);
    const melody = Math.sign(Math.sin(2 * Math.PI * melodyFreq * t)) * 0.4;
    
    // Driving rhythm
    const rhythm = Math.sin(2 * Math.PI * 16 * t) * 0.3;
    
    // Bass drum
    const kick = (Math.sin(2 * Math.PI * 2 * t) > 0 ? 0.5 : 0);
    
    const mixed = melody + rhythm + kick;
    
    data[i * 2] = mixed;
    data[i * 2 + 1] = mixed;
  }

  return data;
}

/**
 * Generates victory fanfare
 * @returns Audio sample data
 */
function generateVictoryFanfare(): Float32Array {
  const duration = 3;
  const sampleRate = 44100;
  const samples = duration * sampleRate;
  const data = new Float32Array(samples * 2);

  for (let i = 0; i < samples; i++) {
    const t = i / sampleRate;
    
    // Triumphant fanfare
    const notes = [523.25, 659.25, 783.99, 1046.50];
    const noteIndex = Math.min(Math.floor(t * 8), notes.length - 1);
    const freq = notes[noteIndex];
    
    const envelope = Math.exp(-t * 2);
    const sound = Math.sin(2 * Math.PI * freq * t) * envelope * 0.5;
    
    data[i * 2] = sound;
    data[i * 2 + 1] = sound;
  }

  return data;
}

/**
 * Generates sword swing sound effect
 * @returns Audio sample data
 */
function generateSwordSwing(): Float32Array {
  const duration = 0.3;
  const sampleRate = 44100;
  const samples = duration * sampleRate;
  const data = new Float32Array(samples);

  for (let i = 0; i < samples; i++) {
    const t = i / sampleRate;
    
    // Whoosh sound with noise and sweep
    const noise = (Math.random() - 0.5) * 0.3;
    const sweep = Math.sin(2 * Math.PI * 800 * (1 - t)) * Math.exp(-t * 5);
    
    data[i] = (noise + sweep) * Math.exp(-t * 3);
  }

  return data;
}

/**
 * Generates sword hit sound effect
 * @returns Audio sample data
 */
function generateSwordHit(): Float32Array {
  const duration = 0.2;
  const sampleRate = 44100;
  const samples = duration * sampleRate;
  const data = new Float32Array(samples);

  for (let i = 0; i < samples; i++) {
    const t = i / sampleRate;
    
    // Metallic hit sound
    const impact = Math.sin(2 * Math.PI * 2000 * t) * Math.exp(-t * 20);
    const metallic = (Math.random() - 0.5) * 0.2 * Math.exp(-t * 10);
    
    data[i] = (impact + metallic) * 0.5;
  }

  return data;
}

/**
 * Generates spell cast sound effect
 * @returns Audio sample data
 */
function generateSpellCast(): Float32Array {
  const duration = 0.5;
  const sampleRate = 44100;
  const samples = duration * sampleRate;
  const data = new Float32Array(samples);

  for (let i = 0; i < samples; i++) {
    const t = i / sampleRate;
    
    // Magical sparkle sound
    const sparkle = Math.sin(2 * Math.PI * 1200 * t) * Math.sin(2 * Math.PI * 100 * t);
    const chime = Math.sin(2 * Math.PI * 2400 * t) * 0.3;
    
    const envelope = Math.exp(-t * 2);
    data[i] = (sparkle + chime) * envelope * 0.4;
  }

  return data;
}

/**
 * Generates heal spell sound effect
 * @returns Audio sample data
 */
function generateHealSpell(): Float32Array {
  const duration = 0.8;
  const sampleRate = 44100;
  const samples = duration * sampleRate;
  const data = new Float32Array(samples);

  for (let i = 0; i < samples; i++) {
    const t = i / sampleRate;
    
    // Gentle healing sound
    const heal = Math.sin(2 * Math.PI * 800 * t) * Math.sin(2 * Math.PI * 50 * t);
    const bell = Math.sin(2 * Math.PI * 1600 * t) * 0.2;
    
    const envelope = 1 - Math.exp(-t * 3);
    data[i] = (heal + bell) * envelope * 0.3;
  }

  return data;
}

/**
 * Generates explosion sound effect
 * @returns Audio sample data
 */
function generateExplosion(): Float32Array {
  const duration = 0.6;
  const sampleRate = 44100;
  const samples = duration * sampleRate;
  const data = new Float32Array(samples);

  for (let i = 0; i < samples; i++) {
    const t = i / sampleRate;
    
    // Explosion with low frequency and noise
    const boom = Math.sin(2 * Math.PI * 60 * t) * Math.exp(-t * 2);
    const noise = (Math.random() - 0.5) * 0.5 * Math.exp(-t * 4);
    
    data[i] = (boom + noise) * 0.6;
  }

  return data;
}

/**
 * Generates level up sound effect
 * @returns Audio sample data
 */
function generateLevelUp(): Float32Array {
  const duration = 1.5;
  const sampleRate = 44100;
  const samples = duration * sampleRate;
  const data = new Float32Array(samples);

  for (let i = 0; i < samples; i++) {
    const t = i / sampleRate;
    
    // Ascending arpeggio
    const notes = [523.25, 659.25, 783.99, 1046.50];
    const noteIndex = Math.min(Math.floor(t * 16), notes.length - 1);
    const freq = notes[noteIndex];
    
    const envelope = Math.exp(-t * 1.5);
    data[i] = Math.sin(2 * Math.PI * freq * t) * envelope * 0.4;
  }

  return data;
}

/**
 * Generates item pickup sound effect
 * @returns Audio sample data
 */
function generateItemPickup(): Float32Array {
  const duration = 0.2;
  const sampleRate = 44100;
  const samples = duration * sampleRate;
  const data = new Float32Array(samples);

  for (let i = 0; i < samples; i++) {
    const t = i / sampleRate;
    
    // Sparkly pickup sound
    const sparkle = Math.sin(2 * Math.PI * 2000 * t) * 0.3;
    const chime = Math.sin(2 * Math.PI * 4000 * t) * 0.2;
    
    const envelope = Math.exp(-t * 8);
    data[i] = (sparkle + chime) * envelope;
  }

  return data;
}

/**
 * Generates door open sound effect
 * @returns Audio sample data
 */
function generateDoorOpen(): Float32Array {
  const duration = 0.8;
  const sampleRate = 44100;
  const samples = duration * sampleRate;
  const data = new Float32Array(samples);

  for (let i = 0; i < samples; i++) {
    const t = i / sampleRate;
    
    // Creaky door sound
    const creak = Math.sin(2 * Math.PI * 100 * t + Math.sin(2 * Math.PI * 20 * t) * 0.5);
    const grind = (Math.random() - 0.5) * 0.1;
    
    const envelope = 1 - t / duration;
    data[i] = (creak + grind) * envelope * 0.3;
  }

  return data;
}

/**
 * Generates menu select sound effect
 * @returns Audio sample data
 */
function generateMenuSelect(): Float32Array {
  const duration = 0.1;
  const sampleRate = 44100;
  const samples = duration * sampleRate;
  const data = new Float32Array(samples);

  for (let i = 0; i < samples; i++) {
    const t = i / sampleRate;
    
    // Simple click
    const click = Math.sin(2 * Math.PI * 1000 * t) * Math.exp(-t * 20);
    data[i] = click * 0.3;
  }

  return data;
}

/**
 * Generates menu confirm sound effect
 * @returns Audio sample data
 */
function generateMenuConfirm(): Float32Array {
  const duration = 0.15;
  const sampleRate = 44100;
  const samples = duration * sampleRate;
  const data = new Float32Array(samples);

  for (let i = 0; i < samples; i++) {
    const t = i / sampleRate;
    
    // Satisfying confirm sound
    const confirm = Math.sin(2 * Math.PI * 800 * t) + Math.sin(2 * Math.PI * 1200 * t) * 0.3;
    data[i] = confirm * Math.exp(-t * 10) * 0.4;
  }

  return data;
}

/**
 * Generates menu cancel sound effect
 * @returns Audio sample data
 */
function generateMenuCancel(): Float32Array {
  const duration = 0.2;
  const sampleRate = 44100;
  const samples = duration * sampleRate;
  const data = new Float32Array(samples);

  for (let i = 0; i < samples; i++) {
    const t = i / sampleRate;
    
    // Descending cancel sound
    const cancel = Math.sin(2 * Math.PI * 600 * (1 - t));
    data[i] = cancel * Math.exp(-t * 5) * 0.3;
  }

  return data;
}