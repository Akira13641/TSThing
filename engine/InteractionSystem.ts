/**
 * Interaction System
 * @fileoverview System for handling player interactions with objects, NPCs, and environment
 */

import { WorldManager } from './WorldManager';
import { logger, LogSource } from './GlobalLogger';
import { EntityId, Position, Health } from '../types';

/**
 * Interaction types
 */
export enum InteractionType {
  /** Talk to NPC */
  TALK = 'TALK',
  /** Examine object */
  EXAMINE = 'EXAMINE',
  /** Pick up item */
  PICKUP = 'PICKUP',
  /** Use object */
  USE = 'USE',
  /** Open door/chest */
  OPEN = 'OPEN',
  /** Activate switch */
  ACTIVATE = 'ACTIVATE',
  /** Enter area/portal */
  ENTER = 'ENTER',
  /** Read sign/text */
  READ = 'READ',
  /** Shop transaction */
  SHOP = 'SHOP',
  /** Save point */
  SAVE = 'SAVE'
}

/**
 * Interaction trigger conditions
 */
export enum InteractionCondition {
  /** Always available */
  ALWAYS = 'ALWAYS',
  /** Requires specific item */
  REQUIRES_ITEM = 'REQUIRES_ITEM',
  /** Requires story flag */
  REQUIRES_FLAG = 'REQUIRES_FLAG',
  /** Requires minimum level */
  REQUIRES_LEVEL = 'REQUIRES_LEVEL',
  /** Requires specific quest state */
  REQUIRES_QUEST = 'REQUIRES_QUEST',
  /** Time of day */
  REQUIRES_TIME = 'REQUIRES_TIME',
  /** Custom condition function */
  CUSTOM = 'CUSTOM'
}

/**
 * Interaction component for interactive entities
 */
export interface Interaction {
  /** Unique interaction ID */
  id: string;
  /** Type of interaction */
  type: InteractionType;
  /** Display name for interaction prompt */
  name: string;
  /** Description text */
  description: string;
  /** Interaction range in pixels */
  range: number;
  /** Whether interaction is currently enabled */
  enabled: boolean;
  /** Whether interaction is one-time use */
  singleUse: boolean;
  /** Whether interaction has been used */
  used: boolean;
  /** Trigger conditions */
  conditions: Array<{
    type: InteractionCondition;
    value: string | number | boolean;
    negate?: boolean;
  }>;
  /** Interaction actions */
  actions: InteractionAction[];
  /** Custom condition function */
  customCondition?: (playerId: EntityId, entityId: EntityId) => boolean;
}

/**
 * Interaction action types
 */
export enum InteractionActionType {
  /** Show dialog */
  DIALOG = 'DIALOG',
  /** Give item to player */
  GIVE_ITEM = 'GIVE_ITEM',
  /** Take item from player */
  TAKE_ITEM = 'TAKE_ITEM',
  /** Set story flag */
  SET_FLAG = 'SET_FLAG',
  /** Teleport player */
  TELEPORT = 'TELEPORT',
  /** Start battle */
  START_BATTLE = 'START_BATTLE',
  /** Play sound effect */
  PLAY_SOUND = 'PLAY_SOUND',
  /** Start quest */
  START_QUEST = 'START_QUEST',
  /** Complete quest */
  COMPLETE_QUEST = 'COMPLETE_QUEST',
  /** Heal player */
  HEAL = 'HEAL',
  /** Save game */
  SAVE_GAME = 'SAVE_GAME',
  /** Custom action function */
  CUSTOM = 'CUSTOM'
}

/**
 * Interaction action definition
 */
export interface InteractionAction {
  /** Action type */
  type: InteractionActionType;
  /** Action parameters */
  parameters: Record<string, any>;
  /** Delay before executing action (seconds) */
  delay?: number;
  /** Custom action function */
  customAction?: (playerId: EntityId, entityId: EntityId) => void;
}

/**
 * Interaction prompt data
 */
export interface InteractionPrompt {
  /** Entity ID offering interaction */
  entityId: EntityId;
  /** Interaction component */
  interaction: Interaction;
  /** Distance from player */
  distance: number;
  /** Priority for multiple interactions */
  priority: number;
}

/**
 * Interaction System
 * Handles all player interactions with the game world
 */
export class InteractionSystem {
  /** World manager reference */
  private world: WorldManager | null = null;

  /** Player entity ID */
  private playerId: EntityId | null = null;

  /** Currently available interactions */
  private availableInteractions: InteractionPrompt[] = [];

  /** Active interaction (being processed) */
  private activeInteraction: { entityId: EntityId; interaction: Interaction } | null = null;

  /** Interaction range multiplier */
  private rangeMultiplier: number = 1.0;

  /** Story flags */
  private storyFlags: Record<string, boolean> = {};

  /** Player inventory (simplified) */
  private playerInventory: Set<string> = new Set();

  /** Player level */
  private playerLevel: number = 1;

  /**
   * Creates a new InteractionSystem instance
   */
  constructor() {
    logger.info(LogSource.GAMEPLAY, 'InteractionSystem initialized');
  }

  /**
   * Sets the world manager reference
   * @param world - World manager instance
   */
  public setWorld(world: WorldManager): void {
    this.world = world;
  }

  /**
   * Sets the player entity ID
   * @param playerId - Player entity ID
   */
  public setPlayer(playerId: EntityId): void {
    this.playerId = playerId;
    logger.debug(LogSource.GAMEPLAY, `Player entity set to ${playerId}`);
  }

  /**
   * Sets interaction range multiplier
   * @param multiplier - Range multiplier
   */
  public setRangeMultiplier(multiplier: number): void {
    this.rangeMultiplier = Math.max(0.1, Math.min(3.0, multiplier));
    logger.debug(LogSource.GAMEPLAY, `Interaction range multiplier set to ${this.rangeMultiplier}`);
  }

  /**
   * Sets story flag
   * @param flag - Flag name
   * @param value - Flag value
   */
  public setStoryFlag(flag: string, value: boolean): void {
    this.storyFlags[flag] = value;
    logger.debug(LogSource.GAMEPLAY, `Story flag ${flag} set to ${value}`);
  }

  /**
   * Gets story flag value
   * @param flag - Flag name
   * @returns Flag value
   */
  public getStoryFlag(flag: string): boolean {
    return this.storyFlags[flag] || false;
  }

  /**
   * Adds item to player inventory
   * @param itemId - Item ID
   */
  public addItemToInventory(itemId: string): void {
    this.playerInventory.add(itemId);
    logger.debug(LogSource.GAMEPLAY, `Item ${itemId} added to inventory`);
  }

  /**
   * Removes item from player inventory
   * @param itemId - Item ID
   */
  public removeItemFromInventory(itemId: string): void {
    this.playerInventory.delete(itemId);
    logger.debug(LogSource.GAMEPLAY, `Item ${itemId} removed from inventory`);
  }

  /**
   * Checks if player has item
   * @param itemId - Item ID
   * @returns Whether player has item
   */
  public hasItem(itemId: string): boolean {
    return this.playerInventory.has(itemId);
  }

  /**
   * Sets player level
   * @param level - Player level
   */
  public setPlayerLevel(level: number): void {
    this.playerLevel = Math.max(1, level);
    logger.debug(LogSource.GAMEPLAY, `Player level set to ${this.playerLevel}`);
  }

  /**
   * Creates an interactive entity
   * @param interaction - Interaction component data
   * @returns Entity ID
   */
  public createInteractiveEntity(interaction: Interaction): EntityId {
    if (!this.world) {
      throw new Error('World manager not set');
    }

    const entityId = this.world.createEntity(['Position', 'Collision', 'Interaction']);

    // Add components (would need actual position and collision data)
    // this.world.addComponent(entityId, 'Position', { x: 0, y: 0 });
    // this.world.addComponent(entityId, 'Collision', { width: 32, height: 32, solid: false });
    this.world.addComponent(entityId, 'Interaction', interaction);

    logger.debug(LogSource.GAMEPLAY, `Interactive entity created: ${interaction.id}`);

    return entityId;
  }

  /**
   * Updates interaction system
   * @param deltaTime - Time since last frame in seconds
   */
  public update(deltaTime: number): void {
    if (!this.world || this.playerId === null) return;

    // Update available interactions
    this.updateAvailableInteractions();

    // Process active interaction
    if (this.activeInteraction) {
      this.processActiveInteraction(deltaTime);
    }
  }

  /**
   * Attempts to interact with the nearest available object
   * @returns Whether interaction was successful
   */
  public interact(): boolean {
    if (!this.world || !this.playerId) return false;

    // Sort interactions by priority and distance
    const sortedInteractions = this.availableInteractions
      .sort((a, b) => {
        // First by priority (higher first)
        if (a.priority !== b.priority) {
          return b.priority - a.priority;
        }
        // Then by distance (closer first)
        return a.distance - b.distance;
      });

    if (sortedInteractions.length === 0) {
      logger.debug(LogSource.GAMEPLAY, 'No available interactions');
      return false;
    }

    const bestInteraction = sortedInteractions[0];

    // Check if interaction conditions are met
    if (!this.checkInteractionConditions(bestInteraction.interaction, this.playerId, bestInteraction.entityId)) {
      logger.debug(LogSource.GAMEPLAY, `Interaction conditions not met: ${bestInteraction.interaction.id}`);
      return false;
    }

    // Start interaction
    this.startInteraction(bestInteraction.entityId, bestInteraction.interaction);

    return true;
  }

  /**
   * Gets current available interactions
   * @returns Array of available interaction prompts
   */
  public getAvailableInteractions(): InteractionPrompt[] {
    return [...this.availableInteractions];
  }

  /**
   * Gets the best interaction prompt for UI display
   * @returns Best interaction prompt or null
   */
  public getBestInteraction(): InteractionPrompt | null {
    if (this.availableInteractions.length === 0) return null;

    return this.availableInteractions
      .sort((a, b) => {
        if (a.priority !== b.priority) {
          return b.priority - a.priority;
        }
        return a.distance - b.distance;
      })[0];
  }

  /**
   * Updates list of available interactions
   */
  private updateAvailableInteractions(): void {
    if (!this.world || this.playerId === null) return;

    this.availableInteractions = [];

    // Get player position
    const playerPosition = this.world.getComponent<Position>(this.playerId, 'Position');
    if (!playerPosition) {
      logger.debug(LogSource.GAMEPLAY, `Player position not found for ID ${this.playerId}`);
      return;
    }

    // Find all entities with Interaction components
    const interactiveEntities = this.world.query(['Interaction']);
    logger.debug(LogSource.GAMEPLAY, `Found ${interactiveEntities.length} entities with Interaction component`);

    for (const entityId of interactiveEntities) {
      if (entityId === this.playerId) continue; // Skip self

      const interaction = this.world.getComponent<Interaction>(entityId, 'Interaction');
      const entityPosition = this.world.getComponent<Position>(entityId, 'Position');

      if (!interaction) {
        logger.debug(LogSource.GAMEPLAY, `Entity ${entityId} missing Interaction component`);
        continue;
      }
      if (!entityPosition) {
        logger.debug(LogSource.GAMEPLAY, `Entity ${entityId} missing Position component`);
        continue;
      }

      // Check if interaction is enabled and not used (if single use)
      if (!interaction.enabled) {
        logger.debug(LogSource.GAMEPLAY, `Interaction ${interaction.id} disabled`);
        continue;
      }
      if (interaction.singleUse && interaction.used) {
        logger.debug(LogSource.GAMEPLAY, `Interaction ${interaction.id} already used`);
        continue;
      }

      // Calculate distance
      const distance = this.calculateDistance(playerPosition, entityPosition);
      const effectiveRange = interaction.range * this.rangeMultiplier;

      logger.debug(LogSource.GAMEPLAY, `Entity ${entityId} distance: ${distance}, range: ${effectiveRange}`);

      // Check if within range
      if (distance > effectiveRange) {
        logger.debug(LogSource.GAMEPLAY, `Entity ${entityId} out of range`);
        continue;
      }

      // Check conditions
      if (!this.checkInteractionConditions(interaction, this.playerId, entityId)) {
        logger.debug(LogSource.GAMEPLAY, `Interaction ${interaction.id} conditions not met`);
        continue;
      }

      // Add to available interactions
      this.availableInteractions.push({
        entityId: entityId,
        interaction,
        distance,
        priority: this.calculateInteractionPriority(interaction)
      });
    }

    logger.debug(LogSource.GAMEPLAY, `Found ${this.availableInteractions.length} available interactions`);
  }

  /**
   * Checks if interaction conditions are met
   * @param interaction - Interaction to check
   * @param playerId - Player entity ID
   * @param entityId - Entity ID
   * @returns Whether conditions are met
   */
  private checkInteractionConditions(interaction: Interaction, playerId: EntityId, entityId: EntityId): boolean {
    for (const condition of interaction.conditions) {
      let conditionMet = false;

      switch (condition.type) {
        case InteractionCondition.ALWAYS:
          conditionMet = true;
          break;

        case InteractionCondition.REQUIRES_ITEM:
          conditionMet = this.hasItem(condition.value as string);
          break;

        case InteractionCondition.REQUIRES_FLAG:
          conditionMet = this.getStoryFlag(condition.value as string);
          break;

        case InteractionCondition.REQUIRES_LEVEL:
          conditionMet = this.playerLevel >= (condition.value as number);
          break;

        case InteractionCondition.CUSTOM:
          if (interaction.customCondition) {
            conditionMet = interaction.customCondition(playerId, entityId);
          }
          break;

        default:
          conditionMet = false;
      }

      // Apply negation if specified
      if (condition.negate) {
        conditionMet = !conditionMet;
      }

      // When negated, return true if condition is not met (player doesn't have item)
      // When not negated, return true if condition is met (player has item)
      return condition.negate ? !conditionMet : conditionMet;
      }
  }

  /**
   * Starts an interaction
   * @param entityId - Entity ID
   * @param interaction - Interaction component
   */
  private startInteraction(entityId: EntityId, interaction: Interaction): void {
    logger.info(LogSource.GAMEPLAY, `Starting interaction: ${interaction.id} `);

    this.activeInteraction = { entityId, interaction };

    // Mark as used if single use
    if (interaction.singleUse) {
      interaction.used = true;
    }

    // Execute actions
    this.executeInteractionActions(entityId, interaction);
  }

  /**
   * Executes interaction actions
   * @param entityId - Entity ID
   * @param interaction - Interaction component
   */
  private executeInteractionActions(entityId: EntityId, interaction: Interaction): void {
    for (const action of interaction.actions) {
      // Apply delay if specified
      if (action.delay && action.delay > 0) {
        setTimeout(() => {
          this.executeAction(entityId, action);
        }, action.delay * 1000);
      } else {
        this.executeAction(entityId, action);
      }
    }
  }

  /**
   * Executes a single interaction action
   * @param entityId - Entity ID
   * @param action - Action to execute
   */
  private executeAction(entityId: EntityId, action: InteractionAction): void {
    logger.debug(LogSource.GAMEPLAY, `Executing action: ${action.type} `);

    switch (action.type) {
      case InteractionActionType.DIALOG:
        this.showDialog(action.parameters.text);
        break;

      case InteractionActionType.GIVE_ITEM:
        this.addItemToInventory(action.parameters.itemId);
        this.showDialog(`Received ${action.parameters.itemId} !`);
        break;

      case InteractionActionType.TAKE_ITEM:
        this.removeItemFromInventory(action.parameters.itemId);
        break;

      case InteractionActionType.SET_FLAG:
        this.setStoryFlag(action.parameters.flag, action.parameters.value);
        break;

      case InteractionActionType.TELEPORT:
        this.teleportPlayer(action.parameters.x, action.parameters.y);
        break;

      case InteractionActionType.START_BATTLE:
        this.startBattle(action.parameters.enemyIds);
        break;

      case InteractionActionType.HEAL:
        this.healPlayer(action.parameters.amount || 999);
        break;

      case InteractionActionType.SAVE_GAME:
        this.saveGame();
        break;

      case InteractionActionType.CUSTOM:
        if (action.customAction && this.playerId) {
          action.customAction(this.playerId, entityId);
        }
        break;
    }
  }

  /**
   * Processes active interaction
   * @param deltaTime - Time since last frame in seconds
   */
  private processActiveInteraction(_deltaTime: number): void {
    // This would handle ongoing interactions (like dialog choices)
    // For now, just clear the interaction after actions are executed
    setTimeout(() => {
      this.activeInteraction = null;
    }, 100);
  }

  /**
   * Calculates distance between two positions
   * @param pos1 - First position
   * @param pos2 - Second position
   * @returns Distance
   */
  private calculateDistance(pos1: Position, pos2: Position): number {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Calculates interaction priority
   * @param interaction - Interaction component
   * @returns Priority value
   */
  private calculateInteractionPriority(interaction: Interaction): number {
    // Higher priority for certain interaction types
    switch (interaction.type) {
      case InteractionType.TALK:
        return 10;
      case InteractionType.SHOP:
        return 9;
      case InteractionType.SAVE:
        return 8;
      case InteractionType.PICKUP:
        return 7;
      case InteractionType.OPEN:
        return 6;
      case InteractionType.USE:
        return 5;
      case InteractionType.ACTIVATE:
        return 4;
      case InteractionType.ENTER:
        return 3;
      case InteractionType.READ:
        return 2;
      case InteractionType.EXAMINE:
        return 1;
      default:
        return 0;
    }
  }

  /**
   * Shows dialog (would integrate with dialog system)
   * @param text - Dialog text
   */
  private showDialog(text: string): void {
    logger.debug(LogSource.GAMEPLAY, `Dialog: ${text} `);
    // This would integrate with the actual dialog system
  }

  /**
   * Teleports player to position
   * @param x - Target X position
   * @param y - Target Y position
   */
  private teleportPlayer(x: number, y: number): void {
    if (!this.world || !this.playerId) return;

    const position = this.world.getComponent<Position>(this.playerId, 'Position');
    if (position) {
      position.x = x;
      position.y = y;
      this.world.updateComponent(this.playerId, 'Position', position);
      logger.debug(LogSource.GAMEPLAY, `Player teleported to(${x}, ${y})`);
    }
  }

  /**
   * Starts battle with enemies
   * @param enemyIds - Array of enemy entity IDs
   */
  private startBattle(enemyIds: string[]): void {
    logger.debug(LogSource.GAMEPLAY, `Starting battle with enemies: ${enemyIds.join(', ')} `);
    // This would integrate with the combat system
  }

  /**
   * Heals player
   * @param amount - Amount to heal
   */
  private healPlayer(amount: number): void {
    if (!this.world || !this.playerId) return;

    const health = this.world.getComponent<Health>(this.playerId, 'Health');
    if (health) {
      const healAmount = Math.min(amount, health.max - health.current);
      health.current = Math.min(health.max, health.current + amount);
      this.world.updateComponent(this.playerId, 'Health', health);
      logger.debug(LogSource.GAMEPLAY, `Player healed for ${healAmount} HP`);
    }
  }

  /**
   * Saves the game
   */
  private saveGame(): void {
    logger.debug(LogSource.GAMEPLAY, 'Saving game...');
    // This would integrate with the save system
  }
}