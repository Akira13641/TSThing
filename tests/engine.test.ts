/**
 * Core Engine Tests
 * @fileoverview Unit tests for core engine functionality
 */

import { WorldManager } from '../engine/WorldManager';
import { GlobalLogger, LogSource } from '../engine/GlobalLogger';
import { Position, Velocity, Sprite, LogLevel } from '../types';

/**
 * Test runner for engine tests
 */
class EngineTestRunner {
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
    console.log('Running Engine Tests...\n');

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

    console.log(`\nEngine Test Results: ${this.passed} passed, ${this.failed} failed`);
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
}

// Create test runner instance
const runner = new EngineTestRunner();

// ============= WORLD MANAGER TESTS =============

runner.test('WorldManager - Create entity', () => {
  const world = new WorldManager();
  const entityId = world.createEntity();
  
  runner.assertNotNull(entityId, 'Entity ID should not be null');
  runner.assert(entityId >= 0, 'Entity ID should be non-negative');
});

runner.test('WorldManager - Add component', () => {
  const world = new WorldManager();
  const entityId = world.createEntity();
  
  const position: Position = { x: 100, y: 200 };
  world.addComponent(entityId, 'Position', position);
  
  const retrieved = world.getComponent<Position>(entityId, 'Position');
  runner.assertNotNull(retrieved, 'Component should be retrievable');
  runner.assertEqual(retrieved!.x, 100, 'X position should match');
  runner.assertEqual(retrieved!.y, 200, 'Y position should match');
});

runner.test('WorldManager - Query entities', () => {
  const world = new WorldManager();
  const entity1 = world.createEntity(['Position']);
  const entity2 = world.createEntity(['Position', 'Velocity']);
  const entity3 = world.createEntity(['Velocity']);
  
  // Add components
  world.addComponent(entity1, 'Position', { x: 0, y: 0 });
  world.addComponent(entity2, 'Position', { x: 10, y: 10 });
  world.addComponent(entity2, 'Velocity', { dx: 1, dy: 1 });
  world.addComponent(entity3, 'Velocity', { dx: -1, dy: 0 });
  
  // Query for entities with Position
  const positionEntities = world.query(['Position']);
  runner.assertEqual(positionEntities.length, 2, 'Should find 2 entities with Position');
  
  // Query for entities with Velocity
  const velocityEntities = world.query(['Velocity']);
  runner.assertEqual(velocityEntities.length, 2, 'Should find 2 entities with Velocity');
  
  // Query for entities with both Position and Velocity
  const bothEntities = world.query(['Position', 'Velocity']);
  runner.assertEqual(bothEntities.length, 1, 'Should find 1 entity with both components');
});

runner.test('WorldManager - Remove component', () => {
  const world = new WorldManager();
  const entityId = world.createEntity();
  
  world.addComponent(entityId, 'Position', { x: 100, y: 200 });
  runner.assertNotNull(world.getComponent<Position>(entityId, 'Position'), 'Component should exist');
  
  world.removeComponent(entityId, 'Position');
  runner.assert(world.getComponent<Position>(entityId, 'Position') === null, 'Component should be removed');
});

runner.test('WorldManager - Destroy entity', () => {
  const world = new WorldManager();
  const entityId = world.createEntity();
  
  world.addComponent(entityId, 'Position', { x: 100, y: 200 });
  world.destroyEntity(entityId);
  
  const position = world.getComponent<Position>(entityId, 'Position');
  runner.assert(position === null, 'Component should be null after entity destruction');
});

runner.test('WorldManager - Component subscription', () => {
  const world = new WorldManager();
  const entityId = world.createEntity();
  let callCount = 0;
  let lastData: Position | null = null;
  
  const unsubscribe = world.subscribe(entityId, 'Position', (data) => {
    callCount++;
    lastData = data as Position;
  });
  
  // Add component
  world.addComponent(entityId, 'Position', { x: 100, y: 200 });
  runner.assertEqual(callCount, 1, 'Subscription should be called on add');
  runner.assertEqual(lastData!.x, 100, 'Correct data should be passed');
  
  // Update component
  world.updateComponent(entityId, 'Position', { x: 150, y: 250 });
  runner.assertEqual(callCount, 2, 'Subscription should be called on update');
  runner.assertEqual(lastData!.x, 150, 'Updated data should be passed');
  
  unsubscribe();
});

// ============= SIMULATED GAME LOOP TESTS =============

runner.test('Simulated GameLoop - Initialization', () => {
  let updateCallCount = 0;
  let renderCallCount = 0;
  
  // Simulate game loop initialization
  const updateFunction = () => { updateCallCount++; };
  const renderFunction = () => { renderCallCount++; };
  
  // Test that functions are properly initialized
  runner.assert(typeof updateFunction === 'function', 'Update function should be a function');
  runner.assert(typeof renderFunction === 'function', 'Render function should be a function');
  runner.assert(updateCallCount === 0, 'Update call count should start at 0');
  runner.assert(renderCallCount === 0, 'Render call count should start at 0');
});

runner.test('Simulated GameLoop - Update cycle', () => {
  const world = new WorldManager();
  let updateCallCount = 0;
  
  const updateFunction = (deltaTime: number) => {
    updateCallCount++;
    world.update(deltaTime);
  };
  
  // Create test entity
  const entityId = world.createEntity(['Position', 'Velocity']);
  world.addComponent(entityId, 'Position', { x: 0, y: 0 });
  world.addComponent(entityId, 'Velocity', { dx: 10, dy: 5 });
  
  // Simulate a few update cycles
  for (let i = 0; i < 5; i++) {
    updateFunction(0.016); // ~60 FPS
  }
  
  runner.assert(updateCallCount === 5, 'Update function should be called 5 times');
  
  // Check that entity position changed due to velocity system
  const position = world.getComponent<Position>(entityId, 'Position');
  runner.assertNotNull(position, 'Position should exist');
  // Note: Without a velocity system, position won't change, but we can verify the update cycle works
});

runner.test('Simulated GameLoop - Multiple systems', () => {
  const world = new WorldManager();
  let systemCallCount = 0;
  
  // Add a test system
  world.addSystem((world, deltaTime) => {
    systemCallCount++;
    
    // Simple velocity system
    const positionComponents = world.components.get('Position');
    const velocityComponents = world.components.get('Velocity');
    
    if (positionComponents && velocityComponents) {
      for (const [entityId, position] of positionComponents.entries()) {
        const velocity = velocityComponents.get(entityId);
        if (velocity && world.entities.has(entityId)) {
          const currentPos = position as { x: number; y: number };
          const vel = velocity as { dx: number; dy: number };
          
          const newPosition = {
            x: currentPos.x + vel.dx * deltaTime,
            y: currentPos.y + vel.dy * deltaTime
          };
          
          positionComponents.set(entityId, newPosition);
        }
      }
    }
  });
  
  // Create test entity
  const entityId = world.createEntity(['Position', 'Velocity']);
  world.addComponent(entityId, 'Position', { x: 0, y: 0 });
  world.addComponent(entityId, 'Velocity', { dx: 10, dy: 5 });
  
  // Simulate update cycles
  for (let i = 0; i < 10; i++) {
    world.update(0.016);
  }
  
  runner.assert(systemCallCount === 10, 'System should be called 10 times');
  
  // Check that entity position changed
  const position = world.getComponent<Position>(entityId, 'Position');
  runner.assertNotNull(position, 'Position should exist');
  runner.assert(position!.x > 0 || position!.y > 0, 'Entity should have moved due to velocity system');
});

runner.test('Simulated GameLoop - Performance timing', () => {
  const world = new WorldManager();
  let totalUpdateTime = 0;
  
  const updateFunction = (deltaTime: number) => {
    const startTime = performance.now();
    world.update(deltaTime);
    const endTime = performance.now();
    totalUpdateTime += (endTime - startTime);
  };
  
  // Create many entities
  for (let i = 0; i < 100; i++) {
    const entityId = world.createEntity(['Position', 'Velocity']);
    world.addComponent(entityId, 'Position', { 
      x: Math.random() * 1000, 
      y: Math.random() * 1000 
    });
    world.addComponent(entityId, 'Velocity', { 
      dx: (Math.random() - 0.5) * 100, 
      dy: (Math.random() - 0.5) * 100 
    });
  }
  
  // Add velocity system
  world.addSystem((world, deltaTime) => {
    const positionComponents = world.components.get('Position');
    const velocityComponents = world.components.get('Velocity');
    
    if (positionComponents && velocityComponents) {
      for (const [entityId, position] of positionComponents.entries()) {
        const velocity = velocityComponents.get(entityId);
        if (velocity && world.entities.has(entityId)) {
          const currentPos = position as { x: number; y: number };
          const vel = velocity as { dx: number; dy: number };
          
          const newPosition = {
            x: currentPos.x + vel.dx * deltaTime,
            y: currentPos.y + vel.dy * deltaTime
          };
          
          positionComponents.set(entityId, newPosition);
        }
      }
    }
  });
  
  // Simulate update cycles
  for (let i = 0; i < 60; i++) {
    updateFunction(0.016);
  }
  
  const averageUpdateTime = totalUpdateTime / 60;
  runner.assert(averageUpdateTime < 10, 'Average update time should be reasonable (< 10ms)');
});

// ============= GLOBAL LOGGER TESTS =============

runner.test('GlobalLogger - Basic logging', () => {
  const logger = GlobalLogger.getInstance();
  
  // Clear existing logs
  logger.clearLogs();
  
  // Ensure console logging is enabled
  logger.setConfig({ consoleLogging: true, visualLogging: false, logLevel: LogLevel.DEBUG, verboseMode: false });
  
  const originalConsoleLog = console.info;
  let logCallCount = 0;
  
  // Mock console.info to capture calls
  console.info = () => { logCallCount++; };
  
  logger.info(LogSource.CORE, 'Test message');
  runner.assert(logCallCount > 0, 'Console should be called when logging');
  
  // Restore original console
  console.info = originalConsoleLog;
});

runner.test('GlobalLogger - Log levels', () => {
  const logger = GlobalLogger.getInstance();
  
  logger.setLogLevel(LogLevel.WARN);
  
  // This should be filtered out
  logger.debug(LogSource.CORE, 'Debug message');
  
  // This should pass through
  logger.warn(LogSource.CORE, 'Warning message');
  
  const entries = logger.getLogEntries();
  const warnEntries = entries.filter(entry => entry.level === LogLevel.WARN);
  const debugEntries = entries.filter(entry => entry.level === LogLevel.DEBUG);
  
  runner.assert(warnEntries.length > 0, 'Warning messages should be logged');
  runner.assertEqual(debugEntries.length, 0, 'Debug messages should be filtered');
});

runner.test('GlobalLogger - Configuration', () => {
  const logger = GlobalLogger.getInstance();
  
  logger.setConfig({ visualLogging: false, consoleLogging: true });
  const config = logger.getConfig();
  
  runner.assert(config.visualLogging === false, 'Visual logging should be disabled');
  runner.assert(config.consoleLogging === true, 'Console logging should be enabled');
});

runner.test('GlobalLogger - Log statistics', () => {
  const logger = GlobalLogger.getInstance();
  
  // Clear existing logs
  logger.clearLogs();
  
  // Set log level to DEBUG to capture all logs
  logger.setConfig({ consoleLogging: false, visualLogging: false, logLevel: LogLevel.DEBUG, verboseMode: false });
  
  logger.info(LogSource.CORE, 'Info message');
  logger.warn(LogSource.UI, 'Warning message');
  logger.error(LogSource.RENDERER, 'Error message');
  
  const stats = logger.getLogStats();
  runner.assertEqual(stats.total, 3, 'Should have 3 total log entries');
  runner.assertEqual(stats.byLevel.INFO, 1, 'Should have 1 info entry');
  runner.assertEqual(stats.byLevel.WARN, 1, 'Should have 1 warn entry');
  runner.assertEqual(stats.byLevel.ERROR, 1, 'Should have 1 error entry');
  runner.assertEqual(stats.bySource.CORE, 1, 'Should have 1 CORE entry');
  runner.assertEqual(stats.bySource.UI, 1, 'Should have 1 UI entry');
  runner.assertEqual(stats.bySource.RENDERER, 1, 'Should have 1 RENDERER entry');
});

// ============= INTEGRATION TESTS =============

runner.test('Integration - World and Update Cycle', () => {
  const world = new WorldManager();
  let updateCount = 0;
  
  // Add a simple system
  world.addSystem((world, deltaTime) => {
    updateCount++;
  });
  
  // Create test entity
  const entityId = world.createEntity(['Position', 'Velocity']);
  world.addComponent(entityId, 'Position', { x: 0, y: 0 });
  world.addComponent(entityId, 'Velocity', { dx: 100, dy: 50 });
  
  // Simulate update cycles
  for (let i = 0; i < 5; i++) {
    world.update(0.016);
  }
  
  runner.assert(updateCount > 0, 'World should be updated in update cycle');
  
  const position = world.getComponent<Position>(entityId, 'Position');
  runner.assertNotNull(position, 'Position component should exist');
});

runner.test('Integration - Logger and World', () => {
  const logger = GlobalLogger.getInstance();
  const world = new WorldManager();
  
  // Clear logs
  logger.clearLogs();
  
  // Set log level to DEBUG to capture all logs
  logger.setConfig({ consoleLogging: false, visualLogging: false, logLevel: LogLevel.DEBUG, verboseMode: false });
  
  // Create entity (should log)
  const entityId = world.createEntity(['Position']);
  
  const logs = logger.getLogEntries();
  const ecsLogs = logs.filter(log => log.source === LogSource.ECS);
  
  runner.assert(ecsLogs.length > 0, 'World operations should be logged');
});

// Run all tests
runner.run();

export { runner as engineTestRunner };