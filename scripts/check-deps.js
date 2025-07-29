#!/usr/bin/env node

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

function checkDependency(packageName) {
  try {
    require.resolve(packageName);
    return true;
  } catch (e) {
    return false;
  }
}

function main() {
  const criticalDeps = ['vitest', '@testing-library/react', '@testing-library/jest-dom'];
  const missing = criticalDeps.filter(dep => !checkDependency(dep));
  
  if (missing.length > 0) {
    console.error('❌ Missing critical dependencies:', missing.join(', '));
    console.error('Run "npm install" to install dependencies');
    process.exit(1);
  }
  
  console.log('✅ All critical dependencies are available');
}

main();