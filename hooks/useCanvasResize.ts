/**
 * Canvas Resize Hook
 * @fileoverview React hook for handling canvas resize events
 */

import { useEffect, useRef, useCallback } from 'react';
import { logger, LogSource } from '../engine/GlobalLogger';

/**
 * Canvas resize configuration
 */
interface CanvasResizeConfig {
  /** Target aspect ratio (width/height) */
  aspectRatio?: number;
  /** Maximum width */
  maxWidth?: number;
  /** Maximum height */
  maxHeight?: number;
  /** Whether to maintain pixel perfect scaling */
  pixelPerfect?: boolean;
  /** Callback when canvas is resized */
  onResize?: (width: number, height: number) => void;
}

/**
 * Canvas resize result
 */
interface CanvasResizeResult {
  /** Current canvas width */
  width: number;
  /** Current canvas height */
  height: number;
  /** Current scale factor */
  scale: number;
  /** Forces a resize check */
  forceResize: () => void;
}

/**
 * React hook for handling canvas resize events
 * Automatically adjusts canvas size to fit container while maintaining aspect ratio
 * @param canvasRef - Reference to canvas element
 * @param config - Resize configuration
 * @returns Canvas resize information
 */
export function useCanvasResize(
  canvasRef: React.RefObject<HTMLCanvasElement>,
  config: CanvasResizeConfig = {}
): CanvasResizeResult {
  const configRef = useRef(config);
  const resizeTimeoutRef = useRef<number | null>(null);
  const observerRef = useRef<ResizeObserver | null>(null);

  // Update config ref when config changes
  configRef.current = config;

  // Default aspect ratio for 1024x768
  const defaultAspectRatio = 1024 / 768;
  const aspectRatio = config.aspectRatio || defaultAspectRatio;

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const container = canvas.parentElement;
    if (!container) return;

    const config = configRef.current;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    let canvasWidth: number;
    let canvasHeight: number;
    let scale: number;

    // Calculate dimensions based on aspect ratio
    if (containerWidth / containerHeight > aspectRatio) {
      // Container is wider than aspect ratio - height is limiting
      canvasHeight = Math.min(containerHeight, config.maxHeight || Infinity);
      canvasWidth = canvasHeight * aspectRatio;
    } else {
      // Container is taller than aspect ratio - width is limiting
      canvasWidth = Math.min(containerWidth, config.maxWidth || Infinity);
      canvasHeight = canvasWidth / aspectRatio;
    }

    // Apply maximum constraints
    if (config.maxWidth && canvasWidth > config.maxWidth) {
      canvasWidth = config.maxWidth;
      canvasHeight = canvasWidth / aspectRatio;
    }

    if (config.maxHeight && canvasHeight > config.maxHeight) {
      canvasHeight = config.maxHeight;
      canvasWidth = canvasHeight * aspectRatio;
    }

    // Calculate scale factor
    scale = canvasWidth / (config.maxWidth || 1024);

    // Apply pixel perfect scaling if requested
    if (config.pixelPerfect) {
      scale = Math.floor(scale);
      canvasWidth = Math.floor(canvasWidth);
      canvasHeight = Math.floor(canvasHeight);
    }

    // Set canvas CSS size
    canvas.style.width = `${canvasWidth}px`;
    canvas.style.height = `${canvasHeight}px`;

    // Set canvas internal resolution if different from CSS size
    if (canvas.width !== canvasWidth || canvas.height !== canvasHeight) {
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
    }

    // Call resize callback
    if (config.onResize) {
      config.onResize(canvasWidth, canvasHeight);
    }

    logger.debug(LogSource.CORE, `Canvas resized to ${canvasWidth}x${canvasHeight} (scale: ${scale})`);

    return { width: canvasWidth, height: canvasHeight, scale };
  }, [canvasRef, aspectRatio]);

  const forceResize = useCallback(() => {
    resizeCanvas();
  }, [resizeCanvas]);

  // Set up resize observer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const container = canvas.parentElement;
    if (!container) return;

    // Create resize observer for better performance than window resize events
    observerRef.current = new ResizeObserver((entries) => {
      // Debounce resize events
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }

      resizeTimeoutRef.current = window.setTimeout(() => {
        resizeCanvas();
      }, 16); // ~60fps
    });

    observerRef.current.observe(container);

    // Initial resize
    resizeCanvas();

    logger.debug(LogSource.CORE, 'Canvas resize observer set up');

    return () => {
      // Cleanup
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }

      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
        resizeTimeoutRef.current = null;
      }

      logger.debug(LogSource.CORE, 'Canvas resize observer cleaned up');
    };
  }, [canvasRef, resizeCanvas]);

  // Handle window resize as fallback
  useEffect(() => {
    const handleWindowResize = () => {
      // Debounce window resize events
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }

      resizeTimeoutRef.current = window.setTimeout(() => {
        resizeCanvas();
      }, 100);
    };

    window.addEventListener('resize', handleWindowResize);
    window.addEventListener('orientationchange', handleWindowResize);

    return () => {
      window.removeEventListener('resize', handleWindowResize);
      window.removeEventListener('orientationchange', handleWindowResize);
    };
  }, [resizeCanvas]);

  // Return current dimensions (these will be updated on resize)
  // For now, return defaults - in a real implementation, you'd track these in state
  return {
    width: 1024,
    height: 768,
    scale: 1,
    forceResize
  };
}

/**
 * Simple canvas resize hook for basic use cases
 * @param canvasRef - Reference to canvas element
 * @param width - Target width
 * @param height - Target height
 * @returns Current canvas dimensions
 */
export function useSimpleCanvasResize(
  canvasRef: React.RefObject<HTMLCanvasElement>,
  width: number,
  height: number
): { width: number; height: number } {
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const container = canvas.parentElement;
    if (!container) return;

    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    const aspectRatio = width / height;
    let canvasWidth: number;
    let canvasHeight: number;

    if (containerWidth / containerHeight > aspectRatio) {
      canvasHeight = containerHeight;
      canvasWidth = canvasHeight * aspectRatio;
    } else {
      canvasWidth = containerWidth;
      canvasHeight = canvasWidth / aspectRatio;
    }

    canvas.style.width = `${canvasWidth}px`;
    canvas.style.height = `${canvasHeight}px`;

    logger.debug(LogSource.CORE, `Simple canvas resize to ${canvasWidth}x${canvasHeight}`);
  }, [canvasRef, width, height]);

  useEffect(() => {
    resizeCanvas();

    const handleResize = () => {
      resizeCanvas();
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [resizeCanvas]);

  return { width, height };
}