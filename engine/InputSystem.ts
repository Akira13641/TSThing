/**
 * Input System for Aetherial Vanguard
 * @fileoverview Comprehensive input handling for keyboard, gamepad, and touch controls
 */

import { InputAction } from '../types';
import { logger, LogSource } from './GlobalLogger';

/**
 * Input state interface
 */
interface InputState {
  /** Current pressed states for each action */
  actions: Map<InputAction, boolean>;
  /** Just pressed states (true for one frame) */
  justPressed: Map<InputAction, boolean>;
  /** Just released states (true for one frame) */
  justReleased: Map<InputAction, boolean>;
}

/**
 * Keyboard mapping configuration
 */
interface KeyboardMapping {
  [key: string]: InputAction;
}

/**
 * Gamepad mapping configuration
 */
interface GamepadMapping {
  [button: number]: InputAction;
  axes: {
    [axis: number]: {
      negative: InputAction;
      positive: InputAction;
      threshold: number;
    };
  };
}

/**
 * Touch control configuration
 */
interface TouchConfig {
  /** Dead zone for D-pad */
  deadZone: number;
  /** Touch sensitivity */
  sensitivity: number;
  /** D-pad radius */
  dPadRadius: number;
  /** Button size */
  buttonSize: number;
}

/**
 * Virtual button position
 */
interface VirtualButton {
  /** Action this button triggers */
  action: InputAction;
  /** Button X position */
  x: number;
  /** Button Y position */
  y: number;
  /** Button width */
  width: number;
  /** Button height */
  height: number;
  /** Whether button is currently pressed */
  pressed: boolean;
  /** Touch ID currently pressing this button */
  touchId: number | null;
}

/**
 * D-pad state
 */
interface DPadState {
  /** D-pad center X */
  centerX: number;
  /** D-pad center Y */
  centerY: number;
  /** Current X direction (-1, 0, 1) */
  directionX: number;
  /** Current Y direction (-1, 0, 1) */
  directionY: number;
  /** Touch ID currently on D-pad */
  touchId: number | null;
}

/**
 * Input System class
 * Provides unified input handling across keyboard, gamepad, and touch controls
 */
export class InputSystem {
  /** Current input state */
  private state: InputState;
  
  /** Previous input state for edge detection */
  private previousState: InputState;
  
  /** Keyboard mapping */
  private keyboardMapping!: KeyboardMapping;
  
  /** Gamepad mapping */
  private gamepadMapping!: GamepadMapping;
  
  /** Touch configuration */
  private touchConfig!: TouchConfig;
  
  /** Virtual buttons */
  private virtualButtons!: Map<InputAction, VirtualButton>;
  
  /** D-pad state */
  private dPad!: DPadState;
  
  /** Event listeners */
  private listeners: Map<string, (evt: Event) => void>;
  
  /** Whether input system is enabled */
  private enabled: boolean;

  /**
   * Creates a new InputSystem instance
   */
  constructor() {
    this.state = {
      actions: new Map(),
      justPressed: new Map(),
      justReleased: new Map()
    };

    this.previousState = {
      actions: new Map(),
      justPressed: new Map(),
      justReleased: new Map()
    };

    this.listeners = new Map();
    this.enabled = false;

    // Setup default mappings
    this.setupDefaultMappings();
    
    // Setup touch controls
    this.setupTouchControls();

    // Initialize all actions to false
    Object.values(InputAction).forEach(action => {
      this.state.actions.set(action, false);
      this.state.justPressed.set(action, false);
      this.state.justReleased.set(action, false);
      this.previousState.actions.set(action, false);
      this.previousState.justPressed.set(action, false);
      this.previousState.justReleased.set(action, false);
    });

    logger.info(LogSource.INPUT, 'InputSystem initialized');
  }

  /**
   * Sets up default keyboard and gamepad mappings
   */
  private setupDefaultMappings(): void {
    // Keyboard mapping
    this.keyboardMapping = {
      'ArrowUp': InputAction.MOVE_UP,
      'ArrowDown': InputAction.MOVE_DOWN,
      'ArrowLeft': InputAction.MOVE_LEFT,
      'ArrowRight': InputAction.MOVE_RIGHT,
      'w': InputAction.MOVE_UP,
      's': InputAction.MOVE_DOWN,
      'a': InputAction.MOVE_LEFT,
      'd': InputAction.MOVE_RIGHT,
      'Enter': InputAction.CONFIRM,
      ' ': InputAction.CONFIRM,
      'z': InputAction.CONFIRM,
      'Escape': InputAction.CANCEL,
      'x': InputAction.CANCEL,
      'Tab': InputAction.MENU,
      'm': InputAction.MENU,
      'p': InputAction.START,
      'Shift': InputAction.SELECT
    };

    // Gamepad mapping
    this.gamepadMapping = {
      axes: {
        0: { // Left stick X
          negative: InputAction.MOVE_LEFT,
          positive: InputAction.MOVE_RIGHT,
          threshold: 0.5
        },
        1: { // Left stick Y
          negative: InputAction.MOVE_UP,
          positive: InputAction.MOVE_DOWN,
          threshold: 0.5
        }
      }
    };

    // Map common gamepad buttons
    const gamepadButtons: [number, InputAction][] = [
      [0, InputAction.CONFIRM], // A button
      [1, InputAction.CANCEL],  // B button
      [2, InputAction.CANCEL],  // X button
      [3, InputAction.MENU],    // Y button
      [9, InputAction.START],   // Start button
      [8, InputAction.SELECT]   // Select button
    ];

    gamepadButtons.forEach(([button, action]) => {
      this.gamepadMapping[button] = action;
    });
  }

  /**
   * Sets up touch control configuration
   */
  private setupTouchControls(): void {
    this.touchConfig = {
      deadZone: 0.3,
      sensitivity: 1.0,
      dPadRadius: 60,
      buttonSize: 50
    };

    // Initialize D-pad
    this.dPad = {
      centerX: 100,
      centerY: 400,
      directionX: 0,
      directionY: 0,
      touchId: null
    };

    // Initialize virtual buttons
    this.virtualButtons = new Map();
    
    // Right side buttons
    const buttonX = 700;
    const buttonY = 350;
    const spacing = 70;

    // A button (bottom right)
    this.virtualButtons.set(InputAction.CONFIRM, {
      action: InputAction.CONFIRM,
      x: buttonX + spacing,
      y: buttonY + spacing,
      width: this.touchConfig.buttonSize,
      height: this.touchConfig.buttonSize,
      pressed: false,
      touchId: null
    });

    // B button (bottom left)
    this.virtualButtons.set(InputAction.CANCEL, {
      action: InputAction.CANCEL,
      x: buttonX - spacing,
      y: buttonY + spacing,
      width: this.touchConfig.buttonSize,
      height: this.touchConfig.buttonSize,
      pressed: false,
      touchId: null
    });

    // X button (top right)
    this.virtualButtons.set(InputAction.MENU, {
      action: InputAction.MENU,
      x: buttonX + spacing,
      y: buttonY - spacing,
      width: this.touchConfig.buttonSize,
      height: this.touchConfig.buttonSize,
      pressed: false,
      touchId: null
    });

    // Y button (top left)
    this.virtualButtons.set(InputAction.SELECT, {
      action: InputAction.SELECT,
      x: buttonX - spacing,
      y: buttonY - spacing,
      width: this.touchConfig.buttonSize,
      height: this.touchConfig.buttonSize,
      pressed: false,
      touchId: null
    });

    // Start button
    this.virtualButtons.set(InputAction.START, {
      action: InputAction.START,
      x: 400,
      y: 450,
      width: 60,
      height: 30,
      pressed: false,
      touchId: null
    });
  }

  /**
   * Enables the input system
   */
  public enable(): void {
    if (this.enabled) {
      logger.warn(LogSource.INPUT, 'InputSystem is already enabled');
      return;
    }

    this.enabled = true;
    this.setupEventListeners();

    logger.info(LogSource.INPUT, 'InputSystem enabled');
  }

  /**
   * Disables the input system
   */
  public disable(): void {
    if (!this.enabled) {
      logger.warn(LogSource.INPUT, 'InputSystem is not enabled');
      return;
    }

    this.enabled = false;
    this.removeEventListeners();
    this.clearAllInput();

    logger.info(LogSource.INPUT, 'InputSystem disabled');
  }

  /**
   * Sets up event listeners
   */
  private setupEventListeners(): void {
    // Keyboard events
    const keyDownHandler = (e: KeyboardEvent) => this.handleKeyDown(e);
    const keyUpHandler = (e: KeyboardEvent) => this.handleKeyUp(e);

    document.addEventListener('keydown', keyDownHandler);
    document.addEventListener('keyup', keyUpHandler);

    this.listeners.set('keydown', keyDownHandler as (evt: Event) => void);
    this.listeners.set('keyup', keyUpHandler as (evt: Event) => void);

    // Touch events
    const touchStartHandler = (e: TouchEvent) => this.handleTouchStart(e);
    const touchMoveHandler = (e: TouchEvent) => this.handleTouchMove(e);
    const touchEndHandler = (e: TouchEvent) => this.handleTouchEnd(e);

    document.addEventListener('touchstart', touchStartHandler, { passive: false });
    document.addEventListener('touchmove', touchMoveHandler, { passive: false });
    document.addEventListener('touchend', touchEndHandler, { passive: false });

    this.listeners.set('touchstart', touchStartHandler as (evt: Event) => void);
    this.listeners.set('touchmove', touchMoveHandler as (evt: Event) => void);
    this.listeners.set('touchend', touchEndHandler as (evt: Event) => void);
  }

  /**
   * Removes event listeners
   */
  private removeEventListeners(): void {
    this.listeners.forEach((handler, event) => {
      document.removeEventListener(event, handler);
    });
    this.listeners.clear();
  }

  /**
   * Handles keyboard key down events
   * @param event - Keyboard event
   */
  private handleKeyDown(event: KeyboardEvent): void {
    if (!this.enabled) return;

    const action = this.keyboardMapping[event.key];
    if (action) {
      event.preventDefault();
      this.setAction(action, true);
    }
  }

  /**
   * Handles keyboard key up events
   * @param event - Keyboard event
   */
  private handleKeyUp(event: KeyboardEvent): void {
    if (!this.enabled) return;

    const action = this.keyboardMapping[event.key];
    if (action) {
      event.preventDefault();
      this.setAction(action, false);
    }
  }

  /**
   * Handles touch start events
   * @param event - Touch event
   */
  private handleTouchStart(event: TouchEvent): void {
    if (!this.enabled) return;

    event.preventDefault();

    for (let i = 0; i < event.changedTouches.length; i++) {
      const touch = event.changedTouches[i];
      const touchX = touch.clientX;
      const touchY = touch.clientY;

      // Check D-pad
      if (this.isPointInDPad(touchX, touchY)) {
        this.dPad.touchId = touch.identifier;
        this.updateDPadDirection(touchX, touchY);
        continue;
      }

      // Check virtual buttons
      for (const button of this.virtualButtons.values()) {
        if (this.isPointInButton(touchX, touchY, button)) {
          button.pressed = true;
          button.touchId = touch.identifier;
          this.setAction(button.action, true);
          break;
        }
      }
    }
  }

  /**
   * Handles touch move events
   * @param event - Touch event
   */
  private handleTouchMove(event: TouchEvent): void {
    if (!this.enabled) return;

    event.preventDefault();

    for (let i = 0; i < event.changedTouches.length; i++) {
      const touch = event.changedTouches[i];
      const touchX = touch.clientX;
      const touchY = touch.clientY;

      // Update D-pad if this touch is on it
      if (this.dPad.touchId === touch.identifier) {
        this.updateDPadDirection(touchX, touchY);
      }
    }
  }

  /**
   * Handles touch end events
   * @param event - Touch event
   */
  private handleTouchEnd(event: TouchEvent): void {
    if (!this.enabled) return;

    event.preventDefault();

    for (let i = 0; i < event.changedTouches.length; i++) {
      const touch = event.changedTouches[i];

      // Check if this was the D-pad touch
      if (this.dPad.touchId === touch.identifier) {
        this.dPad.touchId = null;
        this.dPad.directionX = 0;
        this.dPad.directionY = 0;
        this.setAction(InputAction.MOVE_LEFT, false);
        this.setAction(InputAction.MOVE_RIGHT, false);
        this.setAction(InputAction.MOVE_UP, false);
        this.setAction(InputAction.MOVE_DOWN, false);
        continue;
      }

      // Check virtual buttons
      for (const button of this.virtualButtons.values()) {
        if (button.touchId === touch.identifier) {
          button.pressed = false;
          button.touchId = null;
          this.setAction(button.action, false);
        }
      }
    }
  }

  /**
   * Checks if a point is within the D-pad area
   * @param x - X coordinate
   * @param y - Y coordinate
   * @returns True if point is in D-pad
   */
  private isPointInDPad(x: number, y: number): boolean {
    const dx = x - this.dPad.centerX;
    const dy = y - this.dPad.centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance <= this.touchConfig.dPadRadius;
  }

  /**
   * Checks if a point is within a button
   * @param x - X coordinate
   * @param y - Y coordinate
   * @param button - Button to check
   * @returns True if point is in button
   */
  private isPointInButton(x: number, y: number, button: VirtualButton): boolean {
    return x >= button.x && x <= button.x + button.width &&
           y >= button.y && y <= button.y + button.height;
  }

  /**
   * Updates D-pad direction based on touch position
   * @param touchX - Touch X position
   * @param touchY - Touch Y position
   */
  private updateDPadDirection(touchX: number, touchY: number): void {
    const dx = touchX - this.dPad.centerX;
    const dy = touchY - this.dPad.centerY;
    
    // Normalize and apply dead zone
    let dirX = dx / this.touchConfig.dPadRadius;
    let dirY = dy / this.touchConfig.dPadRadius;
    
    // Apply dead zone
    if (Math.abs(dirX) < this.touchConfig.deadZone) dirX = 0;
    if (Math.abs(dirY) < this.touchConfig.deadZone) dirY = 0;
    
    // Determine direction
    const newDirX = dirX > 0 ? 1 : (dirX < 0 ? -1 : 0);
    const newDirY = dirY > 0 ? 1 : (dirY < 0 ? -1 : 0);
    
    // Update actions if direction changed
    if (newDirX !== this.dPad.directionX) {
      if (this.dPad.directionX !== 0) {
        this.setAction(this.dPad.directionX > 0 ? InputAction.MOVE_RIGHT : InputAction.MOVE_LEFT, false);
      }
      if (newDirX !== 0) {
        this.setAction(newDirX > 0 ? InputAction.MOVE_RIGHT : InputAction.MOVE_LEFT, true);
      }
      this.dPad.directionX = newDirX;
    }
    
    if (newDirY !== this.dPad.directionY) {
      if (this.dPad.directionY !== 0) {
        this.setAction(this.dPad.directionY > 0 ? InputAction.MOVE_DOWN : InputAction.MOVE_UP, false);
      }
      if (newDirY !== 0) {
        this.setAction(newDirY > 0 ? InputAction.MOVE_DOWN : InputAction.MOVE_UP, true);
      }
      this.dPad.directionY = newDirY;
    }
  }

  /**
   * Sets an action state
   * @param action - Action to set
   * @param pressed - Whether action is pressed
   */
  private setAction(action: InputAction, pressed: boolean): void {
    this.state.actions.set(action, pressed);
  }

  /**
   * Updates input state (call once per frame)
   */
  public update(): void {
    if (!this.enabled) return;

    // Poll gamepads
    this.pollGamepads();

    // Update edge detection
    Object.values(InputAction).forEach(action => {
      const current = this.state.actions.get(action) || false;
      const previous = this.previousState.actions.get(action) || false;
      
      this.state.justPressed.set(action, current && !previous);
      this.state.justReleased.set(action, !current && previous);
    });

    // Store current state for next frame
    Object.values(InputAction).forEach(action => {
      this.previousState.actions.set(action, this.state.actions.get(action) || false);
    });
  }

  /**
   * Polls connected gamepads
   */
  private pollGamepads(): void {
    const gamepads = navigator.getGamepads();
    
    for (let i = 0; i < gamepads.length; i++) {
      const gamepad = gamepads[i];
      if (!gamepad) continue;

      // Poll buttons
      for (let buttonIndex = 0; buttonIndex < gamepad.buttons.length; buttonIndex++) {
        const action = this.gamepadMapping[buttonIndex];
        if (action) {
          const pressed = gamepad.buttons[buttonIndex].pressed;
          this.setAction(action, pressed);
        }
      }

      // Poll axes
      for (const [axisIndex, axisConfig] of Object.entries(this.gamepadMapping.axes)) {
        const axis = gamepad.axes[parseInt(axisIndex)];
        if (axis !== undefined) {
          // Negative direction
          if (axis < -axisConfig.threshold) {
            this.setAction(axisConfig.negative, true);
            this.setAction(axisConfig.positive, false);
          }
          // Positive direction
          else if (axis > axisConfig.threshold) {
            this.setAction(axisConfig.negative, false);
            this.setAction(axisConfig.positive, true);
          }
          // Neutral
          else {
            this.setAction(axisConfig.negative, false);
            this.setInputAction(axisConfig.positive, false);
          }
        }
      }
    }
  }

  /**
   * Checks if an action is currently pressed
   * @param action - Action to check
   * @returns True if action is pressed
   */
  public isPressed(action: InputAction): boolean {
    return this.state.actions.get(action) || false;
  }

  /**
   * Checks if an action was just pressed this frame
   * @param action - Action to check
   * @returns True if action was just pressed
   */
  public isJustPressed(action: InputAction): boolean {
    return this.state.justPressed.get(action) || false;
  }

  /**
   * Checks if an action was just released this frame
   * @param action - Action to check
   * @returns True if action was just released
   */
  public isJustReleased(action: InputAction): boolean {
    return this.state.justReleased.get(action) || false;
  }

  /**
   * Clears all input state
   */
  public clearAllInput(): void {
    Object.values(InputAction).forEach(action => {
      this.setAction(action, false);
    });
  }

  /**
   * Gets the current D-pad state
   * @returns D-pad state
   */
  public getDPadState(): DPadState {
    return { ...this.dPad };
  }

  /**
   * Gets the current virtual button states
   * @returns Map of virtual button states
   */
  public getVirtualButtonStates(): Map<InputAction, VirtualButton> {
    const result = new Map<InputAction, VirtualButton>();
    this.virtualButtons.forEach((button, action) => {
      result.set(action, { ...button });
    });
    return result;
  }

  /**
   * Updates touch control positions for different screen sizes
   * @param screenWidth - Screen width
   * @param screenHeight - Screen height
   */
  public updateTouchLayout(screenWidth: number, screenHeight: number): void {
    // Adjust D-pad position
    this.dPad.centerX = Math.min(100, screenWidth * 0.15);
    this.dPad.centerY = screenHeight - 100;

    // Adjust button positions
    const buttonX = Math.max(screenWidth - 150, screenWidth * 0.75);
    const buttonY = screenHeight - 150;
    const spacing = 70;

    // Update button positions
    const buttons = [
      InputAction.CONFIRM,
      InputAction.CANCEL,
      InputAction.MENU,
      InputAction.SELECT
    ];

    const positions = [
      { x: spacing, y: spacing },     // A button (bottom right)
      { x: -spacing, y: spacing },    // B button (bottom left)
      { x: spacing, y: -spacing },    // X button (top right)
      { x: -spacing, y: -spacing }    // Y button (top left)
    ];

    buttons.forEach((action, index) => {
      const button = this.virtualButtons.get(action);
      if (button) {
        button.x = buttonX + positions[index].x;
        button.y = buttonY + positions[index].y;
      }
    });

    // Update Start button
    const startButton = this.virtualButtons.get(InputAction.START);
    if (startButton) {
      startButton.x = screenWidth / 2 - 30;
      startButton.y = screenHeight - 50;
    }

    logger.debug(LogSource.INPUT, `Touch layout updated for ${screenWidth}x${screenHeight}`);
  }

  /**
   * Gets input statistics
   * @returns Input statistics
   */
  public getStats(): {
    enabled: boolean;
    activeActions: InputAction[];
    hasGamepad: boolean;
  } {
    const activeActions: InputAction[] = [];
    Object.values(InputAction).forEach(action => {
      if (this.isPressed(action)) {
        activeActions.push(action);
      }
    });

    const gamepads = navigator.getGamepads();
    const hasGamepad = Array.from(gamepads).some(gp => gp !== null);

    return {
      enabled: this.enabled,
      activeActions,
      hasGamepad
    };
  }

  /**
   * Alias for setAction to fix typo
   */
  private setInputAction(action: InputAction, pressed: boolean): void {
    this.setAction(action, pressed);
  }

  /**
   * Disposes of the input system
   */
  public dispose(): void {
    this.disable();
    logger.info(LogSource.INPUT, 'InputSystem disposed');
  }
}