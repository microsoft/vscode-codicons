#!/usr/bin/env node

/**
 * This script checks which icons are missing metadata and reports them.
 * It helps maintain the metadata.json file by identifying gaps.
 */

const fs = require('fs');
const path = require('path');

// Load the mapping file to get all icon names
const mappingPath = path.join(__dirname, '..', 'src', 'template', 'mapping.json');
const metadataPath = path.join(__dirname, '..', 'src', 'template', 'metadata.json');

if (!fs.existsSync(mappingPath)) {
    console.error('Error: mapping.json not found at', mappingPath);
    process.exit(1);
}

if (!fs.existsSync(metadataPath)) {
    console.error('Error: metadata.json not found at', metadataPath);
    process.exit(1);
}

const mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));
const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));

// Collect all unique icon names from mapping
const allIconNames = new Set();
Object.values(mapping).forEach(aliases => {
    // For each code point, add the first alias (primary name)
    if (aliases && aliases.length > 0) {
        allIconNames.add(aliases[0]);
    }
});

// Find icons without metadata
const missingMetadata = [];
allIconNames.forEach(iconName => {
    if (!metadata[iconName]) {
        missingMetadata.push(iconName);
    }
});

// Find metadata for icons that don't exist
const orphanedMetadata = [];
Object.keys(metadata).forEach(iconName => {
    if (!allIconNames.has(iconName)) {
        orphanedMetadata.push(iconName);
    }
});

// Report results
console.log('='.repeat(60));
console.log('Icon Metadata Coverage Report');
console.log('='.repeat(60));
console.log();

console.log(`Total icons: ${allIconNames.size}`);
console.log(`Icons with metadata: ${allIconNames.size - missingMetadata.length}`);
console.log(`Coverage: ${Math.round(((allIconNames.size - missingMetadata.length) / allIconNames.size) * 100)}%`);
console.log();

if (missingMetadata.length > 0) {
    console.log(`Icons missing metadata (${missingMetadata.length}):`);
    console.log('-'.repeat(60));
    missingMetadata.sort().forEach(name => {
        console.log(`  - ${name}`);
    });
    console.log();
}

if (orphanedMetadata.length > 0) {
    console.log(`Metadata entries for non-existent icons (${orphanedMetadata.length}):`);
    console.log('-'.repeat(60));
    orphanedMetadata.sort().forEach(name => {
        console.log(`  - ${name}`);
    });
    console.log();
}

if (missingMetadata.length === 0 && orphanedMetadata.length === 0) {
    console.log('✓ All icons have metadata and no orphaned entries found!');
    console.log();
}

// Validate existing metadata structure
const invalidEntries = [];
Object.entries(metadata).forEach(([name, meta]) => {
    const issues = [];
    
    if (!meta.tags || !Array.isArray(meta.tags)) {
        issues.push('missing or invalid tags array');
    } else if (meta.tags.length === 0) {
        issues.push('empty tags array');
    }
    
    if (!meta.category || typeof meta.category !== 'string') {
        issues.push('missing or invalid category');
    }
    
    if (!meta.description || typeof meta.description !== 'string') {
        issues.push('missing or invalid description');
    }
    
    if (issues.length > 0) {
        invalidEntries.push({ name, issues });
    }
});

if (invalidEntries.length > 0) {
    console.log(`Metadata entries with validation issues (${invalidEntries.length}):`);
    console.log('-'.repeat(60));
    invalidEntries.forEach(({ name, issues }) => {
        console.log(`  - ${name}:`);
        issues.forEach(issue => {
            console.log(`      * ${issue}`);
        });
    });
    console.log();
}

// Exit with error if there are missing entries
if (missingMetadata.length > 0 || orphanedMetadata.length > 0 || invalidEntries.length > 0) {
    process.exit(1);
}
