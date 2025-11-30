/**
 * React Hook for Entity Component Access
 * @fileoverview Provides React integration for ECS component subscription
 */

import { useEffect, useState } from 'react';
import { EntityId, ComponentType } from '../types';
import { useGameEngine } from './useGameEngine';

/**
 * React hook for subscribing to entity component changes
 * @param entityId - Entity ID to watch
 * @param componentType - Component type to subscribe to
 * @returns Component data or null if not found
 */
export function useEntityComponent<T>(
  entityId: EntityId | null,
  componentType: ComponentType
): T | null {
  const { getComponent, subscribeToComponent } = useGameEngine();
  const [componentData, setComponentData] = useState<T | null>(() => {
    // Get initial data
    return entityId ? getComponent<T>(entityId, componentType) : null;
  });

  useEffect(() => {
    if (!entityId) {
      setComponentData(null);
      return;
    }

    // Get current component data
    const currentData = getComponent<T>(entityId, componentType);
    setComponentData(currentData);

    // Subscribe to changes
    const unsubscribe = subscribeToComponent(entityId, componentType, (newData: unknown) => {
      setComponentData(newData as T);
    });

    return unsubscribe;
  }, [entityId, componentType, getComponent, subscribeToComponent]);

  return componentData;
}

/**
 * React hook for accessing multiple components of an entity
 * @param entityId - Entity ID to watch
 * @param componentTypes - Array of component types to subscribe to
 * @returns Object with component data or null values
 */
export function useEntityComponents<T extends Record<string, ComponentType>>(
  entityId: EntityId | null,
  componentTypes: T
): { [K in keyof T]: T[K] extends ComponentType ? unknown : never } | null {
  const { getComponent, subscribeToComponent } = useGameEngine();
  const [componentsData, setComponentsData] = useState<Record<string, unknown> | null>(() => {
    if (!entityId) return null;
    
    const initialData: Record<string, unknown> = {};
    for (const [key, componentType] of Object.entries(componentTypes)) {
      initialData[key] = getComponent(entityId, componentType);
    }
    return initialData;
  });

  useEffect(() => {
    if (!entityId) {
      setComponentsData(null);
      return;
    }

    // Get current component data
    const currentData: Record<string, unknown> = {};
    for (const [key, componentType] of Object.entries(componentTypes)) {
      currentData[key] = getComponent(entityId, componentType);
    }
    setComponentsData(currentData);

    // Subscribe to changes for all components
    const unsubscribers: Array<() => void> = [];
    
    for (const [key, componentType] of Object.entries(componentTypes)) {
      const unsubscribe = subscribeToComponent(entityId, componentType, (newData: unknown) => {
        setComponentsData(prev => ({
          ...prev,
          [key]: newData
        }));
      });
      unsubscribers.push(unsubscribe);
    }

    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe());
    };
  }, [entityId, componentTypes, getComponent, subscribeToComponent]);

  return componentsData as { [K in keyof T]: T[K] extends ComponentType ? unknown : never } | null;
}

/**
 * React hook for querying entities with specific components
 * @param componentTypes - Array of component types to query for
 * @returns Array of entity IDs matching the query
 */
export function useEntityQuery(componentTypes: ComponentType[]): EntityId[] {
  const [entities, setEntities] = useState<EntityId[]>([]);
  
  // Note: This is a simplified implementation
  // In a full implementation, you'd want to subscribe to query changes
  useEffect(() => {
    // This would need to be connected to the world manager's query system
    // For now, we'll just return an empty array
    setEntities([]);
  }, [componentTypes]);

  return entities;
}

/**
 * React hook for watching entity lifecycle (creation/destruction)
 * @param callback - Function called when entities are created or destroyed
 */
export function useEntityLifecycle(callback: (entityId: EntityId, action: 'created' | 'destroyed') => void): void {
  useEffect(() => {
    // This would need to be connected to the world manager's entity lifecycle events
    // For now, this is a placeholder implementation
    
    return () => {
      // Cleanup
    };
  }, [callback]);
}

export default useEntityComponent;