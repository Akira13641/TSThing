/**
 * Keyboard Input Hook
 * @fileoverview React hook for handling keyboard input events
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { InputAction } from '../types';
import { logger, LogSource } from '../engine/GlobalLogger';

/**
 * Keyboard mapping configuration
 */
interface KeyboardMapping {
  [key: string]: InputAction;
}

/**
 * Keyboard state interface
 */
interface KeyboardState {
  /** Currently pressed keys */
  pressedKeys: Set<string>;
  /** Just pressed keys (this frame only) */
  justPressedKeys: Set<string>;
  /** Just released keys (this frame only) */
  justReleasedKeys: Set<string>;
}

/**
 * Keyboard input hook configuration
 */
interface UseKeyboardInputConfig {
  /** Custom keyboard mapping */
  mapping?: KeyboardMapping;
  /** Whether to prevent default browser behavior */
  preventDefault?: boolean;
  /** Whether to log keyboard events */
  enableLogging?: boolean;
  /** Debounce time in milliseconds */
  debounceTime?: number;
}

/**
 * Default keyboard mapping
 */
const DEFAULT_KEYBOARD_MAPPING: KeyboardMapping = {
  // Arrow keys
  'ArrowUp': InputAction.MOVE_UP,
  'ArrowDown': InputAction.MOVE_DOWN,
  'ArrowLeft': InputAction.MOVE_LEFT,
  'ArrowRight': InputAction.MOVE_RIGHT,
  
  // WASD keys
  'w': InputAction.MOVE_UP,
  's': InputAction.MOVE_DOWN,
  'a': InputAction.MOVE_LEFT,
  'd': InputAction.MOVE_RIGHT,
  'W': InputAction.MOVE_UP,
  'S': InputAction.MOVE_DOWN,
  'A': InputAction.MOVE_LEFT,
  'D': InputAction.MOVE_RIGHT,
  
  // Action keys
  'Enter': InputAction.CONFIRM,
  ' ': InputAction.CONFIRM,
  'z': InputAction.CONFIRM,
  'Z': InputAction.CONFIRM,
  'x': InputAction.CANCEL,
  'X': InputAction.CANCEL,
  'Escape': InputAction.CANCEL,
  'Tab': InputAction.MENU,
  'm': InputAction.MENU,
  'M': InputAction.MENU,
  'p': InputAction.START,
  'P': InputAction.START,
  'Shift': InputAction.SELECT,
  'Control': InputAction.SELECT,
  'Alt': InputAction.SELECT
};

/**
 * React hook for keyboard input handling
 * @param config - Hook configuration
 * @returns Keyboard input state and utility functions
 */
export function useKeyboardInput(config: UseKeyboardInputConfig = {}) {
  const {
    mapping = DEFAULT_KEYBOARD_MAPPING,
    preventDefault = true,
    enableLogging = false,
    debounceTime = 0
  } = config;

  const [keyboardState, setKeyboardState] = useState<KeyboardState>({
    pressedKeys: new Set(),
    justPressedKeys: new Set(),
    justReleasedKeys: new Set()
  });

  const previousKeysRef = useRef<Set<string>>(new Set());
  const debounceTimeoutRef = useRef<Map<string, number>>(new Map());

  // Update just pressed/released state
  const updateEdgeStates = useCallback(() => {
    const currentKeys = keyboardState.pressedKeys;
    const previousKeys = previousKeysRef.current;

    const justPressed = new Set<string>();
    const justReleased = new Set<string>();

    // Find newly pressed keys
    for (const key of currentKeys) {
      if (!previousKeys.has(key)) {
        justPressed.add(key);
      }
    }

    // Find newly released keys
    for (const key of previousKeys) {
      if (!currentKeys.has(key)) {
        justReleased.add(key);
      }
    }

    setKeyboardState(prev => ({
      ...prev,
      justPressedKeys: justPressed,
      justReleasedKeys: justReleased
    }));

    previousKeysRef.current = new Set(currentKeys);
  }, [keyboardState.pressedKeys]);

  // Handle key down event
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const key = event.key;
    
    // Check if key is in mapping
    if (!(key in mapping)) {
      return;
    }

    // Prevent default behavior if requested
    if (preventDefault) {
      event.preventDefault();
    }

    // Debounce if configured
    if (debounceTime > 0) {
      const timeout = debounceTimeoutRef.current.get(key);
      if (timeout) {
        clearTimeout(timeout);
      }

      const newTimeout = window.setTimeout(() => {
        setKeyboardState(prev => ({
          ...prev,
          pressedKeys: new Set(prev.pressedKeys).add(key)
        }));
      }, debounceTime);

      debounceTimeoutRef.current.set(key, newTimeout);
      return;
    }

    // Add key to pressed set
    setKeyboardState(prev => ({
      ...prev,
      pressedKeys: new Set(prev.pressedKeys).add(key)
    }));

    if (enableLogging) {
      logger.debug(LogSource.INPUT, `Key pressed: ${key}`);
    }
  }, [mapping, preventDefault, enableLogging, debounceTime]);

  // Handle key up event
  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    const key = event.key;
    
    // Check if key is in mapping
    if (!(key in mapping)) {
      return;
    }

    // Prevent default behavior if requested
    if (preventDefault) {
      event.preventDefault();
    }

    // Clear debounce timeout
    if (debounceTime > 0) {
      const timeout = debounceTimeoutRef.current.get(key);
      if (timeout) {
        clearTimeout(timeout);
        debounceTimeoutRef.current.delete(key);
      }
    }

    // Remove key from pressed set
    setKeyboardState(prev => ({
      ...prev,
      pressedKeys: new Set(prev.pressedKeys).delete(key) ? prev.pressedKeys : new Set(prev.pressedKeys)
    }));

    if (enableLogging) {
      logger.debug(LogSource.INPUT, `Key released: ${key}`);
    }
  }, [mapping, preventDefault, enableLogging, debounceTime]);

  // Check if an action is currently active
  const isActionPressed = useCallback((action: InputAction): boolean => {
    for (const [key, mappedAction] of Object.entries(mapping)) {
      if (mappedAction === action && keyboardState.pressedKeys.has(key)) {
        return true;
      }
    }
    return false;
  }, [mapping, keyboardState.pressedKeys]);

  // Check if an action was just pressed this frame
  const isActionJustPressed = useCallback((action: InputAction): boolean => {
    for (const [key, mappedAction] of Object.entries(mapping)) {
      if (mappedAction === action && keyboardState.justPressedKeys.has(key)) {
        return true;
      }
    }
    return false;
  }, [mapping, keyboardState.justPressedKeys]);

  // Check if an action was just released this frame
  const isActionJustReleased = useCallback((action: InputAction): boolean => {
    for (const [key, mappedAction] of Object.entries(mapping)) {
      if (mappedAction === action && keyboardState.justReleasedKeys.has(key)) {
        return true;
      }
    }
    return false;
  }, [mapping, keyboardState.justReleasedKeys]);

  // Get all currently active actions
  const getActiveActions = useCallback((): InputAction[] => {
    const activeActions: InputAction[] = [];
    for (const [key, action] of Object.entries(mapping)) {
      if (keyboardState.pressedKeys.has(key)) {
        activeActions.push(action);
      }
    }
    return activeActions;
  }, [mapping, keyboardState.pressedKeys]);

  // Clear all input
  const clearInput = useCallback(() => {
    setKeyboardState({
      pressedKeys: new Set(),
      justPressedKeys: new Set(),
      justReleasedKeys: new Set()
    });
    previousKeysRef.current = new Set();
    
    // Clear all debounce timeouts
    for (const timeout of debounceTimeoutRef.current.values()) {
      clearTimeout(timeout);
    }
    debounceTimeoutRef.current.clear();

    if (enableLogging) {
      logger.debug(LogSource.INPUT, 'Keyboard input cleared');
    }
  }, [enableLogging]);

  // Set up event listeners
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown, { passive: !preventDefault });
    window.addEventListener('keyup', handleKeyUp, { passive: !preventDefault });

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      
      // Cleanup timeouts
      for (const timeout of debounceTimeoutRef.current.values()) {
        clearTimeout(timeout);
      }
      debounceTimeoutRef.current.clear();
    };
  }, [handleKeyDown, handleKeyUp, preventDefault]);

  // Update edge states every frame
  useEffect(() => {
    const updateInterval = setInterval(updateEdgeStates, 16); // ~60fps
    
    return () => {
      clearInterval(updateInterval);
    };
  }, [updateEdgeStates]);

  return {
    /** Current keyboard state */
    state: keyboardState,
    /** Check if action is pressed */
    isActionPressed,
    /** Check if action was just pressed */
    isActionJustPressed,
    /** Check if action was just released */
    isActionJustReleased,
    /** Get all active actions */
    getActiveActions,
    /** Clear all input */
    clearInput
  };
}

/**
 * Simple keyboard hook for basic use cases
 * @param keys - Array of keys to track
 * @returns Object with key states
 */
export function useSimpleKeyboard(keys: string[]): Record<string, boolean> {
  const [keyStates, setKeyStates] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    keys.forEach(key => {
      initial[key] = false;
    });
    return initial;
  });

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (keys.includes(event.key)) {
        setKeyStates(prev => ({ ...prev, [event.key]: true }));
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (keys.includes(event.key)) {
        setKeyStates(prev => ({ ...prev, [event.key]: false }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [keys]);

  return keyStates;
}