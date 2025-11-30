'use client';

/**
 * Main Game Component
 * @fileoverview Primary game component integrating all engine systems
 */

import React, { useEffect, useState, useCallback } from 'react';
import { useGameEngine } from '../hooks/useGameEngine';
import { WorldManager } from '../engine/WorldManager';
import { logger, LogSource } from '../engine/GlobalLogger';
import { EntityId, Position, Velocity, Health, Sprite, CombatState } from '../types';
import { ErrorBoundary, GameEngineErrorBoundary } from './ErrorBoundary';
import { HUD } from './HUD';
import { DialogSystem } from './DialogSystem';
import { MenuSystem } from './MenuSystem';
import { InventorySystem } from './InventorySystem';
import { CombatUI } from './CombatUI';
import { CombatSystem } from '../engine/CombatSystem';
import { useUIStore } from '../store';

/**
 * Game component props
 */
interface GameProps {
  /** Optional custom game width */
  width?: number;
  /** Optional custom game height */
  height?: number;
  /** Whether to show debug overlay */
  showDebug?: boolean;
}

/**
 * Main game component
 * Integrates WebGL renderer, ECS, input system, and game loop
 */
export const Game: React.FC<GameProps> = ({ 
  width = 1024, 
  height = 768, 
  showDebug = false 
}) => {
  const [playerEntityId] = useState<EntityId | null>(null);
  const [showLogger, setShowLogger] = useState(false);
  const [debugMode, setDebugMode] = useState(showDebug);
  const [combatSystem] = useState<CombatSystem | null>(null);
  const [inCombat, setInCombat] = useState(false);
  
  // UI state
  const { 
    mainMenuVisible, 
    setMainMenuVisible,
    inventoryVisible,
    setInventoryVisible,
    dialogVisible,
    setDialogVisible
  } = useUIStore();
  
  const {
    state: engineState,
    canvasRef,
    startGame,
    togglePause
  } = useGameEngine(
    // Custom update function
    useCallback((world: WorldManager, deltaTime: number) => {
      // Handle player movement and game logic
      if (playerEntityId !== null) {
        const velocity = world.getComponent<Velocity>(playerEntityId, 'Velocity');
        const position = world.getComponent<Position>(playerEntityId, 'Position');
        
        if (velocity && position) {
          // Update position based on velocity
          position.x += velocity.dx * deltaTime;
          position.y += velocity.dy * deltaTime;
          
          // Keep player in bounds
          position.x = Math.max(0, Math.min(width - 32, position.x));
          position.y = Math.max(0, Math.min(height - 32, position.y));
          
          world.updateComponent(playerEntityId, 'Position', position);
        }
      }
      
      // Update all game systems
      world.update(deltaTime);
      
      // Update combat system if active
      if (combatSystem && inCombat) {
        combatSystem.update(deltaTime);
      }
    }, [playerEntityId, width, height, combatSystem, inCombat]),
    
    // Custom render function (optional, for additional rendering)
    undefined // Use default renderer
  );

  // Initialize game entities
  const initializeGame = useCallback(() => {
    if (!engineState.initialized) return;

    // Get world manager from the game engine
    logger.info(LogSource.GAMEPLAY, 'Initializing game entities');

    // Create player entity
    const world = (engineState as any).world; // Access to world manager
    if (world) {
      const playerId = world.createEntity(['Position', 'Velocity', 'Health', 'Sprite', 'CombatState']);
      
      // Add player components
      world.addComponent(playerId, 'Position', { x: width / 2, y: height / 2 });
      world.addComponent(playerId, 'Velocity', { dx: 0, dy: 0 });
      world.addComponent(playerId, 'Health', { current: 100, max: 100 });
      world.addComponent(playerId, 'Sprite', { 
        textureId: 'hero', 
        frameIndex: 0, 
        width: 16, 
        height: 32 
      });
      world.addComponent(playerId, 'CombatState', {
        attacking: false,
        attack: 15,
        defense: 8,
        actionPoints: 3,
        maxActionPoints: 3
      });
      
      setPlayerEntityId(playerId);
      
      // Initialize combat system
      const combatSystem = new CombatSystem();
      combatSystem.setWorld(world);
      setCombatSystem(combatSystem);
      
      logger.info(LogSource.GAMEPLAY, `Created player entity ${playerId}`);
    }
  }, [engineState.initialized, width, height]);

  // Handle keyboard input for player movement
  useEffect(() => {
    if (!engineState.running || playerEntityId === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Handle UI shortcuts first
      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          if (mainMenuVisible) {
            setMainMenuVisible(false);
          } else if (inventoryVisible) {
            setInventoryVisible(false);
          } else {
            setMainMenuVisible(true);
          }
          return;
        case 'i':
        case 'I':
          e.preventDefault();
          setInventoryVisible(!inventoryVisible);
          return;
        case 'm':
        case 'M':
          e.preventDefault();
          setMainMenuVisible(!mainMenuVisible);
          return;
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (!mainMenuVisible && !inventoryVisible && !dialogVisible) {
            // Show dialog for testing
            setDialogVisible(true, "Hero: Welcome to the world of Aetherial Vanguard! Press ESC to open the menu.");
          }
          return;
      }

      // Only handle movement if no UI is open
      if (mainMenuVisible || inventoryVisible || dialogVisible) return;

      const world = (engineState as any).world;
      if (!world) return;

      const velocity = { dx: 0, dy: 0 };
      const speed = 200; // pixels per second

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
          velocity.dy = -speed;
          break;
        case 'ArrowDown':
        case 's':
          velocity.dy = speed;
          break;
        case 'ArrowLeft':
        case 'a':
          velocity.dx = -speed;
          break;
        case 'ArrowRight':
        case 'd':
          velocity.dx = speed;
          break;
        case ' ':
          e.preventDefault();
          togglePause();
          break;
        case 'g':
          e.preventDefault();
          setDebugMode(prev => !prev);
          break;
        case 'l':
          e.preventDefault();
          setShowLogger(prev => !prev);
          break;
      }

      if (velocity.dx !== 0 || velocity.dy !== 0) {
        world.updateComponent(playerEntityId, 'Velocity', velocity);
        logger.debug(LogSource.INPUT, `Player velocity: ${velocity.dx}, ${velocity.dy}`);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      // Stop movement when key is released
      if (mainMenuVisible || inventoryVisible || dialogVisible) return;

      const world = (engineState as any).world;
      if (!world) return;

      switch (e.key) {
        case 'ArrowUp':
        case 'ArrowDown':
        case 'w':
        case 's':
        case 'ArrowLeft':
        case 'ArrowRight':
        case 'a':
        case 'd':
          // Reset velocity to 0
          world.updateComponent(playerEntityId, 'Velocity', { dx: 0, dy: 0 });
          logger.debug(LogSource.INPUT, 'Player stopped');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [engineState.running, playerEntityId, mainMenuVisible, inventoryVisible, dialogVisible, togglePause]);

  // Start game when initialized
  useEffect(() => {
    if (engineState.initialized && !engineState.running) {
      initializeGame();
      startGame();
    }
  }, [engineState.initialized, engineState.running, initializeGame, startGame]);

  // Logger overlay state - moved outside conditional
  const [logs, setLogs] = useState<Array<{timestamp: number, level: string, source: string, message: string}>>([]);

  useEffect(() => {
    // This would integrate with the GlobalLogger
    // For now, we'll show a placeholder
    setLogs([
      { timestamp: Date.now(), level: 'INFO', source: 'CORE', message: 'Game started' },
      { timestamp: Date.now(), level: 'DEBUG', source: 'RENDERER', message: 'Texture loaded' },
    ]);
  }, []);

  // Debug overlay component
  const DebugOverlay: React.FC = () => {
    if (!debugMode) return null;

    return (
      <div style={{
        position: 'absolute',
        top: 10,
        left: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '10px',
        fontFamily: 'monospace',
        fontSize: '12px',
        zIndex: 1000
      }}>
        <div>FPS: {engineState.fps}</div>
        <div>Entities: {engineState.stats.entityCount}</div>
        <div>Components: {engineState.stats.componentCount}</div>
        <div>Systems: {engineState.stats.systemCount}</div>
        <div>Textures: {engineState.stats.textureCount}</div>
        <div>Running: {engineState.running ? 'Yes' : 'No'}</div>
        <button 
          onClick={() => setShowLogger(!showLogger)}
          style={{ marginTop: '10px', padding: '5px' }}
        >
          {showLogger ? 'Hide' : 'Show'} Logger
        </button>
      </div>
    );
  };

  // Logger overlay component
  const LoggerOverlay: React.FC = () => {
    if (!showLogger) return null;

    return (
      <div style={{
        position: 'absolute',
        top: 10,
        right: 10,
        width: '400px',
        height: '300px',
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        color: 'white',
        padding: '10px',
        fontFamily: 'monospace',
        fontSize: '10px',
        zIndex: 1000,
        overflowY: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
          <h4 style={{ margin: 0 }}>Logger</h4>
          <button onClick={() => setShowLogger(false)} style={{ background: 'none', border: '1px solid white', color: 'white' }}>×</button>
        </div>
        {logs.map((log, index) => (
          <div key={index} style={{ marginBottom: '2px' }}>
            <span style={{ color: '#888' }}>
              {new Date(log.timestamp).toLocaleTimeString()}
            </span>
            {' '}
            <span style={{ 
              color: log.level === 'ERROR' ? '#ff6b6b' : 
                     log.level === 'WARN' ? '#ffd93d' : 
                     log.level === 'INFO' ? '#6bcf7f' : '#888' 
            }}>
              [{log.level}]
            </span>
            {' '}
            <span style={{ color: '#4a90e2' }}>
              {log.source}
            </span>
            {' '}
            {log.message}
          </div>
        ))}
      </div>
    );
  };

  return (
    <GameEngineErrorBoundary>
      <div style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Game Canvas */}
        <canvas
          ref={canvasRef}
          style={{
            width: `${width}px`,
            height: `${height}px`,
            imageRendering: 'pixelated',
            border: '2px solid #333'
          }}
        />

        {/* HUD */}
        <HUD playerId={playerEntityId} showDebugInfo={debugMode} />

        {/* Dialog System */}
        <DialogSystem />

        {/* Menu System */}
        <MenuSystem />

        {/* Inventory System */}
        <InventorySystem />

        {/* Debug Overlay */}
        {debugMode && (
          <div style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: '#00FF00',
            padding: '10px',
            fontFamily: 'monospace',
            fontSize: '12px',
            borderRadius: '4px',
            border: '1px solid #00FF00',
            zIndex: 1000
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>DEBUG INFO</div>
            <div>FPS: {engineState.fps}</div>
            <div>Entities: {engineState.stats.entityCount}</div>
            <div>Components: {engineState.stats.componentCount}</div>
            <div>Systems: {engineState.stats.systemCount}</div>
            <div>Textures: {engineState.stats.textureCount}</div>
            <div>Player ID: {playerEntityId}</div>
            <div>Running: {engineState.running ? 'Yes' : 'No'}</div>
            <div>Menu: {mainMenuVisible ? 'Open' : 'Closed'}</div>
            <div>Inventory: {inventoryVisible ? 'Open' : 'Closed'}</div>
            <div>Dialog: {dialogVisible ? 'Active' : 'Inactive'}</div>
          </div>
        )}

        {/* Game Controls Info */}
        <div style={{
          position: 'absolute',
          bottom: '10px',
          left: '10px',
          color: 'white',
          fontFamily: 'monospace',
          fontSize: '12px',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          padding: '10px',
          borderRadius: '5px',
          zIndex: 100
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>CONTROLS</div>
          <div>Arrow Keys / WASD - Move</div>
          <div>Space - Pause</div>
          <div>M - Menu</div>
          <div>I - Inventory</div>
          <div>ESC - Back/Menu</div>
          <div>Enter - Interact</div>
          {debugMode && <div>G - Toggle Debug</div>}
        </div>

        {/* Loading/Init Screen */}
        {!engineState.initialized && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            fontSize: '24px',
            fontFamily: 'monospace',
            zIndex: 2000
          }}>
            Initializing Game Engine...
          </div>
        )}

        {/* Paused Overlay */}
        {engineState.running && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: 'white',
            fontSize: '48px',
            fontFamily: 'monospace',
            textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
            pointerEvents: 'none',
            opacity: 0.8,
            zIndex: 1500
          }}>
            PAUSED
          </div>
        )}
      </div>
    </GameEngineErrorBoundary>
  );
};