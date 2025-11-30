/**
 * Core type definitions for the Aetherial Vanguard game engine
 * @fileoverview Contains all fundamental type definitions used throughout the game
 */

/**
 * Unique identifier for entities in the ECS system
 * @typedef {number} EntityId
 */
export type EntityId = number;

/**
 * Component type identifier used for component registration and queries
 * @typedef {string} ComponentType
 */
export type ComponentType = string;

/**
 * Game scene enumeration for managing different game states
 */
export type GameScene = 'TITLE' | 'OVERWORLD' | 'BATTLE' | 'MENU' | 'CUTSCENE';

/**
 * Log level enumeration for the Global Logger system
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4
}

/**
 * Source enumeration for categorizing log messages by game system
 */
export enum LogSource {
  CORE = 'CORE',
  ECS = 'ECS',
  RENDERER = 'RENDERER',
  INPUT = 'INPUT',
  AUDIO = 'AUDIO',
  UI = 'UI',
  GAMEPLAY = 'GAMEPLAY',
  COMBAT = 'COMBAT',
  ANIMATION = 'ANIMATION',
  CAMERA = 'CAMERA',
  PHYSICS = 'PHYSICS'
}

/**
 * Position component for entity location in 2D space
 */
export interface Position {
  /** X coordinate in world space */
  x: number;
  /** Y coordinate in world space */
  y: number;
}

/**
 * Velocity component for entity movement
 */
export interface Velocity {
  /** Change in X position per second */
  dx: number;
  /** Change in Y position per second */
  dy: number;
}

/**
 * Health component for entity hit points
 */
export interface Health {
  /** Current health value */
  current: number;
  /** Maximum health value */
  max: number;
}

/**
 * Sprite component for rendering entities
 */
export interface Sprite {
  /** Texture identifier for the sprite */
  textureId: string;
  /** Current frame index in sprite sheet */
  frameIndex: number;
  /** Width of the sprite in pixels */
  width: number;
  /** Height of the sprite in pixels */
  height: number;
}

/**
 * Animation component for sprite animation state
 */
export interface Animation {
  /** Current animation name */
  currentAnimation: string;
  /** Current frame index in animation sequence */
  frameIndex: number;
  /** Time until next frame (seconds) */
  frameTimer: number;
  /** Whether animation should loop */
  loop: boolean;
  /** Callback function when animation completes */
  onComplete?: () => void;
}

/**
 * Animation definition data structure
 */
export interface AnimationDef {
  /** Array of frame indices from sprite sheet */
  frames: number[];
  /** Duration of each frame in seconds */
  frameDuration: number;
  /** Whether animation should loop */
  loop: boolean;
}

/**
 * Camera component for viewport management
 */
export interface Camera {
  /** Camera X position (center of viewport) */
  x: number;
  /** Camera Y position (center of viewport) */
  y: number;
  /** Zoom level (1.0 = native resolution) */
  zoom: number;
  /** Entity ID to follow (null for static camera) */
  targetEntityId: EntityId | null;
}

/**
 * Collision component for physics interactions
 */
export interface Collision {
  /** Width of collision box */
  width: number;
  /** Height of collision box */
  height: number;
  /** Whether entity is solid (blocks movement) */
  solid: boolean;
}

/**
 * Combat state component for battle entities
 */
export interface CombatState {
  /** Whether entity is currently attacking */
  attacking: boolean;
  /** Attack power value */
  attack: number;
  /** Defense value */
  defense: number;
  /** Current action points */
  actionPoints: number;
  /** Maximum action points */
  maxActionPoints: number;
}

/**
 * Input action enumeration for abstracted input handling
 */
export enum InputAction {
  MOVE_UP = 'MOVE_UP',
  MOVE_DOWN = 'MOVE_DOWN',
  MOVE_LEFT = 'MOVE_LEFT',
  MOVE_RIGHT = 'MOVE_RIGHT',
  CONFIRM = 'CONFIRM',
  CANCEL = 'CANCEL',
  MENU = 'MENU',
  START = 'START',
  SELECT = 'SELECT'
}

/**
 * Game action discriminated union for state management
 */
export type GameAction =
  | { type: 'MOVE_ENTITY'; entityId: EntityId; direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' }
  | { type: 'ATTACK'; attackerId: EntityId; targetId: EntityId; damage: number }
  | { type: 'USE_ITEM'; itemId: string; targetId: EntityId }
  | { type: 'CHANGE_SCENE'; scene: GameScene }
  | { type: 'SPAWN_ENTITY'; entityData: Partial<Entity> }
  | { type: 'DESTROY_ENTITY'; entityId: EntityId }
  | { type: 'UPDATE_COMPONENT'; entityId: EntityId; componentType: ComponentType; data: unknown };

/**
 * Entity interface representing a game object
 */
export interface Entity {
  /** Unique entity identifier */
  id: EntityId;
  /** Set of component types attached to this entity */
  components: Set<ComponentType>;
}

/**
 * World interface for ECS management
 */
export interface World {
  /** Map of entity IDs to entity objects */
  entities: Map<EntityId, Entity>;
  /** Map of component types to entity component data */
  components: Map<ComponentType, Map<EntityId, unknown>>;
  /** Array of system functions to execute each frame */
  systems: Array<(world: World, deltaTime: number) => void>;
  /** Next available entity ID */
  nextEntityId: EntityId;
}

/**
 * System function type for ECS operations
 */
export type SystemFunction = (world: World, deltaTime: number) => void;

/**
 * Query result interface for ECS queries
 */
export interface QueryResult {
  /** Array of entities matching the query */
  entities: Entity[];
  /** Component data for each entity */
  components: Map<EntityId, Map<ComponentType, unknown>>;
}

/**
 * Save file structure for game persistence
 */
export interface SaveFile {
  /** Save file version for migration */
  version: number;
  /** Timestamp when save was created */
  timestamp: number;
  /** Game state data */
  data: GameState;
}

/**
 * Game state structure for save/load functionality
 */
export interface GameState {
  /** Current game scene */
  currentScene: GameScene;
  /** Player entity ID */
  playerId: EntityId;
  /** ECS world data */
  worldData: {
    entities: Array<{ id: EntityId; components: ComponentType[] }>;
    componentData: Record<string, Record<EntityId, unknown>>;
  };
  /** Game progression data */
  progression: {
    currentLevel: number;
    experience: number;
    inventory: Array<{ itemId: string; quantity: number }>;
    flags: Record<string, boolean>;
  };
}

/**
 * Texture data structure for hardcoded sprite assets
 */
export interface TextureData {
  /** Texture width in pixels */
  width: number;
  /** Texture height in pixels */
  height: number;
  /** Pixel data as RGBA array */
  data: Uint8Array;
}

/**
 * Audio data structure for hardcoded sound assets
 */
export interface AudioData {
  /** Sample rate (typically 44100 Hz) */
  sampleRate: number;
  /** Number of channels (1 = mono, 2 = stereo) */
  channels: number;
  /** Audio sample data */
  data: Float32Array;
}

/**
 * Shader source structure for WebGL programs
 */
export interface ShaderSource {
  /** Vertex shader source code */
  vertex: string;
  /** Fragment shader source code */
  fragment: string;
}

/**
 * Vector2 type for 2D mathematics
 */
export interface Vector2 {
  x: number;
  y: number;
}

/**
 * Rectangle type for collision and UI bounds
 */
export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Grid tile type for map data
 */
export interface Tile {
  /** Tile type identifier */
  type: string;
  /** Whether tile is walkable */
  walkable: boolean;
  /** Tile texture ID */
  textureId: string;
  /** Additional tile properties */
  properties?: Record<string, unknown>;
}

/**
 * Map data structure for game levels
 */
export interface GameMap {
  /** Map width in tiles */
  width: number;
  /** Map height in tiles */
  height: number;
  /** Tile size in pixels */
  tileSize: number;
  /** 2D array of tile data */
  tiles: Tile[][];
  /** Map spawn points */
  spawnPoints: Array<{ x: number; y: number; type: string }>;
}

/**
 * Item definition structure
 */
export interface ItemDef {
  /** Unique item identifier */
  id: string;
  /** Item display name */
  name: string;
  /** Item description */
  description: string;
  /** Item type */
  type: 'WEAPON' | 'ARMOR' | 'CONSUMABLE' | 'KEY' | 'MISC';
  /** Item properties */
  properties: {
    value?: number;
    stackable?: boolean;
    consumable?: boolean;
    effects?: Array<{ type: string; value: number }>;
  };
}

/**
 * Enemy definition structure
 */
export interface EnemyDef {
  /** Unique enemy identifier */
  id: string;
  /** Enemy display name */
  name: string;
  /** Enemy stats */
  stats: {
    health: number;
    attack: number;
    defense: number;
    speed: number;
  };
  /** Enemy sprite data */
  sprite: {
    textureId: string;
    width: number;
    height: number;
    animations: Record<string, AnimationDef>;
  };
  /** Enemy behavior patterns */
  behavior: {
    aggression: number;
    patrolRadius: number;
    detectionRange: number;
  };
}