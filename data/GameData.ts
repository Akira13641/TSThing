/**
 * Game Data Tables
 * @fileoverview Comprehensive game data definitions for items, enemies, skills, and content
 */

import { ItemDef, EnemyDef } from '../types';
import { HERO_ANIMATIONS, SLIME_ANIMATIONS } from '../assets/SpriteAssets';

/**
 * Item definitions database
 * Contains all items available in the game with their properties
 */
export const ITEMS_DATABASE: Record<string, ItemDef> = {
  // ============= CONSUMABLES =============
  
  'potion_health_minor': {
    id: 'potion_health_minor',
    name: 'Minor Health Potion',
    description: 'A small red potion that restores 25 HP.',
    type: 'CONSUMABLE',
    properties: {
      value: 25,
      stackable: true,
      consumable: true,
      effects: [
        { type: 'heal', value: 25 }
      ]
    }
  },

  'potion_health': {
    id: 'potion_health',
    name: 'Health Potion',
    description: 'A standard red potion that restores 50 HP.',
    type: 'CONSUMABLE',
    properties: {
      value: 50,
      stackable: true,
      consumable: true,
      effects: [
        { type: 'heal', value: 50 }
      ]
    }
  },

  'potion_health_major': {
    id: 'potion_health_major',
    name: 'Major Health Potion',
    description: 'A large red potion that restores 100 HP.',
    type: 'CONSUMABLE',
    properties: {
      value: 125,
      stackable: true,
      consumable: true,
      effects: [
        { type: 'heal', value: 100 }
      ]
    }
  },

  'potion_mana_minor': {
    id: 'potion_mana_minor',
    name: 'Minor Mana Potion',
    description: 'A small blue potion that restores 15 MP.',
    type: 'CONSUMABLE',
    properties: {
      value: 20,
      stackable: true,
      consumable: true,
      effects: [
        { type: 'mana', value: 15 }
      ]
    }
  },

  'potion_mana': {
    id: 'potion_mana',
    name: 'Mana Potion',
    description: 'A standard blue potion that restores 30 MP.',
    type: 'CONSUMABLE',
    properties: {
      value: 40,
      stackable: true,
      consumable: true,
      effects: [
        { type: 'mana', value: 30 }
      ]
    }
  },

  'elixir_strength': {
    id: 'elixir_strength',
    name: 'Strength Elixir',
    description: 'A glowing red elixir that temporarily increases ATK by 10 for 5 minutes.',
    type: 'CONSUMABLE',
    properties: {
      value: 200,
      stackable: true,
      consumable: true,
      effects: [
        { type: 'buff_attack', value: 10 }
      ]
    }
  },

  'elixir_defense': {
    id: 'elixir_defense',
    name: 'Defense Elixir',
    description: 'A shimmering blue elixir that temporarily increases DEF by 8 for 5 minutes.',
    type: 'CONSUMABLE',
    properties: {
      value: 180,
      stackable: true,
      consumable: true,
      effects: [
        { type: 'buff_defense', value: 8 }
      ]
    }
  },

  'antidote': {
    id: 'antidote',
    name: 'Antidote',
    description: 'A herbal remedy that cures poison and status ailments.',
    type: 'CONSUMABLE',
    properties: {
      value: 30,
      stackable: true,
      consumable: true,
      effects: [
        { type: 'cure_poison', value: 1 },
        { type: 'cure_status', value: 1 }
      ]
    }
  },

  'herb_healing': {
    id: 'herb_healing',
    name: 'Healing Herb',
    description: 'A common medicinal herb that restores 25 HP.',
    type: 'CONSUMABLE',
    properties: {
      value: 15,
      stackable: true,
      consumable: true,
      effects: [
        { type: 'heal', value: 25 }
      ]
    }
  },

  // ============= WEAPONS =============

  'dagger_wood': {
    id: 'dagger_wood',
    name: 'Wooden Dagger',
    description: 'A simple wooden dagger. Basic weapon for beginners.',
    type: 'WEAPON',
    properties: {
      value: 10,
      stackable: false,
      consumable: false,
      effects: [
        { type: 'attack', value: 3 }
      ]
    }
  },

  'sword_iron': {
    id: 'sword_iron',
    name: 'Iron Sword',
    description: 'A well-crafted iron sword. Reliable and sturdy.',
    type: 'WEAPON',
    properties: {
      value: 150,
      stackable: false,
      consumable: false,
      effects: [
        { type: 'attack', value: 15 }
      ]
    }
  },

  'sword_steel': {
    id: 'sword_steel',
    name: 'Steel Sword',
    description: 'A finely forged steel sword with excellent balance.',
    type: 'WEAPON',
    properties: {
      value: 350,
      stackable: false,
      consumable: false,
      effects: [
        { type: 'attack', value: 25 }
      ]
    }
  },

  'sword_mythril': {
    id: 'sword_mythril',
    name: 'Mythril Sword',
    description: 'A legendary sword forged from rare mythril metal.',
    type: 'WEAPON',
    properties: {
      value: 1200,
      stackable: false,
      consumable: false,
      effects: [
        { type: 'attack', value: 45 },
        { type: 'crit_chance', value: 10 }
      ]
    }
  },

  'staff_apprentice': {
    id: 'staff_apprentice',
    name: 'Apprentice Staff',
    description: 'A wooden staff used by novice magic users.',
    type: 'WEAPON',
    properties: {
      value: 80,
      stackable: false,
      consumable: false,
      effects: [
        { type: 'attack', value: 8 },
        { type: 'magic_power', value: 12 }
      ]
    }
  },

  'staff_wizard': {
    id: 'staff_wizard',
    name: 'Wizard Staff',
    description: 'An enchanted staff that amplifies magical power.',
    type: 'WEAPON',
    properties: {
      value: 500,
      stackable: false,
      consumable: false,
      effects: [
        { type: 'attack', value: 15 },
        { type: 'magic_power', value: 35 }
      ]
    }
  },

  'bow_hunting': {
    id: 'bow_hunting',
    name: 'Hunting Bow',
    description: 'A reliable wooden bow for hunting and combat.',
    type: 'WEAPON',
    properties: {
      value: 120,
      stackable: false,
      consumable: false,
      effects: [
        { type: 'attack', value: 18 },
        { type: 'range', value: 5 }
      ]
    }
  },

  // ============= ARMOR =============

  'cloth_tunic': {
    id: 'cloth_tunic',
    name: 'Cloth Tunic',
    description: 'Simple cloth clothing offers minimal protection.',
    type: 'ARMOR',
    properties: {
      value: 15,
      stackable: false,
      consumable: false,
      effects: [
        { type: 'defense', value: 2 }
      ]
    }
  },

  'leather_armor': {
    id: 'leather_armor',
    name: 'Leather Armor',
    description: 'Sturdy leather armor providing decent protection.',
    type: 'ARMOR',
    properties: {
      value: 120,
      stackable: false,
      consumable: false,
      effects: [
        { type: 'defense', value: 8 }
      ]
    }
  },

  'chain_mail': {
    id: 'chain_mail',
    name: 'Chain Mail',
    description: 'Interlocking metal rings offering good protection.',
    type: 'ARMOR',
    properties: {
      value: 280,
      stackable: false,
      consumable: false,
      effects: [
        { type: 'defense', value: 15 }
      ]
    }
  },

  'plate_armor': {
    id: 'plate_armor',
    name: 'Plate Armor',
    description: 'Full steel plate armor offering excellent protection.',
    type: 'ARMOR',
    properties: {
      value: 600,
      stackable: false,
      consumable: false,
      effects: [
        { type: 'defense', value: 25 }
      ]
    }
  },

  'robe_mage': {
    id: 'robe_mage',
    name: 'Mage Robe',
    description: 'Enchanted robes that boost magical power.',
    type: 'ARMOR',
    properties: {
      value: 200,
      stackable: false,
      consumable: false,
      effects: [
        { type: 'defense', value: 5 },
        { type: 'magic_power', value: 15 },
        { type: 'magic_resist', value: 10 }
      ]
    }
  },

  'shield_wood': {
    id: 'shield_wood',
    name: 'Wooden Shield',
    description: 'A basic wooden shield for blocking attacks.',
    type: 'ARMOR',
    properties: {
      value: 75,
      stackable: false,
      consumable: false,
      effects: [
        { type: 'defense', value: 5 },
        { type: 'block_chance', value: 15 }
      ]
    }
  },

  'shield_iron': {
    id: 'shield_iron',
    name: 'Iron Shield',
    description: 'A heavy iron shield providing solid protection.',
    type: 'ARMOR',
    properties: {
      value: 200,
      stackable: false,
      consumable: false,
      effects: [
        { type: 'defense', value: 12 },
        { type: 'block_chance', value: 25 }
      ]
    }
  },

  // ============= KEYS =============

  'key_bronze': {
    id: 'key_bronze',
    name: 'Bronze Key',
    description: 'An old bronze key. Opens bronze chests and doors.',
    type: 'KEY',
    properties: {
      value: 25,
      stackable: true,
      consumable: false
    }
  },

  'key_silver': {
    id: 'key_silver',
    name: 'Silver Key',
    description: 'A polished silver key. Opens silver chests and doors.',
    type: 'KEY',
    properties: {
      value: 75,
      stackable: true,
      consumable: false
    }
  },

  'key_gold': {
    id: 'key_gold',
    name: 'Gold Key',
    description: 'A precious gold key. Opens gold chests and doors.',
    type: 'KEY',
    properties: {
      value: 200,
      stackable: true,
      consumable: false
    }
  },

  'key_master': {
    id: 'key_master',
    name: 'Master Key',
    description: 'A mystical key that can open any locked door.',
    type: 'KEY',
    properties: {
      value: 1000,
      stackable: true,
      consumable: false
    }
  },

  // ============= MISC =============

  'torch': {
    id: 'torch',
    name: 'Torch',
    description: 'A wooden torch that illuminates dark areas.',
    type: 'MISC',
    properties: {
      value: 5,
      stackable: true,
      consumable: true,
      effects: [
        { type: 'light', value: 5 }
      ]
    }
  },

  'rope': {
    id: 'rope',
    name: 'Rope',
    description: 'A sturdy length of rope useful for climbing.',
    type: 'MISC',
    properties: {
      value: 20,
      stackable: true,
      consumable: false
    }
  },

  'crystal_blue': {
    id: 'crystal_blue',
    name: 'Blue Crystal',
    description: 'A mysterious blue crystal that hums with magical energy.',
    type: 'MISC',
    properties: {
      value: 500,
      stackable: true,
      consumable: false,
      effects: [
        { type: 'magic_power', value: 5 }
      ]
    }
  }
};

/**
 * Enemy definitions database
 * Contains all enemy types with their stats and behaviors
 */
export const ENEMIES_DATABASE: Record<string, EnemyDef> = {
  // ============= SLIMES =============

  'slime_green': {
    id: 'slime_green',
    name: 'Green Slime',
    stats: {
      health: 30,
      attack: 8,
      defense: 2,
      speed: 2
    },
    sprite: {
      textureId: 'slime_green',
      width: 16,
      height: 16,
      animations: SLIME_ANIMATIONS
    },
    behavior: {
      aggression: 1,
      patrolRadius: 3,
      detectionRange: 4
    }
  },

  'slime_blue': {
    id: 'slime_blue',
    name: 'Blue Slime',
    stats: {
      health: 45,
      attack: 12,
      defense: 4,
      speed: 3
    },
    sprite: {
      textureId: 'slime_blue',
      width: 16,
      height: 16,
      animations: SLIME_ANIMATIONS
    },
    behavior: {
      aggression: 2,
      patrolRadius: 4,
      detectionRange: 5
    }
  },

  'slime_red': {
    id: 'slime_red',
    name: 'Red Slime',
    stats: {
      health: 60,
      attack: 18,
      defense: 6,
      speed: 4
    },
    sprite: {
      textureId: 'slime_red',
      width: 16,
      height: 16,
      animations: SLIME_ANIMATIONS
    },
    behavior: {
      aggression: 3,
      patrolRadius: 5,
      detectionRange: 6
    }
  },

  'slime_king': {
    id: 'slime_king',
    name: 'Slime King',
    stats: {
      health: 200,
      attack: 35,
      defense: 15,
      speed: 2
    },
    sprite: {
      textureId: 'slime_red', // Reuse texture but larger in practice
      width: 32,
      height: 32,
      animations: SLIME_ANIMATIONS
    },
    behavior: {
      aggression: 4,
      patrolRadius: 8,
      detectionRange: 10
    }
  },

  // ============= UNDEAD =============

  'skeleton_warrior': {
    id: 'skeleton_warrior',
    name: 'Skeleton Warrior',
    stats: {
      health: 80,
      attack: 25,
      defense: 10,
      speed: 3
    },
    sprite: {
      textureId: 'hero', // Placeholder - would have skeleton sprite
      width: 16,
      height: 32,
      animations: HERO_ANIMATIONS
    },
    behavior: {
      aggression: 4,
      patrolRadius: 6,
      detectionRange: 8
    }
  },

  'zombie': {
    id: 'zombie',
    name: 'Zombie',
    stats: {
      health: 60,
      attack: 15,
      defense: 8,
      speed: 1
    },
    sprite: {
      textureId: 'hero', // Placeholder - would have zombie sprite
      width: 16,
      height: 32,
      animations: HERO_ANIMATIONS
    },
    behavior: {
      aggression: 3,
      patrolRadius: 4,
      detectionRange: 6
    }
  },

  // ============= BEASTS =============

  'wolf': {
    id: 'wolf',
    name: 'Wild Wolf',
    stats: {
      health: 50,
      attack: 20,
      defense: 6,
      speed: 6
    },
    sprite: {
      textureId: 'hero', // Placeholder - would have wolf sprite
      width: 24,
      height: 16,
      animations: HERO_ANIMATIONS
    },
    behavior: {
      aggression: 4,
      patrolRadius: 8,
      detectionRange: 10
    }
  },

  'bear': {
    id: 'bear',
    name: 'Grizzly Bear',
    stats: {
      health: 120,
      attack: 35,
      defense: 12,
      speed: 4
    },
    sprite: {
      textureId: 'hero', // Placeholder - would have bear sprite
      width: 32,
      height: 32,
      animations: HERO_ANIMATIONS
    },
    behavior: {
      aggression: 5,
      patrolRadius: 6,
      detectionRange: 8
    }
  },

  // ============= MAGICAL CREATURES =============

  'goblin_shaman': {
    id: 'goblin_shaman',
    name: 'Goblin Shaman',
    stats: {
      health: 40,
      attack: 12,
      defense: 4,
      speed: 3
    },
    sprite: {
      textureId: 'hero', // Placeholder - would have goblin sprite
      width: 16,
      height: 24,
      animations: HERO_ANIMATIONS
    },
    behavior: {
      aggression: 3,
      patrolRadius: 5,
      detectionRange: 7
    }
  },

  'dark_mage': {
    id: 'dark_mage',
    name: 'Dark Mage',
    stats: {
      health: 70,
      attack: 40,
      defense: 8,
      speed: 2
    },
    sprite: {
      textureId: 'hero', // Placeholder - would have mage sprite
      width: 16,
      height: 32,
      animations: HERO_ANIMATIONS
    },
    behavior: {
      aggression: 4,
      patrolRadius: 4,
      detectionRange: 12
    }
  },

  // ============= BOSSES =============

  'dragon_young': {
    id: 'dragon_young',
    name: 'Young Dragon',
    stats: {
      health: 500,
      attack: 60,
      defense: 25,
      speed: 5
    },
    sprite: {
      textureId: 'hero', // Placeholder - would have dragon sprite
      width: 64,
      height: 64,
      animations: HERO_ANIMATIONS
    },
    behavior: {
      aggression: 5,
      patrolRadius: 10,
      detectionRange: 15
    }
  },

  'demon_lord': {
    id: 'demon_lord',
    name: 'Demon Lord',
    stats: {
      health: 800,
      attack: 85,
      defense: 30,
      speed: 4
    },
    sprite: {
      textureId: 'hero', // Placeholder - would have demon sprite
      width: 48,
      height: 48,
      animations: HERO_ANIMATIONS
    },
    behavior: {
      aggression: 5,
      patrolRadius: 8,
      detectionRange: 20
    }
  }
};

/**
 * Game configuration constants
 */
export const GAME_CONFIG = {
  // Player progression
  MAX_LEVEL: 99,
  EXPERIENCE_PER_LEVEL: 100,
  EXPERIENCE_CURVE: 1.2, // Multiplier for each level
  
  // Combat formulas
  BASE_DAMAGE_MULTIPLIER: 1.0,
  CRITICAL_HIT_MULTIPLIER: 2.0,
  CRITICAL_HIT_CHANCE_BASE: 5, // Percentage
  
  // Inventory limits
  MAX_INVENTORY_SLOTS: 32,
  MAX_EQUIPPED_ITEMS: 6, // Weapon, Armor, Shield, Accessory x2, Special
  
  // Economy
  STARTING_GOLD: 100,
  MAX_GOLD: 999999,
  
  // Save system
  MAX_SAVE_SLOTS: 10,
  AUTOSAVE_SLOT: 10, // Use slot 10 for auto-save
  AUTOSAVE_INTERVAL: 300, // Seconds
  
  // Difficulty modifiers
  DIFFICULTY_MULTIPLIERS: {
    easy: { enemy_health: 0.8, enemy_damage: 0.7, experience_gain: 1.2, gold_find: 1.3 },
    normal: { enemy_health: 1.0, enemy_damage: 1.0, experience_gain: 1.0, gold_find: 1.0 },
    hard: { enemy_health: 1.3, enemy_damage: 1.2, experience_gain: 0.8, gold_find: 0.7 }
  }
};

/**
 * Helper functions for game data
 */

/**
 * Gets an item definition by ID
 * @param itemId - Item ID
 * @returns Item definition or null if not found
 */
export function getItem(itemId: string): ItemDef | null {
  return ITEMS_DATABASE[itemId] || null;
}

/**
 * Gets an enemy definition by ID
 * @param enemyId - Enemy ID
 * @returns Enemy definition or null if not found
 */
export function getEnemy(enemyId: string): EnemyDef | null {
  return ENEMIES_DATABASE[enemyId] || null;
}

/**
 * Calculates experience required for a level
 * @param level - Target level
 * @returns Experience points required
 */
export function getExperienceForLevel(level: number): number {
  if (level <= 1) return 0;
  
  let totalExp = 0;
  for (let i = 1; i < level; i++) {
    totalExp += Math.floor(GAME_CONFIG.EXPERIENCE_PER_LEVEL * Math.pow(GAME_CONFIG.EXPERIENCE_CURVE, i - 1));
  }
  
  return totalExp;
}

/**
 * Calculates level from total experience
 * @param totalExp - Total experience points
 * @returns Current level
 */
export function getLevelFromExperience(totalExp: number): number {
  let level = 1;
  let expNeeded = 0;
  
  while (expNeeded <= totalExp && level < GAME_CONFIG.MAX_LEVEL) {
    level++;
    expNeeded += Math.floor(GAME_CONFIG.EXPERIENCE_PER_LEVEL * Math.pow(GAME_CONFIG.EXPERIENCE_CURVE, level - 2));
  }
  
  return Math.min(level - 1, GAME_CONFIG.MAX_LEVEL);
}

export default {
  ITEMS_DATABASE,
  ENEMIES_DATABASE,
  GAME_CONFIG,
  getItem,
  getEnemy,
  getExperienceForLevel,
  getLevelFromExperience
};