'use client';

/**
 * Combat UI Components
 * @fileoverview User interface for turn-based combat with battle animations and controls
 */

import React, { memo, useEffect, useState, useCallback } from 'react';
import { useUIStore } from '../store';
import { logger, LogSource } from '../engine/GlobalLogger';
import { CombatSystem, CombatState, CombatAction } from '../engine/CombatSystem';
import { EntityId, Health, CombatState } from '../types';

/**
 * Combat participant display component
 */
const CombatParticipant: React.FC<{
  entityId: EntityId;
  name: string;
  health: Health;
  combatState: CombatState;
  isPlayer: boolean;
  isCurrentTurn: boolean;
  isDefeated: boolean;
}> = memo(({ 
  entityId, 
  name, 
  health, 
  combatState, 
  isPlayer, 
  isCurrentTurn, 
  isDefeated 
}) => {
  const healthPercentage = health.max > 0 ? (health.current / health.max) * 100 : 0;

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px',
    backgroundColor: isPlayer ? 'rgba(0, 100, 200, 0.8)' : 'rgba(200, 50, 50, 0.8)',
    border: isCurrentTurn ? '3px solid #FFD700' : '2px solid #444444',
    borderRadius: '12px',
    margin: '10px',
    minWidth: '200px',
    fontFamily: 'monospace',
    color: '#FFFFFF',
    transition: 'all 0.3s ease',
    opacity: isDefeated ? 0.5 : 1.0,
    filter: isDefeated ? 'grayscale(100%)' : 'none'
  };

  const nameStyle: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '8px',
    color: isPlayer ? '#FFD700' : '#FF6B6B'
  };

  const healthBarStyle: React.CSSProperties = {
    width: '150px',
    height: '20px',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    border: '2px solid #333333',
    borderRadius: '10px',
    overflow: 'hidden',
    position: 'relative'
  };

  const healthFillStyle: React.CSSProperties = {
    height: '100%',
    backgroundColor: healthPercentage > 60 ? '#4CAF50' : 
                    healthPercentage > 30 ? '#FFC107' : '#F44336',
    transition: 'width 0.3s ease',
    width: `${healthPercentage}%`
  };

  const healthTextStyle: React.CSSProperties = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    color: '#FFFFFF',
    fontSize: '12px',
    fontWeight: 'bold',
    textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
  };

  const statusStyle: React.CSSProperties = {
    fontSize: '14px',
    marginTop: '8px',
    color: isDefeated ? '#FF6B6B' : '#CCCCCC'
  };

  return (
    <div style={containerStyle}>
      <div style={nameStyle}>{name}</div>
      
      <div style={healthBarStyle}>
        <div style={healthFillStyle}>
          <div style={healthTextStyle}>
            {Math.ceil(health.current)}/{health.max}
          </div>
        </div>
      </div>
      
      <div style={statusStyle}>
        {isDefeated ? 'DEFEATED' : 
         isCurrentTurn ? 'READY' : 
         combatState.attacking ? 'ATTACKING' : 'WAITING'}
        }
      </div>
    </div>
  );
});

CombatParticipant.displayName = 'CombatParticipant';

/**
 * Combat action button component
 */
const CombatActionButton: React.FC<{
  label: string;
  disabled?: boolean;
  shortcut?: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
}> = memo(({ 
  label, 
  disabled = false, 
  shortcut, 
  onClick, 
  variant = 'primary' 
}) => {
  const buttonStyle: React.CSSProperties = {
    padding: '12px 24px',
    margin: '5px',
    backgroundColor: disabled ? '#333333' : 
                    variant === 'primary' ? '#4CAF50' :
                    variant === 'secondary' ? '#2196F3' : '#F44336',
    border: disabled ? '#222222' : 
                    variant === 'primary' ? '#45A049' :
                    variant === 'secondary' ? '#1976D2' : '#D32F2F',
    borderRadius: '8px',
    color: '#FFFFFF',
    fontSize: '14px',
    fontWeight: 'bold',
    fontFamily: 'monospace',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    opacity: disabled ? 0.5 : 1.0,
    transform: disabled ? 'scale(0.95)' : 'scale(1)'
  };

  const shortcutStyle: React.CSSProperties = {
    fontSize: '12px',
    color: '#CCCCCC',
    marginLeft: '8px'
  };

  return (
    <button
      style={buttonStyle}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
    >
      {label}
      {shortcut && <span style={shortcutStyle}>[{shortcut}]</span>}
    </button>
  );
});

CombatActionButton.displayName = 'CombatActionButton';

/**
 * Combat log component
 */
const CombatLog: React.FC<{
  messages: Array<{ message: string; type: 'info' | 'damage' | 'heal'; timestamp: number }>;
}> = memo(({ messages }) => {
  const containerStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: '20px',
    left: '20px',
    width: '400px',
    height: '200px',
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    border: '2px solid #444444',
    borderRadius: '8px',
    padding: '15px',
    fontFamily: 'monospace',
    fontSize: '12px',
    color: '#FFFFFF',
    overflowY: 'auto',
    zIndex: 300
  };

  const messageStyle: React.CSSProperties = {
    marginBottom: '5px',
    padding: '8px',
    borderRadius: '4px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)'
  };

  const infoStyle: React.CSSProperties = { ...messageStyle, borderLeft: '3px solid #4CAF50' };
  const damageStyle: React.CSSProperties = { ...messageStyle, borderLeft: '3px solid #F44336' };
  const healStyle: React.CSSProperties = { ...messageStyle, borderLeft: '3px solid #2196F3' };

  const getMessageStyle = (type: string) => {
    switch (type) {
      case 'info': return infoStyle;
      case 'damage': return damageStyle;
      case 'heal': return healStyle;
      default: return messageStyle;
    }
  };

  return (
    <div style={containerStyle}>
      <div style={{ fontWeight: 'bold', marginBottom: '10px', borderBottom: '1px solid #444444', paddingBottom: '5px' }}>
        COMBAT LOG
      </div>
      {messages.slice(-10).reverse().map((msg, index) => (
        <div key={index} style={getMessageStyle(msg.type)}>
          <span style={{ color: '#888888', fontSize: '10px' }}>
            {new Date(msg.timestamp).toLocaleTimeString()}
          </span>
          {' '}
          {msg.message}
        </div>
      ))}
    </div>
  );
});

CombatLog.displayName = 'CombatLog';

/**
 * Combat UI main component
 */
export const CombatUI: React.FC<{
  combatSystem: CombatSystem;
  onClose: () => void;
}> = memo(({ combatSystem, onClose }) => {
  const { setDialogVisible } = useUIStore();
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [combatLog, setCombatLog] = useState<Array<{ message: string; type: 'info' | 'damage' | 'heal'; timestamp: number }>>([]);

  const combatState = combatSystem.getCurrentState();
  const participants = combatSystem.getParticipants();
  const stats = combatSystem.getStats();

  // Add combat log messages
  const addLogMessage = useCallback((message: string, type: 'info' | 'damage' | 'heal' = 'info') => {
    setCombatLog(prev => [...prev, { message, type, timestamp: Date.now() }]);
  }, []);

  // Handle player actions
  const handlePlayerAction = useCallback((action: CombatAction) => {
    const player = participants.find(p => p.isPlayer && !p.defeated);
    if (!player) return;

    combatSystem.queueAction({
      id: `player_${action}_${Date.now()}`,
      type: action,
      actorId: player.entityId,
      targetId: null, // Will be determined by system
      data: { priority: 0 }
    });

    addLogMessage(`Player chose ${action}`, 'info');
    setSelectedAction(null);
  }, [participants, combatSystem, addLogMessage]);

  // Handle skill selection
  const handleSkillSelect = useCallback((skillId: string) => {
    const player = participants.find(p => p.isPlayer && !p.defeated);
    if (!player) return;

    combatSystem.queueAction({
      id: `skill_${skillId}_${Date.now()}`,
      type: CombatAction.SKILL,
      actorId: player.entityId,
      targetId: null,
      data: { skillId, priority: 1 }
    });

    addLogMessage(`Player selected skill: ${skillId}`, 'info');
    setSelectedAction(null);
  }, [participants, combatSystem, addLogMessage]);

  // Handle item selection
  const handleItemSelect = useCallback((itemId: string) => {
    const player = participants.find(p => p.isPlayer && !p.defeated);
    if (!player) return;

    combatSystem.queueAction({
      id: `item_${itemId}_${Date.now()}`,
      type: CombatAction.ITEM,
      actorId: player.entityId,
      targetId: null,
      data: { itemId, priority: 2 }
    });

    addLogMessage(`Player used item: ${itemId}`, 'info');
    setSelectedAction(null);
  }, [participants, combatSystem, addLogMessage]);

  // Handle flee
  const handleFlee = useCallback(() => {
    const player = participants.find(p => p.isPlayer && !p.defeated);
    if (!player) return;

    combatSystem.queueAction({
      id: `flee_${Date.now()}`,
      type: CombatAction.FLEE,
      actorId: player.entityId,
      targetId: null,
      data: { priority: 3 }
    });

    addLogMessage('Player is attempting to flee!', 'info');
    setSelectedAction(null);
  }, [participants, combatSystem, addLogMessage]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (combatState !== CombatState.PLAYER_INPUT) return;

      switch (e.key) {
        case '1':
        case 'Enter':
          e.preventDefault();
          handlePlayerAction(CombatAction.ATTACK);
          break;
        case '2':
          e.preventDefault();
          handlePlayerAction(CombatAction.DEFEND);
          break;
        case '3':
          e.preventDefault();
          handlePlayerAction(CombatAction.SKILL);
          setSelectedAction('skill');
          break;
        case '4':
          e.preventDefault();
          handlePlayerAction(CombatAction.ITEM);
          setSelectedAction('item');
          break;
        case '5':
          e.preventDefault();
          handleFlee();
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [combatState, handlePlayerAction, handleSkillSelect, handleItemSelect, handleFlee, onClose]);

  // Handle combat state changes
  useEffect(() => {
    // Add log messages for state changes
    if (combatState === CombatState.INTRO) {
      addLogMessage('Combat started!', 'info');
    } else if (combatState === CombatState.VICTORY) {
      addLogMessage('Victory! All enemies defeated!', 'heal');
      setTimeout(() => {
        setDialogVisible(true, 'Congratulations! You have emerged victorious!\\n\\nExperience gained: ' + (stats as any).result?.experience || 0));
        onClose();
      }, 2000);
    } else if (combatState === CombatState.DEFEAT) {
      addLogMessage('Defeat... You have been overwhelmed.', 'damage');
      setTimeout(() => {
        setDialogVisible(true, 'You have been defeated...\\n\\nDo not give up! Try again when you\\'re stronger.');
        onClose();
      }, 2000);
    }
  }, [combatState, addLogMessage, setDialogVisible, onClose]);

  const containerStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 500,
    fontFamily: 'monospace'
  };

  const battleAreaStyle: React.CSSProperties = {
    backgroundColor: 'rgba(20, 20, 40, 0.9)',
    border: '3px solid #8B4513',
    borderRadius: '12px',
    padding: '30px',
    minWidth: '800px',
    maxWidth: '1200px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '20px',
    color: '#FFD700',
    textAlign: 'center',
    textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
  };

  const participantsContainerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-around',
    marginBottom: '30px',
    flexWrap: 'wrap'
  };

  const controlsContainerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    gap: '10px',
    marginTop: '20px',
    flexWrap: 'wrap'
  };

  const turnIndicatorStyle: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '15px',
    textAlign: 'center',
    color: combatState === CombatState.PLAYER_INPUT ? '#FFD700' : '#FF6B6B',
    textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
  };

  return (
    <div style={containerStyle}>
      <div style={battleAreaStyle}>
        <div style={titleStyle}>
          {combatState === CombatState.INTRO && 'BATTLE START!'}
          {combatState === CombatState.PLAYER_INPUT && 'YOUR TURN'}
          {combatState === CombatState.ENEMY_TURN && 'ENEMY TURN'}
          {combatState === CombatState.ACTION_PROCESSING && 'PROCESSING...'}
          {combatState === CombatState.RESOLUTION && 'RESOLVING...'}
          {combatState === CombatState.VICTORY && 'VICTORY!'}
          {combatState === CombatState.DEFEAT && 'DEFEAT...'}
        </div>

        {/* Participants Display */}
        <div style={participantsContainerStyle}>
          {participants.map(participant => (
            <CombatParticipant
              key={participant.entityId}
              entityId={participant.entityId}
              name={participant.isPlayer ? 'Hero' : 'Monster'}
              health={participant.health || { current: 0, max: 1 }}
              combatState={participant.combatState || { attacking: false, attack: 0, defense: 0, actionPoints: 3, maxActionPoints: 3 }}
              isPlayer={participant.isPlayer}
              isCurrentTurn={combatState === CombatState.PLAYER_INPUT && participant.isPlayer}
              isDefeated={participant.defeated}
            />
          ))}
        </div>

        {/* Turn Indicator */}
        <div style={turnIndicatorStyle}>
          {combatState === CombatState.PLAYER_INPUT && 'Select your action'}
          {combatState === CombatState.ENEMY_TURN && 'Enemy is thinking...'}
          {combatState === CombatState.ACTION_PROCESSING && 'Executing actions...'}
        </div>

        {/* Player Controls */}
        {combatState === CombatState.PLAYER_INPUT && (
          <div style={controlsContainerStyle}>
            <CombatActionButton
              label="Attack"
              shortcut="1"
              onClick={() => handlePlayerAction(CombatAction.ATTACK)}
            />
            <CombatActionButton
              label="Defend"
              shortcut="2"
              onClick={() => handlePlayerAction(CombatAction.DEFEND)}
            />
            <CombatActionButton
              label="Skills"
              shortcut="3"
              onClick={() => handlePlayerAction(CombatAction.SKILL)}
              variant="secondary"
            />
            <CombatActionButton
              label="Items"
              shortcut="4"
              onClick={() => handlePlayerAction(CombatAction.ITEM)}
              variant="secondary"
            />
            <CombatActionButton
              label="Flee"
              shortcut="5"
              onClick={handleFlee}
              variant="danger"
            />
          </div>
        )}

        {/* Skill Selection Modal */}
        {selectedAction === 'skill' && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'rgba(0, 0, 0, 0.95)',
            border: '3px solid #444444',
            borderRadius: '12px',
            padding: '20px',
            zIndex: 600
          }}>
            <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px', color: '#FFD700' }}>
              Select Skill
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <CombatActionButton
                label="Fireball"
                onClick={() => handleSkillSelect('fireball')}
              />
              <CombatActionButton
                label="Heal"
                onClick={() => handleSkillSelect('heal')}
              />
              <CombatActionButton
                label="Lightning"
                onClick={() => handleSkillSelect('lightning')}
              />
              <CombatActionButton
                label="Cancel"
                onClick={() => setSelectedAction(null)}
                variant="secondary"
              />
            </div>
          </div>
        )}

        {/* Item Selection Modal */}
        {selectedAction === 'item' && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'rgba(0, 0, 0, 0.95)',
            border: '3px solid #444444',
            borderRadius: '12px',
            padding: '20px',
            zIndex: '600'
          }}>
            <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px', color: '#FFD700' }}>
              Select Item
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <CombatActionButton
                label="Health Potion"
                onClick={() => handleItemSelect('potion_health')}
              />
              <CombatActionButton
                label="Mana Potion"
                onClick={() => handleItemSelect('potion_mana')}
              />
              <CombatActionButton
                label="Cancel"
                onClick={() => setSelectedAction(null)}
                variant="secondary"
              />
            </div>
          </div>
        )}

        {/* Exit Button */}
        <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
          <CombatActionButton
            label="Exit (ESC)"
            onClick={onClose}
            variant="secondary"
          />
        </div>
      </div>

      {/* Combat Log */}
      <CombatLog messages={combatLog} />
    </div>
  );
});

CombatUI.displayName = 'CombatUI';

export default CombatUI;