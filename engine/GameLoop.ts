/**
 * Game Loop with Fixed Timestep
 * @fileoverview Core game loop implementation using fixed timestep for consistent physics
 */

import { logger, LogSource } from './GlobalLogger';

/**
 * Game loop configuration interface
 */
interface GameLoopConfig {
  /** Fixed timestep in seconds (default: 1/60) */
  fixedStep?: number;
  /** Maximum accumulator value to prevent spiral of death */
  maxAccumulator?: number;
  /** Whether to pause when tab is not visible */
  pauseOnBlur?: boolean;
  /** Background update rate when paused (Hz) */
  backgroundUpdateRate?: number;
}

/**
 * Game loop state interface
 */
interface GameLoopState {
  /** Whether the game loop is running */
  running: boolean;
  /** Whether the game is paused */
  paused: boolean;
  /** Whether the tab is visible */
  visible: boolean;
  /** Time accumulator for fixed timestep */
  accumulator: number;
  /** Last frame timestamp */
  lastTime: number;
  /** Frame counter for statistics */
  frameCount: number;
  /** FPS calculation */
  fps: number;
  /** FPS calculation timer */
  fpsTimer: number;
}

/**
 * Update function type
 */
type UpdateFunction = (deltaTime: number) => void;

/**
 * Render function type
 */
type RenderFunction = (interpolation: number) => void;

/**
 * Game Loop class implementing fixed timestep pattern
 * Ensures consistent physics regardless of frame rate
 */
export class GameLoop {
  /** Game loop configuration */
  private config: Required<GameLoopConfig>;
  
  /** Game loop state */
  private state: GameLoopState;
  
  /** Update function callback */
  private updateFunction: UpdateFunction;
  
  /** Render function callback */
  private renderFunction: RenderFunction;
  
  /** Animation frame ID */
  private animationFrameId: number | null = null;
  
  /** Background update interval */
  private backgroundIntervalId: number | null = null;

  /**
   * Creates a new GameLoop instance
   * @param updateFunction - Function called for each fixed update
   * @param renderFunction - Function called for each render frame
   * @param config - Optional configuration
   */
  constructor(
    updateFunction: UpdateFunction,
    renderFunction: RenderFunction,
    config: GameLoopConfig = {}
  ) {
    this.updateFunction = updateFunction;
    this.renderFunction = renderFunction;

    // Set default configuration
    this.config = {
      fixedStep: 1 / 60,
      maxAccumulator: 0.25,
      pauseOnBlur: true,
      backgroundUpdateRate: 10,
      ...config
    };

    // Initialize state
    this.state = {
      running: false,
      paused: false,
      visible: !document.hidden,
      accumulator: 0,
      lastTime: 0,
      frameCount: 0,
      fps: 0,
      fpsTimer: 0
    };

    // Setup visibility change handler
    this.setupVisibilityHandler();

    logger.info(LogSource.CORE, `GameLoop initialized with ${this.config.fixedStep}s fixed timestep`);
  }

  /**
   * Starts the game loop
   */
  public start(): void {
    if (this.state.running) {
      logger.warn(LogSource.CORE, 'GameLoop is already running');
      return;
    }

    this.state.running = true;
    this.state.lastTime = performance.now() / 1000;
    this.state.accumulator = 0;

    // Start the main loop
    this.animationFrameId = requestAnimationFrame(this.loop.bind(this));

    logger.info(LogSource.CORE, 'GameLoop started');
  }

  /**
   * Stops the game loop
   */
  public stop(): void {
    if (!this.state.running) {
      logger.warn(LogSource.CORE, 'GameLoop is not running');
      return;
    }

    this.state.running = false;

    // Cancel animation frame
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    // Clear background interval
    this.clearBackgroundInterval();

    logger.info(LogSource.CORE, 'GameLoop stopped');
  }

  /**
   * Pauses or resumes the game
   * @param paused - Whether to pause the game
   */
  public setPaused(paused: boolean): void {
    if (this.state.paused === paused) return;

    this.state.paused = paused;

    if (paused) {
      this.startBackgroundUpdates();
      logger.debug(LogSource.CORE, 'Game paused');
    } else {
      this.clearBackgroundUpdates();
      logger.debug(LogSource.CORE, 'Game resumed');
    }
  }

  /**
   * Gets the current pause state
   * @returns Whether the game is paused
   */
  public isPaused(): boolean {
    return this.state.paused;
  }

  /**
   * Gets the current running state
   * @returns Whether the game loop is running
   */
  public isRunning(): boolean {
    return this.state.running;
  }

  /**
   * Gets the current FPS
   * @returns Current frames per second
   */
  public getFPS(): number {
    return this.state.fps;
  }

  /**
   * Main game loop function
   * @param timestamp - Current timestamp from requestAnimationFrame
   */
  private loop(timestamp: number): void {
    if (!this.state.running) return;

    // Convert to seconds
    const currentTime = timestamp / 1000;
    let deltaTime = currentTime - this.state.lastTime;
    this.state.lastTime = currentTime;

    // Clamp delta time to prevent spiral of death
    deltaTime = Math.min(deltaTime, this.config.maxAccumulator);

    // Update FPS calculation
    this.updateFPS(deltaTime);

    // Only update if not paused and tab is visible
    if (!this.state.paused && this.state.visible) {
      // Add delta time to accumulator
      this.state.accumulator += deltaTime;

      // Fixed update loop
      while (this.state.accumulator >= this.config.fixedStep) {
        try {
          this.updateFunction(this.config.fixedStep);
        } catch (error) {
          logger.error(LogSource.CORE, `Update function failed: ${error}`);
        }
        
        this.state.accumulator -= this.config.fixedStep;
      }
    }

    // Calculate interpolation factor for smooth rendering
    const interpolation = this.state.accumulator / this.config.fixedStep;

    // Render with interpolation
    try {
      this.renderFunction(interpolation);
    } catch (error) {
      logger.error(LogSource.CORE, `Render function failed: ${error}`);
    }

    // Increment frame counter
    this.state.frameCount++;

    // Continue the loop
    this.animationFrameId = requestAnimationFrame(this.loop.bind(this));
  }

  /**
   * Updates FPS calculation
   * @param deltaTime - Time since last frame
   */
  private updateFPS(deltaTime: number): void {
    this.state.fpsTimer += deltaTime;

    if (this.state.fpsTimer >= 1.0) {
      this.state.fps = this.state.frameCount;
      this.state.frameCount = 0;
      this.state.fpsTimer = 0;
    }
  }

  /**
   * Sets up visibility change handler
   */
  private setupVisibilityHandler(): void {
    const handleVisibilityChange = () => {
      const wasVisible = this.state.visible;
      this.state.visible = !document.hidden;

      if (wasVisible !== this.state.visible) {
        logger.debug(LogSource.CORE, `Tab visibility changed: ${this.state.visible ? 'visible' : 'hidden'}`);

        if (this.config.pauseOnBlur && this.state.running) {
          if (!this.state.visible && !this.state.paused) {
            this.setPaused(true);
          } else if (this.state.visible && this.state.paused) {
            this.setPaused(false);
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
  }

  /**
   * Starts background updates when tab is hidden
   */
  private startBackgroundUpdates(): void {
    if (this.backgroundIntervalId) return;

    const intervalMs = 1000 / this.config.backgroundUpdateRate;
    
    this.backgroundIntervalId = window.setInterval(() => {
      try {
        this.updateFunction(this.config.fixedStep);
      } catch (error) {
        logger.error(LogSource.CORE, `Background update failed: ${error}`);
      }
    }, intervalMs);

    logger.debug(LogSource.CORE, `Started background updates at ${this.config.backgroundUpdateRate}Hz`);
  }

  /**
   * Clears background updates
   */
  private clearBackgroundUpdates(): void {
    if (this.backgroundIntervalId) {
      clearInterval(this.backgroundIntervalId);
      this.backgroundIntervalId = null;
    }
  }

  /**
   * Alias for clearBackgroundUpdates for consistency
   */
  private clearBackgroundInterval(): void {
    this.clearBackgroundUpdates();
  }

  /**
   * Gets game loop statistics
   * @returns Statistics object
   */
  public getStats(): {
    running: boolean;
    paused: boolean;
    visible: boolean;
    fps: number;
    accumulator: number;
    fixedStep: number;
  } {
    return {
      running: this.state.running,
      paused: this.state.paused,
      visible: this.state.visible,
      fps: this.state.fps,
      accumulator: this.state.accumulator,
      fixedStep: this.config.fixedStep
    };
  }

  /**
   * Updates game loop configuration
   * @param newConfig - New configuration values
   */
  public updateConfig(newConfig: Partial<GameLoopConfig>): void {
    const oldBackgroundRate = this.config.backgroundUpdateRate;
    
    this.config = { ...this.config, ...newConfig };

    // Restart background updates if rate changed
    if (this.state.paused && oldBackgroundRate !== this.config.backgroundUpdateRate) {
      this.clearBackgroundUpdates();
      this.startBackgroundUpdates();
    }

    logger.debug(LogSource.CORE, 'GameLoop configuration updated');
  }

  /**
   * Forces a single update step
   * Useful for debugging or testing
   */
  public forceUpdate(): void {
    try {
      this.updateFunction(this.config.fixedStep);
      logger.debug(LogSource.CORE, 'Forced single update');
    } catch (error) {
      logger.error(LogSource.CORE, `Forced update failed: ${error}`);
    }
  }

  /**
   * Forces a single render
   * Useful for debugging or testing
   */
  public forceRender(): void {
    try {
      this.renderFunction(0);
      logger.debug(LogSource.CORE, 'Forced single render');
    } catch (error) {
      logger.error(LogSource.CORE, `Forced render failed: ${error}`);
    }
  }

  /**
   * Resets the game loop state
   */
  public reset(): void {
    this.state.accumulator = 0;
    this.state.frameCount = 0;
    this.state.fps = 0;
    this.state.fpsTimer = 0;
    this.state.lastTime = performance.now() / 1000;

    logger.debug(LogSource.CORE, 'GameLoop state reset');
  }

  /**
   * Disposes of the game loop
   */
  public dispose(): void {
    this.stop();
    
    // Remove event listeners
    document.removeEventListener('visibilitychange', this.setupVisibilityHandler);

    logger.info(LogSource.CORE, 'GameLoop disposed');
  }
}