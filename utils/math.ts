/**
 * Math Utility Functions
 * @fileoverview Common math operations for game development
 */

import { Vector2, Rectangle } from '../types';

/**
 * Math utility class with static methods
 */
export class MathUtils {
  /** PI constant */
  public static readonly PI = Math.PI;
  
  /** PI * 2 constant */
  public static readonly TWO_PI = Math.PI * 2;
  
  /** PI / 2 constant */
  public static readonly HALF_PI = Math.PI / 2;
  
  /** Degrees to radians conversion factor */
  public static readonly DEG_TO_RAD = Math.PI / 180;
  
  /** Radians to degrees conversion factor */
  public static readonly RAD_TO_DEG = 180 / Math.PI;

  /**
   * Clamps a value between min and max
   * @param value - Value to clamp
   * @param min - Minimum value
   * @param max - Maximum value
   * @returns Clamped value
   */
  public static clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }

  /**
   * Linear interpolation between two values
   * @param a - Start value
   * @param b - End value
   * @param t - Interpolation factor (0-1)
   * @returns Interpolated value
   */
  public static lerp(a: number, b: number, t: number): number {
    return a + (b - a) * MathUtils.clamp(t, 0, 1);
  }

  /**
   * Smooth step interpolation
   * @param edge0 - Lower edge
   * @param edge1 - Upper edge
   * @param x - Value to interpolate
   * @returns Smoothed value
   */
  public static smoothstep(edge0: number, edge1: number, x: number): number {
    const t = MathUtils.clamp((x - edge0) / (edge1 - edge0), 0, 1);
    return t * t * (3 - 2 * t);
  }

  /**
   * Calculates distance between two points
   * @param x1 - First point X
   * @param y1 - First point Y
   * @param x2 - Second point X
   * @param y2 - Second point Y
   * @returns Distance between points
   */
  public static distance(x1: number, y1: number, x2: number, y2: number): number {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Calculates squared distance between two points (faster than distance)
   * @param x1 - First point X
   * @param y1 - First point Y
   * @param x2 - Second point X
   * @param y2 - Second point Y
   * @returns Squared distance between points
   */
  public static distanceSquared(x1: number, y1: number, x2: number, y2: number): number {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return dx * dx + dy * dy;
  }

  /**
   * Calculates angle between two points in radians
   * @param x1 - First point X
   * @param y1 - First point Y
   * @param x2 - Second point X
   * @param y2 - Second point Y
   * @returns Angle in radians
   */
  public static angle(x1: number, y1: number, x2: number, y2: number): number {
    return Math.atan2(y2 - y1, x2 - x1);
  }

  /**
   * Converts degrees to radians
   * @param degrees - Angle in degrees
   * @returns Angle in radians
   */
  public static degToRad(degrees: number): number {
    return degrees * MathUtils.DEG_TO_RAD;
  }

  /**
   * Converts radians to degrees
   * @param radians - Angle in radians
   * @returns Angle in degrees
   */
  public static radToDeg(radians: number): number {
    return radians * MathUtils.RAD_TO_DEG;
  }

  /**
   * Normalizes an angle to 0-2π range
   * @param angle - Angle in radians
   * @returns Normalized angle
   */
  public static normalizeAngle(angle: number): number {
    while (angle < 0) angle += MathUtils.TWO_PI;
    while (angle >= MathUtils.TWO_PI) angle -= MathUtils.TWO_PI;
    return angle;
  }

  /**
   * Checks if a point is inside a rectangle
   * @param x - Point X
   * @param y - Point Y
   * @param rect - Rectangle to check
   * @returns True if point is inside rectangle
   */
  public static pointInRect(x: number, y: number, rect: Rectangle): boolean {
    return x >= rect.x && x <= rect.x + rect.width &&
           y >= rect.y && y <= rect.y + rect.height;
  }

  /**
   * Checks if two rectangles intersect
   * @param rect1 - First rectangle
   * @param rect2 - Second rectangle
   * @returns True if rectangles intersect
   */
  public static rectIntersect(rect1: Rectangle, rect2: Rectangle): boolean {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
  }

  /**
   * Gets the intersection of two rectangles
   * @param rect1 - First rectangle
   * @param rect2 - Second rectangle
   * @returns Intersection rectangle (null if no intersection)
   */
  public static rectIntersection(rect1: Rectangle, rect2: Rectangle): Rectangle | null {
    const x = Math.max(rect1.x, rect2.x);
    const y = Math.max(rect1.y, rect2.y);
    const width = Math.min(rect1.x + rect1.width, rect2.x + rect2.width) - x;
    const height = Math.min(rect1.y + rect1.height, rect2.y + rect2.height) - y;

    if (width > 0 && height > 0) {
      return { x, y, width, height };
    }

    return null;
  }

  /**
   * Moves a point towards a target by maximum distance
   * @param fromX - Starting X
   * @param fromY - Starting Y
   * @param toX - Target X
   * @param toY - Target Y
   * @param maxDistance - Maximum distance to move
   * @returns New position
   */
  public static moveTowards(
    fromX: number, 
    fromY: number, 
    toX: number, 
    toY: number, 
    maxDistance: number
  ): Vector2 {
    const dx = toX - fromX;
    const dy = toY - fromY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance <= maxDistance || distance === 0) {
      return { x: toX, y: toY };
    }

    const ratio = maxDistance / distance;
    return {
      x: fromX + dx * ratio,
      y: fromY + dy * ratio
    };
  }

  /**
   * Rounds a number to nearest integer
   * @param value - Value to round
   * @returns Rounded integer
   */
  public static round(value: number): number {
    return Math.round(value);
  }

  /**
   * Floors a number
   * @param value - Value to floor
   * @returns Floored integer
   */
  public static floor(value: number): number {
    return Math.floor(value);
  }

  /**
   * Ceils a number
   * @param value - Value to ceil
   * @returns Ceiled integer
   */
  public static ceil(value: number): number {
    return Math.ceil(value);
  }

  /**
   * Gets the sign of a number
   * @param value - Value to check
   * @returns -1, 0, or 1
   */
  public static sign(value: number): number {
    return value > 0 ? 1 : value < 0 ? -1 : 0;
  }

  /**
   * Gets the absolute value
   * @param value - Value to check
   * @returns Absolute value
   */
  public static abs(value: number): number {
    return Math.abs(value);
  }

  /**
   * Gets the minimum of two values
   * @param a - First value
   * @param b - Second value
   * @returns Minimum value
   */
  public static min(a: number, b: number): number {
    return Math.min(a, b);
  }

  /**
   * Gets the maximum of two values
   * @param a - First value
   * @param b - Second value
   * @returns Maximum value
   */
  public static max(a: number, b: number): number {
    return Math.max(a, b);
  }

  /**
   * Checks if a value is approximately equal to another within tolerance
   * @param a - First value
   * @param b - Second value
   * @param tolerance - Tolerance for comparison
   * @returns True if values are approximately equal
   */
  public static approximately(a: number, b: number, tolerance: number = 0.0001): boolean {
    return Math.abs(a - b) < tolerance;
  }

  /**
   * Maps a value from one range to another
   * @param value - Value to map
   * @param fromMin - Source range minimum
   * @param fromMax - Source range maximum
   * @param toMin - Target range minimum
   * @param toMax - Target range maximum
   * @returns Mapped value
   */
  public static mapRange(
    value: number,
    fromMin: number,
    fromMax: number,
    toMin: number,
    toMax: number
  ): number {
    return (value - fromMin) * (toMax - toMin) / (fromMax - fromMin) + toMin;
  }

  /**
   * Wraps a value within a range
   * @param value - Value to wrap
   * @param min - Range minimum
   * @param max - Range maximum
   * @returns Wrapped value
   */
  public static wrap(value: number, min: number, max: number): number {
    const range = max - min;
    if (range <= 0) return min;
    
    let result = value;
    while (result < min) result += range;
    while (result >= max) result -= range;
    return result;
  }
}

/**
 * Vector2 utility functions
 */
export class Vector2Utils {
  /**
   * Creates a new vector
   * @param x - X component (default: 0)
   * @param y - Y component (default: 0)
   * @returns New vector
   */
  public static create(x: number = 0, y: number = 0): Vector2 {
    return { x, y };
  }

  /**
   * Adds two vectors
   * @param a - First vector
   * @param b - Second vector
   * @returns Result vector
   */
  public static add(a: Vector2, b: Vector2): Vector2 {
    return { x: a.x + b.x, y: a.y + b.y };
  }

  /**
   * Subtracts two vectors
   * @param a - First vector
   * @param b - Second vector
   * @returns Result vector
   */
  public static subtract(a: Vector2, b: Vector2): Vector2 {
    return { x: a.x - b.x, y: a.y - b.y };
  }

  /**
   * Multiplies a vector by a scalar
   * @param vector - Vector to multiply
   * @param scalar - Scalar value
   * @returns Result vector
   */
  public static multiply(vector: Vector2, scalar: number): Vector2 {
    return { x: vector.x * scalar, y: vector.y * scalar };
  }

  /**
   * Divides a vector by a scalar
   * @param vector - Vector to divide
   * @param scalar - Scalar value
   * @returns Result vector
   */
  public static divide(vector: Vector2, scalar: number): Vector2 {
    return { x: vector.x / scalar, y: vector.y / scalar };
  }

  /**
   * Gets the magnitude (length) of a vector
   * @param vector - Vector to measure
   * @returns Vector magnitude
   */
  public static magnitude(vector: Vector2): number {
    return Math.sqrt(vector.x * vector.x + vector.y * vector.y);
  }

  /**
   * Gets the squared magnitude of a vector (faster than magnitude)
   * @param vector - Vector to measure
   * @returns Squared magnitude
   */
  public static magnitudeSquared(vector: Vector2): number {
    return vector.x * vector.x + vector.y * vector.y;
  }

  /**
   * Normalizes a vector to unit length
   * @param vector - Vector to normalize
   * @returns Normalized vector
   */
  public static normalize(vector: Vector2): Vector2 {
    const mag = Vector2Utils.magnitude(vector);
    if (mag === 0) return { x: 0, y: 0 };
    return Vector2Utils.divide(vector, mag);
  }

  /**
   * Gets the dot product of two vectors
   * @param a - First vector
   * @param b - Second vector
   * @returns Dot product
   */
  public static dot(a: Vector2, b: Vector2): number {
    return a.x * b.x + a.y * b.y;
  }

  /**
   * Gets the distance between two vectors
   * @param a - First vector
   * @param b - Second vector
   * @returns Distance between vectors
   */
  public static distance(a: Vector2, b: Vector2): number {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Linearly interpolates between two vectors
   * @param a - Start vector
   * @param b - End vector
   * @param t - Interpolation factor (0-1)
   * @returns Interpolated vector
   */
  public static lerp(a: Vector2, b: Vector2, t: number): Vector2 {
    return {
      x: MathUtils.lerp(a.x, b.x, t),
      y: MathUtils.lerp(a.y, b.y, t)
    };
  }

  /**
   * Rotates a vector by an angle
   * @param vector - Vector to rotate
   * @param angle - Angle in radians
   * @returns Rotated vector
   */
  public static rotate(vector: Vector2, angle: number): Vector2 {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return {
      x: vector.x * cos - vector.y * sin,
      y: vector.x * sin + vector.y * cos
    };
  }

  /**
   * Reflects a vector off a surface normal
   * @param vector - Vector to reflect
   * @param normal - Surface normal (should be normalized)
   * @returns Reflected vector
   */
  public static reflect(vector: Vector2, normal: Vector2): Vector2 {
    const dot = Vector2Utils.dot(vector, normal);
    return Vector2Utils.subtract(vector, Vector2Utils.multiply(normal, 2 * dot));
  }
}