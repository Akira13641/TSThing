import { setupDOMMock } from './tests/dom-mock';

// Set up DOM mocking
setupDOMMock();

import { WorldManager } from './engine/WorldManager';
import { GameLoop } from './engine/GameLoop';
import { Position } from './types';

// Simple test runner
class SimpleTestRunner {
  private tests: Array<{ name: string; fn: () => Promise<void> }> = [];
  private passed = 0;
  private failed = 0;

  public test(name: string, fn: () => Promise<void>): void {
    this.tests.push({ name, fn });
  }

  public async run(): Promise<{ passed: number; failed: number }> {
    console.log('Running Simple Integration Tests...\n');

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

    console.log(`\nTest Results: ${this.passed} passed, ${this.failed} failed`);
    return { passed: this.passed, failed: this.failed };
  }

  public assert(condition: boolean, message: string): void {
    if (!condition) {
      throw new Error(message);
    }
  }

  public assertNotNull<T>(value: T | null | undefined, message: string): void {
    if (value === null || value === undefined) {
      throw new Error(message);
    }
  }
}

const runner = new SimpleTestRunner();

// Simple test
runner.test('Basic async test', async () => {
  const world = new WorldManager();
  const gameLoop = new GameLoop(
    (deltaTime) => {
      world.update(deltaTime);
    },
    () => {
      // Render function
    }
  );

  // Add a simple velocity system to the world
  world.addSystem((world, deltaTime) => {
    const positionComponents = world.components.get('Position');
    const velocityComponents = world.components.get('Velocity');
    const entities = world.entities;

    if (positionComponents && velocityComponents) {
      for (const [entityId, position] of positionComponents.entries()) {
        const velocity = velocityComponents.get(entityId);
        if (velocity && entities.has(entityId)) {
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

  gameLoop.start();

  // Wait for the game loop to run for a short time
  await new Promise<void>((resolve) => {
    setTimeout(() => {
      gameLoop.stop();

      const position = world.getComponent<Position>(entityId, 'Position');
      runner.assertNotNull(position, 'Position should exist after game loop');
      runner.assert(position!.x > 0 || position!.y > 0, 'Entity should have moved');
      resolve();
    }, 100);
  });
});

// Run the test
runner.run().then((results) => {
  console.log(`Tests completed. Passed: ${results.passed}, Failed: ${results.failed}`);
}).catch((error) => {
  console.error('Test runner failed:', error);
});