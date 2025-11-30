'use client';

/**
 * HUD (Heads-Up Display) Component
 * @fileoverview Main game HUD displaying player stats, health, and game information
 */

import React, { memo, useEffect, useState } from 'react';
import { useUIStore } from '../store';
import { useEntityComponent } from '../hooks/useEntityComponent';
import { EntityId, Health, CombatStats } from '../types';
import { logger, LogSource } from '../engine/GlobalLogger';

/**
 * HUD component props
 */
interface HUDProps {
  /** Player entity ID */
  playerId: EntityId | null;
  /** Whether to show detailed debug information */
  showDebugInfo?: boolean;
}

/**
 * Health Bar component for displaying entity health
 */
const HealthBar: React.FC<{
  current: number;
  max: number;
  width: number;
  height: number;
  color?: string;
  backgroundColor?: string;
  showText?: boolean;
}> = memo(({ 
  current, 
  max, 
  width, 
  height, 
  color = '#4CAF50', 
  backgroundColor = '#333333',
  showText = true 
}) => {
  const healthPercentage = Math.max(0, Math.min(100, (current / max) * 100));
  
  // Determine health color based on percentage
  const getHealthColor = () => {
    if (healthPercentage > 60) return '#4CAF50'; // Green
    if (healthPercentage > 30) return '#FFC107'; // Yellow
    return '#F44336'; // Red
  };

  return (
    <div style={{
      width: `${width}px`,
      height: `${height}px`,
      backgroundColor,
      border: '2px solid #555555',
      borderRadius: '4px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div
        style={{
          width: `${healthPercentage}%`,
          height: '100%',
          backgroundColor: color || getHealthColor(),
          transition: 'width 0.3s ease-out',
          borderRadius: '2px'
        }}
      />
      {showText && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: '#FFFFFF',
            fontSize: '12px',
            fontWeight: 'bold',
            textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
            fontFamily: 'monospace',
            whiteSpace: 'nowrap'
          }}
        >
          {Math.ceil(current)}/{Math.ceil(max)}
        </div>
      )}
    </div>
  );
});

HealthBar.displayName = 'HealthBar';

/**
 * Mana Bar component for displaying entity mana/energy
 */
const ManaBar: React.FC<{
  current: number;
  max: number;
  width: number;
  height: number;
}> = memo(({ current, max, width, height }) => {
  const manaPercentage = Math.max(0, Math.min(100, (current / max) * 100));

  return (
    <div style={{
      width: `${width}px`,
      height: `${height}px`,
      backgroundColor: '#1E3A8A',
      border: '2px solid #555555',
      borderRadius: '4px',
      position: 'relative',
      overflow: 'hidden',
      marginTop: '4px'
    }}>
      <div
        style={{
          width: `${manaPercentage}%`,
          height: '100%',
          backgroundColor: '#3B82F6',
          transition: 'width 0.3s ease-out',
          borderRadius: '2px'
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: '#FFFFFF',
          fontSize: '10px',
          fontWeight: 'bold',
          textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
          fontFamily: 'monospace'
        }}
      >
        {Math.ceil(current)}/{Math.ceil(max)}
      </div>
    </div>
  );
});

ManaBar.displayName = 'ManaBar';

/**
 * Experience Bar component for character progression
 */
const ExperienceBar: React.FC<{
  current: number;
  max: number;
  level: number;
  width: number;
  height: number;
}> = memo(({ current, max, level, width, height }) => {
  const expPercentage = Math.max(0, Math.min(100, (current / max) * 100));

  return (
    <div style={{
      width: `${width}px`,
      height: `${height}px`,
      backgroundColor: '#4B5563',
      border: '2px solid #555555',
      borderRadius: '4px',
      position: 'relative',
      overflow: 'hidden',
      marginTop: '4px'
    }}>
      <div
        style={{
          width: `${expPercentage}%`,
          height: '100%',
          backgroundColor: '#8B5CF6',
          transition: 'width 0.3s ease-out',
          borderRadius: '2px'
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: '#FFFFFF',
          fontSize: '10px',
          fontWeight: 'bold',
          textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
          fontFamily: 'monospace'
        }}
      >
        Lv.{level} - {Math.ceil(expPercentage)}%
      </div>
    </div>
  );
});

ExperienceBar.displayName = 'ExperienceBar';

/**
 * Status Effects display component
 */
const StatusEffects: React.FC<{
  effects: Array<{
    id: string;
    name: string;
    duration: number;
    icon?: string;
  }>;
}> = memo(({ effects }) => {
  if (effects.length === 0) return null;

  return (
    <div style={{
      display: 'flex',
      gap: '4px',
      marginTop: '8px',
      flexWrap: 'wrap'
    }}>
      {effects.map((effect) => (
        <div
          key={effect.id}
          style={{
            width: '24px',
            height: '24px',
            backgroundColor: '#2D3748',
            border: '1px solid #4A5568',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            color: '#E2E8F0',
            position: 'relative',
            cursor: 'pointer'
          }}
          title={`${effect.name} (${effect.duration}s)`}
        >
          {effect.icon || '⚡'}
          {effect.duration > 0 && (
            <div
              style={{
                position: 'absolute',
                bottom: '-2px',
                right: '-2px',
                backgroundColor: '#EF4444',
                color: '#FFFFFF',
                fontSize: '8px',
                fontWeight: 'bold',
                borderRadius: '50%',
                width: '12px',
                height: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {effect.duration}
            </div>
          )}
        </div>
      ))}
    </div>
  );
});

StatusEffects.displayName = 'StatusEffects';

/**
 * Minimap component for showing player position
 */
const Minimap: React.FC<{
  playerX: number;
  playerY: number;
  mapWidth: number;
  mapHeight: number;
  width: number;
  height: number;
}> = memo(({ playerX, playerY, mapWidth, mapHeight, width, height }) => {
  const scaleX = width / mapWidth;
  const scaleY = height / mapHeight;
  const playerDotX = playerX * scaleX;
  const playerDotY = playerY * scaleY;

  return (
    <div style={{
      width: `${width}px`,
      height: `${height}px`,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      border: '2px solid #555555',
      borderRadius: '4px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Grid lines */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '20% 20%'
        }}
      />
      
      {/* Player position */}
      <div
        style={{
          position: 'absolute',
          left: `${playerDotX}px`,
          top: `${playerDotY}px`,
          width: '4px',
          height: '4px',
          backgroundColor: '#00FF00',
          borderRadius: '50%',
          transform: 'translate(-50%, -50%)',
          boxShadow: '0 0 4px rgba(0, 255, 0, 0.8)'
        }}
      />
    </div>
  );
});

Minimap.displayName = 'Minimap';

/**
 * Debug information interface
 */
interface DebugData {
  entityId: EntityId | null;
  timestamp: number;
  memory: {
    used: number;
    total: number;
  } | null;
}

/**
 * Debug Information component
 */
const DebugInfo: React.FC<{
  entityId: EntityId | null;
  frameRate: number;
  entityCount: number;
}> = memo(({ entityId, frameRate, entityCount }) => {
  const [debugData, setDebugData] = useState<DebugData>({
    entityId: null,
    timestamp: Date.now(),
    memory: null
  });

  useEffect(() => {
    // In a real implementation, this would fetch actual debug data
    setDebugData({
      entityId,
      timestamp: Date.now(),
      memory: (performance as any).memory ? {
        used: Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round((performance as any).memory.totalJSHeapSize / 1024 / 1024)
      } : null
    });
  }, [entityId, frameRate, entityCount]);

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      color: '#00FF00',
      padding: '10px',
      fontFamily: 'monospace',
      fontSize: '12px',
      borderRadius: '4px',
      border: '1px solid #00FF00',
      minWidth: '200px',
      zIndex: 1000
    }}>
      <div style={{ fontWeight: 'bold', marginBottom: '8px', borderBottom: '1px solid #00FF00', paddingBottom: '4px' }}>
        DEBUG INFO
      </div>
      
      <div>FPS: {frameRate}</div>
      <div>Entities: {entityCount}</div>
      <div>Player ID: {entityId || 'None'}</div>
      
      {debugData.memory && (
        <div>Memory: {debugData.memory.used}MB / {debugData.memory.total}MB</div>
      )}
      
      <div>Time: {new Date().toLocaleTimeString()}</div>
      
      <div style={{ marginTop: '8px', fontSize: '10px', color: '#888888' }}>
        Last Update: {new Date(debugData.timestamp).toLocaleTimeString()}
      </div>
    </div>
  );
});

DebugInfo.displayName = 'DebugInfo';

/**
 * Main HUD Component
 */
export const HUD: React.FC<HUDProps> = memo(({ playerId, showDebugInfo = false }) => {
  const { debugOverlayVisible } = useUIStore();
  
  // Get player health and combat state
  const playerHealth = useEntityComponent<Health>(playerId, 'Health');
  const playerCombat = useEntityComponent<CombatStats>(playerId, 'CombatState');
  
  // Mock additional game state (in real implementation, these would come from game state)
  const [gameStats, setGameStats] = useState({
    level: 1,
    experience: { current: 150, max: 300 },
    mana: { current: 25, max: 50 },
    gold: 1250,
    time: '12:34',
    location: 'Forest of Beginnings',
    statusEffects: [
      { id: 'bless', name: 'Blessing', duration: 300, icon: '✨' },
      { id: 'haste', name: 'Haste', duration: 60, icon: '⚡' }
    ],
    playerPosition: { x: 100, y: 150 },
    mapDimensions: { width: 500, height: 500 },
    frameRate: 60,
    entityCount: 12
  });

  // Update game stats periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setGameStats(prev => ({
        ...prev,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        frameRate: Math.round(55 + Math.random() * 10) // Mock FPS variation
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  logger.debug(LogSource.UI, 'HUD rendering', { playerId, hasHealth: !!playerHealth });

  return (
    <>
      {/* Main HUD Panel */}
      <div style={{
        position: 'fixed',
        top: '20px',
        left: '20px',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        border: '2px solid #444444',
        borderRadius: '8px',
        padding: '15px',
        minWidth: '250px',
        fontFamily: 'monospace',
        color: '#FFFFFF',
        zIndex: 100
      }}>
        {/* Player Name and Level */}
        <div style={{
          fontSize: '16px',
          fontWeight: 'bold',
          marginBottom: '10px',
          color: '#FFD700',
          textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
        }}>
          Hero Lv.{gameStats.level}
        </div>

        {/* Health Bar */}
        {playerHealth && (
          <div style={{ marginBottom: '8px' }}>
            <div style={{ fontSize: '12px', marginBottom: '2px', color: '#CCCCCC' }}>HP</div>
            <HealthBar
              current={playerHealth.current}
              max={playerHealth.max}
              width={200}
              height={20}
            />
          </div>
        )}

        {/* Mana Bar */}
        <div style={{ marginBottom: '8px' }}>
          <div style={{ fontSize: '12px', marginBottom: '2px', color: '#CCCCCC' }}>MP</div>
          <ManaBar
            current={gameStats.mana.current}
            max={gameStats.mana.max}
            width={200}
            height={16}
          />
        </div>

        {/* Experience Bar */}
        <div style={{ marginBottom: '8px' }}>
          <div style={{ fontSize: '12px', marginBottom: '2px', color: '#CCCCCC' }}>EXP</div>
          <ExperienceBar
            current={gameStats.experience.current}
            max={gameStats.experience.max}
            level={gameStats.level}
            width={200}
            height={16}
          />
        </div>

        {/* Status Effects */}
        <StatusEffects effects={gameStats.statusEffects} />

        {/* Combat State */}
        {playerCombat && (
          <div style={{
            marginTop: '10px',
            padding: '8px',
            backgroundColor: 'rgba(255, 0, 0, 0.2)',
            border: '1px solid #FF0000',
            borderRadius: '4px',
            fontSize: '11px'
          }}>
            <div style={{ color: '#FF6666', fontWeight: 'bold' }}>COMBAT</div>
            <div>AP: {playerCombat.actionPoints}/{playerCombat.maxActionPoints}</div>
            <div>ATK: {playerCombat.attack} | DEF: {playerCombat.defense}</div>
          </div>
        )}
      </div>

      {/* Top Right Info Panel */}
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        border: '2px solid #444444',
        borderRadius: '8px',
        padding: '15px',
        fontFamily: 'monospace',
        color: '#FFFFFF',
        zIndex: 100,
        textAlign: 'right'
      }}>
        <div style={{ fontSize: '14px', marginBottom: '8px' }}>
          🪙 {gameStats.gold.toLocaleString()}
        </div>
        <div style={{ fontSize: '12px', color: '#CCCCCC' }}>
          📍 {gameStats.location}
        </div>
        <div style={{ fontSize: '12px', color: '#CCCCCC' }}>
          🕐 {gameStats.time}
        </div>
      </div>

      {/* Minimap */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 100
      }}>
        <Minimap
          playerX={gameStats.playerPosition.x}
          playerY={gameStats.playerPosition.y}
          mapWidth={gameStats.mapDimensions.width}
          mapHeight={gameStats.mapDimensions.height}
          width={120}
          height={120}
        />
      </div>

      {/* Debug Info */}
      {(showDebugInfo || debugOverlayVisible) && (
        <DebugInfo
          entityId={playerId}
          frameRate={gameStats.frameRate}
          entityCount={gameStats.entityCount}
        />
      )}

      {/* Quick Action Hints */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        left: '20px',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        border: '2px solid #444444',
        borderRadius: '8px',
        padding: '10px',
        fontFamily: 'monospace',
        fontSize: '11px',
        color: '#CCCCCC',
        zIndex: 100
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '5px', color: '#FFFFFF' }}>Quick Actions</div>
        <div>[M] Menu | [I] Inventory | [Space] Confirm</div>
        <div>[Esc] Back | [Tab] Switch Target</div>
      </div>
    </>
  );
});

HUD.displayName = 'HUD';

export default HUD;