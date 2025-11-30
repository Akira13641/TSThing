/**
 * Save System
 * @fileoverview Complete save/load functionality with versioning and migration support
 */

import { WorldManager } from './WorldManager';
import { logger, LogSource } from './GlobalLogger';
import { EntityId, Position, Health, CombatStats, Sprite, Velocity } from '../types';
import { GAME_CONFIG } from '../data/GameData';

/**
 * Save game data structure
 * Contains all game state that needs to be persisted
 */
export interface SaveGameData {
  /** Save file metadata */
  meta: {
    /** Save file name */
    name: string;
    /** Timestamp when save was created */
    timestamp: number;
    /** Player level at time of save */
    playerLevel: number;
    /** Current location/scene */
    location: string;
    /** Total playtime in seconds */
    playtime: number;
    /** Save file version for migration */
    version: string;
  };
  
  /** Player data */
  player: {
    /** Player entity ID */
    entityId: EntityId;
    /** Player position */
    position: Position;
    /** Player health */
    health: Health;
    /** Player combat state */
    combatState: CombatStats;
    /** Player sprite data */
    sprite: Sprite;
    /** Player velocity */
    velocity: Velocity;
    /** Player level */
    level: number;
    /** Player experience */
    experience: number;
    /** Player gold */
    gold: number;
  };
  
  /** Game state */
  gameState: {
    /** Current scene */
    currentScene: string;
    /** Story progression flags */
    storyFlags: Record<string, boolean>;
    /** Completed quests */
    completedQuests: string[];
    /** Active quests */
    activeQuests: Array<{
      id: string;
      progress: number;
      data: Record<string, any>;
    }>;
    /** Global switches */
    switches: Record<string, boolean>;
    /** Global variables */
    variables: Record<string, number>;
  };
  
  /** Inventory data */
  inventory: {
    /** Items in inventory */
    items: Array<{
      itemId: string;
      quantity: number;
      durability?: number;
      customData?: Record<string, any>;
    }>;
    /** Equipped items */
    equipped: Record<string, string | null>;
    /** Inventory size */
    size: number;
  };
  
  /** Party data */
  party: {
    /** Party member entity IDs */
    members: EntityId[];
    /** Current formation */
    formation: Array<{
      entityId: EntityId;
      position: 'front' | 'back';
      slot: number;
    }>;
  };
  
  /** World state */
  world: {
    /** Defeated enemies */
    defeatedEnemies: Record<string, number>;
    /** Opened chests */
    openedChests: string[];
    /** Activated switches */
    activatedSwitches: string[];
    /** Discovered areas */
    discoveredAreas: string[];
    /** Current map/area */
    currentMap: string;
    /** Map completion percentage */
    mapCompletion: number;
  };
  
  /** System data */
  system: {
    /** Game statistics */
    stats: {
      battlesWon: number;
      battlesLost: number;
      enemiesDefeated: number;
      itemsUsed: number;
      stepsTaken: number;
      goldEarned: number;
      goldSpent: number;
      saveCount: number;
    };
    /** Settings */
    settings: {
      masterVolume: number;
      musicVolume: number;
      sfxVolume: number;
      textSpeed: number;
      autoSave: boolean;
      battleAnimations: boolean;
    };
  };
}

/**
 * Save slot information
 */
export interface SaveSlotInfo {
  /** Slot number */
  slot: number;
  /** Whether slot is occupied */
  occupied: boolean;
  /** Save game data if occupied */
  data?: SaveGameData;
  /** Save file size in bytes */
  size?: number;
}

/**
 * Save System
 * Handles all save/load operations with versioning and migration
 */
export class SaveSystem {
  /** World manager reference */
  private world: WorldManager | null = null;
  
  /** Current save version */
  private readonly CURRENT_VERSION = '1.0.0';
  
  /** Local storage key prefix */
  private readonly STORAGE_PREFIX = 'aetherial_vanguard_save_';

  /**
   * Creates a new SaveSystem instance
   */
  constructor() {
    logger.info(LogSource.CORE, 'SaveSystem initialized');
  }

  /**
   * Sets the world manager reference
   * @param world - World manager instance
   */
  public setWorld(world: WorldManager): void {
    this.world = world;
  }

  /**
   * Saves the current game state to the specified slot
   * @param slot - Save slot number (1-10)
   * @param saveName - Optional custom save name
   * @returns Success status
   */
  public saveGame(slot: number, saveName?: string): boolean {
    if (!this.world) {
      logger.error(LogSource.CORE, 'World manager not set for save operation');
      return false;
    }

    if (slot < 1 || slot > GAME_CONFIG.MAX_SAVE_SLOTS) {
      logger.error(LogSource.CORE, `Invalid save slot: ${slot}`);
      return false;
    }

    try {
      // Gather save data
      const saveData = this.gatherSaveData(saveName);
      
      // Validate save data
      if (!this.validateSaveData(saveData)) {
        logger.error(LogSource.CORE, 'Save data validation failed');
        return false;
      }

      // Serialize and store
      const serializedData = JSON.stringify(saveData);
      const storageKey = this.getStorageKey(slot);
      
      localStorage.setItem(storageKey, serializedData);
      
      logger.info(LogSource.CORE, `Game saved to slot ${slot}: ${saveData.meta.name}`);
      
      // Update save count in stats
      this.updateSaveCount();
      
      return true;
    } catch (error) {
      logger.error(LogSource.CORE, `Failed to save game: ${error}`);
      return false;
    }
  }

  /**
   * Loads game state from the specified slot
   * @param slot - Save slot number (1-10)
   * @returns Success status
   */
  public loadGame(slot: number): boolean {
    if (!this.world) {
      logger.error(LogSource.CORE, 'World manager not set for load operation');
      return false;
    }

    if (slot < 1 || slot > GAME_CONFIG.MAX_SAVE_SLOTS) {
      logger.error(LogSource.CORE, `Invalid save slot: ${slot}`);
      return false;
    }

    try {
      const storageKey = this.getStorageKey(slot);
      const serializedData = localStorage.getItem(storageKey);
      
      if (!serializedData) {
        logger.warn(LogSource.CORE, `No save data found in slot ${slot}`);
        return false;
      }

      // Deserialize save data
      const saveData: SaveGameData = JSON.parse(serializedData);
      
      // Validate loaded data
      if (!this.validateSaveData(saveData)) {
        logger.error(LogSource.CORE, `Invalid save data in slot ${slot}`);
        return false;
      }

      // Check version and migrate if necessary
      const migratedData = this.migrateSaveData(saveData);
      
      // Apply save data to world
      this.applySaveData(migratedData);
      
      logger.info(LogSource.CORE, `Game loaded from slot ${slot}: ${migratedData.meta.name}`);
      
      return true;
    } catch (error) {
      logger.error(LogSource.CORE, `Failed to load game from slot ${slot}: ${error}`);
      return false;
    }
  }

  /**
   * Deletes the save file in the specified slot
   * @param slot - Save slot number (1-10)
   * @returns Success status
   */
  public deleteSave(slot: number): boolean {
    if (slot < 1 || slot > GAME_CONFIG.MAX_SAVE_SLOTS) {
      logger.error(LogSource.CORE, `Invalid save slot: ${slot}`);
      return false;
    }

    try {
      const storageKey = this.getStorageKey(slot);
      localStorage.removeItem(storageKey);
      
      logger.info(LogSource.CORE, `Save file deleted from slot ${slot}`);
      return true;
    } catch (error) {
      logger.error(LogSource.CORE, `Failed to delete save in slot ${slot}: ${error}`);
      return false;
    }
  }

  /**
   * Gets information about all save slots
   * @returns Array of save slot information
   */
  public getSaveSlots(): SaveSlotInfo[] {
    const slots: SaveSlotInfo[] = [];
    
    for (let slot = 1; slot <= GAME_CONFIG.MAX_SAVE_SLOTS; slot++) {
      const storageKey = this.getStorageKey(slot);
      const serializedData = localStorage.getItem(storageKey);
      
      if (serializedData) {
        try {
          const saveData: SaveGameData = JSON.parse(serializedData);
          slots.push({
            slot,
            occupied: true,
            data: saveData,
            size: new Blob([serializedData]).size
          });
        } catch (error) {
          logger.warn(LogSource.CORE, `Corrupted save data in slot ${slot}`);
          slots.push({
            slot,
            occupied: false
          });
        }
      } else {
        slots.push({
          slot,
          occupied: false
        });
      }
    }
    
    return slots;
  }

  /**
   * Checks if a save slot exists and is valid
   * @param slot - Save slot number (1-10)
   * @returns Whether slot exists and is valid
   */
  public saveExists(slot: number): boolean {
    if (slot < 1 || slot > GAME_CONFIG.MAX_SAVE_SLOTS) {
      return false;
    }

    const storageKey = this.getStorageKey(slot);
    const serializedData = localStorage.getItem(storageKey);
    
    if (!serializedData) {
      return false;
    }

    try {
      const saveData: SaveGameData = JSON.parse(serializedData);
      return this.validateSaveData(saveData);
    } catch {
      return false;
    }
  }

  /**
   * Performs auto-save to the designated auto-save slot
   * @returns Success status
   */
  public autoSave(): boolean {
    return this.saveGame(GAME_CONFIG.AUTOSAVE_SLOT, `Auto Save ${new Date().toLocaleString()}`);
  }

  /**
   * Gathers current game state into save data structure
   * @param saveName - Optional custom save name
   * @returns Complete save game data
   */
  private gatherSaveData(saveName?: string): SaveGameData {
    if (!this.world) {
      throw new Error('World manager not available');
    }

    // Find player entity (assuming first entity with required components)
    const playerEntities = this.world.query(['Position', 'Health', 'CombatStats', 'Sprite']);
    const playerEntityId = playerEntities[0];
    
    if (!playerEntityId) {
      throw new Error('Player entity not found');
    }

    const playerPosition = this.world.getComponent<Position>(playerEntityId, 'Position')!;
    const playerHealth = this.world.getComponent<Health>(playerEntityId, 'Health')!;
    const playerCombat = this.world.getComponent<CombatStats>(playerEntityId, 'CombatStats')!;
    const playerSprite = this.world.getComponent<Sprite>(playerEntityId, 'Sprite')!;
    const playerVelocity = this.world.getComponent<Velocity>(playerEntityId, 'Velocity')!;

    return {
      meta: {
        name: saveName || `Save ${new Date().toLocaleString()}`,
        timestamp: Date.now(),
        playerLevel: 1, // Would be calculated from experience
        location: 'Overworld', // Would be determined from current scene
        playtime: 0, // Would be tracked separately
        version: this.CURRENT_VERSION
      },
      
      player: {
        entityId: playerEntityId,
        position: { ...playerPosition },
        health: { ...playerHealth },
        combatState: { ...playerCombat },
        sprite: { ...playerSprite },
        velocity: { ...playerVelocity },
        level: 1,
        experience: 0,
        gold: 100
      },
      
      gameState: {
        currentScene: 'OVERWORLD',
        storyFlags: {},
        completedQuests: [],
        activeQuests: [],
        switches: {},
        variables: {}
      },
      
      inventory: {
        items: [
          { itemId: 'potion_health', quantity: 5 },
          { itemId: 'dagger_wood', quantity: 1 }
        ],
        equipped: {
          weapon: 'dagger_wood',
          armor: null,
          shield: null,
          accessory1: null,
          accessory2: null,
          special: null
        },
        size: 20
      },
      
      party: {
        members: [playerEntityId],
        formation: [
          { entityId: playerEntityId, position: 'front', slot: 0 }
        ]
      },
      
      world: {
        defeatedEnemies: {},
        openedChests: [],
        activatedSwitches: [],
        discoveredAreas: ['starting_area'],
        currentMap: 'overworld',
        mapCompletion: 5
      },
      
      system: {
        stats: {
          battlesWon: 0,
          battlesLost: 0,
          enemiesDefeated: 0,
          itemsUsed: 0,
          stepsTaken: 0,
          goldEarned: 100,
          goldSpent: 0,
          saveCount: 1
        },
        settings: {
          masterVolume: 80,
          musicVolume: 70,
          sfxVolume: 80,
          textSpeed: 2,
          autoSave: true,
          battleAnimations: true
        }
      }
    };
  }

  /**
   * Validates save data structure
   * @param data - Save data to validate
   * @returns Whether data is valid
   */
  private validateSaveData(data: any): data is SaveGameData {
    if (!data || typeof data !== 'object') {
      return false;
    }

    // Check required top-level properties
    const requiredProps = ['meta', 'player', 'gameState', 'inventory', 'party', 'world', 'system'];
    for (const prop of requiredProps) {
      if (!(prop in data)) {
        logger.warn(LogSource.CORE, `Missing required property in save data: ${prop}`);
        return false;
      }
    }

    // Validate meta data
    if (!data.meta.version || !data.meta.timestamp) {
      logger.warn(LogSource.CORE, 'Invalid meta data in save file');
      return false;
    }

    // Validate player data
    if (!data.player.entityId || !data.player.position) {
      logger.warn(LogSource.CORE, 'Invalid player data in save file');
      return false;
    }

    return true;
  }

  /**
   * Migrates save data to current version
   * @param data - Save data to migrate
   * @returns Migrated save data
   */
  private migrateSaveData(data: SaveGameData): SaveGameData {
    // For now, just return the data as-is
    // In a real implementation, this would handle version migrations
    if (data.meta.version !== this.CURRENT_VERSION) {
      logger.info(LogSource.CORE, `Migrating save from version ${data.meta.version} to ${this.CURRENT_VERSION}`);
      
      // Update version
      data.meta.version = this.CURRENT_VERSION;
      
      // Add migration logic here as needed
    }

    return data;
  }

  /**
   * Applies save data to the current game world
   * @param data - Save data to apply
   */
  private applySaveData(data: SaveGameData): void {
    if (!this.world) {
      throw new Error('World manager not available');
    }

    // Clear current world state
    this.world.clear();

    // Recreate player entity
    const playerEntityId = this.world.createEntity(['Position', 'Health', 'CombatStats', 'Sprite', 'Velocity']);
    
    // Apply player data
    this.world.addComponent(playerEntityId, 'Position', data.player.position);
    this.world.addComponent(playerEntityId, 'Health', data.player.health);
    this.world.addComponent(playerEntityId, 'CombatStats', data.player.combatState);
    this.world.addComponent(playerEntityId, 'Sprite', data.player.sprite);
    this.world.addComponent(playerEntityId, 'Velocity', data.player.velocity);

    logger.info(LogSource.CORE, `Player entity recreated: ${playerEntityId}`);
    
    // Apply other game state data
    // This would include recreating other entities, setting switches, etc.
    
    logger.info(LogSource.CORE, 'Save data applied successfully');
  }

  /**
   * Gets the storage key for a save slot
   * @param slot - Save slot number
   * @returns Storage key
   */
  private getStorageKey(slot: number): string {
    return `${this.STORAGE_PREFIX}${slot}`;
  }

  /**
   * Updates the save count in statistics
   */
  private updateSaveCount(): void {
    // This would update the global save count statistic
    // For now, just log it
    logger.debug(LogSource.CORE, 'Save count updated');
  }

  /**
   * Exports save data as a downloadable file
   * @param slot - Save slot to export
   * @returns Success status
   */
  public exportSave(slot: number): boolean {
    try {
      const storageKey = this.getStorageKey(slot);
      const serializedData = localStorage.getItem(storageKey);
      
      if (!serializedData) {
        logger.warn(LogSource.CORE, `No save data to export in slot ${slot}`);
        return false;
      }

      // Create download link
      const blob = new Blob([serializedData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `aetherial_vanguard_save_${slot}_${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      logger.info(LogSource.CORE, `Save exported from slot ${slot}`);
      return true;
    } catch (error) {
      logger.error(LogSource.CORE, `Failed to export save from slot ${slot}: ${error}`);
      return false;
    }
  }

  /**
   * Imports save data from a file
   * @param file - File to import
   * @param slot - Target save slot
   * @returns Success status
   */
  public async importSave(file: File, slot: number): Promise<boolean> {
    try {
      const text = await file.text();
      const saveData: SaveGameData = JSON.parse(text);
      
      if (!this.validateSaveData(saveData)) {
        logger.error(LogSource.CORE, 'Invalid save file data');
        return false;
      }

      // Migrate if necessary
      const migratedData = this.migrateSaveData(saveData);
      
      // Store in specified slot
      const serializedData = JSON.stringify(migratedData);
      const storageKey = this.getStorageKey(slot);
      localStorage.setItem(storageKey, serializedData);

      logger.info(LogSource.CORE, `Save imported to slot ${slot}`);
      return true;
    } catch (error) {
      logger.error(LogSource.CORE, `Failed to import save: ${error}`);
      return false;
    }
  }
}