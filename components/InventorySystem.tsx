'use client';

/**
 * Inventory System Component
 * @fileoverview Comprehensive inventory management with item display and interactions
 */

import React, { memo, useEffect, useState, useCallback, useMemo } from 'react';
import { useUIStore } from '../store';
import { logger, LogSource } from '../engine/GlobalLogger';
import { ItemDef } from '../types';

/**
 * Inventory slot interface
 */
interface InventorySlot {
  /** Item ID (null if empty) */
  itemId: string | null;
  /** Item quantity */
  quantity: number;
  /** Slot index */
  index: number;
  /** Whether slot is selected */
  selected: boolean;
  /** Whether slot is equipped */
  equipped: boolean;
}

/**
 * Inventory configuration
 */
interface InventoryConfig {
  /** Number of inventory slots */
  slotCount: number;
  /** Slots per row */
  slotsPerRow: number;
  /** Whether to show item descriptions */
  showDescriptions: boolean;
  /** Whether to allow item stacking */
  allowStacking: boolean;
  /** Whether to show item values */
  showValues: boolean;
}

/**
 * Mock item definitions (would come from game data in real implementation)
 */
const MOCK_ITEMS: Record<string, ItemDef> = {
  'potion_health': {
    id: 'potion_health',
    name: 'Health Potion',
    description: 'Restores 50 HP when consumed.',
    type: 'CONSUMABLE',
    properties: {
      value: 50,
      stackable: true,
      consumable: true,
      effects: [{ type: 'heal', value: 50 }]
    }
  },
  'potion_mana': {
    id: 'potion_mana',
    name: 'Mana Potion',
    description: 'Restores 30 MP when consumed.',
    type: 'CONSUMABLE',
    properties: {
      value: 30,
      stackable: true,
      consumable: true,
      effects: [{ type: 'mana', value: 30 }]
    }
  },
  'sword_iron': {
    id: 'sword_iron',
    name: 'Iron Sword',
    description: 'A sturdy iron sword. ATK +15.',
    type: 'WEAPON',
    properties: {
      value: 150,
      stackable: false,
      consumable: false,
      effects: [{ type: 'attack', value: 15 }]
    }
  },
  'shield_wood': {
    id: 'shield_wood',
    name: 'Wooden Shield',
    description: 'A basic wooden shield. DEF +5.',
    type: 'ARMOR',
    properties: {
      value: 75,
      stackable: false,
      consumable: false,
      effects: [{ type: 'defense', value: 5 }]
    }
  },
  'armor_leather': {
    id: 'armor_leather',
    name: 'Leather Armor',
    description: 'Light leather armor. DEF +8.',
    type: 'ARMOR',
    properties: {
      value: 120,
      stackable: false,
      consumable: false,
      effects: [{ type: 'defense', value: 8 }]
    }
  },
  'key_bronze': {
    id: 'key_bronze',
    name: 'Bronze Key',
    description: 'An old bronze key. Opens bronze chests.',
    type: 'KEY',
    properties: {
      value: 25,
      stackable: true,
      consumable: false
    }
  },
  'herb_healing': {
    id: 'herb_healing',
    name: 'Healing Herb',
    description: 'A medicinal herb. Restores 25 HP.',
    type: 'CONSUMABLE',
    properties: {
      value: 15,
      stackable: true,
      consumable: true,
      effects: [{ type: 'heal', value: 25 }]
    }
  },
  'elixir_strength': {
    id: 'elixir_strength',
    name: 'Strength Elixir',
    description: 'Temporarily increases ATK by 10 for 5 minutes.',
    type: 'CONSUMABLE',
    properties: {
      value: 200,
      stackable: true,
      consumable: true,
      effects: [{ type: 'buff_attack', value: 10, duration: 300 }]
    }
  }
};

/**
 * Mock inventory data
 */
const MOCK_INVENTORY: Array<{ itemId: string; quantity: number }> = [
  { itemId: 'potion_health', quantity: 5 },
  { itemId: 'potion_mana', quantity: 3 },
  { itemId: 'sword_iron', quantity: 1 },
  { itemId: 'shield_wood', quantity: 1 },
  { itemId: 'armor_leather', quantity: 1 },
  { itemId: 'key_bronze', quantity: 2 },
  { itemId: 'herb_healing', quantity: 8 },
  { itemId: 'elixir_strength', quantity: 2 }
];

/**
 * Inventory Slot Component
 */
const InventorySlot: React.FC<{
  slot: InventorySlot;
  item: ItemDef | null;
  onSelect: () => void;
  onUse: () => void;
  onEquip: () => void;
  onDrop: () => void;
  config: InventoryConfig;
}> = memo(({ slot, item, onSelect, onUse, onEquip, onDrop, config }) => {
  const [showContextMenu, setShowContextMenu] = useState(false);

  const slotStyle: React.CSSProperties = {
    width: '64px',
    height: '64px',
    backgroundColor: slot.selected ? '#444444' : '#2a2a2a',
    border: slot.selected ? '3px solid #666666' : '2px solid #444444',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    position: 'relative',
    transition: 'all 0.2s ease',
    fontFamily: 'monospace',
    fontSize: '12px'
  };

  const itemIconStyle: React.CSSProperties = {
    fontSize: '24px',
    marginBottom: '4px'
  };

  const quantityStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: '2px',
    right: '2px',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    color: '#FFFFFF',
    borderRadius: '4px',
    padding: '2px 4px',
    fontSize: '10px',
    fontWeight: 'bold'
  };

  const equippedIndicatorStyle: React.CSSProperties = {
    position: 'absolute',
    top: '-4px',
    right: '-4px',
    backgroundColor: '#FFD700',
    color: '#000000',
    borderRadius: '50%',
    width: '20px',
    height: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: 'bold',
    border: '2px solid #FFFFFF'
  };

  const contextMenuStyle: React.CSSProperties = {
    position: 'absolute',
    top: '70px',
    left: '0',
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    border: '2px solid #555555',
    borderRadius: '8px',
    padding: '8px',
    zIndex: 1000,
    minWidth: '120px',
    fontFamily: 'monospace',
    fontSize: '14px'
  };

  const contextOptionStyle: React.CSSProperties = {
    padding: '8px 12px',
    cursor: 'pointer',
    borderRadius: '4px',
    transition: 'background-color 0.2s ease'
  };

  const getItemIcon = (itemType: string) => {
    switch (itemType) {
      case 'CONSUMABLE': return '🧪';
      case 'WEAPON': return '⚔️';
      case 'ARMOR': return '🛡️';
      case 'KEY': return '🗝️';
      default: return '📦';
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowContextMenu(true);
  };

  const handleAction = (action: () => void) => {
    action();
    setShowContextMenu(false);
  };

  return (
    <div style={{ position: 'relative' }}>
      <div
        style={slotStyle}
        onClick={onSelect}
        onContextMenu={handleContextMenu}
        role="button"
        aria-label={item ? `${item.name} (Quantity: ${slot.quantity})` : 'Empty slot'}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelect();
          }
        }}
      >
        {item ? (
          <>
            <div style={itemIconStyle}>
              {getItemIcon(item.type)}
            </div>
            {slot.quantity > 1 && (
              <div style={quantityStyle}>
                {slot.quantity}
              </div>
            )}
            {slot.equipped && (
              <div style={equippedIndicatorStyle}>
                E
              </div>
            )}
          </>
        ) : (
          <div style={{ color: '#666666', fontSize: '20px' }}>
            -
          </div>
        )}
      </div>

      {/* Context Menu */}
      {showContextMenu && item && (
        <div style={contextMenuStyle}>
          <div
            style={contextOptionStyle}
            onClick={() => handleAction(onUse)}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#444444'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            Use
          </div>
          {item.type === 'WEAPON' || item.type === 'ARMOR' ? (
            <div
              style={contextOptionStyle}
              onClick={() => handleAction(onEquip)}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#444444'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              {slot.equipped ? 'Unequip' : 'Equip'}
            </div>
          ) : null}
          <div
            style={contextOptionStyle}
            onClick={() => handleAction(onDrop)}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#444444'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            Drop
          </div>
        </div>
      )}

      {/* Click outside to close context menu */}
      {showContextMenu && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 999
          }}
          onClick={() => setShowContextMenu(false)}
        />
      )}
    </div>
  );
});

InventorySlot.displayName = 'InventorySlot';

/**
 * Item Details Panel
 */
const ItemDetailsPanel: React.FC<{
  item: ItemDef | null;
  quantity: number;
  onUse: () => void;
  onEquip: () => void;
  onDrop: () => void;
}> = memo(({ item, quantity, onUse, onEquip, onDrop }) => {
  if (!item) return null;

  const panelStyle: React.CSSProperties = {
    position: 'fixed',
    right: '20px',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '300px',
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    border: '3px solid #555555',
    borderRadius: '12px',
    padding: '20px',
    fontFamily: 'monospace',
    color: '#FFFFFF',
    zIndex: 400
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '12px',
    color: '#FFD700',
    borderBottom: '2px solid #444444',
    paddingBottom: '8px'
  };

  const descriptionStyle: React.CSSProperties = {
    fontSize: '14px',
    marginBottom: '16px',
    lineHeight: '1.5',
    color: '#CCCCCC'
  };

  const statsStyle: React.CSSProperties = {
    fontSize: '14px',
    marginBottom: '16px'
  };

  const actionButtonStyle: React.CSSProperties = {
    display: 'block',
    width: '100%',
    padding: '10px',
    margin: '8px 0',
    backgroundColor: '#444444',
    border: '2px solid #666666',
    borderRadius: '6px',
    color: '#FFFFFF',
    cursor: 'pointer',
    fontSize: '14px',
    fontFamily: 'monospace',
    transition: 'all 0.2s ease'
  };

  const getItemTypeColor = (type: string) => {
    switch (type) {
      case 'CONSUMABLE': return '#4CAF50';
      case 'WEAPON': return '#F44336';
      case 'ARMOR': return '#2196F3';
      case 'KEY': return '#FF9800';
      default: return '#9E9E9E';
    }
  };

  return (
    <div style={panelStyle}>
      <div style={titleStyle}>
        {item.name}
        <span style={{
          fontSize: '14px',
          color: getItemTypeColor(item.type),
          marginLeft: '8px'
        }}>
          [{item.type}]
        </span>
      </div>
      
      <div style={descriptionStyle}>
        {item.description}
      </div>
      
      <div style={statsStyle}>
        <div>Quantity: {quantity}</div>
        {item.properties.value && (
          <div>Value: {item.properties.value} gold</div>
        )}
        {item.properties.stackable && (
          <div style={{ color: '#4CAF50' }}>Stackable</div>
        )}
        {item.properties.consumable && (
          <div style={{ color: '#FF9800' }}>Consumable</div>
        )}
      </div>
      
      <div>
        <button
          style={actionButtonStyle}
          onClick={onUse}
          disabled={!item.properties.consumable}
        >
          Use
        </button>
        
        {(item.type === 'WEAPON' || item.type === 'ARMOR') && (
          <button style={actionButtonStyle} onClick={onEquip}>
            Equip
          </button>
        )}
        
        <button style={actionButtonStyle} onClick={onDrop}>
          Drop
        </button>
      </div>
    </div>
  );
});

ItemDetailsPanel.displayName = 'ItemDetailsPanel';

/**
 * Main Inventory System Component
 */
export const InventorySystem: React.FC = memo(() => {
  const { inventoryVisible, setInventoryVisible } = useUIStore();
  
  const [config] = useState<InventoryConfig>({
    slotCount: 32,
    slotsPerRow: 8,
    showDescriptions: true,
    allowStacking: true,
    showValues: true
  });

  const [selectedSlotIndex, setSelectedSlotIndex] = useState(0);
  const [equippedItems, setEquippedItems] = useState<Set<string>>(new Set(['sword_iron', 'shield_wood']));

  // Create inventory slots
  const inventorySlots = useMemo(() => {
    const slots: InventorySlot[] = [];
    
    for (let i = 0; i < config.slotCount; i++) {
      const inventoryItem = MOCK_INVENTORY[i];
      const item = inventoryItem ? MOCK_ITEMS[inventoryItem.itemId] : null;
      
      slots.push({
        itemId: inventoryItem?.itemId || null,
        quantity: inventoryItem?.quantity || 0,
        index: i,
        selected: i === selectedSlotIndex,
        equipped: inventoryItem ? equippedItems.has(inventoryItem.itemId) : false
      });
    }
    
    return slots;
  }, [config.slotCount, selectedSlotIndex, equippedItems]);

  const selectedSlot = inventorySlots[selectedSlotIndex];
  const selectedItem = selectedSlot?.itemId ? MOCK_ITEMS[selectedSlot.itemId] : null;

  // Handle slot selection
  const handleSlotSelect = useCallback((index: number) => {
    setSelectedSlotIndex(index);
    logger.debug(LogSource.UI, `Selected inventory slot ${index}`);
  }, []);

  // Handle item use
  const handleItemUse = useCallback(() => {
    if (!selectedSlot?.itemId || !selectedItem) return;

    if (selectedItem.type === 'CONSUMABLE') {
      logger.info(LogSource.UI, `Used item: ${selectedItem.name}`);
      // In a real implementation, this would apply item effects
      
      // Remove one from inventory (mock)
      if (selectedSlot.quantity > 1) {
        selectedSlot.quantity--;
      } else {
        selectedSlot.itemId = null;
        selectedSlot.quantity = 0;
      }
    }
  }, [selectedSlot, selectedItem]);

  // Handle item equip
  const handleItemEquip = useCallback(() => {
    if (!selectedSlot?.itemId || !selectedItem) return;

    if (selectedItem.type === 'WEAPON' || selectedItem.type === 'ARMOR') {
      setEquippedItems(prev => {
        const newSet = new Set(prev);
        if (newSet.has(selectedSlot.itemId!)) {
          newSet.delete(selectedSlot.itemId!);
          logger.info(LogSource.UI, `Unequipped: ${selectedItem.name}`);
        } else {
          newSet.add(selectedSlot.itemId!);
          logger.info(LogSource.UI, `Equipped: ${selectedItem.name}`);
        }
        return newSet;
      });
    }
  }, [selectedSlot, selectedItem]);

  // Handle item drop
  const handleItemDrop = useCallback(() => {
    if (!selectedSlot?.itemId || !selectedItem) return;

    if (confirm(`Are you sure you want to drop ${selectedItem.name}?`)) {
      logger.info(LogSource.UI, `Dropped item: ${selectedItem.name}`);
      // Remove from inventory (mock)
      selectedSlot.itemId = null;
      selectedSlot.quantity = 0;
      
      // Unequip if it was equipped
      setEquippedItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(selectedSlot.itemId!);
        return newSet;
      });
    }
  }, [selectedSlot, selectedItem]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!inventoryVisible) return;

      switch (e.key) {
        case 'ArrowUp':
        e.preventDefault();
          setSelectedSlotIndex(prev => Math.max(0, prev - config.slotsPerRow));
          break;

        case 'ArrowDown':
          e.preventDefault();
          setSelectedSlotIndex(prev => Math.min(config.slotCount - 1, prev + config.slotsPerRow));
          break;

        case 'ArrowLeft':
          e.preventDefault();
          setSelectedSlotIndex(prev => {
            const row = Math.floor(prev / config.slotsPerRow);
            const col = Math.max(0, (prev % config.slotsPerRow) - 1);
            return row * config.slotsPerRow + col;
          });
          break;

        case 'ArrowRight':
          e.preventDefault();
          setSelectedSlotIndex(prev => {
            const row = Math.floor(prev / config.slotsPerRow);
            const col = Math.min(config.slotsPerRow - 1, (prev % config.slotsPerRow) + 1);
            return row * config.slotsPerRow + col;
          });
          break;

        case 'Enter':
        case ' ':
          e.preventDefault();
          handleItemUse();
          break;

        case 'e':
        case 'E':
          e.preventDefault();
          handleItemEquip();
          break;

        case 'd':
        case 'D':
          e.preventDefault();
          handleItemDrop();
          break;

        case 'Escape':
        case 'i':
        case 'I':
          e.preventDefault();
          setInventoryVisible(false);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inventoryVisible, config.slotsPerRow, config.slotCount, handleItemUse, handleItemEquip, handleItemDrop, setInventoryVisible]);

  // Handle inventory visibility
  useEffect(() => {
    if (inventoryVisible) {
      logger.info(LogSource.UI, 'Inventory opened');
      document.body.style.overflow = 'hidden';
    } else {
      logger.info(LogSource.UI, 'Inventory closed');
      document.body.style.overflow = '';
    }
  }, [inventoryVisible]);

  if (!inventoryVisible) return null;

  const containerStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    zIndex: 350,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  };

  const inventoryGridStyle: React.CSSProperties = {
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    border: '3px solid #555555',
    borderRadius: '12px',
    padding: '20px',
    display: 'grid',
    gridTemplateColumns: `repeat(${config.slotsPerRow}, 1fr)`,
    gap: '8px',
    fontFamily: 'monospace'
  };

  const titleStyle: React.CSSProperties = {
    gridColumn: `1 / -1`,
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '16px',
    textAlign: 'center',
    color: '#FFD700',
    borderBottom: '2px solid #444444',
    paddingBottom: '8px'
  };

  const hintsStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    border: '2px solid #444444',
    borderRadius: '8px',
    padding: '12px 20px',
    fontFamily: 'monospace',
    fontSize: '14px',
    color: '#CCCCCC',
    zIndex: 351
  };

  return (
    <>
      <div style={containerStyle} onClick={() => setInventoryVisible(false)}>
        <div
          style={inventoryGridStyle}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={titleStyle}>Inventory</div>
          
          {inventorySlots.map((slot) => (
            <InventorySlot
              key={slot.index}
              slot={slot}
              item={slot.itemId ? MOCK_ITEMS[slot.itemId] : null}
              onSelect={() => handleSlotSelect(slot.index)}
              onUse={handleItemUse}
              onEquip={handleItemEquip}
              onDrop={handleItemDrop}
              config={config}
            />
          ))}
        </div>
      </div>

      {/* Item Details Panel */}
      {config.showDescriptions && (
        <ItemDetailsPanel
          item={selectedItem}
          quantity={selectedSlot?.quantity || 0}
          onUse={handleItemUse}
          onEquip={handleItemEquip}
          onDrop={handleItemDrop}
        />
      )}

      {/* Control hints */}
      <div style={hintsStyle}>
        ↑↓←→ Navigate | Enter Use | E Equip | D Drop | I/ESC Close
      </div>
    </>
  );
});

InventorySystem.displayName = 'InventorySystem';

export default InventorySystem;