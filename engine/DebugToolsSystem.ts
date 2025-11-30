/**
 * Debug Tools System
 * @fileoverview Comprehensive debugging tools for development and testing
 */

import { WorldManager } from './WorldManager';
import { logger, LogSource } from './GlobalLogger';
import { EntityId, Position, Collision, Rectangle, DebugTools } from '../types';
import { GAME_CONFIG } from '../data/GameData';
import { ENEMIES_DATABASE, ITEMS_DATABASE } from '../data/GameData';

/**
 * Debug overlay position
 */
export enum DebugOverlayPosition {
  TOP_LEFT = 'TOP_LEFT',
  TOP_RIGHT = 'TOP_RIGHT',
  BOTTOM_LEFT = 'BOTTOM_LEFT',
  BOTTOM_RIGHT = 'BOTTOM_RIGHT'
}

/**
 * Entity spawn data
 */
export interface EntitySpawnData {
  /** Entity ID */
  entityId: string;
  /** Display name */
  name: string;
  /** Category */
  category: 'enemy' | 'item' | 'npc' | 'object';
  /** Spawn position */
  position: { x: number; y: number };
  /** Quantity to spawn */
  quantity: number;
}

/**
 * Warp location data
 */
export interface WarpLocation {
  /** Location ID */
  id: string;
  /** Display name */
  name: string;
  /** Target position */
  position: { x: number; y: number };
  /** Target scene */
  scene: string;
  /** Description */
  description: string;
}

/**
 * State inspector data
 */
export interface StateInspectorData {
  /** Entity ID */
  entityId: EntityId;
  /** Component types */
  components: string[];
  /** Component data */
  componentData: Record<string, any>;
  /** Entity position */
  position: Position | null;
}

/**
 * Performance metrics
 */
export interface PerformanceMetrics {
  /** Current FPS */
  fps: number;
  /** Frame time in milliseconds */
  frameTime: number;
  /** Memory usage in MB */
  memoryUsage: number;
  /** Entity count */
  entityCount: number;
  /** Component count */
  componentCount: number;
  /** System execution time */
  systemTime: Record<string, number>;
  /** Draw calls */
  drawCalls: number;
  /** Texture memory */
  textureMemory: number;
}

/**
 * Debug Tools System
 * Provides comprehensive debugging capabilities for game development
 */
export class DebugToolsSystem {
  /** World manager reference */
  private world: WorldManager | null = null;
  
  /** Player entity ID */
  private playerId: EntityId | null = null;
  
  /** Debug configuration */
  private config: DebugTools = {
    showHitboxes: false,
    showStateInspector: false,
    showEntitySpawner: false,
    showWarpMenu: false,
    showPerformanceMetrics: false,
    showCollisionDebug: false,
    showGridOverlay: false,
    showEntityIds: false,
    showPathfinding: false
  };

  /** Debug overlay position */
  private overlayPosition: DebugOverlayPosition = DebugOverlayPosition.TOP_LEFT;

  /** Canvas for debug rendering */
  private debugCanvas: HTMLCanvasElement | null = null;
  private debugContext: CanvasRenderingContext2D | null = null;

  /** Performance metrics tracking */
  private performanceMetrics: PerformanceMetrics = {
    fps: 0,
    frameTime: 0,
    memoryUsage: 0,
    entityCount: 0,
    componentCount: 0,
    systemTime: {},
    drawCalls: 0,
    textureMemory: 0
  };

  /** Frame timing data */
  private frameTiming = {
    lastTime: 0,
    frameCount: 0,
    fpsUpdateTime: 0
  };

  /** Selected entity for inspection */
  private selectedEntity: EntityId | null = null;

  /** Debug grid settings */
  private gridSettings = {
    size: 32,
    color: 'rgba(255, 255, 255, 0.2)',
    showCoordinates: true
  };

  /** Available spawn entities */
  private spawnEntities: EntitySpawnData[] = [];

  /** Available warp locations */
  private warpLocations: WarpLocation[] = [];

  /** Debug console history */
  private consoleHistory: Array<{ timestamp: number; level: string; message: string }> = [];

  /** Debug DOM elements */
  private debugElements: {
    overlay: HTMLElement | null;
    inspector: HTMLElement | null;
    spawner: HTMLElement | null;
    warpMenu: HTMLElement | null;
    console: HTMLElement | null;
  } = {
    overlay: null,
    inspector: null,
    spawner: null,
    warpMenu: null,
    console: null
  };

  /**
   * Creates a new DebugToolsSystem instance
   */
  constructor() {
    this.initializeSpawnEntities();
    this.initializeWarpLocations();
    this.createDebugCanvas();
    this.setupKeyboardShortcuts();
    
    logger.info(LogSource.CORE, 'DebugToolsSystem initialized');
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
    logger.debug(LogSource.CORE, `Player entity set to ${playerId} for debugging`);
  }

  /**
   * Updates debug configuration
   * @param config - New debug configuration
   */
  public updateConfig(config: Partial<DebugTools>): void {
    this.config = { ...this.config, ...config };
    this.updateDebugElements();
    
    logger.debug(LogSource.CORE, 'Debug configuration updated');
  }

  /**
   * Gets current debug configuration
   * @returns Current debug configuration
   */
  public getConfig(): DebugTools {
    return { ...this.config };
  }

  /**
   * Toggles a specific debug feature
   * @param feature - Feature to toggle
   */
  public toggleFeature(feature: keyof DebugTools): void {
    this.config[feature] = !this.config[feature];
    this.updateDebugElements();
    
    logger.debug(LogSource.CORE, `Debug feature ${feature} ${this.config[feature] ? 'enabled' : 'disabled'}`);
  }

  /**
   * Sets debug overlay position
   * @param position - New overlay position
   */
  public setOverlayPosition(position: DebugOverlayPosition): void {
    this.overlayPosition = position;
    this.updateDebugElements();
  }

  /**
   * Spawns an entity at specified position
   * @param entityId - Entity ID to spawn
   * @param x - X position
   * @param y - Y position
   * @returns Spawned entity ID or null
   */
  public spawnEntity(entityId: string, x: number, y: number): EntityId | null {
    if (!this.world) {
      logger.error(LogSource.CORE, 'World manager not set for entity spawning');
      return null;
    }

    const spawnData = this.spawnEntities.find(s => s.entityId === entityId);
    if (!spawnData) {
      logger.error(LogSource.CORE, `Unknown entity ID: ${entityId}`);
      return null;
    }

    let newEntityId: EntityId;

    switch (spawnData.category) {
      case 'enemy':
        newEntityId = this.spawnEnemy(entityId, x, y);
        break;
      case 'item':
        newEntityId = this.spawnItem(entityId, x, y);
        break;
      case 'npc':
        newEntityId = this.spawnNPC(entityId, x, y);
        break;
      case 'object':
        newEntityId = this.spawnObject(entityId, x, y);
        break;
      default:
        logger.error(LogSource.CORE, `Unknown entity category: ${spawnData.category}`);
        return null;
    }

    logger.info(LogSource.CORE, `Spawned entity ${entityId} at (${x}, ${y})`);
    return newEntityId;
  }

  /**
   * Warps player to specified location
   * @param locationId - Location ID to warp to
   * @returns Success status
   */
  public warpToLocation(locationId: string): boolean {
    const location = this.warpLocations.find(l => l.id === locationId);
    if (!location) {
      logger.error(LogSource.CORE, `Unknown warp location: ${locationId}`);
      return false;
    }

    if (!this.world || !this.playerId) {
      logger.error(LogSource.CORE, 'World or player not set for warping');
      return false;
    }

    const playerPosition = this.world.getComponent<Position>(this.playerId, 'Position');
    if (playerPosition) {
      playerPosition.x = location.position.x;
      playerPosition.y = location.position.y;
      this.world.updateComponent(this.playerId, 'Position', playerPosition);
      
      logger.info(LogSource.CORE, `Warped to ${location.name} (${location.position.x}, ${location.position.y})`);
      return true;
    }

    return false;
  }

  /**
   * Gets entity information for inspection
   * @param entityId - Entity ID to inspect
   * @returns Entity inspection data
   */
  public inspectEntity(entityId: EntityId): StateInspectorData | null {
    if (!this.world) return null;

    const entity = this.world.entities.get(entityId);
    if (!entity) return null;

    const componentData: Record<string, any> = {};
    
    // Get all component data
    for (const componentType of entity.components) {
      const data = this.world.getComponent(entityId, componentType as any);
      if (data) {
        componentData[componentType] = data;
      }
    }

    const position = this.world.getComponent<Position>(entityId, 'Position');

    return {
      entityId,
      components: Array.from(entity.components),
      componentData,
      position
    };
  }

  /**
   * Updates debug system
   * @param deltaTime - Time since last frame in seconds
   */
  public update(deltaTime: number): void {
    if (!this.world) return;

    // Update performance metrics
    this.updatePerformanceMetrics(deltaTime);

    // Render debug overlays
    if (this.debugCanvas && this.debugContext) {
      this.renderDebugOverlays();
    }

    // Update debug elements
    this.updateDebugElements();
  }

  /**
   * Executes debug command
   * @param command - Command string
   * @returns Command result
   */
  public executeCommand(command: string): string {
    const parts = command.trim().split(' ');
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    try {
      switch (cmd) {
        case 'help':
          return this.getHelpText();
          
        case 'spawn':
          if (args.length < 3) {
            return 'Usage: spawn <entity_id> <x> <y>';
          }
          const entityId = args[0];
          const x = parseFloat(args[1]);
          const y = parseFloat(args[2]);
          const spawnedId = this.spawnEntity(entityId, x, y);
          return spawnedId ? `Spawned ${entityId} (ID: ${spawnedId})` : 'Failed to spawn entity';
          
        case 'warp':
          if (args.length < 1) {
            return 'Available locations: ' + this.warpLocations.map(l => l.id).join(', ');
          }
          return this.warpToLocation(args[0]) ? `Warped to ${args[0]}` : 'Failed to warp';
          
        case 'kill':
          if (args.length < 1) {
            return 'Usage: kill <entity_id>';
          }
          return this.killEntity(parseInt(args[0])) ? 'Entity killed' : 'Failed to kill entity';
          
        case 'heal':
          if (!this.playerId) return 'Player not set';
          return this.healPlayer(999) ? 'Player healed' : 'Failed to heal player';
          
        case 'give':
          if (args.length < 2) {
            return 'Usage: give <item_id> <quantity>';
          }
          return this.giveItem(args[0], parseInt(args[1])) ? 'Item given' : 'Failed to give item';
          
        case 'clear':
          this.clearEntities();
          return 'All entities cleared';
          
        case 'reset':
          this.resetGame();
          return 'Game reset';
          
        default:
          return `Unknown command: ${cmd}. Type 'help' for available commands.`;
      }
    } catch (error) {
      return `Error executing command: ${error}`;
    }
  }

  /**
   * Initializes spawn entities list
   */
  private initializeSpawnEntities(): void {
    // Add enemies
    Object.keys(ENEMIES_DATABASE).forEach(enemyId => {
      const enemy = ENEMIES_DATABASE[enemyId];
      this.spawnEntities.push({
        entityId: enemyId,
        name: enemy.name,
        category: 'enemy',
        position: { x: 0, y: 0 },
        quantity: 1
      });
    });

    // Add items
    Object.keys(ITEMS_DATABASE).forEach(itemId => {
      const item = ITEMS_DATABASE[itemId];
      this.spawnEntities.push({
        entityId: itemId,
        name: item.name,
        category: 'item',
        position: { x: 0, y: 0 },
        quantity: 1
      });
    });

    logger.debug(LogSource.CORE, `Initialized ${this.spawnEntities.length} spawn entities`);
  }

  /**
   * Initializes warp locations list
   */
  private initializeWarpLocations(): void {
    this.warpLocations = [
      {
        id: 'start',
        name: 'Starting Area',
        position: { x: 400, y: 300 },
        scene: 'overworld',
        description: 'The beginning of your adventure'
      },
      {
        id: 'town',
        name: 'Town Square',
        position: { x: 800, y: 600 },
        scene: 'town',
        description: 'Bustling town center'
      },
      {
        id: 'forest',
        name: 'Mystic Forest',
        position: { x: 1200, y: 400 },
        scene: 'forest',
        description: 'Enchanted woodland'
      },
      {
        id: 'dungeon',
        name: 'Dungeon Entrance',
        position: { x: 600, y: 800 },
        scene: 'dungeon',
        description: 'Dark and dangerous dungeon'
      },
      {
        id: 'castle',
        name: 'Castle Courtyard',
        position: { x: 1500, y: 200 },
        scene: 'castle',
        description: 'Royal castle grounds'
      }
    ];

    logger.debug(LogSource.CORE, `Initialized ${this.warpLocations.length} warp locations`);
  }

  /**
   * Creates debug canvas for overlay rendering
   */
  private createDebugCanvas(): void {
    this.debugCanvas = document.createElement('canvas');
    this.debugCanvas.style.position = 'fixed';
    this.debugCanvas.style.top = '0';
    this.debugCanvas.style.left = '0';
    this.debugCanvas.style.pointerEvents = 'none';
    this.debugCanvas.style.zIndex = '9999';
    this.debugCanvas.width = window.innerWidth;
    this.debugCanvas.height = window.innerHeight;
    
    this.debugContext = this.debugCanvas.getContext('2d');
    
    document.body.appendChild(this.debugCanvas);
    
    // Handle window resize
    window.addEventListener('resize', () => {
      if (this.debugCanvas) {
        this.debugCanvas.width = window.innerWidth;
        this.debugCanvas.height = window.innerHeight;
      }
    });
  }

  /**
   * Sets up keyboard shortcuts for debug tools
   */
  private setupKeyboardShortcuts(): void {
    document.addEventListener('keydown', (event) => {
      // Only work when not in input fields
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Ctrl+Shift+D for debug menu
      if (event.ctrlKey && event.shiftKey && event.key === 'D') {
        event.preventDefault();
        this.toggleDebugMenu();
      }

      // Ctrl+Shift+C for console
      if (event.ctrlKey && event.shiftKey && event.key === 'C') {
        event.preventDefault();
        this.toggleDebugConsole();
      }

      // F1-F12 for quick toggles
      if (event.key === 'F1') {
        event.preventDefault();
        this.toggleFeature('showHitboxes');
      } else if (event.key === 'F2') {
        event.preventDefault();
        this.toggleFeature('showGridOverlay');
      } else if (event.key === 'F3') {
        event.preventDefault();
        this.toggleFeature('showEntityIds');
      } else if (event.key === 'F4') {
        event.preventDefault();
        this.toggleFeature('showPerformanceMetrics');
      } else if (event.key === 'F5') {
        event.preventDefault();
        this.toggleFeature('showStateInspector');
      }
    });
  }

  /**
   * Renders debug overlays
   */
  private renderDebugOverlays(): void {
    if (!this.debugContext || !this.world) return;

    const ctx = this.debugContext;
    ctx.clearRect(0, 0, this.debugCanvas.width, this.debugCanvas.height);

    // Render grid overlay
    if (this.config.showGridOverlay) {
      this.renderGridOverlay(ctx);
    }

    // Render hitboxes
    if (this.config.showHitboxes) {
      this.renderHitboxes(ctx);
    }

    // Render entity IDs
    if (this.config.showEntityIds) {
      this.renderEntityIds(ctx);
    }

    // Render collision debug
    if (this.config.showCollisionDebug) {
      this.renderCollisionDebug(ctx);
    }

    // Render pathfinding
    if (this.config.showPathfinding) {
      this.renderPathfinding(ctx);
    }
  }

  /**
   * Renders grid overlay
   * @param ctx - Canvas context
   */
  private renderGridOverlay(ctx: CanvasRenderingContext2D): void {
    ctx.strokeStyle = this.gridSettings.color;
    ctx.lineWidth = 1;

    // Calculate visible grid bounds
    const startX = Math.floor(0 / this.gridSettings.size) * this.gridSettings.size;
    const startY = Math.floor(0 / this.gridSettings.size) * this.gridSettings.size;
    const endX = Math.ceil(this.debugCanvas!.width / this.gridSettings.size) * this.gridSettings.size;
    const endY = Math.ceil(this.debugCanvas!.height / this.gridSettings.size) * this.gridSettings.size;

    // Draw vertical lines
    for (let x = startX; x <= endX; x += this.gridSettings.size) {
      ctx.beginPath();
      ctx.moveTo(x, startY);
      ctx.lineTo(x, endY);
      ctx.stroke();
    }

    // Draw horizontal lines
    for (let y = startY; y <= endY; y += this.gridSettings.size) {
      ctx.beginPath();
      ctx.moveTo(startX, y);
      ctx.lineTo(endX, y);
      ctx.stroke();
    }

    // Draw coordinates if enabled
    if (this.gridSettings.showCoordinates) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.font = '10px monospace';
      
      for (let x = startX; x <= endX; x += this.gridSettings.size) {
        for (let y = startY; y <= endY; y += this.gridSettings.size) {
          ctx.fillText(`${Math.floor(x / this.gridSettings.size)},${Math.floor(y / this.gridSettings.size)}`, x + 2, y + 12);
        }
      }
    }
  }

  /**
   * Renders hitboxes for entities with collision components
   * @param ctx - Canvas context
   */
  private renderHitboxes(ctx: CanvasRenderingContext2D): void {
    const entities = this.world.query(['Position', 'Collision']);
    
    entities.forEach(entity => {
      const position = this.world!.getComponent<Position>(entity.id, 'Position');
      const collision = this.world!.getComponent<Collision>(entity.id, 'Collision');
      
      if (!position || !collision) return;

      // Convert world coordinates to screen coordinates
      const screenX = position.x - collision.width / 2;
      const screenY = position.y - collision.height / 2;

      // Draw collision box
      ctx.strokeStyle = collision.solid ? 'rgba(255, 0, 0, 0.8)' : 'rgba(0, 255, 0, 0.8)';
      ctx.lineWidth = 2;
      ctx.strokeRect(screenX, screenY, collision.width, collision.height);

      // Draw center point
      ctx.fillStyle = 'rgba(255, 255, 0, 0.8)';
      ctx.beginPath();
      ctx.arc(position.x, position.y, 3, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  /**
   * Renders entity IDs
   * @param ctx - Canvas context
   */
  private renderEntityIds(ctx: CanvasRenderingContext2D): void {
    const entities = this.world.query(['Position']);
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = '12px monospace';
    
    entities.forEach(entity => {
      const position = this.world!.getComponent<Position>(entity.id, 'Position');
      if (!position) return;

      ctx.fillText(`ID: ${entity.id}`, position.x + 10, position.y - 10);
    });
  }

  /**
   * Renders collision debug information
   * @param ctx - Canvas context
   */
  private renderCollisionDebug(ctx: CanvasRenderingContext2D): void {
    // This would render collision normals, contact points, etc.
    // Implementation depends on the physics system
  }

  /**
   * Renders pathfinding visualization
   * @param ctx - Canvas context
   */
  private renderPathfinding(ctx: CanvasRenderingContext2D): void {
    // This would render pathfinding nodes and paths
    // Implementation depends on the pathfinding system
  }

  /**
   * Updates performance metrics
   * @param deltaTime - Time since last frame in seconds
   */
  private updatePerformanceMetrics(deltaTime: number): void {
    const now = performance.now();
    
    // Update FPS
    this.frameTiming.frameCount++;
    if (now - this.frameTiming.fpsUpdateTime >= 1000) {
      this.performanceMetrics.fps = this.frameTiming.frameCount;
      this.frameTiming.frameCount = 0;
      this.frameTiming.fpsUpdateTime = now;
    }

    // Update frame time
    this.performanceMetrics.frameTime = deltaTime * 1000;

    // Update memory usage
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      this.performanceMetrics.memoryUsage = memory.usedJSHeapSize / 1024 / 1024;
    }

    // Update entity and component counts
    if (this.world) {
      this.performanceMetrics.entityCount = this.world.entities.size;
      this.performanceMetrics.componentCount = Array.from(this.world.components.values())
        .reduce((total, pool) => total + pool.size, 0);
    }
  }

  /**
   * Updates debug DOM elements
   */
  private updateDebugElements(): void {
    // This would update the DOM elements for debug tools
    // Implementation depends on the specific UI framework being used
  }

  /**
   * Spawns an enemy entity
   * @param enemyId - Enemy ID
   * @param x - X position
   * @param y - Y position
   * @returns Spawned entity ID
   */
  private spawnEnemy(enemyId: string, x: number, y: number): EntityId {
    if (!this.world) throw new Error('World not set');
    
    const enemy = ENEMIES_DATABASE[enemyId];
    const entityId = this.world.createEntity(['Position', 'Collision', 'Sprite', 'Health', 'CombatState']);
    
    this.world.addComponent(entityId, 'Position', { x, y });
    this.world.addComponent(entityId, 'Collision', { 
      width: enemy.sprite.width, 
      height: enemy.sprite.height, 
      solid: true 
    });
    this.world.addComponent(entityId, 'Sprite', {
      textureId: enemy.sprite.textureId,
      frameIndex: 0,
      width: enemy.sprite.width,
      height: enemy.sprite.height
    });
    this.world.addComponent(entityId, 'Health', {
      current: enemy.stats.health,
      max: enemy.stats.health
    });
    this.world.addComponent(entityId, 'CombatState', {
      attacking: false,
      attack: enemy.stats.attack,
      defense: enemy.stats.defense,
      actionPoints: 3,
      maxActionPoints: 3
    });
    
    return entityId;
  }

  /**
   * Spawns an item entity
   * @param itemId - Item ID
   * @param x - X position
   * @param y - Y position
   * @returns Spawned entity ID
   */
  private spawnItem(itemId: string, x: number, y: number): EntityId {
    if (!this.world) throw new Error('World not set');
    
    const item = ITEMS_DATABASE[itemId];
    const entityId = this.world.createEntity(['Position', 'Collision', 'Sprite']);
    
    this.world.addComponent(entityId, 'Position', { x, y });
    this.world.addComponent(entityId, 'Collision', { 
      width: 16, 
      height: 16, 
      solid: false 
    });
    this.world.addComponent(entityId, 'Sprite', {
      textureId: 'item_' + itemId,
      frameIndex: 0,
      width: 16,
      height: 16
    });
    
    return entityId;
  }

  /**
   * Spawns an NPC entity
   * @param npcId - NPC ID
   * @param x - X position
   * @param y - Y position
   * @returns Spawned entity ID
   */
  private spawnNPC(npcId: string, x: number, y: number): EntityId {
    if (!this.world) throw new Error('World not set');
    
    const entityId = this.world.createEntity(['Position', 'Collision', 'Sprite']);
    
    this.world.addComponent(entityId, 'Position', { x, y });
    this.world.addComponent(entityId, 'Collision', { 
      width: 16, 
      height: 32, 
      solid: true 
    });
    this.world.addComponent(entityId, 'Sprite', {
      textureId: 'npc_' + npcId,
      frameIndex: 0,
      width: 16,
      height: 32
    });
    
    return entityId;
  }

  /**
   * Spawns an object entity
   * @param objectId - Object ID
   * @param x - X position
   * @param y - Y position
   * @returns Spawned entity ID
   */
  private spawnObject(objectId: string, x: number, y: number): EntityId {
    if (!this.world) throw new Error('World not set');
    
    const entityId = this.world.createEntity(['Position', 'Collision', 'Sprite']);
    
    this.world.addComponent(entityId, 'Position', { x, y });
    this.world.addComponent(entityId, 'Collision', { 
      width: 32, 
      height: 32, 
      solid: true 
    });
    this.world.addComponent(entityId, 'Sprite', {
      textureId: 'object_' + objectId,
      frameIndex: 0,
      width: 32,
      height: 32
    });
    
    return entityId;
  }

  /**
   * Kills an entity
   * @param entityId - Entity ID to kill
   * @returns Success status
   */
  private killEntity(entityId: EntityId): boolean {
    if (!this.world) return false;
    
    const health = this.world.getComponent<Health>(entityId, 'Health');
    if (health) {
      health.current = 0;
      this.world.updateComponent(entityId, 'Health', health);
      return true;
    }
    
    return false;
  }

  /**
   * Heals the player
   * @param amount - Amount to heal
   * @returns Success status
   */
  private healPlayer(amount: number): boolean {
    if (!this.world || !this.playerId) return false;
    
    const health = this.world.getComponent<Health>(this.playerId, 'Health');
    if (health) {
      health.current = Math.min(health.max, health.current + amount);
      this.world.updateComponent(this.playerId, 'Health', health);
      return true;
    }
    
    return false;
  }

  /**
   * Gives item to player
   * @param itemId - Item ID
   * @param quantity - Item quantity
   * @returns Success status
   */
  private giveItem(itemId: string, quantity: number): boolean {
    // This would integrate with the inventory system
    logger.debug(LogSource.CORE, `Giving ${quantity}x ${itemId} to player`);
    return true;
  }

  /**
   * Clears all entities except player
   */
  private clearEntities(): void {
    if (!this.world) return;
    
    const entitiesToRemove: EntityId[] = [];
    
    this.world.entities.forEach((entity, entityId) => {
      if (entityId !== this.playerId) {
        entitiesToRemove.push(entityId);
      }
    });
    
    entitiesToRemove.forEach(entityId => {
      this.world!.destroyEntity(entityId);
    });
    
    logger.info(LogSource.CORE, `Cleared ${entitiesToRemove.length} entities`);
  }

  /**
   * Resets the game state
   */
  private resetGame(): void {
    if (!this.world) return;
    
    this.world.clear();
    logger.info(LogSource.CORE, 'Game state reset');
  }

  /**
   * Gets help text for debug commands
   * @returns Help text
   */
  private getHelpText(): string {
    return `
Available Debug Commands:
  help                    - Show this help message
  spawn <id> <x> <y>      - Spawn entity at position
  warp <location>          - Warp to location
  kill <entity_id>         - Kill entity
  heal                    - Heal player to full health
  give <item> <quantity>   - Give item to player
  clear                   - Clear all entities except player
  reset                   - Reset game state

Available Locations:
  ${this.warpLocations.map(l => `  ${l.id} - ${l.name}`).join('\n')}

Keyboard Shortcuts:
  Ctrl+Shift+D           - Toggle debug menu
  Ctrl+Shift+C           - Toggle debug console
  F1                     - Toggle hitboxes
  F2                     - Toggle grid overlay
  F3                     - Toggle entity IDs
  F4                     - Toggle performance metrics
  F5                     - Toggle state inspector
    `;
  }

  /**
   * Toggles debug menu
   */
  private toggleDebugMenu(): void {
    // This would show/hide the debug menu UI
    logger.debug(LogSource.CORE, 'Debug menu toggled');
  }

  /**
   * Toggles debug console
   */
  private toggleDebugConsole(): void {
    // This would show/hide the debug console UI
    logger.debug(LogSource.CORE, 'Debug console toggled');
  }
}