import { WorldManager } from './engine/WorldManager';
import { EntityId } from './types';

const world = new WorldManager();

// Create entity with all components
const entityId = world.createEntity(['Position', 'Health', 'Sprite', 'CombatStats', 'Velocity']);
world.addComponent(entityId, 'Position', { x: 100, y: 200 });
world.addComponent(entityId, 'Health', { current: 75, max: 100 });
world.addComponent(entityId, 'Sprite', { textureId: 'hero', frameIndex: 0, width: 32, height: 32 });
world.addComponent(entityId, 'CombatStats', { attacking: false, attack: 15, defense: 8, actionPoints: 3, maxActionPoints: 3 });
world.addComponent(entityId, 'Velocity', { dx: 0, dy: 0 });

console.log('Entity created:', entityId);
console.log('Components:', Array.from(world.entities.get(entityId)!.components));

// Query
const results = world.query(['Position', 'Health', 'CombatStats', 'Sprite', 'Velocity']);
console.log('Query results:', results);

if (results.length === 0) {
    console.error('Query failed!');
} else {
    console.log('Query success!');
}
