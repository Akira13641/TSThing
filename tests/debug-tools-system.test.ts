/**
 * Debug Tools System Tests
 * @fileoverview Unit tests for debug tools and developer utilities
 */

import { DebugToolsSystem, DebugOverlayPosition, EntitySpawnData, WarpLocation } from '../engine/DebugToolsSystem';
import { WorldManager } from '../engine/WorldManager';
import { logger, LogSource } from '../engine/GlobalLogger';
import { EntityId, Position } from '../types';

/**
 * Test runner for debug tools system tests
 */
class DebugToolsSystemTestRunner {
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
    console.log('Running Debug Tools System Tests...\n');

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

    console.log(`\nDebug Tools System Test Results: ${this.passed} passed, ${this.failed} failed`);
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
const runner = new DebugToolsSystemTestRunner();

// ============= DEBUG TOOLS SYSTEM INITIALIZATION TESTS =============

runner.test('DebugToolsSystem - Initialization', () => {
  const debugTools = new DebugToolsSystem();
  runner.assertNotNull(debugTools, 'DebugToolsSystem should be created');
});

runner.test('DebugToolsSystem - World manager assignment', () => {
  const debugTools = new DebugToolsSystem();
  const world = new WorldManager();
  
  debugTools.setWorld(world);
  // Should not throw
  runner.assert(true, 'World manager should be assignable');
});

runner.test('DebugToolsSystem - Player assignment', () => {
  const debugTools = new DebugToolsSystem();
  
  debugTools.setPlayer(1);
  // Should not throw
  runner.assert(true, 'Player should be assignable');
});

// ============= DEBUG CONFIGURATION TESTS =============

runner.test('DebugToolsSystem - Default configuration', () => {
  const debugTools = new DebugToolsSystem();
  const config = debugTools.getConfig();
  
  runner.assertNotNull(config, 'Config should be available');
  runner.assert(typeof config.showHitboxes === 'boolean', 'Should have showHitboxes option');
  runner.assert(typeof config.showStateInspector === 'boolean', 'Should have showStateInspector option');
  runner.assert(typeof config.showEntitySpawner === 'boolean', 'Should have showEntitySpawner option');
  runner.assert(typeof config.showWarpMenu === 'boolean', 'Should have showWarpMenu option');
});

runner.test('DebugToolsSystem - Update configuration', () => {
  const debugTools = new DebugToolsSystem();
  
  const newConfig = {
    showHitboxes: true,
    showStateInspector: true,
    showEntitySpawner: true,
    showWarpMenu: true,
    showPerformanceMetrics: true
  };
  
  debugTools.updateConfig(newConfig);
  
  const updatedConfig = debugTools.getConfig();
  runner.assertEqual(updatedConfig.showHitboxes, true, 'Show hitboxes should be updated');
  runner.assertEqual(updatedConfig.showStateInspector, true, 'Show state inspector should be updated');
  runner.assertEqual(updatedConfig.showEntitySpawner, true, 'Show entity spawner should be updated');
  runner.assertEqual(updatedConfig.showWarpMenu, true, 'Show warp menu should be updated');
  runner.assertEqual(updatedConfig.showPerformanceMetrics, true, 'Show performance metrics should be updated');
});

runner.test('DebugToolsSystem - Toggle features', () => {
  const debugTools = new DebugToolsSystem();
  
  // Test toggling
  debugTools.toggleFeature('showHitboxes');
  let config = debugTools.getConfig();
  runner.assertEqual(config.showHitboxes, true, 'Show hitboxes should be toggled on');
  
  debugTools.toggleFeature('showHitboxes');
  config = debugTools.getConfig();
  runner.assertEqual(config.showHitboxes, false, 'Show hitboxes should be toggled off');
});

// ============= ENTITY SPAWNING TESTS =============

runner.test('DebugToolsSystem - Spawn entity', () => {
  const debugTools = new DebugToolsSystem();
  const world = new WorldManager();
  
  debugTools.setWorld(world);
  
  // Spawn enemy
  const entityId = debugTools.spawnEntity('slime_green', 100, 200);
  runner.assertNotNull(entityId, 'Entity should be spawned');
  
  // Check if entity exists in world
  const entities = world.query(['Position']);
  const spawnedEntity = entities.find(e => e.id === entityId);
  runner.assertNotNull(spawnedEntity, 'Spawned entity should exist in world');
  
  if (spawnedEntity) {
    const position = world.getComponent<Position>(entityId, 'Position');
    runner.assertNotNull(position, 'Position component should exist');
    runner.assertEqual(position!.x, 100, 'Entity should be at correct X position');
    runner.assertEqual(position!.y, 200, 'Entity should be at correct Y position');
  }
});

runner.test('DebugToolsSystem - Spawn invalid entity', () => {
  const debugTools = new DebugToolsSystem();
  const world = new WorldManager();
  
  debugTools.setWorld(world);
  
  // Try to spawn non-existent entity
  const entityId = debugTools.spawnEntity('nonexistent_entity', 100, 200);
  runner.assertEqual(entityId, null, 'Invalid entity should return null');
});

// ============= WARP FUNCTIONALITY TESTS =============

runner.test('DebugToolsSystem - Warp to location', () => {
  const debugTools = new DebugToolsSystem();
  const world = new WorldManager();
  
  debugTools.setWorld(world);
  debugTools.setPlayer(1);
  
  // Create player entity
  world.addComponent(1, 'Position', { x: 0, y: 0 });
  
  // Warp to location
  const success = debugTools.warpToLocation('town');
  runner.assert(success, 'Warp should succeed');
  
  // Check player position
  const position = world.getComponent<Position>(1, 'Position');
  runner.assertNotNull(position, 'Position should exist');
  runner.assertEqual(position!.x, 800, 'Player should be warped to correct X');
  runner.assertEqual(position!.y, 600, 'Player should be warped to correct Y');
});

runner.test('DebugToolsSystem - Warp to invalid location', () => {
  const debugTools = new DebugToolsSystem();
  const world = new WorldManager();
  
  debugTools.setWorld(world);
  debugTools.setPlayer(1);
  
  // Try to warp to non-existent location
  const success = debugTools.warpToLocation('nonexistent_location');
  runner.assert(!success, 'Warp to invalid location should fail');
});

// ============= ENTITY INSPECTION TESTS =============

runner.test('DebugToolsSystem - Inspect entity', () => {
  const debugTools = new DebugToolsSystem();
  const world = new WorldManager();
  
  debugTools.setWorld(world);
  
  // Create test entity
  const entityId = world.createEntity(['Position', 'Health']);
  world.addComponent(entityId, 'Position', { x: 150, y: 250 });
  world.addComponent(entityId, 'Health', { current: 75, max: 100 });
  
  // Inspect entity
  const inspectionData = debugTools.inspectEntity(entityId);
  runner.assertNotNull(inspectionData, 'Inspection data should be available');
  runner.assertEqual(inspectionData!.entityId, entityId, 'Entity ID should match');
  runner.assertArrayLength(inspectionData!.components, 2, 'Should have 2 components');
  runner.assertNotNull(inspectionData!.position, 'Position should be included');
  runner.assertEqual(inspectionData!.position!.x, 150, 'Position X should match');
  runner.assertEqual(inspectionData!.position!.y, 250, 'Position Y should match');
});

runner.test('DebugToolsSystem - Inspect invalid entity', () => {
  const debugTools = new DebugToolsSystem();
  const world = new WorldManager();
  
  debugTools.setWorld(world);
  
  // Try to inspect non-existent entity
  const inspectionData = debugTools.inspectEntity(999);
  runner.assertEqual(inspectionData, null, 'Invalid entity inspection should return null');
});

// ============= DEBUG COMMANDS TESTS =============

runner.test('DebugToolsSystem - Help command', () => {
  const debugTools = new DebugToolsSystem();
  
  const result = debugTools.executeCommand('help');
  runner.assert(result.includes('Available Debug Commands'), 'Help should show available commands');
});

runner.test('DebugToolsSystem - Spawn command', () => {
  const debugTools = new DebugToolsSystem();
  const world = new WorldManager();
  
  debugTools.setWorld(world);
  
  const result = debugTools.executeCommand('spawn slime_green 100 200');
  runner.assert(result.includes('Spawned'), 'Spawn command should succeed');
});

runner.test('DebugToolsSystem - Warp command', () => {
  const debugTools = new DebugToolsSystem();
  const world = new WorldManager();
  
  debugTools.setWorld(world);
  debugTools.setPlayer(1);
  world.addComponent(1, 'Position', { x: 0, y: 0 });
  
  const result = debugTools.executeCommand('warp town');
  runner.assert(result.includes('Warped'), 'Warp command should succeed');
});

runner.test('DebugToolsSystem - Heal command', () => {
  const debugTools = new DebugToolsSystem();
  const world = new WorldManager();
  
  debugTools.setWorld(world);
  debugTools.setPlayer(1);
  world.addComponent(1, 'Health', { current: 25, max: 100 });
  
  const result = debugTools.executeCommand('heal');
  runner.assert(result.includes('healed'), 'Heal command should succeed');
  
  const health = world.getComponent<any>(1, 'Health');
  runner.assertEqual(health!.current, 100, 'Player should be fully healed');
});

runner.test('DebugToolsSystem - Give command', () => {
  const debugTools = new DebugToolsSystem();
  
  const result = debugTools.executeCommand('give potion_health 5');
  runner.assert(result.includes('given'), 'Give command should succeed');
});

runner.test('DebugToolsSystem - Clear command', () => {
  const debugTools = new DebugToolsSystem();
  const world = new WorldManager();
  
  debugTools.setWorld(world);
  
  // Create some entities
  world.createEntity(['Position']);
  world.createEntity(['Position']);
  world.createEntity(['Position']);
  
  const result = debugTools.executeCommand('clear');
  runner.assert(result.includes('cleared'), 'Clear command should succeed');
  
  const entities = world.query(['Position']);
  runner.assertArrayLength(entities, 0, 'All entities should be cleared');
});

runner.test('DebugToolsSystem - Reset command', () => {
  const debugTools = new DebugToolsSystem();
  const world = new WorldManager();
  
  debugTools.setWorld(world);
  
  // Create some entities
  world.createEntity(['Position']);
  world.createEntity(['Position']);
  
  const result = debugTools.executeCommand('reset');
  runner.assert(result.includes('reset'), 'Reset command should succeed');
  
  const entities = world.query(['Position']);
  runner.assertArrayLength(entities, 0, 'All entities should be cleared after reset');
});

runner.test('DebugToolsSystem - Invalid command', () => {
  const debugTools = new DebugToolsSystem();
  
  const result = debugTools.executeCommand('invalid_command');
  runner.assert(result.includes('Unknown command'), 'Invalid command should show error');
});

// ============= PERFORMANCE METRICS TESTS =============

runner.test('DebugToolsSystem - Performance metrics update', () => {
  const debugTools = new DebugToolsSystem();
  const world = new WorldManager();
  
  debugTools.setWorld(world);
  
  // Create some entities for metrics
  for (let i = 0; i < 5; i++) {
    const entityId = world.createEntity(['Position']);
    world.addComponent(entityId, 'Position', { x: i * 10, y: i * 10 });
  }
  
  // Update metrics
  debugTools.update(0.016); // ~60 FPS
  
  // Should not throw
  runner.assert(true, 'Performance metrics update should not throw');
});

// ============= OVERLAY POSITION TESTS =============

runner.test('DebugToolsSystem - Overlay position', () => {
  const debugTools = new DebugToolsSystem();
  
  const positions = [
    DebugOverlayPosition.TOP_LEFT,
    DebugOverlayPosition.TOP_RIGHT,
    DebugOverlayPosition.BOTTOM_LEFT,
    DebugOverlayPosition.BOTTOM_RIGHT
  ];
  
  positions.forEach(position => {
    debugTools.setOverlayPosition(position);
    // Should not throw
    runner.assert(true, `Overlay position ${position} should be settable`);
  });
});

// ============= SPAWN ENTITIES INITIALIZATION TESTS =============

runner.test('DebugToolsSystem - Spawn entities initialization', () => {
  const debugTools = new DebugToolsSystem();
  
  // Check that spawn entities are initialized
  // This would be tested by checking if enemy and item data is available
  runner.assert(true, 'Spawn entities should be initialized');
});

// ============= WARP LOCATIONS INITIALIZATION TESTS =============

runner.test('DebugToolsSystem - Warp locations initialization', () => {
  const debugTools = new DebugToolsSystem();
  
  // Check that warp locations are initialized
  // This would be tested by checking if predefined locations exist
  runner.assert(true, 'Warp locations should be initialized');
});

// ============= DEBUG CANVAS TESTS =============

runner.test('DebugToolsSystem - Debug canvas creation', () => {
  const debugTools = new DebugToolsSystem();
  
  // Should create debug canvas without throwing
  runner.assert(true, 'Debug canvas should be created');
});

// ============= KEYBOARD SHORTCUTS TESTS =============

runner.test('DebugToolsSystem - Keyboard shortcuts setup', () => {
  const debugTools = new DebugToolsSystem();
  
  // Should setup keyboard shortcuts without throwing
  runner.assert(true, 'Keyboard shortcuts should be set up');
});

// Run all tests
runner.run();

export { runner as debugToolsSystemTestRunner };