// Debug script to diagnose secret key issues
const CryptoJS = require('crypto-js');

// Simulate the auth logic
const SECRET_KEY = process.env.NEXT_PUBLIC_SECRET_KEY || 'default-secret-key-change-in-production';

console.log('=== AUTH DEBUG INFO ===');
console.log('Expected Secret Key:', SECRET_KEY);
console.log('Expected Key Length:', SECRET_KEY.length);
console.log('Environment Variable Set:', !!process.env.NEXT_PUBLIC_SECRET_KEY);
console.log('');

// Test key validation
function constantTimeCompare(a, b) {
  if (a.length !== b.length) {
    return false;
  }
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

console.log('=== TEST CASES ===');
const testCases = [
  'default-secret-key-change-in-production',
  'Default-secret-key-change-in-production', // Different case
  'default-secret-key-change-in-production ', // Trailing space
  ' default-secret-key-change-in-production', // Leading space
  process.env.NEXT_PUBLIC_SECRET_KEY || 'default-secret-key-change-in-production'
];

testCases.forEach((testKey, index) => {
  const matches = constantTimeCompare(testKey, SECRET_KEY);
  console.log(`Test ${index + 1}: "${testKey}"`);
  console.log(`  Length: ${testKey.length}`);
  console.log(`  Matches: ${matches ? '✅ YES' : '❌ NO'}`);
  console.log('');
});

console.log('=== RECOMMENDATIONS ===');
console.log('1. Make sure you\'re entering the exact key: ' + SECRET_KEY);
console.log('2. Check for extra spaces before/after the key');
console.log('3. Verify case sensitivity');
console.log('4. If using env var, ensure NEXT_PUBLIC_SECRET_KEY is set');