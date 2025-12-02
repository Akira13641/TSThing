import { setupDOMMock, getMockDocument } from './tests/dom-mock';

setupDOMMock();

const doc = getMockDocument();
const div = doc.createElement('div');
div.setAttribute('data-testid', 'test-element');
doc.body.appendChild(div);

console.log('Document body HTML:', doc.body.innerHTML);
console.log('Div attributes:', (div as any).attributes);

const found = doc.querySelector('[data-testid="test-element"]');
console.log('Found element:', found ? 'YES' : 'NO');

if (!found) {
  console.error('Failed to find element by attribute!');
} else {
  console.log('Successfully found element by attribute.');
}