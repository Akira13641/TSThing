'use client';

/**
 * Dialog System Component
 * @fileoverview Advanced dialog system with typewriter effect and scripting support
 */

import React, { memo, useEffect, useState, useRef, useCallback } from 'react';
import { useDialogState, useUIStore } from '../store';
import { logger, LogSource } from '../engine/GlobalLogger';

/**
 * Dialog token types for parsing
 */
type DialogToken = 
  | { type: 'text'; content: string }
  | { type: 'wait'; duration: number }
  | { type: 'shake'; duration: number }
  | { type: 'speed'; speed: number }
  | { type: 'color'; color: string }
  | { type: 'sound'; soundId: string }
  | { type: 'emotion'; emotion: string }
  | { type: 'choice'; options: Array<{ text: string; value: string }> }
  | { type: 'variable'; name: string };

/**
 * Dialog configuration interface
 */
interface DialogConfig {
  /** Typewriter speed (characters per second) */
  typewriterSpeed: number;
  /** Auto-advance delay after completing text */
  autoAdvanceDelay: number;
  /** Whether to show character name */
  showSpeaker: boolean;
  /** Whether to allow skipping */
  allowSkip: boolean;
  /** Sound effect for each character */
  characterSound?: string;
}

/**
 * Dialog state interface
 */
interface DialogState {
  /** Current dialog text */
  text: string;
  /** Currently displayed text (for typewriter effect) */
  displayedText: string;
  /** Speaker name */
  speaker: string;
  /** Whether dialog is complete */
  complete: boolean;
  /** Whether waiting for user input */
  waiting: boolean;
  /** Current choice selection */
  selectedChoice: number;
  /** Available choices */
  choices: Array<{ text: string; value: string }>;
  /** Dialog tokens */
  tokens: DialogToken[];
  /** Current token index */
  tokenIndex: number;
  /** Current character index in text token */
  charIndex: number;
  /** Typewriter speed modifier */
  currentSpeed: number;
  /** Text color */
  textColor: string;
}

/**
 * Parses dialog string into tokens
 * @param dialogText - Raw dialog text with control codes
 * @returns Parsed tokens array
 */
function parseDialogTokens(dialogText: string): DialogToken[] {
  const tokens: DialogToken[] = [];
  let currentIndex = 0;
  
  while (currentIndex < dialogText.length) {
    const char = dialogText[currentIndex];
    
    if (char === '{') {
      // Find closing brace
      const endIndex = dialogText.indexOf('}', currentIndex);
      if (endIndex === -1) {
        // Unclosed brace, treat as literal text
        tokens.push({ type: 'text', content: char });
        currentIndex++;
        continue;
      }
      
      const controlCode = dialogText.substring(currentIndex + 1, endIndex);
      const parts = controlCode.split(' ');
      const command = parts[0];
      
      switch (command) {
        case 'wait': {
          const duration = parseFloat(parts[1]) || 1.0;
          tokens.push({ type: 'wait', duration });
          break;
        }
        
        case 'shake': {
          const duration = parseFloat(parts[1]) || 0.5;
          tokens.push({ type: 'shake', duration });
          break;
        }
        
        case 'speed': {
          const speed = parseFloat(parts[1]) || 1.0;
          tokens.push({ type: 'speed', speed });
          break;
        }
        
        case 'color': {
          const color = parts[1] || '#FFFFFF';
          tokens.push({ type: 'color', color });
          break;
        }
        
        case 'sound': {
          const soundId = parts[1] || 'text_blip';
          tokens.push({ type: 'sound', soundId });
          break;
        }
        
        case 'emotion': {
          const emotion = parts[1] || 'neutral';
          tokens.push({ type: 'emotion', emotion });
          break;
        }
        
        case 'choice': {
          // Parse choice options: {choice Option 1|value1 Option 2|value2}
          const choiceText = controlCode.substring(7).trim();
          const options = choiceText.split('|').map(opt => {
            const parts = opt.trim().split(' ');
            return {
              text: parts.slice(0, -1).join(' '),
              value: parts[parts.length - 1]
            };
          });
          tokens.push({ type: 'choice', options });
          break;
        }
        
        case 'var': {
          const varName = parts[1] || '';
          tokens.push({ type: 'variable', name: varName });
          break;
        }
        
        default:
          // Unknown command, treat as literal text
          tokens.push({ type: 'text', content: dialogText.substring(currentIndex, endIndex + 1) });
          break;
      }
      
      currentIndex = endIndex + 1;
    } else {
      // Regular text - accumulate until next control code
      let text = '';
      while (currentIndex < dialogText.length && dialogText[currentIndex] !== '{') {
        text += dialogText[currentIndex];
        currentIndex++;
      }
      tokens.push({ type: 'text', content: text });
    }
  }
  
  return tokens;
}

/**
 * Dialog Box component
 */
const DialogBox: React.FC<{
  state: DialogState;
  config: DialogConfig;
  onAdvance: () => void;
  onSelectChoice: (choiceIndex: number) => void;
}> = memo(({ state, config, onAdvance, onSelectChoice }) => {
  const [isShaking, setIsShaking] = useState(false);
  const shakeTimeoutRef = useRef<NodeJS.Timeout>();

  // Handle shake effect
  useEffect(() => {
    const currentToken = state.tokens[state.tokenIndex];
    if (currentToken?.type === 'shake') {
      setIsShaking(true);
      
      if (shakeTimeoutRef.current) {
        clearTimeout(shakeTimeoutRef.current);
      }
      
      shakeTimeoutRef.current = setTimeout(() => {
        setIsShaking(false);
      }, currentToken.duration * 1000);
    }
  }, [state.tokenIndex, state.tokens]);

  // Handle character sound
  useEffect(() => {
    if (state.charIndex > 0 && state.charIndex % 3 === 0 && config.characterSound) {
      // Play character sound effect
      logger.debug(LogSource.UI, `Playing character sound: ${config.characterSound}`);
    }
  }, [state.charIndex, config.characterSound]);

  const boxStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: '80px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '90%',
    maxWidth: '800px',
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    border: '3px solid #444444',
    borderRadius: '12px',
    padding: '20px',
    fontFamily: 'monospace',
    fontSize: '16px',
    color: state.textColor,
    zIndex: 200,
    transition: isShaking ? 'none' : 'all 0.3s ease',
    animation: isShaking ? 'shake 0.1s infinite' : 'none'
  };

  const speakerStyle: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '12px',
    color: '#FFD700',
    textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
  };

  const textStyle: React.CSSProperties = {
    lineHeight: '1.6',
    minHeight: '60px',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word'
  };

  const continueIndicatorStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: '10px',
    right: '20px',
    fontSize: '20px',
    animation: 'bounce 1s infinite',
    color: '#FFFFFF'
  };

  const choiceStyle: React.CSSProperties = {
    backgroundColor: state.selectedChoice === 0 ? '#444444' : 'transparent',
    border: '2px solid #666666',
    borderRadius: '8px',
    padding: '12px',
    margin: '8px 0',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  };

  return (
    <>
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          25% { transform: translateX(-48%) translateY(-2px); }
          50% { transform: translateX(-52%) translateY(2px); }
          75% { transform: translateX(-48%) translateY(-1px); }
        }
        
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
      `}</style>
      
      <div style={boxStyle}>
        {/* Speaker name */}
        {config.showSpeaker && state.speaker && (
          <div style={speakerStyle}>{state.speaker}</div>
        )}
        
        {/* Dialog text */}
        <div style={textStyle}>
          {state.displayedText}
          {state.complete && !state.waiting && !state.choices.length && (
            <span style={continueIndicatorStyle}>▼</span>
          )}
        </div>
        
        {/* Choice options */}
        {state.choices.length > 0 && (
          <div style={{ marginTop: '20px' }}>
            {state.choices.map((choice, index) => (
              <div
                key={index}
                style={{
                  ...choiceStyle,
                  backgroundColor: state.selectedChoice === index ? '#444444' : 'transparent'
                }}
                onClick={() => onSelectChoice(index)}
                onMouseEnter={() => {
                  // In a real implementation, you'd update selected choice
                  logger.debug(LogSource.UI, `Hovering choice ${index}: ${choice.text}`);
                }}
              >
                {index + 1}. {choice.text}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
});

DialogBox.displayName = 'DialogBox';

/**
 * Main Dialog System Component
 */
export const DialogSystem: React.FC = memo(() => {
  const { visible, text } = useDialogState();
  const { setDialogVisible } = useUIStore();
  
  const [dialogState, setDialogState] = useState<DialogState>({
    text: '',
    displayedText: '',
    speaker: '',
    complete: false,
    waiting: false,
    selectedChoice: 0,
    choices: [],
    tokens: [],
    tokenIndex: 0,
    charIndex: 0,
    currentSpeed: 30,
    textColor: '#FFFFFF'
  });

  const [config] = useState<DialogConfig>({
    typewriterSpeed: 30,
    autoAdvanceDelay: 2.0,
    showSpeaker: true,
    allowSkip: true,
    characterSound: 'text_blip'
  });

  const typewriterIntervalRef = useRef<NodeJS.Timeout>();
  const autoAdvanceTimeoutRef = useRef<NodeJS.Timeout>();

  // Parse speaker from text (format: "Speaker: Message")
  const parseSpeaker = useCallback((fullText: string): { speaker: string; message: string } => {
    const colonIndex = fullText.indexOf(':');
    if (colonIndex > 0 && colonIndex < 50) { // Reasonable speaker name length
      return {
        speaker: fullText.substring(0, colonIndex).trim(),
        message: fullText.substring(colonIndex + 1).trim()
      };
    }
    return {
      speaker: '',
      message: fullText
    };
  }, []);

  // Start new dialog
  const startDialog = useCallback((newText: string) => {
    const { speaker, message } = parseSpeaker(newText);
    const tokens = parseDialogTokens(message);
    
    setDialogState(prev => ({
      ...prev,
      text: newText,
      displayedText: '',
      speaker,
      complete: false,
      waiting: false,
      selectedChoice: 0,
      choices: [],
      tokens,
      tokenIndex: 0,
      charIndex: 0,
      currentSpeed: config.typewriterSpeed,
      textColor: '#FFFFFF'
    }));

    logger.debug(LogSource.UI, `Started dialog: ${speaker || 'Unknown'} - ${message.substring(0, 50)}...`);
  }, [parseSpeaker, config.typewriterSpeed]);

  // Process tokens
  const processTokens = useCallback(() => {
    setDialogState(prev => {
      if (prev.tokenIndex >= prev.tokens.length) {
        // All tokens processed
        return {
          ...prev,
          complete: true,
          waiting: true
        };
      }

      const currentToken = prev.tokens[prev.tokenIndex];
      
      switch (currentToken.type) {
        case 'text':
          // Continue typewriter effect for this text
          if (prev.charIndex < currentToken.content.length) {
            // Still typing this token
            return prev;
          } else {
            // Finished this token, move to next
            return {
              ...prev,
              tokenIndex: prev.tokenIndex + 1,
              charIndex: 0
            };
          }

        case 'wait':
          // Wait for specified duration
          setTimeout(() => {
            setDialogState(prev => ({
              ...prev,
              tokenIndex: prev.tokenIndex + 1,
              charIndex: 0
            }));
          }, currentToken.duration * 1000);
          
          return {
            ...prev,
            waiting: true
          };

        case 'speed':
          // Change typewriter speed
          return {
            ...prev,
            currentSpeed: currentToken.speed * config.typewriterSpeed,
            tokenIndex: prev.tokenIndex + 1,
            charIndex: 0
          };

        case 'color':
          // Change text color
          return {
            ...prev,
            textColor: currentToken.color,
            tokenIndex: prev.tokenIndex + 1,
            charIndex: 0
          };

        case 'choice':
          // Show choice options
          return {
            ...prev,
            choices: currentToken.options,
            complete: true,
            waiting: true,
            tokenIndex: prev.tokenIndex + 1,
            charIndex: 0
          };

        case 'emotion':
          // Handle emotion (would update character sprite)
          logger.debug(LogSource.UI, `Character emotion: ${currentToken.emotion}`);
          return {
            ...prev,
            tokenIndex: prev.tokenIndex + 1,
            charIndex: 0
          };

        case 'sound':
          // Play sound effect
          logger.debug(LogSource.UI, `Playing dialog sound: ${currentToken.soundId}`);
          return {
            ...prev,
            tokenIndex: prev.tokenIndex + 1,
            charIndex: 0
          };

        case 'variable':
          // Handle variable substitution
          // In a real implementation, you'd look up variable values
          const variableValue = `{Variable: ${currentToken.name}}`;
          return {
            ...prev,
            displayedText: prev.displayedText + variableValue,
            tokenIndex: prev.tokenIndex + 1,
            charIndex: 0
          };

        default:
          // Unknown token, skip it
          return {
            ...prev,
            tokenIndex: prev.tokenIndex + 1,
            charIndex: 0
          };
      }
    });
  }, [config.typewriterSpeed]);

  // Typewriter effect
  useEffect(() => {
    if (!visible || dialogState.complete || dialogState.waiting) {
      if (typewriterIntervalRef.current) {
        clearInterval(typewriterIntervalRef.current);
        typewriterIntervalRef.current = undefined;
      }
      return;
    }

    const currentToken = dialogState.tokens[dialogState.tokenIndex];
    if (currentToken?.type !== 'text') {
      processTokens();
      return;
    }

    typewriterIntervalRef.current = setInterval(() => {
      setDialogState(prev => {
        if (prev.charIndex < currentToken.content.length) {
          const newChar = currentToken.content[prev.charIndex];
          return {
            ...prev,
            displayedText: prev.displayedText + newChar,
            charIndex: prev.charIndex + 1
          };
        } else {
          // Finished this token
          processTokens();
          return prev;
        }
      });
    }, 1000 / dialogState.currentSpeed);

    return () => {
      if (typewriterIntervalRef.current) {
        clearInterval(typewriterIntervalRef.current);
        typewriterIntervalRef.current = undefined;
      }
    };
  }, [visible, dialogState, processTokens]);

  // Handle dialog text changes
  useEffect(() => {
    if (visible && text) {
      startDialog(text);
    }
  }, [visible, text, startDialog]);

  // Handle user input
  const handleAdvance = useCallback(() => {
    if (!visible) return;

    if (dialogState.choices.length > 0) {
      // Handle choice selection
      const selectedChoice = dialogState.choices[dialogState.selectedChoice];
      logger.debug(LogSource.UI, `Selected choice: ${selectedChoice.text} (${selectedChoice.value})`);
      
      // In a real implementation, you'd trigger the choice action
      setDialogVisible(false);
    } else if (dialogState.complete) {
      // Dialog complete, close it
      setDialogVisible(false);
    } else if (config.allowSkip) {
      // Skip typewriter effect
      setDialogState(prev => ({
        ...prev,
        displayedText: prev.text,
        complete: true,
        waiting: true
      }));
    }
  }, [visible, dialogState, config.allowSkip, setDialogVisible]);

  const handleSelectChoice = useCallback((choiceIndex: number) => {
    setDialogState(prev => ({
      ...prev,
      selectedChoice: choiceIndex
    }));
  }, []);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!visible) return;

      switch (e.key) {
        case 'Enter':
        case ' ':
        case 'z':
        case 'x':
          e.preventDefault();
          handleAdvance();
          break;
        
        case 'ArrowUp':
        case 'w':
          if (dialogState.choices.length > 0) {
            e.preventDefault();
            setDialogState(prev => ({
              ...prev,
              selectedChoice: Math.max(0, prev.selectedChoice - 1)
            }));
          }
          break;
        
        case 'ArrowDown':
        case 's':
          if (dialogState.choices.length > 0) {
            e.preventDefault();
            setDialogState(prev => ({
              ...prev,
              selectedChoice: Math.min(dialogState.choices.length - 1, prev.selectedChoice + 1)
            }));
          }
          break;
        
        case 'Escape':
          e.preventDefault();
          setDialogVisible(false);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [visible, dialogState.choices.length, dialogState.selectedChoice, handleAdvance, setDialogVisible]);

  if (!visible) return null;

  return (
    <DialogBox
      state={dialogState}
      config={config}
      onAdvance={handleAdvance}
      onSelectChoice={handleSelectChoice}
    />
  );
});

DialogSystem.displayName = 'DialogSystem';

export default DialogSystem;