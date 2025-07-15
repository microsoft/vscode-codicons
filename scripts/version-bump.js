#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Bumps version numbers in package.json
 * Handles both package version and fontVersion
 */
function bumpVersions() {
  const packageJsonPath = path.join(__dirname, '..', 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

  // Parse command line arguments
  const args = process.argv.slice(2);
  const packageBumpType = args[0] || 'patch';
  const fontBumpType = args[1] || 'minor';

  // Validate bump types
  const validPackageBumps = ['major', 'minor', 'patch'];
  const validFontBumps = ['major', 'minor'];

  if (!validPackageBumps.includes(packageBumpType)) {
    console.error(`Invalid package bump type: ${packageBumpType}. Must be one of: ${validPackageBumps.join(', ')}`);
    process.exit(1);
  }

  if (!validFontBumps.includes(fontBumpType)) {
    console.error(`Invalid font bump type: ${fontBumpType}. Must be one of: ${validFontBumps.join(', ')}`);
    process.exit(1);
  }

  // Bump package version
  const currentVersion = packageJson.version;
  const [major, minor, patch] = currentVersion.split('.').map(Number);
  
  let newMajor = major;
  let newMinor = minor;
  let newPatch = patch;
  
  if (packageBumpType === 'major') {
    newMajor += 1;
    newMinor = 0;
    newPatch = 0;
  } else if (packageBumpType === 'minor') {
    newMinor += 1;
    newPatch = 0;
  } else if (packageBumpType === 'patch') {
    newPatch += 1;
  }
  
  const newPackageVersion = `${newMajor}.${newMinor}.${newPatch}`;
  
  // Bump font version
  const currentFontVersion = packageJson.fontVersion;
  const [fontMajor, fontMinor] = currentFontVersion.split('.').map(Number);
  
  let newFontMajor = fontMajor;
  let newFontMinor = fontMinor;
  
  if (fontBumpType === 'major') {
    newFontMajor += 1;
    newFontMinor = 0;
  } else if (fontBumpType === 'minor') {
    newFontMinor += 1;
  }
  
  const newFontVersion = `${newFontMajor}.${newFontMinor}`;
  
  // Update package.json
  packageJson.version = newPackageVersion;
  packageJson.fontVersion = newFontVersion;
  
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
  
  console.log(`Updated package version: ${currentVersion} → ${newPackageVersion}`);
  console.log(`Updated font version: ${currentFontVersion} → ${newFontVersion}`);
  
  // Optionally commit changes
  if (args.includes('--commit') || args.includes('-c')) {
    try {
      const message = `chore: bump version to ${newPackageVersion}, font to ${newFontVersion}`;
      execSync(`git add ${packageJsonPath}`);
      execSync(`git commit -m "${message}"`);
      console.log(`Changes committed: ${message}`);
      
      // Create a tag if requested
      if (args.includes('--tag') || args.includes('-t')) {
        const tagName = `v${newPackageVersion}`;
        execSync(`git tag -a ${tagName} -m "Release ${tagName} with font version ${newFontVersion}"`);
        console.log(`Tag created: ${tagName}`);
      }
      
      // Push changes if requested
      if (args.includes('--push') || args.includes('-p')) {
        execSync('git push');
        if (args.includes('--tag') || args.includes('-t')) {
          execSync('git push --tags');
        }
        console.log('Changes pushed to remote');
      }
    } catch (error) {
      console.error('Error during git operations:', error.message);
      process.exit(1);
    }
  }
  
  // Run npm install to update package-lock.json if requested
  if (args.includes('--npm-install') || args.includes('-i')) {
    try {
      execSync('npm install', { stdio: 'inherit' });
      console.log('package-lock.json updated');
    } catch (error) {
      console.error('Error updating package-lock.json:', error.message);
      process.exit(1);
    }
  }
}

function showHelp() {
  console.log(`
  Usage: node version-bump.js [package-bump] [font-bump] [options]
  
  Arguments:
    package-bump   Type of package version bump (major, minor, patch) [default: patch]
    font-bump      Type of font version bump (major, minor) [default: minor]
  
  Options:
    -c, --commit     Commit changes to git
    -t, --tag        Create a git tag (implies --commit)
    -p, --push       Push changes to remote (implies --commit)
    -i, --npm-install Run npm install to update package-lock.json
    -h, --help       Show this help message
  
  Examples:
    node version-bump.js                     # Bump patch package version and minor font version
    node version-bump.js minor major         # Bump minor package version and major font version
    node version-bump.js patch minor --commit # Bump versions and commit changes
    node version-bump.js --tag --push        # Bump versions, commit, tag, and push
  `);
}

// Check for help flag
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  showHelp();
  process.exit(0);
}

// Run the version bumping logic
bumpVersions();