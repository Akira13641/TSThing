/**
 * Accessibility System
 * @fileoverview Comprehensive accessibility features for inclusive gaming
 */

import { logger, LogSource } from '../engine/GlobalLogger';
import { AccessibilityOptions } from '../types';

/**
 * Color blind filter configurations
 */
const COLOR_BLIND_FILTERS = {
  none: '',
  protanopia: 'url(#protanopia-filter)',
  deuteranopia: 'url(#deuteranopia-filter)',
  tritanopia: 'url(#tritanopia-filter)'
};

/**
 * Text-to-speech synthesis interface
 */
interface TextToSpeech {
  speak: (text: string, options?: SpeechSynthesisUtterance) => void;
  cancel: () => void;
  pause: () => void;
  resume: () => void;
  speaking: boolean;
}

/**
 * Accessibility System
 * Manages all accessibility features and settings
 */
export class AccessibilitySystem {
  /** Current accessibility options */
  private options: AccessibilityOptions = {
    highContrast: false,
    largeText: false,
    colorBlindMode: 'none',
    screenReader: false,
    reducedMotion: false,
    audioVisualIndicators: true,
    autoSaveFrequency: 300,
    textToSpeechSpeed: 1.0,
    subtitleSize: 'medium',
    inputAssistance: {
      buttonHolding: false,
      rapidFire: false,
      stickSensitivity: 1.0
    }
  };

  /** Text-to-speech instance */
  private tts: TextToSpeech | null = null;

  /** Root element for applying accessibility styles */
  private rootElement: HTMLElement | null = null;

  /** High contrast styles */
  private highContrastStyles: HTMLStyleElement | null = null;

  /** Large text styles */
  private largeTextStyles: HTMLStyleElement | null = null;

  /** Reduced motion styles */
  private reducedMotionStyles: HTMLStyleElement | null = null;

  /** Audio visual indicators */
  private audioVisualizer: HTMLElement | null = null;

  /** Subtitle display element */
  private subtitleElement: HTMLElement | null = null;

  /** Focus trap for keyboard navigation */
  private focusTrap: { element: HTMLElement | null; previousElement: HTMLElement | null } = {
    element: null,
    previousElement: null
  };

  /** Keyboard navigation state */
  private keyboardNavigation = {
    enabled: false,
    currentIndex: 0,
    focusableElements: HTMLElement[] = []
  };

  /** Input assistance state */
  private inputAssistance = {
    heldButtons: new Set<string>(),
    rapidFireTimers: new Map<string, NodeJS.Timeout>(),
    lastInputTime: 0
  };

  /**
   * Creates a new AccessibilitySystem instance
   */
  constructor() {
    this.rootElement = document.documentElement;
    this.initializeTextToSpeech();
    this.createAccessibilityElements();
    this.loadSettings();
    this.applySettings();
    
    logger.info(LogSource.UI, 'AccessibilitySystem initialized');
  }

  /**
   * Updates accessibility options
   * @param options - New options to apply
   */
  public updateOptions(options: Partial<AccessibilityOptions>): void {
    this.options = { ...this.options, ...options };
    this.applySettings();
    this.saveSettings();
    
    logger.debug(LogSource.UI, 'Accessibility options updated');
  }

  /**
   * Gets current accessibility options
   * @returns Current options
   */
  public getOptions(): AccessibilityOptions {
    return { ...this.options };
  }

  /**
   * Enables or disables screen reader
   * @param enabled - Whether screen reader should be enabled
   */
  public setScreenReader(enabled: boolean): void {
    this.options.screenReader = enabled;
    this.applySettings();
    
    if (enabled) {
      this.announceToScreenReader('Screen reader enabled');
    }
    
    logger.debug(LogSource.UI, `Screen reader ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Speaks text using text-to-speech
   * @param text - Text to speak
   * @param priority - Priority level (lower = higher priority)
   */
  public speak(text: string, priority: number = 0): void {
    if (!this.options.screenReader || !this.tts) return;
    
    // Cancel previous speech if higher priority
    if (priority < 1) {
      this.tts.cancel();
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = this.options.textToSpeechSpeed;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    this.tts.speak(utterance);
    
    logger.debug(LogSource.UI, `TTS: "${text}"`);
  }

  /**
   * Shows subtitles for audio content
   * @param text - Subtitle text
   * @param duration - Display duration in seconds
   */
  public showSubtitle(text: string, duration: number = 3.0): void {
    if (!this.subtitleElement) return;
    
    this.subtitleElement.textContent = text;
    this.subtitleElement.style.display = 'block';
    
    // Apply size class
    this.subtitleElement.className = `subtitle subtitle-${this.options.subtitleSize}`;
    
    // Hide after duration
    setTimeout(() => {
      if (this.subtitleElement) {
        this.subtitleElement.style.display = 'none';
      }
    }, duration * 1000);
    
    // Also speak if screen reader is enabled
    if (this.options.screenReader) {
      this.speak(text);
    }
    
    logger.debug(LogSource.UI, `Subtitle: "${text}"`);
  }

  /**
   * Shows visual indicator for audio cue
   * @param type - Type of audio cue
   * @param intensity - Intensity of the indicator (0-1)
   */
  public showAudioIndicator(type: 'damage' | 'heal' | 'levelup' | 'item' | 'alert', intensity: number = 1.0): void {
    if (!this.options.audioVisualIndicators || !this.audioVisualizer) return;
    
    const indicator = document.createElement('div');
    indicator.className = `audio-indicator audio-indicator-${type}`;
    indicator.style.opacity = intensity.toString();
    
    // Add to visualizer
    this.audioVisualizer.appendChild(indicator);
    
    // Animate and remove
    requestAnimationFrame(() => {
      indicator.style.transform = 'scale(1.5)';
      indicator.style.opacity = '0';
    });
    
    setTimeout(() => {
      if (indicator.parentNode) {
        indicator.parentNode.removeChild(indicator);
      }
    }, 500);
    
    logger.debug(LogSource.UI, `Audio indicator: ${type} (${intensity})`);
  }

  /**
   * Enables keyboard navigation for a container
   * @param container - Container element
   */
  public enableKeyboardNavigation(container: HTMLElement): void {
    this.keyboardNavigation.enabled = true;
    this.keyboardNavigation.focusableElements = this.getFocusableElements(container);
    this.keyboardNavigation.currentIndex = 0;
    
    // Focus first element
    if (this.keyboardNavigation.focusableElements.length > 0) {
      this.keyboardNavigation.focusableElements[0].focus();
    }
    
    this.setupKeyboardEventListeners();
    
    logger.debug(LogSource.UI, 'Keyboard navigation enabled');
  }

  /**
   * Disables keyboard navigation
   */
  public disableKeyboardNavigation(): void {
    this.keyboardNavigation.enabled = false;
    this.removeKeyboardEventListeners();
    
    logger.debug(LogSource.UI, 'Keyboard navigation disabled');
  }

  /**
   * Processes input assistance
   * @param input - Input identifier
   * @param pressed - Whether input is pressed
   */
  public processInputAssistance(input: string, pressed: boolean): void {
    if (!this.options.inputAssistance.buttonHolding && 
        !this.options.inputAssistance.rapidFire) {
      return;
    }

    if (pressed) {
      // Button holding assistance
      if (this.options.inputAssistance.buttonHolding) {
        this.inputAssistance.heldButtons.add(input);
      }
      
      // Rapid fire assistance
      if (this.options.inputAssistance.rapidFire) {
        this.startRapidFire(input);
      }
    } else {
      // Release button
      this.inputAssistance.heldButtons.delete(input);
      this.stopRapidFire(input);
    }
    
    this.inputAssistance.lastInputTime = Date.now();
  }

  /**
   * Creates focus trap for modal dialogs
   * @param element - Element to trap focus within
   */
  public createFocusTrap(element: HTMLElement): void {
    // Store previous focused element
    this.focusTrap.previousElement = document.activeElement as HTMLElement;
    this.focusTrap.element = element;
    
    // Get focusable elements within trap
    const focusableElements = this.getFocusableElements(element);
    
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }
    
    // Setup trap event listeners
    element.addEventListener('keydown', this.handleFocusTrapKeydown);
    
    logger.debug(LogSource.UI, 'Focus trap created');
  }

  /**
   * Releases focus trap
   */
  public releaseFocusTrap(): void {
    if (this.focusTrap.previousElement) {
      this.focusTrap.previousElement.focus();
      this.focusTrap.previousElement = null;
    }
    
    if (this.focusTrap.element) {
      this.focusTrap.element.removeEventListener('keydown', this.handleFocusTrapKeydown);
      this.focusTrap.element = null;
    }
    
    logger.debug(LogSource.UI, 'Focus trap released');
  }

  /**
   * Initializes text-to-speech system
   */
  private initializeTextToSpeech(): void {
    if ('speechSynthesis' in window) {
      this.tts = {
        speak: (text: string, options?: SpeechSynthesisUtterance) => {
          const utterance = options || new SpeechSynthesisUtterance(text);
          speechSynthesis.speak(utterance);
        },
        cancel: () => speechSynthesis.cancel(),
        pause: () => speechSynthesis.pause(),
        resume: () => speechSynthesis.resume(),
        get speaking() { return speechSynthesis.speaking; }
      };
      
      logger.debug(LogSource.UI, 'Text-to-speech initialized');
    } else {
      logger.warn(LogSource.UI, 'Text-to-speech not supported');
    }
  }

  /**
   * Creates accessibility DOM elements
   */
  private createAccessibilityElements(): void {
    // Create color blind filters
    this.createColorBlindFilters();
    
    // Create audio visualizer
    this.audioVisualizer = document.createElement('div');
    this.audioVisualizer.id = 'audio-visualizer';
    this.audioVisualizer.className = 'audio-visualizer';
    document.body.appendChild(this.audioVisualizer);
    
    // Create subtitle element
    this.subtitleElement = document.createElement('div');
    this.subtitleElement.id = 'subtitles';
    this.subtitleElement.className = 'subtitle';
    this.subtitleElement.style.display = 'none';
    document.body.appendChild(this.subtitleElement);
    
    logger.debug(LogSource.UI, 'Accessibility elements created');
  }

  /**
   * Creates SVG filters for color blindness
   */
  private createColorBlindFilters(): void {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.style.position = 'absolute';
    svg.style.width = '0';
    svg.style.height = '0';
    
    // Protanopia filter
    const protanopia = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
    protanopia.id = 'protanopia-filter';
    protanopia.innerHTML = `
      <feColorMatrix type="matrix" values="
        0.567, 0.433, 0,     0, 0
        0.558, 0.442, 0,     0, 0
        0,     0.242, 0.758, 0, 0
        0,     0,     0,     1, 0
      "/>
    `;
    
    // Deuteranopia filter
    const deuteranopia = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
    deuteranopia.id = 'deuteranopia-filter';
    deuteranopia.innerHTML = `
      <feColorMatrix type="matrix" values="
        0.625, 0.375, 0,   0, 0
        0.7,   0.3,   0,   0, 0
        0,     0.3,   0.7, 0, 0
        0,     0,     0,   1, 0
      "/>
    `;
    
    // Tritanopia filter
    const tritanopia = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
    tritanopia.id = 'tritanopia-filter';
    tritanopia.innerHTML = `
      <feColorMatrix type="matrix" values="
        0.95, 0.05,  0,     0, 0
        0,    0.433, 0.567, 0, 0
        0,    0.475, 0.525, 0, 0
        0,    0,     0,     1, 0
      "/>
    `;
    
    svg.appendChild(protanopia);
    svg.appendChild(deuteranopia);
    svg.appendChild(tritanopia);
    document.body.appendChild(svg);
  }

  /**
   * Applies current accessibility settings
   */
  private applySettings(): void {
    if (!this.rootElement) return;
    
    // High contrast
    this.applyHighContrast(this.options.highContrast);
    
    // Large text
    this.applyLargeText(this.options.largeText);
    
    // Color blind mode
    this.applyColorBlindMode(this.options.colorBlindMode);
    
    // Reduced motion
    this.applyReducedMotion(this.options.reducedMotion);
    
    // Screen reader
    this.applyScreenReader(this.options.screenReader);
    
    logger.debug(LogSource.UI, 'Accessibility settings applied');
  }

  /**
   * Applies high contrast mode
   * @param enabled - Whether high contrast is enabled
   */
  private applyHighContrast(enabled: boolean): void {
    if (enabled) {
      if (!this.highContrastStyles) {
        this.highContrastStyles = document.createElement('style');
        this.highContrastStyles.textContent = `
          * {
            background-color: #000000 !important;
            color: #FFFFFF !important;
            border-color: #FFFFFF !important;
          }
          
          img, video {
            filter: contrast(1.5) brightness(1.2) !important;
          }
          
          .button, button {
            background-color: #FFFFFF !important;
            color: #000000 !important;
            border: 2px solid #FFFFFF !important;
          }
          
          .health-bar {
            background-color: #00FF00 !important;
          }
          
          .mana-bar {
            background-color: #00FFFF !important;
          }
        `;
        }
        document.head.appendChild(this.highContrastStyles);
      }
    } else {
      if (this.highContrastStyles) {
        document.head.removeChild(this.highContrastStyles);
        this.highContrastStyles = null;
      }
    }
  }

  /**
   * Applies large text mode
   * @param enabled - Whether large text is enabled
   */
  private applyLargeText(enabled: boolean): void {
    if (enabled) {
      if (!this.largeTextStyles) {
        this.largeTextStyles = document.createElement('style');
        this.largeTextStyles.textContent = `
          * {
            font-size: 1.5em !important;
            line-height: 1.8 !important;
          }
          
          .ui-text {
            font-size: 2em !important;
          }
          
          .dialog-text {
            font-size: 2.5em !important;
          }
        `;
        }
        document.head.appendChild(this.largeTextStyles);
      }
    } else {
      if (this.largeTextStyles) {
        document.head.removeChild(this.largeTextStyles);
        this.largeTextStyles = null;
      }
    }
  }

  /**
   * Applies color blind mode
   * @param mode - Color blind mode
   */
  private applyColorBlindMode(mode: string): void {
    if (this.rootElement) {
      this.rootElement.style.filter = COLOR_BLIND_FILTERS[mode as keyof typeof COLOR_BLIND_FILTERS] || '';
    }
  }

  /**
   * Applies reduced motion
   * @param enabled - Whether reduced motion is enabled
   */
  private applyReducedMotion(enabled: boolean): void {
    if (enabled) {
      if (!this.reducedMotionStyles) {
        this.reducedMotionStyles = document.createElement('style');
        this.reducedMotionStyles.textContent = `
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
          }
        `;
        }
        document.head.appendChild(this.reducedMotionStyles);
      }
    } else {
      if (this.reducedMotionStyles) {
        document.head.removeChild(this.reducedMotionStyles);
        this.reducedMotionStyles = null;
      }
    }
  }

  /**
   * Applies screen reader settings
   * @param enabled - Whether screen reader is enabled
   */
  private applyScreenReader(enabled: boolean): void {
    // Add screen reader ARIA attributes
    const interactiveElements = document.querySelectorAll('button, a, input, select, textarea');
    
    interactiveElements.forEach(element => {
      if (enabled) {
        element.setAttribute('aria-live', 'polite');
        element.setAttribute('role', 'button');
      } else {
        element.removeAttribute('aria-live');
        element.removeAttribute('role');
      }
    });
  }

  /**
   * Gets focusable elements within a container
   * @param container - Container element
   * @returns Array of focusable elements
   */
  private getFocusableElements(container: HTMLElement): HTMLElement[] {
    const focusableSelectors = [
      'button:not([disabled])',
      'a[href]',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])'
    ];
    
    return Array.from(container.querySelectorAll(focusableSelectors.join(', '))) as HTMLElement[];
  }

  /**
   * Sets up keyboard event listeners
   */
  private setupKeyboardEventListeners(): void {
    document.addEventListener('keydown', this.handleKeyboardNavigation);
  }

  /**
   * Removes keyboard event listeners
   */
  private removeKeyboardEventListeners(): void {
    document.removeEventListener('keydown', this.handleKeyboardNavigation);
  }

  /**
   * Handles keyboard navigation
   * @param event - Keyboard event
   */
  private handleKeyboardNavigation = (event: KeyboardEvent): void => {
    if (!this.keyboardNavigation.enabled) return;
    
    const elements = this.keyboardNavigation.focusableElements;
    if (elements.length === 0) return;
    
    switch (event.key) {
      case 'Tab':
        event.preventDefault();
        if (event.shiftKey) {
          this.keyboardNavigation.currentIndex = 
            (this.keyboardNavigation.currentIndex - 1 + elements.length) % elements.length;
        } else {
          this.keyboardNavigation.currentIndex = 
            (this.keyboardNavigation.currentIndex + 1) % elements.length;
        }
        elements[this.keyboardNavigation.currentIndex].focus();
        break;
        
      case 'Enter':
      case ' ':
        event.preventDefault();
        elements[this.keyboardNavigation.currentIndex].click();
        break;
    }
  };

  /**
   * Handles focus trap keyboard events
   * @param event - Keyboard event
   */
  private handleFocusTrapKeydown = (event: KeyboardEvent): void => {
    if (event.key === 'Tab') {
      event.preventDefault();
      
      const elements = this.getFocusableElements(this.focusTrap.element!);
      if (elements.length === 0) return;
      
      const currentIndex = elements.indexOf(document.activeElement as HTMLElement);
      let nextIndex;
      
      if (event.shiftKey) {
        nextIndex = currentIndex <= 0 ? elements.length - 1 : currentIndex - 1;
      } else {
        nextIndex = currentIndex >= elements.length - 1 ? 0 : currentIndex + 1;
      }
      
      elements[nextIndex].focus();
    }
  };

  /**
   * Starts rapid fire for an input
   * @param input - Input identifier
   */
  private startRapidFire(input: string): void {
    if (this.inputAssistance.rapidFireTimers.has(input)) return;
    
    const timer = setInterval(() => {
      // Trigger input action
      this.simulateInput(input);
    }, 100); // 10 times per second
    
    this.inputAssistance.rapidFireTimers.set(input, timer);
  }

  /**
   * Stops rapid fire for an input
   * @param input - Input identifier
   */
  private stopRapidFire(input: string): void {
    const timer = this.inputAssistance.rapidFireTimers.get(input);
    if (timer) {
      clearInterval(timer);
      this.inputAssistance.rapidFireTimers.delete(input);
    }
  }

  /**
   * Simulates input action
   * @param input - Input identifier
   */
  private simulateInput(input: string): void {
    // This would integrate with the actual input system
    logger.debug(LogSource.UI, `Simulated input: ${input}`);
  }

  /**
   * Announces message to screen reader
   * @param message - Message to announce
   */
  private announceToScreenReader(message: string): void {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'assertive');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    // Remove after announcement
    setTimeout(() => {
      if (announcement.parentNode) {
        announcement.parentNode.removeChild(announcement);
      }
    }, 1000);
  }

  /**
   * Saves accessibility settings to localStorage
   */
  private saveSettings(): void {
    try {
      localStorage.setItem('aetherial_vanguard_accessibility', JSON.stringify(this.options));
    } catch (error) {
      logger.warn(LogSource.UI, 'Failed to save accessibility settings');
    }
  }

  /**
   * Loads accessibility settings from localStorage
   */
  private loadSettings(): void {
    try {
      const saved = localStorage.getItem('aetherial_vanguard_accessibility');
      if (saved) {
        this.options = { ...this.options, ...JSON.parse(saved) };
      }
    } catch (error) {
      logger.warn(LogSource.UI, 'Failed to load accessibility settings');
    }
  }
}