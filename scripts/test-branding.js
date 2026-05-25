const fs = require('fs');
const path = require('path');

const filesToTest = [
  {
    path: path.join(__dirname, '../src/app/dashboard/page.tsx'),
    mustContain: ['BLACKTIVISM', 'BLACKTIVISM v0.4'],
    mustNotContain: ['SHADOWBROKER v0.4']
  },
  {
    path: path.join(__dirname, '../src/components/panels/LayerPanel.tsx'),
    mustContain: ['BLACKTIVISM OSINT v0.4'],
    mustNotContain: ['Shadowbroker OSINT v0.4']
  }
];

let failed = false;

console.log('Running Branding static unit tests...');

for (const test of filesToTest) {
  if (!fs.existsSync(test.path)) {
    console.error(`❌ File not found: ${test.path}`);
    failed = true;
    continue;
  }

  const content = fs.readFileSync(test.path, 'utf8');

  for (const str of test.mustContain) {
    if (!content.includes(str)) {
      console.error(`❌ File ${path.basename(test.path)} does not contain expected string: "${str}"`);
      failed = true;
    } else {
      console.log(`✅ File ${path.basename(test.path)} contains: "${str}"`);
    }
  }

  for (const str of test.mustNotContain) {
    if (content.includes(str)) {
      console.error(`❌ File ${path.basename(test.path)} contains banned string: "${str}"`);
      failed = true;
    } else {
      console.log(`✅ File ${path.basename(test.path)} correctly does not contain: "${str}"`);
    }
  }
}

if (failed) {
  console.error('\n❌ Static branding unit tests FAILED.');
  process.exit(1);
} else {
  console.log('\n✅ All static branding unit tests PASSED successfully.');
  process.exit(0);
}
