/**
 * Performance Tests
 * @fileoverview Performance and load testing for game systems
 */

import { WorldManager } from '../engine/WorldManager';
import { CombatSystem } from '../engine/CombatSystem';
import { CameraSystem } from '../engine/CameraSystem';
import { SaveSystem } from '../engine/SaveSystem';
import { EntityId, Position, Health, CombatState, Sprite, Velocity } from '../types';

/**
 * Performance test runner
 */
class PerformanceTestRunner {
  private tests: Array<{ name: string; fn: () => void }> = [];
  private passed = 0;
  private failed = 0;

  /**
   * Registers a test
   */
  public test(name: string, fn: () => void): void {
    this.tests.push({ name, fn });
  }

  /**
   * Runs all registered tests
   */
  public run(): { passed: number; failed: number } {
    console.log('Running Performance Tests...\n');

    for (const test of this.tests) {
      try {
        test.fn();
        console.log(`✓ ${test.name}`);
        this.passed++;
      } catch (error) {
        console.log(`✗ ${test.name}`);
        console.log(`  Error: ${error}`);
        this.failed++;
      }
    }

    console.log(`\nPerformance Test Results: ${this.passed} passed, ${this.failed} failed`);
    return { passed: this.passed, failed: this.failed };
  }

  /**
   * Assertion helper
   */
  public assert(condition: boolean, message: string): void {
    if (!condition) {
      throw new Error(message);
    }
  }

  /**
   * Performance assertion helper
   */
  public assertPerformance(actual: number, expectedMax: number, message: string): void {
    if (actual > expectedMax) {
      throw new Error(`${message}. Expected: <= ${expectedMax}, Actual: ${actual}`);
    }
  }

  /**
   * Memory usage assertion helper
   */
  public assertMemoryUsage(initial: number, final: number, maxIncrease: number, message: string): void {
    const increase = final - initial;
    if (increase > maxIncrease) {
      throw new Error(`${message}. Expected increase: <= ${maxIncrease}, Actual: ${increase}`);
    }
  }

  /**
   * Creates a simple velocity system for testing
   */
  private createVelocitySystem(): (world: WorldManager, deltaTime: number) => void {
    return (world: WorldManager, deltaTime: number) => {
      const entities = world.entities;
      const positionComponents = world.components.get('Position');
      const velocityComponents = world.components.get('Velocity');
      
      if (positionComponents && velocityComponents) {
        for (const [entityId, position] of positionComponents.entries()) {
          const velocity = velocityComponents.get(entityId);
          if (velocity && entities.has(entityId)) {
            const currentPos = position as { x: number; y: number };
            const vel = velocity as { dx: number; dy: number };
            
            // Update position based on velocity
            const newPosition = {
              x: currentPos.x + vel.dx * deltaTime,
              y: currentPos.y + vel.dy * deltaTime
            };
            
            positionComponents.set(entityId, newPosition);
          }
        }
      }
    };
  }

  /**
   * Simulates game loop updates without using requestAnimationFrame
   */
  private simulateGameLoop(world: WorldManager, deltaTime: number, iterations: number): void {
    for (let i = 0; i < iterations; i++) {
      world.update(deltaTime);
    }
  }

  /**
   * Measures performance of a function
   */
  private measurePerformance<T>(fn: () => T, iterations: number = 1): { duration: number; result: T } {
    const startTime = performance.now();
    let result: T;
    
    for (let i = 0; i < iterations; i++) {
      result = fn();
    }
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    return { duration, result: result! };
  }
}

// Create test runner instance
const runner = new PerformanceTestRunner();

// ============= WORLD MANAGER PERFORMANCE TESTS =============

runner.test('WorldManager - Entity creation performance', () => {
  const world = new WorldManager();
  
  const { duration } = runner.measurePerformance(() => {
    // Create many entities
    for (let i = 0; i < 1000; i++) {
      world.createEntity(['Position', 'Velocity']);
    }
  });
  
  // Should complete within reasonable time
  runner.assertPerformance(duration, 100, 'Entity creation should be fast');
  
  // Clean up
  world.clear();
});

runner.test('WorldManager - Component addition performance', () => {
  const world = new WorldManager();
  const entities: EntityId[] = [];
  
  // Create entities
  for (let i = 0; i < 1000; i++) {
    const entityId = world.createEntity(['Position', 'Velocity']);
    entities.push(entityId);
  }
  
  const { duration } = runner.measurePerformance(() => {
    // Add components to all entities
    entities.forEach((entityId, i) => {
      world.addComponent(entityId, 'Position', { x: i, y: i });
      world.addComponent(entityId, 'Velocity', { dx: i, dy: i });
    });
  });
  
  // Should complete within reasonable time
  runner.assertPerformance(duration, 50, 'Component addition should be fast');
});

runner.test('WorldManager - Query performance', () => {
  const world = new WorldManager();
  const entities: EntityId[] = [];
  
  // Create entities with components
  for (let i = 0; i < 1000; i++) {
    const entityId = world.createEntity(['Position', 'Velocity', 'Health']);
    world.addComponent(entityId, 'Position', { x: i, y: i });
    world.addComponent(entityId, 'Velocity', { dx: i, dy: i });
    world.addComponent(entityId, 'Health', { current: 100, max: 100 });
    entities.push(entityId);
  }
  
  const { duration } = runner.measurePerformance(() => {
    // Perform queries
    for (let i = 0; i < 100; i++) {
      world.query(['Position']);
      world.query(['Position', 'Velocity']);
      world.query(['Position', 'Velocity', 'Health']);
    }
  });
  
  // Should complete within reasonable time
  runner.assertPerformance(duration, 50, 'Query operations should be fast');
  
  // Clean up
  world.clear();
});

runner.test('WorldManager - Entity destruction performance', () => {
  const world = new WorldManager();
  const entities: EntityId[] = [];
  
  // Create entities
  for (let i = 0; i < 1000; i++) {
    const entityId = world.createEntity(['Position', 'Velocity']);
    world.addComponent(entityId, 'Position', { x: i, y: i });
    world.addComponent(entityId, 'Velocity', { dx: i, dy: i });
    entities.push(entityId);
  }
  
  const { duration } = runner.measurePerformance(() => {
    // Destroy all entities
    entities.forEach(entityId => {
      world.destroyEntity(entityId);
    });
  });
  
  // Should complete within reasonable time
  runner.assertPerformance(duration, 100, 'Entity destruction should be fast');
});

// ============= COMBAT SYSTEM PERFORMANCE TESTS =============

runner.test('CombatSystem - Large battle performance', () => {
  const world = new WorldManager();
  const combatSystem = new CombatSystem();
  
  combatSystem.setWorld(world);
  
  // Create many combat entities
  const entities: EntityId[] = [];
  for (let i = 0; i < 100; i++) {
    const entityId = world.createEntity(['Position', 'Health', 'CombatState']);
    world.addComponent(entityId, 'Position', { 
      x: Math.random() * 1000, 
      y: Math.random() * 1000 
    });
    world.addComponent(entityId, 'Health', { current: 100, max: 100 });
    world.addComponent(entityId, 'CombatState', { 
      attacking: false, 
      attack: 10 + Math.random() * 10, 
      defense: 5 + Math.random() * 5, 
      actionPoints: 3, 
      maxActionPoints: 3 
    });
    entities.push(entityId);
  }
  
  const { duration } = runner.measurePerformance(() => {
    // Start combat with all entities
    combatSystem.startCombat(entities[0], entities.slice(1));
    
    // Update combat many times
    for (let i = 0; i < 100; i++) {
      combatSystem.update(0.016);
    }
  });
  
  // Should complete within reasonable time
  runner.assertPerformance(duration, 1000, 'Large battle should be performant');
  
  // Clean up
  world.clear();
});

// ============= CAMERA SYSTEM PERFORMANCE TESTS =============

runner.test('CameraSystem - Tracking performance', () => {
  const world = new WorldManager();
  const cameraSystem = new CameraSystem();
  
  cameraSystem.setWorld(world);
  cameraSystem.setViewport(1920, 1080);
  
  // Create many entities
  const entities: EntityId[] = [];
  for (let i = 0; i < 500; i++) {
    const entityId = world.createEntity(['Position', 'Velocity']);
    world.addComponent(entityId, 'Position', { 
      x: Math.random() * 2000, 
      y: Math.random() * 2000 
    });
    world.addComponent(entityId, 'Velocity', { 
      dx: (Math.random() - 0.5) * 100, 
      dy: (Math.random() - 0.5) * 100 
    });
    entities.push(entityId);
  }
  
  // Add velocity system for movement
  world.addSystem(runner.createVelocitySystem());
  
  const { duration } = runner.measurePerformance(() => {
    // Simulate camera tracking
    for (let i = 0; i < 100; i++) {
      // Switch target every 10 frames
      const targetIndex = Math.floor(i / 10) % entities.length;
      cameraSystem.setTarget(entities[targetIndex]);
      cameraSystem.update(0.016);
      
      // Update world
      world.update(0.016);
    }
  });
  
  // Should complete within reasonable time
  runner.assertPerformance(duration, 500, 'Camera tracking should be performant');
  
  // Clean up
  world.clear();
});

// ============= SAVE SYSTEM PERFORMANCE TESTS =============

runner.test('SaveSystem - Large save performance', () => {
  const world = new WorldManager();
  const saveSystem = new SaveSystem();
  
  saveSystem.setWorld(world);
  
  // Create many entities with various components
  const entities: EntityId[] = [];
  for (let i = 0; i < 500; i++) {
    const entityId = world.createEntity(['Position', 'Health', 'Sprite', 'CombatState']);
    world.addComponent(entityId, 'Position', { 
      x: Math.random() * 1000, 
      y: Math.random() * 1000 
    });
    world.addComponent(entityId, 'Health', { 
      current: 50 + Math.random() * 50, 
      max: 100 
    });
    world.addComponent(entityId, 'Sprite', { 
      textureId: `sprite_${i % 10}`, 
      frameIndex: i % 4, 
      visible: true 
    });
    world.addComponent(entityId, 'CombatState', { 
      attacking: Math.random() > 0.8, 
      attack: 10 + Math.random() * 10, 
      defense: 5 + Math.random() * 5, 
      actionPoints: Math.floor(Math.random() * 4), 
      maxActionPoints: 3 
    });
    entities.push(entityId);
  }
  
  const { duration } = runner.measurePerformance(() => {
    // Save game
    const success = saveSystem.saveGame(1, 'Performance Test');
    runner.assert(success, 'Large save should succeed');
  });
  
  // Should complete within reasonable time
  runner.assertPerformance(duration, 1000, 'Large save should be performant');
  
  // Clean up
  world.clear();
});

runner.test('SaveSystem - Load performance', () => {
  const world = new WorldManager();
  const saveSystem = new SaveSystem();
  
  saveSystem.setWorld(world);
  
  // Create test data and save
  const entities: EntityId[] = [];
  for (let i = 0; i < 200; i++) {
    const entityId = world.createEntity(['Position', 'Health', 'Sprite']);
    world.addComponent(entityId, 'Position', { 
      x: Math.random() * 500, 
      y: Math.random() * 500 
    });
    world.addComponent(entityId, 'Health', { 
      current: 75 + Math.random() * 25, 
      max: 100 
    });
    world.addComponent(entityId, 'Sprite', { 
      textureId: `sprite_${i % 5}`, 
      frameIndex: i % 8, 
      visible: true 
    });
    entities.push(entityId);
  }
  
  // Save first
  saveSystem.saveGame(1, 'Load Performance Test');
  world.clear();
  
  const { duration } = runner.measurePerformance(() => {
    // Load game
    const success = saveSystem.loadGame(1);
    runner.assert(success, 'Load should succeed');
  });
  
  // Should complete within reasonable time
  runner.assertPerformance(duration, 500, 'Load should be performant');
  
  // Clean up
  world.clear();
});

// ============= INTEGRATION PERFORMANCE TESTS =============

runner.test('Performance - High entity count with systems', () => {
  const world = new WorldManager();
  
  // Add multiple systems
  world.addSystem(runner.createVelocitySystem());
  
  // Create many entities
  const entities: EntityId[] = [];
  for (let i = 0; i < 1000; i++) {
    const entityId = world.createEntity(['Position', 'Velocity', 'Health']);
    world.addComponent(entityId, 'Position', { 
      x: Math.random() * 2000, 
      y: Math.random() * 2000 
    });
    world.addComponent(entityId, 'Velocity', { 
      dx: (Math.random() - 0.5) * 200, 
      dy: (Math.random() - 0.5) * 200 
    });
    world.addComponent(entityId, 'Health', { 
      current: 50 + Math.random() * 50, 
      max: 100 
    });
    entities.push(entityId);
  }
  
  const { duration } = runner.measurePerformance(() => {
    // Simulate game loop for many frames
    runner.simulateGameLoop(world, 0.016, 300); // 5 seconds at 60 FPS
  });
  
  // Should complete within reasonable time
  runner.assertPerformance(duration, 2000, 'High entity count should be performant');
  
  // Verify all entities still exist
  const remainingEntities = world.query(['Position', 'Velocity', 'Health']);
  runner.assert(remainingEntities.length === 1000, 'All entities should still exist');
  
  // Clean up
  world.clear();
});

runner.test('Performance - Memory allocation patterns', () => {
  const world = new WorldManager();
  
  // Measure initial memory (approximate)
  const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
  
  // Create and destroy entities repeatedly
  for (let cycle = 0; cycle < 10; cycle++) {
    // Create entities
    const entities: EntityId[] = [];
    for (let i = 0; i < 100; i++) {
      const entityId = world.createEntity(['Position', 'Velocity', 'Health', 'Sprite']);
      world.addComponent(entityId, 'Position', { x: i, y: i });
      world.addComponent(entityId, 'Velocity', { dx: i, dy: i });
      world.addComponent(entityId, 'Health', { current: 100, max: 100 });
      world.addComponent(entityId, 'Sprite', { textureId: 'test', frameIndex: 0, visible: true });
      entities.push(entityId);
    }
    
    // Update world
    runner.simulateGameLoop(world, 0.016, 60);
    
    // Destroy all entities
    entities.forEach(entityId => {
      world.destroyEntity(entityId);
    });
  }
  
  // Measure final memory
  const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
  
  // Memory increase should be reasonable
  if (initialMemory > 0 && finalMemory > 0) {
    runner.assertMemoryUsage(initialMemory, finalMemory, 10 * 1024 * 1024, 'Memory usage should be reasonable'); // 10MB max increase
  }
  
  // Clean up
  world.clear();
});

runner.test('Performance - Query optimization', () => {
  const world = new WorldManager();
  
  // Create entities with different component combinations
  const entities: EntityId[] = [];
  
  // Create entities with only Position
  for (let i = 0; i < 200; i++) {
    const entityId = world.createEntity(['Position']);
    world.addComponent(entityId, 'Position', { x: i, y: i });
    entities.push(entityId);
  }
  
  // Create entities with Position + Velocity
  for (let i = 0; i < 200; i++) {
    const entityId = world.createEntity(['Position', 'Velocity']);
    world.addComponent(entityId, 'Position', { x: i, y: i });
    world.addComponent(entityId, 'Velocity', { dx: i, dy: i });
    entities.push(entityId);
  }
  
  // Create entities with Position + Velocity + Health
  for (let i = 0; i < 200; i++) {
    const entityId = world.createEntity(['Position', 'Velocity', 'Health']);
    world.addComponent(entityId, 'Position', { x: i, y: i });
    world.addComponent(entityId, 'Velocity', { dx: i, dy: i });
    world.addComponent(entityId, 'Health', { current: 100, max: 100 });
    entities.push(entityId);
  }
  
  const { duration } = runner.measurePerformance(() => {
    // Perform many queries
    for (let i = 0; i < 1000; i++) {
      world.query(['Position']);
      world.query(['Position', 'Velocity']);
      world.query(['Position', 'Velocity', 'Health']);
    }
  });
  
  // Should complete within reasonable time
  runner.assertPerformance(duration, 100, 'Query operations should be optimized');
  
  // Clean up
  world.clear();
});

// Run all tests
runner.run();

export { runner as performanceTestRunner };