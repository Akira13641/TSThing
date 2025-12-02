/**
 * Game Data Tables
 * @fileoverview Comprehensive game data definitions for items, enemies, skills, and content
 */

import { ItemDef, EnemyDef, CharacterClass, CharacterStats, SpellDef, StatusEffect } from '../types';
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

  // ============= EQUIPMENT WITH ELEMENTAL BRANDS =============
  
  'sword_fire_brand': {
    id: 'sword_fire_brand',
    name: 'Flame Brand Sword',
    description: 'A sword imbued with fire magic. Extra damage to Water/Undead types.',
    type: 'WEAPON',
    properties: {
      value: 800,
      stackable: false,
      consumable: false,
      effects: [
        { type: 'attack', value: 35 },
        { type: 'fire_brand', value: 1 },
        { type: 'elemental_damage', value: 15 }
      ]
    }
  },

  'sword_ice_brand': {
    id: 'sword_ice_brand',
    name: 'Frost Brand Sword',
    description: 'A sword imbued with ice magic. Extra damage to Fire types.',
    type: 'WEAPON',
    properties: {
      value: 850,
      stackable: false,
      consumable: false,
      effects: [
        { type: 'attack', value: 38 },
        { type: 'ice_brand', value: 1 },
        { type: 'elemental_damage', value: 15 }
      ]
    }
  },

  'sword_holy_brand': {
    id: 'sword_holy_brand',
    name: 'Holy Brand Sword',
    description: 'A blessed sword. Extra damage to Undead/Dark types.',
    type: 'WEAPON',
    properties: {
      value: 900,
      stackable: false,
      consumable: false,
      effects: [
        { type: 'attack', value: 40 },
        { type: 'holy_brand', value: 1 },
        { type: 'undead_damage', value: 25 }
      ]
    }
  },

  'bow_lightning': {
    id: 'bow_lightning',
    name: 'Thunder Bow',
    description: 'A bow that shoots lightning arrows. Extra damage to Water types.',
    type: 'WEAPON',
    properties: {
      value: 750,
      stackable: false,
      consumable: false,
      effects: [
        { type: 'attack', value: 32 },
        { type: 'lightning_brand', value: 1 },
        { type: 'range', value: 8 },
        { type: 'elemental_damage', value: 20 }
      ]
    }
  },

  'staff_lightning_cast': {
    id: 'staff_lightning_cast',
    name: 'Lightning Staff',
    description: 'A staff that casts Lightning when used as an item.',
    type: 'WEAPON',
    properties: {
      value: 1200,
      stackable: false,
      consumable: false,
      effects: [
        { type: 'attack', value: 20 },
        { type: 'magic_power', value: 45 },
        { type: 'cast_spell', value: 'thunder_1' }
      ]
    }
  },

  'gauntlet_fire_cast': {
    id: 'gauntlet_fire_cast',
    name: 'Flame Gauntlets',
    description: 'Gauntlets that cast Fire when used as an item.',
    type: 'WEAPON',
    properties: {
      value: 600,
      stackable: false,
      consumable: false,
      effects: [
        { type: 'attack', value: 15 },
        { type: 'defense', value: 8 },
        { type: 'cast_spell', value: 'fire_2' }
      ]
    }
  },

  // ============= ULTIMATE EQUIPMENT =============
  
  'prism_scarf': {
    id: 'prism_scarf',
    name: 'Prism Scarf',
    description: 'The ultimate helmet. Protects from ALL status ailments and elemental damage.',
    type: 'ARMOR',
    properties: {
      value: 5000,
      stackable: false,
      consumable: false,
      effects: [
        { type: 'defense', value: 20 },
        { type: 'magic_defense', value: 30 },
        { type: 'status_immune_all', value: 1 },
        { type: 'elemental_resist_all', value: 1 }
      ]
    }
  },

  'celestial_blade': {
    id: 'celestial_blade',
    name: 'Celestial Blade',
    description: 'The ultimate weapon. Can be equipped by any class. Found in the final dungeon.',
    type: 'WEAPON',
    properties: {
      value: 10000,
      stackable: false,
      consumable: false,
      effects: [
        { type: 'attack', value: 120 },
        { type: 'critical_chance', value: 25 },
        { type: 'all_elements', value: 1 },
        { type: 'holy_damage', value: 50 }
      ]
    }
  },

  'kingsblade': {
    id: 'kingsblade',
    name: 'Kingsblade',
    description: 'Ultimate sword for Knight/Paladin. Crafted by the Dwarf Smith using Star-Metal.',
    type: 'WEAPON',
    properties: {
      value: 8000,
      stackable: false,
      consumable: false,
      effects: [
        { type: 'attack', value: 95 },
        { type: 'holy_damage', value: 40 },
        { type: 'knight_only', value: 1 }
      ]
    }
  },

  // ============= DEFENSIVE ACCESSORIES =============
  
  'guardian_ring': {
    id: 'guardian_ring',
    name: 'Guardian Ring',
    description: 'Protects wearer from instant death attacks.',
    type: 'ARMOR',
    properties: {
      value: 3000,
      stackable: false,
      consumable: false,
      effects: [
        { type: 'death_immune', value: 1 },
        { type: 'defense', value: 5 }
      ]
    }
  },

  'protective_amulet': {
    id: 'protective_amulet',
    name: 'Protective Amulet',
    description: 'Increases all defenses significantly.',
    type: 'ARMOR',
    properties: {
      value: 2000,
      stackable: false,
      consumable: false,
      effects: [
        { type: 'defense', value: 15 },
        { type: 'magic_defense', value: 15 }
      ]
    }
  },

  'power_bracers': {
    id: 'power_bracers',
    name: 'Power Bracers',
    description: 'Greatly increases physical attack power.',
    type: 'ARMOR',
    properties: {
      value: 1500,
      stackable: false,
      consumable: false,
      effects: [
        { type: 'attack', value: 20 },
        { type: 'strength_boost', value: 10 }
      ]
    }
  },

  'mage_robe': {
    id: 'mage_robe',
    name: 'Archmage Robes',
    description: 'Robes that greatly amplify magical power.',
    type: 'ARMOR',
    properties: {
      value: 2500,
      stackable: false,
      consumable: false,
      effects: [
        { type: 'magic_power', value: 40 },
        { type: 'max_mana_boost', value: 50 },
        { type: 'magic_defense', value: 20 }
      ]
    }
  },

  // ============= HEALING AND STATUS ITEMS =============
  
  'heal_potion': {
    id: 'heal_potion',
    name: 'Heal Potion',
    description: 'Restore 30 HP.',
    type: 'CONSUMABLE',
    properties: {
      value: 50,
      stackable: true,
      consumable: true,
      effects: [
        { type: 'heal', value: 30 }
      ]
    }
  },

  'hi_potion': {
    id: 'hi_potion',
    name: 'Hi-Potion',
    description: 'Restores 150 HP.',
    type: 'CONSUMABLE',
    properties: {
      value: 200,
      stackable: true,
      consumable: true,
      effects: [
        { type: 'heal', value: 150 }
      ]
    }
  },

  'x_potion': {
    id: 'x_potion',
    name: 'X-Potion',
    description: 'Fully Restores HP.',
    type: 'CONSUMABLE',
    properties: {
      value: 800,
      stackable: true,
      consumable: true,
      effects: [
        { type: 'heal_full', value: 1 }
      ]
    }
  },

  'antidote': {
    id: 'antidote',
    name: 'Antidote',
    description: 'Cure Poison.',
    type: 'CONSUMABLE',
    properties: {
      value: 25,
      stackable: true,
      consumable: true,
      effects: [
        { type: 'cure_poison', value: 1 }
      ]
    }
  },

  'gold_needle': {
    id: 'gold_needle',
    name: 'Gold Needle',
    description: 'Cures Stone status.',
    type: 'CONSUMABLE',
    properties: {
      value: 150,
      stackable: true,
      consumable: true,
      effects: [
        { type: 'cure_stone', value: 1 }
      ]
    }
  },

  'echo_herbs': {
    id: 'echo_herbs',
    name: 'Echo Herbs',
    description: 'Cures Silence status.',
    type: 'CONSUMABLE',
    properties: {
      value: 40,
      stackable: true,
      consumable: true,
      effects: [
        { type: 'cure_silence', value: 1 }
      ]
    }
  },

  // ============= SAVE AND UTILITY ITEMS =============
  
  'bedroll': {
    id: 'bedroll',
    name: 'Bedroll',
    description: 'Saves game on World Map + Heals 30HP.',
    type: 'CONSUMABLE',
    properties: {
      value: 100,
      stackable: true,
      consumable: true,
      effects: [
        { type: 'save_world_map', value: 1 },
        { type: 'heal', value: 30 }
      ]
    }
  },

  'pavilion': {
    id: 'pavilion',
    name: 'Pavilion',
    description: 'Saves game on World Map + Full Heal + Revives Dead characters.',
    type: 'CONSUMABLE',
    properties: {
      value: 500,
      stackable: true,
      consumable: true,
      effects: [
        { type: 'save_world_map', value: 1 },
        { type: 'heal_full_party', value: 1 },
        { type: 'revive_party', value: 1 }
      ]
    }
  },

  'tent': {
    id: 'tent',
    name: 'Tent',
    description: 'Saves game on World Map + Heals 50HP to party.',
    type: 'CONSUMABLE',
    properties: {
      value: 200,
      stackable: true,
      consumable: true,
      effects: [
        { type: 'save_world_map', value: 1 },
        { type: 'heal_party', value: 50 }
      ]
    }
  },

  // ============= KEY ITEMS =============
  
  'crystal_eye': {
    id: 'crystal_eye',
    name: 'Crystal Eye',
    description: 'A mystical crystal eye. Opens sealed doors.',
    type: 'KEY',
    properties: {
      value: 0,
      stackable: false,
      consumable: false
    }
  },

  'royal_crown': {
    id: 'royal_crown',
    name: 'Royal Crown',
    description: 'The ancient crown of the fallen kingdom.',
    type: 'KEY',
    properties: {
      value: 0,
      stackable: false,
      consumable: false
    }
  },

  'star_metal': {
    id: 'star_metal',
    name: 'Star-Metal',
    description: 'Rare metal from the stars. Used for ultimate weapon crafting.',
    type: 'KEY',
    properties: {
      value: 0,
      stackable: false,
      consumable: false
    }
  },

  'wyvern_scale': {
    id: 'wyvern_scale',
    name: 'Wyvern Scale',
    description: 'A scale from the ancient wyvern. Used for class upgrades.',
    type: 'KEY',
    properties: {
      value: 0,
      stackable: false,
      consumable: false
    }
  },

  'translation_tablet': {
    id: 'translation_tablet',
    name: 'Translation Tablet',
    description: 'Ancient tablet that decodes the language of the Ancients.',
    type: 'KEY',
    properties: {
      value: 0,
      stackable: false,
      consumable: false
    }
  },

  'bards_harp': {
    id: 'bards_harp',
    name: 'Bard\'s Harp',
    description: 'A magical harp that can open time portals.',
    type: 'KEY',
    properties: {
      value: 0,
      stackable: false,
      consumable: false
    }
  },

  'robot_key': {
    id: 'robot_key',
    name: 'Robot Key',
    description: 'A keycard that operates ancient machinery.',
    type: 'KEY',
    properties: {
      value: 0,
      stackable: false,
      consumable: false
    }
  },

  'submarine_barrel': {
    id: 'submarine_barrel',
    name: 'Submarine Barrel',
    description: 'A barrel that can travel underwater.',
    type: 'KEY',
    properties: {
      value: 0,
      stackable: false,
      consumable: false
    }
  },

  'spyglass': {
    id: 'spyglass',
    name: 'Spyglass',
    description: 'Reveals hidden map completion percentage.',
    type: 'MISC',
    properties: {
      value: 100,
      stackable: true,
      consumable: false,
      effects: [
        { type: 'reveal_map_percentage', value: 1 }
      ]
    }
  },

  'blasting_powder': {
    id: 'blasting_powder',
    name: 'Blasting Powder',
    description: 'Powerful explosives for clearing obstacles.',
    type: 'MISC',
    properties: {
      value: 300,
      stackable: true,
      consumable: true,
      effects: [
        { type: 'clear_obstacle', value: 1 }
      ]
    }
  },

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
 * Character class definitions database
 * Contains all character classes with their stats progression and abilities
 */
export const CHARACTER_CLASSES_DATABASE: Record<CharacterClass, {
  name: string;
  description: string;
  baseStats: {
    strength: number;
    agility: number;
    intelligence: number;
    vitality: number;
    luck: number;
  };
  statGrowthPerLevel: {
    strength: number;
    agility: number;
    intelligence: number;
    vitality: number;
    luck: number;
  };
  healthPerVitality: number;
  manaPerIntelligence: number;
  equipmentRestrictions: {
    weaponTypes: string[];
    armorTypes: string[];
  };
  magicAffinity: number; // 0 = none, 1 = weak, 2 = moderate, 3 = strong
  upgradeClass?: CharacterClass;
  specialAbilities: string[];
}> = {
  [CharacterClass.WARRIOR]: {
    name: 'Warrior',
    description: 'High HP, Heavy Armor. Tank/Physical DPS specialist.',
    baseStats: {
      strength: 12,
      agility: 6,
      intelligence: 4,
      vitality: 14,
      luck: 5
    },
    statGrowthPerLevel: {
      strength: 1.2,
      agility: 0.6,
      intelligence: 0.3,
      vitality: 1.4,
      luck: 0.4
    },
    healthPerVitality: 8,
    manaPerIntelligence: 2,
    equipmentRestrictions: {
      weaponTypes: ['sword', 'axe', 'spear', 'hammer'],
      armorTypes: ['heavy', 'medium', 'light', 'cloth']
    },
    magicAffinity: 0,
    upgradeClass: CharacterClass.KNIGHT,
    specialAbilities: ['defend_stance', 'power_strike']
  },

  [CharacterClass.THIEF]: {
    name: 'Thief',
    description: 'High Agility, High Luck. Evasion Tank/Multi-hit DPS. Good for fleeing battles.',
    baseStats: {
      strength: 7,
      agility: 14,
      intelligence: 6,
      vitality: 8,
      luck: 12
    },
    statGrowthPerLevel: {
      strength: 0.7,
      agility: 1.4,
      intelligence: 0.5,
      vitality: 0.8,
      luck: 1.2
    },
    healthPerVitality: 6,
    manaPerIntelligence: 3,
    equipmentRestrictions: {
      weaponTypes: ['dagger', 'bow', 'sword_light'],
      armorTypes: ['light', 'cloth']
    },
    magicAffinity: 1,
    upgradeClass: CharacterClass.ASSASSIN,
    specialAbilities: ['steal', 'critical_strike', 'flee_boost']
  },

  [CharacterClass.MONK]: {
    name: 'Monk',
    description: 'Unarmed Specialist. Glass Cannon. Damage scales with level, not weapon.',
    baseStats: {
      strength: 10,
      agility: 8,
      intelligence: 5,
      vitality: 10,
      luck: 7
    },
    statGrowthPerLevel: {
      strength: 1.0,
      agility: 0.8,
      intelligence: 0.4,
      vitality: 1.0,
      luck: 0.7
    },
    healthPerVitality: 7,
    manaPerIntelligence: 2,
    equipmentRestrictions: {
      weaponTypes: ['unarmed', 'staff', 'claws'],
      armorTypes: ['cloth', 'light']
    },
    magicAffinity: 1,
    upgradeClass: CharacterClass.GRANDMASTER,
    specialAbilities: ['unarmed_mastery', 'focus_chi', 'counter_attack']
  },

  [CharacterClass.CRIMSON_SAGE]: {
    name: 'Crimson Sage',
    description: 'Jack-of-all-Trades. Can use swords and mid-level Dark/Holy magic.',
    baseStats: {
      strength: 8,
      agility: 7,
      intelligence: 10,
      vitality: 9,
      luck: 6
    },
    statGrowthPerLevel: {
      strength: 0.8,
      agility: 0.7,
      intelligence: 1.0,
      vitality: 0.9,
      luck: 0.6
    },
    healthPerVitality: 6,
    manaPerIntelligence: 4,
    equipmentRestrictions: {
      weaponTypes: ['sword', 'staff', 'dagger'],
      armorTypes: ['medium', 'light', 'cloth']
    },
    magicAffinity: 2,
    upgradeClass: CharacterClass.CRIMSON_WARLOCK,
    specialAbilities: ['hybrid_magic', 'sword_magic_combo']
  },

  [CharacterClass.CLERIC]: {
    name: 'Cleric',
    description: 'Healer. Low defense. Essential for Undead dungeons.',
    baseStats: {
      strength: 6,
      agility: 5,
      intelligence: 12,
      vitality: 9,
      luck: 8
    },
    statGrowthPerLevel: {
      strength: 0.5,
      agility: 0.5,
      intelligence: 1.3,
      vitality: 0.9,
      luck: 0.8
    },
    healthPerVitality: 6,
    manaPerIntelligence: 5,
    equipmentRestrictions: {
      weaponTypes: ['mace', 'staff', 'hammer'],
      armorTypes: ['medium', 'light', 'cloth']
    },
    magicAffinity: 3,
    upgradeClass: CharacterClass.HIGH_PRIEST,
    specialAbilities: ['holy_magic', 'turn_undead', 'group_heal']
  },

  [CharacterClass.SORCERER]: {
    name: 'Sorcerer',
    description: 'Nuker. AoE Damage/Debuffer. Very low HP.',
    baseStats: {
      strength: 4,
      agility: 6,
      intelligence: 16,
      vitality: 6,
      luck: 8
    },
    statGrowthPerLevel: {
      strength: 0.3,
      agility: 0.6,
      intelligence: 1.6,
      vitality: 0.5,
      luck: 0.8
    },
    healthPerVitality: 5,
    manaPerIntelligence: 6,
    equipmentRestrictions: {
      weaponTypes: ['staff', 'wand', 'tome'],
      armorTypes: ['cloth']
    },
    magicAffinity: 3,
    upgradeClass: CharacterClass.ARCHMAGE,
    specialAbilities: ['elemental_mastery', 'spell_amplify', 'aoe_specialist']
  },

  // Upgraded classes
  [CharacterClass.KNIGHT]: {
    name: 'Knight',
    description: 'Upgraded Warrior. Gains low-level Holy Magic and ability to equip legendary swords.',
    baseStats: {
      strength: 16,
      agility: 8,
      intelligence: 6,
      vitality: 18,
      luck: 6
    },
    statGrowthPerLevel: {
      strength: 1.5,
      agility: 0.7,
      intelligence: 0.5,
      vitality: 1.6,
      luck: 0.5
    },
    healthPerVitality: 9,
    manaPerIntelligence: 3,
    equipmentRestrictions: {
      weaponTypes: ['sword', 'axe', 'spear', 'hammer', 'legendary'],
      armorTypes: ['heavy', 'medium', 'light', 'cloth']
    },
    magicAffinity: 1,
    specialAbilities: ['defend_stance', 'power_strike', 'holy_light', 'equip_legendary']
  },

  [CharacterClass.ASSASSIN]: {
    name: 'Assassin',
    description: 'Upgraded Thief. Gains low-level Dark Magic and dual-wielding capability.',
    baseStats: {
      strength: 9,
      agility: 18,
      intelligence: 8,
      vitality: 10,
      luck: 15
    },
    statGrowthPerLevel: {
      strength: 0.8,
      agility: 1.8,
      intelligence: 0.7,
      vitality: 0.9,
      luck: 1.5
    },
    healthPerVitality: 7,
    manaPerIntelligence: 4,
    equipmentRestrictions: {
      weaponTypes: ['dagger', 'bow', 'sword_light', 'dual_wield'],
      armorTypes: ['light', 'cloth']
    },
    magicAffinity: 2,
    specialAbilities: ['steal', 'critical_strike', 'flee_boost', 'dual_wield', 'shadow_magic']
  },

  [CharacterClass.GRANDMASTER]: {
    name: 'Grandmaster',
    description: 'Upgraded Monk. Magic resistance increases; damage output becomes highest in game.',
    baseStats: {
      strength: 14,
      agility: 10,
      intelligence: 7,
      vitality: 14,
      luck: 9
    },
    statGrowthPerLevel: {
      strength: 1.3,
      agility: 1.0,
      intelligence: 0.6,
      vitality: 1.3,
      luck: 0.9
    },
    healthPerVitality: 8,
    manaPerIntelligence: 3,
    equipmentRestrictions: {
      weaponTypes: ['unarmed', 'staff', 'claws', 'legendary'],
      armorTypes: ['cloth', 'light', 'medium']
    },
    magicAffinity: 2,
    specialAbilities: ['unarmed_mastery', 'focus_chi', 'counter_attack', 'magic_resistance', 'ultimate_damage']
  },

  [CharacterClass.CRIMSON_WARLOCK]: {
    name: 'Crimson Warlock',
    description: 'Upgraded Crimson Sage. Can equip better gear and cast most magic (except highest tiers).',
    baseStats: {
      strength: 10,
      agility: 9,
      intelligence: 14,
      vitality: 12,
      luck: 8
    },
    statGrowthPerLevel: {
      strength: 1.0,
      agility: 0.8,
      intelligence: 1.4,
      vitality: 1.1,
      luck: 0.7
    },
    healthPerVitality: 7,
    manaPerIntelligence: 5,
    equipmentRestrictions: {
      weaponTypes: ['sword', 'staff', 'dagger', 'advanced'],
      armorTypes: ['heavy', 'medium', 'light', 'cloth']
    },
    magicAffinity: 3,
    specialAbilities: ['hybrid_magic', 'sword_magic_combo', 'advanced_spells', 'elemental_control']
  },

  [CharacterClass.HIGH_PRIEST]: {
    name: 'High Priest',
    description: 'Upgraded Cleric. Gains access to "Resurrect" and "Divine Judgment" spells.',
    baseStats: {
      strength: 8,
      agility: 6,
      intelligence: 16,
      vitality: 12,
      luck: 10
    },
    statGrowthPerLevel: {
      strength: 0.6,
      agility: 0.5,
      intelligence: 1.6,
      vitality: 1.1,
      luck: 1.0
    },
    healthPerVitality: 7,
    manaPerIntelligence: 6,
    equipmentRestrictions: {
      weaponTypes: ['mace', 'staff', 'hammer', 'holy'],
      armorTypes: ['heavy', 'medium', 'light', 'cloth']
    },
    magicAffinity: 4,
    specialAbilities: ['holy_magic', 'turn_undead', 'group_heal', 'resurrect', 'divine_judgment']
  },

  [CharacterClass.ARCHMAGE]: {
    name: 'Archmage',
    description: 'Upgraded Sorcerer. Gains access to "Supernova" and "Doom" spells.',
    baseStats: {
      strength: 5,
      agility: 7,
      intelligence: 20,
      vitality: 8,
      luck: 10
    },
    statGrowthPerLevel: {
      strength: 0.4,
      agility: 0.7,
      intelligence: 2.0,
      vitality: 0.7,
      luck: 1.0
    },
    healthPerVitality: 6,
    manaPerIntelligence: 7,
    equipmentRestrictions: {
      weaponTypes: ['staff', 'wand', 'tome', 'arcane'],
      armorTypes: ['cloth', 'enchanted']
    },
    magicAffinity: 4,
    specialAbilities: ['elemental_mastery', 'spell_amplify', 'aoe_specialist', 'supernova', 'doom', 'time_magic']
  }
};

/**
 * Spell definitions database
 * Contains all spells available in the game with their properties
 */
export const SPELLS_DATABASE: Record<string, SpellDef> = {
  // ============= LEVEL 1 SPELLS =============
  
  'fire_1': {
    id: 'fire_1',
    name: 'Fire',
    description: 'Deals minor fire damage to one enemy.',
    level: 1,
    school: 'FIRE',
    type: 'DAMAGE',
    target: 'ENEMY',
    mpCost: 4,
    power: 20,
    animation: {
      textureId: 'spell_fire',
      duration: 0.5,
      frames: [0, 1, 2, 1]
    },
    soundEffect: 'sfx_fire_1'
  },

  'water_1': {
    id: 'water_1',
    name: 'Water',
    description: 'Deals minor water damage to one enemy.',
    level: 1,
    school: 'WATER',
    type: 'DAMAGE',
    target: 'ENEMY',
    mpCost: 4,
    power: 20,
    animation: {
      textureId: 'spell_water',
      duration: 0.5,
      frames: [0, 1, 2, 1]
    },
    soundEffect: 'sfx_water_1'
  },

  'earth_1': {
    id: 'earth_1',
    name: 'Earth',
    description: 'Deals minor earth damage to one enemy.',
    level: 1,
    school: 'EARTH',
    type: 'DAMAGE',
    target: 'ENEMY',
    mpCost: 4,
    power: 20,
    animation: {
      textureId: 'spell_earth',
      duration: 0.5,
      frames: [0, 1, 2, 1]
    },
    soundEffect: 'sfx_earth_1'
  },

  'wind_1': {
    id: 'wind_1',
    name: 'Wind',
    description: 'Deals minor wind damage to one enemy.',
    level: 1,
    school: 'WIND',
    type: 'DAMAGE',
    target: 'ENEMY',
    mpCost: 4,
    power: 20,
    animation: {
      textureId: 'spell_wind',
      duration: 0.5,
      frames: [0, 1, 2, 1]
    },
    soundEffect: 'sfx_wind_1'
  },

  'heal_1': {
    id: 'heal_1',
    name: 'Heal',
    description: 'Restores minor HP to one ally.',
    level: 1,
    school: 'HOLY',
    type: 'HEAL',
    target: 'ALLY',
    mpCost: 4,
    power: 30,
    animation: {
      textureId: 'spell_heal',
      duration: 0.8,
      frames: [0, 1, 2, 3, 2, 1]
    },
    soundEffect: 'sfx_heal_1'
  },

  'cure_1': {
    id: 'cure_1',
    name: 'Cure',
    description: 'Cures poison and other minor status ailments.',
    level: 1,
    school: 'HOLY',
    type: 'SPECIAL',
    target: 'ALLY',
    mpCost: 3,
    power: 0,
    statusEffects: [StatusEffect.POISON],
    animation: {
      textureId: 'spell_cure',
      duration: 0.6,
      frames: [0, 1, 2, 1]
    },
    soundEffect: 'sfx_cure_1'
  },

  // ============= LEVEL 2 SPELLS =============
  
  'fire_2': {
    id: 'fire_2',
    name: 'Fira',
    description: 'Deals moderate fire damage to one enemy.',
    level: 2,
    school: 'FIRE',
    type: 'DAMAGE',
    target: 'ENEMY',
    mpCost: 8,
    power: 50,
    animation: {
      textureId: 'spell_fire',
      duration: 0.6,
      frames: [3, 4, 5, 6, 5, 4]
    },
    soundEffect: 'sfx_fire_2'
  },

  'water_2': {
    id: 'water_2',
    name: 'Watera',
    description: 'Deals moderate water damage to one enemy.',
    level: 2,
    school: 'WATER',
    type: 'DAMAGE',
    target: 'ENEMY',
    mpCost: 8,
    power: 50,
    animation: {
      textureId: 'spell_water',
      duration: 0.6,
      frames: [3, 4, 5, 6, 5, 4]
    },
    soundEffect: 'sfx_water_2'
  },

  'earth_2': {
    id: 'earth_2',
    name: 'Quake',
    description: 'Deals moderate earth damage to all enemies.',
    level: 2,
    school: 'EARTH',
    type: 'DAMAGE',
    target: 'ALL_ENEMIES',
    mpCost: 12,
    power: 35,
    animation: {
      textureId: 'spell_earth',
      duration: 1.0,
      frames: [3, 4, 5, 6, 7, 6, 5]
    },
    soundEffect: 'sfx_earth_2'
  },

  'wind_2': {
    id: 'wind_2',
    name: 'Aero',
    description: 'Deals moderate wind damage to all enemies.',
    level: 2,
    school: 'WIND',
    type: 'DAMAGE',
    target: 'ALL_ENEMIES',
    mpCost: 12,
    power: 35,
    animation: {
      textureId: 'spell_wind',
      duration: 1.0,
      frames: [3, 4, 5, 6, 7, 6, 5]
    },
    soundEffect: 'sfx_wind_2'
  },

  'heal_2': {
    id: 'heal_2',
    name: 'Cura',
    description: 'Restores moderate HP to one ally.',
    level: 2,
    school: 'HOLY',
    type: 'HEAL',
    target: 'ALLY',
    mpCost: 8,
    power: 75,
    animation: {
      textureId: 'spell_heal',
      duration: 1.0,
      frames: [4, 5, 6, 7, 6, 5]
    },
    soundEffect: 'sfx_heal_2'
  },

  'protect': {
    id: 'protect',
    name: 'Protect',
    description: 'Increases physical defense for one ally.',
    level: 2,
    school: 'HOLY',
    type: 'BUFF',
    target: 'ALLY',
    mpCost: 6,
    power: 0,
    statusEffects: [StatusEffect.PROTECT],
    animation: {
      textureId: 'spell_buff',
      duration: 0.8,
      frames: [0, 1, 2, 3, 2, 1]
    },
    soundEffect: 'sfx_buff'
  },

  'shell': {
    id: 'shell',
    name: 'Shell',
    description: 'Increases magic defense for one ally.',
    level: 2,
    school: 'HOLY',
    type: 'BUFF',
    target: 'ALLY',
    mpCost: 6,
    power: 0,
    statusEffects: [StatusEffect.SHELL],
    animation: {
      textureId: 'spell_buff',
      duration: 0.8,
      frames: [4, 5, 6, 7, 6, 5]
    },
    soundEffect: 'sfx_buff'
  },

  // ============= LEVEL 3 SPELLS =============
  
  'fire_3': {
    id: 'fire_3',
    name: 'Firaga',
    description: 'Deals heavy fire damage to all enemies.',
    level: 3,
    school: 'FIRE',
    type: 'DAMAGE',
    target: 'ALL_ENEMIES',
    mpCost: 20,
    power: 80,
    animation: {
      textureId: 'spell_fire',
      duration: 1.2,
      frames: [7, 8, 9, 10, 11, 10, 9]
    },
    soundEffect: 'sfx_fire_3'
  },

  'water_3': {
    id: 'water_3',
    name: 'Waterga',
    description: 'Deals heavy water damage to all enemies.',
    level: 3,
    school: 'WATER',
    type: 'DAMAGE',
    target: 'ALL_ENEMIES',
    mpCost: 20,
    power: 80,
    animation: {
      textureId: 'spell_water',
      duration: 1.2,
      frames: [7, 8, 9, 10, 11, 10, 9]
    },
    soundEffect: 'sfx_water_3'
  },

  'thunder_1': {
    id: 'thunder_1',
    name: 'Thunder',
    description: 'Deals minor lightning damage to one enemy.',
    level: 3,
    school: 'WIND',
    type: 'DAMAGE',
    target: 'ENEMY',
    mpCost: 10,
    power: 60,
    animation: {
      textureId: 'spell_thunder',
      duration: 0.4,
      frames: [0, 1, 2, 1]
    },
    soundEffect: 'sfx_thunder_1'
  },

  'heal_3': {
    id: 'heal_3',
    name: 'Curaga',
    description: 'Restores heavy HP to one ally.',
    level: 3,
    school: 'HOLY',
    type: 'HEAL',
    target: 'ALLY',
    mpCost: 16,
    power: 150,
    animation: {
      textureId: 'spell_heal',
      duration: 1.2,
      frames: [8, 9, 10, 11, 10, 9]
    },
    soundEffect: 'sfx_heal_3'
  },

  'raise': {
    id: 'raise',
    name: 'Raise',
    description: 'Revives one fallen ally with minimal HP.',
    level: 3,
    school: 'HOLY',
    type: 'SPECIAL',
    target: 'ALLY',
    mpCost: 24,
    power: 1,
    animation: {
      textureId: 'spell_revive',
      duration: 1.5,
      frames: [0, 1, 2, 3, 4, 5, 4, 3]
    },
    soundEffect: 'sfx_revive'
  },

  // ============= LEVEL 4 SPELLS =============
  
  'blizzard': {
    id: 'blizzard',
    name: 'Blizzard',
    description: 'Deals ice damage and may freeze enemies.',
    level: 4,
    school: 'WATER',
    type: 'DAMAGE',
    target: 'ALL_ENEMIES',
    mpCost: 28,
    power: 100,
    statusEffects: [StatusEffect.SLOW],
    animation: {
      textureId: 'spell_ice',
      duration: 1.5,
      frames: [0, 1, 2, 3, 4, 5, 4, 3]
    },
    soundEffect: 'sfx_blizzard'
  },

  'thunder_2': {
    id: 'thunder_2',
    name: 'Thundara',
    description: 'Deals moderate lightning damage to all enemies.',
    level: 4,
    school: 'WIND',
    type: 'DAMAGE',
    target: 'ALL_ENEMIES',
    mpCost: 24,
    power: 70,
    animation: {
      textureId: 'spell_thunder',
      duration: 1.0,
      frames: [3, 4, 5, 6, 5, 4]
    },
    soundEffect: 'sfx_thunder_2'
  },

  'holy_1': {
    id: 'holy_1',
    name: 'Holy',
    description: 'Deals holy damage to undead enemies.',
    level: 4,
    school: 'HOLY',
    type: 'DAMAGE',
    target: 'ALL_ENEMIES',
    mpCost: 32,
    power: 120,
    animation: {
      textureId: 'spell_holy',
      duration: 1.3,
      frames: [0, 1, 2, 3, 4, 3, 2]
    },
    soundEffect: 'sfx_holy'
  },

  'regen': {
    id: 'regen',
    name: 'Regen',
    description: 'Gradually restores HP over time.',
    level: 4,
    school: 'HOLY',
    type: 'BUFF',
    target: 'ALLY',
    mpCost: 20,
    power: 0,
    statusEffects: [StatusEffect.REGEN],
    animation: {
      textureId: 'spell_regen',
      duration: 0.8,
      frames: [0, 1, 2, 3, 2, 1]
    },
    soundEffect: 'sfx_regen'
  },

  // ============= LEVEL 5 SPELLS =============
  
  'flare': {
    id: 'flare',
    name: 'Flare',
    description: 'Deals non-elemental damage to one enemy.',
    level: 5,
    school: 'NEUTRAL',
    type: 'DAMAGE',
    target: 'ENEMY',
    mpCost: 40,
    power: 180,
    animation: {
      textureId: 'spell_flare',
      duration: 1.0,
      frames: [0, 1, 2, 3, 4, 3, 2]
    },
    soundEffect: 'sfx_flare'
  },

  'thunder_3': {
    id: 'thunder_3',
    name: 'Thundaga',
    description: 'Deals heavy lightning damage to all enemies.',
    level: 5,
    school: 'WIND',
    type: 'DAMAGE',
    target: 'ALL_ENEMIES',
    mpCost: 36,
    power: 110,
    animation: {
      textureId: 'spell_thunder',
      duration: 1.3,
      frames: [7, 8, 9, 10, 9, 8]
    },
    soundEffect: 'sfx_thunder_3'
  },

  'bio': {
    id: 'bio',
    name: 'Bio',
    description: 'Deals poison damage to all enemies.',
    level: 5,
    school: 'DARK',
    type: 'DAMAGE',
    target: 'ALL_ENEMIES',
    mpCost: 32,
    power: 90,
    statusEffects: [StatusEffect.POISON],
    animation: {
      textureId: 'spell_bio',
      duration: 1.2,
      frames: [0, 1, 2, 3, 2, 1]
    },
    soundEffect: 'sfx_bio'
  },

  'death': {
    id: 'death',
    name: 'Death',
    description: 'May instantly kill one enemy.',
    level: 5,
    school: 'DARK',
    type: 'SPECIAL',
    target: 'ENEMY',
    mpCost: 44,
    power: 0,
    statusEffects: [StatusEffect.STONE],
    animation: {
      textureId: 'spell_death',
      duration: 1.5,
      frames: [0, 1, 2, 3, 4, 5, 4, 3]
    },
    soundEffect: 'sfx_death'
  },

  // ============= LEVEL 6 SPELLS =============
  
  'quake_2': {
    id: 'quake_2',
    name: 'Quaga',
    description: 'Deals heavy earth damage to all enemies.',
    level: 6,
    school: 'EARTH',
    type: 'DAMAGE',
    target: 'ALL_ENEMIES',
    mpCost: 48,
    power: 140,
    animation: {
      textureId: 'spell_earth',
      duration: 1.6,
      frames: [8, 9, 10, 11, 12, 11, 10]
    },
    soundEffect: 'sfx_quake_2'
  },

  'tornado': {
    id: 'tornado',
    name: 'Tornado',
    description: 'Deals heavy wind damage and may remove enemies from battle.',
    level: 6,
    school: 'WIND',
    type: 'DAMAGE',
    target: 'ALL_ENEMIES',
    mpCost: 52,
    power: 130,
    animation: {
      textureId: 'spell_tornado',
      duration: 1.8,
      frames: [0, 1, 2, 3, 4, 5, 4, 3]
    },
    soundEffect: 'sfx_tornado'
  },

  'holy_2': {
    id: 'holy_2',
    name: 'Holyra',
    description: 'Deals massive holy damage to undead enemies.',
    level: 6,
    school: 'HOLY',
    type: 'DAMAGE',
    target: 'ALL_ENEMIES',
    mpCost: 56,
    power: 200,
    animation: {
      textureId: 'spell_holy',
      duration: 1.6,
      frames: [5, 6, 7, 8, 9, 8, 7]
    },
    soundEffect: 'sfx_holy_2'
  },

  'full_cure': {
    id: 'full_cure',
    name: 'Full Cure',
    description: 'Completely restores HP and cures all status ailments.',
    level: 6,
    school: 'HOLY',
    type: 'HEAL',
    target: 'ALLY',
    mpCost: 60,
    power: 999,
    animation: {
      textureId: 'spell_full_cure',
      duration: 2.0,
      frames: [0, 1, 2, 3, 4, 5, 6, 5, 4]
    },
    soundEffect: 'sfx_full_cure'
  },

  // ============= LEVEL 7 SPELLS =============
  
  'meteor': {
    id: 'meteor',
    name: 'Meteor',
    description: 'Calls meteors to damage all enemies.',
    level: 7,
    school: 'NEUTRAL',
    type: 'DAMAGE',
    target: 'ALL_ENEMIES',
    mpCost: 68,
    power: 180,
    animation: {
      textureId: 'spell_meteor',
      duration: 2.5,
      frames: [0, 1, 2, 3, 4, 5, 6, 7, 6, 5]
    },
    soundEffect: 'sfx_meteor'
  },

  'ultima': {
    id: 'ultima',
    name: 'Ultima',
    description: 'Deals massive non-elemental damage to all enemies.',
    level: 7,
    school: 'NEUTRAL',
    type: 'DAMAGE',
    target: 'ALL_ENEMIES',
    mpCost: 80,
    power: 220,
    animation: {
      textureId: 'spell_ultima',
      duration: 2.0,
      frames: [0, 1, 2, 3, 4, 5, 6, 5, 4]
    },
    soundEffect: 'sfx_ultima'
  },

  // ============= LEVEL 8 SPELLS =============
  
  'holy_3': {
    id: 'holy_3',
    name: 'Holyga',
    description: 'Ultimate holy magic damages all enemies.',
    level: 8,
    school: 'HOLY',
    type: 'DAMAGE',
    target: 'ALL_ENEMIES',
    mpCost: 88,
    power: 280,
    animation: {
      textureId: 'spell_holy',
      duration: 2.2,
      frames: [10, 11, 12, 13, 14, 13, 12]
    },
    soundEffect: 'sfx_holy_3'
  },

  // ============= LEVEL 9 SPELLS (ULTIMATE) =============
  
  'supernova': {
    id: 'supernova',
    name: 'Supernova',
    description: 'Archmage ultimate spell. Massive non-elemental damage.',
    level: 9,
    school: 'NEUTRAL',
    type: 'DAMAGE',
    target: 'ALL_ENEMIES',
    mpCost: 99,
    power: 350,
    animation: {
      textureId: 'spell_supernova',
      duration: 3.0,
      frames: [0, 1, 2, 3, 4, 5, 6, 7, 8, 7, 6]
    },
    soundEffect: 'sfx_supernova'
  },

  'doom': {
    id: 'doom',
    name: 'Doom',
    description: 'Archmage ultimate spell. Instant death countdown.',
    level: 9,
    school: 'DARK',
    type: 'SPECIAL',
    target: 'ENEMY',
    mpCost: 88,
    power: 0,
    statusEffects: [StatusEffect.STONE],
    animation: {
      textureId: 'spell_doom',
      duration: 2.5,
      frames: [0, 1, 2, 3, 4, 5, 6, 5, 4]
    },
    soundEffect: 'sfx_doom'
  },

  'divine_judgment': {
    id: 'divine_judgment',
    name: 'Divine Judgment',
    description: 'High Priest ultimate spell. Ultimate holy damage.',
    level: 9,
    school: 'HOLY',
    type: 'DAMAGE',
    target: 'ALL_ENEMIES',
    mpCost: 95,
    power: 320,
    animation: {
      textureId: 'spell_divine',
      duration: 2.8,
      frames: [0, 1, 2, 3, 4, 5, 6, 7, 6, 5]
    },
    soundEffect: 'sfx_divine_judgment'
  }
};

/**
 * Enemy definitions database
 * Contains all enemy types with their stats and behaviors
 */
export const ENEMIES_DATABASE: Record<string, EnemyDef> = {
  // ============= GOBLINS & IMPS =============
  
  'goblin': {
    id: 'goblin',
    name: 'Goblin',
    stats: {
      health: 25,
      attack: 12,
      defense: 4,
      speed: 3
    },
    sprite: {
      textureId: 'goblin',
      width: 16,
      height: 24,
      animations: HERO_ANIMATIONS
    },
    behavior: {
      aggression: 2,
      patrolRadius: 4,
      detectionRange: 5
    }
  },

  'goblin_chief': {
    id: 'goblin_chief',
    name: 'Goblin Chief',
    stats: {
      health: 40,
      attack: 18,
      defense: 8,
      speed: 3
    },
    sprite: {
      textureId: 'goblin_chief',
      width: 18,
      height: 26,
      animations: HERO_ANIMATIONS
    },
    behavior: {
      aggression: 3,
      patrolRadius: 6,
      detectionRange: 7
    }
  },

  'imp': {
    id: 'imp',
    name: 'Imp',
    stats: {
      health: 20,
      attack: 15,
      defense: 2,
      speed: 5
    },
    sprite: {
      textureId: 'imp',
      width: 14,
      height: 20,
      animations: HERO_ANIMATIONS
    },
    behavior: {
      aggression: 3,
      patrolRadius: 5,
      detectionRange: 6
    }
  },

  // ============= SLIME FAMILY =============
  
  'slime_green': {
    id: 'slime_green',
    name: 'Green Slime',
    stats: {
      health: 30,
      attack: 8,
      defense: 8, // High physical defense
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
      defense: 12,
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
      defense: 16,
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
      defense: 25,
      speed: 2
    },
    sprite: {
      textureId: 'slime_king',
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

  // ============= BEAST FAMILY =============
  
  'warg': {
    id: 'warg',
    name: 'Warg',
    stats: {
      health: 50,
      attack: 22,
      defense: 8,
      speed: 6
    },
    sprite: {
      textureId: 'warg',
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

  'winter_wolf': {
    id: 'winter_wolf',
    name: 'Winter Wolf',
    stats: {
      health: 65,
      attack: 28,
      defense: 10,
      speed: 7
    },
    sprite: {
      textureId: 'winter_wolf',
      width: 26,
      height: 18,
      animations: HERO_ANIMATIONS
    },
    behavior: {
      aggression: 4,
      patrolRadius: 8,
      detectionRange: 10
    }
  },

  'hell_hound': {
    id: 'hell_hound',
    name: 'Hell Hound',
    stats: {
      health: 80,
      attack: 35,
      defense: 12,
      speed: 8
    },
    sprite: {
      textureId: 'hell_hound',
      width: 28,
      height: 20,
      animations: HERO_ANIMATIONS
    },
    behavior: {
      aggression: 5,
      patrolRadius: 10,
      detectionRange: 12
    }
  },

  // ============= OGRE & GIANT FAMILY =============
  
  'ogre': {
    id: 'ogre',
    name: 'Ogre',
    stats: {
      health: 120,
      attack: 30,
      defense: 15,
      speed: 2
    },
    sprite: {
      textureId: 'ogre',
      width: 32,
      height: 40,
      animations: HERO_ANIMATIONS
    },
    behavior: {
      aggression: 3,
      patrolRadius: 6,
      detectionRange: 8
    }
  },

  'ogre_chief': {
    id: 'ogre_chief',
    name: 'Ogre Chief',
    stats: {
      health: 150,
      attack: 35,
      defense: 18,
      speed: 2
    },
    sprite: {
      textureId: 'ogre_chief',
      width: 34,
      height: 42,
      animations: HERO_ANIMATIONS
    },
    behavior: {
      aggression: 4,
      patrolRadius: 7,
      detectionRange: 9
    }
  },

  'troll': {
    id: 'troll',
    name: 'Troll',
    stats: {
      health: 180,
      attack: 32,
      defense: 20,
      speed: 3
    },
    sprite: {
      textureId: 'troll',
      width: 36,
      height: 44,
      animations: HERO_ANIMATIONS
    },
    behavior: {
      aggression: 4,
      patrolRadius: 7,
      detectionRange: 9
    }
  },

  'titan': {
    id: 'titan',
    name: 'Titan',
    stats: {
      health: 500,
      attack: 60,
      defense: 35,
      speed: 4
    },
    sprite: {
      textureId: 'titan',
      width: 48,
      height: 56,
      animations: HERO_ANIMATIONS
    },
    behavior: {
      aggression: 5,
      patrolRadius: 10,
      detectionRange: 15
    }
  },

  // ============= EYE FAMILY =============
  
  'watcher': {
    id: 'watcher',
    name: 'Watcher',
    stats: {
      health: 40,
      attack: 20,
      defense: 6,
      speed: 4
    },
    sprite: {
      textureId: 'watcher',
      width: 20,
      height: 20,
      animations: HERO_ANIMATIONS
    },
    behavior: {
      aggression: 2,
      patrolRadius: 5,
      detectionRange: 8
    }
  },

  'spectator': {
    id: 'spectator',
    name: 'Spectator',
    stats: {
      health: 55,
      attack: 25,
      defense: 8,
      speed: 6
    },
    sprite: {
      textureId: 'spectator',
      width: 22,
      height: 22,
      animations: HERO_ANIMATIONS
    },
    behavior: {
      aggression: 3,
      patrolRadius: 6,
      detectionRange: 10
    }
  },

  'doom_gazer': {
    id: 'doom_gazer',
    name: 'Doom Gazer',
    stats: {
      health: 120,
      attack: 45,
      defense: 15,
      speed: 5
    },
    sprite: {
      textureId: 'doom_gazer',
      width: 28,
      height: 28,
      animations: HERO_ANIMATIONS
    },
    behavior: {
      aggression: 4,
      patrolRadius: 8,
      detectionRange: 12
    }
  },

  // ============= UNDEAD HORDES =============
  
  'skeleton': {
    id: 'skeleton',
    name: 'Skeleton',
    stats: {
      health: 45,
      attack: 18,
      defense: 10,
      speed: 3
    },
    sprite: {
      textureId: 'skeleton',
      width: 16,
      height: 32,
      animations: HERO_ANIMATIONS
    },
    behavior: {
      aggression: 3,
      patrolRadius: 5,
      detectionRange: 7
    }
  },

  'zombie': {
    id: 'zombie',
    name: 'Zombie',
    stats: {
      health: 60,
      attack: 15,
      defense: 12,
      speed: 1
    },
    sprite: {
      textureId: 'zombie',
      width: 18,
      height: 34,
      animations: HERO_ANIMATIONS
    },
    behavior: {
      aggression: 2,
      patrolRadius: 4,
      detectionRange: 6
    }
  },

  'ghoul': {
    id: 'ghoul',
    name: 'Ghoul',
    stats: {
      health: 70,
      attack: 25,
      defense: 14,
      speed: 4
    },
    sprite: {
      textureId: 'ghoul',
      width: 20,
      height: 36,
      animations: HERO_ANIMATIONS
    },
    behavior: {
      aggression: 4,
      patrolRadius: 6,
      detectionRange: 8
    }
  },

  'wraith': {
    id: 'wraith',
    name: 'Wraith',
    stats: {
      health: 85,
      attack: 30,
      defense: 8,
      speed: 5
    },
    sprite: {
      textureId: 'wraith',
      width: 22,
      height: 38,
      animations: HERO_ANIMATIONS
    },
    behavior: {
      aggression: 3,
      patrolRadius: 7,
      detectionRange: 10
    }
  },

  'specter': {
    id: 'specter',
    name: 'Specter',
    stats: {
      health: 100,
      attack: 35,
      defense: 10,
      speed: 6
    },
    sprite: {
      textureId: 'specter',
      width: 24,
      height: 40,
      animations: HERO_ANIMATIONS
    },
    behavior: {
      aggression: 4,
      patrolRadius: 8,
      detectionRange: 12
    }
  },

  'vampire': {
    id: 'vampire',
    name: 'Vampire',
    stats: {
      health: 180,
      attack: 40,
      defense: 20,
      speed: 7
    },
    sprite: {
      textureId: 'vampire',
      width: 26,
      height: 42,
      animations: HERO_ANIMATIONS
    },
    behavior: {
      aggression: 5,
      patrolRadius: 10,
      detectionRange: 15
    }
  },

  // ============= DRAGON FAMILY =============
  
  'dragon_young': {
    id: 'dragon_young',
    name: 'Young Dragon',
    stats: {
      health: 400,
      attack: 55,
      defense: 30,
      speed: 5
    },
    sprite: {
      textureId: 'dragon_young',
      width: 64,
      height: 48,
      animations: HERO_ANIMATIONS
    },
    behavior: {
      aggression: 4,
      patrolRadius: 10,
      detectionRange: 15
    }
  },

  'dragon_ancient': {
    id: 'dragon_ancient',
    name: 'Ancient Dragon',
    stats: {
      health: 800,
      attack: 80,
      defense: 45,
      speed: 6
    },
    sprite: {
      textureId: 'dragon_ancient',
      width: 80,
      height: 60,
      animations: HERO_ANIMATIONS
    },
    behavior: {
      aggression: 5,
      patrolRadius: 15,
      detectionRange: 20
    }
  },

  // ============= CONSTRUCT FAMILY =============
  
  'clay_golem': {
    id: 'clay_golem',
    name: 'Clay Golem',
    stats: {
      health: 200,
      attack: 35,
      defense: 25,
      speed: 1
    },
    sprite: {
      textureId: 'clay_golem',
      width: 32,
      height: 40,
      animations: HERO_ANIMATIONS
    },
    behavior: {
      aggression: 2,
      patrolRadius: 4,
      detectionRange: 6
    }
  },

  'stone_golem': {
    id: 'stone_golem',
    name: 'Stone Golem',
    stats: {
      health: 300,
      attack: 45,
      defense: 40,
      speed: 1
    },
    sprite: {
      textureId: 'stone_golem',
      width: 36,
      height: 44,
      animations: HERO_ANIMATIONS
    },
    behavior: {
      aggression: 2,
      patrolRadius: 4,
      detectionRange: 6
    }
  },

  'iron_giant': {
    id: 'iron_giant',
    name: 'Iron Giant',
    stats: {
      health: 600,
      attack: 70,
      defense: 50,
      speed: 2
    },
    sprite: {
      textureId: 'iron_giant',
      width: 48,
      height: 56,
      animations: HERO_ANIMATIONS
    },
    behavior: {
      aggression: 3,
      patrolRadius: 6,
      detectionRange: 10
    }
  },

  // ============= RIVER & SEA MONSTERS =============
  
  'merfolk': {
    id: 'merfolk',
    name: 'Merfolk',
    stats: {
      health: 55,
      attack: 22,
      defense: 12,
      speed: 4
    },
    sprite: {
      textureId: 'merfolk',
      width: 20,
      height: 32,
      animations: HERO_ANIMATIONS
    },
    behavior: {
      aggression: 3,
      patrolRadius: 6,
      detectionRange: 8
    }
  },

  'merfolk_chief': {
    id: 'merfolk_chief',
    name: 'Merfolk Chief',
    stats: {
      health: 75,
      attack: 30,
      defense: 16,
      speed: 4
    },
    sprite: {
      textureId: 'merfolk_chief',
      width: 22,
      height: 34,
      animations: HERO_ANIMATIONS
    },
    behavior: {
      aggression: 4,
      patrolRadius: 7,
      detectionRange: 9
    }
  },

  'hydra': {
    id: 'hydra',
    name: 'Hydra',
    stats: {
      health: 250,
      attack: 40,
      defense: 20,
      speed: 3
    },
    sprite: {
      textureId: 'hydra',
      width: 40,
      height: 32,
      animations: HERO_ANIMATIONS
    },
    behavior: {
      aggression: 4,
      patrolRadius: 8,
      detectionRange: 12
    }
  },

  'sea_serpent': {
    id: 'sea_serpent',
    name: 'Sea Serpent',
    stats: {
      health: 450,
      attack: 65,
      defense: 35,
      speed: 5
    },
    sprite: {
      textureId: 'sea_serpent',
      width: 64,
      height: 40,
      animations: HERO_ANIMATIONS
    },
    behavior: {
      aggression: 5,
      patrolRadius: 12,
      detectionRange: 18
    }
  },

  // ============= SORCERERS =============
  
  'squid_sorcerer': {
    id: 'squid_sorcerer',
    name: 'Squid Sorcerer',
    stats: {
      health: 60,
      attack: 25,
      defense: 8,
      speed: 3
    },
    sprite: {
      textureId: 'squid_sorcerer',
      width: 24,
      height: 32,
      animations: HERO_ANIMATIONS
    },
    behavior: {
      aggression: 3,
      patrolRadius: 5,
      detectionRange: 10
    }
  },

  'brain_flayer': {
    id: 'brain_flayer',
    name: 'Brain Flayer',
    stats: {
      health: 80,
      attack: 35,
      defense: 10,
      speed: 4
    },
    sprite: {
      textureId: 'brain_flayer',
      width: 28,
      height: 36,
      animations: HERO_ANIMATIONS
    },
    behavior: {
      aggression: 4,
      patrolRadius: 6,
      detectionRange: 12
    }
  },

  'dark_wizard': {
    id: 'dark_wizard',
    name: 'Dark Wizard',
    stats: {
      health: 100,
      attack: 50,
      defense: 12,
      speed: 3
    },
    sprite: {
      textureId: 'dark_wizard',
      width: 20,
      height: 36,
      animations: HERO_ANIMATIONS
    },
    behavior: {
      aggression: 4,
      patrolRadius: 6,
      detectionRange: 15
    }
  },

  // ============= BOSSES =============
  
  // Tier 1: Plot Gatekeepers
  'lord_vane': {
    id: 'lord_vane',
    name: 'Lord Vane',
    stats: {
      health: 300,
      attack: 45,
      defense: 20,
      speed: 4
    },
    sprite: {
      textureId: 'lord_vane',
      width: 32,
      height: 48,
      animations: HERO_ANIMATIONS
    },
    behavior: {
      aggression: 5,
      patrolRadius: 8,
      detectionRange: 12
    }
  },

  'captain_dread': {
    id: 'captain_dread',
    name: 'Captain Dread',
    stats: {
      health: 350,
      attack: 50,
      defense: 22,
      speed: 5
    },
    sprite: {
      textureId: 'captain_dread',
      width: 28,
      height: 44,
      animations: HERO_ANIMATIONS
    },
    behavior: {
      aggression: 5,
      patrolRadius: 10,
      detectionRange: 14
    }
  },

  'dark_elf_king': {
    id: 'dark_elf_king',
    name: 'Dark Elf King',
    stats: {
      health: 400,
      attack: 55,
      defense: 25,
      speed: 7
    },
    sprite: {
      textureId: 'dark_elf_king',
      width: 24,
      height: 40,
      animations: HERO_ANIMATIONS
    },
    behavior: {
      aggression: 5,
      patrolRadius: 10,
      detectionRange: 16
    }
  },

  // Tier 2: Elemental Tyrants
  'rot_king': {
    id: 'rot_king',
    name: 'Rot-King',
    stats: {
      health: 800,
      attack: 75,
      defense: 40,
      speed: 4
    },
    sprite: {
      textureId: 'rot_king',
      width: 40,
      height: 56,
      animations: HERO_ANIMATIONS
    },
    behavior: {
      aggression: 5,
      patrolRadius: 12,
      detectionRange: 18
    }
  },

  'serpentina': {
    id: 'serpentina',
    name: 'Serpentina',
    stats: {
      health: 750,
      attack: 85,
      defense: 35,
      speed: 6
    },
    sprite: {
      textureId: 'serpentina',
      width: 48,
      height: 52,
      animations: HERO_ANIMATIONS
    },
    behavior: {
      aggression: 5,
      patrolRadius: 12,
      detectionRange: 18
    }
  },

  'abyssal_lord': {
    id: 'abyssal_lord',
    name: 'Abyssal Lord',
    stats: {
      health: 900,
      attack: 80,
      defense: 45,
      speed: 5
    },
    sprite: {
      textureId: 'abyssal_lord',
      width: 56,
      height: 60,
      animations: HERO_ANIMATIONS
    },
    behavior: {
      aggression: 5,
      patrolRadius: 15,
      detectionRange: 20
    }
  },

  'storm_hydra': {
    id: 'storm_hydra',
    name: 'Storm Hydra',
    stats: {
      health: 850,
      attack: 90,
      defense: 38,
      speed: 7
    },
    sprite: {
      textureId: 'storm_hydra',
      width: 64,
      height: 48,
      animations: HERO_ANIMATIONS
    },
    behavior: {
      aggression: 5,
      patrolRadius: 15,
      detectionRange: 20
    }
  },

  // Tier 3: Optional & Super Bosses
  'guardian_mech': {
    id: 'guardian_mech',
    name: 'Guardian',
    stats: {
      health: 1200,
      attack: 100,
      defense: 60,
      speed: 3
    },
    sprite: {
      textureId: 'guardian_mech',
      width: 48,
      height: 64,
      animations: HERO_ANIMATIONS
    },
    behavior: {
      aggression: 5,
      patrolRadius: 10,
      detectionRange: 20
    }
  },

  'omega_drone': {
    id: 'omega_drone',
    name: 'Omega Drone',
    stats: {
      health: 1500,
      attack: 120,
      defense: 55,
      speed: 6
    },
    sprite: {
      textureId: 'omega_drone',
      width: 52,
      height: 58,
      animations: HERO_ANIMATIONS
    },
    behavior: {
      aggression: 5,
      patrolRadius: 12,
      detectionRange: 25
    }
  },

  'cyclone_master': {
    id: 'cyclone_master',
    name: 'Cyclone Master',
    stats: {
      health: 700,
      attack: 70,
      defense: 32,
      speed: 8
    },
    sprite: {
      textureId: 'cyclone_master',
      width: 36,
      height: 44,
      animations: HERO_ANIMATIONS
    },
    behavior: {
      aggression: 4,
      patrolRadius: 12,
      detectionRange: 16
    }
  },

  // Final Boss: Entropy
  'entropy': {
    id: 'entropy',
    name: 'Entropy',
    stats: {
      health: 2000,
      attack: 150,
      defense: 80,
      speed: 8
    },
    sprite: {
      textureId: 'entropy',
      width: 80,
      height: 80,
      animations: HERO_ANIMATIONS
    },
    behavior: {
      aggression: 5,
      patrolRadius: 20,
      detectionRange: 30
    }
  }
};

/**
 * World locations database
 * Contains all locations with their properties and encounters
 */
export const WORLD_LOCATIONS_DATABASE: Record<string, {
  name: string;
  type: 'TOWN' | 'DUNGEON' | 'OVERWORLD';
  description: string;
  musicTrack: string;
  battleBackground: string;
  encounters: string[];
  shopItems?: string[];
  innAvailable?: boolean;
  specialFeatures?: string[];
  connections: string[];
  coordinates: { x: number; y: number };
  movementModes?: ('foot' | 'boat' | 'ship' | 'skyship')[];
  requirements?: string[];
}> = {
  // ============= TOWNS =============
  
  'aethelgard': {
    name: 'Aethelgard',
    type: 'TOWN',
    description: 'The Walled City and Starting Kingdom. Contains the Regent\'s Castle and basic shops for starter gear.',
    musicTrack: 'aethelgard_theme',
    battleBackground: 'plains_battle',
    encounters: [], // No encounters in towns
    shopItems: ['sword_iron', 'cloth_tunic', 'leather_armor', 'heal_potion', 'antidote'],
    innAvailable: true,
    specialFeatures: ['regent_castle', 'starter_shops'],
    connections: ['sanctum_of_discord', 'overworld_central'],
    coordinates: { x: 160, y: 120 },
    movementModes: ['foot']
  },

  'corsairs_cove': {
    name: 'Corsair\'s Cove',
    type: 'TOWN',
    description: 'The Port Town. No walls, pirate/ocean theme. Players must defeat pirates to get the Ship. Sells Level 2 Spells.',
    musicTrack: 'corsairs_cove_theme',
    battleBackground: 'port_battle',
    encounters: [],
    shopItems: ['sword_steel', 'bow_hunting', 'staff_wizard', 'hi_potion', 'fire_1', 'water_1', 'earth_1', 'wind_1'],
    innAvailable: true,
    specialFeatures: ['pirate_boss', 'spell_shop_level_2'],
    connections: ['overworld_south', 'ship_routes'],
    coordinates: { x: 80, y: 200 },
    movementModes: ['foot', 'ship']
  },

  'western_keep': {
    name: 'Western Keep',
    type: 'TOWN',
    description: 'A fortress occupied by the Dark Elf King. Location of the Crystal Eye.',
    musicTrack: 'western_keep_theme',
    battleBackground: 'castle_battle',
    encounters: [],
    shopItems: [],
    innAvailable: false,
    specialFeatures: ['dark_elf_king_boss', 'crystal_eye'],
    connections: ['overworld_west'],
    coordinates: { x: 40, y: 80 },
    movementModes: ['foot']
  },

  'sylvanis': {
    name: 'Sylvanis',
    type: 'TOWN',
    description: 'Home of the Elves. A forest city that sells Level 3 & 4 Spells. High prices require grinding.',
    musicTrack: 'sylvanis_theme',
    battleBackground: 'forest_battle',
    encounters: [],
    shopItems: ['sword_mythril', 'robe_mage', 'fire_2', 'water_2', 'earth_2', 'wind_2', 'thunder_1', 'heal_2', 'protect', 'shell'],
    innAvailable: true,
    specialFeatures: ['elf_prince_quest', 'expensive_shops'],
    connections: ['overworld_east'],
    coordinates: { x: 280, y: 100 },
    movementModes: ['foot']
  },

  'ironforge_peak': {
    name: 'Ironforge Peak',
    type: 'TOWN',
    description: 'Dwarf mine and hub. Requires Blasting Powder to open the canal to the outer ocean.',
    musicTrack: 'ironforge_theme',
    battleBackground: 'mountain_battle',
    encounters: [],
    shopItems: ['plate_armor', 'shield_iron', 'hammer_weapons', 'power_bracers'],
    innAvailable: true,
    specialFeatures: ['dwarf_smith', 'canal_locked'],
    connections: ['overworld_north'],
    coordinates: { x: 200, y: 40 },
    movementModes: ['foot']
  },

  'rotmoor': {
    name: 'Rotmoor',
    type: 'TOWN',
    description: 'A rotting town destroyed by vampires with a graveyard aesthetic. Sells Level 5 Spells and heavy iron armor.',
    musicTrack: 'rotmoor_theme',
    battleBackground: 'graveyard_battle',
    encounters: [],
    shopItems: ['chain_mail', 'heavy_armor', 'fire_3', 'water_3', 'thunder_2', 'flare', 'bio'],
    innAvailable: true,
    specialFeatures: ['vampire_inhabitants', 'dark_shops'],
    connections: ['overworld_swamp'],
    coordinates: { x: 320, y: 180 },
    movementModes: ['foot']
  },

  'moonwater_grove': {
    name: 'Moonwater Grove',
    type: 'TOWN',
    description: 'Located in a crescent forest. Home of the Sages. Sells Level 6 Spells. Heroes receive the Small Boat here.',
    musicTrack: 'moonwater_theme',
    battleBackground: 'sacred_grove_battle',
    encounters: [],
    shopItems: ['holy_1', 'regen', 'blizzard', 'tornado', 'full_cure'],
    innAvailable: true,
    specialFeatures: ['sages_quests', 'small_boat_reward'],
    connections: ['overwater_central'],
    coordinates: { x: 180, y: 160 },
    movementModes: ['foot', 'boat']
  },

  'highpeak': {
    name: 'Highpeak',
    type: 'TOWN',
    description: 'Mountain village isolated by rocks. Only accessible via Sky-Ship. Sells "Guardian Rings" (Instant death protection).',
    musicTrack: 'highpeak_theme',
    battleBackground: 'mountain_peak_battle',
    encounters: [],
    shopItems: ['guardian_ring', 'protective_amulet', 'mage_robe'],
    innAvailable: true,
    specialFeatures: ['skyship_only_access', 'guardian_rings'],
    connections: ['sky_routes'],
    coordinates: { x: 240, y: 60 },
    movementModes: ['skyship']
  },

  'riverwatch': {
    name: 'Riverwatch',
    type: 'TOWN',
    description: 'River village. Must take a submarine barrel from here to reach the Abyssal Temple.',
    musicTrack: 'riverwatch_theme',
    battleBackground: 'river_village_battle',
    encounters: [],
    shopItems: ['tent', 'bedroll', 'antidote', 'echo_herbs'],
    innAvailable: true,
    specialFeatures: ['submarine_barrel_access'],
    connections: ['overwater_east'],
    coordinates: { x: 300, y: 140 },
    movementModes: ['foot', 'boat']
  },

  'celestia': {
    name: 'Celestia',
    type: 'TOWN',
    description: 'The City of Ancients. Located on a small map edge. Only accessible by landing the Sky-Ship far away and walking. Civilians speak "Ancient Tongue" until the Translation Tablet is found. Sells Level 8 (Ultimate) Magic.',
    musicTrack: 'celestia_theme',
    battleBackground: 'ancient_city_battle',
    encounters: [],
    shopItems: ['holy_3', 'supernova', 'doom', 'divine_judgment', 'prism_scarf'],
    innAvailable: true,
    specialFeatures: ['ancient_language', 'ultimate_magic', 'translation_required'],
    connections: ['hidden_path'],
    coordinates: { x: 380, y: 20 },
    movementModes: ['skyship'],
    requirements: ['translation_tablet']
  },

  // ============= DUNGEONS =============
  
  'sanctum_of_discord': {
    name: 'Sanctum of Discord',
    type: 'DUNGEON',
    description: 'A short, linear dungeon near Aethelgard inhabited by bats and Goblins.',
    musicTrack: 'dungeon_basic',
    battleBackground: 'ruins_battle',
    encounters: ['goblin', 'imp', 'bat'],
    specialFeatures: ['linear_layout', 'tutorial_dungeon'],
    connections: ['aethelgard'],
    coordinates: { x: 140, y: 100 },
    movementModes: ['foot']
  },

  'bog_crypt': {
    name: 'Bog Crypt',
    type: 'DUNGEON',
    description: 'A dangerous 3-floor basement dungeon located in the marshlands. Contains the Royal Crown.',
    musicTrack: 'bog_crypt_theme',
    battleBackground: 'crypt_battle',
    encounters: ['zombie', 'skeleton', 'ghoul', 'wraith'],
    specialFeatures: ['three_basements', 'poison_enemies', 'maze_layout'],
    connections: ['overworld_swamp'],
    coordinates: { x: 340, y: 200 },
    movementModes: ['foot']
  },

  'cavern_of_terra': {
    name: 'Cavern of Terra',
    type: 'DUNGEON',
    description: 'A dungeon deep within the earth, home of the Rot-King.',
    musicTrack: 'earth_cavern_theme',
    battleBackground: 'cave_battle',
    encounters: ['ogre', 'troll', 'titan', 'slime_red'],
    specialFeatures: ['hall_of_giants', 'high_encounter_rate'],
    connections: ['overworld_deep_earth'],
    coordinates: { x: 100, y: 60 },
    movementModes: ['foot']
  },

  'glacial_rift': {
    name: 'Glacial Rift',
    type: 'DUNGEON',
    description: 'An ice dungeon featuring damage floors and pitfalls. Guards the Gravity Crystal.',
    musicTrack: 'glacial_rift_theme',
    battleBackground: 'ice_cave_battle',
    encounters: ['winter_wolf', 'ice_elemental', 'clay_golem'],
    specialFeatures: ['damage_floors', 'pitfalls', 'slippery_ice'],
    connections: ['overworld_arctic'],
    coordinates: { x: 50, y: 20 },
    movementModes: ['foot']
  },

  'cascade_grotto': {
    name: 'The Cascade Grotto',
    type: 'DUNGEON',
    description: 'A maze of rivers inside a cave requiring the Small Boat and a Robot key item to enter.',
    musicTrack: 'water_cave_theme',
    battleBackground: 'underwater_cave_battle',
    encounters: ['merfolk', 'hydra', 'water_elemental'],
    specialFeatures: ['river_maze', 'boat_required', 'robot_key_required'],
    connections: ['overwater_hidden'],
    coordinates: { x: 220, y: 180 },
    movementModes: ['boat'],
    requirements: ['small_boat', 'robot_key']
  },

  'volcano_mt_pyre': {
    name: 'Mt. Pyre',
    type: 'DUNGEON',
    description: 'A lava-filled dungeon featuring damage floors. Home of Serpentina.',
    musicTrack: 'volcano_theme',
    battleBackground: 'lava_cave_battle',
    encounters: ['hell_hound', 'fire_elemental', 'lava_golem'],
    specialFeatures: ['lava_damage_floors', 'heat_damage'],
    connections: ['overworld_volcano'],
    coordinates: { x: 360, y: 120 },
    movementModes: ['foot']
  },

  'abyssal_temple': {
    name: 'Abyssal Temple',
    type: 'DUNGEON',
    description: 'An underwater dungeon reachable via submarine barrel from Riverwatch. Home of the Abyssal Lord.',
    musicTrack: 'abyssal_theme',
    battleBackground: 'underwater_temple_battle',
    encounters: ['sea_serpent', 'merfolk_chief', 'abyssal_horror'],
    specialFeatures: ['underwater_environment', 'translation_tablet_reward'],
    connections: ['underwater_routes'],
    coordinates: { x: 320, y: 160 },
    movementModes: ['submarine'],
    requirements: ['submarine_barrel']
  },

  'illusion_spire': {
    name: 'The Illusion Spire',
    type: 'DUNGEON',
    description: 'A tower located in the middle of a vast desert. Warps players to the Void Citadel.',
    musicTrack: 'illusion_spire_theme',
    battleBackground: 'desert_tower_battle',
    encounters: ['dark_wizard', 'brain_flayer', 'illusion_monster'],
    specialFeatures: ['desert_location', 'warp_to_void_citadel'],
    connections: ['vast_desert'],
    coordinates: { x: 200, y: 240 },
    movementModes: ['foot']
  },

  'void_citadel': {
    name: 'The Void Citadel',
    type: 'DUNGEON',
    description: 'A tech-based dungeon located in space, accessible only via the Illusion Spire.',
    musicTrack: 'void_citadel_theme',
    battleBackground: 'space_station_battle',
    encounters: ['robot_guardian', 'cyber_demon', 'omega_drone'],
    specialFeatures: ['tech_base_tileset', 'parallax_starfield', 'teleporter_maze'],
    connections: ['illusion_spire_warp'],
    coordinates: { x: 0, y: 0 }, // Separate dimension
    movementModes: ['foot']
  },

  'sanctum_of_discord_past': {
    name: 'Sanctum of Discord (Past)',
    type: 'DUNGEON',
    description: 'Players must play the "Bard\'s Harp" key item at the original Sanctum of Discord to open the time portal.',
    musicTrack: 'time_portal_theme',
    battleBackground: 'time_distorted_battle',
    encounters: ['time_paradox_enemy', 'enhanced_elemental_tyrants'],
    specialFeatures: ['time_portal', 'all_tyrant_rematches', 'five_floors'],
    connections: ['sanctum_of_discord'],
    coordinates: { x: 140, y: 100 },
    movementModes: ['foot'],
    requirements: ['bards_harp']
  }
};

/**
 * Boss mechanics database
 * Contains unique mechanics and behaviors for each boss encounter
 */
export const BOSS_MECHANICS_DATABASE: Record<string, {
  name: string;
  tier: 'GATEKEEPER' | 'ELEMENTAL_TYRANT' | 'OPTIONAL' | 'FINAL';
  uniqueMechanics: string[];
  phases?: Array<{
    name: string;
    healthThreshold: number;
    newAbilities: string[];
    behaviorChanges: string[];
  }>;
  specialConditions: Array<{
    trigger: string;
    effect: string;
    description: string;
  }>;
  rewards: {
    experience: number;
    gold: number;
    keyItems?: string[];
    uniqueDrops?: string[];
  };
  strategy: string[];
}> = {
  // ============= TIER 1: PLOT GATEKEEPERS =============
  
  'lord_vane': {
    name: 'Lord Vane',
    tier: 'GATEKEEPER',
    uniqueMechanics: ['physical_only_attacks', 'tutorial_boss'],
    phases: [],
    specialConditions: [
      {
        trigger: 'low_health',
        effect: 'desperation_attack',
        description: 'At low health, Lord Vane attacks more aggressively'
      }
    ],
    rewards: {
      experience: 500,
      gold: 200,
      keyItems: []
    },
    strategy: [
      'Focus on healing between attacks',
      'Use basic attacks - magic is ineffective',
      'Watch for attack patterns and dodge accordingly'
    ]
  },

  'captain_dread': {
    name: 'Captain Dread',
    tier: 'GATEKEEPER',
    uniqueMechanics: ['summon_pirates', 'ship_battle'],
    phases: [
      {
        name: 'Phase 1',
        healthThreshold: 70,
        newAbilities: ['summon_pirates'],
        behaviorChanges: ['summons_2_pirates']
      },
      {
        name: 'Phase 2',
        healthThreshold: 30,
        newAbilities: ['desperation_cannon_fire'],
        behaviorChanges: ['uses_ship_cannons']
      }
    ],
    specialConditions: [
      {
        trigger: 'pirates_defeated',
        effect: 'captain_vulnerable',
        description: 'Defeating all pirates makes Captain Dread vulnerable for 3 turns'
      }
    ],
    rewards: {
      experience: 800,
      gold: 500,
      keyItems: ['ship_key']
    },
    strategy: [
      'Defeat summoned pirates first to reduce pressure',
      'Target Captain Dread when vulnerable',
      'Save powerful attacks for vulnerability phases'
    ]
  },

  'dark_elf_king': {
    name: 'Dark Elf King',
    tier: 'GATEKEEPER',
    uniqueMechanics: ['high_evasion', 'status_infliction', 'elemental_switching'],
    phases: [
      {
        name: 'Phase 1',
        healthThreshold: 60,
        newAbilities: ['spark_2', 'hold_spell'],
        behaviorChanges: ['alternates_between_physical_and_magic']
      },
      {
        name: 'Phase 2',
        healthThreshold: 25,
        newAbilities: ['multi_hit_combo'],
        behaviorChanges: ['attacks_twice_per_turn']
      }
    ],
    specialConditions: [
      {
        trigger: 'illumination_cast',
        effect: 'evasion_negated',
        description: 'Light-based spells temporarily negate his high evasion'
      }
    ],
    rewards: {
      experience: 1200,
      gold: 800,
      keyItems: ['crystal_eye']
    },
    strategy: [
      'Use light-based magic to negate evasion',
      'Cure status ailments quickly',
      'Save healing for phase 2 when he attacks twice'
    ]
  },

  // ============= TIER 2: ELEMENTAL TYRANTS =============
  
  'rot_king': {
    name: 'Rot-King',
    tier: 'ELEMENTAL_TYRANT',
    uniqueMechanics: ['earth_magic', 'haste_self', 'summon_decaying_minions'],
    phases: [
      {
        name: 'Phase 1',
        healthThreshold: 75,
        newAbilities: ['earthquake', 'decay_touch'],
        behaviorChanges: ['uses_area_attacks']
      },
      {
        name: 'Phase 2',
        healthThreshold: 50,
        newAbilities: ['haste', 'summon_rot_corpses'],
        behaviorChanges: ['doubles_action_frequency', 'summons_minions']
      },
      {
        name: 'Phase 3',
        healthThreshold: 25,
        newAbilities: ['cataclysm', 'desperation_decay'],
        behaviorChanges: ['uses_ultimate_earth_magic']
      }
    ],
    specialConditions: [
      {
        trigger: 'fire_damage_received',
        effect: 'weakness_exposed',
        description: 'Fire damage reveals and temporarily removes his earth resistance'
      },
      {
        trigger: 'haste_active',
        effect: 'double_turns',
        description: 'While hasted, Rot-King gets two turns per round'
      }
    ],
    rewards: {
      experience: 3000,
      gold: 2000,
      keyItems: ['earth_crystal_fragment']
    },
    strategy: [
      'Use fire magic to exploit weakness',
      'Defeat minions quickly to prevent being overwhelmed',
      'Save strongest attacks for when he\'s not hasted'
    ]
  },

  'serpentina': {
    name: 'Serpentina',
    tier: 'ELEMENTAL_TYRANT',
    uniqueMechanics: ['six_attacks_per_turn', 'fire_resistance', 'blind_infliction', 'multi_target'],
    phases: [
      {
        name: 'Phase 1',
        healthThreshold: 66,
        newAbilities: ['six_strike_combo', 'fire_breath'],
        behaviorChanges: ['attacks_six_times', 'targets_random_party_members']
      },
      {
        name: 'Phase 2',
        healthThreshold: 33,
        newAbilities: ['blind_gaze', 'constrict'],
        behaviorChanges: ['inflicts_blind', 'can_constrict_party_member']
      }
    ],
    specialConditions: [
      {
        trigger: 'water_magic_used',
        effect: 'fire_resistance_lowered',
        description: 'Water magic temporarily reduces her fire resistance'
      },
      {
        trigger: 'constrict_active',
        effect: 'party_member_immobilized',
        description: 'Constricted party member cannot act for 3 turns'
      }
    ],
    rewards: {
      experience: 3500,
      gold: 2500,
      keyItems: ['fire_crystal_fragment']
    },
    strategy: [
      'Use water magic to lower fire resistance',
      'Cure blindness immediately with items or magic',
      'Focus damage on one head at a time'
    ]
  },

  'abyssal_lord': {
    name: 'Abyssal Lord',
    tier: 'ELEMENTAL_TYRANT',
    uniqueMechanics: ['blind_attacks', 'water_magic', 'tidal_wave_aoe', 'ink_cloud'],
    phases: [
      {
        name: 'Phase 1',
        healthThreshold: 70,
        newAbilities: ['tentacle_slam', 'ink_cloud'],
        behaviorChanges: ['reduces_accuracy', 'inflicts_blind']
      },
      {
        name: 'Phase 2',
        healthThreshold: 40,
        newAbilities: ['tidal_wave', 'summon_abyssal_spawn'],
        behaviorChanges: ['uses_massive_aoe', 'summons_minions']
      }
    ],
    specialConditions: [
      {
        trigger: 'lightning_damage_received',
        effect: 'stunned',
        description: 'Lightning damage has chance to stun for 1 turn'
      },
      {
        trigger: 'ink_cloud_active',
        effect: 'accuracy_reduced',
        description: 'Ink cloud reduces party accuracy by 75%'
      }
    ],
    rewards: {
      experience: 4000,
      gold: 3000,
      keyItems: ['water_crystal_fragment', 'translation_tablet']
    },
    strategy: [
      'Use lightning magic for stun chance',
      'Heal through tidal wave damage',
      'Clear ink cloud with wind magic if available'
    ]
  },

  'storm_hydra': {
    name: 'Storm Hydra',
    tier: 'ELEMENTAL_TYRANT',
    uniqueMechanics: ['multiple_heads', 'poison_gas', 'lightning_magic', 'head_regeneration'],
    phases: [
      {
        name: 'Phase 1',
        healthThreshold: 75,
        newAbilities: ['multi_head_bite', 'poison_gas'],
        behaviorChanges: ['attacks_with_all_heads', 'inflicts_poison']
      },
      {
        name: 'Phase 2',
        healthThreshold: 50,
        newAbilities: ['thunderbolt', 'head_regeneration'],
        behaviorChanges: ['uses_lightning', 'regenerates_defeated_heads']
      }
    ],
    specialConditions: [
      {
        trigger: 'head_defeated',
        effect: 'temporary_weakness',
        description: 'Defeating a head temporarily reduces overall damage'
      },
      {
        trigger: 'poison_active',
        effect: 'damage_over_time',
        description: 'Poison gas deals damage equal to 10% max HP per turn'
      }
    ],
    rewards: {
      experience: 4500,
      gold: 3500,
      keyItems: ['wind_crystal_fragment']
    },
    strategy: [
      'Focus on defeating one head at a time',
      'Cure poison immediately',
      'Use area healing to counter poison damage'
    ]
  },

  // ============= TIER 3: OPTIONAL & SUPER BOSSES =============
  
  'guardian_mech': {
    name: 'Guardian',
    tier: 'OPTIONAL',
    uniqueMechanics: ['cataclysm_every_4_turns', 'high_defense', 'tech_resistances'],
    phases: [
      {
        name: 'Phase 1',
        healthThreshold: 60,
        newAbilities: ['laser_beam', 'missile_barrage'],
        behaviorChanges: ['uses_tech_attacks']
      },
      {
        name: 'Phase 2',
        healthThreshold: 30,
        newAbilities: ['overcharge_mode'],
        behaviorChanges: ['charges_ultimate_attack']
      }
    ],
    specialConditions: [
      {
        trigger: 'turn_counter_4',
        effect: 'cataclysm_cast',
        description: 'Every 4th turn, Guardian casts Cataclysm (massive non-elemental damage)'
      }
    ],
    rewards: {
      experience: 2500,
      gold: 1500,
      keyItems: ['gravity_crystal'],
      uniqueDrops: ['guardian_core']
    },
    strategy: [
      'Count turns to anticipate Cataclysm',
      'Use defensive buffs before turn 4',
      'Save strongest attacks for overcharge phase'
    ]
  },

  'omega_drone': {
    name: 'Omega Drone',
    tier: 'OPTIONAL',
    uniqueMechanics: ['1_64_encounter_rate', 'hp_regeneration', 'highest_physical_attack'],
    phases: [
      {
        name: 'Phase 1',
        healthThreshold: 75,
        newAbilities: ['plasma_cutter', 'energy_shield'],
        behaviorChanges: ['uses_energy_weapons', 'regenerates_5_percent_hp']
      },
      {
        name: 'Phase 2',
        healthThreshold: 40,
        newAbilities: ['omega_beam', 'self_destruct_sequence'],
        behaviorChanges: ['charges_ultimate_attack', 'begins_countdown']
      }
    ],
    specialConditions: [
      {
        trigger: 'always_active',
        effect: 'hp_regen_5_percent',
        description: 'Regenerates 5% HP every turn'
      }
    ],
    rewards: {
      experience: 6000,
      gold: 5000,
      uniqueDrops: ['omega_core', 'rare_upgrade_material']
    },
    strategy: [
      'Use overwhelming damage to outpace regeneration',
      'Apply damage-over-time effects if available',
      'Finish quickly before self-destruct'
    ]
  },

  'cyclone_master': {
    name: 'Cyclone Master',
    tier: 'OPTIONAL',
    uniqueMechanics: ['sneeze_remove_party', 'wind_magic', 'high_evasion'],
    phases: [
      {
        name: 'Phase 1',
        healthThreshold: 60,
        newAbilities: ['wind_slash', 'gust'],
        behaviorChanges: ['uses_wind_attacks', 'high_evasion']
      },
      {
        name: 'Phase 2',
        healthThreshold: 30,
        newAbilities: ['tornado_form', 'mega_sneeze'],
        behaviorChanges: ['becomes_tornado', 'can_remove_party_members']
      }
    ],
    specialConditions: [
      {
        trigger: 'mega_sneeze_hit',
        effect: 'party_member_removed',
        description: 'Party member blown away from battle until battle ends'
      }
    ],
    rewards: {
      experience: 2000,
      gold: 1000,
      uniqueDrops: ['wind_charm', 'cyclone_essence']
    },
    strategy: [
      'Use wind-resistant equipment if available',
      'Defeat quickly before tornado phase',
      'Protect party members with status immunity'
    ]
  },

  // ============= FINAL BOSS: ENTROPY =============
  
  'entropy': {
    name: 'Entropy',
    tier: 'FINAL',
    uniqueMechanics: ['elemental_rotation', 'time_loop_powers', 'phase_shift', 'vitalis_maxima'],
    phases: [
      {
        name: 'Earth Phase',
        healthThreshold: 80,
        newAbilities: ['rot_king_powers', 'earthquake_plus'],
        behaviorChanges: ['uses_earth_elemental_attacks']
      },
      {
        name: 'Fire Phase',
        healthThreshold: 60,
        newAbilities: ['serpentina_powers', 'inferno_plus'],
        behaviorChanges: ['uses_fire_elemental_attacks', 'attacks_six_times']
      },
      {
        name: 'Water Phase',
        healthThreshold: 40,
        newAbilities: ['abyssal_lord_powers', 'tidal_wave_plus'],
        behaviorChanges: ['uses_water_elemental_attacks', 'inflicts_multiple_status']
      },
      {
        name: 'Wind Phase',
        healthThreshold: 20,
        newAbilities: ['storm_hydra_powers', 'poison_hurricane'],
        behaviorChanges: ['uses_wind_elemental_attacks', 'multiple_heads_attack']
      }
    ],
    specialConditions: [
      {
        trigger: 'health_below_20_percent',
        effect: 'vitalis_maxima_cast',
        description: 'Casts Vitalis Maxima (full heal) once when HP < 20%'
      },
      {
        trigger: 'post_vitalis',
        effect: 'entropy_wave',
        description: 'After healing, uses Entropy Wave (halves party HP) every turn'
      }
    ],
    rewards: {
      experience: 10000,
      gold: 10000,
      keyItems: ['time_core', 'essence_of_victory'],
      uniqueDrops: ['entropy_fragment', 'ultimate_ending_material']
    },
    strategy: [
      'Adapt strategy for each elemental phase',
      'Save strongest attacks for final phase',
      'Use healing items efficiently after Vitalis Maxima',
      'Break the time loop by defeating all forms'
    ]
  }
};

/**
 * Status effects database
 * Contains all status effects with their properties and behaviors
 */
export const STATUS_EFFECTS_DATABASE: Record<StatusEffect, {
  name: string;
  description: string;
  duration: number; // Base duration in turns
  effects: {
    [key: string]: number | boolean;
  };
  cureMethods: string[];
  resistances: string[];
  stackable: boolean;
  visible: boolean;
}> = {
  [StatusEffect.POISON]: {
    name: 'Poison',
    description: 'Deals damage per step on overworld; damage per turn in battle.',
    duration: 10,
    effects: {
      damage_per_turn: 5,
      damage_per_step: 1,
      prevent_regeneration: true
    },
    cureMethods: ['antidote', 'heal_1', 'cure_1', 'full_cure'],
    resistances: ['poison_immune_equipment', 'high_vitality'],
    stackable: false,
    visible: true
  },

  [StatusEffect.STONE]: {
    name: 'Stone',
    description: 'Character is frozen and effectively dead until cured. Game Over if all are stoned.',
    duration: 999, // Permanent until cured
    effects: {
      prevent_all_actions: true,
      count_as_defeated: true,
      immune_to_all_damage: true
    },
    cureMethods: ['gold_needle', 'full_cure', 'esuna_spell'],
    resistances: ['stone_immune_equipment', 'high_vitality'],
    stackable: false,
    visible: true
  },

  [StatusEffect.DARKNESS]: {
    name: 'Darkness',
    description: 'Physical accuracy dropped by 50%.',
    duration: 8,
    effects: {
      accuracy_penalty: 50,
      prevent_critical_hits: true
    },
    cureMethods: ['echo_herbs', 'heal_2', 'full_cure'],
    resistances: ['darkness_immune_equipment', 'high_luck'],
    stackable: false,
    visible: true
  },

  [StatusEffect.SILENCE]: {
    name: 'Silence',
    description: 'Cannot cast magic.',
    duration: 6,
    effects: {
      prevent_magic: true,
      prevent_item_usage: true
    },
    cureMethods: ['echo_herbs', 'heal_1', 'full_cure'],
    resistances: ['silence_immune_equipment', 'high_intelligence'],
    stackable: false,
    visible: true
  },

  [StatusEffect.PARALYSIS]: {
    name: 'Paralysis',
    description: 'Skip turns.',
    duration: 4,
    effects: {
      skip_turns: true,
      prevent_all_actions: true,
      vulnerable_to_critical: true
    },
    cureMethods: ['antidote', 'heal_2', 'full_cure'],
    resistances: ['paralysis_immune_equipment', 'high_agility'],
    stackable: false,
    visible: true
  },

  [StatusEffect.BLIND]: {
    name: 'Blind',
    description: 'Physical accuracy dropped by 75% and cannot critical hit.',
    duration: 7,
    effects: {
      accuracy_penalty: 75,
      prevent_critical_hits: true,
      prevent_magic: false
    },
    cureMethods: ['echo_herbs', 'heal_2', 'full_cure'],
    resistances: ['blind_immune_equipment', 'high_luck'],
    stackable: false,
    visible: true
  },

  [StatusEffect.SLEEP]: {
    name: 'Sleep',
    description: 'Cannot act. Wakes up when damaged.',
    duration: 5,
    effects: {
      prevent_all_actions: true,
      wake_on_damage: true,
      vulnerable_to_critical: true
    },
    cureMethods: ['damage', 'heal_1', 'full_cure'],
    resistances: ['sleep_immune_equipment', 'high_vitality'],
    stackable: false,
    visible: true
  },

  [StatusEffect.CONFUSION]: {
    name: 'Confusion',
    description: 'Attack random targets including allies.',
    duration: 6,
    effects: {
      random_targeting: true,
      prevent_magic: false,
      prevent_item_usage: true
    },
    cureMethods: ['damage', 'heal_2', 'full_cure'],
    resistances: ['confusion_immune_equipment', 'high_intelligence'],
    stackable: false,
    visible: true
  },

  [StatusEffect.CHARM]: {
    name: 'Charm',
    description: 'Fight for enemies. Cannot be controlled.',
    duration: 8,
    effects: {
      switch_sides: true,
      prevent_all_player_control: true,
      immune_to_player_damage: true
    },
    cureMethods: ['damage', 'full_cure', 'dispel_magic'],
    resistances: ['charm_immune_equipment', 'high_luck'],
    stackable: false,
    visible: true
  },

  [StatusEffect.BERSERK]: {
    name: 'Berserk',
    description: 'Attack power doubled, but cannot be controlled and attacks random targets.',
    duration: 5,
    effects: {
      attack_bonus: 100,
      defense_penalty: 50,
      random_targeting: true,
      prevent_magic: true,
      prevent_item_usage: true
    },
    cureMethods: ['damage', 'full_cure', 'dispel_magic'],
    resistances: ['berserk_immune_equipment', 'high_vitality'],
    stackable: false,
    visible: true
  },

  [StatusEffect.SLOW]: {
    name: 'Slow',
    description: 'Action speed halved. Acts after normal speed characters.',
    duration: 7,
    effects: {
      speed_penalty: 50,
      action_delay: true
    },
    cureMethods: ['heal_1', 'full_cure', 'haste_spell'],
    resistances: ['slow_immune_equipment', 'high_agility'],
    stackable: false,
    visible: true
  },

  [StatusEffect.HASTE]: {
    name: 'Haste',
    description: 'Action speed doubled. Acts before normal speed characters.',
    duration: 6,
    effects: {
      speed_bonus: 100,
      action_priority: true,
      double_turns: false
    },
    cureMethods: ['dispel_magic', 'slow_spell'],
    resistances: ['haste_immune_equipment'],
    stackable: false,
    visible: true
  },

  [StatusEffect.PROTECT]: {
    name: 'Protect',
    description: 'Physical defense increased by 50%.',
    duration: 10,
    effects: {
      defense_bonus: 50,
      damage_reduction_physical: 25
    },
    cureMethods: ['dispel_magic', 'time_expiration'],
    resistances: [],
    stackable: false,
    visible: true
  },

  [StatusEffect.SHELL]: {
    name: 'Shell',
    description: 'Magic defense increased by 50%.',
    duration: 10,
    effects: {
      magic_defense_bonus: 50,
      damage_reduction_magical: 25
    },
    cureMethods: ['dispel_magic', 'time_expiration'],
    resistances: [],
    stackable: false,
    visible: true
  },

  [StatusEffect.REGEN]: {
    name: 'Regen',
    description: 'Gradually restores HP over time.',
    duration: 8,
    effects: {
      heal_per_turn: 10,
      remove_poison: true,
      remove_paralysis: true
    },
    cureMethods: ['dispel_magic', 'time_expiration'],
    resistances: [],
    stackable: false,
    visible: true
  }
};

/**
 * Status effect combinations and interactions
 * Defines how different status effects interact with each other
 */
export const STATUS_EFFECT_INTERACTIONS = {
  // Curing interactions
  'full_cure_cures_all': ['POISON', 'STONE', 'DARKNESS', 'SILENCE', 'PARALYSIS', 'BLIND', 'SLEEP', 'CONFUSION', 'CHARM', 'BERSERK', 'SLOW'],
  
  // Priority effects (some override others)
  'stone_overrides_all': ['POISON', 'PARALYSIS', 'SLEEP', 'CONFUSION', 'CHARM', 'BERSERK'],
  'sleep_overrides': ['CONFUSION', 'CHARM', 'BERSERK'],
  'paralysis_overrides': ['SLEEP', 'CONFUSION'],
  
  // Incompatible effects
  'haste_slow_incompatible': ['HASTE', 'SLOW'],
  'berserk_control_incompatible': ['BERSERK', 'CHARM', 'CONFUSION'],
  'silence_prevents_magic': ['SILENCE'],
  
  // Synergistic effects
  'darkness_blind_stack': ['DARKNESS', 'BLIND'], // Combined 87.5% accuracy penalty
  'poison_regen_cancel': ['POISON', 'REGEN'], // Regen removes poison
  'protect_shell_synergy': ['PROTECT', 'SHELL'] // 25% damage reduction to all types
};

/**
 * Party formation and selection data
 * Contains party configuration options and formation templates
 */
export const PARTY_FORMATION_DATABASE = {
  // ============= FORMATION TEMPLATES =============
  
  'balanced': {
    name: 'Balanced Formation',
    description: 'Two characters in front row, two in back row. Good all-around defense.',
    frontRow: [0, 1], // First two party members
    backRow: [2, 3], // Last two party members
    bonuses: {
      defense: 5,
      magic_defense: 5,
      evasion: 0
    }
  },

  'offensive': {
    name: 'Offensive Formation',
    description: 'Three characters in front row, one in back row. Maximum attack power.',
    frontRow: [0, 1, 2], // First three party members
    backRow: [3], // Last party member
    bonuses: {
      attack: 10,
      defense: -5,
      evasion: -10
    }
  },

  'defensive': {
    name: 'Defensive Formation',
    description: 'One character in front row, three in back row. Maximum defense.',
    frontRow: [0], // First party member
    backRow: [1, 2, 3], // Last three party members
    bonuses: {
      defense: 15,
      magic_defense: 10,
      evasion: 5,
      attack: -10
    }
  },

  'magic_focus': {
    name: 'Magic Focus Formation',
    description: 'One character in front row, three in back row. Enhanced magic power.',
    frontRow: [0], // First party member
    backRow: [1, 2, 3], // Last three party members
    bonuses: {
      magic_power: 20,
      magic_defense: 15,
      mp_efficiency: 10,
      attack: -15
    }
  },

  'speed_priority': {
    name: 'Speed Priority Formation',
    description: 'Two characters in front row, two in back row. Enhanced agility.',
    frontRow: [0, 1], // First two party members
    backRow: [2, 3], // Last two party members
    bonuses: {
      agility: 15,
      evasion: 20,
      critical_chance: 10,
      defense: -5
    }
  },

  'custom': {
    name: 'Custom Formation',
    description: 'Player can manually arrange party members.',
    frontRow: [], // Player selected
    backRow: [], // Player selected
    bonuses: {
      defense: 0,
      magic_defense: 0,
      attack: 0,
      agility: 0,
      evasion: 0
    }
  }
};

/**
 * Character creation and naming data
 * Contains default names and creation options
 */
export const CHARACTER_CREATION_DATA = {
  // ============= DEFAULT NAME POOLS =============
  
  maleNames: [
    'Aric', 'Borin', 'Caelan', 'Darian', 'Eldrin', 'Faelan', 'Gareth', 'Harlan', 'Ithian', 'Jorun',
    'Kaelen', 'Lorian', 'Moran', 'Norian', 'Orin', 'Perrin', 'Quinlan', 'Roric', 'Soren',
    'Theron', 'Uthric', 'Valen', 'Wulfric', 'Xanthor', 'Yorin', 'Zephyr'
  ],

  femaleNames: [
    'Aria', 'Brienna', 'Caelia', 'Diana', 'Elena', 'Faelin', 'Gwen', 'Halia', 'Iris', 'Juna',
    'Kaia', 'Lyra', 'Mira', 'Nora', 'Orina', 'Perrin', 'Quinn', 'Rhiannon', 'Sorina',
    'Thalia', 'Ursula', 'Valeria', 'Wilow', 'Xylia', 'Yara', 'Zenna'
  ],

  // ============= CLASS DESCRIPTIONS FOR SELECTION =============
  
  classDescriptions: {
    [CharacterClass.WARRIOR]: {
      title: 'Warrior',
      description: 'High HP, Heavy Armor. Tank/Physical DPS specialist.',
      stats: 'HP: High | ATK: High | DEF: High | MAG: None | SPD: Low',
      playstyle: 'Front-line combatant with heavy weapons and armor.',
      recommendedFor: 'Players who prefer straightforward melee combat.'
    },

    [CharacterClass.THIEF]: {
      title: 'Thief',
      description: 'High Agility, High Luck. Evasion Tank/Multi-hit DPS. Good for fleeing battles.',
      stats: 'HP: Medium | ATK: Medium | DEF: Low | MAG: Low | SPD: Very High',
      playstyle: 'Fast attacker with high critical chance and evasion.',
      recommendedFor: 'Players who like speed and critical hits.'
    },

    [CharacterClass.MONK]: {
      title: 'Monk',
      description: 'Unarmed Specialist. Glass Cannon. Damage scales with level, not weapon.',
      stats: 'HP: Medium | ATK: Medium | DEF: Medium | MAG: Low | SPD: Medium',
      playstyle: 'Unarmed combatant with damage that scales with level.',
      recommendedFor: 'Players who want unique progression-based damage.'
    },

    [CharacterClass.CRIMSON_SAGE]: {
      title: 'Crimson Sage',
      description: 'Jack-of-all-Trades. Can use swords and mid-level Dark/Holy magic.',
      stats: 'HP: Medium | ATK: Medium | DEF: Medium | MAG: Medium | SPD: Medium',
      playstyle: 'Hybrid character combining weapons and magic.',
      recommendedFor: 'Players who want versatility in combat.'
    },

    [CharacterClass.CLERIC]: {
      title: 'Cleric',
      description: 'Healer. Low defense. Essential for Undead dungeons.',
      stats: 'HP: Medium | ATK: Low | DEF: Medium | MAG: High | SPD: Low',
      playstyle: 'Support character with healing and holy magic.',
      recommendedFor: 'Players who like supporting allies and healing.'
    },

    [CharacterClass.SORCERER]: {
      title: 'Sorcerer',
      description: 'Nuker. AoE Damage/Debuffer. Very low HP.',
      stats: 'HP: Low | ATK: Low | DEF: Very Low | MAG: Very High | SPD: Medium',
      playstyle: 'Glass cannon with powerful area magic.',
      recommendedFor: 'Players who want maximum magical damage output.'
    }
  },

  // ============= PARTY COMPOSITIONS =============
  
  recommendedParties: {
    balanced: {
      name: 'Balanced Party',
      description: 'Well-rounded party with all roles covered.',
      composition: [CharacterClass.WARRIOR, CharacterClass.CLERIC, CharacterClass.SORCERER, CharacterClass.THIEF],
      strategy: 'Classic RPG party with tank, healer, nuker, and utility.'
    },

    physical: {
      name: 'Physical Power Party',
      description: 'Focus on melee damage and physical combat.',
      composition: [CharacterClass.WARRIOR, CharacterClass.MONK, CharacterClass.THIEF, CharacterClass.WARRIOR],
      strategy: 'Overwhelm enemies with pure physical damage.'
    },

    magical: {
      name: 'Magical Might Party',
      description: 'Focus on spellcasting and magical damage.',
      composition: [CharacterClass.SORCERER, CharacterClass.CLERIC, CharacterClass.CRIMSON_SAGE, CharacterClass.SORCERER],
      strategy: 'Destroy enemies with powerful magic spells.'
    },

    speed: {
      name: 'Lightning Party',
      description: 'Focus on speed and evasion with high action frequency.',
      composition: [CharacterClass.THIEF, CharacterClass.MONK, CharacterClass.THIEF, CharacterClass.CRIMSON_SAGE],
      strategy: 'Attack first and often with high critical rates.'
    },

    defensive: {
      name: 'Iron Wall Party',
      description: 'Focus on survival and damage mitigation.',
      composition: [CharacterClass.WARRIOR, CharacterClass.CLERIC, CharacterClass.WARRIOR, CharacterClass.CLERIC],
      strategy: 'Outlast enemies with superior defense and healing.'
    },

    versatile: {
      name: 'Versatile Party',
      description: 'Mixed party with multiple tactical options.',
      composition: [CharacterClass.CRIMSON_SAGE, CharacterClass.WARRIOR, CharacterClass.CLERIC, CharacterClass.THIEF],
      strategy: 'Adapt to any situation with varied abilities.'
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