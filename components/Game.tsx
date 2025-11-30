/**
 * Main Game Component
 * @fileoverview Primary game component integrating all engine systems
 */

import React, { useEffect, useState, useCallback } from 'react';
import { useGameEngine } from '../hooks/useGameEngine';
import { WorldManager } from '../engine/WorldManager';
import { logger, LogSource } from '../engine/GlobalLogger';
import { EntityId, Position, Sprite, Velocity, Animation } from '../types';
import { TEXTURE_REGISTRY } from '../assets/SpriteAssets';

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
  const [playerEntityId, setPlayerEntityId] = useState<EntityId | null>(null);
  const [showLogger, setShowLogger] = useState(false);
  
  const {
    state: engineState,
    canvasRef,
    startGame,
    stopGame,
    togglePause,
    getComponent,
    subscribeToComponent
  } = useGameEngine(
    // Custom update function
    useCallback((world: WorldManager, deltaTime: number) => {
      // Handle player movement
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
    }, [playerEntityId, width, height]),
    
    // Custom render function (optional, for additional rendering)
    undefined // Use default renderer
  );

  // Initialize game entities
  const initializeGame = useCallback(() => {
    if (!engineState.initialized) return;

    // Get world manager from the game engine (this is a simplified approach)
    // In a real implementation, you'd have better access to the world manager
    logger.info(LogSource.GAMEPLAY, 'Initializing game entities');

    // For now, we'll create a simple test entity when the game starts
    // This would be better handled through the engine's world manager
    logger.info(LogSource.GAMEPLAY, 'Game initialized');
  }, [engineState.initialized]);

  // Handle keyboard input for player movement
  useEffect(() => {
    if (!engineState.running || playerEntityId === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      let velocity = { dx: 0, dy: 0 };
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
          togglePause();
          break;
      }

      if (velocity.dx !== 0 || velocity.dy !== 0) {
        // This would update the player's velocity component
        // For now, we'll just log it
        logger.debug(LogSource.INPUT, `Player velocity: ${velocity.dx}, ${velocity.dy}`);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      // Stop movement when key is released
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
  }, [engineState.running, playerEntityId, togglePause]);

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
    if (!showDebug) return null;

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

      {/* Debug Overlay */}
      <DebugOverlay />

      {/* Logger Overlay */}
      <LoggerOverlay />

      {/* Game Controls Info */}
      <div style={{
        position: 'absolute',
        bottom: 10,
        left: 10,
        color: 'white',
        fontFamily: 'monospace',
        fontSize: '12px',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: '10px',
        borderRadius: '5px'
      }}>
        <div>Controls:</div>
        <div>Arrow Keys / WASD - Move</div>
        <div>Space - Pause</div>
        <div>G - Toggle Debug</div>
        <div>L - Toggle Logger</div>
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
          fontFamily: 'monospace'
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
          opacity: 0.8
        }}>
          PAUSED
        </div>
      )}
    </div>
  );
};