import { WorldManager } from './engine/WorldManager';
import { SaveSystem } from './engine/SaveSystem';

const world = new WorldManager();
const saveSystem = new SaveSystem();
saveSystem.setWorld(world);

// Create entity with all required components
const entityId = world.createEntity(['Position', 'Health', 'CombatStats', 'Sprite']);
world.addComponent(entityId, 'Position', { x: 100, y: 200 });
world.addComponent(entityId, 'Health', { current: 75, max: 100 });
world.addComponent(entityId, 'CombatStats', { 
  attacking: false, 
  attack: 15, 
  defense: 8 
});
world.addComponent(entityId, 'Sprite', { textureId: 'hero', frameIndex: 0 });

console.log('Entity created:', entityId);
console.log('All components added');

// Test the query that SaveSystem uses
const playerEntities = world.query(['Position', 'Health', 'CombatStats', 'Sprite']);
console.log('Query result:', playerEntities);
console.log('Query length:', playerEntities.length);

// Test individual component retrieval
const position = world.getComponent(entityId, 'Position');
const health = world.getComponent(entityId, 'Health');
const combatStats = world.getComponent(entityId, 'CombatStats');
const sprite = world.getComponent(entityId, 'Sprite');

console.log('Position:', position);
console.log('Health:', health);
console.log('CombatStats:', combatStats);
console.log('Sprite:', sprite);