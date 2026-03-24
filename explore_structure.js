const fs = require('fs');
const path = require('path');

function exploreDirectory(dirPath, maxDepth = 3, currentDepth = 0) {
  if (currentDepth >= maxDepth) return {};
  
  try {
    const items = fs.readdirSync(dirPath);
    const result = {};
    
    for (const item of items) {
      if (item.startsWith('.') && item !== '.') continue;
      
      const itemPath = path.join(dirPath, item);
      const stats = fs.statSync(itemPath);
      
      if (stats.isDirectory()) {
        result[item] = exploreDirectory(itemPath, maxDepth, currentDepth + 1);
      } else if (item.endsWith('.json') || item.endsWith('.config.js') || item.endsWith('.config.ts')) {
        result[item] = 'FILE';
      }
    }
    return result;
  } catch (error) {
    return { error: error.message };
  }
}

function findPackageJsonFiles(rootPath, maxDepth = 4, currentDepth = 0) {
  if (currentDepth >= maxDepth) return [];
  
  const packageJsons = [];
  try {
    const items = fs.readdirSync(rootPath);
    
    for (const item of items) {
      if (item.startsWith('.') && item !== '.') continue;
      
      const itemPath = path.join(rootPath, item);
      const stats = fs.statSync(itemPath);
      
      if (stats.isFile() && item === 'package.json') {
        try {
          const content = JSON.parse(fs.readFileSync(itemPath, 'utf8'));
          packageJsons.push({
            path: itemPath,
            name: content.name || 'unnamed',
            scripts: content.scripts || {},
            dependencies: Object.keys(content.dependencies || {}),
            devDependencies: Object.keys(content.devDependencies || {})
          });
        } catch (e) {
          packageJsons.push({ path: itemPath, error: e.message });
        }
      } else if (stats.isDirectory()) {
        packageJsons.push(...findPackageJsonFiles(itemPath, maxDepth, currentDepth + 1));
      }
    }
  } catch (error) {
    packageJsons.push({ path: rootPath, error: error.message });
  }
  
  return packageJsons;
}

// Explore the repository structure
console.log('=== Repository Structure ===');
const structure = exploreDirectory('/home/runner/work/riddle-rush-mono-repo/riddle-rush-mono-repo');
console.log(JSON.stringify(structure, null, 2));

console.log('\n=== Package.json Files ===');
const packageJsons = findPackageJsonFiles('/home/runner/work/riddle-rush-mono-repo/riddle-rush-mono-repo');
packageJsons.forEach((pkg, index) => {
  console.log(`\n${index + 1}. ${pkg.path}`);
  if (pkg.error) {
    console.log(`   Error: ${pkg.error}`);
  } else {
    console.log(`   Name: ${pkg.name}`);
    console.log(`   Scripts: ${Object.keys(pkg.scripts).join(', ')}`);
    console.log(`   Dependencies: ${pkg.dependencies.slice(0, 10).join(', ')}${pkg.dependencies.length > 10 ? '...' : ''}`);
    console.log(`   DevDependencies: ${pkg.devDependencies.slice(0, 10).join(', ')}${pkg.devDependencies.length > 10 ? '...' : ''}`);
  }
});

console.log('\n=== Looking for Playwright Config ===');
function findPlaywrightConfig(rootPath) {
  const configs = [];
  try {
    const items = fs.readdirSync(rootPath);
    for (const item of items) {
      const itemPath = path.join(rootPath, item);
      if (fs.statSync(itemPath).isFile() && 
          (item.includes('playwright') || item.includes('e2e')) &&
          (item.endsWith('.config.js') || item.endsWith('.config.ts'))) {
        configs.push(itemPath);
      }
    }
    
    // Also check subdirectories
    for (const item of items) {
      const itemPath = path.join(rootPath, item);
      if (fs.statSync(itemPath).isDirectory() && !item.startsWith('.')) {
        configs.push(...findPlaywrightConfig(itemPath));
      }
    }
  } catch (error) {
    // Ignore errors for now
  }
  return configs;
}

const playwrightConfigs = findPlaywrightConfig('/home/runner/work/riddle-rush-mono-repo/riddle-rush-mono-repo');
playwrightConfigs.forEach(config => {
  console.log(config);
  try {
    const content = fs.readFileSync(config, 'utf8');
    console.log(`Content (first 500 chars): ${content.substring(0, 500)}...`);
  } catch (e) {
    console.log(`Error reading: ${e.message}`);
  }
});