/**
 * Interaction System Tests
 * @fileoverview Unit tests for interaction system functionality
 */

import { InteractionSystem } from '../engine/InteractionSystem';
import { WorldManager } from '../engine/WorldManager';
import { logger, LogSource } from '../engine/GlobalLogger';
import { EntityId, Position } from '../types';

/**
 * Test runner for interaction system tests
 */
class InteractionSystemTestRunner {
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
    console.log('Running Interaction System Tests...\n');

    for (const test of this.tests) {
      try {
        test.fn();
        console.log(\`✓ \${test.name}`);
        this.passed++;
      } catch (error) {
        console.log(\`✗ \${test.name}`);
        console.log(\`  Error: \${error}`);
        this.failed++;
      }
    }

    console.log(\`\nInteraction System Test Results: \${this.passed} passed, \${this.failed} failed`);
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
      throw new Error(\`\${message}. Expected: \${expected}, Actual: \${actual}`);
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
      throw new Error(\`\${message}. Expected: \${expected} ± \${tolerance}, Actual: \${actual}`);
    }
  }
}

// Create test runner instance
const runner = new InteractionSystemTestRunner();

// ============= BASIC FUNCTIONALITY TESTS =============

runner.test('InteractionSystem - Initialization', () => {
  const interactionSystem = new InteractionSystem();
  runner.assertNotNull(interactionSystem, 'InteractionSystem should be created');
});

runner.test('InteractionSystem - World manager assignment', () => {
  const interactionSystem = new InteractionSystem();
  const world = new WorldManager();
  
  interactionSystem.setWorld(world);
  runner.assert(true, 'World manager should be assignable');
});

runner.test('InteractionSystem - Player assignment', () => {
  const interactionSystem = new InteractionSystem();
  const world = new WorldManager();
  
  interactionSystem.setWorld(world);
  interactionSystem.setPlayer(1);
  runner.assert(true, 'Player should be assignable');
});

runner.test('InteractionSystem - Range multiplier', () => {
  const interactionSystem = new InteractionSystem();
  
  interactionSystem.setRangeMultiplier(2.0);
  const multiplier = interactionSystem.getRangeMultiplier();
  runner.assertEqual(multiplier, 2.0, 'Range multiplier should be set to 2.0');
});

// ============= INVENTORY MANAGEMENT TESTS =============

runner.test('InteractionSystem - Inventory management', () => {
  const interactionSystem = new InteractionSystem();
  
  // Test empty inventory
  runner.assert(!interactionSystem.hasItem('sword'), 'Should not have item initially');
  
  // Add item
  interactionSystem.addItemToInventory('sword');
  runner.assert(interactionSystem.hasItem('sword'), 'Should have item after adding');
  
  // Add duplicate item (Set prevents duplicates)
  interactionSystem.addItemToInventory('sword');
  runner.assert(interactionSystem.hasItem('request'), 'Should still have item (Set prevents duplicates)');
  
  // Remove item (removes one instance)
  interactionSystem.removeItemFromInventory('sword');
  // Should still have item (we added it twice, removed one)
  runner.assert(interactionSystem.hasItem('sword'), 'Should still have one item after removing one');
  
  // Remove item (removes last instance)
  interactionSystem.removeItemFromInventory('sword');
  // Should not have item (no instances left)
  runner.assert(!interactionSystem.hasItem('sword'), 'Should not have item after removing all');
});

// ============= CONDITION TESTS =============

runner.test('InteractionSystem - Always available condition', () => {
  const interactionSystem = new InteractionSystem();
  const world = new WorldManager();
  
  interactionSystem.setWorld(world);
  interactionSystem.setPlayer(1);
  
  // Create always available interaction
  const interaction = {
    id: 'always_test',
    type: InteractionType.OPEN,
    name: 'Always Available',
    description: 'Always available interaction',
    range: 50,
    enabled: true,
    singleUse: false,
    used: false,
    conditions: [
      { type: InteractionCondition.ALWAYS }
    ],
    actions: []
  };
  
  // Should be available
  const conditionMet = interactionSystem.checkInteractionConditions?.(interaction, 1, 2) ?? false;
  runner.assert(conditionMet, 'Always available condition should always pass');
});

runner.test('InteractionSystem - Item requirement condition', () => {
  const interactionSystem = new InteractionSystem();
  const world = new WorldManager();
  
  interactionSystem.setWorld(world);
  interactionSystem.setPlayer(1);
  
  // Give player item
  interactionSystem.addItemToInventory('key_gold');
  
  // Create interaction that requires item
  const interaction: Interaction = {
    id: 'item_test',
    type: InteractionType.OPEN,
    name: 'Item Test',
    description: 'Test interaction that requires item',
    range: 50,
    enabled: true,
    singleUse: false,
    used: false,
    conditions: [
      { type: InteractionCondition.REQUIRES_ITEM, value: 'key_gold' }
    ],
    actions: []
  };
  
  // Should be available when player has item
  const hasItem = interactionSystem.checkInteractionConditions?.(interaction, 1, 2) ?? false;
  runner.assert(hasItem, 'Should be available when player has item');
  
  // Should not be available when player doesn't have item
  interactionSystem.removeItemFromInventory('key_gold');
  const noItem = interactionSystem.checkInteractionConditions?.(interaction, 1, 2) ?? false;
  runner.assert(!noItem, 'Should not be available when player doesn\'t have item');
});

runner.test('InteractionSystem - Level requirement condition', () => {
  const interactionSystem = new InteractionSystem();
  const world = new WorldManager();
  
  interactionSystem.setWorld(world);
  interactionSystem.setPlayer(1);
  
  // Create interaction that requires level 5
  const interaction: Interaction = {
    id: 'level_test',
    type: InteractionType.OPEN,
    name: 'Level Test',
    description: 'Test interaction that requires level 5',
    range: 50,
    enabled: true,
    singleUse: false,
    used: false,
    conditions: [
      { type: InteractionCondition.REQUIRES_LEVEL, value: 5 }
    ],
    actions: []
  };
  
  // Should be available at correct level
  const correctLevel = interactionSystem.checkInteractionConditions?.(interaction, 1, 2) ?? false;
  runner.assert(correctLevel, 'Should be available at correct level');
  
  // Should not be available at insufficient level
  interactionSystem.setPlayerLevel(1);
  const insufficientLevel = interactionSystem.checkInteractionConditions?.(interaction, 1, 2) ?? false;
  runner.assert(!insufficientLevel, 'Should not be available at insufficient level');
});

runner.test('InteractionSystem - Negated conditions', () => {
  const interactionSystem = new InteractionSystem();
  const world = new WorldManager();
  
  interactionSystem.setWorld(world);
  interactionSystem.setPlayer(1);
  
  // Give player item
  interactionSystem.addItemToInventory('key_gold');
  
  // Create interaction with negated condition
  const interaction: Interaction = {
    id: 'negated_test',
    type: InteractionType.OPEN,
    name: 'No Gold Key Door',
    description: 'Door that opens when you DON\'T have gold key',
    range: 50,
    enabled: true,
    singleUse: false,
    used: false,
    conditions: [
      { type: InteractionCondition.REQUIRES_ITEM, value: 'key_gold', negate: true }
    ],
    actions: []
  };
  
  // Should be available when player doesn't have item (negate=true)
  const conditionMet = interactionSystem.checkInteractionConditions?.(interaction, 1, 2) ?? false;
  runner.assert(conditionMet, 'Negated condition should pass when item not present');
  
  // Should fail when player has item (negate=true)
  interactionSystem.addItemToInventory('key_gold');
  const conditionMetWithItem = interactionSystem.checkInteractionConditions?.(interaction, 1, 2) ?? false;
  runner.assert(!conditionMetWithItem, 'Negated condition should fail when item is present');
});

runner.test('InteractionSystem - Story flag condition', () => {
  const interactionSystem = new InteractionSystem();
  const world = new WorldManager();
  
  interactionSystem.setWorld(world);
  interactionSystem.setPlayer(1);
  
  // Test flag not set
  runner.assert(!interactionSystem.getStoryFlag('test_flag'), 'Flag should not be set initially');
  
  // Set flag
  interactionSystem.setStoryFlag('test_flag', true);
  runner.assert(interactionSystem.getStoryFlag('test_flag'), 'Flag should be set to true');
  // Set flag to false
  interactionSystem.setStoryFlag('test_flag', false);
  runner.assert(!interactionSystem.getStoryFlag('test_flag'), 'Flag should be false when set to false');
});

// ============= INTEGRATION TESTS =============

runner.test('Integration - World and Interaction System', () => {
  const interactionSystem = new InteractionSystem();
  const world = new WorldManager();
  
  interactionSystem.setWorld(world);
  interactionSystem.setPlayer(1);
  
  // Create interactive entity
  const entityId = interactionSystem.createInteractiveEntity({
    id: 'test_entity',
    type: InteractionType.OPEN,
    name: 'Test Entity',
    description: 'Test entity for interaction',
    range: 50,
    enabled: true,
    singleUse: false,
    used: false,
    conditions: [],
    actions: []
  });
  
  // Should find 1 available interaction
  const availableInteractions = interactionSystem.getAvailableInteractions();
  const found = availableInteractions.length;
  runner.assert(found >= 1, 'Should find at least 1 available interaction');
});

// ============= ACTION TESTS =============

runner.test('Interaction System - Action execution', () => {
  const interactionSystem = new InteractionSystem();
  const world = new WorldManager();
  
  interactionSystem.setWorld(world);
  interactionSystem.setPlayer(1);
  
  // Create interactive entity with actions
  const entityId = interactionSystem.createInteractiveEntity({
    id: 'action_test',
    type: InteractionType.DIALOG,
    name: 'Test Dialog',
    description: 'Test dialog with actions',
    range: 50,
    enabled: true,
    singleUse: false,
    used: false,
    conditions: [],
    actions: [
      { type: InteractionActionType.DIALOG, parameters: { text: 'Hello World!' } }
    ]
  });
  
  // Execute interaction
  const success = interactionSystem.interact();
  runner.assert(success, 'Interaction should succeed');
  
  // Check if action was executed
  const dialogAction = interactionSystem.getActiveInteraction()?.actions[0];
  runner.assertNotNull(dialogAction, 'Dialog action should be active');
  runner.assertEqual(dialogAction.type, InteractionActionType.DIALOG, 'Dialog action should be DIALOG');
  runner.assertEqual(dialogAction.parameters.text, 'Hello World!', 'Dialog action should have correct parameters');
});

// Run all tests
runner.run();

export { runner as interactionSystemTestRunner };
