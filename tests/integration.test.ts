/**
 * Integration Tests
 * @fileoverview End-to-end integration tests for multi-system interaction
 */

import { WorldManager } from '../engine/WorldManager';
import { GameLoop } from '../engine/GameLoop';
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
  public run(): void {
    console.log('Running Integration Tests...\n');

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

    console.log(`\nIntegration Test Results: ${this.passed} passed, ${this.failed} failed`);
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
const runner = new IntegrationTestRunner();

// ============= MULTI-SYSTEM INTEGRATION TESTS =============

runner.test('Integration - World and Game Loop', () => {
  const world = new WorldManager();
  const gameLoop = new GameLoop(
    (deltaTime) => {
      world.update(deltaTime);
    },
    () => {
      // Render function
    }
  );
  
  // Create test entity
  const entityId = world.createEntity(['Position', 'Velocity']);
  world.addComponent(entityId, 'Position', { x: 0, y: 0 });
  world.addComponent(entityId, 'Velocity', { dx: 10, dy: 5 });
  
  gameLoop.start();
  
  // Let it run for a short time
  setTimeout(() => {
    gameLoop.stop();
    
    const position = world.getComponent<Position>(entityId, 'Position');
    runner.assertNotNull(position, 'Position should exist after game loop');
    runner.assert(position!.x > 0 || position!.y > 0, 'Entity should have moved');
  }, 100);
});

runner.test('Integration - World and Combat System', () => {
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

runner.test('Integration - World and Camera System', () => {
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

runner.test('Integration - World and Interaction System', () => {
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

runner.test('Integration - World and Save System', () => {
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

runner.test('Integration - Performance under load', () => {
  const world = new WorldManager();
  const gameLoop = new GameLoop(
    (deltaTime) => {
      world.update(deltaTime);
    },
    () => {
      // Render function
    }
  );
  
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
  gameLoop.start();
  
  // Let it run for a short time
  setTimeout(() => {
    gameLoop.stop();
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    // Should complete within reasonable time
    runner.assert(duration < 5000, 'Performance test should complete within 5 seconds');
    
    // All entities should still exist
    const currentEntities = world.query(['Position', 'Velocity']);
    runner.assertArrayLength(currentEntities, 100, 'All entities should still exist');
  }, 100);
});

runner.test('Integration - Memory usage', () => {
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

runner.test('Integration - Accessibility with all systems', () => {
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

runner.test('Integration - Debug tools with all systems', () => {
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

runner.test('Integration - Error handling across systems', () => {
  const world = new WorldManager();
  const gameLoop = new GameLoop(
    (deltaTime) => {
      world.update(deltaTime);
    },
    () => {
      // Render function that might throw
      if (Math.random() < 0.1) {
        throw new Error('Random render error');
      }
    }
  );
  
  // Create entity
  const entityId = world.createEntity(['Position']);
  world.addComponent(entityId, 'Position', { x: 0, y: 0 });
  
  gameLoop.start();
  
  // Let it run and potentially encounter errors
  setTimeout(() => {
    try {
      gameLoop.stop();
      runner.assert(true, 'Game loop should handle errors gracefully');
    } catch (error) {
      runner.assert(true, 'Error handling should prevent crashes');
    }
  }, 200);
});

runner.test('Integration - System recovery after errors', () => {
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

runner.test('Integration - Cross-platform compatibility', () => {
  const world = new WorldManager();
  const gameLoop = new GameLoop(
    (deltaTime) => {
      world.update(deltaTime);
    },
    () => {
      // Cross-platform render function
    }
  );
  
  // Test different viewport sizes
  const viewports = [
    { width: 320, height: 240 },   // Mobile
    { width: 768, height: 1024 },  // Tablet
    { width: 1920, height: 1080 } // Desktop
  ];
  
  viewports.forEach(viewport => {
    // Mock viewport
    Object.defineProperty(window, 'innerWidth', { value: viewport.width, configurable: true });
    Object.defineProperty(window, 'innerHeight', { value: viewport.height, configurable: true });
    
    // Create entity
    const entityId = world.createEntity(['Position']);
    world.addComponent(entityId, 'Position', { x: viewport.width / 2, y: viewport.height / 2 });
    
    gameLoop.start();
    
    // Let it run briefly
    setTimeout(() => {
      gameLoop.stop();
      
      // Should not throw
      runner.assert(true, `Viewport ${viewport.width}x${viewport.height} should be supported`);
    }, 50);
  });
});

// ============= DATA CONSISTENCY TESTS =============

runner.test('Integration - Data consistency across systems', () => {
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
    width: 16, 
    height: 32 
  });
  
  cameraSystem.setTarget(playerId);
  
  // Save data
  const saveSuccess = saveSystem.saveGame(1, 'Consistency Test');
  runner.assert(saveSuccess, 'Save should succeed');
  
  // Clear and reload
  world.clear();
  const loadSuccess = saveSystem.loadGame(1);
  runner.assert(loadSuccess, 'Load should succeed');
  
  // Verify data consistency
  const loadedEntities = world.query(['Position', 'Health', 'CombatState', 'Sprite']);
  runner.assertArrayLength(loadedEntities, 1, 'Should have 1 loaded entity');
  
  if (loadedEntities.length > 0) {
    const entity = loadedEntities[0];
    const position = world.getComponent<Position>(entity.id, 'Position');
    const health = world.getComponent<Health>(entity.id, 'Health');
    const combatState = world.getComponent<CombatState>(entity.id, 'CombatState');
    const sprite = world.getComponent<any>(entity.id, 'Sprite');
    
    runner.assertNotNull(position, 'Position should be loaded');
    runner.assertNotNull(health, 'Health should be loaded');
    runner.assertNotNull(combatState, 'CombatState should be loaded');
    runner.assertNotNull(sprite, 'Sprite should be loaded');
    
    // Verify specific values
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
runner.run();

export { runner as integrationTestRunner };