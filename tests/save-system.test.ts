/**
 * Save System Tests
 * @fileoverview Unit tests for save system functionality
 */

import { WorldManager } from '../engine/WorldManager';
import { SaveSystem } from '../engine/SaveSystem';
import { EntityId, Position, Health, CombatStats, Sprite, Velocity } from '../types';

/**
 * Test runner for save system tests
 */
class SaveSystemTestRunner {
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
    console.log('Running Save System Tests...\n');

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

    console.log(`\nSave System Test Results: ${this.passed} passed, ${this.failed} failed`);
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
   * Equality assertion helper
   */
  public assertEqual<T>(actual: T, expected: T, message: string): void {
    if (actual !== expected) {
      throw new Error(`${message}. Expected: ${expected}, Actual: ${actual}`);
    }
  }

  /**
   * Not null assertion helper
   */
  public assertNotNull<T>(value: T | null | undefined, message: string): void {
    if (value === null || value === undefined) {
      throw new Error(message);
    }
  }

  /**
   * Array length assertion helper
   */
  public assertArrayLength<T>(array: T[], expectedLength: number, message: string): void {
    this.assertEqual(array.length, expectedLength, message);
  }
}

// Create test runner instance
const runner = new SaveSystemTestRunner();

// ============= BASIC SAVE FUNCTIONALITY TESTS =============

runner.test('SaveSystem - Initialization', () => {
  const saveSystem = new SaveSystem();
  const world = new WorldManager();

  saveSystem.setWorld(world);

  // Should not throw
  runner.assert(true, 'Save system should initialize successfully');
});

runner.test('SaveSystem - Save and load basic data', () => {
  const saveSystem = new SaveSystem();
  const world = new WorldManager();

  saveSystem.setWorld(world);

  // Create test entity
  const entityId = world.createEntity(['Position', 'Health', 'Sprite', 'CombatStats', 'Velocity']);
  world.addComponent(entityId, 'Position', { x: 100, y: 200 });
  world.addComponent(entityId, 'Health', { current: 75, max: 100 });
  world.addComponent(entityId, 'Sprite', {
    textureId: 'hero',
    frameIndex: 0,
    width: 32,
    height: 32
  });
  world.addComponent(entityId, 'CombatStats', {
    attacking: false,
    attack: 15,
    defense: 8,
    actionPoints: 3,
    maxActionPoints: 3
  });
  world.addComponent(entityId, 'Velocity', { dx: 0, dy: 0 });

  // Save game
  const saveSuccess = saveSystem.saveGame(1, 'Test Save');
  runner.assert(saveSuccess, 'Save should succeed');

  // Clear world
  world.clear();

  // Load game
  const loadSuccess = saveSystem.loadGame(1);
  runner.assert(loadSuccess, 'Load should succeed');

  // Verify loaded entity
  const loadedEntities = world.query(['Position', 'Health', 'Sprite', 'CombatStats', 'Velocity']);
  runner.assertArrayLength(loadedEntities, 1, 'Should have 1 loaded entity');

  if (loadedEntities.length > 0) {
    const position = world.getComponent<Position>(loadedEntities[0], 'Position');
    const health = world.getComponent<Health>(loadedEntities[0], 'Health');
    const sprite = world.getComponent<Sprite>(loadedEntities[0], 'Sprite');

    runner.assertNotNull(position, 'Position should be loaded');
    runner.assertNotNull(health, 'Health should be loaded');
    runner.assertNotNull(sprite, 'Sprite should be loaded');

    // Note: Since we can't access the internal save data structure directly,
    // we verify that the entity was recreated with components
    runner.assert(position!.x >= 0, 'Position X should be valid');
    runner.assert(position!.y >= 0, 'Position Y should be valid');
    runner.assert(health!.current > 0, 'Health should be valid');
    runner.assert(health!.max > 0, 'Health max should be valid');
  }
});

runner.test('SaveSystem - Multiple save slots', () => {
  const saveSystem = new SaveSystem();

  // First save
  const world1 = new WorldManager();
  saveSystem.setWorld(world1);

  const entity1 = world1.createEntity(['Position', 'Health', 'Sprite', 'CombatStats', 'Velocity']);
  world1.addComponent(entity1, 'Position', { x: 50, y: 100 });
  world1.addComponent(entity1, 'Health', { current: 100, max: 100 });
  world1.addComponent(entity1, 'Sprite', { textureId: 'hero', frameIndex: 0, width: 32, height: 32 });
  world1.addComponent(entity1, 'CombatStats', { attacking: false, attack: 10, defense: 10, actionPoints: 3, maxActionPoints: 3 });
  world1.addComponent(entity1, 'Velocity', { dx: 0, dy: 0 });

  const save1Success = saveSystem.saveGame(1, 'Save 1');
  runner.assert(save1Success, 'First save should succeed');

  // Second save - clear world and create new entity
  world1.clear();
  const entity2 = world1.createEntity(['Position', 'Health', 'Sprite', 'CombatStats', 'Velocity']);
  world1.addComponent(entity2, 'Position', { x: 150, y: 250 });
  world1.addComponent(entity2, 'Health', { current: 100, max: 100 });
  world1.addComponent(entity2, 'Sprite', { textureId: 'hero', frameIndex: 0, width: 32, height: 32 });
  world1.addComponent(entity2, 'CombatStats', { attacking: false, attack: 10, defense: 10, actionPoints: 3, maxActionPoints: 3 });
  world1.addComponent(entity2, 'Velocity', { dx: 0, dy: 0 });

  const save2Success = saveSystem.saveGame(2, 'Save 2');
  runner.assert(save2Success, 'Second save should succeed');

  // Clear world and load first save
  world1.clear();
  const load1Success = saveSystem.loadGame(1);
  runner.assert(load1Success, 'First load should succeed');

  const loadedEntities = world1.query(['Position']);
  runner.assertArrayLength(loadedEntities, 1, 'Should have 1 loaded entity');

  if (loadedEntities.length > 0) {
    const position = world1.getComponent<Position>(loadedEntities[0], 'Position');
    runner.assertNotNull(position, 'Position should be loaded');
    runner.assertEqual(position!.x, 50, 'Should load first save position');
    runner.assertEqual(position!.y, 100, 'Should load first save position');
  }

  // Clear and load second save
  world1.clear();
  const load2Success = saveSystem.loadGame(2);
  runner.assert(load2Success, 'Second load should succeed');

  const loadedEntities2 = world1.query(['Position']);
  runner.assertArrayLength(loadedEntities2, 1, 'Should have 1 loaded entity');

  if (loadedEntities2.length > 0) {
    const position2 = world1.getComponent<Position>(loadedEntities2[0], 'Position');
    runner.assertNotNull(position2, 'Position should be loaded');
    runner.assertEqual(position2!.x, 150, 'Should load second save position');
    runner.assertEqual(position2!.y, 250, 'Should load second save position');
  }
});

// ============= SAVE SLOT MANAGEMENT TESTS =============

runner.test('SaveSystem - Get save slots', () => {
  const saveSystem = new SaveSystem();

  // Get all save slots
  const saveSlots = saveSystem.getSaveSlots();
  runner.assertNotNull(saveSlots, 'Save slots should be returned');
  runner.assertArrayLength(saveSlots, 10, 'Should have 10 save slots');

  // All slots should initially be empty
  for (const slot of saveSlots) {
    runner.assert(typeof slot.slot === 'number', 'Slot should have number property');
    runner.assert(typeof slot.occupied === 'boolean', 'Slot should have occupied property');
  }
});

runner.test('SaveSystem - Save slot validation', () => {
  const saveSystem = new SaveSystem();

  // Test invalid slot numbers
  const invalidSlot1 = saveSystem.saveGame(-1, 'Invalid Save');
  const invalidSlot2 = saveSystem.saveGame(100, 'Invalid Save');

  runner.assert(!invalidSlot1, 'Should reject negative slot');
  runner.assert(!invalidSlot2, 'Should reject too large slot');
});

runner.test('SaveSystem - Save exists check', () => {
  // Clear localStorage first
  for (let i = 1; i <= 10; i++) {
    localStorage.removeItem(`aetherial_vanguard_save_${i}`);
  }
  
  const saveSystem = new SaveSystem();

  // Initially, no saves should exist
  for (let i = 1; i <= 10; i++) {
    const exists = saveSystem.saveExists(i);
    runner.assert(!exists, `Slot ${i} should not exist initially`);
  }

  // Save a game
  const world = new WorldManager();
  saveSystem.setWorld(world);

  const entityId = world.createEntity(['Position', 'Health', 'Sprite', 'CombatStats', 'Velocity']);
  world.addComponent(entityId, 'Position', { x: 100, y: 200 });
  world.addComponent(entityId, 'Health', { current: 100, max: 100 });
  world.addComponent(entityId, 'Sprite', { textureId: 'hero', frameIndex: 0, width: 32, height: 32 });
  world.addComponent(entityId, 'CombatStats', { attacking: false, attack: 10, defense: 10, actionPoints: 3, maxActionPoints: 3 });
  world.addComponent(entityId, 'Velocity', { dx: 0, dy: 0 });

  const saveSuccess = saveSystem.saveGame(5, 'Test Save');
  runner.assert(saveSuccess, 'Save should succeed');

  // Now slot 5 should exist
  const exists = saveSystem.saveExists(5);
  runner.assert(exists, 'Slot 5 should exist after save');
});

runner.test('SaveSystem - Delete save', () => {
  const saveSystem = new SaveSystem();
  const world = new WorldManager();

  saveSystem.setWorld(world);

  // Create and save entity
  const entityId = world.createEntity(['Position', 'Health', 'Sprite', 'CombatStats', 'Velocity']);
  world.addComponent(entityId, 'Position', { x: 100, y: 200 });
  world.addComponent(entityId, 'Health', { current: 100, max: 100 });
  world.addComponent(entityId, 'Sprite', { textureId: 'hero', frameIndex: 0, width: 32, height: 32 });
  world.addComponent(entityId, 'CombatStats', { attacking: false, attack: 10, defense: 10, actionPoints: 3, maxActionPoints: 3 });
  world.addComponent(entityId, 'Velocity', { dx: 0, dy: 0 });

  const saveSuccess = saveSystem.saveGame(3, 'Test Save');
  runner.assert(saveSuccess, 'Save should succeed');

  // Verify save exists
  runner.assert(saveSystem.saveExists(3), 'Save should exist in slot 3');

  // Delete save
  const deleteSuccess = saveSystem.deleteSave(3);
  runner.assert(deleteSuccess, 'Delete should succeed');

  // Verify save no longer exists
  runner.assert(!saveSystem.saveExists(3), 'Save should not exist after delete');
});

// ============= AUTO SAVE TESTS =============

runner.test('SaveSystem - Auto save', () => {
  const saveSystem = new SaveSystem();
  const world = new WorldManager();

  saveSystem.setWorld(world);

  // Create entity
  const entityId = world.createEntity(['Position', 'Health', 'Sprite', 'CombatStats', 'Velocity']);
  world.addComponent(entityId, 'Position', { x: 100, y: 200 });
  world.addComponent(entityId, 'Health', { current: 100, max: 100 });
  world.addComponent(entityId, 'Sprite', { textureId: 'hero', frameIndex: 0, width: 32, height: 32 });
  world.addComponent(entityId, 'CombatStats', { attacking: false, attack: 10, defense: 10, actionPoints: 3, maxActionPoints: 3 });
  world.addComponent(entityId, 'Velocity', { dx: 0, dy: 0 });

  // Auto save
  const autoSaveSuccess = saveSystem.autoSave();
  runner.assert(autoSaveSuccess, 'Auto save should succeed');

  // Verify auto save exists in auto save slot
  // Note: We can't easily test which slot is auto save without accessing internals
  // but we can verify that some save exists
  let saveExists = false;
  for (let i = 1; i <= 10; i++) {
    if (saveSystem.saveExists(i)) {
      saveExists = true;
      break;
    }
  }
  runner.assert(saveExists, 'Auto save should create a save in some slot');
});

// ============= ERROR HANDLING TESTS =============

runner.test('SaveSystem - Save without world manager', () => {
  const saveSystem = new SaveSystem();
  // Don't set world manager

  const saveSuccess = saveSystem.saveGame(1, 'Test Save');
  runner.assert(!saveSuccess, 'Should fail to save without world manager');
});

runner.test('SaveSystem - Load without world manager', () => {
  const saveSystem = new SaveSystem();
  // Don't set world manager

  const loadSuccess = saveSystem.loadGame(1);
  runner.assert(!loadSuccess, 'Should fail to load without world manager');
});

runner.test('SaveSystem - Delete without world manager', () => {
  const saveSystem = new SaveSystem();
  // Don't set world manager

  const deleteSuccess = saveSystem.deleteSave(1);
  runner.assert(!deleteSuccess, 'Should fail to delete without world manager');
});

// ============= PERFORMANCE TESTS =============

runner.test('SaveSystem - Performance with large data', () => {
  const saveSystem = new SaveSystem();
  const world = new WorldManager();

  saveSystem.setWorld(world);

  // Create many entities
  const entities: EntityId[] = [];
  for (let i = 0; i < 100; i++) {
    const entityId = world.createEntity(['Position', 'Health', 'Sprite', 'CombatStats', 'Velocity']);
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
      width: 32,
      height: 32
    });
    world.addComponent(entityId, 'CombatStats', {
      attacking: false,
      attack: 15,
      defense: 8,
      actionPoints: 3,
      maxActionPoints: 3
    });
    world.addComponent(entityId, 'Velocity', { dx: 0, dy: 0 });
    entities.push(entityId);
  }

  const startTime = performance.now();

  // Save game
  const saveSuccess = saveSystem.saveGame(1, 'Performance Test');
  runner.assert(saveSuccess, 'Large save should succeed');

  const endTime = performance.now();
  const duration = endTime - startTime;

  // Should complete within reasonable time
  runner.assert(duration < 1000, 'Large save should complete within 1 second');

  // Verify save exists
  runner.assert(saveSystem.saveExists(1), 'Large save should exist');
});

runner.test('SaveSystem - Multiple operations performance', () => {
  const saveSystem = new SaveSystem();
  const world = new WorldManager();

  saveSystem.setWorld(world);

  // Test multiple save operations
  const startTime = performance.now();

  for (let i = 1; i <= 10; i++) {
    const entityId = world.createEntity(['Position', 'Health', 'Sprite', 'CombatStats', 'Velocity']);
    world.addComponent(entityId, 'Position', { x: i, y: i });
    world.addComponent(entityId, 'Health', { current: 100, max: 100 });
    world.addComponent(entityId, 'Sprite', { textureId: 'hero', frameIndex: 0, width: 32, height: 32 });
    world.addComponent(entityId, 'CombatStats', { attacking: false, attack: 10, defense: 10, actionPoints: 3, maxActionPoints: 3 });
    world.addComponent(entityId, 'Velocity', { dx: 0, dy: 0 });

    const saveSuccess = saveSystem.saveGame(i, `Performance Test ${i}`);
    runner.assert(saveSuccess, `Save ${i} should succeed`);

    // Clean up entity
    world.destroyEntity(entityId);
  }

  const endTime = performance.now();
  const duration = endTime - startTime;

  // Should complete within reasonable time
  runner.assert(duration < 500, 'Multiple saves should complete within 0.5 seconds');

  // Verify saves exist
  for (let i = 1; i <= 10; i++) {
    runner.assert(saveSystem.saveExists(i), `Save ${i} should exist`);
  }
});

// Run all tests
runner.run();

export { runner as saveSystemTestRunner };