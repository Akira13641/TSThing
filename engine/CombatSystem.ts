/**
 * Turn-Based Combat System
 * @fileoverview Complete combat system with state machine, action queueing, and enemy AI
 */

import { WorldManager } from './WorldManager';
import { logger, LogSource } from './GlobalLogger';
import { EntityId, Position, Health, CombatStats, Animation, Sprite } from '../types';
import { GAME_CONFIG } from '../data/GameData';

/**
 * Combat state enumeration
 */
export enum CombatState {
  INTRO = 'INTRO',
  PLAYER_INPUT = 'PLAYER_INPUT',
  ACTION_PROCESSING = 'ACTION_PROCESSING',
  ENEMY_TURN = 'ENEMY_TURN',
  RESOLUTION = 'RESOLUTION',
  VICTORY = 'VICTORY',
  DEFEAT = 'DEFEAT'
}

/**
 * Combat action types
 */
export enum CombatAction {
  ATTACK = 'ATTACK',
  DEFEND = 'DEFEND',
  SKILL = 'SKILL',
  ITEM = 'ITEM',
  FLEE = 'FLEE'
}

/**
 * Combat action queue item
 */
interface CombatActionQueue {
  /** Unique action ID */
  id: string;
  /** Action type */
  type: CombatAction;
  /** Entity performing the action */
  actorId: EntityId;
  /** Target entity ID */
  targetId: EntityId | null;
  /** Action data */
  data: {
    skillId?: string;
    itemId?: string;
    damage?: number;
    priority?: number;
  };
  /** Whether action is ready to execute */
  ready: boolean;
  /** Execution delay in seconds */
  delay: number;
  /** Current delay timer */
  timer: number;
}

/**
 * Combat participant
 */
interface CombatParticipant {
  /** Entity ID */
  entityId: EntityId;
  /** Whether this is the player */
  isPlayer: boolean;
  /** Original position for combat */
  originalPosition: Position;
  /** Current turn order */
  turnOrder: number;
  /** Whether participant is defeated */
  defeated: boolean;
  /** Last action taken */
  lastAction: CombatAction | null;
  /** Health component data */
  health?: Health;
  /** Combat stats component data */
  combatStats?: CombatStats;
}

/**
 * Combat result
 */
interface CombatResult {
  /** Whether combat was victorious */
  victory: boolean;
  /** Experience gained */
  experience: number;
  /** Gold gained */
  gold: number;
  /** Items obtained */
  items: Array<{ itemId: string; quantity: number }>;
}

/**
 * Turn-Based Combat System
 * Manages all combat mechanics with proper state machine and action queueing
 */
export class CombatSystem {
  /** Current combat state */
  private currentState: CombatState = CombatState.INTRO;
  
  /** Combat participants */
  private participants: Map<EntityId, CombatParticipant> = new Map();
  
  /** Action queue */
  private actionQueue: CombatActionQueue[] = [];
  
  /** Current turn participant */
  private currentTurn: EntityId | null = null;
  
  /** Turn order counter */
  private turnCounter: number = 0;
  
  /** Combat result */
  private result: CombatResult | null = null;
  
  /** World manager reference */
  private world: WorldManager | null = null;
  
  /** Animation callbacks */
  private onAnimationComplete: Map<string, () => void> = new Map();

  /**
   * Creates a new CombatSystem instance
   */
  constructor() {
    logger.info(LogSource.COMBAT, 'CombatSystem initialized');
  }

  /**
   * Sets the world manager reference
   * @param world - World manager instance
   */
  public setWorld(world: WorldManager): void {
    this.world = world;
  }

  /**
   * Starts combat with specified participants
   * @param playerEntityId - Player entity ID
   * @param enemyEntityIds - Array of enemy entity IDs
   */
  public startCombat(playerEntityId: EntityId, enemyEntityIds: EntityId[]): void {
    if (!this.world) {
      logger.error(LogSource.COMBAT, 'World manager not set');
      return;
    }

    // Clear previous combat state
    this.endCombat();

    // Add player participant
    this.participants.set(playerEntityId, {
      entityId: playerEntityId,
      isPlayer: true,
      originalPosition: { ...this.world.getComponent<Position>(playerEntityId, 'Position')! },
      turnOrder: 0,
      defeated: false,
      lastAction: null,
      health: this.world.getComponent<Health>(playerEntityId, 'Health') || undefined,
      combatStats: this.world.getComponent<CombatStats>(playerEntityId, 'CombatStats') || undefined
    });

    // Add enemy participants
    enemyEntityIds.forEach((enemyId, index) => {
      const position = this.world.getComponent<Position>(enemyId, 'Position');
      if (position) {
        this.participants.set(enemyId, {
          entityId: enemyId,
          isPlayer: false,
          originalPosition: { ...position },
          turnOrder: index + 1,
          defeated: false,
          lastAction: null,
          health: this.world.getComponent<Health>(enemyId, 'Health') || undefined,
          combatStats: this.world.getComponent<CombatStats>(enemyId, 'CombatStats') || undefined
        });
      }
    });

    // Set initial combat state
    this.currentState = CombatState.INTRO;
    this.turnCounter = 0;

    logger.info(LogSource.COMBAT, `Combat started: Player vs ${enemyEntityIds.length} enemies`);

    // Start combat sequence
    this.startCombatSequence();
  }

  /**
   * Starts the combat sequence
   */
  private startCombatSequence(): void {
    switch (this.currentState) {
      case CombatState.INTRO:
        this.startCombatIntro();
        break;
      case CombatState.PLAYER_INPUT:
        this.startPlayerTurn();
        break;
      case CombatState.ENEMY_TURN:
        this.startEnemyTurn();
        break;
      case CombatState.ACTION_PROCESSING:
        this.processActions();
        break;
      case CombatState.RESOLUTION:
        this.resolveCombat();
        break;
      case CombatState.VICTORY:
      this.handleVictory();
        break;
      case CombatState.DEFEAT:
        this.handleDefeat();
        break;
    }
  }

  /**
   * Starts combat introduction
   */
  private startCombatIntro(): void {
    logger.debug(LogSource.COMBAT, 'Starting combat intro');
    
    // Play battle music
    // In a real implementation, this would trigger audio system
    logger.debug(LogSource.COMBAT, 'Playing battle theme');

    // Show combat start message
    // In a real implementation, this would trigger dialog system
    logger.debug(LogSource.COMBAT, 'Combatants appear!');

    // Transition to player input after delay
    setTimeout(() => {
      this.currentState = CombatState.PLAYER_INPUT;
      this.startCombatSequence();
    }, 2000); // 2 second intro
  }

  /**
   * Starts player turn
   */
  private startPlayerTurn(): void {
    logger.debug(LogSource.COMBAT, 'Starting player turn');
    
    // Clear action queue
    this.actionQueue = [];
    
    // Enable player input
    // In a real implementation, this would enable combat UI
    logger.debug(LogSource.COMBAT, 'Player input enabled');
  }

  /**
   * Starts enemy turn
   */
  private startEnemyTurn(): void {
    logger.debug(LogSource.COMBAT, 'Starting enemy turn');
    
    // Clear action queue
    this.actionQueue = [];
    
    // Process AI for all alive enemies
    const aliveEnemies = Array.from(this.participants.values())
      .filter(p => !p.isPlayer && !p.defeated)
      .sort((a, b) => a.turnOrder - b.turnOrder);

    aliveEnemies.forEach(enemy => {
      this.processEnemyAI(enemy.entityId);
    });

    // Transition to action processing after AI decisions
    setTimeout(() => {
      this.currentState = CombatState.ACTION_PROCESSING;
      this.startCombatSequence();
    }, 1000);
  }

  /**
   * Processes enemy AI for a specific enemy
   * @param enemyId - Enemy entity ID
   */
  private processEnemyAI(enemyId: EntityId): void {
    const enemy = this.participants.get(enemyId);
    if (!enemy || enemy.defeated) return;

    const combatState = this.world?.getComponent<CombatStats>(enemyId, 'CombatStats');
    if (!combatState) return;

    // Simple AI logic
    const health = this.world?.getComponent<Health>(enemyId, 'Health');
    if (!health || health.current <= 0) return;

    // Decision making based on health
    let action: CombatAction;
    let targetId: EntityId | null = null;

    if (health.current < health.max * 0.3) {
      // Low health - more likely to defend or flee
      if (Math.random() < 0.7) {
        action = CombatAction.DEFEND;
      } else {
        action = CombatAction.FLEE;
      }
    } else {
      // Good health - more likely to attack
      action = CombatAction.ATTACK;
      // Find player target
      const playerParticipant = Array.from(this.participants.values())
        .find(p => p.isPlayer && !p.defeated);
      if (playerParticipant) {
        targetId = playerParticipant.entityId;
      }
    }

    // Queue the action
    this.queueAction({
      id: `enemy_${enemyId}_${Date.now()}`,
      type: action,
      actorId: enemyId,
      targetId,
      data: {
        damage: combatState.attack,
        priority: enemy.turnOrder
      }
    });

    logger.debug(LogSource.COMBAT, `Enemy ${enemyId} decided to ${action}`);
  }

  /**
   * Queues a combat action
   * @param action - Action to queue
   */
  public queueAction(action: Omit<CombatActionQueue, 'ready' | 'timer' | 'delay'>): void {
    const queueItem: CombatActionQueue = {
      ...action,
      ready: false,
      delay: this.calculateActionDelay(action.type),
      timer: 0
    };

    this.actionQueue.push(queueItem);
    logger.debug(LogSource.COMBAT, `Queued action: ${action.type} by ${action.actorId}`);
  }

  /**
   * Calculates action delay based on action type
   * @param actionType - Type of action
   * @returns Delay in seconds
   */
  private calculateActionDelay(actionType: CombatAction): number {
    switch (actionType) {
      case CombatAction.ATTACK:
        return 1.0; // 1 second for attacks
      case CombatAction.DEFEND:
        return 0.5; // 0.5 seconds for defend
      case CombatAction.SKILL:
        return 2.0; // 2 seconds for skills
      case CombatAction.ITEM:
        return 1.5; // 1.5 seconds for items
      case CombatAction.FLEE:
        return 0.3; // 0.3 seconds for flee
      default:
        return 1.0;
    }
  }

  /**
   * Processes all queued actions
   */
  private processActions(): void {
    logger.debug(LogSource.COMBAT, 'Processing queued actions');

    // Update timers and check for ready actions
    const deltaTime = 1 / 60; // Assuming 60 FPS
    const readyActions: CombatActionQueue[] = [];

    this.actionQueue = this.actionQueue.map(action => {
      if (!action.ready) {
        action.timer += deltaTime;
        if (action.timer >= action.delay) {
          action.ready = true;
          readyActions.push(action);
        }
      }
      return action;
    });

    // Remove completed actions from queue
    this.actionQueue = this.actionQueue.filter(action => !action.ready);

    // Execute ready actions in priority order
    readyActions
      .sort((a, b) => (b.data.priority || 0) - (a.data.priority || 0))
      .forEach(action => {
        this.executeAction(action);
      });

    // Check if all actions are processed
    if (this.actionQueue.length === 0) {
      this.checkCombatEnd();
    }
  }

  /**
   * Executes a single combat action
   * @param action - Action to execute
   */
  private executeAction(action: CombatActionQueue): void {
    const actor = this.participants.get(action.actorId);
    if (!actor || actor.defeated) return;

    logger.debug(LogSource.COMBAT, `Executing ${action.type} by ${action.actorId}`);

    switch (action.type) {
      case CombatAction.ATTACK:
        this.executeAttack(action);
        break;
      case CombatAction.DEFEND:
        this.executeDefend(action);
        break;
      case CombatAction.SKILL:
        this.executeSkill(action);
        break;
      case CombatAction.ITEM:
        this.executeItem(action);
        break;
      case CombatAction.FLEE:
        this.executeFlee(action);
        break;
    }

    // Update last action
    actor.lastAction = action.type;
  }

  /**
   * Executes an attack action
   * @param action - Attack action data
   */
  private executeAttack(action: CombatActionQueue): void {
    const attacker = this.participants.get(action.actorId);
    const target = action.targetId ? this.participants.get(action.targetId) : null;

    if (!attacker || !target) return;

    const attackerCombat = this.world?.getComponent<CombatStats>(attacker.entityId, 'CombatStats');
    const targetHealth = this.world?.getComponent<Health>(target.entityId, 'Health');
    const targetCombat = this.world?.getComponent<CombatStats>(target.entityId, 'CombatStats');

    if (!attackerCombat || !targetHealth || !targetCombat) return;

    // Calculate damage
    const baseDamage = attackerCombat.attack;
    const defense = targetCombat.defense;
    const damage = Math.max(1, Math.floor(baseDamage - defense / 2));

    // Apply damage
    targetHealth.current = Math.max(0, targetHealth.current - damage);
    this.world?.updateComponent(target.entityId, 'Health', targetHealth);

    // Check if target is defeated
    if (targetHealth.current <= 0) {
      target.defeated = true;
      this.participants.get(target.entityId)!.defeated = true;
      logger.info(LogSource.COMBAT, `Target ${target.entityId} defeated`);
    }

    // Trigger attack animation
    this.triggerAnimation(attacker.entityId, 'attack', () => {
      // Apply damage after animation
      if (!target.defeated) {
        this.applyDamageEffect(target.entityId, damage);
      }
    });

    logger.debug(LogSource.COMBAT, `Attack dealt ${damage} damage to ${target.entityId}`);
  }

  /**
   * Executes a defend action
   * @param action - Defend action data
   */
  private executeDefend(action: CombatActionQueue): void {
    const defender = this.participants.get(action.actorId);
    if (!defender) return;

    const defenderCombat = this.world?.getComponent<CombatStats>(defender.entityId, 'CombatStats');
    if (!defenderCombat) return;

    // Increase defense temporarily
    const originalDefense = defenderCombat.defense;
    defenderCombat.defense = Math.floor(originalDefense * 1.5);

    // Reset defense after 2 seconds
    setTimeout(() => {
      defenderCombat.defense = originalDefense;
    }, 2000);

    // Trigger defend animation
    this.triggerAnimation(defender.entityId, 'defend');

    logger.debug(LogSource.COMBAT, `Defend action by ${action.actorId}`);
  }

  /**
   * Executes a skill action
   * @param action - Skill action data
   */
  private executeSkill(action: CombatActionQueue): void {
    const caster = this.participants.get(action.actorId);
    if (!caster || !action.data.skillId) return;

    // In a real implementation, this would handle skill effects
    logger.debug(LogSource.COMBAT, `Skill ${action.data.skillId} cast by ${action.actorId}`);

    // Trigger skill animation
    this.triggerAnimation(caster.entityId, 'cast');

    // Apply skill effects based on skill ID
    this.applySkillEffects(action.actorId, action.data.skillId);
  }

  /**
   * Executes an item action
   * @param action - Item action data
   */
  private executeItem(action: CombatActionQueue): void {
    const user = this.participants.get(action.actorId);
    if (!user || !action.data.itemId) return;

    // In a real implementation, this would handle item effects
    logger.debug(LogSource.COMBAT, `Item ${action.data.itemId} used by ${action.actorId}`);

    // Trigger item use animation
    this.triggerAnimation(user.entityId, 'item');

    // Apply item effects
    this.applyItemEffects(action.actorId, action.data.itemId);
  }

  /**
   * Executes a flee action
   * @param action - Flee action data
   */
  private executeFlee(action: CombatActionQueue): void {
    const fleer = this.participants.get(action.actorId);
    if (!fleer) return;

    // Mark as defeated and remove from combat
    fleer.defeated = true;
    this.participants.get(fleer.entityId)!.defeated = true;

    logger.debug(LogSource.COMBAT, `${action.actorId} fled from combat`);

    // Trigger flee animation
    this.triggerAnimation(fleer.entityId, 'flee');

    // Check if combat should end
    this.checkCombatEnd();
  }

  /**
   * Applies damage effect to target
   * @param targetId - Target entity ID
   * @param damage - Damage amount
   */
  private applyDamageEffect(targetId: EntityId, damage: number): void {
    // In a real implementation, this would trigger damage numbers, screen shake, etc.
    logger.debug(LogSource.COMBAT, `Applied ${damage} damage to ${targetId}`);

    // Flash target red briefly
    const sprite = this.world?.getComponent<Sprite>(targetId, 'Sprite');
    if (sprite) {
      // In a real implementation, this would change sprite color or add damage effect
      logger.debug(LogSource.COMBAT, `Damage effect applied to ${targetId}`);
    }
  }

  /**
   * Applies skill effects
   * @param casterId - Caster entity ID
   * @param skillId - Skill ID
   */
  private applySkillEffects(casterId: EntityId, skillId: string): void {
    // In a real implementation, this would apply skill-specific effects
    logger.debug(LogSource.COMBAT, `Applied skill ${skillId} effects to ${casterId}`);
  }

  /**
   * Applies item effects
   * @param userId - User entity ID
   * @param itemId - Item ID
   */
  private applyItemEffects(userId: EntityId, itemId: string): void {
    // In a real implementation, this would apply item-specific effects
    logger.debug(LogSource.COMBAT, `Applied item ${itemId} effects to ${userId}`);
  }

  /**
   * Triggers an animation for an entity
   * @param entityId - Entity ID
   * @param animationType - Animation type
   * @param onComplete - Completion callback
   */
  private triggerAnimation(entityId: EntityId, animationType: string, onComplete?: () => void): void {
    const animation = this.world?.getComponent<Animation>(entityId, 'Animation');
    if (!animation) return;

    // Set animation state
    animation.currentAnimation = animationType;
    animation.frameIndex = 0;
    animation.frameTimer = 0;
    animation.loop = false;
    animation.onComplete = onComplete;

    logger.debug(LogSource.COMBAT, `Triggered ${animationType} animation for ${entityId}`);
  }

  /**
   * Checks if combat should end
   */
  private checkCombatEnd(): void {
    const alivePlayers = Array.from(this.participants.values())
      .filter(p => p.isPlayer && !p.defeated);
    const aliveEnemies = Array.from(this.participants.values())
      .filter(p => !p.isPlayer && !p.defeated);

    // Combat ends if all enemies defeated or player defeated
    if (alivePlayers.length === 0 || aliveEnemies.length === 0) {
      this.currentState = CombatState.RESOLUTION;
      this.startCombatSequence();
    } else if (this.actionQueue.length === 0) {
      // Continue to next turn
      this.nextTurn();
    }
  }

  /**
   * Moves to next turn
   */
  private nextTurn(): void {
    this.turnCounter++;
    
    // Simple turn alternation
    const isPlayerTurn = this.turnCounter % 2 === 0;
    
    if (isPlayerTurn) {
      this.currentState = CombatState.PLAYER_INPUT;
    } else {
      this.currentState = CombatState.ENEMY_TURN;
    }

    this.startCombatSequence();
  }

  /**
   * Resolves combat and determines outcome
   */
  private resolveCombat(): void {
    logger.debug(LogSource.COMBAT, 'Resolving combat');

    const alivePlayers = Array.from(this.participants.values())
      .filter(p => p.isPlayer && !p.defeated);
    const defeatedEnemies = Array.from(this.participants.values())
      .filter(p => !p.isPlayer && p.defeated);

    if (alivePlayers.length > 0) {
      // Victory
      this.result = {
        victory: true,
        experience: defeatedEnemies.length * 50, // 50 XP per enemy
        gold: defeatedEnemies.length * 25, // 25 gold per enemy
        items: [] // No items for now
      };
      this.currentState = CombatState.VICTORY;
    } else {
      // Defeat
      this.result = {
        victory: false,
        experience: 10, // Small consolation XP
        gold: 0,
        items: []
      };
      this.currentState = CombatState.DEFEAT;
    }

    this.startCombatSequence();
  }

  /**
   * Handles victory
   */
  private handleVictory(): void {
    logger.info(LogSource.COMBAT, 'Combat victory!');

    if (!this.result) return;

    // In a real implementation, this would:
    // - Award experience and gold to player
    // - Play victory fanfare
    // - Show victory dialog
    // - Return to overworld

    logger.debug(LogSource.COMBAT, `Awarded ${this.result.experience} XP and ${this.result.gold} gold`);

    // End combat after delay
    setTimeout(() => {
      this.endCombat();
    }, 3000);
  }

  /**
   * Handles defeat
   */
  private handleDefeat(): void {
    logger.info(LogSource.COMBAT, 'Combat defeat!');

    if (!this.result) return;

    // In a real implementation, this would:
    // - Play defeat music
    // - Show game over dialog
    // - Return to title screen with option to reload

    logger.debug(LogSource.COMBAT, 'Player defeated - returning to title');

    // End combat after delay
    setTimeout(() => {
      this.endCombat();
    }, 3000);
  }

  /**
   * Ends combat and cleans up
   */
  public endCombat(): void {
    logger.info(LogSource.COMBAT, 'Combat ended');

    // Reset combat state
    this.currentState = CombatState.INTRO;
    this.participants.clear();
    this.actionQueue = [];
    this.currentTurn = null;
    this.turnCounter = 0;
    this.result = null;
    this.onAnimationComplete.clear();

    // Restore original positions
    for (const participant of this.participants.values()) {
      const position = this.world?.getComponent<Position>(participant.entityId, 'Position');
      if (position && participant.originalPosition) {
        this.world?.updateComponent(participant.entityId, 'Position', participant.originalPosition);
      }
    }

    // Stop battle music
    logger.debug(LogSource.COMBAT, 'Stopped battle music');
  }

  /**
   * Gets current combat state
   * @returns Current combat state
   */
  public getCurrentState(): CombatState {
    return this.currentState;
  }

  /**
   * Gets combat participants
   * @returns Array of combat participants
   */
  public getParticipants(): CombatParticipant[] {
    return Array.from(this.participants.values());
  }

  /**
   * Gets combat result
   * @returns Combat result or null
   */
  public getResult(): CombatResult | null {
    return this.result;
  }

  /**
   * Gets action queue
   * @returns Current action queue
   */
  public getActionQueue(): CombatActionQueue[] {
    return [...this.actionQueue];
  }

  /**
   * Updates combat system (call once per frame)
   * @param deltaTime - Time since last frame
   */
  public update(deltaTime: number): void {
    // Update animation timers
    for (const participant of this.participants.values()) {
      const animation = this.world?.getComponent<Animation>(participant.entityId, 'Animation');
      if (animation && animation.frameTimer > 0) {
        animation.frameTimer -= deltaTime;
        
        if (animation.frameTimer <= 0) {
          // Move to next frame
          const animationDef = this.getAnimationDefinition(animation.currentAnimation);
          if (animationDef) {
            animation.frameIndex++;
            if (animation.frameIndex >= animationDef.frames.length) {
              if (animationDef.loop) {
                animation.frameIndex = 0;
              } else {
                animation.frameIndex = animationDef.frames.length - 1;
                animation.onComplete?.();
              }
            }
          }
          
          animation.frameTimer = animationDef.frameDuration;
        }
      }
    }

    // Process combat state machine
    this.startCombatSequence();
  }

  /**
   * Gets animation definition (placeholder - would come from data)
   * @param animationName - Animation name
   * @returns Animation definition
   */
  private getAnimationDefinition(animationName: string): any {
    // In a real implementation, this would look up from game data
    const animations: Record<string, any> = {
      idle: { frames: [0], frameDuration: 1.0, loop: true },
      walk: { frames: [1, 2, 3, 2], frameDuration: 0.15, loop: true },
      attack: { frames: [4, 5, 6], frameDuration: 0.1, loop: false },
      defend: { frames: [7], frameDuration: 0.5, loop: false },
      cast: { frames: [8, 9], frameDuration: 0.12, loop: false },
      hurt: { frames: [10], frameDuration: 0.3, loop: false },
      flee: { frames: [11, 12], frameDuration: 0.2, loop: false }
    };

    return animations[animationName] || animations.idle;
  }

  /**
   * Gets combat statistics
   * @returns Combat statistics
   */
  public getStats(): {
    totalParticipants: number;
    alivePlayers: number;
    aliveEnemies: number;
    defeatedEnemies: number;
    currentTurn: EntityId | null;
    currentState: CombatState;
    actionQueueLength: number;
  } {
    const alivePlayers = Array.from(this.participants.values())
      .filter(p => p.isPlayer && !p.defeated).length;
    const aliveEnemies = Array.from(this.participants.values())
      .filter(p => !p.isPlayer && !p.defeated).length;
    const defeatedEnemies = Array.from(this.participants.values())
      .filter(p => !p.isPlayer && p.defeated).length;

    return {
      totalParticipants: this.participants.size,
      alivePlayers,
      aliveEnemies,
      defeatedEnemies,
      currentTurn: this.currentTurn,
      currentState: this.currentState,
      actionQueueLength: this.actionQueue.length
    };
  }

  /**
   * Disposes of combat system
   */
  public dispose(): void {
    this.endCombat();
    logger.info(LogSource.COMBAT, 'CombatSystem disposed');
  }
}

export default CombatSystem;