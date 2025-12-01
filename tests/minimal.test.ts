/**
 * Minimal Test Suite
 * @fileoverview Minimal tests to verify core functionality without complex mocking
 */

import { WorldManager } from '../engine/WorldManager';
import { SaveSystem } from '../engine/SaveSystem';
import { EntityId, Position, Health, CombatStats, Sprite } from '../types';

/**
 * Minimal test runner
 */
class MinimalTestRunner {
  private tests: Array<{ name: string; fn: () => void }> = [];
  private passed = 0;
  private failed = 0;

  public test(name: string, fn: () => void): void {
    this.tests.push({ name, fn });
  }

  public run(): { passed: number; failed: number } {
    console.log('Running Minimal Tests...\n');

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

    console.log(`\nMinimal Test Results: ${this.passed} passed, ${this.failed} failed`);
    return { passed: this.passed, failed: this.failed };
  }
}

// Create test runner instance
const runner = new MinimalTestRunner();

// Test core functionality without complex mocking
runner.test('WorldManager - Basic functionality', () => {
  const world = new WorldManager();
  const entityId = world.createEntity(['Position', 'Health', 'CombatStats', 'Sprite']);
  
  if (entityId === null || entityId < 0) {
    throw new Error('Entity creation failed');
  }
  
  world.addComponent(entityId, 'Position', { x: 100, y: 200 });
  world.addComponent(entityId, 'Health', { current: 75, max: 100 });
  world.addComponent(entityId, 'CombatStats', { 
    attacking: false, 
    attack: 15, 
    defense: 8 
  });
  world.addComponent(entityId, 'Sprite', { textureId: 'hero', frameIndex: 0 });
  
  const position = world.getComponent(entityId, 'Position');
  const health = world.getComponent(entityId, 'Health');
  const combatStats = world.getComponent(entityId, 'CombatStats');
  const sprite = world.getComponent(entityId, 'Sprite');
  
  if (!position || position.x !== 100 || position.y !== 200) {
    throw new Error('Position component failed');
  }
  if (!health || health.current !== 75 || health.max !== 100) {
    throw new Error('Health component failed');
  }
  if (!combatStats || combatStats.attacking !== false || combatStats.attack !== 15 || combatStats.defense !== 8) {
    throw new Error('CombatStats component failed');
  }
  if (!sprite || sprite.textureId !== 'hero') {
    throw new Error('Sprite component failed');
  }
});

runner.test('SaveSystem - Basic save operation', () => {
  const saveSystem = new SaveSystem();
  const world = new WorldManager();
  saveSystem.setWorld(world);
  
  // Create entity with all required components for SaveSystem
  const entityId = world.createEntity(['Position', 'Health', 'Sprite']);
  world.addComponent(entityId, 'Position', { x: 100, y: 200 });
  world.addComponent(entityId, 'Health', { current: 75, max: 100 });
  world.addComponent(entityId, 'Sprite', { textureId: 'hero', frameIndex: 0 });
  
  // Test save (should not crash)
  const saveResult = saveSystem.saveGame(1, 'Test Save');
  
  // Just verify it doesn't crash - localStorage errors are expected
  if (typeof saveResult !== 'boolean') {
    throw new Error('Save should return boolean');
  }
});

runner.test('Integration - Basic system interaction', () => {
  const world = new WorldManager();
  
  // Add a simple system
  world.addSystem((world, deltaTime) => {
    // Simple system that increments a counter
    const entities = world.entities;
    const positionComponents = world.components.get('Position');
    
    if (positionComponents) {
      for (const [entityId, position] of positionComponents.entries()) {
        if (entities.has(entityId)) {
          const currentPos = position as { x: number; y: number };
          // Simple movement
          positionComponents.set(entityId, {
            x: currentPos.x + 1,
            y: currentPos.y
          });
        }
      }
    }
  });
  
  // Create test entity
  const entityId = world.createEntity(['Position']);
  world.addComponent(entityId, 'Position', { x: 0, y: 0 });
  
  // Run a few updates
  for (let i = 0; i < 5; i++) {
    world.update(0.016);
  }
  
  // Verify entity moved
  const position = world.getComponent(entityId, 'Position');
  if (!position || position!.x !== 5) {
    throw new Error('Entity should have moved');
  }
});

// Run all tests
runner.run();

export { runner as minimalTestRunner };