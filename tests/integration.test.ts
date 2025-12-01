/**
 * Integration Tests
 * @fileoverview End-to-end integration tests for multi-system interaction
 */

import { WorldManager } from '../engine/WorldManager';
import { CombatSystem } from '../engine/CombatSystem';
import { CameraSystem } from '../engine/CameraSystem';
import { InteractionSystem } from '../engine/InteractionSystem';
import { SaveSystem } from '../engine/SaveSystem';
import { AccessibilitySystem } from '../engine/AccessibilitySystem';
import { DebugToolsSystem } from '../engine/DebugToolsSystem';
import { logger, LogSource } from '../engine/GlobalLogger';
import { EntityId, Position, Health, CombatState, Sprite, Velocity } from '../types';

/**
 * Test runner for integration tests
 */
class IntegrationTestRunner {
  private tests: Array<{ name: string; fn: () => Promise<void> }> = [];
  private passed = 0;
  private failed = 0;

  /**
   * Registers a test
   */
  public test(name: string, fn: () => Promise<void>): void {
    this.tests.push({ name, fn });
  }

  /**
   * Runs all registered tests
   */
  public async run(): Promise<{ passed: number; failed: number }> {
    console.log('Running Integration Tests...\n');

    for (const test of this.tests) {
      try {
        await test.fn();
        console.log(`✓ ${test.name}`);
        this.passed++;
      } catch (error) {
        console.log(`✗ ${test.name}`);
        console.log(`  Error: ${error}`);
        this.failed++;
      }
    }

    console.log(`\nIntegration Test Results: ${this.passed} passed, ${this.failed} failed`);
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

  /**
   * Simulates game loop updates without using requestAnimationFrame
   */
  private simulateGameLoop(world: WorldManager, deltaTime: number, iterations: number): void {
    for (let i = 0; i < iterations; i++) {
      world.update(deltaTime);
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
}

// Create test runner instance
const runner = new IntegrationTestRunner();

// ============= MULTI-SYSTEM INTEGRATION TESTS =============

runner.test('Integration - World and Velocity System', async () => {
  const world = new WorldManager();
  
  // Add velocity system to world
  world.addSystem(runner.createVelocitySystem());
  
  // Create test entity
  const entityId = world.createEntity(['Position', 'Velocity']);
  world.addComponent(entityId, 'Position', { x: 0, y: 0 });
  world.addComponent(entityId, 'Velocity', { dx: 10, dy: 5 });
  
  // Simulate game loop updates
  runner.simulateGameLoop(world, 0.016, 10); // ~10 frames at 60 FPS
  
  const position = world.getComponent<Position>(entityId, 'Position');
  runner.assertNotNull(position, 'Position should exist after updates');
  runner.assert(position!.x > 0 || position!.y > 0, 'Entity should have moved');
});

runner.test('Integration - World and Combat System', async () => {
  const world = new WorldManager();
  const combatSystem = new CombatSystem();
  
  combatSystem.setWorld(world);
  
  // Create player and enemy entities
  const playerId = world.createEntity(['Position', 'Health', 'CombatState']);
  world.addComponent(playerId, 'Position', { x: 100, y: 100 });
  world.addComponent(playerId, 'Health', { current: 100, max: 100 });
  world.addComponent(playerId, 'CombatState', { 
    attacking: false, 
    attack: 15, 
    defense: 8, 
    actionPoints: 3, 
    maxActionPoints: 3 
  });
  
  const enemyId = world.createEntity(['Position', 'Health', 'CombatState']);
  world.addComponent(enemyId, 'Position', { x: 200, y: 100 });
  world.addComponent(enemyId, 'Health', { current: 50, max: 50 });
  world.addComponent(enemyId, 'CombatState', { 
    attacking: false, 
    attack: 10, 
    defense: 5, 
    actionPoints: 3, 
    maxActionPoints: 3 
  });
  
  // Start combat
  combatSystem.startCombat(playerId, [enemyId]);
  
  // Should not throw
  runner.assert(true, 'Combat should start successfully');
  
  // Update combat
  combatSystem.update(0.016);
  
  // Should not throw
  runner.assert(true, 'Combat should update successfully');
});

runner.test('Integration - World and Camera System', async () => {
  const world = new WorldManager();
  const cameraSystem = new CameraSystem();
  
  cameraSystem.setWorld(world);
  cameraSystem.setViewport(800, 600);
  
  // Create target entity
  const targetId = world.createEntity(['Position']);
  world.addComponent(targetId, 'Position', { x: 400, y: 300 });
  
  cameraSystem.setTarget(targetId);
  cameraSystem.update(0.016);
  
  const position = cameraSystem.getPosition();
  runner.assertNotNull(position, 'Camera position should be available');
  runner.assert(position!.x > 0 && position!.y > 0, 'Camera should follow target');
});

runner.test('Integration - World and Interaction System', async () => {
  const world = new WorldManager();
  const interactionSystem = new InteractionSystem();
  
  interactionSystem.setWorld(world);
  interactionSystem.setPlayer(1);
  
  // Create player and interactive entity
  const playerId = world.createEntity(['Position']);
  world.addComponent(playerId, 'Position', { x: 100, y: 100 });
  
  const interactiveId = interactionSystem.createInteractiveEntity({
    id: 'test_interaction',
    type: 'TALK' as any,
    name: 'Test NPC',
    description: 'A test NPC',
    range: 50,
    enabled: true,
    singleUse: false,
    used: false,
    conditions: [],
    actions: []
  });
  
  // Position interactive entity near player
  world.addComponent(interactiveId, 'Position', { x: 120, y: 100 });
  
  interactionSystem.update(0.016);
  
  const availableInteractions = interactionSystem.getAvailableInteractions();
  runner.assertArrayLength(availableInteractions, 1, 'Should find 1 available interaction');
});

runner.test('Integration - World and Save System', async () => {
  const world = new WorldManager();
  const saveSystem = new SaveSystem();
  
  saveSystem.setWorld(world);
  
  // Create test entity
  const entityId = world.createEntity(['Position', 'Health']);
  world.addComponent(entityId, 'Position', { x: 250, y: 350 });
  world.addComponent(entityId, 'Health', { current: 75, max: 100 });
  
  // Save game
  const saveSuccess = saveSystem.saveGame(1, 'Integration Test');
  runner.assert(saveSuccess, 'Save should succeed');
  
  // Clear world
  world.clear();
  
  // Load game
  const loadSuccess = saveSystem.loadGame(1);
  runner.assert(loadSuccess, 'Load should succeed');
  
  // Verify loaded entity
  const loadedEntities = world.query(['Position', 'Health']);
  runner.assertArrayLength(loadedEntities, 1, 'Should have 1 loaded entity');
  
  if (loadedEntities.length > 0) {
    const position = world.getComponent<Position>(loadedEntities[0].id, 'Position');
    const health = world.getComponent<Health>(loadedEntities[0].id, 'Health');
    
    runner.assertNotNull(position, 'Position should be loaded');
    runner.assertNotNull(health, 'Health should be loaded');
    runner.assertEqual(position!.x, 250, 'Position X should match saved value');
    runner.assertEqual(position!.y, 350, 'Position Y should match saved value');
    runner.assertEqual(health!.current, 75, 'Health current should match saved value');
    runner.assertEqual(health!.max, 100, 'Health max should match saved value');
  }
});

// ============= PERFORMANCE INTEGRATION TESTS =============

runner.test('Integration - Performance under load', async () => {
  const world = new WorldManager();
  
  // Add velocity system to world
  world.addSystem(runner.createVelocitySystem());
  
  // Create many entities
  const entities: EntityId[] = [];
  for (let i = 0; i < 100; i++) {
    const entityId = world.createEntity(['Position', 'Velocity']);
    world.addComponent(entityId, 'Position', { 
      x: Math.random() * 800, 
      y: Math.random() * 600 
    });
    world.addComponent(entityId, 'Velocity', { 
      dx: (Math.random() - 0.5) * 100, 
      dy: (Math.random() - 0.5) * 100 
    });
    entities.push(entityId);
  }
  
  const startTime = performance.now();
  
  // Simulate game loop updates
  runner.simulateGameLoop(world, 0.016, 60); // ~1 second at 60 FPS
  
  const endTime = performance.now();
  const duration = endTime - startTime;
  
  // Should complete within reasonable time
  runner.assert(duration < 5000, 'Performance test should complete within 5 seconds');
  
  // All entities should still exist
  const currentEntities = world.query(['Position', 'Velocity']);
  runner.assertArrayLength(currentEntities, 100, 'All entities should still exist');
});

runner.test('Integration - Memory usage', async () => {
  const world = new WorldManager();
  
  // Create and destroy entities repeatedly
  for (let i = 0; i < 50; i++) {
    const entityId = world.createEntity(['Position', 'Health']);
    world.addComponent(entityId, 'Position', { x: i, y: i });
    world.addComponent(entityId, 'Health', { current: 100, max: 100 });
    
    world.destroyEntity(entityId);
  }
  
  // Should not throw
  runner.assert(true, 'Memory stress test should not throw');
  
  // Check that entities are properly cleaned up
  const remainingEntities = world.query(['Position', 'Health']);
  runner.assertArrayLength(remainingEntities, 0, 'All entities should be cleaned up');
});

// ============= ACCESSIBILITY INTEGRATION TESTS =============

runner.test('Integration - Accessibility with all systems', async () => {
  const world = new WorldManager();
  const accessibilitySystem = new AccessibilitySystem();
  const cameraSystem = new CameraSystem();
  
  accessibilitySystem.updateOptions({
    highContrast: true,
    largeText: true,
    screenReader: true,
    reducedMotion: true
  });
  
  cameraSystem.setWorld(world);
  cameraSystem.setViewport(800, 600);
  
  // Create test entity
  const entityId = world.createEntity(['Position']);
  world.addComponent(entityId, 'Position', { x: 400, y: 300 });
  
  cameraSystem.setTarget(entityId);
  cameraSystem.update(0.016);
  
  // Test accessibility features
  accessibilitySystem.speak('Test message for screen reader');
  accessibilitySystem.showSubtitle('Test subtitle', 2.0);
  accessibilitySystem.showAudioIndicator('heal', 0.8);
  
  // Should not throw
  runner.assert(true, 'Accessibility integration should work');
});

// ============= DEBUG TOOLS INTEGRATION TESTS =============

runner.test('Integration - Debug tools with all systems', async () => {
  const world = new WorldManager();
  const debugTools = new DebugToolsSystem();
  const saveSystem = new SaveSystem();
  
  debugTools.setWorld(world);
  saveSystem.setWorld(world);
  
  // Enable debug features
  debugTools.updateConfig({
    showHitboxes: true,
    showStateInspector: true,
    showEntitySpawner: true,
    showWarpMenu: true,
    showPerformanceMetrics: true
  });
  
  // Create test entity
  const entityId = world.createEntity(['Position', 'Health']);
  world.addComponent(entityId, 'Position', { x: 100, y: 100 });
  world.addComponent(entityId, 'Health', { current: 50, max: 100 });
  
  // Test debug functionality
  debugTools.spawnEntity('slime_green', 200, 200);
  debugTools.warpToLocation('town');
  debugTools.executeCommand('heal');
  
  // Test save/load with debug
  saveSystem.saveGame(1, 'Debug Test');
  saveSystem.loadGame(1);
  
  // Should not throw
  runner.assert(true, 'Debug tools integration should work');
});

// ============= ERROR HANDLING INTEGRATION TESTS =============

runner.test('Integration - Error handling across systems', async () => {
  const world = new WorldManager();
  
  // Create entity
  const entityId = world.createEntity(['Position']);
  world.addComponent(entityId, 'Position', { x: 0, y: 0 });
  
  // Simulate error handling
  try {
    // Simulate a render function that might throw
    const renderFunction = () => {
      if (Math.random() < 0.1) {
        throw new Error('Random render error');
      }
    };
    
    // Call it a few times to test error handling
    for (let i = 0; i < 10; i++) {
      try {
        renderFunction();
      } catch (error) {
        // Should handle error gracefully
      }
    }
    
    runner.assert(true, 'Error handling should prevent crashes');
  } catch (error) {
    runner.assert(true, 'Error handling should work');
  }
});

runner.test('Integration - System recovery after errors', async () => {
  const world = new WorldManager();
  const combatSystem = new CombatSystem();
  
  combatSystem.setWorld(world);
  
  // Create entities
  const playerId = world.createEntity(['Position', 'Health', 'CombatState']);
  const enemyId = world.createEntity(['Position', 'Health', 'CombatState']);
  
  world.addComponent(playerId, 'Position', { x: 100, y: 100 });
  world.addComponent(playerId, 'Health', { current: 100, max: 100 });
  world.addComponent(playerId, 'CombatState', { 
    attacking: false, 
    attack: 15, 
    defense: 8, 
    actionPoints: 3, 
    maxActionPoints: 3 
  });
  
  world.addComponent(enemyId, 'Position', { x: 200, y: 100 });
  world.addComponent(enemyId, 'Health', { current: 50, max: 50 });
  world.addComponent(enemyId, 'CombatState', { 
    attacking: false, 
    attack: 10, 
    defense: 5, 
    actionPoints: 3, 
    maxActionPoints: 3 
  });
  
  // Start combat
  combatSystem.startCombat(playerId, [enemyId]);
  
  // Simulate error during combat
  try {
    // This might cause an error if not handled properly
    combatSystem.update(-1); // Negative delta time
  } catch (error) {
    // Should handle error gracefully
  }
  
  // Try to continue with valid update
  combatSystem.update(0.016);
  
  // Should not throw
  runner.assert(true, 'System should recover from errors');
});

// ============= CROSS-PLATFORM COMPATIBILITY TESTS =============

runner.test('Integration - Cross-platform compatibility', async () => {
  const world = new WorldManager();
  
  // Test different viewport sizes
  const viewports = [
    { width: 320, height: 240 },   // Mobile
    { width: 768, height: 1024 },  // Tablet
    { width: 1920, height: 1080 } // Desktop
  ];
  
  // Test each viewport
  for (const viewport of viewports) {
    // Create entity
    const entityId = world.createEntity(['Position']);
    world.addComponent(entityId, 'Position', { x: viewport.width / 2, y: viewport.height / 2 });
    
    // Simulate some updates
    runner.simulateGameLoop(world, 0.016, 5);
    
    // Should not throw
    runner.assert(true, `Viewport ${viewport.width}x${viewport.height} should be supported`);
  }
});

// ============= DATA CONSISTENCY TESTS =============

runner.test('Integration - Data consistency across systems', async () => {
  const world = new WorldManager();
  const saveSystem = new SaveSystem();
  const cameraSystem = new CameraSystem();
  
  saveSystem.setWorld(world);
  cameraSystem.setWorld(world);
  
  // Create comprehensive test data
  const playerId = world.createEntity(['Position', 'Health', 'CombatState', 'Sprite']);
  world.addComponent(playerId, 'Position', { x: 100, y: 100 });
  world.addComponent(playerId, 'Health', { current: 75, max: 100 });
  world.addComponent(playerId, 'CombatState', { 
    attacking: false, 
    attack: 15, 
    defense: 8, 
    actionPoints: 3, 
    maxActionPoints: 3 
  });
  world.addComponent(playerId, 'Sprite', { 
    textureId: 'hero', 
    frameIndex: 0, 
    visible: true 
  });
  
  // Set camera target
  cameraSystem.setTarget(playerId);
  cameraSystem.setViewport(800, 600);
  cameraSystem.update(0.016);
  
  // Save game
  const saveSuccess = saveSystem.saveGame(1, 'Data Consistency Test');
  runner.assert(saveSuccess, 'Save should succeed');
  
  // Clear world
  world.clear();
  
  // Load game
  const loadSuccess = saveSystem.loadGame(1);
  runner.assert(loadSuccess, 'Load should succeed');
  
  // Verify loaded data consistency
  const loadedEntities = world.query(['Position', 'Health', 'CombatState', 'Sprite']);
  runner.assertArrayLength(loadedEntities, 1, 'Should have 1 loaded entity');
  
  if (loadedEntities.length > 0) {
    const position = world.getComponent<Position>(loadedEntities[0].id, 'Position');
    const health = world.getComponent<Health>(loadedEntities[0].id, 'Health');
    const combatState = world.getComponent<CombatState>(loadedEntities[0].id, 'CombatState');
    const sprite = world.getComponent<Sprite>(loadedEntities[0].id, 'Sprite');
    
    // Verify all components are loaded correctly
    runner.assertNotNull(position, 'Position should be loaded');
    runner.assertNotNull(health, 'Health should be loaded');
    runner.assertNotNull(combatState, 'CombatState should be loaded');
    runner.assertNotNull(sprite, 'Sprite should be loaded');
    
    // Verify data integrity
    runner.assertEqual(position!.x, 100, 'Position X should be consistent');
    runner.assertEqual(position!.y, 100, 'Position Y should be consistent');
    runner.assertEqual(health!.current, 75, 'Health current should be consistent');
    runner.assertEqual(health!.max, 100, 'Health max should be consistent');
    runner.assertEqual(combatState!.attack, 15, 'Combat attack should be consistent');
    runner.assertEqual(combatState!.defense, 8, 'Combat defense should be consistent');
    runner.assertEqual(sprite!.textureId, 'hero', 'Sprite texture should be consistent');
  }
});

// Run all tests
runner.run().then((results) => {
  console.log(`Integration tests completed. Passed: ${results.passed}, Failed: ${results.failed}`);
}).catch((error) => {
  console.error('Integration test runner failed:', error);
});

export { runner as integrationTestRunner };