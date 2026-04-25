#!/usr/bin/env node

/**
 * Key Generation Utility for Shadowbroker Covert Deployment
 *
 * This script generates secure access keys for users and generates
 * user-specific keys that can be shared with trusted individuals.
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const SECRET_KEY = process.env.SECRET_KEY;
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

if (!SECRET_KEY || !ENCRYPTION_KEY) {
  console.error('❌ Error: SECRET_KEY or ENCRYPTION_KEY not found in .env file');
  console.error('Please run the setup script first: ./setup.sh');
  process.exit(1);
}

/**
 * Hash a key using SHA-256
 */
function hashKey(key) {
  return crypto.createHash('sha256').update(key + SECRET_KEY).digest('hex');
}

/**
 * Generate a random secure key
 */
function generateRandomKey(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Create a user-specific access key
 */
function createUserKey(username) {
  const timestamp = Date.now();
  const randomPart = crypto.randomBytes(16).toString('hex');
  const userKey = `${username}-${timestamp}-${randomPart}`;

  return {
    key: userKey,
    hash: hashKey(userKey),
    created: new Date(timestamp).toISOString(),
    username: username
  };
}

/**
 * Validate a key against the master secret
 */
function validateKey(key) {
  const inputHash = hashKey(key);
  const secretHash = hashKey(SECRET_KEY);

  // For this implementation, we'll use the SECRET_KEY as the master key
  // Users can be given either the master key or specific derived keys
  return inputHash === secretHash;
}

/**
 * Main menu
 */
function showMenu() {
  console.log('\n🔐 Shadowbroker Key Management');
  console.log('==============================');
  console.log('1. Generate a new random access key');
  console.log('2. Create user-specific access key');
  console.log('3. Validate an existing key');
  console.log('4. Show current master key');
  console.log('5. Exit');
  console.log('');
}

/**
 * Main function
 */
async function main() {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const question = (prompt) => {
    return new Promise((resolve) => {
      rl.question(prompt, resolve);
    });
  };

  while (true) {
    showMenu();
    const choice = await question('Select an option (1-5): ');

    switch (choice.trim()) {
      case '1':
        const randomKey = generateRandomKey();
        console.log('\n✅ New access key generated:');
        console.log('   ' + randomKey);
        console.log('\n⚠️  Share this key securely with the intended user.');
        console.log('   They can use it to access the hidden dashboard.\n');
        break;

      case '2':
        const username = await question('Enter username/identifier: ');
        if (username.trim()) {
          const userKeyData = createUserKey(username.trim());
          console.log('\n✅ User-specific access key created:');
          console.log('   Username: ' + userKeyData.username);
          console.log('   Key: ' + userKeyData.key);
          console.log('   Created: ' + userKeyData.created);
          console.log('   Hash: ' + userKeyData.hash);
          console.log('\n⚠️  Share the KEY (not the hash) securely with the user.\n');

          // Save to keys file
          const keysFile = path.join(__dirname, '..', 'keys.json');
          let keys = [];
          if (fs.existsSync(keysFile)) {
            keys = JSON.parse(fs.readFileSync(keysFile, 'utf8'));
          }
          keys.push(userKeyData);
          fs.writeFileSync(keysFile, JSON.stringify(keys, null, 2));
          console.log('💾 Key saved to keys.json\n');
        }
        break;

      case '3':
        const keyToValidate = await question('Enter key to validate: ');
        if (keyToValidate.trim()) {
          const isValid = validateKey(keyToValidate.trim());
          if (isValid) {
            console.log('\n✅ Key is valid! Access granted.\n');
          } else {
            console.log('\n❌ Key is invalid. Access denied.\n');
          }
        }
        break;

      case '4':
        console.log('\n🔑 Master Key (SECRET_KEY from .env):');
        console.log('   ' + SECRET_KEY);
        console.log('\n⚠️  This is the master key. Anyone with this key can access the system.');
        console.log('   Share it only with trusted individuals.\n');
        break;

      case '5':
        rl.close();
        console.log('\n👋 Goodbye!\n');
        process.exit(0);

      default:
        console.log('\n❌ Invalid option. Please try again.\n');
    }
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  generateRandomKey,
  createUserKey,
  validateKey,
  hashKey
};