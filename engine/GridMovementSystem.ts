/**
 * Grid-Based Movement and Collision Detection System
 * @fileoverview Core movement and collision systems for grid-based gameplay
 */

import { WorldManager } from './WorldManager';
import { EntityId, Position, Collision, Tile, GameMap, Rectangle } from '../types';
import { logger, LogSource } from './GlobalLogger';

/**
 * Grid movement configuration
 */
interface GridMovementConfig {
  /** Tile size in pixels */
  tileSize: number;
  /** Movement speed in tiles per second */
  moveSpeed: number;
  /** Whether to enable diagonal movement */
  allowDiagonal: boolean;
  /** Whether to smooth movement between tiles */
  smoothMovement: boolean;
  /** Movement interpolation speed */
  interpolationSpeed: number;
}

/**
 * Collision layer types
 */
enum CollisionLayer {
  WALKABLE = 'WALKABLE',
  SOLID = 'SOLID',
  WATER = 'WATER',
  HAZARD = 'HAZARD',
  TRIGGER = 'TRIGGER'
}

/**
 * Grid cell data
 */
interface GridCell {
  /** X coordinate in grid */
  x: number;
  /** Y coordinate in grid */
  y: number;
  /** Collision layer */
  layer: CollisionLayer;
  /** Tile data */
  tile: Tile | null;
  /** Entity IDs occupying this cell */
  entities: Set<EntityId>;
  /** Additional properties */
  properties: Record<string, unknown>;
}

/**
 * Movement result
 */
interface MovementResult {
  /** Whether movement was successful */
  success: boolean;
  /** New position */
  newPosition: Position;
  /** Reason for failure (if any) */
  reason?: 'collision' | 'boundary' | 'occupied';
  /** Collided entity ID (if any) */
  collidedEntity?: EntityId;
}

/**
 * Grid-Based Movement System
 * Handles tile-based movement with collision detection
 */
export class GridMovementSystem {
  /** Grid configuration */
  private config: GridMovementConfig;
  
  /** Game map data */
  private gameMap: GameMap | null = null;
  
  /** Grid data structure */
  private grid: GridCell[][] = [];
  
  /** Entity movement states */
  private movementStates: Map<EntityId, {
    isMoving: boolean;
    startPos: Position;
    targetPos: Position;
    currentPos: Position;
    progress: number;
    direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
  }> = new Map();

  /** World manager reference */
  private world: WorldManager | null = null;

  /**
   * Creates a new GridMovementSystem
   * @param config - Movement configuration
   */
  constructor(config: Partial<GridMovementConfig> = {}) {
    this.config = {
      tileSize: 32,
      moveSpeed: 4.0, // tiles per second
      allowDiagonal: false,
      smoothMovement: true,
      interpolationSpeed: 8.0,
      ...config
    };

    logger.info(LogSource.PHYSICS, `GridMovementSystem initialized with tile size ${this.config.tileSize}px`);
  }

  /**
   * Sets the world manager reference
   * @param world - World manager instance
   */
  public setWorld(world: WorldManager): void {
    this.world = world;
  }

  /**
   * Loads a game map into the grid system
   * @param map - Game map to load
   */
  public loadMap(map: GameMap): void {
    this.gameMap = map;
    this.initializeGrid();
    
    logger.info(LogSource.PHYSICS, `Loaded map: ${map.width}x${map.height} tiles`);
  }

  /**
   * Initializes the grid data structure
   */
  private initializeGrid(): void {
    if (!this.gameMap) return;

    const { width, height, tiles } = this.gameMap;
    this.grid = [];

    for (let y = 0; y < height; y++) {
      this.grid[y] = [];
      for (let x = 0; x < width; x++) {
        const tile = tiles[y][x];
        let layer = CollisionLayer.WALKABLE;

        // Determine collision layer based on tile properties
        if (!tile.walkable) {
          layer = CollisionLayer.SOLID;
        } else if (tile.properties?.water) {
          layer = CollisionLayer.WATER;
        } else if (tile.properties?.hazard) {
          layer = CollisionLayer.HAZARD;
        } else if (tile.properties?.trigger) {
          layer = CollisionLayer.TRIGGER;
        }

        this.grid[y][x] = {
          x,
          y,
          layer,
          tile,
          entities: new Set(),
          properties: tile.properties || {}
        };
      }
    }
  }

  /**
   * Attempts to move an entity in a direction
   * @param entityId - Entity to move
   * @param direction - Movement direction
   * @returns Movement result
   */
  public moveEntity(entityId: EntityId, direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'): MovementResult {
    if (!this.world) {
      logger.error(LogSource.PHYSICS, 'World manager not set');
      return { success: false, newPosition: { x: 0, y: 0 }, reason: 'collision' };
    }

    const position = this.world.getComponent<Position>(entityId, 'Position');
    const collision = this.world.getComponent<Collision>(entityId, 'Collision');

    if (!position) {
      logger.warn(LogSource.PHYSICS, `Entity ${entityId} has no Position component`);
      return { success: false, newPosition: { x: 0, y: 0 }, reason: 'collision' };
    }

    // Calculate target position
    const targetPos = this.getTargetPosition(position, direction);
    
    // Check boundaries
    if (!this.isInBounds(targetPos.x, targetPos.y)) {
      logger.debug(LogSource.PHYSICS, `Entity ${entityId} hit boundary at ${targetPos.x},${targetPos.y}`);
      return { success: false, newPosition: position, reason: 'boundary' };
    }

    // Check collision
    const collisionResult = this.checkCollision(targetPos, entityId, collision);
    if (!collisionResult.passable) {
      logger.debug(LogSource.PHYSICS, `Entity ${entityId} collision at ${targetPos.x},${targetPos.y}: ${collisionResult.reason}`);
      return { 
        success: false, 
        newPosition: position, 
        reason: 'collision',
        collidedEntity: collisionResult.entityId
      };
    }

    // Update entity position
    const oldPos = { ...position };
    this.world.updateComponent(entityId, 'Position', targetPos);

    // Update grid occupation
    this.updateGridOccupation(entityId, oldPos, targetPos);

    // Start movement animation if smooth movement is enabled
    if (this.config.smoothMovement) {
      this.startMovementAnimation(entityId, oldPos, targetPos, direction);
    }

    logger.debug(LogSource.PHYSICS, `Entity ${entityId} moved to ${targetPos.x},${targetPos.y}`);

    return { success: true, newPosition: targetPos };
  }

  /**
   * Calculates target position based on direction
   * @param position - Current position
   * @param direction - Movement direction
   * @returns Target position
   */
  private getTargetPosition(position: Position, direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'): Position {
    const tileSize = this.config.tileSize;
    
    switch (direction) {
      case 'UP':
        return { x: position.x, y: position.y - tileSize };
      case 'DOWN':
        return { x: position.x, y: position.y + tileSize };
      case 'LEFT':
        return { x: position.x - tileSize, y: position.y };
      case 'RIGHT':
        return { x: position.x + tileSize, y: position.y };
      default:
        return position;
    }
  }

  /**
   * Checks if a position is within map boundaries
   * @param x - X position in pixels
   * @param y - Y position in pixels
   * @returns True if position is in bounds
   */
  private isInBounds(x: number, y: number): boolean {
    if (!this.gameMap) return false;

    const gridX = Math.floor(x / this.config.tileSize);
    const gridY = Math.floor(y / this.config.tileSize);

    return gridX >= 0 && gridX < this.gameMap.width &&
           gridY >= 0 && gridY < this.gameMap.height;
  }

  /**
   * Checks collision at a specific position
   * @param position - Position to check
   * @param entityId - Entity ID (to exclude from self-collision)
   * @param collision - Collision component
   * @returns Collision check result
   */
  private checkCollision(position: Position, entityId: EntityId, collision: Collision | null): {
    passable: boolean;
    reason?: string;
    entityId?: EntityId;
  } {
    const gridX = Math.floor(position.x / this.config.tileSize);
    const gridY = Math.floor(position.y / this.config.tileSize);

    // Check grid boundaries
    if (!this.gameMap || gridY < 0 || gridY >= this.grid.length || 
        gridX < 0 || gridX >= this.grid[gridY].length) {
      return { passable: false, reason: 'out_of_bounds' };
    }

    const cell = this.grid[gridY][gridX];

    // Check tile collision
    if (cell.layer === CollisionLayer.SOLID) {
      return { passable: false, reason: 'solid_tile' };
    }

    if (cell.layer === CollisionLayer.WATER && (!collision || !collision.solid)) {
      return { passable: false, reason: 'water_tile' };
    }

    // Check entity collision
    for (const otherEntityId of cell.entities) {
      if (otherEntityId !== entityId) {
        const otherCollision = this.world?.getComponent<Collision>(otherEntityId, 'Collision');
        
        if (otherCollision && otherCollision.solid) {
          return { passable: false, reason: 'entity_collision', entityId: otherEntityId };
        }
      }
    }

    // Check trigger tiles
    if (cell.layer === CollisionLayer.TRIGGER) {
      this.handleTrigger(entityId, cell);
    }

    return { passable: true };
  }

  /**
   * Updates grid occupation when entity moves
   * @param entityId - Entity ID
   * @param oldPos - Old position
   * @param newPos - New position
   */
  private updateGridOccupation(entityId: EntityId, oldPos: Position, newPos: Position): void {
    // Remove from old position
    const oldGridX = Math.floor(oldPos.x / this.config.tileSize);
    const oldGridY = Math.floor(oldPos.y / this.config.tileSize);
    
    if (this.grid[oldGridY] && this.grid[oldGridY][oldGridX]) {
      this.grid[oldGridY][oldGridX].entities.delete(entityId);
    }

    // Add to new position
    const newGridX = Math.floor(newPos.x / this.config.tileSize);
    const newGridY = Math.floor(newPos.y / this.config.tileSize);
    
    if (this.grid[newGridY] && this.grid[newGridY][newGridX]) {
      this.grid[newGridY][newGridX].entities.add(entityId);
    }
  }

  /**
   * Starts smooth movement animation
   * @param entityId - Entity ID
   * @param startPos - Start position
   * @param targetPos - Target position
   * @param direction - Movement direction
   */
  private startMovementAnimation(entityId: EntityId, startPos: Position, targetPos: Position, direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'): void {
    this.movementStates.set(entityId, {
      isMoving: true,
      startPos: { ...startPos },
      targetPos: { ...targetPos },
      currentPos: { ...startPos },
      progress: 0,
      direction
    });
  }

  /**
   * Updates movement animations
   * @param deltaTime - Time since last frame
   */
  public updateAnimations(deltaTime: number): void {
    for (const [entityId, movement] of this.movementStates.entries()) {
      if (!movement.isMoving) continue;

      // Update progress
      movement.progress += deltaTime * this.config.interpolationSpeed;

      if (movement.progress >= 1.0) {
        // Animation complete
        movement.progress = 1.0;
        movement.isMoving = false;
        movement.currentPos = movement.targetPos;
        
        // Clean up completed animations
        if (!movement.isMoving) {
          this.movementStates.delete(entityId);
        }
      } else {
        // Interpolate position
        const t = this.easeInOutQuad(movement.progress);
        movement.currentPos = {
          x: movement.startPos.x + (movement.targetPos.x - movement.startPos.x) * t,
          y: movement.startPos.y + (movement.targetPos.y - movement.startPos.y) * t
        };
      }

      // Update entity position for rendering
      this.world?.updateComponent(entityId, 'Position', movement.currentPos);
    }
  }

  /**
   * Easing function for smooth movement
   * @param t - Progress value (0-1)
   * @returns Eased value
   */
  private easeInOutQuad(t: number): number {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }

  /**
   * Handles trigger tile interactions
   * @param entityId - Entity ID
   * @param cell - Grid cell with trigger
   */
  private handleTrigger(entityId: EntityId, cell: GridCell): void {
    const triggerType = cell.properties.trigger as string;
    
    logger.debug(LogSource.PHYSICS, `Entity ${entityId} triggered ${triggerType}`);
    
    // In a real implementation, this would trigger game events
    switch (triggerType) {
      case 'door':
        // Handle door interaction
        break;
      case 'chest':
        // Handle chest interaction
        break;
      case 'switch':
        // Handle switch interaction
        break;
      case 'teleport':
        // Handle teleportation
        break;
    }
  }

  /**
   * Gets the grid cell at a position
   * @param x - X position in pixels
   * @param y - Y position in pixels
   * @returns Grid cell or null if out of bounds
   */
  public getGridCell(x: number, y: number): GridCell | null {
    const gridX = Math.floor(x / this.config.tileSize);
    const gridY = Math.floor(y / this.config.tileSize);

    if (gridY < 0 || gridY >= this.grid.length || 
        gridX < 0 || gridX >= this.grid[gridY].length) {
      return null;
    }

    return this.grid[gridY][gridX];
  }

  /**
   * Gets entities in a rectangular area
   * @param area - Rectangle area to check
   * @returns Array of entity IDs in the area
   */
  public getEntitiesInArea(area: Rectangle): EntityId[] {
    const entities: EntityId[] = [];
    
    const startX = Math.floor(area.x / this.config.tileSize);
    const startY = Math.floor(area.y / this.config.tileSize);
    const endX = Math.floor((area.x + area.width) / this.config.tileSize);
    const endY = Math.floor((area.y + area.height) / this.config.tileSize);

    for (let y = startY; y <= endY && y < this.grid.length; y++) {
      for (let x = startX; x <= endX && x < this.grid[y].length; x++) {
        for (const entityId of this.grid[y][x].entities) {
          entities.push(entityId);
        }
      }
    }

    return [...new Set(entities)]; // Remove duplicates
  }

  /**
   * Checks if a line of sight exists between two points
   * @param start - Start position
   * @param end - End position
   * @returns True if line of sight exists
   */
  public hasLineOfSight(start: Position, end: Position): boolean {
    // Simple line-of-sight using Bresenham's algorithm
    const x0 = Math.floor(start.x / this.config.tileSize);
    const y0 = Math.floor(start.y / this.config.tileSize);
    const x1 = Math.floor(end.x / this.config.tileSize);
    const y1 = Math.floor(end.y / this.config.tileSize);

    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;

    let x = x0;
    let y = y0;

    while (true) {
      // Check current position
      if (x < 0 || y < 0 || y >= this.grid.length || x >= this.grid[y].length) {
        return false; // Out of bounds
      }

      const cell = this.grid[y][x];
      if (cell.layer === CollisionLayer.SOLID) {
        return false; // Blocked by solid tile
      }

      // Check if we've reached the destination
      if (x === x1 && y === y1) {
        break;
      }

      // Move to next position
      const e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        x += sx;
      }
      if (e2 < dx) {
        err += dx;
        y += sy;
      }
    }

    return true;
  }

  /**
   * Gets path between two points using A* algorithm
   * @param start - Start position
   * @param end - End position
   * @returns Array of positions forming the path, or empty array if no path
   */
  public findPath(start: Position, end: Position): Position[] {
    // This would implement A* pathfinding
    // For now, return empty array (no path)
    logger.debug(LogSource.PHYSICS, `Pathfinding requested from ${start.x},${start.y} to ${end.x},${end.y}`);
    return [];
  }

  /**
   * Gets system statistics
   * @returns Movement system statistics
   */
  public getStats(): {
    gridSize: { width: number; height: number };
    activeAnimations: number;
    loadedMap: boolean;
  } {
    return {
      gridSize: {
        width: this.grid[0]?.length || 0,
        height: this.grid.length
      },
      activeAnimations: this.movementStates.size,
      loadedMap: this.gameMap !== null
    };
  }

  /**
   * Disposes of the movement system
   */
  public dispose(): void {
    this.grid = [];
    this.movementStates.clear();
    this.gameMap = null;
    this.world = null;

    logger.info(LogSource.PHYSICS, 'GridMovementSystem disposed');
  }
}

export default GridMovementSystem;