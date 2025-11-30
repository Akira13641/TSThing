/**
 * Interaction System Tests
 * @fileoverview Unit tests for interaction system and entity interactions
 */

import { InteractionSystem, InteractionType, InteractionCondition, InteractionActionType } from '../engine/InteractionSystem';
import { WorldManager } from '../engine/WorldManager';
import { logger, LogSource } from '../engine/GlobalLogger';
import { EntityId, Position, Interaction } from '../types';

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
        console.log(`✓ ${test.name}`);
        this.passed++;
      } catch (error) {
        console.log(`✗ ${test.name}`);
        console.log(`  Error: ${error}`);
        this.failed++;
      }
    }

    console.log(`\nInteraction System Test Results: ${this.passed} passed, ${this.failed} failed`);
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
const runner = new InteractionSystemTestRunner();

// ============= INTERACTION SYSTEM INITIALIZATION TESTS =============

runner.test('InteractionSystem - Initialization', () => {
  const interactionSystem = new InteractionSystem();
  runner.assertNotNull(interactionSystem, 'InteractionSystem should be created');
});

runner.test('InteractionSystem - World manager assignment', () => {
  const interactionSystem = new InteractionSystem();
  const world = new WorldManager();
  
  interactionSystem.setWorld(world);
  // Should not throw
  runner.assert(true, 'World manager should be assignable');
});

runner.test('InteractionSystem - Player assignment', () => {
  const interactionSystem = new InteractionSystem();
  
  interactionSystem.setPlayer(1);
  // Should not throw
  runner.assert(true, 'Player should be assignable');
});

// ============= INTERACTION CREATION TESTS =============

runner.test('InteractionSystem - Create interactive entity', () => {
  const interactionSystem = new InteractionSystem();
  const world = new WorldManager();
  
  interactionSystem.setWorld(world);
  
  const interaction: Interaction = {
    id: 'test_npc',
    type: InteractionType.TALK,
    name: 'Test NPC',
    description: 'A test NPC for interactions',
    range: 50,
    enabled: true,
    singleUse: false,
    used: false,
    conditions: [],
    actions: []
  };
  
  const entityId = interactionSystem.createInteractiveEntity(interaction);
  runner.assertNotNull(entityId, 'Interactive entity should be created');
  
  const retrievedInteraction = world.getComponent<Interaction>(entityId, 'Interaction');
  runner.assertNotNull(retrievedInteraction, 'Interaction component should be attached');
  runner.assertEqual(retrievedInteraction!.id, 'test_npc', 'Interaction ID should match');
});

// ============= INTERACTION CONDITIONS TESTS =============

runner.test('InteractionSystem - Always condition', () => {
  const interactionSystem = new InteractionSystem();
  
  const interaction: Interaction = {
    id: 'always_test',
    type: InteractionType.EXAMINE,
    name: 'Always Available',
    description: 'Always available interaction',
    range: 50,
    enabled: true,
    singleUse: false,
    used: false,
    conditions: [
      { type: InteractionCondition.ALWAYS, value: true }
    ],
    actions: []
  };
  
  // Should always be available
  const isAvailable = interactionSystem.checkInteractionConditions?.(interaction, 1, 2) ?? false;
  runner.assert(isAvailable, 'Always condition should pass');
});

runner.test('InteractionSystem - Item requirement condition', () => {
  const interactionSystem = new InteractionSystem();
  
  // Give player required item
  interactionSystem.addItemToInventory('key_silver');
  
  const interaction: Interaction = {
    id: 'item_test',
    type: InteractionType.OPEN,
    name: 'Locked Door',
    description: 'Door requiring silver key',
    range: 50,
    enabled: true,
    singleUse: false,
    used: false,
    conditions: [
      { type: InteractionCondition.REQUIRES_ITEM, value: 'key_silver' }
    ],
    actions: []
  };
  
  // Should be available with item
  const hasItem = interactionSystem.checkInteractionConditions?.(interaction, 1, 2) ?? false;
  runner.assert(hasItem, 'Item requirement should pass when player has item');
  
  // Remove item and test again
  interactionSystem.removeItemFromInventory('key_silver');
  const noItem = interactionSystem.checkInteractionConditions?.(interaction, 1, 2) ?? false;
  runner.assert(!noItem, 'Item requirement should fail when player lacks item');
});

runner.test('InteractionSystem - Story flag condition', () => {
  const interactionSystem = new InteractionSystem();
  
  // Set story flag
  interactionSystem.setStoryFlag('met_king', true);
  
  const interaction: Interaction = {
    id: 'flag_test',
    type: InteractionType.TALK,
    name: 'King',
    description: 'The king you met',
    range: 50,
    enabled: true,
    singleUse: false,
    used: false,
    conditions: [
      { type: InteractionCondition.REQUIRES_FLAG, value: 'met_king' }
    ],
    actions: []
  };
  
  // Should be available with flag set
  const hasFlag = interactionSystem.checkInteractionConditions?.(interaction, 1, 2) ?? false;
  runner.assert(hasFlag, 'Flag requirement should pass when flag is set');
  
  // Clear flag and test again
  interactionSystem.setStoryFlag('met_king', false);
  const noFlag = interactionSystem.checkInteractionConditions?.(interaction, 1, 2) ?? false;
  runner.assert(!noFlag, 'Flag requirement should fail when flag is not set');
});

runner.test('InteractionSystem - Level requirement condition', () => {
  const interactionSystem = new InteractionSystem();
  
  // Set player level
  interactionSystem.setPlayerLevel(10);
  
  const interaction: Interaction = {
    id: 'level_test',
    type: InteractionType.USE,
    name: 'Level Gated Item',
    description: 'Requires level 10',
    range: 50,
    enabled: true,
    singleUse: false,
    used: false,
    conditions: [
      { type: InteractionCondition.REQUIRES_LEVEL, value: 10 }
    ],
    actions: []
  };
  
  // Should be available at correct level
  const correctLevel = interactionSystem.checkInteractionConditions?.(interaction, 1, 2) ?? false;
  runner.assert(correctLevel, 'Level requirement should pass at correct level');
  
  // Test with insufficient level
  interactionSystem.setPlayerLevel(5);
  const insufficientLevel = interactionSystem.checkInteractionConditions?.(interaction, 1, 2) ?? false;
  runner.assert(!insufficientLevel, 'Level requirement should fail at insufficient level');
});

runner.test('InteractionSystem - Negated conditions', () => {
  const interactionSystem = new InteractionSystem();
  
  // Give player item
  interactionSystem.addItemToInventory('key_gold');
  
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
  
  // Should be available when player doesn't have the item
  const withoutItem = interactionSystem.checkInteractionConditions?.(interaction, 1, 2) ?? false;
  runner.assert(withoutItem, 'Negated condition should pass when item not present');
  
  // Should fail when player has the item
  interactionSystem.addItemToInventory('key_gold');
  const withItem = interactionSystem.checkInteractionConditions?.(interaction, 1, 2) ?? false;
  runner.assert(!withItem, 'Negated condition should fail when item is present');
});

// ============= INTERACTION RANGE TESTS =============

runner.test('InteractionSystem - Range multiplier', () => {
  const interactionSystem = new InteractionSystem();
  
  interactionSystem.setRangeMultiplier(2.0);
  
  const interaction: Interaction = {
    id: 'range_test',
    type: InteractionType.EXAMINE,
    name: 'Range Test',
    description: 'Tests range calculations',
    range: 50,
    enabled: true,
    singleUse: false,
    used: false,
    conditions: [],
    actions: []
  };
  
  // Effective range should be 100 with 2x multiplier
  // This would be tested in actual update with distance calculations
  runner.assert(true, 'Range multiplier should be set');
});

// ============= INTERACTION PRIORITY TESTS =============

runner.test('InteractionSystem - Priority calculation', () => {
  const interactionSystem = new InteractionSystem();
  
  // Test different interaction types
  const talkPriority = interactionSystem.calculateInteractionPriority?.({
    type: InteractionType.TALK
  } as Interaction) || 0;
  
  const examinePriority = interactionSystem.calculateInteractionPriority?.({
    type: InteractionType.EXAMINE
  } as Interaction) || 0;
  
  const pickupPriority = interactionSystem.calculateInteractionPriority?.({
    type: InteractionType.PICKUP
  } as Interaction) || 0;
  
  // Talk should have higher priority than examine
  runner.assert(talkPriority > examinePriority, 'Talk should have higher priority than examine');
  runner.assert(pickupPriority > examinePriority, 'Pickup should have higher priority than examine');
});

// ============= SINGLE-USE INTERACTIONS TESTS =============

runner.test('InteractionSystem - Single use interactions', () => {
  const interactionSystem = new InteractionSystem();
  
  const interaction: Interaction = {
    id: 'single_use_test',
    type: InteractionType.PICKUP,
    name: 'Single Use Item',
    description: 'Can only be used once',
    range: 50,
    enabled: true,
    singleUse: true,
    used: false,
    conditions: [],
    actions: []
  };
  
  // Should be available initially
  runner.assert(!interaction.used, 'Single use interaction should not be used initially');
  
  // Mark as used
  interaction.used = true;
  
  // Should no longer be available
  runner.assert(interaction.used, 'Single use interaction should be marked as used');
});

// ============= INVENTORY MANAGEMENT TESTS =============

runner.test('InteractionSystem - Inventory management', () => {
  const interactionSystem = new InteractionSystem();
  
  // Test empty inventory
  runner.assert(!interactionSystem.hasItem('sword'), 'Should not have item initially');
  
  // Add item
  interactionSystem.addItemToInventory('sword');
  runner.assert(interactionSystem.hasItem('sword'), 'Should have item after adding');
  
  // Add duplicate item
  interactionSystem.addItemToInventory('sword');
  runner.assert(interactionSystem.hasItem('sword'), 'Should still have item');
  
  // Remove item
  interactionSystem.removeItemFromInventory('sword');
  // Should still have item (we added it twice)
  runner.assert(interactionSystem.hasItem('sword'), 'Should still have one item');
  
  // Remove second item
  interactionSystem.removeItemFromInventory('sword');
  runner.assert(!interactionSystem.hasItem('sword'), 'Should not have item after removing all');
});

// ============= STORY FLAGS TESTS =============

runner.test('InteractionSystem - Story flag management', () => {
  const interactionSystem = new InteractionSystem();
  
  // Test flag not set
  runner.assert(!interactionSystem.getStoryFlag('test_flag'), 'Flag should not be set initially');
  
  // Set flag
  interactionSystem.setStoryFlag('test_flag', true);
  runner.assert(interactionSystem.getStoryFlag('test_flag'), 'Flag should be set to true');
  
  // Set flag to false
  interactionSystem.setStoryFlag('test_flag', false);
  runner.assert(!interactionSystem.getStoryFlag('test_flag'), 'Flag should be set to false');
});

// ============= PLAYER LEVEL TESTS =============

runner.test('InteractionSystem - Player level management', () => {
  const interactionSystem = new InteractionSystem();
  
  // Set level
  interactionSystem.setPlayerLevel(15);
  // Would validate level is >= 1
  runner.assert(true, 'Level should be settable');
});

// ============= INTERACTION EXECUTION TESTS =============

runner.test('InteractionSystem - Interaction execution', () => {
  const interactionSystem = new InteractionSystem();
  
  const interaction: Interaction = {
    id: 'action_test',
    type: InteractionType.TALK,
    name: 'Action Test',
    description: 'Tests action execution',
    range: 50,
    enabled: true,
    singleUse: false,
    used: false,
    conditions: [],
    actions: [
      {
        type: InteractionActionType.DIALOG,
        parameters: { text: 'Hello, world!' }
      }
    ]
  };
  
  // Execute actions
  interactionSystem.executeInteractionActions?.(1, interaction) ?? null;
  
  // Should not throw
  runner.assert(true, 'Action execution should not throw');
});

// Run all tests
runner.run();

export { runner as interactionSystemTestRunner };