// Test file to debug the issue
const testFile = new File(['{"test": "data"}], 'test.json', { type: 'application/json' });

console.log('Mock file created:', testFile);
console.log('File content:', JSON.stringify(testFile));