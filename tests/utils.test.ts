/**
 * Utility Function Tests
 * @fileoverview Unit tests for utility functions
 */

import { RNG, rollDice, rollPercent, rollCritical, weightedRandom } from '../utils/rng';
import { MathUtils, Vector2Utils } from '../utils/math';
import { Pathfinding, SimplePathfinding } from '../utils/pathfinding';
import { ValidationUtils, ItemValidator, EnemyValidator } from '../utils/validation';
import { ItemDef, EnemyDef, Vector2, Rectangle } from '../types';

/**
 * Test runner for utility tests
 */
class UtilTestRunner {
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
    console.log('Running Utility Tests...\n');

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

    console.log(`\nTest Results: ${this.passed} passed, ${this.failed} failed`);
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
   * Approximate equality assertion helper
   */
  public assertApproximately(actual: number, expected: number, tolerance: number = 0.0001, message: string): void {
    if (Math.abs(actual - expected) > tolerance) {
      throw new Error(`${message}. Expected: ${expected} ± ${tolerance}, Actual: ${actual}`);
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
const runner = new UtilTestRunner();

// ============= RNG TESTS =============

runner.test('RNG - Basic functionality', () => {
  const rng = new RNG(12345); // Fixed seed for reproducible tests
  
  const value1 = rng.random();
  const value2 = rng.random();
  
  runner.assert(value1 >= 0 && value1 < 1, 'Random should be in range [0, 1)');
  runner.assert(value2 >= 0 && value2 < 1, 'Random should be in range [0, 1)');
  runner.assert(value1 !== value2, 'Random values should be different');
});

runner.test('RNG - Seeded reproducibility', () => {
  const rng1 = new RNG(12345);
  const rng2 = new RNG(12345);
  
  const value1 = rng1.random();
  const value2 = rng2.random();
  
  runner.assertEqual(value1, value2, 'Same seed should produce same sequence');
});

runner.test('RNG - Random integer', () => {
  const rng = new RNG(12345);
  
  for (let i = 0; i < 100; i++) {
    const value = rng.randomInt(10, 20);
    runner.assert(value >= 10 && value < 20, `Random int should be in range [10, 20), got ${value}`);
  }
});

runner.test('RNG - Random choice', () => {
  const rng = new RNG(12345);
  const choices = ['a', 'b', 'c', 'd'];
  
  for (let i = 0; i < 100; i++) {
    const choice = rng.randomChoice(choices);
    runner.assert(choices.includes(choice), 'Choice should be from the array');
  }
});

runner.test('rollDice - Standard dice', () => {
  const results = new Set<number>();
  
  for (let i = 0; i < 1000; i++) {
    const result = rollDice(6);
    runner.assert(result >= 1 && result <= 6, `Dice roll should be 1-6, got ${result}`);
    results.add(result);
  }
  
  runner.assert(results.size === 6, 'All dice faces should appear over many rolls');
});

runner.test('rollPercent - Percentage chance', () => {
  let successes = 0;
  const trials = 10000;
  
  for (let i = 0; i < trials; i++) {
    if (rollPercent(50)) {
      successes++;
    }
  }
  
  const successRate = successes / trials;
  runner.assertApproximately(successRate, 0.5, 0.05, '50% chance should be approximately 50%');
});

runner.test('weightedRandom - Weighted selection', () => {
  const items = [
    { item: 'common', weight: 70 },
    { item: 'uncommon', weight: 20 },
    { item: 'rare', weight: 10 }
  ];
  
  const results = { common: 0, uncommon: 0, rare: 0 };
  
  for (let i = 0; i < 10000; i++) {
    const result = weightedRandom(items);
    results[result.item as keyof typeof results]++;
  }
  
  // Check that rare items appear less often than common items
  runner.assert(results.rare < results.common, 'Rare items should be less common than common items');
  runner.assert(results.uncommon < results.common, 'Uncommon items should be less common than common items');
});

// ============= MATH UTILS TESTS =============

runner.test('MathUtils - Clamp', () => {
  runner.assertEqual(MathUtils.clamp(5, 0, 10), 5, 'Value within range should not change');
  runner.assertEqual(MathUtils.clamp(-5, 0, 10), 0, 'Value below min should be clamped to min');
  runner.assertEqual(MathUtils.clamp(15, 0, 10), 10, 'Value above max should be clamped to max');
});

runner.test('MathUtils - Lerp', () => {
  runner.assertEqual(MathUtils.lerp(0, 10, 0.5), 5, 'Mid interpolation should be midpoint');
  runner.assertEqual(MathUtils.lerp(0, 10, 0), 0, 'Zero interpolation should be start value');
  runner.assertEqual(MathUtils.lerp(0, 10, 1), 10, 'Full interpolation should be end value');
});

runner.test('MathUtils - Distance', () => {
  const distance = MathUtils.distance(0, 0, 3, 4);
  runner.assertEqual(distance, 5, 'Distance should be 5 (3-4-5 triangle)');
});

runner.test('MathUtils - Point in rect', () => {
  const rect: Rectangle = { x: 10, y: 10, width: 50, height: 30 };
  
  runner.assert(MathUtils.pointInRect(30, 25, rect), 'Point inside rect should be detected');
  runner.assert(!MathUtils.pointInRect(5, 5, rect), 'Point outside rect should not be detected');
  runner.assert(MathUtils.pointInRect(60, 40, rect), 'Point on rect edge should be detected');
});

runner.test('Vector2Utils - Basic operations', () => {
  const v1 = Vector2Utils.create(2, 3);
  const v2 = Vector2Utils.create(4, 5);
  
  runner.assertEqual(v1.x, 2, 'Vector X should be set correctly');
  runner.assertEqual(v1.y, 3, 'Vector Y should be set correctly');
  
  const sum = Vector2Utils.add(v1, v2);
  runner.assertEqual(sum.x, 6, 'Vector addition X should be correct');
  runner.assertEqual(sum.y, 8, 'Vector addition Y should be correct');
  
  const diff = Vector2Utils.subtract(v2, v1);
  runner.assertEqual(diff.x, 2, 'Vector subtraction X should be correct');
  runner.assertEqual(diff.y, 2, 'Vector subtraction Y should be correct');
});

runner.test('Vector2Utils - Magnitude and normalization', () => {
  const vector = Vector2Utils.create(3, 4);
  const magnitude = Vector2Utils.magnitude(vector);
  runner.assertEqual(magnitude, 5, 'Magnitude should be 5 (3-4-5 triangle)');
  
  const normalized = Vector2Utils.normalize(vector);
  const normalizedMagnitude = Vector2Utils.magnitude(normalized);
  runner.assertApproximately(normalizedMagnitude, 1, 0.0001, 'Normalized vector should have magnitude 1');
});

runner.test('Vector2Utils - Distance', () => {
  const v1 = Vector2Utils.create(0, 0);
  const v2 = Vector2Utils.create(3, 4);
  
  const distance = Vector2Utils.distance(v1, v2);
  runner.assertEqual(distance, 5, 'Vector distance should be 5');
});

// ============= PATHFINDING TESTS =============

runner.test('Pathfinding - Simple path', () => {
  const grid = {
    width: 5,
    height: 5,
    tileSize: 32,
    walkable: [
      [true, true, true, true, true],
      [true, false, false, false, true],
      [true, false, false, false, true],
      [true, false, false, false, true],
      [true, true, true, true, true]
    ]
  };
  
  const start: Vector2 = { x: 0, y: 0 };
  const goal: Vector2 = { x: 4, y: 0 };
  
  const path = Pathfinding.findPath(grid, start, goal);
  
  runner.assert(path.length > 0, 'Path should be found');
  runner.assertEqual(path[0].x, 16, 'First point should be center of start tile');
  runner.assertEqual(path[0].y, 16, 'First point should be center of start tile');
  runner.assertEqual(path[path.length - 1].x, 144, 'Last point should be center of goal tile');
  runner.assertEqual(path[path.length - 1].y, 16, 'Last point should be center of goal tile');
});

runner.test('Pathfinding - No path', () => {
  const grid = {
    width: 3,
    height: 3,
    tileSize: 32,
    walkable: [
      [true, false, true],
      [false, false, false],
      [true, false, true]
    ]
  };
  
  const start: Vector2 = { x: 0, y: 0 };
  const goal: Vector2 = { x: 2, y: 2 };
  
  const path = Pathfinding.findPath(grid, start, goal);
  
  runner.assertEqual(path.length, 0, 'No path should be found when blocked');
});

runner.test('SimplePathfinding - Straight path', () => {
  const start: Vector2 = { x: 0, y: 0 };
  const goal: Vector2 = { x: 100, y: 100 };
  const obstacles: Rectangle[] = [];
  
  const path = SimplePathfinding.createStraightPath(start, goal, obstacles);
  
  runner.assert(path.length > 0, 'Path should be created');
  runner.assertEqual(path[0].x, 0, 'Path should start at start point');
  runner.assertEqual(path[0].y, 0, 'Path should start at start point');
  runner.assertEqual(path[path.length - 1].x, 100, 'Path should end at goal point');
  runner.assertEqual(path[path.length - 1].y, 100, 'Path should end at goal point');
});

// ============= VALIDATION TESTS =============

runner.test('ValidationUtils - Basic validation', () => {
  runner.assertEqual(ValidationUtils.validatePositiveInteger(5, 'test'), 5, 'Valid positive integer should pass');
  
  try {
    ValidationUtils.validatePositiveInteger(-1, 'test');
    runner.assert(false, 'Negative integer should throw error');
  } catch (error) {
    runner.assert(true, 'Negative integer should throw error');
  }
  
  runner.assertEqual(ValidationUtils.validateNonEmptyString('hello', 'test'), 'hello', 'Valid string should pass');
  
  try {
    ValidationUtils.validateNonEmptyString('', 'test');
    runner.assert(false, 'Empty string should throw error');
  } catch (error) {
    runner.assert(true, 'Empty string should throw error');
  }
});

runner.test('ItemValidator - Valid item', () => {
  const validItem: ItemDef = {
    id: 'sword_001',
    name: 'Iron Sword',
    description: 'A basic iron sword',
    type: 'WEAPON',
    properties: {
      value: 100,
      stackable: false,
      consumable: false,
      effects: [{ type: 'attack', value: 10 }]
    }
  };
  
  // Should not throw
  ItemValidator.validate(validItem);
});

runner.test('ItemValidator - Invalid item', () => {
  const invalidItem = {
    id: '',
    name: 'Invalid Item',
    description: 'This item is invalid',
    type: 'INVALID_TYPE' as any,
    properties: {}
  };
  
  try {
    ItemValidator.validate(invalidItem);
    runner.assert(false, 'Invalid item should throw error');
  } catch (error) {
    runner.assert(true, 'Invalid item should throw error');
  }
});

runner.test('EnemyValidator - Valid enemy', () => {
  const validEnemy: EnemyDef = {
    id: 'goblin_001',
    name: 'Goblin',
    stats: {
      health: 50,
      attack: 10,
      defense: 5,
      speed: 100
    },
    sprite: {
      textureId: 'goblin_sprite',
      width: 32,
      height: 32,
      animations: {
        idle: { frames: [0], frameDuration: 1.0, loop: true },
        walk: { frames: [1, 2, 3], frameDuration: 0.2, loop: true }
      }
    },
    behavior: {
      aggression: 0.7,
      patrolRadius: 100,
      detectionRange: 50
    }
  };
  
  // Should not throw
  EnemyValidator.validate(validEnemy);
});

runner.test('EnemyValidator - Invalid enemy', () => {
  const invalidEnemy = {
    id: '',
    name: 'Invalid Enemy',
    stats: {
      health: -10, // Invalid negative health
      attack: 10,
      defense: 5,
      speed: 100
    },
    sprite: {
      textureId: 'invalid_sprite',
      width: 32,
      height: 32,
      animations: {}
    },
    behavior: {
      aggression: 1.5, // Invalid > 1
      patrolRadius: 100,
      detectionRange: 50
    }
  };
  
  try {
    EnemyValidator.validate(invalidEnemy);
    runner.assert(false, 'Invalid enemy should throw error');
  } catch (error) {
    runner.assert(true, 'Invalid enemy should throw error');
  }
});

// Run all tests
runner.run();

export { runner as utilTestRunner };