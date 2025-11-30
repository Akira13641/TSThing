/**
 * UI State Management Store
 * @fileoverview Centralized state management for UI-only concerns (not game simulation state)
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

/**
 * UI state interface for all UI-related state
 */
interface UIState {
  /** Whether main menu is visible */
  mainMenuVisible: boolean;
  /** Whether pause menu is visible */
  pauseMenuVisible: boolean;
  /** Whether inventory screen is visible */
  inventoryVisible: boolean;
  /** Whether dialog box is visible */
  dialogVisible: boolean;
  /** Current dialog text */
  dialogText: string;
  /** Whether battle menu is visible */
  battleMenuVisible: boolean;
  /** Current selected menu index */
  selectedMenuIndex: number;
  /** Whether debug overlay is visible */
  debugOverlayVisible: boolean;
  /** Whether logger overlay is visible */
  loggerOverlayVisible: boolean;
  /** Current game scene */
  currentScene: 'TITLE' | 'OVERWORLD' | 'BATTLE' | 'MENU' | 'CUTSCENE';
  /** Screen transition state */
  screenTransition: {
    active: boolean;
    type: 'fade' | 'slide';
    progress: number;
  };
}

/**
 * UI actions interface for state mutations
 */
interface UIActions {
  /** Shows/hides main menu */
  setMainMenuVisible: (visible: boolean) => void;
  /** Shows/hides pause menu */
  setPauseMenuVisible: (visible: boolean) => void;
  /** Shows/hides inventory */
  setInventoryVisible: (visible: boolean) => void;
  /** Shows/hides dialog */
  setDialogVisible: (visible: boolean, text?: string) => void;
  /** Shows/hides battle menu */
  setBattleMenuVisible: (visible: boolean) => void;
  /** Sets selected menu index */
  setSelectedMenuIndex: (index: number) => void;
  /** Shows/hides debug overlay */
  setDebugOverlayVisible: (visible: boolean) => void;
  /** Shows/hides logger overlay */
  setLoggerOverlayVisible: (visible: boolean) => void;
  /** Sets current game scene */
  setCurrentScene: (scene: UIState['currentScene']) => void;
  /** Starts screen transition */
  startScreenTransition: (type: UIState['screenTransition']['type']) => void;
  /** Updates screen transition progress */
  updateScreenTransition: (progress: number) => void;
  /** Completes screen transition */
  completeScreenTransition: () => void;
  /** Resets all UI state */
  resetUIState: () => void;
}

/**
 * Initial UI state
 */
const initialUIState: UIState = {
  mainMenuVisible: false,
  pauseMenuVisible: false,
  inventoryVisible: false,
  dialogVisible: false,
  dialogText: '',
  battleMenuVisible: false,
  selectedMenuIndex: 0,
  debugOverlayVisible: false,
  loggerOverlayVisible: false,
  currentScene: 'TITLE',
  screenTransition: {
    active: false,
    type: 'fade',
    progress: 0
  }
};

/**
 * UI state store using Zustand
 * Manages all UI-only state, separate from game simulation state
 */
export const useUIStore = create<UIState & UIActions>()(
  subscribeWithSelector((set, get) => ({
    ...initialUIState,

    // Menu visibility actions
    setMainMenuVisible: (visible: boolean) => 
      set({ mainMenuVisible: visible }),

    setPauseMenuVisible: (visible: boolean) => 
      set({ pauseMenuVisible: visible }),

    setInventoryVisible: (visible: boolean) => 
      set({ inventoryVisible: visible }),

    setDialogVisible: (visible: boolean, text?: string) => 
      set({ 
        dialogVisible: visible,
        dialogText: text || get().dialogText
      }),

    setBattleMenuVisible: (visible: boolean) => 
      set({ battleMenuVisible: visible }),

    // Menu navigation actions
    setSelectedMenuIndex: (index: number) => 
      set({ selectedMenuIndex: index }),

    // Overlay actions
    setDebugOverlayVisible: (visible: boolean) => 
      set({ debugOverlayVisible: visible }),

    setLoggerOverlayVisible: (visible: boolean) => 
      set({ loggerOverlayVisible: visible }),

    // Scene management
    setCurrentScene: (scene: UIState['currentScene']) => 
      set({ currentScene: scene }),

    // Screen transition actions
    startScreenTransition: (type: UIState['screenTransition']['type']) =>
      set({
        screenTransition: {
          active: true,
          type,
          progress: 0
        }
      }),

    updateScreenTransition: (progress: number) =>
      set(state => ({
        screenTransition: {
          ...state.screenTransition,
          progress
        }
      })),

    completeScreenTransition: () =>
      set({
        screenTransition: {
          active: false,
          type: 'fade',
          progress: 0
        }
      }),

    // Reset action
    resetUIState: () => set(initialUIState)
  }))
);

/**
 * Selector hooks for specific UI state
 * These provide more granular subscriptions for better performance
 */

/**
 * Hook for menu visibility states
 * @returns Menu visibility states
 */
export const useMenuVisibility = () => {
  const state = useUIStore();
  return {
    mainMenuVisible: state.mainMenuVisible,
    pauseMenuVisible: state.pauseMenuVisible,
    inventoryVisible: state.inventoryVisible,
    battleMenuVisible: state.battleMenuVisible,
    setMainMenuVisible: state.setMainMenuVisible
  };
};

/**
 * Hook for overlay visibility states
 * @returns Overlay visibility states
 */
export const useOverlayVisibility = () => {
  return useUIStore(state => ({
    dialogVisible: state.dialogVisible,
    debugOverlayVisible: state.debugOverlayVisible,
    loggerOverlayVisible: state.loggerOverlayVisible
  }));
};

/**
 * Hook for dialog state
 * @returns Dialog state
 */
export const useDialogState = () => {
  return useUIStore(state => ({
    visible: state.dialogVisible,
    text: state.dialogText
  }));
};

/**
 * Hook for screen transition state
 * @returns Screen transition state
 */
export const useScreenTransition = () => {
  return useUIStore(state => state.screenTransition);
};

/**
 * Hook for current scene
 * @returns Current game scene
 */
export const useCurrentScene = () => {
  return useUIStore(state => state.currentScene);
};

/**
 * Hook for menu navigation
 * @returns Menu navigation state
 */
export const useMenuNavigation = () => {
  return useUIStore(state => ({
    selectedIndex: state.selectedMenuIndex,
    setSelectedIndex: state.setSelectedMenuIndex
  }));
};