import { validateKey } from '../src/lib/auth';
import { createCode, listCodes } from '../src/lib/inviteCodes';
import assert from 'assert';

async function runTests() {
  console.log('=== Running Auth Flow Integration Tests ===');

  // Test Case 1: Validate Master Key
  console.log('Test 1: Validate Master Key...');
  // Note: SECRET_KEY defaults to 'default-secret-key-change-in-production' if env is not set
  const masterKey = process.env.SECRET_KEY || 'default-secret-key-change-in-production';
  const isMasterValid = await validateKey(masterKey);
  assert.strictEqual(isMasterValid, true, 'Master key validation failed');
  console.log('✅ Master Key validation successful.');

  // Test Case 2: Validate Invalid Key
  console.log('Test 2: Validate Invalid Key...');
  const isInvalidValid = await validateKey('completely-invalid-access-key-1234');
  assert.strictEqual(isInvalidValid, false, 'Invalid key was incorrectly validated as true');
  console.log('✅ Invalid Key rejected successfully.');

  // Test Case 3: Generate Invite Code and Validate
  console.log('Test 3: Generate Invite Code & Validate...');
  const { code } = createCode('Test System User');
  assert.ok(code, 'Failed to generate invite code');
  console.log(`Generated Code: ${code}`);

  const isCodeValid = await validateKey(code);
  assert.strictEqual(isCodeValid, true, 'Generated invite code validation failed');
  console.log('✅ Generated Invite Code validated successfully.');

  // Test Case 4: Verify Uses Count Increment
  console.log('Test 4: Verify Uses Count Increment...');
  const codes = listCodes();
  const meta = codes[code];
  assert.ok(meta, 'Failed to list invite codes metadata');
  assert.strictEqual(meta.uses, 1, `Expected uses count to be 1, got ${meta.uses}`);
  console.log('✅ Uses count successfully incremented.');

  // Test Case 5: Verify Revocation
  console.log('Test 5: Verify Revocation...');
  const { revokeCode } = require('../src/lib/inviteCodes');
  const existed = revokeCode(code);
  assert.strictEqual(existed, true, 'Failed to revoke invite code');
  
  const isCodeValidAfterRevocation = await validateKey(code);
  assert.strictEqual(isCodeValidAfterRevocation, false, 'Revoked code was validated as true');
  console.log('✅ Revoked code rejected successfully.');

  console.log('\n=== All Tests Passed Successfully! ===');
}

runTests().catch((err) => {
  console.error('❌ Test execution failed:', err);
  process.exit(1);
});
