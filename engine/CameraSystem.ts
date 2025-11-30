/**
 * Camera System
 * @fileoverview Camera following system with screen boundaries and smooth transitions
 */

import { WorldManager } from './WorldManager';
import { logger, LogSource } from './GlobalLogger';
import { EntityId, Position, Camera, Rectangle } from '../types';

/**
 * Camera follow modes
 */
export enum CameraFollowMode {
  /** Instant follow (no smoothing) */
  INSTANT = 'INSTANT',
  /** Smooth follow with lerp */
  SMOOTH = 'SMOOTH',
  /** Follow with lookahead for movement direction */
  LOOKAHEAD = 'LOOKAHEAD',
  /** Elastic follow with spring physics */
  ELASTIC = 'ELASTIC'
}

/**
 * Camera boundary constraints
 */
export interface CameraBounds {
  /** Minimum X position */
  minX: number;
  /** Maximum X position */
  maxX: number;
  /** Minimum Y position */
  minY: number;
  /** Maximum Y position */
  maxY: number;
  /** Whether boundaries are enabled */
  enabled: boolean;
}

/**
 * Camera shake parameters
 */
export interface CameraShake {
  /** Current shake intensity */
  intensity: number;
  /** Shake duration in seconds */
  duration: number;
  /** Current shake timer */
  timer: number;
  /** Shake frequency */
  frequency: number;
  /** Random offset */
  offset: { x: number; y: number };
}

/**
 * Camera transition for cinematic effects
 */
export interface CameraTransition {
  /** Target position */
  targetPosition: { x: number; y: number };
  /** Target zoom */
  targetZoom: number;
  /** Transition duration in seconds */
  duration: number;
  /** Current timer */
  timer: number;
  /** Start position */
  startPosition: { x: number; y: number };
  /** Start zoom */
  startZoom: number;
  /** Callback when transition completes */
  onComplete?: () => void;
}

/**
 * Camera System
 * Manages camera following, boundaries, and visual effects
 */
export class CameraSystem {
  /** World manager reference */
  private world: WorldManager | null = null;
  
  /** Camera entity ID */
  private cameraEntityId: EntityId | null = null;
  
  /** Current camera component */
  private camera: Camera | null = null;
  
  /** Follow mode */
  private followMode: CameraFollowMode = CameraFollowMode.SMOOTH;
  
  /** Follow speed for smooth transitions */
  private followSpeed: number = 5.0;
  
  /** Lookahead distance */
  private lookaheadDistance: number = 100;
  
  /** Camera boundaries */
  private bounds: CameraBounds = {
    minX: 0,
    maxX: 10000,
    minY: 0,
    maxY: 10000,
    enabled: true
  };
  
  /** Viewport dimensions */
  private viewport: { width: number; height: number } = { width: 1024, height: 768 };
  
  /** Current shake effect */
  private shake: CameraShake | null = null;
  
  /** Current transition */
  private transition: CameraTransition | null = null;
  
  /** Dead zone size (camera won't move if target is within this zone) */
  private deadZone: { width: number; height: number } = { width: 200, height: 150 };
  
  /** Previous target position for velocity calculation */
  private previousTargetPosition: { x: number; y: number } = { x: 0, y: 0 };
  
  /** Target velocity for lookahead */
  private targetVelocity: { x: number; y: number } = { x: 0, y: 0 };

  /**
   * Creates a new CameraSystem instance
   */
  constructor() {
    logger.info(LogSource.CAMERA, 'CameraSystem initialized');
  }

  /**
   * Sets the world manager reference
   * @param world - World manager instance
   */
  public setWorld(world: WorldManager): void {
    this.world = world;
    this.initializeCamera();
  }

  /**
   * Sets the viewport dimensions
   * @param width - Viewport width in pixels
   * @param height - Viewport height in pixels
   */
  public setViewport(width: number, height: number): void {
    this.viewport = { width, height };
    logger.debug(LogSource.CAMERA, `Viewport set to ${width}x${height}`);
  }

  /**
   * Sets the camera follow mode
   * @param mode - Follow mode to use
   * @param speed - Follow speed (for smooth modes)
   */
  public setFollowMode(mode: CameraFollowMode, speed: number = 5.0): void {
    this.followMode = mode;
    this.followSpeed = speed;
    logger.debug(LogSource.CAMERA, `Follow mode set to ${mode} with speed ${speed}`);
  }

  /**
   * Sets the camera target entity
   * @param entityId - Entity ID to follow (null for static camera)
   */
  public setTarget(entityId: EntityId | null): void {
    if (!this.camera) return;
    
    this.camera.targetEntityId = entityId;
    if (entityId !== null) {
      logger.debug(LogSource.CAMERA, `Camera now following entity ${entityId}`);
    } else {
      logger.debug(LogSource.CAMERA, 'Camera set to static mode');
    }
  }

  /**
   * Sets camera boundaries
   * @param bounds - Boundary constraints
   */
  public setBounds(bounds: Partial<CameraBounds>): void {
    this.bounds = { ...this.bounds, ...bounds };
    logger.debug(LogSource.CAMERA, `Camera bounds updated: enabled=${this.bounds.enabled}, min=(${this.bounds.minX},${this.bounds.minY}), max=(${this.bounds.maxX},${this.bounds.maxY})`);
  }

  /**
   * Sets the dead zone size
   * @param width - Dead zone width
   * @param height - Dead zone height
   */
  public setDeadZone(width: number, height: number): void {
    this.deadZone = { width, height };
    logger.debug(LogSource.CAMERA, `Dead zone set to ${width}x${height}`);
  }

  /**
   * Sets camera position directly
   * @param x - X position
   * @param y - Y position
   */
  public setPosition(x: number, y: number): void {
    if (!this.camera) return;
    
    this.camera.x = x;
    this.camera.y = y;
    this.applyBounds();
  }

  /**
   * Sets camera zoom
   * @param zoom - Zoom level (1.0 = native)
   */
  public setZoom(zoom: number): void {
    if (!this.camera) return;
    
    this.camera.zoom = Math.max(0.1, Math.min(5.0, zoom));
    logger.debug(LogSource.CAMERA, `Camera zoom set to ${this.camera.zoom}`);
  }

  /**
   * Gets current camera position
   * @returns Camera position
   */
  public getPosition(): { x: number; y: number } {
    if (!this.camera) return { x: 0, y: 0 };
    
    return { x: this.camera.x, y: this.camera.y };
  }

  /**
   * Gets current camera zoom
   * @returns Camera zoom level
   */
  public getZoom(): number {
    return this.camera?.zoom || 1.0;
  }

  /**
   * Gets camera bounds as rectangle
   * @returns Camera bounds rectangle
   */
  public getBounds(): Rectangle {
    if (!this.camera) return { x: 0, y: 0, width: 0, height: 0 };
    
    const halfWidth = (this.viewport.width / this.camera.zoom) / 2;
    const halfHeight = (this.viewport.height / this.camera.zoom) / 2;
    
    return {
      x: this.camera.x - halfWidth,
      y: this.camera.y - halfHeight,
      width: this.viewport.width / this.camera.zoom,
      height: this.viewport.height / this.camera.zoom
    };
  }

  /**
   * Converts world coordinates to screen coordinates
   * @param worldX - World X coordinate
   * @param worldY - World Y coordinate
   * @returns Screen coordinates
   */
  public worldToScreen(worldX: number, worldY: number): { x: number; y: number } {
    if (!this.camera) return { x: 0, y: 0 };
    
    const screenX = (worldX - this.camera.x) * this.camera.zoom + this.viewport.width / 2;
    const screenY = (worldY - this.camera.y) * this.camera.zoom + this.viewport.height / 2;
    
    return { x: screenX, y: screenY };
  }

  /**
   * Converts screen coordinates to world coordinates
   * @param screenX - Screen X coordinate
   * @param screenY - Screen Y coordinate
   * @returns World coordinates
   */
  public screenToWorld(screenX: number, screenY: number): { x: number; y: number } {
    if (!this.camera) return { x: 0, y: 0 };
    
    const worldX = (screenX - this.viewport.width / 2) / this.camera.zoom + this.camera.x;
    const worldY = (screenY - this.viewport.height / 2) / this.camera.zoom + this.camera.y;
    
    return { x: worldX, y: worldY };
  }

  /**
   * Checks if a world point is visible on screen
   * @param worldX - World X coordinate
   * @param worldY - World Y coordinate
   * @param margin - Optional margin in pixels
   * @returns Whether point is visible
   */
  public isVisible(worldX: number, worldY: number, margin: number = 0): boolean {
    const screen = this.worldToScreen(worldX, worldY);
    if (!screen || !this.viewport || !this.camera) return false;
    
    const viewport = this.viewport;
    const camera = this.camera;
    const extendedMargin = margin / camera.zoom;
    
    return screen.x >= -extendedMargin && 
           screen.x <= viewport.width + extendedMargin &&
           screen.y >= -extendedMargin && 
           screen.y <= viewport.height + extendedMargin;
  }

  /**
   * Starts camera shake effect
   * @param intensity - Shake intensity
   * @param duration - Shake duration in seconds
   * @param frequency - Shake frequency (shakes per second)
   */
  public startShake(intensity: number, duration: number, frequency: number = 10): void {
    this.shake = {
      intensity,
      duration,
      timer: duration,
      frequency,
      offset: { x: 0, y: 0 }
    };
    
    logger.debug(LogSource.CAMERA, `Camera shake started: intensity=${intensity}, duration=${duration}s`);
  }

  /**
   * Starts camera transition
   * @param targetX - Target X position
   * @param targetY - Target Y position
   * @param targetZoom - Target zoom level
   * @param duration - Transition duration in seconds
   * @param onComplete - Optional callback when transition completes
   */
  public startTransition(
    targetX: number, 
    targetY: number, 
    targetZoom: number = 1.0,
    duration: number = 1.0,
    onComplete?: () => void
  ): void {
    if (!this.camera) return;
    
    this.transition = {
      targetPosition: { x: targetX, y: targetY },
      targetZoom,
      duration,
      timer: duration,
      startPosition: { x: this.camera.x, y: this.camera.y },
      startZoom: this.camera.zoom,
      onComplete
    };
    
    logger.debug(LogSource.CAMERA, `Camera transition started: to(${targetX},${targetY}), zoom=${targetZoom}, duration=${duration}s`);
  }

  /**
   * Updates camera system
   * @param deltaTime - Time since last frame in seconds
   */
  public update(deltaTime: number): void {
    if (!this.camera || !this.world) return;

    // Handle transition first
    if (this.transition) {
      this.updateTransition(deltaTime);
      return;
    }

    // Update target following
    if (this.camera.targetEntityId !== null) {
      this.updateFollowing(deltaTime);
    }

    // Update shake effect
    this.updateShake(deltaTime);

    // Apply boundaries
    this.applyBounds();
  }

  /**
   * Initializes camera entity and component
   */
  private initializeCamera(): void {
    if (!this.world) return;

    // Create camera entity
    this.cameraEntityId = this.world.createEntity(['Camera']);
    
    // Add camera component
    this.camera = {
      x: this.viewport.width / 2,
      y: this.viewport.height / 2,
      zoom: 1.0,
      targetEntityId: null
    };
    
    this.world.addComponent(this.cameraEntityId, 'Camera', this.camera);
    
    logger.info(LogSource.CAMERA, 'Camera entity initialized');
  }

  /**
   * Updates camera following behavior
   * @param deltaTime - Time since last frame in seconds
   */
  private updateFollowing(deltaTime: number): void {
    if (!this.camera || !this.world || this.camera.targetEntityId === null) return;

    const targetPosition = this.world.getComponent<Position>(this.camera.targetEntityId, 'Position');
    if (!targetPosition) return;

    // Calculate target velocity for lookahead
    this.targetVelocity.x = targetPosition.x - this.previousTargetPosition.x;
    this.targetVelocity.y = targetPosition.y - this.previousTargetPosition.y;
    this.previousTargetPosition = { x: targetPosition.x, y: targetPosition.y };

    let targetX = targetPosition.x;
    let targetY = targetPosition.y;

    // Apply dead zone
    const dx = targetPosition.x - this.camera.x;
    const dy = targetPosition.y - this.camera.y;
    
    if (Math.abs(dx) <= this.deadZone.width / 2 && Math.abs(dy) <= this.deadZone.height / 2) {
      // Target is within dead zone, don't move camera
      return;
    }

    // Apply follow mode
    switch (this.followMode) {
      case CameraFollowMode.INSTANT:
        this.camera.x = targetX;
        this.camera.y = targetY;
        break;

      case CameraFollowMode.SMOOTH:
        const lerpFactor = 1 - Math.exp(-this.followSpeed * deltaTime);
        this.camera.x += (targetX - this.camera.x) * lerpFactor;
        this.camera.y += (targetY - this.camera.y) * lerpFactor;
        break;

      case CameraFollowMode.LOOKAHEAD:
        // Add lookahead based on velocity
        const lookaheadX = this.targetVelocity.x * this.lookaheadDistance / 100;
        const lookaheadY = this.targetVelocity.y * this.lookaheadDistance / 100;
        
        const smoothFactor = 1 - Math.exp(-this.followSpeed * deltaTime);
        this.camera.x += (targetX + lookaheadX - this.camera.x) * smoothFactor;
        this.camera.y += (targetY + lookaheadY - this.camera.y) * smoothFactor;
        break;

      case CameraFollowMode.ELASTIC:
        // Spring physics
        const springConstant = this.followSpeed * 2;
        
        const springForceX = (targetX - this.camera.x) * springConstant;
        const springForceY = (targetY - this.camera.y) * springConstant;
        
        this.camera.x += springForceX * deltaTime;
        this.camera.y += springForceY * deltaTime;
        break;
    }
  }

  /**
   * Updates camera shake effect
   * @param deltaTime - Time since last frame in seconds
   */
  private updateShake(deltaTime: number): void {
    if (!this.shake) return;

    this.shake.timer -= deltaTime;
    
    if (this.shake.timer <= 0) {
      this.shake = null;
      return;
    }

    // Calculate shake offset
    const progress = 1 - (this.shake.timer / this.shake.duration);
    const currentIntensity = this.shake.intensity * (1 - progress);
    
    const time = Date.now() / 1000;
    this.shake.offset.x = Math.sin(time * this.shake.frequency * Math.PI * 2) * currentIntensity;
    this.shake.offset.y = Math.cos(time * this.shake.frequency * Math.PI * 2.5) * currentIntensity;
  }

  /**
   * Updates camera transition
   * @param deltaTime - Time since last frame in seconds
   */
  private updateTransition(deltaTime: number): void {
    if (!this.transition || !this.camera) return;

    this.transition.timer -= deltaTime;
    
    if (this.transition.timer <= 0) {
      // Transition complete
      this.camera.x = this.transition.targetPosition.x;
      this.camera.y = this.transition.targetPosition.y;
      this.camera.zoom = this.transition.targetZoom;
      
      if (this.transition.onComplete) {
        this.transition.onComplete();
      }
      
      this.transition = null;
      return;
    }

    // Calculate progress (ease-in-out)
    const progress = 1 - (this.transition.timer / this.transition.duration);
    const easedProgress = progress < 0.5 
      ? 2 * progress * progress 
      : 1 - Math.pow(-2 * progress + 2, 2) / 2;

    // Interpolate position and zoom
    this.camera.x = this.transition.startPosition.x + 
      (this.transition.targetPosition.x - this.transition.startPosition.x) * easedProgress;
    this.camera.y = this.transition.startPosition.y + 
      (this.transition.targetPosition.y - this.transition.startPosition.y) * easedProgress;
    this.camera.zoom = this.transition.startZoom + 
      (this.transition.targetZoom - this.transition.startZoom) * easedProgress;
  }

  /**
   * Applies boundary constraints to camera position
   */
  private applyBounds(): void {
    if (!this.camera || !this.bounds.enabled) return;

    const halfViewportWidth = (this.viewport.width / this.camera.zoom) / 2;
    const halfViewportHeight = (this.viewport.height / this.camera.zoom) / 2;

    // Apply boundaries
    this.camera.x = Math.max(
      this.bounds.minX + halfViewportWidth,
      Math.min(this.bounds.maxX - halfViewportWidth, this.camera.x)
    );
    
    this.camera.y = Math.max(
      this.bounds.minY + halfViewportHeight,
      Math.min(this.bounds.maxY - halfViewportHeight, this.camera.y)
    );
  }

  /**
   * Gets final camera position with shake applied
   * @returns Final camera position
   */
  public getFinalPosition(): { x: number; y: number } {
    if (!this.camera) return { x: 0, y: 0 };
    
    let x = this.camera.x;
    let y = this.camera.y;
    
    // Apply shake offset
    if (this.shake) {
      x += this.shake.offset.x;
      y += this.shake.offset.y;
    }
    
    return { x, y };
  }

  /**
   * Resets camera to default state
   */
  public reset(): void {
    if (!this.camera) return;
    
    this.camera.x = this.viewport.width / 2;
    this.camera.y = this.viewport.height / 2;
    this.camera.zoom = 1.0;
    this.camera.targetEntityId = null;
    
    this.shake = null;
    this.transition = null;
    
    logger.debug(LogSource.CAMERA, 'Camera reset to default state');
  }
}