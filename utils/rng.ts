/**
 * Random Number Generator Utility
 * @fileoverview Seedable RNG for consistent game mechanics
 */

/**
 * Seedable Random Number Generator class
 * Provides deterministic random numbers for save state compatibility
 */
export class RNG {
  /** Current seed value */
  private seed: number;

  /**
   * Creates a new RNG instance
   * @param seed - Initial seed value (defaults to current time)
   */
  constructor(seed: number = Date.now()) {
    this.seed = seed;
  }

  /**
   * Generates a random float between 0 (inclusive) and 1 (exclusive)
   * @returns Random float value
   */
  public random(): number {
    // Linear congruential generator (LCG)
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  /**
   * Generates a random integer between min (inclusive) and max (exclusive)
   * @param min - Minimum value (inclusive)
   * @param max - Maximum value (exclusive)
   * @returns Random integer
   */
  public randomInt(min: number, max: number): number {
    return Math.floor(this.random() * (max - min)) + min;
  }

  /**
   * Generates a random float between min (inclusive) and max (exclusive)
   * @param min - Minimum value (inclusive)
   * @param max - Maximum value (exclusive)
   * @returns Random float
   */
  public randomFloat(min: number, max: number): number {
    return this.random() * (max - min) + min;
  }

  /**
   * Generates a random boolean with given probability
   * @param probability - Probability of true (0 to 1)
   * @returns Random boolean
   */
  public randomBool(probability: number = 0.5): boolean {
    return this.random() < probability;
  }

  /**
   * Selects a random element from an array
   * @param array - Array to select from
   * @returns Random element from array
   */
  public randomChoice<T>(array: T[]): T {
    if (array.length === 0) {
      throw new Error('Cannot choose from empty array');
    }
    return array[this.randomInt(0, array.length)];
  }

  /**
   * Shuffles an array in place using Fisher-Yates algorithm
   * @param array - Array to shuffle
   * @returns Shuffled array (same reference)
   */
  public shuffle<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = this.randomInt(0, i + 1);
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  /**
   * Gets the current seed value
   * @returns Current seed
   */
  public getSeed(): number {
    return this.seed;
  }

  /**
   * Sets a new seed value
   * @param seed - New seed value
   */
  public setSeed(seed: number): void {
    this.seed = seed;
  }

  /**
   * Creates a copy of this RNG with the same seed
   * @returns New RNG instance with same seed
   */
  public clone(): RNG {
    return new RNG(this.seed);
  }
}

/**
 * Global RNG instance for general use
 */
export const globalRNG = new RNG();

/**
 * Utility functions for common RNG operations
 */

/**
 * Rolls a dice with given number of sides
 * @param sides - Number of sides on the dice
 * @param count - Number of dice to roll (default: 1)
 * @returns Total roll value
 */
export function rollDice(sides: number, count: number = 1): number {
  let total = 0;
  for (let i = 0; i < count; i++) {
    total += globalRNG.randomInt(1, sides + 1);
  }
  return total;
}

/**
 * Rolls percentage chance (1-100)
 * @param chance - Chance of success (1-100)
 * @returns True if chance succeeded
 */
export function rollPercent(chance: number): boolean {
  return globalRNG.randomInt(1, 101) <= chance;
}

/**
 * Determines if a critical hit occurs
 * @param critChance - Critical hit chance (0-1)
 * @returns True if critical hit
 */
export function rollCritical(critChance: number): boolean {
  return globalRNG.random() < critChance;
}

/**
 * Gets a random element with weighted probabilities
 * @param items - Array of items with weights
 * @returns Selected item
 */
export function weightedRandom<T>(items: Array<{ item: T; weight: number }>): T {
  const totalWeight = items.reduce((sum, { weight }) => sum + weight, 0);
  let random = globalRNG.randomFloat(0, totalWeight);
  
  for (const entry of items) {
    random -= entry.weight;
    if (random <= 0) {
      return entry.item;
    }
  }
  
  // Fallback (shouldn't happen with valid weights)
  return items[items.length - 1].item;
}