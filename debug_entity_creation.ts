import { WorldManager } from './engine/WorldManager';

const world = new WorldManager();

console.log('=== Testing createEntity with components ===');
const entityId1 = world.createEntity(['Position', 'Health', 'CombatStats', 'Sprite']);
console.log('Entity created with all components:', entityId1);

console.log('=== Testing createEntity with components array ===');
const entityId2 = world.createEntity(['Position', 'Health', 'CombatStats', 'Sprite']);
console.log('Entity created with array:', entityId2);

console.log('=== Testing query results ===');
const entities1 = world.query(['Position', 'Health', 'CombatStats', 'Sprite']);
const entities2 = world.query(['Position', 'Health', 'CombatStats', 'Sprite']);

console.log('Query 1 result:', entities1);
console.log('Query 2 result:', entities2);
console.log('Both results should be equal:', JSON.stringify(entities1) === JSON.stringify(entities2));