/**
 * React Hook for Game Loop Integration
 * @fileoverview Provides React integration for the game engine systems
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { GameLoop } from '../engine/GameLoop';
import { WebGLRenderer } from '../engine/WebGLRenderer';
import { InputSystem } from '../engine/InputSystem';
import { WorldManager } from '../engine/WorldManager';
import { logger, LogSource } from '../engine/GlobalLogger';
import { EntityId, ComponentType } from '../types';

/**
 * Game engine state interface
 */
interface GameEngineState {
  /** Whether the engine is initialized */
  initialized: boolean;
  /** Whether the game is running */
  running: boolean;
  /** Current FPS */
  fps: number;
  /** Engine statistics */
  stats: {
    entityCount: number;
    componentCount: number;
    systemCount: number;
    textureCount: number;
  };
}

/**
 * Game engine hook return value
 */
interface UseGameEngineReturn {
  /** Current engine state */
  state: GameEngineState;
  /** Canvas ref for WebGL rendering */
  canvasRef: React.RefObject<HTMLCanvasElement>;
  /** Start the game */
  startGame: () => void;
  /** Stop the game */
  stopGame: () => void;
  /** Pause/unpause the game */
  togglePause: () => void;
  /** Get component data for an entity */
  getComponent: <T>(entityId: EntityId, componentType: ComponentType) => T | null;
  /** Subscribe to component changes */
  subscribeToComponent: (
    entityId: EntityId,
    componentType: ComponentType,
    callback: (data: unknown) => void
  ) => () => void;
}

/**
 * React hook for game engine integration
 * @param updateFunction - Optional custom update function
 * @param renderFunction - Optional custom render function
 * @returns Game engine interface
 */
export function useGameEngine(
  updateFunction?: (world: WorldManager, deltaTime: number) => void,
  renderFunction?: (renderer: WebGLRenderer, interpolation: number) => void
): UseGameEngineReturn {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Engine instances
  const gameLoopRef = useRef<GameLoop | null>(null);
  const rendererRef = useRef<WebGLRenderer | null>(null);
  const inputSystemRef = useRef<InputSystem | null>(null);
  const worldManagerRef = useRef<WorldManager | null>(null);
  
  // State
  const [state, setState] = useState<GameEngineState>({
    initialized: false,
    running: false,
    fps: 0,
    stats: {
      entityCount: 0,
      componentCount: 0,
      systemCount: 0,
      textureCount: 0
    }
  });

  // Update engine state
  const updateEngineState = useCallback(() => {
    if (!gameLoopRef.current || !worldManagerRef.current || !rendererRef.current) {
      return;
    }

    const gameLoopStats = gameLoopRef.current.getStats();
    const worldStats = worldManagerRef.current.getStats();
    const rendererStats = rendererRef.current.getStats();

    setState(prevState => ({
      ...prevState,
      fps: gameLoopStats.fps,
      stats: {
        entityCount: worldStats.entityCount,
        componentCount: worldStats.componentCount,
        systemCount: worldStats.systemCount,
        textureCount: rendererStats.textureCount
      }
    }));
  }, []);

  // Default update function
  const defaultUpdateFunction = useCallback((world: WorldManager, deltaTime: number) => {
    // Update input system
    if (inputSystemRef.current) {
      inputSystemRef.current.update();
    }

    // Update world (runs all systems)
    world.update(deltaTime);

    // Call custom update function if provided
    if (updateFunction) {
      updateFunction(world, deltaTime);
    }

    // Update state periodically
    if (Math.random() < 0.1) { // Update stats ~10% of frames
      updateEngineState();
    }
  }, [updateFunction, updateEngineState]);

  // Default render function
  const defaultRenderFunction = useCallback((renderer: WebGLRenderer, interpolation: number) => {
    // Begin frame
    renderer.beginFrame();

    // Render entities with Sprite and Position components
    if (worldManagerRef.current) {
      const entities = worldManagerRef.current.query(['Sprite', 'Position']);
      
      // Sort by Y position for proper depth ordering
      const sortedEntities = entities.map(entityId => {
        const position = worldManagerRef.current!.getComponent(entityId, 'Position');
        return { entityId, position };
      }).sort((a, b) => (a.position?.y || 0) - (b.position?.y || 0));

      // Render each entity
      sortedEntities.forEach(({ entityId }) => {
        const sprite = worldManagerRef.current!.getComponent(entityId, 'Sprite');
        const position = worldManagerRef.current!.getComponent(entityId, 'Position');
        
        if (sprite && position) {
          renderer.drawSprite(
            sprite.textureId,
            position.x,
            position.y,
            sprite.width,
            sprite.height,
            { x: 0, y: 0, width: 1, height: 1 }, // Full texture
            0xFFFFFFFF // White color
          );
        }
      });
    }

    // Call custom render function if provided
    if (renderFunction) {
      renderFunction(renderer, interpolation);
    }

    // End frame
    renderer.endFrame();
  }, [renderFunction]);

  // Initialize engine
  const initializeEngine = useCallback(() => {
    if (!canvasRef.current) {
      logger.error(LogSource.CORE, 'Canvas ref is null during initialization');
      return;
    }

    try {
      // Create world manager
      worldManagerRef.current = new WorldManager();

      // Create input system
      inputSystemRef.current = new InputSystem();
      inputSystemRef.current.enable();

      // Create renderer
      rendererRef.current = new WebGLRenderer();
      const success = rendererRef.current.initialize(
        canvasRef.current,
        1024,
        768
      );

      if (!success) {
        throw new Error('Failed to initialize WebGL renderer');
      }

      // Create game loop
      gameLoopRef.current = new GameLoop(
        (deltaTime: number) => defaultUpdateFunction(worldManagerRef.current!, deltaTime),
        (interpolation: number) => defaultRenderFunction(rendererRef.current!, interpolation)
      );

      setState(prevState => ({
        ...prevState,
        initialized: true
      }));

      logger.info(LogSource.CORE, 'Game engine initialized successfully');

    } catch (error) {
      logger.error(LogSource.CORE, `Failed to initialize game engine: ${error}`);
    }
  }, [defaultUpdateFunction, defaultRenderFunction]);

  // Start game
  const startGame = useCallback(() => {
    if (!gameLoopRef.current) {
      logger.warn(LogSource.CORE, 'Cannot start game: engine not initialized');
      return;
    }

    gameLoopRef.current.start();
    setState(prevState => ({
      ...prevState,
      running: true
    }));

    logger.info(LogSource.CORE, 'Game started');
  }, []);

  // Stop game
  const stopGame = useCallback(() => {
    if (!gameLoopRef.current) {
      logger.warn(LogSource.CORE, 'Cannot stop game: engine not initialized');
      return;
    }

    gameLoopRef.current.stop();
    setState(prevState => ({
      ...prevState,
      running: false
    }));

    logger.info(LogSource.CORE, 'Game stopped');
  }, []);

  // Toggle pause
  const togglePause = useCallback(() => {
    if (!gameLoopRef.current) {
      logger.warn(LogSource.CORE, 'Cannot toggle pause: engine not initialized');
      return;
    }

    const isPaused = gameLoopRef.current.isPaused();
    gameLoopRef.current.setPaused(!isPaused);

    logger.info(LogSource.CORE, `Game ${isPaused ? 'resumed' : 'paused'}`);
  }, []);

  // Get component data
  const getComponent = useCallback(<T>(entityId: EntityId, componentType: ComponentType): T | null => {
    if (!worldManagerRef.current) {
      return null;
    }

    return worldManagerRef.current.getComponent<T>(entityId, componentType);
  }, []);

  // Subscribe to component changes
  const subscribeToComponent = useCallback((
    entityId: EntityId,
    componentType: ComponentType,
    callback: (data: unknown) => void
  ) => {
    if (!worldManagerRef.current) {
      return () => {}; // Return empty unsubscribe function
    }

    return worldManagerRef.current.subscribe(entityId, componentType, callback);
  }, []);

  // Handle canvas resize
  const handleResize = useCallback(() => {
    if (!canvasRef.current || !rendererRef.current) {
      return;
    }

    const canvas = canvasRef.current;
    const container = canvas.parentElement;
    if (!container) return;

    // Calculate aspect ratio
    const aspectRatio = 1024 / 768;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    
    let canvasWidth, canvasHeight;
    
    if (containerWidth / containerHeight > aspectRatio) {
      // Container is wider than game aspect ratio
      canvasHeight = containerHeight;
      canvasWidth = canvasHeight * aspectRatio;
    } else {
      // Container is taller than game aspect ratio
      canvasWidth = containerWidth;
      canvasHeight = canvasWidth / aspectRatio;
    }

    // Set canvas size
    canvas.style.width = `${canvasWidth}px`;
    canvas.style.height = `${canvasHeight}px`;

    // Update touch layout
    if (inputSystemRef.current) {
      inputSystemRef.current.updateTouchLayout(canvasWidth, canvasHeight);
    }

    logger.debug(LogSource.CORE, `Canvas resized to ${canvasWidth}x${canvasHeight}`);
  }, []);

  // Initialize on mount
  useEffect(() => {
    initializeEngine();

    // Setup resize handler
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial resize

    return () => {
      window.removeEventListener('resize', handleResize);
      
      // Cleanup engine
      if (gameLoopRef.current) {
        gameLoopRef.current.dispose();
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      if (inputSystemRef.current) {
        inputSystemRef.current.dispose();
      }
      if (worldManagerRef.current) {
        // World manager doesn't have dispose method, but we can clear it
        worldManagerRef.current.clear();
      }

      logger.info(LogSource.CORE, 'Game engine disposed');
    };
  }, [initializeEngine, handleResize]);

  return {
    state,
    canvasRef,
    startGame,
    stopGame,
    togglePause,
    getComponent,
    subscribeToComponent
  };
}