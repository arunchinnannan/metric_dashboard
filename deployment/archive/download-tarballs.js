#!/usr/bin/env node
/**
 * Downloads npm packages as tarballs for manual transfer
 * This creates a vendored packages directory
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const FRONTEND_DIR = path.join(__dirname, '../frontend');
const BACKEND_DIR = path.join(__dirname, '../backend');
const VENDOR_DIR = path.join(__dirname, 'vendored-packages');

// Create vendor directory
if (!fs.existsSync(VENDOR_DIR)) {
  fs.mkdirSync(VENDOR_DIR, { recursive: true });
}

function createOfflinePackages(projectDir, projectName) {
  console.log(`\n📦 Creating offline package bundle for ${projectName}...`);
  
  const vendorSubDir = path.join(VENDOR_DIR, projectName);
  if (!fs.existsSync(vendorSubDir)) {
    fs.mkdirSync(vendorSubDir, { recursive: true });
  }
  
  try {
    // Copy package files
    const packageJson = path.join(projectDir, 'package.json');
    const packageLock = path.join(projectDir, 'package-lock.json');
    
    fs.copyFileSync(packageJson, path.join(vendorSubDir, 'package.json'));
    
    if (fs.existsSync(packageLock)) {
      fs.copyFileSync(packageLock, path.join(vendorSubDir, 'package-lock.json'));
    } else {
      console.log('  Generating package-lock.json...');
      execSync('npm install --package-lock-only', { 
        cwd: projectDir,
        stdio: 'inherit'
      });
      fs.copyFileSync(packageLock, path.join(vendorSubDir, 'package-lock.json'));
    }
    
    // Create bundled tarball using npm pack
    console.log('  Creating package bundle...');
    const bundleScript = `
      npm install
      tar -czf ${projectName}-bundle.tar.gz node_modules package.json package-lock.json
    `;
    
    fs.writeFileSync(path.join(vendorSubDir, 'create-bundle.sh'), bundleScript);
    
    console.log(`  ✅ Setup files created in: ${vendorSubDir}`);
    console.log(`     Run the following on a machine with internet:`);
    console.log(`     cd ${vendorSubDir}`);
    console.log(`     npm install`);
    console.log(`     tar -czf ${projectName}-bundle.tar.gz node_modules`);
    
  } catch (error) {
    console.error(`  ❌ Error: ${error.message}`);
  }
}

console.log('🚀 Creating offline package setup...\n');

createOfflinePackages(FRONTEND_DIR, 'frontend');
createOfflinePackages(BACKEND_DIR, 'backend');

console.log('\n' + '='.repeat(70));
console.log('📋 INSTRUCTIONS:');
console.log('='.repeat(70));
console.log('\n1. On a machine WITH internet access:');
console.log('   cd deployment/vendored-packages/frontend');
console.log('   npm install');
console.log('   tar -czf frontend-node-modules.tar.gz node_modules');
console.log('');
console.log('   cd ../backend');
console.log('   npm install --only=production');
console.log('   tar -czf backend-node-modules.tar.gz node_modules');
console.log('');
console.log('2. Transfer the .tar.gz files to your Ubuntu machine');
console.log('');
console.log('3. Extract them in the respective directories:');
console.log('   tar -xzf frontend-node-modules.tar.gz -C frontend/');
console.log('   tar -xzf backend-node-modules.tar.gz -C backend/');
console.log('');
console.log('⚠️  NOTE: The node_modules must be created on Linux/Alpine');
console.log('   for Docker compatibility. Use WSL, a Linux VM, or a Linux machine.');
console.log('='.repeat(70));
