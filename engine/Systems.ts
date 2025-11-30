/**
 * ECS Systems for Aetherial Vanguard
 * @fileoverview Core systems for entity behavior and game logic
 */

import { World, EntityId, Position, Velocity, Sprite, Animation, AnimationDef } from '../types';
import { logger, LogSource } from './GlobalLogger';
import { ANIMATION_REGISTRY } from '../assets/SpriteAssets';

/**
 * Movement system
 * Updates entity positions based on velocity
 */
export function movementSystem(world: World, deltaTime: number): void {
  const entities = world.query(['Position', 'Velocity']);
  
  for (const entityId of entities) {
    const position = world.getComponent<Position>(entityId, 'Position');
    const velocity = world.getComponent<Velocity>(entityId, 'Velocity');
    
    if (position && velocity) {
      // Update position
      position.x += velocity.dx * deltaTime;
      position.y += velocity.dy * deltaTime;
      
      // Update the component
      world.updateComponent(entityId, 'Position', position);
    }
  }
}

/**
 * Animation system
 * Updates sprite animations based on timing
 */
export function animationSystem(world: World, deltaTime: number): void {
  const entities = world.query(['Animation', 'Sprite']);
  
  for (const entityId of entities) {
    const animation = world.getComponent<Animation>(entityId, 'Animation');
    const sprite = world.getComponent<Sprite>(entityId, 'Sprite');
    
    if (!animation || !sprite) continue;
    
    // Get animation definition
    const animRegistry = ANIMATION_REGISTRY[sprite.textureId];
    if (!animRegistry) {
      logger.warn(LogSource.ANIMATION, `No animation registry found for texture ${sprite.textureId}`);
      continue;
    }
    
    const animDef = animRegistry[animation.currentAnimation];
    if (!animDef) {
      logger.warn(LogSource.ANIMATION, `Animation definition not found: ${animation.currentAnimation}`);
      continue;
    }
    
    // Update frame timer
    animation.frameTimer -= deltaTime;
    
    if (animation.frameTimer <= 0) {
      // Move to next frame
      animation.frameIndex++;
      
      if (animation.frameIndex >= animDef.frames.length) {
        if (animDef.loop) {
          animation.frameIndex = 0;
        } else {
          animation.frameIndex = animDef.frames.length - 1;
          animation.onComplete?.();
        }
      }
      
      // Reset frame timer
      animation.frameTimer = animDef.frameDuration;
      
      // Update sprite frame
      sprite.frameIndex = animDef.frames[animation.frameIndex];
      
      // Update components
      world.updateComponent(entityId, 'Animation', animation);
      world.updateComponent(entityId, 'Sprite', sprite);
    }
  }
}

/**
 * Input handling system
 * Processes player input and updates entity states
 */
export function inputSystem(world: World, deltaTime: number, inputState: Map<string, boolean>): void {
  // Find player entity (for now, assume first entity with Velocity component is player)
  const entities = world.query(['Position', 'Velocity']);
  
  if (entities.length === 0) return;
  
  const playerId = entities[0]; // Simple: first entity is player
  const velocity = world.getComponent<Velocity>(playerId, 'Velocity');
  const position = world.getComponent<Position>(playerId, 'Position');
  
  if (!velocity || !position) return;
  
  // Reset velocity
  velocity.dx = 0;
  velocity.dy = 0;
  
  const speed = 200; // pixels per second
  
  // Handle movement input
  if (inputState.get('MOVE_UP')) {
    velocity.dy = -speed;
  }
  if (inputState.get('MOVE_DOWN')) {
    velocity.dy = speed;
  }
  if (inputState.get('MOVE_LEFT')) {
    velocity.dx = -speed;
  }
  if (inputState.get('MOVE_RIGHT')) {
    velocity.dx = speed;
  }
  
  // Update velocity component
  world.updateComponent(playerId, 'Velocity', velocity);
  
  // Update animation based on movement
  const animation = world.getComponent<Animation>(playerId, 'Animation');
  if (animation) {
    const isMoving = velocity.dx !== 0 || velocity.dy !== 0;
    const newAnimation = isMoving ? 'walk' : 'idle';
    
    if (animation.currentAnimation !== newAnimation) {
      animation.currentAnimation = newAnimation;
      animation.frameIndex = 0;
      animation.frameTimer = 0;
      
      world.updateComponent(playerId, 'Animation', animation);
    }
  }
}

/**
 * Camera system
 * Updates camera to follow target entity
 */
export function cameraSystem(world: World, deltaTime: number): void {
  // This would integrate with the renderer's camera system
  // For now, it's a placeholder
}

/**
 * Collision system
 * Handles entity collisions and boundary checks
 */
export function collisionSystem(world: World, deltaTime: number): void {
  const entities = world.query(['Position', 'Collision']);
  
  for (const entityId of entities) {
    const position = world.getComponent<Position>(entityId, 'Position');
    const collision = world.getComponent<any>(entityId, 'Collision'); // Using any for now
    
    if (!position || !collision) continue;
    
    // Simple boundary checking
    const worldWidth = 1024;
    const worldHeight = 768;
    
    if (position.x < 0) position.x = 0;
    if (position.x + collision.width > worldWidth) {
      position.x = worldWidth - collision.width;
    }
    if (position.y < 0) position.y = 0;
    if (position.y + collision.height > worldHeight) {
      position.y = worldHeight - collision.height;
    }
    
    world.updateComponent(entityId, 'Position', position);
  }
}

/**
 * Render preparation system
 * Prepares entities for rendering by sorting and batching
 */
export function renderPrepSystem(world: World, deltaTime: number): void {
  // Sort entities by Y position for proper depth rendering
  // This would typically be handled by the renderer, but we prepare data here
  const entities = world.query(['Sprite', 'Position']);
  
  // Create array of entities with their render data
  const renderData = entities.map(entityId => ({
    entityId,
    position: world.getComponent<Position>(entityId, 'Position'),
    sprite: world.getComponent<Sprite>(entityId, 'Sprite')
  })).filter(item => item.position && item.sprite);
  
  // Sort by Y position (painter's algorithm)
  renderData.sort((a, b) => (a.position!.y + (a.sprite!.height || 0)) - (b.position!.y + (b.sprite!.height || 0)));
  
  // Store sorted order for renderer (this would be passed to renderer)
  // For now, we just log the count
  logger.debug(LogSource.RENDERER, `Prepared ${renderData.length} entities for rendering`);
}

/**
 * System registry
 * Contains all available systems with their execution priorities
 */
export const SYSTEM_REGISTRY = [
  { system: inputSystem, priority: 0 },
  { system: movementSystem, priority: 10 },
  { system: animationSystem, priority: 20 },
  { system: collisionSystem, priority: 30 },
  { system: cameraSystem, priority: 40 },
  { system: renderPrepSystem, priority: 50 }
];

/**
 * Registers all systems with the world manager
 * @param world - World manager instance
 */
export function registerAllSystems(world: any): void {
  // Sort systems by priority
  const sortedSystems = [...SYSTEM_REGISTRY].sort((a, b) => a.priority - b.priority);
  
  // Add systems to world
  sortedSystems.forEach(({ system }) => {
    // Note: This would need to be adapted to work with the actual world manager
    // For now, this is a placeholder
    logger.debug(LogSource.ECS, `Registered system: ${system.name}`);
  });
  
  logger.info(LogSource.ECS, `Registered ${sortedSystems.length} systems`);
}