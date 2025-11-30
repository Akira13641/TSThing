/**
 * Entity Component System (ECS) World Manager
 * @fileoverview Core ECS implementation for game state management
 */

import { EntityId, ComponentType, World, Entity, SystemFunction, QueryResult } from '../types';
import { logger, LogSource } from './GlobalLogger';

/**
 * World Manager class implementing ECS architecture
 * Provides efficient entity management, component storage, and system execution
 */
export class WorldManager {
  /** The ECS world instance */
  private world: World;
  
  /** Query cache for performance optimization */
  private queryCache: Map<string, EntityId[]> = new Map();
  
  /** Component change listeners */
  private listeners: Map<EntityId, Map<ComponentType, Set<(data: unknown) => void>>> = new Map();

  /**
   * Creates a new WorldManager instance
   */
  constructor() {
    this.world = {
      entities: new Map(),
      components: new Map(),
      systems: [],
      nextEntityId: 0
    };

    logger.info(LogSource.ECS, 'WorldManager initialized');
  }

  /**
   * Creates a new entity with optional initial components
   * @param components - Optional initial component types
   * @returns The newly created entity ID
   */
  public createEntity(components?: ComponentType[]): EntityId {
    const entityId = this.world.nextEntityId++;
    
    const entity: Entity = {
      id: entityId,
      components: new Set(components || [])
    };

    this.world.entities.set(entityId, entity);
    
    // Initialize component data maps for new entity
    if (components) {
      components.forEach(componentType => {
        if (!this.world.components.has(componentType)) {
          this.world.components.set(componentType, new Map());
        }
      });
    }

    // Invalidate query cache
    this.invalidateQueryCache();

    logger.debug(LogSource.ECS, `Created entity ${entityId} with components: ${components?.join(', ') || 'none'}`);
    
    return entityId;
  }

  /**
   * Destroys an entity and removes all its components
   * @param entityId - Entity ID to destroy
   */
  public destroyEntity(entityId: EntityId): void {
    const entity = this.world.entities.get(entityId);
    if (!entity) {
      logger.warn(LogSource.ECS, `Attempted to destroy non-existent entity ${entityId}`);
      return;
    }

    // Remove all components
    entity.components.forEach(componentType => {
      this.removeComponent(entityId, componentType);
    });

    // Remove entity
    this.world.entities.delete(entityId);
    
    // Clean up listeners
    this.listeners.delete(entityId);

    // Invalidate query cache
    this.invalidateQueryCache();

    logger.debug(LogSource.ECS, `Destroyed entity ${entityId}`);
  }

  /**
   * Adds a component to an entity
   * @param entityId - Entity ID
   * @param componentType - Component type
   * @param data - Component data
   */
  public addComponent<T>(entityId: EntityId, componentType: ComponentType, data: T): void {
    const entity = this.world.entities.get(entityId);
    if (!entity) {
      logger.error(LogSource.ECS, `Attempted to add component to non-existent entity ${entityId}`);
      return;
    }

    // Initialize component map if needed
    if (!this.world.components.has(componentType)) {
      this.world.components.set(componentType, new Map());
    }

    // Add component to entity
    entity.components.add(componentType);
    
    // Store component data
    this.world.components.get(componentType)!.set(entityId, data);

    // Notify listeners
    this.notifyListeners(entityId, componentType, data);

    // Invalidate query cache
    this.invalidateQueryCache();

    logger.debug(LogSource.ECS, `Added component ${componentType} to entity ${entityId}`);
  }

  /**
   * Removes a component from an entity
   * @param entityId - Entity ID
   * @param componentType - Component type
   */
  public removeComponent(entityId: EntityId, componentType: ComponentType): void {
    const entity = this.world.entities.get(entityId);
    if (!entity) {
      logger.warn(LogSource.ECS, `Attempted to remove component from non-existent entity ${entityId}`);
      return;
    }

    // Remove component from entity
    entity.components.delete(componentType);
    
    // Remove component data
    const componentMap = this.world.components.get(componentType);
    if (componentMap) {
      componentMap.delete(entityId);
    }

    // Clean up listeners for this component
    const entityListeners = this.listeners.get(entityId);
    if (entityListeners) {
      entityListeners.delete(componentType);
    }

    // Invalidate query cache
    this.invalidateQueryCache();

    logger.debug(LogSource.ECS, `Removed component ${componentType} from entity ${entityId}`);
  }

  /**
   * Gets component data for an entity
   * @param entityId - Entity ID
   * @param componentType - Component type
   * @returns Component data or null if not found
   */
  public getComponent<T>(entityId: EntityId, componentType: ComponentType): T | null {
    const componentMap = this.world.components.get(componentType);
    if (!componentMap) {
      return null;
    }

    return (componentMap.get(entityId) as T) || null;
  }

  /**
   * Checks if an entity has a specific component
   * @param entityId - Entity ID
   * @param componentType - Component type
   * @returns True if entity has the component
   */
  public hasComponent(entityId: EntityId, componentType: ComponentType): boolean {
    const entity = this.world.entities.get(entityId);
    return entity ? entity.components.has(componentType) : false;
  }

  /**
   * Updates component data for an entity
   * @param entityId - Entity ID
   * @param componentType - Component type
   * @param data - New component data
   */
  public updateComponent<T>(entityId: EntityId, componentType: ComponentType, data: T): void {
    const componentMap = this.world.components.get(componentType);
    if (!componentMap) {
      logger.warn(LogSource.ECS, `Attempted to update non-existent component ${componentType} for entity ${entityId}`);
      return;
    }

    componentMap.set(entityId, data);

    // Notify listeners
    this.notifyListeners(entityId, componentType, data);

    logger.debug(LogSource.ECS, `Updated component ${componentType} for entity ${entityId}`);
  }

  /**
   * Queries for entities with specific component types
   * @param componentTypes - Array of component types to query for
   * @returns Array of entity IDs matching the query
   */
  public query(componentTypes: ComponentType[]): EntityId[] {
    // Create cache key
    const cacheKey = componentTypes.sort().join(',');
    
    // Check cache first
    if (this.queryCache.has(cacheKey)) {
      return this.queryCache.get(cacheKey)!;
    }

    // If no component types specified, return all entities
    if (componentTypes.length === 0) {
      const allEntities = Array.from(this.world.entities.keys());
      this.queryCache.set(cacheKey, allEntities);
      return allEntities;
    }

    // Find entities with all specified components
    const matchingEntities: EntityId[] = [];
    
    for (const [entityId, entity] of this.world.entities) {
      const hasAllComponents = componentTypes.every(componentType => 
        entity.components.has(componentType)
      );
      
      if (hasAllComponents) {
        matchingEntities.push(entityId);
      }
    }

    // Cache result
    this.queryCache.set(cacheKey, matchingEntities);

    return matchingEntities;
  }

  /**
   * Gets detailed query results with component data
   * @param componentTypes - Array of component types to query for
   * @returns QueryResult with entities and their component data
   */
  public queryWithComponents(componentTypes: ComponentType[]): QueryResult {
    const entityIds = this.query(componentTypes);
    const entities = entityIds.map(id => this.world.entities.get(id)!).filter(entity => entity !== undefined);
    
    const components = new Map<EntityId, Map<ComponentType, unknown>>();
    
    entityIds.forEach(entityId => {
      const entityComponents = new Map<ComponentType, unknown>();
      
      componentTypes.forEach(componentType => {
        const data = this.getComponent(entityId, componentType);
        if (data !== null) {
          entityComponents.set(componentType, data);
        }
      });
      
      components.set(entityId, entityComponents);
    });

    return {
      entities,
      components
    };
  }

  /**
   * Adds a system to the world
   * @param system - System function to add
   * @param priority - Optional priority (lower = earlier execution)
   */
  public addSystem(system: SystemFunction, priority: number = 0): void {
    // Insert system at the correct position based on priority
    let insertIndex = this.world.systems.length;
    
    for (let i = 0; i < this.world.systems.length; i++) {
      // This is a simplified priority system - in a real implementation,
      // you'd store priorities with systems and sort accordingly
      if (priority === 0) {
        insertIndex = i;
        break;
      }
    }

    this.world.systems.splice(insertIndex, 0, system);

    logger.debug(LogSource.ECS, `Added system with priority ${priority}`);
  }

  /**
   * Removes a system from the world
   * @param system - System function to remove
   */
  public removeSystem(system: SystemFunction): void {
    const index = this.world.systems.indexOf(system);
    if (index !== -1) {
      this.world.systems.splice(index, 1);
      logger.debug(LogSource.ECS, 'Removed system');
    } else {
      logger.warn(LogSource.ECS, 'Attempted to remove non-existent system');
    }
  }

  /**
   * Executes all systems in order
   * @param deltaTime - Time since last frame in seconds
   */
  public update(deltaTime: number): void {
    for (const system of this.world.systems) {
      try {
        system(this.world, deltaTime);
      } catch (error) {
        logger.error(LogSource.ECS, `System execution failed: ${error}`);
      }
    }
  }

  /**
   * Subscribes to component changes for a specific entity
   * @param entityId - Entity ID to watch
   * @param componentType - Component type to watch
   * @param callback - Callback function when component changes
   * @returns Unsubscribe function
   */
  public subscribe(
    entityId: EntityId, 
    componentType: ComponentType, 
    callback: (data: unknown) => void
  ): () => void {
    // Initialize entity listeners map if needed
    if (!this.listeners.has(entityId)) {
      this.listeners.set(entityId, new Map());
    }

    const entityListeners = this.listeners.get(entityId)!;
    
    // Initialize component listeners set if needed
    if (!entityListeners.has(componentType)) {
      entityListeners.set(componentType, new Set());
    }

    const componentListeners = entityListeners.get(componentType)!;
    componentListeners.add(callback);

    logger.debug(LogSource.ECS, `Added subscription for entity ${entityId}, component ${componentType}`);

    // Return unsubscribe function
    return () => {
      componentListeners.delete(callback);
      if (componentListeners.size === 0) {
        entityListeners.delete(componentType);
      }
      if (entityListeners.size === 0) {
        this.listeners.delete(entityId);
      }
    };
  }

  /**
   * Notifies all listeners of a component change
   * @param entityId - Entity ID
   * @param componentType - Component type
   * @param data - New component data
   */
  private notifyListeners(entityId: EntityId, componentType: ComponentType, data: unknown): void {
    const entityListeners = this.listeners.get(entityId);
    if (!entityListeners) {
      return;
    }

    const componentListeners = entityListeners.get(componentType);
    if (!componentListeners) {
      return;
    }

    componentListeners.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        logger.error(LogSource.ECS, `Listener callback failed: ${error}`);
      }
    });
  }

  /**
   * Invalidates the query cache
   */
  private invalidateQueryCache(): void {
    this.queryCache.clear();
  }

  /**
   * Gets the current world state (for debugging/saving)
   * @returns Deep copy of the world state
   */
  public getWorldState(): World {
    return {
      entities: new Map(this.world.entities),
      components: new Map(this.world.components),
      systems: [...this.world.systems],
      nextEntityId: this.world.nextEntityId
    };
  }

  /**
   * Gets the entities map (for debugging purposes)
   * @returns The entities map
   */
  public get entities(): Map<EntityId, Entity> {
    return this.world.entities;
  }

  /**
   * Gets the components map (for debugging purposes)
   * @returns The components map
   */
  public get components(): Map<ComponentType, Map<EntityId, unknown>> {
    return this.world.components;
  }

  /**
   * Gets statistics about the world
   * @returns World statistics object
   */
  public getStats(): {
    entityCount: number;
    componentCount: number;
    systemCount: number;
    componentTypes: string[];
  } {
    const componentTypes = Array.from(this.world.components.keys());
    
    return {
      entityCount: this.world.entities.size,
      componentCount: Array.from(this.world.components.values())
        .reduce((total, map) => total + map.size, 0),
      systemCount: this.world.systems.length,
      componentTypes
    };
  }

  /**
   * Clears all entities and components from the world
   */
  public clear(): void {
    this.world.entities.clear();
    this.world.components.clear();
    this.world.systems = [];
    this.world.nextEntityId = 0;
    this.listeners.clear();
    this.invalidateQueryCache();

    logger.info(LogSource.ECS, 'World cleared');
  }
}