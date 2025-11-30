/**
 * Camera System Tests
 * @fileoverview Unit tests for camera following and viewport management
 */

import { CameraSystem, CameraFollowMode, CameraBounds } from '../engine/CameraSystem';
import { WorldManager } from '../engine/WorldManager';
import { logger, LogSource } from '../engine/GlobalLogger';
import { EntityId, Position } from '../types';

/**
 * Test runner for camera system tests
 */
class CameraSystemTestRunner {
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
    console.log('Running Camera System Tests...\n');

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

    console.log(`\nCamera System Test Results: ${this.passed} passed, ${this.failed} failed`);
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
   * Not equal assertion helper
   */
  public assertNotEqual<T>(actual: T, expected: T, message: string): void {
    if (actual === expected) {
      throw new Error(`${message}. Expected: ${expected} to be different from Actual: ${actual}`);
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
   * Approximate equality assertion helper
   */
  public assertApproximately(actual: number, expected: number, tolerance: number = 0.0001, message: string): void {
    if (Math.abs(actual - expected) > tolerance) {
      throw new Error(`${message}. Expected: ${expected} ± ${tolerance}, Actual: ${actual}`);
    }
  }
}

// Create test runner instance
const runner = new CameraSystemTestRunner();

// ============= CAMERA SYSTEM INITIALIZATION TESTS =============

runner.test('CameraSystem - Initialization', () => {
  const cameraSystem = new CameraSystem();
  runner.assertNotNull(cameraSystem, 'CameraSystem should be created');
});

runner.test('CameraSystem - World manager assignment', () => {
  const cameraSystem = new CameraSystem();
  const world = new WorldManager();
  
  cameraSystem.setWorld(world);
  // Should not throw
  runner.assert(true, 'World manager should be assignable');
});

runner.test('CameraSystem - Viewport setup', () => {
  const cameraSystem = new CameraSystem();
  
  cameraSystem.setViewport(1024, 768);
  
  const position = cameraSystem.getPosition();
  runner.assertNotNull(position, 'Position should be available');
});

// ============= CAMERA FOLLOWING TESTS =============

runner.test('CameraSystem - Instant follow mode', () => {
  const cameraSystem = new CameraSystem();
  const world = new WorldManager();
  
  cameraSystem.setWorld(world);
  cameraSystem.setViewport(800, 600);
  cameraSystem.setFollowMode(CameraFollowMode.INSTANT);
  
  // Create target entity
  const targetId = world.createEntity(['Position']);
  world.addComponent(targetId, 'Position', { x: 100, y: 200 });
  
  cameraSystem.setTarget(targetId);
  
  // Update camera
  cameraSystem.update(0.016); // ~60 FPS
  
  const position = cameraSystem.getPosition();
  runner.assertEqual(position.x, 100, 'Instant follow should immediately match target X');
  runner.assertEqual(position.y, 200, 'Instant follow should immediately match target Y');
});

runner.test('CameraSystem - Smooth follow mode', () => {
  const cameraSystem = new CameraSystem();
  const world = new WorldManager();
  
  cameraSystem.setWorld(world);
  cameraSystem.setViewport(800, 600);
  cameraSystem.setFollowMode(CameraFollowMode.SMOOTH, 2.0);
  
  // Create target entity
  const targetId = world.createEntity(['Position']);
  world.addComponent(targetId, 'Position', { x: 200, y: 300 });
  
  cameraSystem.setTarget(targetId);
  
  // Update camera multiple times
  cameraSystem.update(0.016);
  cameraSystem.update(0.016);
  cameraSystem.update(0.016);
  
  const position = cameraSystem.getPosition();
  // Should be closer to target but not exactly there yet
  runner.assert(position.x > 0 && position.x < 200, 'Smooth follow should move toward target X');
  runner.assert(position.y > 0 && position.y < 300, 'Smooth follow should move toward target Y');
});

runner.test('CameraSystem - Lookahead follow mode', () => {
  const cameraSystem = new CameraSystem();
  const world = new WorldManager();
  
  cameraSystem.setWorld(world);
  cameraSystem.setViewport(800, 600);
  cameraSystem.setFollowMode(CameraFollowMode.LOOKAHEAD, 5.0);
  
  // Create moving target entity
  const targetId = world.createEntity(['Position']);
  world.addComponent(targetId, 'Position', { x: 100, y: 100 });
  
  cameraSystem.setTarget(targetId);
  
  // Move target
  world.updateComponent(targetId, 'Position', { x: 150, y: 100 });
  
  // Update camera
  cameraSystem.update(0.016);
  
  const position = cameraSystem.getPosition();
  // Should be ahead of target in movement direction
  runner.assert(position.x > 100, 'Lookahead should be ahead of moving target');
});

runner.test('CameraSystem - Elastic follow mode', () => {
  const cameraSystem = new CameraSystem();
  const world = new WorldManager();
  
  cameraSystem.setWorld(world);
  cameraSystem.setViewport(800, 600);
  cameraSystem.setFollowMode(CameraFollowMode.ELASTIC, 3.0);
  
  // Create target entity
  const targetId = world.createEntity(['Position']);
  world.addComponent(targetId, 'Position', { x: 100, y: 100 });
  
  cameraSystem.setTarget(targetId);
  
  // Update camera
  cameraSystem.update(0.016);
  
  const position = cameraSystem.getPosition();
  // Should show spring-like behavior
  runner.assert(position.x > 0 && position.x < 100, 'Elastic follow should show spring behavior');
});

runner.test('CameraSystem - Dead zone', () => {
  const cameraSystem = new CameraSystem();
  const world = new WorldManager();
  
  cameraSystem.setWorld(world);
  cameraSystem.setViewport(800, 600);
  cameraSystem.setDeadZone(100, 100);
  
  // Create target entity
  const targetId = world.createEntity(['Position']);
  world.addComponent(targetId, 'Position', { x: 400, y: 300 }); // Center of viewport
  
  cameraSystem.setTarget(targetId);
  
  // Set camera to center
  cameraSystem.setPosition(400, 300);
  
  // Update camera - should not move since target is in dead zone
  const beforePosition = cameraSystem.getPosition();
  cameraSystem.update(0.016);
  const afterPosition = cameraSystem.getPosition();
  
  runner.assertEqual(beforePosition.x, afterPosition.x, 'Camera should not move when target is in dead zone');
  runner.assertEqual(beforePosition.y, afterPosition.y, 'Camera should not move when target is in dead zone');
});

// ============= CAMERA BOUNDARIES TESTS =============

runner.test('CameraSystem - Set boundaries', () => {
  const cameraSystem = new CameraSystem();
  
  const bounds: CameraBounds = {
    minX: 0,
    maxX: 1000,
    minY: 0,
    maxY: 800,
    enabled: true
  };
  
  cameraSystem.setBounds(bounds);
  
  // Should not throw
  runner.assert(true, 'Boundaries should be settable');
});

runner.test('CameraSystem - Enforce boundaries', () => {
  const cameraSystem = new CameraSystem();
  const world = new WorldManager();
  
  cameraSystem.setWorld(world);
  cameraSystem.setViewport(800, 600);
  cameraSystem.setBounds({
    minX: 100,
    maxX: 700,
    minY: 100,
    maxY: 500,
    enabled: true
  });
  
  // Try to set position outside boundaries
  cameraSystem.setPosition(50, 50);
  
  const position = cameraSystem.getPosition();
  // Should be clamped to boundaries
  runner.assertEqual(position.x, 100, 'X should be clamped to minimum boundary');
  runner.assertEqual(position.y, 100, 'Y should be clamped to minimum boundary');
  
  // Try to set position outside max boundaries
  cameraSystem.setPosition(800, 600);
  
  const maxPosition = cameraSystem.getPosition();
  runner.assertEqual(maxPosition.x, 700, 'X should be clamped to maximum boundary');
  runner.assertEqual(maxPosition.y, 500, 'Y should be clamped to maximum boundary');
});

runner.test('CameraSystem - Disable boundaries', () => {
  const cameraSystem = new CameraSystem();
  
  cameraSystem.setBounds({ enabled: false });
  
  // Try to set position anywhere
  cameraSystem.setPosition(10000, 10000);
  
  const position = cameraSystem.getPosition();
  // Should not be clamped
  runner.assertEqual(position.x, 10000, 'Position should not be clamped when boundaries disabled');
  runner.assertEqual(position.y, 10000, 'Position should not be clamped when boundaries disabled');
});

// ============= CAMERA COORDINATE CONVERSION TESTS =============

runner.test('CameraSystem - World to screen coordinates', () => {
  const cameraSystem = new CameraSystem();
  
  cameraSystem.setViewport(800, 600);
  cameraSystem.setPosition(400, 300);
  cameraSystem.setZoom(1.0);
  
  const screen = cameraSystem.worldToScreen(500, 400);
  
  runner.assertEqual(screen.x, 500, 'World X should map to screen X correctly');
  runner.assertEqual(screen.y, 400, 'World Y should map to screen Y correctly');
});

runner.test('CameraSystem - Screen to world coordinates', () => {
  const cameraSystem = new CameraSystem();
  
  cameraSystem.setViewport(800, 600);
  cameraSystem.setPosition(400, 300);
  cameraSystem.setZoom(1.0);
  
  const world = cameraSystem.screenToWorld(500, 400);
  
  runner.assertEqual(world.x, 500, 'Screen X should map to world X correctly');
  runner.assertEqual(world.y, 400, 'Screen Y should map to world Y correctly');
});

runner.test('CameraSystem - Coordinate conversion with zoom', () => {
  const cameraSystem = new CameraSystem();
  
  cameraSystem.setViewport(800, 600);
  cameraSystem.setPosition(400, 300);
  cameraSystem.setZoom(2.0);
  
  const screen = cameraSystem.worldToScreen(500, 400);
  
  // With 2x zoom, world coordinates should be scaled
  runner.assertEqual(screen.x, 600, 'World X should be scaled by zoom');
  runner.assertEqual(screen.y, 500, 'World Y should be scaled by zoom');
});

// ============= CAMERA VISIBILITY TESTS =============

runner.test('CameraSystem - Point visibility', () => {
  const cameraSystem = new CameraSystem();
  
  cameraSystem.setViewport(800, 600);
  cameraSystem.setPosition(400, 300);
  cameraSystem.setZoom(1.0);
  
  runner.assert(cameraSystem.isVisible(400, 300), 'Center point should be visible');
  runner.assert(cameraSystem.isVisible(100, 100), 'Point within viewport should be visible');
  runner.assert(!cameraSystem.isVisible(1000, 1000), 'Point far outside viewport should not be visible');
});

runner.test('CameraSystem - Visibility with margin', () => {
  const cameraSystem = new CameraSystem();
  
  cameraSystem.setViewport(800, 600);
  cameraSystem.setPosition(400, 300);
  cameraSystem.setZoom(1.0);
  
  // Point just outside viewport
  runner.assert(!cameraSystem.isVisible(-10, 300), 'Point just outside should not be visible');
  runner.assert(cameraSystem.isVisible(-10, 300, 50), 'Point just outside should be visible with margin');
});

// ============= CAMERA EFFECTS TESTS =============

runner.test('CameraSystem - Camera shake', () => {
  const cameraSystem = new CameraSystem();
  
  cameraSystem.setPosition(400, 300);
  
  // Start shake
  cameraSystem.startShake(10, 1.0, 10);
  
  // Update during shake
  cameraSystem.update(0.016);
  
  const position = cameraSystem.getFinalPosition();
  // Position should be offset from original
  runner.assertNotEqual(position.x, 400, 'Shake should offset X position');
  runner.assertNotEqual(position.y, 300, 'Shake should offset Y position');
  
  // Update after shake duration
  cameraSystem.update(2.0); // 2 seconds later
  
  const settledPosition = cameraSystem.getFinalPosition();
  runner.assertEqual(settledPosition.x, 400, 'Position should return to original after shake');
  runner.assertEqual(settledPosition.y, 300, 'Position should return to original after shake');
});

runner.test('CameraSystem - Camera transition', () => {
  const cameraSystem = new CameraSystem();
  
  cameraSystem.setPosition(100, 100);
  
  let transitionCompleted = false;
  
  // Start transition
  cameraSystem.startTransition(500, 400, 1.5, 1.0, () => {
    transitionCompleted = true;
  });
  
  // Update during transition
  cameraSystem.update(0.5); // Half way through
  
  const midPosition = cameraSystem.getPosition();
  const midZoom = cameraSystem.getZoom();
  
  // Should be between start and end values
  runner.assert(midPosition.x > 100 && midPosition.x < 500, 'X should be between start and end');
  runner.assert(midPosition.y > 100 && midPosition.y < 400, 'Y should be between start and end');
  runner.assert(midZoom > 1.0 && midZoom < 1.5, 'Zoom should be between start and end');
  
  // Complete transition
  cameraSystem.update(0.6);
  
  runner.assert(transitionCompleted, 'Transition callback should be called');
  
  const finalPosition = cameraSystem.getPosition();
  const finalZoom = cameraSystem.getZoom();
  
  runner.assertEqual(finalPosition.x, 500, 'Final X should match target');
  runner.assertEqual(finalPosition.y, 400, 'Final Y should match target');
  runner.assertEqual(finalZoom, 1.5, 'Final zoom should match target');
});

// ============= CAMERA ZOOM TESTS =============

runner.test('CameraSystem - Zoom limits', () => {
  const cameraSystem = new CameraSystem();
  
  cameraSystem.setZoom(0.05); // Below minimum
  runner.assertEqual(cameraSystem.getZoom(), 0.1, 'Zoom should be clamped to minimum');
  
  cameraSystem.setZoom(10.0); // Above maximum
  runner.assertEqual(cameraSystem.getZoom(), 5.0, 'Zoom should be clamped to maximum');
  
  cameraSystem.setZoom(2.5); // Within range
  runner.assertEqual(cameraSystem.getZoom(), 2.5, 'Valid zoom should be set');
});

// ============= CAMERA BOUNDS TESTS =============

runner.test('CameraSystem - Get camera bounds', () => {
  const cameraSystem = new CameraSystem();
  
  cameraSystem.setViewport(800, 600);
  cameraSystem.setPosition(400, 300);
  cameraSystem.setZoom(1.0);
  
  const bounds = cameraSystem.getBounds();
  
  runner.assertEqual(bounds.x, 0, 'Bounds X should be camera center minus half width');
  runner.assertEqual(bounds.y, 0, 'Bounds Y should be camera center minus half height');
  runner.assertEqual(bounds.width, 800, 'Bounds width should match viewport');
  runner.assertEqual(bounds.height, 600, 'Bounds height should match viewport');
});

runner.test('CameraSystem - Bounds with zoom', () => {
  const cameraSystem = new CameraSystem();
  
  cameraSystem.setViewport(800, 600);
  cameraSystem.setPosition(400, 300);
  cameraSystem.setZoom(2.0);
  
  const bounds = cameraSystem.getBounds();
  
  runner.assertEqual(bounds.width, 400, 'Bounds width should be viewport divided by zoom');
  runner.assertEqual(bounds.height, 300, 'Bounds height should be viewport divided by zoom');
});

// ============= CAMERA RESET TESTS =============

runner.test('CameraSystem - Reset camera', () => {
  const cameraSystem = new CameraSystem();
  
  // Modify camera state
  cameraSystem.setPosition(500, 600);
  cameraSystem.setZoom(2.0);
  cameraSystem.setTarget(999);
  
  // Reset
  cameraSystem.reset();
  
  const position = cameraSystem.getPosition();
  const zoom = cameraSystem.getZoom();
  
  runner.assertEqual(position.x, 400, 'X should reset to viewport center');
  runner.assertEqual(position.y, 300, 'Y should reset to viewport center');
  runner.assertEqual(zoom, 1.0, 'Zoom should reset to 1.0');
});

// Run all tests
runner.run();

export { runner as cameraSystemTestRunner };