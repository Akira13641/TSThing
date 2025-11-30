/**
 * Save System Tests
 * @fileoverview Unit tests for save/load functionality
 */

import { SaveSystem, SaveGameData, SaveSlotInfo } from '../engine/SaveSystem';
import { WorldManager } from '../engine/WorldManager';
import { logger, LogSource } from '../engine/GlobalLogger';
import { EntityId, Position, Health } from '../types';

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

// ============= SAVE SYSTEM INITIALIZATION TESTS =============

runner.test('SaveSystem - Initialization', () => {
  const saveSystem = new SaveSystem();
  runner.assertNotNull(saveSystem, 'SaveSystem should be created');
});

runner.test('SaveSystem - World manager assignment', () => {
  const saveSystem = new SaveSystem();
  const world = new WorldManager();
  
  saveSystem.setWorld(world);
  // Should not throw
  runner.assert(true, 'World manager should be assignable');
});

// ============= SAVE GAME TESTS =============

runner.test('SaveSystem - Save game to slot', () => {
  const saveSystem = new SaveSystem();
  const world = new WorldManager();
  
  saveSystem.setWorld(world);
  
  // Create test entity
  const entityId = world.createEntity(['Position', 'Health']);
  world.addComponent(entityId, 'Position', { x: 100, y: 200 });
  world.addComponent(entityId, 'Health', { current: 50, max: 100 });
  
  const success = saveSystem.saveGame(1, 'Test Save');
  runner.assert(success, 'Save should succeed');
});

runner.test('SaveSystem - Save to invalid slot', () => {
  const saveSystem = new SaveSystem();
  const world = new WorldManager();
  
  saveSystem.setWorld(world);
  
  const success = saveSystem.saveGame(11, 'Invalid Save');
  runner.assert(!success, 'Save to invalid slot should fail');
});

runner.test('SaveSystem - Save without world', () => {
  const saveSystem = new SaveSystem();
  
  const success = saveSystem.saveGame(1, 'No World Save');
  runner.assert(!success, 'Save without world should fail');
});

// ============= LOAD GAME TESTS =============

runner.test('SaveSystem - Load game from slot', () => {
  const saveSystem = new SaveSystem();
  const world = new WorldManager();
  
  saveSystem.setWorld(world);
  
  // First save
  const entityId = world.createEntity(['Position', 'Health']);
  world.addComponent(entityId, 'Position', { x: 300, y: 400 });
  world.addComponent(entityId, 'Health', { current: 75, max: 100 });
  
  const saveSuccess = saveSystem.saveGame(2, 'Load Test Save');
  runner.assert(saveSuccess, 'Save should succeed');
  
  // Clear world
  world.clear();
  
  // Load
  const loadSuccess = saveSystem.loadGame(2);
  runner.assert(loadSuccess, 'Load should succeed');
  
  // Verify loaded data
  const loadedEntities = world.query(['Position', 'Health']);
  runner.assertArrayLength(loadedEntities, 1, 'Should have 1 loaded entity');
  
  if (loadedEntities.length > 0) {
    const position = world.getComponent<Position>(loadedEntities[0].id, 'Position');
    const health = world.getComponent<Health>(loadedEntities[0].id, 'Health');
    
    runner.assertNotNull(position, 'Position should be loaded');
    runner.assertNotNull(health, 'Health should be loaded');
    runner.assertEqual(position!.x, 300, 'Position X should match saved value');
    runner.assertEqual(position!.y, 400, 'Position Y should match saved value');
    runner.assertEqual(health!.current, 75, 'Health current should match saved value');
    runner.assertEqual(health!.max, 100, 'Health max should match saved value');
  }
});

runner.test('SaveSystem - Load from invalid slot', () => {
  const saveSystem = new SaveSystem();
  const world = new WorldManager();
  
  saveSystem.setWorld(world);
  
  const success = saveSystem.loadGame(11);
  runner.assert(!success, 'Load from invalid slot should fail');
});

runner.test('SaveSystem - Load non-existent save', () => {
  const saveSystem = new SaveSystem();
  const world = new WorldManager();
  
  saveSystem.setWorld(world);
  
  const success = saveSystem.loadGame(9); // Assuming slot 9 is empty
  runner.assert(!success, 'Load from empty slot should fail');
});

// ============= SAVE SLOT MANAGEMENT TESTS =============

runner.test('SaveSystem - Get save slots', () => {
  const saveSystem = new SaveSystem();
  
  const slots = saveSystem.getSaveSlots();
  runner.assertArrayLength(slots, 10, 'Should have 10 save slots');
  
  // Check that all slots have required properties
  slots.forEach((slot, index) => {
    runner.assertEqual(slot.slot, index + 1, 'Slot number should be correct');
    runner.assert(typeof slot.occupied === 'boolean', 'Should have occupied property');
  });
});

runner.test('SaveSystem - Check save exists', () => {
  const saveSystem = new SaveSystem();
  const world = new WorldManager();
  
  saveSystem.setWorld(world);
  
  // Save to slot 3
  saveSystem.saveGame(3, 'Exists Test');
  
  runner.assert(saveSystem.saveExists(3), 'Slot 3 should exist after save');
  runner.assert(!saveSystem.saveExists(4), 'Slot 4 should not exist');
});

// ============= DELETE SAVE TESTS =============

runner.test('SaveSystem - Delete save', () => {
  const saveSystem = new SaveSystem();
  const world = new WorldManager();
  
  saveSystem.setWorld(world);
  
  // Save to slot 5
  saveSystem.saveGame(5, 'Delete Test');
  runner.assert(saveSystem.saveExists(5), 'Slot 5 should exist after save');
  
  // Delete
  const deleteSuccess = saveSystem.deleteSave(5);
  runner.assert(deleteSuccess, 'Delete should succeed');
  runner.assert(!saveSystem.saveExists(5), 'Slot 5 should not exist after delete');
});

runner.test('SaveSystem - Delete from invalid slot', () => {
  const saveSystem = new SaveSystem();
  
  const success = saveSystem.deleteSave(11);
  runner.assert(!success, 'Delete from invalid slot should fail');
});

// ============= AUTO-SAVE TESTS =============

runner.test('SaveSystem - Auto-save', () => {
  const saveSystem = new SaveSystem();
  const world = new WorldManager();
  
  saveSystem.setWorld(world);
  
  const success = saveSystem.autoSave();
  runner.assert(success, 'Auto-save should succeed');
  runner.assert(saveSystem.saveExists(10), 'Auto-save should save to slot 10');
});

// ============= EXPORT/IMPORT TESTS =============

runner.test('SaveSystem - Export save', () => {
  const saveSystem = new SaveSystem();
  const world = new WorldManager();
  
  saveSystem.setWorld(world);
  
  // Save to slot 6
  saveSystem.saveGame(6, 'Export Test');
  
  // Mock document.createElement for testing
  const originalCreateElement = document.createElement;
  let linkCreated = false;
  
  document.createElement = (tagName: string) => {
    if (tagName === 'a') {
      linkCreated = true;
      return {
        href: '',
        download: '',
        click: () => {},
        style: {}
      } as any;
    }
    return originalCreateElement.call(document, tagName);
  };
  
  const exportSuccess = saveSystem.exportSave(6);
  
  // Restore original
  document.createElement = originalCreateElement;
  
  runner.assert(exportSuccess, 'Export should succeed');
  runner.assert(linkCreated, 'Download link should be created');
});

runner.test('SaveSystem - Import save', async () => {
  const saveSystem = new SaveSystem();
  
  // Mock localStorage
  const mockLocalStorage: Record<string, string> = {};
  Object.defineProperty(globalThis, 'localStorage', {
    value: {
      getItem: (key: string) => mockLocalStorage[key] || null,
      setItem: (key: string, value: string) => { mockLocalStorage[key] = value; },
      removeItem: (key: string) => { delete mockLocalStorage[key]; },
      clear: () => { Object.keys(mockLocalStorage).forEach(key => delete mockLocalStorage[key]); },
      key: (index: number) => Object.keys(mockLocalStorage)[index] || null,
      length: Object.keys(mockLocalStorage).length
    },
    writable: true,
    configurable: true
  });
  
  // Create mock file
  const mockData = '{"meta":{"version":1,"timestamp":1234567890},"player":{"entityId":1,"position":{"x":0,"y":0},"health":{"current":100,"max":100},"combatState":{"attacking":false,"attack":10,"defense":5,"actionPoints":3,"maxActionPoints":3},"sprite":{"textureId":"hero","frameIndex":0,"width":32,"height":32},"velocity":{"dx":0,"dy":0},"level":1,"experience":0,"gold":100},"gameState":{"currentScene":"OVERWORLD","storyFlags":{},"completedQuests":[],"activeQuests":[],"switches":{},"variables":{}},"inventory":{"items":[],"maxSlots":20},"party":[],"world":{"entities":[],"componentData":{}},"system":{}}';
  const mockFile = new File([mockData], 'test.json', { type: 'application/json' });
  
  const importSuccess = await saveSystem.importSave(mockFile, 7);
  runner.assert(importSuccess, 'Import should succeed');
});

// ============= DATA VALIDATION TESTS =============

runner.test('SaveSystem - Validate save data structure', () => {
  const saveSystem = new SaveSystem();
  const world = new WorldManager();
  
  saveSystem.setWorld(world);
  
  // Create comprehensive save data
  const entityId = world.createEntity(['Position', 'Health', 'Sprite']);
  world.addComponent(entityId, 'Position', { x: 50, y: 75 });
  world.addComponent(entityId, 'Health', { current: 25, max: 50 });
  world.addComponent(entityId, 'Sprite', { textureId: 'hero', frameIndex: 0, width: 16, height: 32 });
  
  const saveSuccess = saveSystem.saveGame(8, 'Validation Test');
  runner.assert(saveSuccess, 'Save with complete data should succeed');
  
  // Load and validate structure
  world.clear();
  const loadSuccess = saveSystem.loadGame(8);
  runner.assert(loadSuccess, 'Load should succeed');
  
  const loadedEntities = world.query(['Position', 'Health', 'Sprite']);
  runner.assertArrayLength(loadedEntities, 1, 'Should have 1 loaded entity');
  
  if (loadedEntities.length > 0) {
    const position = world.getComponent<Position>(loadedEntities[0].id, 'Position');
    const health = world.getComponent<Health>(loadedEntities[0].id, 'Health');
    const sprite = world.getComponent<any>(loadedEntities[0].id, 'Sprite');
    
    runner.assertNotNull(position, 'Position should be loaded');
    runner.assertNotNull(health, 'Health should be loaded');
    runner.assertNotNull(sprite, 'Sprite should be loaded');
  }
});

// ============= ERROR HANDLING TESTS =============

runner.test('SaveSystem - Handle corrupted save data', () => {
  const saveSystem = new SaveSystem();
  const world = new WorldManager();
  
  saveSystem.setWorld(world);
  
  // Mock localStorage with corrupted data
  const originalSetItem = localStorage.setItem;
  localStorage.setItem = (key: string, value: string) => {
    if (key === 'aetherial_vanguard_save_1') {
      originalSetItem.call(localStorage, key, 'invalid json data');
    } else {
      originalSetItem.call(localStorage, key, value);
    }
  };
  
  const success = saveSystem.loadGame(1);
  
  // Restore original
  localStorage.setItem = originalSetItem;
  
  runner.assert(!success, 'Load should fail with corrupted data');
});

runner.test('SaveSystem - Handle storage quota exceeded', () => {
  const saveSystem = new SaveSystem();
  const world = new WorldManager();
  
  saveSystem.setWorld(world);
  
  // Mock localStorage to throw quota exceeded error
  const originalSetItem = localStorage.setItem;
  localStorage.setItem = (key: string, value: string) => {
    if (key.includes('aetherial_vanguard_save')) {
      throw new Error('QuotaExceededError');
    }
    originalSetItem.call(localStorage, key, value);
  };
  
  const success = saveSystem.saveGame(1, 'Quota Test');
  
  // Restore original
  localStorage.setItem = originalSetItem;
  
  runner.assert(!success, 'Save should fail when storage quota exceeded');
});

// ============= VERSION MIGRATION TESTS =============

runner.test('SaveSystem - Version migration', () => {
  const saveSystem = new SaveSystem();
  const world = new WorldManager();
  
  saveSystem.setWorld(world);
  
  // Mock old version save data
  const oldSaveData = {
    meta: {
      name: 'Old Version Save',
      timestamp: Date.now(),
      playerLevel: 1,
      location: 'Test',
      playtime: 0,
      version: '0.9.0' // Old version
    },
    player: {
      entityId: 1,
      position: { x: 0, y: 0 },
      health: { current: 100, max: 100 },
      combatState: { attacking: false, attack: 10, defense: 5, actionPoints: 3, maxActionPoints: 3 },
      sprite: { textureId: 'hero', frameIndex: 0, width: 16, height: 32 },
      velocity: { dx: 0, dy: 0 },
      level: 1,
      experience: 0,
      gold: 100
    },
    gameState: {
      currentScene: 'OVERWORLD',
      storyFlags: {},
      completedQuests: [],
      activeQuests: [],
      switches: {},
      variables: {}
    },
    inventory: {
      items: [],
      equipped: { weapon: null, armor: null, shield: null, accessory1: null, accessory2: null, special: null },
      size: 20
    },
    party: {
      members: [1],
      formation: [{ entityId: 1, position: 'front', slot: 0 }]
    },
    world: {
      defeatedEnemies: {},
      openedChests: [],
      activatedSwitches: [],
      discoveredAreas: ['starting_area'],
      currentMap: 'overworld',
      mapCompletion: 5
    },
    system: {
      stats: {
        battlesWon: 0,
        battlesLost: 0,
        enemiesDefeated: 0,
        itemsUsed: 0,
        stepsTaken: 0,
        goldEarned: 100,
        goldSpent: 0,
        saveCount: 1
      },
      settings: {
        masterVolume: 80,
        musicVolume: 70,
        sfxVolume: 80,
        textSpeed: 2,
        autoSave: true,
        battleAnimations: true
      }
    }
  };
  
  // Mock localStorage with old version data
  const originalSetItem = localStorage.setItem;
  localStorage.setItem = (key: string, value: string) => {
    if (key === 'aetherial_vanguard_save_1') {
      originalSetItem.call(localStorage, key, JSON.stringify(oldSaveData));
    } else {
      originalSetItem.call(localStorage, key, value);
    }
  };
  
  const success = saveSystem.loadGame(1);
  
  // Restore original
  localStorage.setItem = originalSetItem;
  
  runner.assert(success, 'Migration should succeed');
});

// Run all tests
runner.run();

export { runner as saveSystemTestRunner };