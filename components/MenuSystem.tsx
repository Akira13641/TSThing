'use client';

/**
 * Menu System Component
 * @fileoverview Comprehensive menu system with navigation and accessibility support
 */

import React, { memo, useEffect, useState, useCallback, useRef } from 'react';
import { useMenuVisibility, useUIStore } from '../store';
import { logger, LogSource } from '../engine/GlobalLogger';

/**
 * Menu item interface
 */
interface MenuItem {
  /** Unique menu item identifier */
  id: string;
  /** Display text */
  text: string;
  /** Menu item icon/emoji */
  icon?: string;
  /** Whether item is enabled */
  enabled?: boolean;
  /** Submenu items (if any) */
  submenu?: MenuItem[];
  /** Action callback */
  action?: () => void;
  /** Keyboard shortcut */
  shortcut?: string;
  /** Description for accessibility */
  description?: string;
}

/**
 * Menu configuration interface
 */
interface MenuConfig {
  /** Whether menu wraps around */
  wrapAround: boolean;
  /** Whether to show keyboard shortcuts */
  showShortcuts: boolean;
  /** Whether to animate menu transitions */
  animateTransitions: boolean;
  /** Sound effect for navigation */
  navigationSound?: string;
  /** Sound effect for selection */
  selectionSound?: string;
}

/**
 * Menu state interface
 */
interface MenuState {
  /** Current menu depth level */
  depth: number;
  /** Selected index at each depth level */
  selectedIndices: number[];
  /** Menu history for navigation back */
  menuHistory: MenuItem[][];
  /** Current menu items */
  currentItems: MenuItem[];
  /** Is menu transitioning */
  transitioning: boolean;
}

/**
 * Default menu structure
 */
const DEFAULT_MENU_STRUCTURE: MenuItem[] = [
  {
    id: 'items',
    text: 'Items',
    icon: '🎒',
    submenu: [
      { id: 'use_item', text: 'Use Item', shortcut: 'A' },
      { id: 'equip_item', text: 'Equip Item', shortcut: 'E' },
      { id: 'drop_item', text: 'Drop Item', shortcut: 'D' },
      { id: 'sort_items', text: 'Sort Items', shortcut: 'S' }
    ]
  },
  {
    id: 'skills',
    text: 'Skills',
    icon: '⚔️',
    submenu: [
      { id: 'view_skills', text: 'View Skills', shortcut: 'V' },
      { id: 'assign_skills', text: 'Assign Skills', shortcut: 'A' },
      { id: 'skill_tree', text: 'Skill Tree', shortcut: 'T' }
    ]
  },
  {
    id: 'equipment',
    text: 'Equipment',
    icon: '🛡️',
    submenu: [
      { id: 'view_equipment', text: 'View Equipment', shortcut: 'V' },
      { id: 'change_equipment', text: 'Change Equipment', shortcut: 'C' },
      { id: 'upgrade_equipment', text: 'Upgrade Equipment', shortcut: 'U' }
    ]
  },
  {
    id: 'status',
    text: 'Status',
    icon: '📊',
    submenu: [
      { id: 'character_status', text: 'Character Status', shortcut: 'C' },
      { id: 'party_status', text: 'Party Status', shortcut: 'P' },
      { id: 'achievements', text: 'Achievements', shortcut: 'A' }
    ]
  },
  {
    id: 'config',
    text: 'Config',
    icon: '⚙️',
    submenu: [
      { id: 'audio_settings', text: 'Audio Settings', shortcut: 'A' },
      { id: 'display_settings', text: 'Display Settings', shortcut: 'D' },
      { id: 'control_settings', text: 'Control Settings', shortcut: 'C' },
      { id: 'game_settings', text: 'Game Settings', shortcut: 'G' }
    ]
  },
  {
    id: 'save',
    text: 'Save Game',
    icon: '💾',
    shortcut: 'S'
  },
  {
    id: 'load',
    text: 'Load Game',
    icon: '📂',
    shortcut: 'L'
  },
  {
    id: 'quit',
    text: 'Quit Game',
    icon: '🚪',
    shortcut: 'Q'
  }
];

/**
 * Menu Item Component
 */
const MenuItemComponent: React.FC<{
  item: MenuItem;
  isSelected: boolean;
  index: number;
  showShortcut?: boolean;
  onSelect: () => void;
}> = memo(({ item, isSelected, index, showShortcut, onSelect }) => {
  const itemStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 20px',
    margin: '4px 0',
    backgroundColor: isSelected ? '#444444' : 'transparent',
    border: isSelected ? '2px solid #666666' : '2px solid transparent',
    borderRadius: '8px',
    cursor: item.enabled !== false ? 'pointer' : 'not-allowed',
    transition: 'all 0.2s ease',
    opacity: item.enabled === false ? 0.5 : 1,
    color: '#FFFFFF',
    fontSize: '16px',
    fontFamily: 'monospace'
  };

  const iconStyle: React.CSSProperties = {
    fontSize: '20px',
    marginRight: '12px',
    minWidth: '24px',
    textAlign: 'center'
  };

  const textContainerStyle: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  };

  const shortcutStyle: React.CSSProperties = {
    backgroundColor: '#333333',
    border: '1px solid #555555',
    borderRadius: '4px',
    padding: '2px 8px',
    fontSize: '12px',
    color: '#CCCCCC',
    marginLeft: '12px'
  };

  return (
    <div
      style={itemStyle}
      onClick={onSelect}
      role="menuitem"
      aria-selected={isSelected}
      aria-disabled={item.enabled === false}
      aria-label={`${item.text}${item.description ? ` - ${item.description}` : ''}`}
      tabIndex={isSelected ? 0 : -1}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
    >
      {item.icon && <span style={iconStyle}>{item.icon}</span>}
      <div style={textContainerStyle}>
        <span>{item.text}</span>
        {showShortcut && item.shortcut && (
          <span style={shortcutStyle}>{item.shortcut}</span>
        )}
      </div>
    </div>
  );
});

MenuItemComponent.displayName = 'MenuItemComponent';

/**
 * Menu Container Component
 */
const MenuContainer: React.FC<{
  title: string;
  items: MenuItem[];
  selectedIndex: number;
  onSelectionChange: (index: number) => void;
  onItemSelect: (item: MenuItem, index: number) => void;
  onBack: () => void;
  config: MenuConfig;
  depth: number;
}> = memo(({ title, items, selectedIndex, onSelectionChange, onItemSelect, onBack, config, depth }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Focus management for accessibility
  useEffect(() => {
    if (containerRef.current) {
      const selectedItem = containerRef.current.children[selectedIndex] as HTMLElement;
      if (selectedItem) {
        selectedItem.focus();
      }
    }
  }, [selectedIndex]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowUp':
      case 'w':
        e.preventDefault();
        const prevIndex = selectedIndex > 0 ? selectedIndex - 1 : (config.wrapAround ? items.length - 1 : 0);
        onSelectionChange(prevIndex);
        break;

      case 'ArrowDown':
      case 's':
        e.preventDefault();
        const nextIndex = selectedIndex < items.length - 1 ? selectedIndex + 1 : (config.wrapAround ? 0 : items.length - 1);
        onSelectionChange(nextIndex);
        break;

      case 'ArrowLeft':
      case 'a':
        if (depth > 0) {
          e.preventDefault();
          onBack();
        }
        break;

      case 'Enter':
      case ' ':
      case 'z':
      case 'x':
        e.preventDefault();
        const selectedItem = items[selectedIndex];
        onItemSelect(selectedItem, selectedIndex);
        break;

      case 'Escape':
        e.preventDefault();
        onBack();
        break;
    }
  }, [selectedIndex, items, config.wrapAround, depth, onSelectionChange, onItemSelect, onBack]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const containerStyle: React.CSSProperties = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    border: '3px solid #555555',
    borderRadius: '12px',
    padding: '20px',
    minWidth: '300px',
    maxWidth: '500px',
    maxHeight: '80vh',
    overflowY: 'auto',
    fontFamily: 'monospace',
    color: '#FFFFFF',
    zIndex: 300 + depth,
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.8)',
    transition: config.animateTransitions ? 'all 0.3s ease' : 'none'
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '16px',
    textAlign: 'center',
    color: '#FFD700',
    textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
    borderBottom: '2px solid #444444',
    paddingBottom: '8px'
  };

  const backButtonStyle: React.CSSProperties = {
    position: 'absolute',
    top: '10px',
    left: '10px',
    backgroundColor: 'transparent',
    border: '2px solid #666666',
    borderRadius: '6px',
    padding: '6px 12px',
    color: '#CCCCCC',
    cursor: 'pointer',
    fontSize: '14px',
    fontFamily: 'monospace',
    display: depth > 0 ? 'block' : 'none'
  };

  return (
    <div style={containerStyle} ref={containerRef}>
      {depth > 0 && (
        <button
          style={backButtonStyle}
          onClick={onBack}
          aria-label="Go back"
        >
          ← Back
        </button>
      )}
      
      <div style={titleStyle}>{title}</div>
      
      <div role="menu" aria-label={title}>
        {items.map((item, index) => (
          <MenuItemComponent
            key={item.id}
            item={item}
            isSelected={index === selectedIndex}
            index={index}
            showShortcut={config.showShortcuts && depth === 0}
            onSelect={() => onItemSelect(item, index)}
          />
        ))}
      </div>
    </div>
  );
});

MenuContainer.displayName = 'MenuContainer';

/**
 * Main Menu System Component
 */
export const MenuSystem: React.FC = memo(() => {
  const { mainMenuVisible, setMainMenuVisible } = useMenuVisibility();
  const [menuState, setMenuState] = useState<MenuState>({
    depth: 0,
    selectedIndices: [0],
    menuHistory: [],
    currentItems: DEFAULT_MENU_STRUCTURE,
    transitioning: false
  });

  const [config] = useState<MenuConfig>({
    wrapAround: true,
    showShortcuts: true,
    animateTransitions: true,
    navigationSound: 'menu_navigate',
    selectionSound: 'menu_select'
  });

  // Get current selected index
  const getCurrentSelectedIndex = useCallback(() => {
    return menuState.selectedIndices[menuState.depth] || 0;
  }, [menuState.depth, menuState.selectedIndices]);

  // Update selected index
  const updateSelectedIndex = useCallback((newIndex: number) => {
    setMenuState(prev => {
      const newSelectedIndices = [...prev.selectedIndices];
      newSelectedIndices[prev.depth] = newIndex;
      return {
        ...prev,
        selectedIndices: newSelectedIndices
      };
    });

    // Play navigation sound
    if (config.navigationSound) {
      logger.debug(LogSource.UI, `Playing navigation sound: ${config.navigationSound}`);
    }
  }, [config.navigationSound]);

  // Handle item selection
  const handleItemSelect = useCallback((item: MenuItem, index: number) => {
    logger.debug(LogSource.UI, `Selected menu item: ${item.text} (${item.id})`);

    // Play selection sound
    if (config.selectionSound) {
      logger.debug(LogSource.UI, `Playing selection sound: ${config.selectionSound}`);
    }

    if (item.submenu && item.submenu.length > 0) {
      // Navigate to submenu
      setMenuState(prev => ({
        ...prev,
        depth: prev.depth + 1,
        selectedIndices: [...prev.selectedIndices, 0],
        currentItems: item.submenu!,
        menuHistory: [...prev.menuHistory, item],
        transitioning: true
      }));

      // Clear transition flag after animation
      setTimeout(() => {
        setMenuState(prev => ({ ...prev, transitioning: false }));
      }, 300);

    } else if (item.action) {
      // Execute action
      item.action();
    } else {
      // Handle built-in actions
      handleBuiltInAction(item.id);
    }
  }, [config.selectionSound]);

  // Handle built-in menu actions
  const handleBuiltInAction = useCallback((actionId: string) => {
    switch (actionId) {
      case 'save':
        logger.info(LogSource.UI, 'Save game requested');
        // Trigger save dialog
        break;

      case 'load':
        logger.info(LogSource.UI, 'Load game requested');
        // Trigger load dialog
        break;

      case 'quit':
        logger.info(LogSource.UI, 'Quit game requested');
        if (confirm('Are you sure you want to quit the game?')) {
          // Trigger quit
          window.location.href = '/';
        }
        break;

      default:
        logger.debug(LogSource.UI, `Unhandled menu action: ${actionId}`);
        break;
    }
  }, []);

  // Handle navigation back
  const handleBack = useCallback(() => {
    if (menuState.depth > 0) {
      setMenuState(prev => ({
        ...prev,
        depth: prev.depth - 1,
        selectedIndices: prev.selectedIndices.slice(0, -1),
        currentItems: prev.menuHistory[prev.menuHistory.length - 1]?.submenu || DEFAULT_MENU_STRUCTURE,
        menuHistory: prev.menuHistory.slice(0, -1),
        transitioning: true
      }));

      // Clear transition flag after animation
      setTimeout(() => {
        setMenuState(prev => ({ ...prev, transitioning: false }));
      }, 300);
    }
  }, [menuState.depth, menuState.menuHistory]);

  // Close menu
  const closeMenu = useCallback(() => {
    setMainMenuVisible(false);
    
    // Reset menu state after closing
    setTimeout(() => {
      setMenuState({
        depth: 0,
        selectedIndices: [0],
        menuHistory: [],
        currentItems: DEFAULT_MENU_STRUCTURE,
        transitioning: false
      });
    }, 300);
  }, [setMainMenuVisible]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!mainMenuVisible) return;

      // Global menu shortcuts
      if (e.key === 'Escape' || e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        closeMenu();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mainMenuVisible, closeMenu]);

  // Handle menu visibility changes
  useEffect(() => {
    if (mainMenuVisible) {
      logger.info(LogSource.UI, 'Menu opened');
      // Pause game when menu is open
      document.body.style.overflow = 'hidden';
    } else {
      logger.info(LogSource.UI, 'Menu closed');
      // Resume game when menu is closed
      document.body.style.overflow = '';
    }
  }, [mainMenuVisible]);

  if (!mainMenuVisible) return null;

  // Get current menu title
  const getCurrentMenuTitle = () => {
    if (menuState.depth === 0) return 'Main Menu';
    const parentItem = menuState.menuHistory[menuState.depth - 1];
    return parentItem ? parentItem.text : 'Menu';
  };

  return (
    <>
      {/* Dark overlay */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          zIndex: 299,
          transition: 'opacity 0.3s ease'
        }}
        onClick={closeMenu}
        aria-label="Close menu"
      />

      {/* Menu container */}
      <MenuContainer
        title={getCurrentMenuTitle()}
        items={menuState.currentItems}
        selectedIndex={getCurrentSelectedIndex()}
        onSelectionChange={updateSelectedIndex}
        onItemSelect={handleItemSelect}
        onBack={handleBack}
        config={config}
        depth={menuState.depth}
      />

      {/* Menu hints */}
      <div
        style={{
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
          zIndex: 301
        }}
      >
        ↑↓ Navigate | Enter/Space Select | Esc/Back Close
      </div>
    </>
  );
});

MenuSystem.displayName = 'MenuSystem';

export default MenuSystem;