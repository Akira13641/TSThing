/**
 * DOM Mocking System
 * @fileoverview Comprehensive DOM and browser API mocking for Node.js test environment
 * @description Provides complete DOM implementation for testing browser-dependent code in Node.js
 */

/**
 * Mock CSS Style Declaration
 */
interface MockCSSStyleDeclaration {
  [property: string]: string;
  cssText: string;
  length: number;
  parentRule: null;
  setProperty(property: string, value: string, priority?: string): void;
  getPropertyValue(property: string): string;
  removeProperty(property: string): string;
  item(index: number): string;
}

/**
 * Mock DOM Element
 */
interface MockHTMLElement {
  tagName: string;
  id: string;
  className: string;
  innerHTML: string;
  textContent: string;
  style: MockCSSStyleDeclaration;
  children: MockHTMLElement[];
  parentNode: MockHTMLElement | null;
  parentElement: MockHTMLElement | null;
  nextSibling: MockHTMLElement | null;
  previousSibling: MockHTMLElement | null;
  attributes: Record<string, string>;
  dataset: Record<string, string>;
  eventListeners: Record<string, Function[]>;
  
  addEventListener(type: string, listener: Function): void;
  removeEventListener(type: string, listener: Function): void;
  dispatchEvent(event: any): boolean;
  setAttribute(name: string, value: string): void;
  getAttribute(name: string): string | null;
  hasAttribute(name: string): boolean;
  removeAttribute(name: string): void;
  appendChild(child: MockHTMLElement): void;
  removeChild(child: MockHTMLElement): void;
  insertBefore(newChild: MockHTMLElement, referenceChild: MockHTMLElement | null): void;
  querySelector(selector: string): MockHTMLElement | null;
  querySelectorAll(selector: string): MockHTMLElement[];
  getElementsByTagName(tagName: string): MockHTMLElement[];
  getElementsByClassName(className: string): MockHTMLElement[];
  focus(): void;
  blur(): void;
  click(): void;
  cloneNode(deep?: boolean): MockHTMLElement;
  hasChildNodes(): boolean;
  contains(other: MockHTMLElement): boolean;
}

/**
 * Mock Document
 */
interface MockDocument {
  documentElement: MockHTMLElement;
  head: MockHTMLElement;
  body: MockHTMLElement;
  activeElement: MockHTMLElement | null;
  readyState: string;
  location: Location;
  hidden: boolean; // Add hidden property for visibility API
  
  createElement(tagName: string): MockHTMLElement;
  createElementNS(namespace: string, tagName: string): MockHTMLElement;
  createTextNode(text: string): MockHTMLElement;
  createComment(text: string): MockHTMLElement;
  getElementById(id: string): MockHTMLElement | null;
  getElementsByTagName(tagName: string): MockHTMLElement[];
  getElementsByClassName(className: string): MockHTMLElement[];
  querySelector(selector: string): MockHTMLElement | null;
  querySelectorAll(selector: string): MockHTMLElement[];
  addEventListener(type: string, listener: Function): void;
  removeEventListener(type: string, listener: Function): void;
  dispatchEvent(event: any): boolean;
}

/**
 * Mock Window
 */
interface MockWindow {
  document: MockDocument;
  innerWidth: number;
  innerHeight: number;
  pageXOffset: number;
  pageYOffset: number;
  scrollX: number;
  scrollY: number;
  location: Location;
  history: History;
  navigator: Navigator;
  
  addEventListener(type: string, listener: Function): void;
  removeEventListener(type: string, listener: Function): void;
  dispatchEvent(event: any): boolean;
  requestAnimationFrame(callback: FrameRequestCallback): number;
  cancelAnimationFrame(id: number): void;
  getComputedStyle(element: MockHTMLElement): MockCSSStyleDeclaration;
  matchMedia(query: string): MediaQueryList;
  scrollTo(x: number, y: number): void;
  scrollBy(x: number, y: number): void;
  
  // Storage APIs
  localStorage: Storage;
  sessionStorage: Storage;
  
  // Speech Synthesis
  speechSynthesis: SpeechSynthesis;
  
  // Timer APIs
  setTimeout(callback: Function, delay: number, ...args: any[]): number;
  clearTimeout(id: number): void;
  setInterval(callback: Function, delay: number, ...args: any[]): number;
  clearInterval(id: number): void;
}

/**
 * Mock Speech Synthesis
 */
interface MockSpeechSynthesis {
  speaking: boolean;
  pending: boolean;
  paused: boolean;
  
  speak(utterance: SpeechSynthesisUtterance): void;
  cancel(): void;
  pause(): void;
  resume(): void;
  getVoices(): SpeechSynthesisVoice[];
}

/**
 * Mock Speech Synthesis Utterance
 */
class MockSpeechSynthesisUtterance {
  text: string;
  lang: string;
  voiceURI: string;
  volume: number;
  rate: number;
  pitch: number;
  onstart: ((event: any) => void) | null;
  onend: ((event: any) => void) | null;
  onerror: ((event: any) => void) | null;
  onpause: ((event: any) => void) | null;
  onmark: ((event: any) => void) | null;
  onboundary: ((event: any) => void) | null;

  constructor(text: string) {
    this.text = text;
    this.lang = '';
    this.voiceURI = '';
    this.volume = 1;
    this.rate = 1;
    this.pitch = 1;
    this.onstart = null;
    this.onend = null;
    this.onerror = null;
    this.onpause = null;
    this.onmark = null;
    this.onboundary = null;
  }
}

/**
 * Mock Storage
 */
class MockStorage implements Storage {
  private data: Map<string, string> = new Map();

  get length(): number {
    return this.data.size;
  }

  key(index: number): string | null {
    const keys = Array.from(this.data.keys());
    return keys[index] || null;
  }

  getItem(key: string): string | null {
    return this.data.get(key) || null;
  }

  setItem(key: string, value: string): void {
    this.data.set(key, value);
  }

  removeItem(key: string): void {
    this.data.delete(key);
  }

  clear(): void {
    this.data.clear();
  }
}

/**
 * Mock CSS Style Declaration Implementation
 */
class MockCSSStyleDeclarationImpl implements MockCSSStyleDeclaration {
  private styles: Map<string, string> = new Map();
  public cssText: string = '';
  public parentRule: null = null;

  get length(): number {
    return this.styles.size;
  }

  setProperty(property: string, value: string, priority?: string): void {
    this.styles.set(property, value);
    this.updateCSSText();
  }

  getPropertyValue(property: string): string {
    return this.styles.get(property) || '';
  }

  removeProperty(property: string): string {
    const value = this.styles.get(property) || '';
    this.styles.delete(property);
    this.updateCSSText();
    return value;
  }

  item(index: number): string {
    const keys = Array.from(this.styles.keys());
    return keys[index] || '';
  }

  private updateCSSText(): void {
    this.cssText = Array.from(this.styles.entries())
      .map(([prop, value]) => `${prop}: ${value}`)
      .join('; ');
  }

  // Allow direct property access
  [property: string]: string | ((...args: any[]) => any);
}

/**
 * Mock DOM Element Implementation
 */
class MockHTMLElementImpl implements MockHTMLElement {
  public tagName: string;
  public id: string = '';
  public className: string = '';
  public innerHTML: string = '';
  public textContent: string = '';
  public style: MockCSSStyleDeclaration;
  public children: MockHTMLElement[] = [];
  public parentNode: MockHTMLElement | null = null;
  public parentElement: MockHTMLElement | null = null;
  public nextSibling: MockHTMLElement | null = null;
  public previousSibling: MockHTMLElement | null = null;
  public attributes: Record<string, string> = {};
  public dataset: Record<string, string> = {};
  public eventListeners: Record<string, Function[]> = {};

  constructor(tagName: string) {
    this.tagName = tagName.toUpperCase();
    this.style = new MockCSSStyleDeclarationImpl();
  }

  addEventListener(type: string, listener: Function): void {
    if (!this.eventListeners[type]) {
      this.eventListeners[type] = [];
    }
    this.eventListeners[type].push(listener);
  }

  removeEventListener(type: string, listener: Function): void {
    if (this.eventListeners[type]) {
      const index = this.eventListeners[type].indexOf(listener);
      if (index > -1) {
        this.eventListeners[type].splice(index, 1);
      }
    }
  }

  dispatchEvent(event: any): boolean {
    const type = event.type || event;
    if (this.eventListeners[type]) {
      this.eventListeners[type].forEach(listener => {
        try {
          listener(event);
        } catch (error) {
          console.error('Event listener error:', error);
        }
      });
    }
    return true;
  }

  setAttribute(name: string, value: string): void {
    this.attributes[name] = value;
    
    // Handle data attributes
    if (name.startsWith('data-')) {
      const dataKey = name.substring(5).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
      this.dataset[dataKey] = value;
    }
  }

  getAttribute(name: string): string | null {
    return this.attributes[name] || null;
  }

  hasAttribute(name: string): boolean {
    return name in this.attributes;
  }

  removeAttribute(name: string): void {
    delete this.attributes[name];
    
    // Handle data attributes
    if (name.startsWith('data-')) {
      const dataKey = name.substring(5).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
      delete this.dataset[dataKey];
    }
  }

  appendChild(child: MockHTMLElement): void {
    if (child.parentNode) {
      child.parentNode.removeChild(child);
    }
    
    this.children.push(child);
    child.parentNode = this;
    child.parentElement = this;
  }

  removeChild(child: MockHTMLElement): void {
    const index = this.children.indexOf(child);
    if (index > -1) {
      this.children.splice(index, 1);
      child.parentNode = null;
      child.parentElement = null;
    }
  }

  insertBefore(newChild: MockHTMLElement, referenceChild: MockHTMLElement | null): void {
    if (newChild.parentNode) {
      newChild.parentNode.removeChild(newChild);
    }

    if (referenceChild) {
      const index = this.children.indexOf(referenceChild);
      if (index > -1) {
        this.children.splice(index, 0, newChild);
      } else {
        this.children.push(newChild);
      }
    } else {
      this.children.push(newChild);
    }

    newChild.parentNode = this;
    newChild.parentElement = this;
  }

  querySelectorAll(selector: string): MockHTMLElement[] {
    // Simple ID selector support
    if (selector.startsWith('#')) {
      const id = selector.substring(1);
      const element = this.findById(id);
      return element ? [element] : [];
    }
    
    // Simple class selector support
    if (selector.startsWith('.')) {
      const className = selector.substring(1);
      return this.findAllByClassName(className);
    }
    
    // Simple tag selector support
    return this.findAllByTagName(selector);
  }

  querySelector(selector: string): MockHTMLElement | null {
    // Simple ID selector support
    if (selector.startsWith('#')) {
      const id = selector.substring(1);
      return this.findById(id);
    }
    
    // Simple class selector support
    if (selector.startsWith('.')) {
      const className = selector.substring(1);
      return this.findByClassName(className);
    }
    
    // Simple tag selector support
    return this.findByTagName(selector);
  }

  getElementsByTagName(tagName: string): MockHTMLElement[] {
    return this.findAllByTagName(tagName);
  }

  getElementsByClassName(className: string): MockHTMLElement[] {
    return this.findAllByClassName(className);
  }

  focus(): void {
    // Mock focus implementation
    if (this.ownerDocument) {
      (this.ownerDocument as any).activeElement = this;
    }
  }

  blur(): void {
    // Mock blur implementation
    if (this.ownerDocument && (this.ownerDocument as any).activeElement === this) {
      (this.ownerDocument as any).activeElement = null;
    }
  }

  click(): void {
    this.dispatchEvent({ type: 'click' });
  }

  cloneNode(deep: boolean = false): MockHTMLElement {
    const clone = new MockHTMLElementImpl(this.tagName);
    clone.id = this.id;
    clone.className = this.className;
    clone.innerHTML = this.innerHTML;
    clone.textContent = this.textContent;
    clone.attributes = { ...this.attributes };
    clone.dataset = { ...this.dataset };
    
    if (deep) {
      this.children.forEach(child => {
        const childClone = child.cloneNode(deep);
        clone.appendChild(childClone);
      });
    }
    
    return clone;
  }

  hasChildNodes(): boolean {
    return this.children.length > 0;
  }

  contains(other: MockHTMLElement): boolean {
    if (this === other) return true;
    
    for (const child of this.children) {
      if (child.contains(other)) {
        return true;
      }
    }
    
    return false;
  }

  private findById(id: string): MockHTMLElement | null {
    if (this.id === id) return this;
    
    for (const child of this.children) {
      const found = child.findById(id);
      if (found) return found;
    }
    
    return null;
  }

  private findByClassName(className: string): MockHTMLElement | null {
    if (this.className.includes(className)) return this;
    
    for (const child of this.children) {
      const found = child.findByClassName(className);
      if (found) return found;
    }
    
    return null;
  }

  private findByTagName(tagName: string): MockHTMLElement | null {
    if (this.tagName === tagName.toUpperCase()) return this;
    
    for (const child of this.children) {
      const found = child.findByTagName(tagName);
      if (found) return found;
    }
    
    return null;
  }

  private findAllByClassName(className: string): MockHTMLElement[] {
    const results: MockHTMLElement[] = [];
    
    if (this.className.includes(className)) {
      results.push(this);
    }
    
    for (const child of this.children) {
      results.push(...child.findAllByClassName(className));
    }
    
    return results;
  }

  private findAllByTagName(tagName: string): MockHTMLElement[] {
    const results: MockHTMLElement[] = [];
    
    if (this.tagName === tagName.toUpperCase()) {
      results.push(this);
    }
    
    for (const child of this.children) {
      results.push(...child.findAllByTagName(tagName));
    }
    
    return results;
  }

  private ownerDocument: MockDocument | null = null;
}

/**
 * Mock Document Implementation
 */
class MockDocumentImpl implements MockDocument {
  public documentElement: MockHTMLElement;
  public head: MockHTMLElement;
  public body: MockHTMLElement;
  public activeElement: MockHTMLElement | null = null;
  public readyState: string = 'complete';
  public location: Location;
  public eventListeners: Record<string, Function[]> = {};
  public hidden: boolean = false; // Add hidden property for visibility API

  constructor() {
    this.documentElement = new MockHTMLElementImpl('HTML');
    this.head = new MockHTMLElementImpl('HEAD');
    this.body = new MockHTMLElementImpl('BODY');
    
    // Set up basic document structure
    this.documentElement.appendChild(this.head);
    this.documentElement.appendChild(this.body);
    
    // Set owner document for all elements
    (this.documentElement as any).ownerDocument = this;
    (this.head as any).ownerDocument = this;
    (this.body as any).ownerDocument = this;
    
    // Mock location
    this.location = {
      href: 'http://localhost:3000',
      origin: 'http://localhost:3000',
      protocol: 'http:',
      host: 'localhost:3000',
      hostname: 'localhost',
      port: '3000',
      pathname: '/',
      search: '',
      hash: '',
      assign: () => {},
      replace: () => {},
      reload: () => {}
    } as Location;
  }

  createElement(tagName: string): MockHTMLElement {
    const element = new MockHTMLElementImpl(tagName);
    (element as any).ownerDocument = this;
    return element;
  }

  createElementNS(namespace: string, tagName: string): MockHTMLElement {
    const element = new MockHTMLElementImpl(tagName);
    (element as any).namespace = namespace;
    (element as any).ownerDocument = this;
    return element;
  }

  createTextNode(text: string): MockHTMLElement {
    const element = new MockHTMLElementImpl('#text');
    element.textContent = text;
    (element as any).ownerDocument = this;
    return element;
  }

  createComment(text: string): MockHTMLElement {
    const element = new MockHTMLElementImpl('#comment');
    element.textContent = text;
    (element as any).ownerDocument = this;
    return element;
  }

  getElementById(id: string): MockHTMLElement | null {
    return this.documentElement.findById(id);
  }

  getElementsByTagName(tagName: string): MockHTMLElement[] {
    return this.documentElement.findAllByTagName(tagName);
  }

  getElementsByClassName(className: string): MockHTMLElement[] {
    return this.documentElement.findAllByClassName(className);
  }

  querySelector(selector: string): MockHTMLElement | null {
    return this.documentElement.querySelector(selector);
  }

  querySelectorAll(selector: string): MockHTMLElement[] {
    return this.documentElement.querySelectorAll(selector);
  }

  addEventListener(type: string, listener: Function): void {
    if (!this.eventListeners[type]) {
      this.eventListeners[type] = [];
    }
    this.eventListeners[type].push(listener);
  }

  removeEventListener(type: string, listener: Function): void {
    if (this.eventListeners[type]) {
      const index = this.eventListeners[type].indexOf(listener);
      if (index > -1) {
        this.eventListeners[type].splice(index, 1);
      }
    }
  }

  dispatchEvent(event: any): boolean {
    const type = event.type || event;
    if (this.eventListeners[type]) {
      this.eventListeners[type].forEach(listener => {
        try {
          listener(event);
        } catch (error) {
          console.error('Event listener error:', error);
        }
      });
    }
    return true;
  }
}

/**
 * Mock Speech Synthesis Implementation
 */
class MockSpeechSynthesisImpl implements MockSpeechSynthesis {
  public speaking: boolean = false;
  public pending: boolean = false;
  public paused: boolean = false;
  private utterances: SpeechSynthesisUtterance[] = [];

  speak(utterance: SpeechSynthesisUtterance): void {
    this.utterances.push(utterance);
    this.speaking = true;
    
    // Simulate speech completion
    setTimeout(() => {
      this.speaking = false;
      if (utterance.onend) {
        utterance.onend({ type: 'end' });
      }
    }, 100);
  }

  cancel(): void {
    this.utterances.length = 0;
    this.speaking = false;
    this.paused = false;
  }

  pause(): void {
    this.paused = true;
  }

  resume(): void {
    this.paused = false;
  }

  getVoices(): SpeechSynthesisVoice[] {
    return [];
  }
}

/**
 * Mock Window Implementation
 */
class MockWindowImpl implements MockWindow {
  public document: MockDocument;
  public innerWidth: number = 1024;
  public innerHeight: number = 768;
  public pageXOffset: number = 0;
  public pageYOffset: number = 0;
  public scrollX: number = 0;
  public scrollY: number = 0;
  public location: Location;
  public history: History;
  public navigator: Navigator;
  public localStorage: Storage;
  public sessionStorage: Storage;
  public speechSynthesis: SpeechSynthesis;
  public eventListeners: Record<string, Function[]> = {};
  private animationFrameId: number = 0;
  private animationFrameCallbacks: Map<number, FrameRequestCallback> = new Map();

  constructor() {
    this.document = new MockDocumentImpl();
    this.location = this.document.location;
    this.localStorage = new MockStorage();
    this.sessionStorage = new MockStorage();
    this.speechSynthesis = new MockSpeechSynthesisImpl();
    
    // Mock history
    this.history = {
      length: 1,
      state: null,
      back: () => {},
      forward: () => {},
      go: () => {},
      pushState: () => {},
      replaceState: () => {}
    } as History;
    
    // Mock navigator
    this.navigator = {
      userAgent: 'Mock User Agent',
      language: 'en-US',
      languages: ['en-US', 'en'],
      platform: 'Mock Platform',
      cookieEnabled: true,
      onLine: true
    } as Navigator;
  }

  addEventListener(type: string, listener: Function): void {
    if (!this.eventListeners[type]) {
      this.eventListeners[type] = [];
    }
    this.eventListeners[type].push(listener);
  }

  removeEventListener(type: string, listener: Function): void {
    if (this.eventListeners[type]) {
      const index = this.eventListeners[type].indexOf(listener);
      if (index > -1) {
        this.eventListeners[type].splice(index, 1);
      }
    }
  }

  dispatchEvent(event: any): boolean {
    const type = event.type || event;
    if (this.eventListeners[type]) {
      this.eventListeners[type].forEach(listener => {
        try {
          listener(event);
        } catch (error) {
          console.error('Event listener error:', error);
        }
      });
    }
    return true;
  }

  requestAnimationFrame(callback: FrameRequestCallback): number {
    const id = ++this.animationFrameId;
    this.animationFrameCallbacks.set(id, callback);
    
    // Simulate animation frame
    setTimeout(() => {
      if (this.animationFrameCallbacks.has(id)) {
        callback(Date.now()); // Use Date.now() instead of performance.now()
        this.animationFrameCallbacks.delete(id);
      }
    }, 16);
    
    return id;
  }

  cancelAnimationFrame(id: number): void {
    this.animationFrameCallbacks.delete(id);
  }

  getComputedStyle(element: MockHTMLElement): MockCSSStyleDeclaration {
    return element.style;
  }

  matchMedia(query: string): MediaQueryList {
    return {
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false
    };
  }

  scrollTo(x: number, y: number): void {
    this.pageXOffset = x;
    this.pageYOffset = y;
    this.scrollX = x;
    this.scrollY = y;
  }

  scrollBy(x: number, y: number): void {
    this.scrollTo(this.pageXOffset + x, this.pageYOffset + y);
  }

  setTimeout(callback: Function, delay: number, ...args: any[]): number {
    return setTimeout(callback, delay, ...args);
  }

  clearTimeout(id: number): void {
    clearTimeout(id);
  }

  setInterval(callback: Function, delay: number, ...args: any[]): number {
    return setInterval(callback, delay, ...args);
  }

  clearInterval(id: number): void {
    clearInterval(id);
  }
}

/**
 * Global DOM Mock Setup
 * Sets up comprehensive DOM and browser API mocks for the test environment
 */
export function setupDOMMock(): void {
  // Create global window instance
  const mockWindow = new MockWindowImpl();
  
  // Set up global objects
  (globalThis as any).window = mockWindow;
  (globalThis as any).document = mockWindow.document;
  (globalThis as any).navigator = mockWindow.navigator;
  (globalThis as any).location = mockWindow.location;
  (globalThis as any).history = mockWindow.history;
  (globalThis as any).localStorage = mockWindow.localStorage;
  (globalThis as any).sessionStorage = mockWindow.sessionStorage;
  (globalThis as any).speechSynthesis = mockWindow.speechSynthesis;
  
  // Also set up global document directly for compatibility
  (global as any).document = mockWindow.document;
  (global as any).window = mockWindow;
  (global as any).navigator = mockWindow.navigator;
  (global as any).location = mockWindow.location;
  (global as any).localStorage = mockWindow.localStorage;
  (global as any).sessionStorage = mockWindow.sessionStorage;
  (global as any).speechSynthesis = mockWindow.speechSynthesis;
  
  // Set up global constructors
  (globalThis as any).HTMLElement = MockHTMLElementImpl;
  (globalThis as any).HTMLStyleElement = MockHTMLElementImpl;
  (globalThis as any).HTMLDivElement = MockHTMLElementImpl;
  (globalThis as any).HTMLSpanElement = MockHTMLElementImpl;
  (globalThis as any).HTMLBodyElement = MockHTMLElementImpl;
  (globalThis as any).HTMLHeadElement = MockHTMLElementImpl;
  (globalThis as any).HTMLScriptElement = MockHTMLElementImpl;
  (globalThis as any).HTMLLinkElement = MockHTMLElementImpl;
  (globalThis as any).HTMLMetaElement = MockHTMLElementImpl;
  (globalThis as any).HTMLTitleElement = MockHTMLElementImpl;
  (globalThis as any).SpeechSynthesisUtterance = MockSpeechSynthesisUtterance;
  
  // Set up performance API first (needed by requestAnimationFrame)
  (globalThis as any).performance = {
    now: () => Date.now(),
    timing: {
      navigationStart: Date.now()
    },
    mark: () => {},
    measure: () => {},
    getEntriesByName: () => [],
    getEntriesByType: () => []
  };
  
  // Set up global functions
  (globalThis as any).requestAnimationFrame = (callback: FrameRequestCallback) => 
    mockWindow.requestAnimationFrame(callback);
  (globalThis as any).cancelAnimationFrame = (id: number) => 
    mockWindow.cancelAnimationFrame(id);
  
  // Also set up on global for compatibility
  (global as any).requestAnimationFrame = (callback: FrameRequestCallback) => 
    mockWindow.requestAnimationFrame(callback);
  (global as any).cancelAnimationFrame = (id: number) => 
    mockWindow.cancelAnimationFrame(id);
  
  // Set up console if not available
  if (!console.warn) {
    console.warn = console.log;
  }
  if (!console.error) {
    console.error = console.log;
  }
  if (!console.debug) {
    console.debug = console.log;
  }
}

/**
 * Clean up DOM Mock
 * Removes all DOM mocks from the global scope
 */
export function cleanupDOMMock(): void {
  const properties = [
    'window', 'document', 'navigator', 'location', 'history',
    'localStorage', 'sessionStorage', 'speechSynthesis',
    'HTMLElement', 'HTMLStyleElement', 'HTMLDivElement',
    'HTMLSpanElement', 'HTMLBodyElement', 'HTMLHeadElement',
    'HTMLScriptElement', 'HTMLLinkElement', 'HTMLMetaElement',
    'HTMLTitleElement', 'SpeechSynthesisUtterance',
    'requestAnimationFrame', 'cancelAnimationFrame', 'performance'
  ];
  
  properties.forEach(prop => {
    delete (globalThis as any)[prop];
  });
}

/**
 * Get Mock Window Instance
 * Returns the current mock window instance
 */
export function getMockWindow(): MockWindow {
  return (globalThis as any).window;
}

/**
 * Get Mock Document Instance
 * Returns the current mock document instance
 */
export function getMockDocument(): MockDocument {
  return (globalThis as any).document;
}

// Export mock classes for testing purposes
export {
  MockHTMLElementImpl,
  MockDocumentImpl,
  MockWindowImpl,
  MockSpeechSynthesisImpl,
  MockSpeechSynthesisUtterance,
  MockStorage,
  MockCSSStyleDeclarationImpl
};