/**
 * Pathfinding Utility Functions
 * @fileoverview A* pathfinding algorithm for grid-based movement
 */

import { Vector2, Rectangle } from '../types';
import { MathUtils } from './math';

/**
 * Grid node for pathfinding
 */
interface PathNode {
  /** Node position */
  position: Vector2;
  /** G cost (distance from start) */
  gCost: number;
  /** H cost (heuristic distance to goal) */
  hCost: number;
  /** F cost (G + H) */
  fCost: number;
  /** Parent node */
  parent: PathNode | null;
  /** Whether node is walkable */
  walkable: boolean;
}

/**
 * Grid map for pathfinding
 */
export interface PathfindingGrid {
  /** Grid width */
  width: number;
  /** Grid height */
  height: number;
  /** 2D array of walkable tiles */
  walkable: boolean[][];
  /** Tile size in pixels */
  tileSize: number;
}

/**
 * A* Pathfinding class
 * Implements the A* algorithm for grid-based pathfinding
 */
export class Pathfinding {
  /**
   * Finds a path from start to goal using A* algorithm
   * @param grid - Pathfinding grid
   * @param start - Start position in world coordinates
   * @param goal - Goal position in world coordinates
   * @returns Array of world positions forming the path (empty if no path)
   */
  public static findPath(
    grid: PathfindingGrid,
    start: Vector2,
    goal: Vector2
  ): Vector2[] {
    // Convert world coordinates to grid coordinates
    const startGrid = this.worldToGrid(start, grid.tileSize);
    const goalGrid = this.worldToGrid(goal, grid.tileSize);

    // Check if start or goal are out of bounds or not walkable
    if (!this.isValidPosition(startGrid, grid) || !this.isValidPosition(goalGrid, grid)) {
      return [];
    }

    // Initialize open and closed sets
    const openSet: PathNode[] = [];
    const closedSet: Set<string> = new Set();

    // Create start node
    const startNode: PathNode = {
      position: startGrid,
      gCost: 0,
      hCost: this.heuristic(startGrid, goalGrid),
      fCost: 0,
      parent: null,
      walkable: true
    };
    startNode.fCost = startNode.gCost + startNode.hCost;

    openSet.push(startNode);

    while (openSet.length > 0) {
      // Find node with lowest F cost
      let currentNode = openSet[0];
      let currentIndex = 0;

      for (let i = 1; i < openSet.length; i++) {
        if (openSet[i].fCost < currentNode.fCost) {
          currentNode = openSet[i];
          currentIndex = i;
        }
      }

      // Remove current node from open set
      openSet.splice(currentIndex, 1);
      closedSet.add(this.positionToKey(currentNode.position));

      // Check if we reached the goal
      if (this.positionsEqual(currentNode.position, goalGrid)) {
        return this.reconstructPath(currentNode, grid.tileSize);
      }

      // Check neighbors
      const neighbors = this.getNeighbors(currentNode.position, grid);
      
      for (const neighborPos of neighbors) {
        const neighborKey = this.positionToKey(neighborPos);
        
        // Skip if already evaluated
        if (closedSet.has(neighborKey)) {
          continue;
        }

        // Check if neighbor is walkable
        if (!this.isValidPosition(neighborPos, grid)) {
          continue;
        }

        // Calculate costs
        const gCost = currentNode.gCost + this.distance(currentNode.position, neighborPos);
        const hCost = this.heuristic(neighborPos, goalGrid);
        const fCost = gCost + hCost;

        // Check if neighbor is already in open set with lower cost
        const existingNode = openSet.find(node => 
          this.positionsEqual(node.position, neighborPos)
        );

        if (existingNode && existingNode.gCost <= gCost) {
          continue;
        }

        // Create or update neighbor node
        const neighborNode: PathNode = {
          position: neighborPos,
          gCost,
          hCost,
          fCost,
          parent: currentNode,
          walkable: true
        };

        if (existingNode) {
          // Update existing node
          Object.assign(existingNode, neighborNode);
        } else {
          // Add new node
          openSet.push(neighborNode);
        }
      }
    }

    // No path found
    return [];
  }

  /**
   * Gets walkable neighbors of a position
   * @param position - Position to get neighbors for
   * @param grid - Pathfinding grid
   * @returns Array of neighbor positions
   */
  private static getNeighbors(position: Vector2, grid: PathfindingGrid): Vector2[] {
    const neighbors: Vector2[] = [];
    const directions = [
      { x: 0, y: -1 },  // Up
      { x: 1, y: 0 },   // Right
      { x: 0, y: 1 },   // Down
      { x: -1, y: 0 }   // Left
    ];

    for (const dir of directions) {
      const neighborPos = {
        x: position.x + dir.x,
        y: position.y + dir.y
      };

      if (this.isValidPosition(neighborPos, grid)) {
        neighbors.push(neighborPos);
      }
    }

    return neighbors;
  }

  /**
   * Checks if a position is valid and walkable
   * @param position - Position to check
   * @param grid - Pathfinding grid
   * @returns True if position is valid and walkable
   */
  private static isValidPosition(position: Vector2, grid: PathfindingGrid): boolean {
    return position.x >= 0 && 
           position.x < grid.width &&
           position.y >= 0 && 
           position.y < grid.height &&
           grid.walkable[position.y][position.x];
  }

  /**
   * Heuristic function for A* (Manhattan distance)
   * @param a - First position
   * @param b - Second position
   * @returns Heuristic distance
   */
  private static heuristic(a: Vector2, b: Vector2): number {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  }

  /**
   * Calculates distance between two adjacent positions
   * @param a - First position
   * @param b - Second position
   * @returns Distance (always 1 for adjacent grid positions)
   */
  private static distance(_a: Vector2, _b: Vector2): number {
    return 1; // All adjacent moves have equal cost in this implementation
  }

  /**
   * Reconstructs path from goal node to start
   * @param goalNode - Goal node
   * @param tileSize - Tile size for world coordinate conversion
   * @returns Array of world positions
   */
  private static reconstructPath(goalNode: PathNode, tileSize: number): Vector2[] {
    const path: Vector2[] = [];
    let current: PathNode | null = goalNode;

    while (current !== null) {
      // Convert grid position to world position (center of tile)
      const worldPos = this.gridToWorld(current.position, tileSize);
      path.unshift(worldPos);
      current = current.parent;
    }

    return path;
  }

  /**
   * Converts world coordinates to grid coordinates
   * @param worldPos - World position
   * @param tileSize - Tile size
   * @returns Grid position
   */
  private static worldToGrid(worldPos: Vector2, tileSize: number): Vector2 {
    return {
      x: Math.floor(worldPos.x / tileSize),
      y: Math.floor(worldPos.y / tileSize)
    };
  }

  /**
   * Converts grid coordinates to world coordinates
   * @param gridPos - Grid position
   * @param tileSize - Tile size
   * @returns World position (center of tile)
   */
  private static gridToWorld(gridPos: Vector2, tileSize: number): Vector2 {
    return {
      x: gridPos.x * tileSize + tileSize / 2,
      y: gridPos.y * tileSize + tileSize / 2
    };
  }

  /**
   * Checks if two positions are equal
   * @param a - First position
   * @param b - Second position
   * @returns True if positions are equal
   */
  private static positionsEqual(a: Vector2, b: Vector2): boolean {
    return a.x === b.x && a.y === b.y;
  }

  /**
   * Converts position to string key for set lookup
   * @param position - Position to convert
   * @returns String key
   */
  private static positionToKey(position: Vector2): string {
    return `${position.x},${position.y}`;
  }
}

/**
 * Simple pathfinding utility for straight-line paths
 */
export class SimplePathfinding {
  /**
   * Creates a simple straight-line path with obstacle avoidance
   * @param start - Start position
   * @param goal - Goal position
   * @param obstacles - Array of obstacle rectangles
   * @param stepSize - Step size for path points
   * @returns Array of positions forming the path
   */
  public static createStraightPath(
    start: Vector2,
    goal: Vector2,
    obstacles: Rectangle[],
    stepSize: number = 32
  ): Vector2[] {
    const path: Vector2[] = [start];
    const distance = MathUtils.distance(start.x, start.y, goal.x, goal.y);
    const steps = Math.ceil(distance / stepSize);

    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const point = MathUtils.lerp(start.x, goal.x, t);
      const pointY = MathUtils.lerp(start.y, goal.y, t);
      const position = { x: point, y: pointY };

      // Check if position collides with obstacles
      const collides = obstacles.some(obstacle => 
        MathUtils.pointInRect(position.x, position.y, obstacle)
      );

      if (!collides) {
        path.push(position);
      }
    }

    // Add goal if not already at goal
    const lastPoint = path[path.length - 1];
    if (!MathUtils.approximately(lastPoint.x, goal.x, 1) || 
        !MathUtils.approximately(lastPoint.y, goal.y, 1)) {
      path.push(goal);
    }

    return path;
  }

  /**
   * Simplifies a path by removing unnecessary waypoints
   * @param path - Original path
   * @param tolerance - Tolerance for simplification
   * @returns Simplified path
   */
  public static simplifyPath(path: Vector2[], tolerance: number = 5): Vector2[] {
    if (path.length <= 2) return path;

    const simplified: Vector2[] = [path[0]];

    for (let i = 1; i < path.length - 1; i++) {
      const prev = simplified[simplified.length - 1];
      const current = path[i];
      const next = path[i + 1];

      // Check if current point is necessary
      const distToLine = this.pointToLineDistance(current, prev, next);
      
      if (distToLine > tolerance) {
        simplified.push(current);
      }
    }

    simplified.push(path[path.length - 1]);
    return simplified;
  }

  /**
   * Calculates distance from point to line segment
   * @param point - Point to check
   * @param lineStart - Line segment start
   * @param lineEnd - Line segment end
   * @returns Distance from point to line
   */
  private static pointToLineDistance(
    point: Vector2,
    lineStart: Vector2,
    lineEnd: Vector2
  ): number {
    const lineLength = MathUtils.distance(
      lineStart.x, lineStart.y, lineEnd.x, lineEnd.y
    );
    
    if (lineLength === 0) {
      return MathUtils.distance(point.x, point.y, lineStart.x, lineStart.y);
    }

    const t = MathUtils.clamp(
      ((point.x - lineStart.x) * (lineEnd.x - lineStart.x) +
       (point.y - lineStart.y) * (lineEnd.y - lineStart.y)) / (lineLength * lineLength),
      0, 1
    );

    const projection = {
      x: lineStart.x + t * (lineEnd.x - lineStart.x),
      y: lineStart.y + t * (lineEnd.y - lineStart.y)
    };

    return MathUtils.distance(point.x, point.y, projection.x, projection.y);
  }
}