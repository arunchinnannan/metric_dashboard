#!/usr/bin/env node
/**
 * Downloads all npm packages as tarballs for offline installation
 * Run: node download-packages.js
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

const FRONTEND_DIR = path.join(__dirname, '../frontend');
const BACKEND_DIR = path.join(__dirname, '../backend');
const CACHE_DIR = path.join(__dirname, 'npm-cache');

// Create cache directory
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

function downloadPackages(projectDir, projectName) {
  console.log(`\n📦 Processing ${projectName}...`);
  
  const packageJsonPath = path.join(projectDir, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  const allDeps = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies
  };
  
  console.log(`Found ${Object.keys(allDeps).length} dependencies`);
  
  // Use npm pack to download all dependencies
  const cacheSubDir = path.join(CACHE_DIR, projectName);
  if (!fs.existsSync(cacheSubDir)) {
    fs.mkdirSync(cacheSubDir, { recursive: true });
  }
  
  try {
    // Create a temporary package-lock if it doesn't exist
    const lockPath = path.join(projectDir, 'package-lock.json');
    if (!fs.existsSync(lockPath)) {
      console.log('Generating package-lock.json...');
      execSync('npm install --package-lock-only', { 
        cwd: projectDir,
        stdio: 'inherit'
      });
    }
    
    // Download all packages to cache
    console.log('Downloading packages...');
    execSync(`npm ci --cache "${CACHE_DIR}" --prefer-offline`, {
      cwd: projectDir,
      stdio: 'inherit',
      env: { ...process.env, npm_config_cache: CACHE_DIR }
    });
    
    console.log(`✅ ${projectName} packages cached successfully`);
  } catch (error) {
    console.error(`❌ Error processing ${projectName}:`, error.message);
  }
}

console.log('🚀 Starting package download...');
console.log(`Cache directory: ${CACHE_DIR}`);

downloadPackages(FRONTEND_DIR, 'frontend');
downloadPackages(BACKEND_DIR, 'backend');

console.log('\n✨ Done! Copy the entire "npm-cache" folder to your Ubuntu machine.');
console.log('Then use: npm ci --offline --cache /path/to/npm-cache');
