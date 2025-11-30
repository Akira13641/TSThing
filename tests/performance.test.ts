/**
 * Performance Tests
 * @fileoverview Performance and load testing for game systems
 */

import { WorldManager } from '../engine/WorldManager';
import { GameLoop } from '../engine/GameLoop';
import { CombatSystem } from '../engine/CombatSystem';
import { CameraSystem } from '../engine/CameraSystem';
import { logger, LogSource } from '../engine/GlobalLogger';
import { EntityId, Position, Health, Velocity } from '../types';

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
}

// Create test runner instance
const runner = new PerformanceTestRunner();

// ============= WORLD MANAGER PERFORMANCE TESTS =============

runner.test('WorldManager - Entity creation performance', () => {
  const world = new WorldManager();
  const startTime = performance.now();
  
  // Create many entities
  for (let i = 0; i < 1000; i++) {
    world.createEntity(['Position', 'Velocity']);
  }
  
  const endTime = performance.now();
  const duration = endTime - startTime;
  
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
  
  const startTime = performance.now();
  
  // Add components to all entities
  entities.forEach(entityId => {
    world.addComponent(entityId, 'Position', { x: i, y: i });
    world.addComponent(entityId, 'Velocity', { dx: i, dy: i });
  });
  
  const endTime = performance.now();
  const duration = endTime - startTime;
  
  // Should complete within reasonable time
  runner.assertPerformance(duration, 50, 'Component addition should be fast');
  
  world.clear();
});

runner.test('WorldManager - Query performance', () => {
  const world = new WorldManager();
  const entities: EntityId[] = [];
  
  // Create entities with different component combinations
  for (let i = 0; i < 500; i++) {
    const entityId = world.createEntity(['Position', 'Velocity']);
    world.addComponent(entityId, 'Position', { x: i, y: i });
    world.addComponent(entityId, 'Velocity', { dx: i, dy: i });
    entities.push(entityId);
  }
  
  for (let i = 0; i < 500; i++) {
    const entityId = world.createEntity(['Position']);
    world.addComponent(entityId, 'Position', { x: i, y: i });
    entities.push(entityId);
  }
  
  const startTime = performance.now();
  
  // Perform queries
  for (let i = 0; i < 100; i++) {
    world.query(['Position', 'Velocity']);
    world.query(['Position']);
  }
  
  const endTime = performance.now();
  const duration = endTime - startTime;
  
  // Should complete within reasonable time
  runner.assertPerformance(duration, 25, 'Query performance should be fast');
  
  world.clear();
});

runner.test('WorldManager - Memory efficiency', () => {
  const world = new WorldManager();
  const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
  
  // Create and destroy many entities
  for (let i = 0; i < 1000; i++) {
    const entityId = world.createEntity(['Position']);
    world.addComponent(entityId, 'Position', { x: i, y: i });
    world.destroyEntity(entityId);
  }
  
  // Force garbage collection if available
  if ((global as any).gc) {
    (global as any).gc();
  }
  
  const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
  
  // Memory usage should not increase significantly
  runner.assertMemoryUsage(initialMemory, finalMemory, 1024 * 1024, 'Entity creation/destruction should not leak memory');
});

// ============= GAME LOOP PERFORMANCE TESTS =============

runner.test('GameLoop - High FPS performance', () => {
  const world = new WorldManager();
  const gameLoop = new GameLoop(
    (deltaTime) => {
      world.update(deltaTime);
    },
    () => {
      // Minimal render function
    }
  );
  
  // Create some entities
  for (let i = 0; i < 100; i++) {
    const entityId = world.createEntity(['Position', 'Velocity']);
    world.addComponent(entityId, 'Position', { x: Math.random() * 800, y: Math.random() * 600 });
    world.addComponent(entityId, 'Velocity', { dx: Math.random() * 100, dy: Math.random() * 100 });
  }
  
  gameLoop.start();
  
  let frameCount = 0;
  const startTime = performance.now();
  
  // Run for a short time and count frames
  const testDuration = 1000; // 1 second
  const checkInterval = setInterval(() => {
    frameCount++;
  }, 16);
  
  setTimeout(() => {
    clearInterval(checkInterval);
    gameLoop.stop();
    
    const endTime = performance.now();
    const actualDuration = endTime - startTime;
    const fps = (frameCount / actualDuration) * 1000;
    
    // Should maintain reasonable FPS
    runner.assertPerformance(fps, 30, 'Should maintain reasonable FPS');
    
    world.clear();
  }, testDuration);
});

runner.test('GameLoop - Delta time accuracy', () => {
  const world = new WorldManager();
  let totalDeltaTime = 0;
  let frameCount = 0;
  
  const gameLoop = new GameLoop(
    (deltaTime) => {
      totalDeltaTime += deltaTime;
      frameCount++;
      world.update(deltaTime);
    },
    () => {}
  );
  
  gameLoop.start();
  
  // Run for a short time
  setTimeout(() => {
    gameLoop.stop();
    
    const averageDeltaTime = totalDeltaTime / frameCount;
    const expectedDeltaTime = 1 / 60; // ~60 FPS
    
    // Delta time should be close to expected
    runner.assertPerformance(Math.abs(averageDeltaTime - expectedDeltaTime) * 1000, 5, 'Delta time should be accurate');
    
    world.clear();
  }, 500);
});

// ============= COMBAT SYSTEM PERFORMANCE TESTS =============

runner.test('CombatSystem - Large battle performance', () => {
  const world = new WorldManager();
  const combatSystem = new CombatSystem();
  
  combatSystem.setWorld(world);
  
  // Create many entities
  const playerIds: EntityId[] = [];
  const enemyIds: EntityId[] = [];
  
  for (let i = 0; i < 10; i++) {
    const playerId = world.createEntity(['Position', 'Health', 'CombatState']);
    world.addComponent(playerId, 'Position', { x: i * 50, y: 100 });
    world.addComponent(playerId, 'Health', { current: 100, max: 100 });
    world.addComponent(playerId, 'CombatState', { 
      attacking: false, 
      attack: 15, 
      defense: 8, 
      actionPoints: 3, 
      maxActionPoints: 3 
    });
    playerIds.push(playerId);
    
    const enemyId = world.createEntity(['Position', 'Health', 'CombatState']);
    world.addComponent(enemyId, 'Position', { x: i * 50 + 200, y: 100 });
    world.addComponent(enemyId, 'Health', { current: 50, max: 50 });
    world.addComponent(enemyId, 'CombatState', { 
      attacking: false, 
      attack: 10, 
      defense: 5, 
      actionPoints: 3, 
      maxActionPoints: 3 
    });
    enemyIds.push(enemyId);
  }
  
  const startTime = performance.now();
  
  // Start combat with all participants
  combatSystem.startCombat(playerIds[0], enemyIds);
  
  // Update combat many times
  for (let i = 0; i < 100; i++) {
    combatSystem.update(0.016);
  }
  
  const endTime = performance.now();
  const duration = endTime - startTime;
  
  // Should complete within reasonable time
  runner.assertPerformance(duration, 100, 'Large combat should be performant');
  
  world.clear();
});

// ============= CAMERA SYSTEM PERFORMANCE TESTS =============

runner.test('CameraSystem - Following performance', () => {
  const world = new WorldManager();
  const cameraSystem = new CameraSystem();
  
  cameraSystem.setWorld(world);
  cameraSystem.setViewport(1920, 1080);
  
  // Create many moving entities
  const entities: EntityId[] = [];
  for (let i = 0; i < 100; i++) {
    const entityId = world.createEntity(['Position', 'Velocity']);
    world.addComponent(entityId, 'Position', { 
      x: Math.random() * 2000, 
      y: Math.random() * 2000 
    });
    world.addComponent(entityId, 'Velocity', { 
      dx: (Math.random() - 0.5) * 200, 
      dy: (Math.random() - 0.5) * 200 
    });
    entities.push(entityId);
  }
  
  cameraSystem.setTarget(entities[0]);
  
  const startTime = performance.now();
  
  // Update camera many times
  for (let i = 0; i < 100; i++) {
    cameraSystem.update(0.016);
  }
  
  const endTime = performance.now();
  const duration = endTime - startTime;
  
  // Should complete within reasonable time
  runner.assertPerformance(duration, 50, 'Camera following should be performant');
  
  world.clear();
});

runner.test('CameraSystem - Bounds checking performance', () => {
  const world = new WorldManager();
  const cameraSystem = new CameraSystem();
  
  cameraSystem.setWorld(world);
  cameraSystem.setViewport(800, 600);
  cameraSystem.setBounds({
    minX: 0,
    maxX: 1000,
    minY: 0,
    maxY: 1000,
    enabled: true
  });
  
  // Create entity that moves outside bounds
  const entityId = world.createEntity(['Position', 'Velocity']);
  world.addComponent(entityId, 'Position', { x: 500, y: 500 });
  world.addComponent(entityId, 'Velocity', { dx: 1000, dy: 1000 });
  
  cameraSystem.setTarget(entityId);
  
  const startTime = performance.now();
  
  // Update camera many times
  for (let i = 0; i < 100; i++) {
    cameraSystem.update(0.016);
  }
  
  const endTime = performance.now();
  const duration = endTime - startTime;
  
  // Should complete within reasonable time
  runner.assertPerformance(duration, 25, 'Camera bounds checking should be performant');
  
  world.clear();
});

// ============= MEMORY LEAK TESTS =============

runner.test('Memory Leak - Entity lifecycle', () => {
  const world = new WorldManager();
  const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
  
  // Create and destroy entities repeatedly
  for (let cycle = 0; cycle < 10; cycle++) {
    const entities: EntityId[] = [];
    
    // Create phase
    for (let i = 0; i < 100; i++) {
      const entityId = world.createEntity(['Position', 'Health', 'Velocity']);
      world.addComponent(entityId, 'Position', { x: i, y: i });
      world.addComponent(entityId, 'Health', { current: 100, max: 100 });
      world.addComponent(entityId, 'Velocity', { dx: i, dy: i });
      entities.push(entityId);
    }
    
    // Update phase
    for (let i = 0; i < 10; i++) {
      world.update(0.016);
    }
    
    // Destroy phase
    entities.forEach(entityId => {
      world.destroyEntity(entityId);
    });
  }
  
  // Force garbage collection if available
  if ((global as any).gc) {
    (global as any).gc();
  }
  
  const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
  
  // Memory should not grow significantly
  runner.assertMemoryUsage(initialMemory, finalMemory, 512 * 1024, 'Entity lifecycle should not leak memory');
});

runner.test('Memory Leak - System references', () => {
  const world = new WorldManager();
  const combatSystem = new CombatSystem();
  const cameraSystem = new CameraSystem();
  
  combatSystem.setWorld(world);
  cameraSystem.setWorld(world);
  
  const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
  
  // Create and destroy systems repeatedly
  for (let i = 0; i < 50; i++) {
    const newCombatSystem = new CombatSystem();
    const newCameraSystem = new CameraSystem();
    
    newCombatSystem.setWorld(world);
    newCameraSystem.setWorld(world);
    
    // Use systems briefly
    newCombatSystem.update(0.016);
    newCameraSystem.update(0.016);
  }
  
  // Force garbage collection if available
  if ((global as any).gc) {
    (global as any).gc();
  }
  
  const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
  
  // Memory should not grow significantly
  runner.assertMemoryUsage(initialMemory, finalMemory, 256 * 1024, 'System references should not leak memory');
});

// ============= SCALABILITY TESTS =============

runner.test('Scalability - Linear scaling', () => {
  const world = new WorldManager();
  
  const entityCounts = [10, 50, 100, 500, 1000];
  const times: number[] = [];
  
  entityCounts.forEach(count => {
    world.clear();
    
    const startTime = performance.now();
    
    // Create entities
    const entities: EntityId[] = [];
    for (let i = 0; i < count; i++) {
      const entityId = world.createEntity(['Position', 'Velocity']);
      world.addComponent(entityId, 'Position', { x: i, y: i });
      world.addComponent(entityId, 'Velocity', { dx: 1, dy: 1 });
      entities.push(entityId);
    }
    
    // Update once
    world.update(0.016);
    
    const endTime = performance.now();
    times.push(endTime - startTime);
  });
  
  // Check that scaling is roughly linear
  for (let i = 1; i < times.length; i++) {
    const ratio = times[i] / times[i - 1];
    const entityRatio = entityCounts[i] / entityCounts[i - 1];
    
    // Time should scale roughly proportionally to entity count
    runner.assertPerformance(ratio / entityRatio, 2, 'Performance should scale linearly');
  }
});

runner.test('Scalability - Query performance', () => {
  const world = new WorldManager();
  
  // Create entities with different component combinations
  for (let i = 0; i < 500; i++) {
    const entityId = world.createEntity(['Position', 'Velocity']);
    world.addComponent(entityId, 'Position', { x: i, y: i });
    world.addComponent(entityId, 'Velocity', { dx: i, dy: i });
  }
  
  for (let i = 0; i < 200; i++) {
    const entityId = world.createEntity(['Position']);
    world.addComponent(entityId, 'Position', { x: i, y: i });
  }
  
  const startTime = performance.now();
  
  // Perform queries
  for (let i = 0; i < 100; i++) {
    world.query(['Position', 'Velocity']);
    world.query(['Position']);
  }
  
  const endTime = performance.now();
  const duration = endTime - startTime;
  
  // Should complete within reasonable time
  runner.assertPerformance(duration, 50, 'Query performance should scale well');
  
  world.clear();
});

// Run all tests
runner.run();

export { runner as performanceTestRunner };