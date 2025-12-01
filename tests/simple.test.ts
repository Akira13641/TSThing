/**
 * Simple Test Runner
 * @fileoverview Minimal test runner for basic functionality
 */

import { WorldManager } from '../engine/WorldManager';
import { SaveSystem } from '../engine/SaveSystem';

/**
 * Simple test runner
 */
class SimpleTestRunner {
  private tests: Array<{ name: string; fn: () => void }> = [];
  private passed = 0;
  private failed = 0;

  public test(name: string, fn: () => void): void {
    this.tests.push({ name, fn });
  }

  public run(): { passed: number; failed: number } {
    console.log('Running Simple Tests...\n');

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

    console.log(`\nSimple Test Results: ${this.passed} passed, ${this.failed} failed`);
    return { passed: this.passed, failed: this.failed };
  }
}

// Create test runner instance
const runner = new SimpleTestRunner();

// Basic functionality tests
runner.test('WorldManager - Basic functionality', () => {
  const world = new WorldManager();
  const entityId = world.createEntity();
  
  if (entityId === null || entityId < 0) {
    throw new Error('Entity creation failed');
  }
  
  world.addComponent(entityId, 'Position', { x: 100, y: 200 });
  const position = world.getComponent(entityId, 'Position');
  
  if (!position || position.x !== 100 || position.y !== 200) {
    throw new Error('Component addition/retrieval failed');
  }
});

runner.test('SaveSystem - Basic functionality', () => {
  const saveSystem = new SaveSystem();
  const world = new WorldManager();
  saveSystem.setWorld(world);
  
  // Create test entity
  const entityId = world.createEntity(['Position']);
  world.addComponent(entityId, 'Position', { x: 100, y: 200 });
  
  // Test save (should fail gracefully without localStorage)
  const saveResult = saveSystem.saveGame(1, 'Test Save');
  
  // Just verify it doesn't crash
  if (typeof saveResult !== 'boolean') {
    throw new Error('Save should return boolean');
  }
});

// Run all tests
runner.run();

export { runner as simpleTestRunner };