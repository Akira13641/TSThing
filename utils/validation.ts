/**
 * Validation Utility Functions
 * @fileoverview Runtime validation for game data and assets
 */

import { ItemDef, EnemyDef, AnimationDef, GameMap, Tile } from '../types';

/**
 * Validation error class
 */
export class ValidationError extends Error {
  /** Field that caused the error */
  public field?: string;
  /** Value that caused the error */
  public value?: unknown;

  constructor(message: string, field?: string, value?: unknown) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
    this.value = value;
  }
}

/**
 * Item definition validator
 */
export class ItemValidator {
  /**
   * Validates an item definition
   * @param item - Item to validate
   * @throws ValidationError if item is invalid
   */
  public static validate(item: ItemDef): void {
    // Check required fields
    if (!item.id || typeof item.id !== 'string') {
      throw new ValidationError('Item ID is required and must be a string', 'id', item.id);
    }

    if (!item.name || typeof item.name !== 'string') {
      throw new ValidationError('Item name is required and must be a string', 'name', item.name);
    }

    if (!item.description || typeof item.description !== 'string') {
      throw new ValidationError('Item description is required and must be a string', 'description', item.description);
    }

    // Check type
    const validTypes = ['WEAPON', 'ARMOR', 'CONSUMABLE', 'KEY', 'MISC'];
    if (!validTypes.includes(item.type)) {
      throw new ValidationError(`Invalid item type: ${item.type}`, 'type', item.type);
    }

    // Check properties
    if (!item.properties || typeof item.properties !== 'object') {
      throw new ValidationError('Item properties are required and must be an object', 'properties', item.properties);
    }

    // Validate value if present
    if (item.properties.value !== undefined) {
      if (typeof item.properties.value !== 'number' || item.properties.value < 0) {
        throw new ValidationError('Item value must be a non-negative number', 'properties.value', item.properties.value);
      }
    }

    // Validate stackable if present
    if (item.properties.stackable !== undefined) {
      if (typeof item.properties.stackable !== 'boolean') {
        throw new ValidationError('Item stackable must be a boolean', 'properties.stackable', item.properties.stackable);
      }
    }

    // Validate consumable if present
    if (item.properties.consumable !== undefined) {
      if (typeof item.properties.consumable !== 'boolean') {
        throw new ValidationError('Item consumable must be a boolean', 'properties.consumable', item.properties.consumable);
      }
    }

    // Validate effects if present
    if (item.properties.effects !== undefined) {
      if (!Array.isArray(item.properties.effects)) {
        throw new ValidationError('Item effects must be an array', 'properties.effects', item.properties.effects);
      }

      item.properties.effects.forEach((effect, index) => {
        if (!effect.type || typeof effect.type !== 'string') {
          throw new ValidationError(`Effect type is required and must be a string`, `properties.effects[${index}].type`, effect.type);
        }

        if (typeof effect.value !== 'number') {
          throw new ValidationError(`Effect value must be a number`, `properties.effects[${index}].value`, effect.value);
        }
      });
    }
  }
}

/**
 * Enemy definition validator
 */
export class EnemyValidator {
  /**
   * Validates an enemy definition
   * @param enemy - Enemy to validate
   * @throws ValidationError if enemy is invalid
   */
  public static validate(enemy: EnemyDef): void {
    // Check required fields
    if (!enemy.id || typeof enemy.id !== 'string') {
      throw new ValidationError('Enemy ID is required and must be a string', 'id', enemy.id);
    }

    if (!enemy.name || typeof enemy.name !== 'string') {
      throw new ValidationError('Enemy name is required and must be a string', 'name', enemy.name);
    }

    // Check stats
    if (!enemy.stats || typeof enemy.stats !== 'object') {
      throw new ValidationError('Enemy stats are required and must be an object', 'stats', enemy.stats);
    }

    if (typeof enemy.stats.health !== 'number' || enemy.stats.health <= 0) {
      throw new ValidationError('Enemy health must be a positive number', 'stats.health', enemy.stats.health);
    }

    if (typeof enemy.stats.attack !== 'number' || enemy.stats.attack < 0) {
      throw new ValidationError('Enemy attack must be a non-negative number', 'stats.attack', enemy.stats.attack);
    }

    if (typeof enemy.stats.defense !== 'number' || enemy.stats.defense < 0) {
      throw new ValidationError('Enemy defense must be a non-negative number', 'stats.defense', enemy.stats.defense);
    }

    if (typeof enemy.stats.speed !== 'number' || enemy.stats.speed <= 0) {
      throw new ValidationError('Enemy speed must be a positive number', 'stats.speed', enemy.stats.speed);
    }

    // Check sprite
    if (!enemy.sprite || typeof enemy.sprite !== 'object') {
      throw new ValidationError('Enemy sprite is required and must be an object', 'sprite', enemy.sprite);
    }

    if (!enemy.sprite.textureId || typeof enemy.sprite.textureId !== 'string') {
      throw new ValidationError('Enemy sprite textureId is required and must be a string', 'sprite.textureId', enemy.sprite.textureId);
    }

    if (typeof enemy.sprite.width !== 'number' || enemy.sprite.width <= 0) {
      throw new ValidationError('Enemy sprite width must be a positive number', 'sprite.width', enemy.sprite.width);
    }

    if (typeof enemy.sprite.height !== 'number' || enemy.sprite.height <= 0) {
      throw new ValidationError('Enemy sprite height must be a positive number', 'sprite.height', enemy.sprite.height);
    }

    // Validate animations
    if (!enemy.sprite.animations || typeof enemy.sprite.animations !== 'object') {
      throw new ValidationError('Enemy sprite animations are required and must be an object', 'sprite.animations', enemy.sprite.animations);
    }

    Object.entries(enemy.sprite.animations).forEach(([name, animation]) => {
      try {
        AnimationValidator.validate(animation);
      } catch (error) {
        throw new ValidationError(`Invalid animation '${name}': ${(error as Error).message}`, `sprite.animations.${name}`, animation);
      }
    });

    // Check behavior
    if (!enemy.behavior || typeof enemy.behavior !== 'object') {
      throw new ValidationError('Enemy behavior is required and must be an object', 'behavior', enemy.behavior);
    }

    if (typeof enemy.behavior.aggression !== 'number' || enemy.behavior.aggression < 0 || enemy.behavior.aggression > 1) {
      throw new ValidationError('Enemy behavior aggression must be a number between 0 and 1', 'behavior.aggression', enemy.behavior.aggression);
    }

    if (typeof enemy.behavior.patrolRadius !== 'number' || enemy.behavior.patrolRadius < 0) {
      throw new ValidationError('Enemy behavior patrolRadius must be a non-negative number', 'behavior.patrolRadius', enemy.behavior.patrolRadius);
    }

    if (typeof enemy.behavior.detectionRange !== 'number' || enemy.behavior.detectionRange < 0) {
      throw new ValidationError('Enemy behavior detectionRange must be a non-negative number', 'behavior.detectionRange', enemy.behavior.detectionRange);
    }
  }
}

/**
 * Animation definition validator
 */
export class AnimationValidator {
  /**
   * Validates an animation definition
   * @param animation - Animation to validate
   * @throws ValidationError if animation is invalid
   */
  public static validate(animation: AnimationDef): void {
    if (!Array.isArray(animation.frames) || animation.frames.length === 0) {
      throw new ValidationError('Animation frames must be a non-empty array', 'frames', animation.frames);
    }

    animation.frames.forEach((frame, index) => {
      if (typeof frame !== 'number' || frame < 0 || !Number.isInteger(frame)) {
        throw new ValidationError(`Animation frame ${index} must be a non-negative integer`, `frames[${index}]`, frame);
      }
    });

    if (typeof animation.frameDuration !== 'number' || animation.frameDuration <= 0) {
      throw new ValidationError('Animation frameDuration must be a positive number', 'frameDuration', animation.frameDuration);
    }

    if (typeof animation.loop !== 'boolean') {
      throw new ValidationError('Animation loop must be a boolean', 'loop', animation.loop);
    }
  }
}

/**
 * Game map validator
 */
export class MapValidator {
  /**
   * Validates a game map
   * @param map - Map to validate
   * @throws ValidationError if map is invalid
   */
  public static validate(map: GameMap): void {
    // Check dimensions
    if (typeof map.width !== 'number' || map.width <= 0 || !Number.isInteger(map.width)) {
      throw new ValidationError('Map width must be a positive integer', 'width', map.width);
    }

    if (typeof map.height !== 'number' || map.height <= 0 || !Number.isInteger(map.height)) {
      throw new ValidationError('Map height must be a positive integer', 'height', map.height);
    }

    if (typeof map.tileSize !== 'number' || map.tileSize <= 0 || !Number.isInteger(map.tileSize)) {
      throw new ValidationError('Map tileSize must be a positive integer', 'tileSize', map.tileSize);
    }

    // Check valid tile sizes
    const validTileSizes = [8, 16, 32, 64, 128];
    if (!validTileSizes.includes(map.tileSize)) {
      throw new ValidationError(`Map tileSize must be one of: ${validTileSizes.join(', ')}`, 'tileSize', map.tileSize);
    }

    // Check tiles array
    if (!Array.isArray(map.tiles)) {
      throw new ValidationError('Map tiles must be an array', 'tiles', map.tiles);
    }

    if (map.tiles.length !== map.height) {
      throw new ValidationError('Map tiles array length must equal map height', 'tiles.length', map.tiles.length);
    }

    for (let y = 0; y < map.tiles.length; y++) {
      const row = map.tiles[y];
      if (!Array.isArray(row)) {
        throw new ValidationError(`Map tiles row ${y} must be an array`, `tiles[${y}]`, row);
      }

      if (row.length !== map.width) {
        throw new ValidationError(`Map tiles row ${y} length must equal map width`, `tiles[${y}].length`, row.length);
      }

      for (let x = 0; x < row.length; x++) {
        const tile = row[x];
        try {
          TileValidator.validate(tile);
        } catch (error) {
          throw new ValidationError(`Invalid tile at (${x}, ${y}): ${(error as Error).message}`, `tiles[${y}][${x}]`, tile);
        }
      }
    }

    // Check spawn points
    if (map.spawnPoints && !Array.isArray(map.spawnPoints)) {
      throw new ValidationError('Map spawnPoints must be an array', 'spawnPoints', map.spawnPoints);
    }

    if (map.spawnPoints) {
      map.spawnPoints.forEach((spawnPoint, index) => {
        if (!spawnPoint.x || typeof spawnPoint.x !== 'number') {
          throw new ValidationError(`Spawn point ${index} x must be a number`, `spawnPoints[${index}].x`, spawnPoint.x);
        }

        if (!spawnPoint.y || typeof spawnPoint.y !== 'number') {
          throw new ValidationError(`Spawn point ${index} y must be a number`, `spawnPoints[${index}].y`, spawnPoint.y);
        }

        if (!spawnPoint.type || typeof spawnPoint.type !== 'string') {
          throw new ValidationError(`Spawn point ${index} type must be a string`, `spawnPoints[${index}].type`, spawnPoint.type);
        }
      });
    }
  }
}

/**
 * Tile validator
 */
export class TileValidator {
  /**
   * Validates a tile
   * @param tile - Tile to validate
   * @throws ValidationError if tile is invalid
   */
  public static validate(tile: Tile): void {
    if (!tile.type || typeof tile.type !== 'string') {
      throw new ValidationError('Tile type is required and must be a string', 'type', tile.type);
    }

    if (typeof tile.walkable !== 'boolean') {
      throw new ValidationError('Tile walkable must be a boolean', 'walkable', tile.walkable);
    }

    if (!tile.textureId || typeof tile.textureId !== 'string') {
      throw new ValidationError('Tile textureId is required and must be a string', 'textureId', tile.textureId);
    }

    if (tile.properties && typeof tile.properties !== 'object') {
      throw new ValidationError('Tile properties must be an object', 'properties', tile.properties);
    }
  }
}

/**
 * General validation utilities
 */
export class ValidationUtils {
  /**
   * Validates that a value is a non-negative integer
   * @param value - Value to validate
   * @param fieldName - Field name for error reporting
   * @throws ValidationError if value is invalid
   */
  public static validateNonNegativeInteger(value: unknown, fieldName: string): number {
    if (typeof value !== 'number' || !Number.isInteger(value) || value < 0) {
      throw new ValidationError(`${fieldName} must be a non-negative integer`, fieldName, value);
    }
    return value;
  }

  /**
   * Validates that a value is a positive integer
   * @param value - Value to validate
   * @param fieldName - Field name for error reporting
   * @throws ValidationError if value is invalid
   */
  public static validatePositiveInteger(value: unknown, fieldName: string): number {
    if (typeof value !== 'number' || !Number.isInteger(value) || value <= 0) {
      throw new ValidationError(`${fieldName} must be a positive integer`, fieldName, value);
    }
    return value;
  }

  /**
   * Validates that a value is a non-empty string
   * @param value - Value to validate
   * @param fieldName - Field name for error reporting
   * @throws ValidationError if value is invalid
   */
  public static validateNonEmptyString(value: unknown, fieldName: string): string {
    if (typeof value !== 'string' || value.trim().length === 0) {
      throw new ValidationError(`${fieldName} must be a non-empty string`, fieldName, value);
    }
    return value;
  }

  /**
   * Validates that a value is a boolean
   * @param value - Value to validate
   * @param fieldName - Field name for error reporting
   * @throws ValidationError if value is invalid
   */
  public static validateBoolean(value: unknown, fieldName: string): boolean {
    if (typeof value !== 'boolean') {
      throw new ValidationError(`${fieldName} must be a boolean`, fieldName, value);
    }
    return value;
  }

  /**
   * Validates that a value is one of the allowed values
   * @param value - Value to validate
   * @param allowedValues - Array of allowed values
   * @param fieldName - Field name for error reporting
   * @throws ValidationError if value is invalid
   */
  public static validateEnum<T>(value: unknown, allowedValues: T[], fieldName: string): T {
    if (!allowedValues.includes(value as T)) {
      throw new ValidationError(`${fieldName} must be one of: ${allowedValues.join(', ')}`, fieldName, value);
    }
    return value as T;
  }

  /**
   * Validates that a value is within a range
   * @param value - Value to validate
   * @param min - Minimum value (inclusive)
   * @param max - Maximum value (inclusive)
   * @param fieldName - Field name for error reporting
   * @throws ValidationError if value is invalid
   */
  public static validateRange(value: unknown, min: number, max: number, fieldName: string): number {
    if (typeof value !== 'number' || value < min || value > max) {
      throw new ValidationError(`${fieldName} must be between ${min} and ${max}`, fieldName, value);
    }
    return value;
  }
}