#!/usr/bin/env node
/**
 * Health Check System for React Native/Expo Projects
 * Non-destructive analysis of codebase health
 */

const fs = require('fs');
const path = require('path');
const util = require('util');
const { execSync } = require('child_process');

// Import rules and utilities
const rules = require('./rules');
const {
  createBackup,
  getAllProjectFiles,
  getFileSizeInKB,
  readFileContent,
  writeFile,
  PROJECT_ROOT
} = require('./utils/fs');

// Constants
const SRC_DIR = path.join(PROJECT_ROOT, 'src');
const PACKAGE_JSON_PATH = path.join(PROJECT_ROOT, 'package.json');

// Result containers
const results = {
  timestamp: new Date().toISOString(),
  summary: {
    errors: 0,
    warnings: 0,
    checkedFiles: 0,
  },
  fileSizes: { errors: [], warnings: [] },
  dependencies: { duplicates: [], unused: [] },
  imports: { unusedFiles: [], unusedExports: [], circularDeps: [] },
  codeQuality: { eslint: [], prettier: [] },
  security: { secrets: [] },
  navigation: { missingScreens: [], unusedScreens: [] },
  suggestions: [],
  patches: []
};

/**
 * Main health check function
 */
async function runHealthCheck() {
  console.log('🏥 Starting React Native/Expo Project Health Check...');
  
  try {
    // Step 1: Create backup
    const backupInfo = await createBackup();
    results.backup = backupInfo;
    
    // Step 2: Run all enabled checks
    await runAllChecks();
    
    // Step 3: Generate reports
    generateReports();
    
    // Final summary
    printSummary();
    
    // Exit with appropriate code
    process.exit(results.summary.errors > 0 ? 1 : 0);
  } catch (error) {
    console.error('❌ Health check failed:', error);
    process.exit(1);
  }
}

/**
 * Run all enabled health checks
 */
async function runAllChecks() {
  // Check file sizes
  if (rules.fileSizes.enabled) {
    await checkFileSizes();
  }
  
  // Check dependencies
  if (rules.dependencies.enabled) {
    await checkDependencies();
  }
  
  // Check imports and exports
  if (rules.imports.enabled) {
    await checkImports();
  }
  
  // Check code quality (ESLint, Prettier)
  if (rules.codeQuality.enabled) {
    await checkCodeQuality();
  }
  
  // Check for potential security issues
  if (rules.security.enabled) {
    await checkSecurity();
  }
  
  // Check navigation
  if (rules.navigation.enabled) {
    await checkNavigation();
  }
}

/**
 * Check file sizes against thresholds
 */
async function checkFileSizes() {
  console.log('📏 Checking file sizes...');
  
  const fileExtensions = ['.js', '.jsx', '.json', '.png', '.jpg', '.jpeg', '.gif', '.webp'];
  const files = getAllProjectFiles(fileExtensions);
  results.summary.checkedFiles += files.length;
  
  for (const filePath of files) {
    const ext = path.extname(filePath).substring(1); // Remove the dot
    const fileSize = getFileSizeInKB(filePath);
    const relativePath = path.relative(PROJECT_ROOT, filePath);
    
    let ruleCategory = ext;
    if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext)) {
      ruleCategory = 'image';
    } else if (!rules.fileSizes.rules[ext]) {
      ruleCategory = 'js'; // Default to JS rules for unknown extensions
    }
    
    const rule = rules.fileSizes.rules[ruleCategory];
    
    if (rule && fileSize > rule.error) {
      results.fileSizes.errors.push({
        path: relativePath,
        size: fileSize.toFixed(1),
        threshold: rule.error,
        suggestion: `Consider breaking ${relativePath} into smaller files or optimizing its content.`
      });
      results.summary.errors++;
    } else if (rule && fileSize > rule.warn) {
      results.fileSizes.warnings.push({
        path: relativePath,
        size: fileSize.toFixed(1),
        threshold: rule.warn,
        suggestion: `${relativePath} is larger than recommended. Consider refactoring if possible.`
      });
      results.summary.warnings++;
    }
  }
}

/**
 * Check dependencies for issues (duplicate, unused)
 */
async function checkDependencies() {
  console.log('📦 Checking dependencies...');
  
  if (!fs.existsSync(PACKAGE_JSON_PATH)) {
    console.warn('⚠️ package.json not found, skipping dependency checks');
    return;
  }
  
  const packageJson = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, 'utf8'));
  const dependencies = { ...packageJson.dependencies || {}, ...packageJson.devDependencies || {} };
  const depNames = Object.keys(dependencies);
  
  // Check for duplicate dependencies with different versions
  if (rules.dependencies.duplicates.enabled) {
    try {
      // Use npm to check for duplicate dependencies
      const npmLsOutput = execSync('npm ls --all --json', { 
        cwd: PROJECT_ROOT,
        stdio: ['ignore', 'pipe', 'ignore']
      }).toString();
      
      const npmLsData = JSON.parse(npmLsOutput);
      const duplicates = findDuplicateDeps(npmLsData);
      
      results.dependencies.duplicates = duplicates;
      results.summary.warnings += duplicates.length;
      
      for (const duplicate of duplicates) {
        results.suggestions.push(`Duplicate dependency: ${duplicate.name} (${duplicate.versions.join(', ')})`);
      }
    } catch (error) {
      console.warn('⚠️ Could not check for duplicate dependencies:', error.message);
    }
  }
  
  // Check for unused dependencies (simplified, may have false positives)
  if (rules.dependencies.unused.enabled) {
    const jsFiles = getAllProjectFiles(['.js', '.jsx']);
    const importPatterns = depNames.map(name => {
      // Convert scoped packages like @babel/core to pattern @babel[\\/]core
      const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        .replace(/\//g, '[/\\\\]');
      return new RegExp(`(from\\s+['"]${escapedName}['"]|require\\s*\\(\\s*['"]${escapedName}['"])`);
    });
    
    const usedDeps = new Set();
    
    // Check all files for imports
    for (const file of jsFiles) {
      const content = readFileContent(file);
      
      for (let i = 0; i < depNames.length; i++) {
        if (importPatterns[i].test(content)) {
          usedDeps.add(depNames[i]);
        }
      }
    }
    
    // Find unused dependencies
    const unusedDeps = depNames.filter(dep => {
      // Skip certain types of dependencies that might not have explicit imports
      if (dep.startsWith('@types/') || 
          dep === 'react' || 
          dep === 'react-native' ||
          dep === 'expo') {
        return false;
      }
      return !usedDeps.has(dep);
    });
    
    results.dependencies.unused = unusedDeps.map(name => ({
      name,
      suggestion: `No imports found for ${name}. Verify if it's actually used.`
    }));
    
    results.summary.warnings += unusedDeps.length;
  }
}

/**
 * Find duplicate dependencies from npm ls output
 */
function findDuplicateDeps(npmLsData) {
  const duplicates = [];
  const depVersions = {};
  
  function traverseDeps(deps, path = []) {
    if (!deps) return;
    
    Object.keys(deps).forEach(name => {
      if (!deps[name].dependencies) return;
      
      const currentPath = [...path, name];
      if (!depVersions[name]) {
        depVersions[name] = [];
      }
      
      const version = deps[name].version;
      if (version && !depVersions[name].includes(version)) {
        depVersions[name].push(version);
      }
      
      traverseDeps(deps[name].dependencies, currentPath);
    });
  }
  
  traverseDeps(npmLsData.dependencies);
  
  // Find deps with multiple versions
  Object.keys(depVersions).forEach(name => {
    if (depVersions[name].length > 1) {
      duplicates.push({
        name,
        versions: depVersions[name]
      });
    }
  });
  
  return duplicates;
}

/**
 * Check imports for issues (unused files, circular deps)
 */
async function checkImports() {
  console.log('🔄 Checking imports...');
  
  // Only check source files
  if (!fs.existsSync(SRC_DIR)) {
    console.warn('⚠️ src directory not found, skipping import checks');
    return;
  }
  
  const jsFiles = getAllProjectFiles(['.js', '.jsx'])
    .filter(file => file.startsWith(SRC_DIR));
  
  const importMap = {};
  const exportMap = {};
  
  // Parse all imports and exports
  for (const file of jsFiles) {
    const content = readFileContent(file);
    const relativePath = path.relative(PROJECT_ROOT, file);
    
    // Track imports from this file
    importMap[relativePath] = extractImports(content, path.dirname(file));
    
    // Track exports from this file
    exportMap[relativePath] = extractExports(content);
  }
  
  // Check for unused files (not imported anywhere)
  if (rules.imports.unusedFiles.enabled) {
    const allImportedFiles = new Set();
    
    // Collect all imported files
    Object.values(importMap).forEach(imports => {
      imports.forEach(imp => {
        if (imp.path) allImportedFiles.add(imp.path);
      });
    });
    
    // Find files not imported anywhere (except index files and screens)
    const potentiallyUnusedFiles = Object.keys(importMap)
      .filter(file => {
        // Skip index files and navigation/screen files - they're often entry points
        if (path.basename(file) === 'index.js') return false;
        if (file.includes('Screen') || file.includes('screens/') || file.includes('navigation/')) return false;
        // Skip App.js and main entry points
        if (file === 'App.js' || file.endsWith('index.js')) return false;
        
        return !allImportedFiles.has(file);
      });
    
    results.imports.unusedFiles = potentiallyUnusedFiles.map(file => ({
      path: file,
      suggestion: `${file} is not imported anywhere. Check if it's still needed.`
    }));
    
    results.summary.warnings += potentiallyUnusedFiles.length;
  }
  
  // Check for circular dependencies
  if (rules.imports.circularDependencies.enabled) {
    const circularDeps = findCircularDependencies(importMap);
    
    results.imports.circularDeps = circularDeps.map(cycle => ({
      cycle,
      suggestion: `Circular dependency: ${cycle.join(' -> ')}. Consider restructuring.`
    }));
    
    results.summary.errors += circularDeps.length;
  }
  
  // Check for unused exports (simplified approach, may have false positives)
  if (rules.imports.unusedExports.enabled) {
    // Not implemented yet due to complexity
    // This would require more sophisticated parsing to be accurate
  }
}

/**
 * Extract imports from file content
 */
function extractImports(content, baseDir) {
  const imports = [];
  
  // Match ES6 imports: import X from 'path'
  const es6ImportRegex = /import\s+(?:[\w\s{},*]*)\s+from\s+['"]([^'"]+)['"]/g;
  let match;
  
  while ((match = es6ImportRegex.exec(content)) !== null) {
    const importPath = match[1];
    
    // Handle only relative imports
    if (importPath.startsWith('.')) {
      let fullPath = path.resolve(baseDir, importPath);
      
      // Handle JS extensions
      if (!path.extname(fullPath)) {
        // Try to resolve with extensions
        for (const ext of ['.js', '.jsx']) {
          if (fs.existsSync(fullPath + ext)) {
            fullPath += ext;
            break;
          }
        }
      }
      
      imports.push({
        type: 'es6',
        raw: match[0],
        path: path.relative(PROJECT_ROOT, fullPath)
      });
    } else {
      // Non-relative (node_modules) import
      imports.push({
        type: 'es6',
        raw: match[0],
        module: importPath
      });
    }
  }
  
  // Match CommonJS requires: const x = require('path')
  const cjsImportRegex = /(?:const|let|var)\s+(?:[\w\s{},*]*)\s+=\s+require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
  
  while ((match = cjsImportRegex.exec(content)) !== null) {
    const importPath = match[1];
    
    if (importPath.startsWith('.')) {
      let fullPath = path.resolve(baseDir, importPath);
      
      // Handle JS extensions
      if (!path.extname(fullPath)) {
        // Try to resolve with extensions
        for (const ext of ['.js', '.jsx']) {
          if (fs.existsSync(fullPath + ext)) {
            fullPath += ext;
            break;
          }
        }
      }
      
      imports.push({
        type: 'commonjs',
        raw: match[0],
        path: path.relative(PROJECT_ROOT, fullPath)
      });
    } else {
      // Non-relative (node_modules) import
      imports.push({
        type: 'commonjs',
        raw: match[0],
        module: importPath
      });
    }
  }
  
  return imports;
}

/**
 * Extract exports from file content
 */
function extractExports(content) {
  const exports = [];
  
  // Match various export patterns (simplified)
  const exportPatterns = [
    // Named exports: export const foo = ...
    /export\s+(?:const|let|var|function)\s+(\w+)/g,
    // Default exports: export default ...
    /export\s+default\s+(?:function\s+)?(\w+)?/g,
    // Export from: export { x } from ...
    /export\s+\{([^}]+)\}\s+from/g
  ];
  
  for (const pattern of exportPatterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      if (match[1]) {
        exports.push({
          name: match[1].trim(),
          raw: match[0]
        });
      } else {
        exports.push({
          name: 'default',
          raw: match[0]
        });
      }
    }
  }
  
  return exports;
}

/**
 * Find circular dependencies in import map
 */
function findCircularDependencies(importMap) {
  const cycles = [];
  
  function detectCycle(file, visited = new Set(), stack = []) {
    if (!importMap[file]) return;
    
    if (stack.includes(file)) {
      const cycle = [...stack.slice(stack.indexOf(file)), file];
      cycles.push(cycle);
      return;
    }
    
    if (visited.has(file)) return;
    visited.add(file);
    
    stack.push(file);
    for (const imp of importMap[file]) {
      if (imp.path) {
        detectCycle(imp.path, visited, [...stack]);
      }
    }
    stack.pop();
  }
  
  Object.keys(importMap).forEach(file => {
    detectCycle(file);
  });
  
  return cycles;
}

/**
 * Check code quality using ESLint and Prettier
 */
async function checkCodeQuality() {
  console.log('🧹 Checking code quality...');
  
  // Run ESLint (if available)
  if (rules.codeQuality.eslint.enabled) {
    try {
      // Check if ESLint is installed
      const eslintPath = path.join(PROJECT_ROOT, 'node_modules', '.bin', 'eslint');
      if (!fs.existsSync(eslintPath)) {
        console.warn('⚠️ ESLint not found in node_modules, skipping ESLint checks');
      } else {
        try {
          // Run ESLint in check mode (report only, no fixes)
          const sourceDir = path.relative(PROJECT_ROOT, SRC_DIR);
          const eslintOutput = execSync(`${eslintPath} --no-fix --format json ${sourceDir}`, {
            cwd: PROJECT_ROOT,
            stdio: ['ignore', 'pipe', 'pipe'],
            encoding: 'utf8'
          });
          
          try {
            const eslintResult = JSON.parse(eslintOutput);
            
            for (const file of eslintResult) {
              const relativePath = path.relative(PROJECT_ROOT, file.filePath);
              
              for (const message of file.messages) {
                const severity = message.severity === 2 ? 'error' : 'warning';
                
                results.codeQuality.eslint.push({
                  path: relativePath,
                  line: message.line,
                  column: message.column,
                  rule: message.ruleId,
                  message: message.message,
                  severity
                });
                
                if (severity === 'error') {
                  results.summary.errors++;
                } else {
                  results.summary.warnings++;
                }
              }
            }
          } catch (parseError) {
            console.warn('⚠️ Could not parse ESLint output');
          }
        } catch (eslintError) {
          console.warn(`⚠️ ESLint execution failed: ${eslintError.message}`);
          
          // Add a suggestion to install ESLint config
          results.suggestions.push({
            title: 'ESLint configuration missing',
            description: 'Consider adding ESLint configuration for better code quality checks',
            suggestion: 'Run `npm init @eslint/config` to set up ESLint for your project'
          });
        }
      }
    } catch (error) {
      // Don't fail if ESLint fails
      console.warn('⚠️ ESLint check failed:', error.message);
    }
  }
  
  // Run Prettier (if available)
  if (rules.codeQuality.prettier.enabled) {
    try {
      // Check if Prettier is installed
      const prettierPath = path.join(PROJECT_ROOT, 'node_modules', '.bin', 'prettier');
      if (!fs.existsSync(prettierPath)) {
        console.warn('⚠️ Prettier not found in node_modules, skipping Prettier checks');
      } else {
        try {
          // Run Prettier in check mode
          const sourceDir = path.relative(PROJECT_ROOT, SRC_DIR);
          const prettierOutput = execSync(`${prettierPath} --check "${sourceDir}/**/*.{js,jsx,json}" 2>&1 || true`, {
            cwd: PROJECT_ROOT,
            stdio: ['ignore', 'pipe', 'pipe'],
            encoding: 'utf8',
            shell: true
          });
          
          // Check for unformatted files in the output
          const unformattedFiles = prettierOutput
            .split('\n')
            .filter(line => line.includes('[warn]'))
            .map(line => {
              const match = line.match(/\[warn\] (.+)$/);
              return match ? match[1].trim() : null;
            })
            .filter(Boolean);
          
          for (const file of unformattedFiles) {
            results.codeQuality.prettier.push({
              path: file,
              message: 'File is not formatted according to Prettier rules',
              severity: 'warning'
            });
            
            results.summary.warnings++;
            
            // Add a patch suggestion
            results.patches.push({
              title: `Format ${file} with Prettier`,
              description: 'Run Prettier on this file to ensure consistent formatting',
              command: `npx prettier --write "${file}"`
            });
          }
        } catch (prettierError) {
          console.warn(`⚠️ Prettier execution failed: ${prettierError.message}`);
        }
      }
    } catch (error) {
      // Don't fail if Prettier fails
      console.warn('⚠️ Prettier check failed:', error.message);
    }
  }
}

/**
 * Check for security issues
 */
async function checkSecurity() {
  console.log('🔒 Checking for security issues...');
  
  // Check for potential secrets in code
  if (rules.security.secrets.enabled) {
    const jsFiles = getAllProjectFiles(['.js', '.jsx', '.json']);
    
    for (const file of jsFiles) {
      const content = readFileContent(file);
      const relativePath = path.relative(PROJECT_ROOT, file);
      
      // Skip node_modules
      if (relativePath.includes('node_modules/')) {
        continue;
      }
      
      // Check against secret patterns
      if (Array.isArray(rules.security.secrets.patterns)) {
        for (const pattern of rules.security.secrets.patterns) {
          const matches = content.match(pattern);
          
          if (matches) {
            results.security.secrets.push({
              path: relativePath,
              pattern: pattern.toString(),
              message: 'Potential secret or credential found in code',
              suggestion: 'Consider using environment variables instead of hardcoded secrets'
            });
            
            results.summary.errors++;
          }
        }
      }
    }
  }
}

/**
 * Check navigation for issues
 */
async function checkNavigation() {
  console.log('🧭 Checking navigation...');
  
  // Check for navigation-related files
  const navDir = path.join(SRC_DIR, 'navigation');
  if (!fs.existsSync(navDir)) {
    console.log('ℹ️ No navigation directory found, skipping navigation checks');
    return;
  }
  
  const navFiles = getAllProjectFiles(['.js', '.jsx'])
    .filter(file => file.startsWith(navDir));
  
  // Very simple check for screen references
  const definedScreens = new Set();
  const referencedScreens = new Set();
  
  for (const file of navFiles) {
    const content = readFileContent(file);
    
    // Extract screen names defined with <Stack.Screen name="ScreenName" component={Component} />
    const screenDefRegex = /<Stack\.Screen\s+name=["']([^"']+)["']/g;
    let match;
    while ((match = screenDefRegex.exec(content)) !== null) {
      definedScreens.add(match[1]);
    }
    
    // Extract screen names referenced with navigation.navigate("ScreenName")
    const screenRefRegex = /navigate\(["']([^"']+)["']/g;
    while ((match = screenRefRegex.exec(content)) !== null) {
      referencedScreens.add(match[1]);
    }
  }
  
  // Find screens referenced but not defined
  if (rules.navigation.missingScreens.enabled) {
    for (const screen of referencedScreens) {
      if (!definedScreens.has(screen)) {
        results.navigation.missingScreens.push({
          screen,
          message: `Screen "${screen}" is referenced but not defined`,
          severity: 'warning'
        });
        
        results.summary.warnings++;
      }
    }
  }
  
  // Find screens defined but not referenced
  if (rules.navigation.unusedScreens.enabled) {
    for (const screen of definedScreens) {
      if (!referencedScreens.has(screen)) {
        results.navigation.unusedScreens.push({
          screen,
          message: `Screen "${screen}" is defined but not referenced anywhere`,
          severity: 'warning'
        });
        
        results.summary.warnings++;
      }
    }
  }
}

/**
 * Generate reports in JSON and Markdown formats
 */
function generateReports() {
  const timestamp = new Date().toISOString()
    .replace(/:/g, '')
    .replace(/\..+/, '')
    .replace('T', '-');
  
  const jsonReportPath = path.join(PROJECT_ROOT, 'tools', 'health', 'reports', `health-${timestamp}.json`);
  const mdReportPath = path.join(PROJECT_ROOT, 'tools', 'health', 'reports', `health-${timestamp}.md`);
  
  // Generate JSON report
  if (rules.output.jsonReport) {
    writeFile(jsonReportPath, results);
    console.log(`📄 JSON report written to: ${path.relative(PROJECT_ROOT, jsonReportPath)}`);
  }
  
  // Generate Markdown report
  if (rules.output.mdReport) {
    const mdReport = generateMarkdownReport(results, timestamp);
    writeFile(mdReportPath, mdReport);
    console.log(`📄 Markdown report written to: ${path.relative(PROJECT_ROOT, mdReportPath)}`);
  }
}

/**
 * Generate a Markdown report from the results
 */
function generateMarkdownReport(results, timestamp) {
  let md = `# React Native Project Health Check Report\n\n`;
  md += `**Generated:** ${new Date().toISOString().replace('T', ' ').substr(0, 19)}\n\n`;
  
  // Summary section
  md += `## Summary\n\n`;
  md += `- **Errors:** ${results.summary.errors}\n`;
  md += `- **Warnings:** ${results.summary.warnings}\n`;
  md += `- **Files checked:** ${results.summary.checkedFiles}\n`;
  md += `- **Backup created:** ${results.backup.zipPath} (Tag: \`${results.backup.tag}\`)\n\n`;
  
  // File size issues
  if (results.fileSizes.errors.length || results.fileSizes.warnings.length) {
    md += `## File Size Issues\n\n`;
    
    if (results.fileSizes.errors.length) {
      md += `### Errors\n\n`;
      md += `| File | Size (KB) | Threshold (KB) |\n`;
      md += `| ---- | -------- | -------------- |\n`;
      for (const issue of results.fileSizes.errors) {
        md += `| ${issue.path} | ${issue.size} | ${issue.threshold} |\n`;
      }
      md += `\n`;
    }
    
    if (results.fileSizes.warnings.length) {
      md += `### Warnings\n\n`;
      md += `| File | Size (KB) | Threshold (KB) |\n`;
      md += `| ---- | -------- | -------------- |\n`;
      for (const issue of results.fileSizes.warnings) {
        md += `| ${issue.path} | ${issue.size} | ${issue.threshold} |\n`;
      }
      md += `\n`;
    }
  }
  
  // Dependency issues
  if (results.dependencies.duplicates.length || results.dependencies.unused.length) {
    md += `## Dependency Issues\n\n`;
    
    if (results.dependencies.duplicates.length) {
      md += `### Duplicate Dependencies\n\n`;
      md += `| Package | Versions |\n`;
      md += `| ------- | -------- |\n`;
      for (const dup of results.dependencies.duplicates) {
        md += `| ${dup.name} | ${dup.versions.join(', ')} |\n`;
      }
      md += `\n`;
    }
    
    if (results.dependencies.unused.length) {
      md += `### Potentially Unused Dependencies\n\n`;
      md += `These dependencies might not be directly imported in your code. Verify if they're used:\n\n`;
      md += `- ${results.dependencies.unused.map(dep => dep.name).join('\n- ')}\n\n`;
    }
  }
  
  // Import issues
  if (results.imports.unusedFiles.length || results.imports.circularDeps.length) {
    md += `## Import Issues\n\n`;
    
    if (results.imports.unusedFiles.length) {
      md += `### Potentially Unused Files\n\n`;
      md += `These files aren't imported anywhere (they might be used in ways not detectable by the tool):\n\n`;
      md += `- ${results.imports.unusedFiles.map(file => file.path).join('\n- ')}\n\n`;
    }
    
    if (results.imports.circularDeps.length) {
      md += `### Circular Dependencies\n\n`;
      for (const cycle of results.imports.circularDeps) {
        md += `- ${cycle.cycle.join(' → ')}\n`;
      }
      md += `\n`;
    }
  }
  
  // ESLint issues
  if (results.codeQuality.eslint.length) {
    md += `## ESLint Issues\n\n`;
    md += `| File | Line | Rule | Message | Severity |\n`;
    md += `| ---- | ---- | ---- | ------- | -------- |\n`;
    
    // Group by file first
    const byFile = {};
    for (const issue of results.codeQuality.eslint) {
      if (!byFile[issue.path]) byFile[issue.path] = [];
      byFile[issue.path].push(issue);
    }
    
    // Show max 50 issues to keep report manageable
    let count = 0;
    for (const file of Object.keys(byFile)) {
      for (const issue of byFile[file]) {
        md += `| ${issue.path} | ${issue.line}:${issue.column} | ${issue.rule} | ${issue.message} | ${issue.severity} |\n`;
        count++;
        if (count >= 50) {
          md += `\n_...and ${results.codeQuality.eslint.length - 50} more issues_\n`;
          break;
        }
      }
      if (count >= 50) break;
    }
    md += `\n`;
  }
  
  // Prettier issues
  if (results.codeQuality.prettier.length) {
    md += `## Prettier Formatting Issues\n\n`;
    md += `| File | Message |\n`;
    md += `| ---- | ------- |\n`;
    
    for (const issue of results.codeQuality.prettier) {
      md += `| ${issue.path} | ${issue.message} |\n`;
    }
    md += `\n`;
  }
  
  // Security issues
  if (results.security.secrets.length) {
    md += `## Security Issues\n\n`;
    md += `### Potential Secrets in Code\n\n`;
    md += `| File | Message |\n`;
    md += `| ---- | ------- |\n`;
    
    for (const issue of results.security.secrets) {
      md += `| ${issue.path} | ${issue.message} |\n`;
    }
    md += `\n`;
  }
  
  // Navigation issues
  if (results.navigation.missingScreens.length || results.navigation.unusedScreens.length) {
    md += `## Navigation Issues\n\n`;
    
    if (results.navigation.missingScreens.length) {
      md += `### Referenced Screens Not Defined\n\n`;
      md += `- ${results.navigation.missingScreens.map(screen => screen.screen).join('\n- ')}\n\n`;
    }
    
    if (results.navigation.unusedScreens.length) {
      md += `### Defined Screens Not Referenced\n\n`;
      md += `- ${results.navigation.unusedScreens.map(screen => screen.screen).join('\n- ')}\n\n`;
    }
  }
  
  // Suggested patches
  if (results.patches.length) {
    md += `## Suggested Patches\n\n`;
    
    for (let i = 0; i < results.patches.length; i++) {
      const patch = results.patches[i];
      md += `### ${i + 1}. ${patch.title}\n\n`;
      md += `${patch.description}\n\n`;
      md += `\`\`\`bash\n${patch.command}\n\`\`\`\n\n`;
    }
  }
  
  // Footer
  md += `---\n\n`;
  md += `*This report was generated by the Health Check tool. It's a non-destructive analysis and no changes were made to your code.*\n`;
  
  return md;
}

/**
 * Print summary to console
 */
function printSummary() {
  console.log('\n📊 Health Check Summary:');
  console.log(`- Errors: ${results.summary.errors}`);
  console.log(`- Warnings: ${results.summary.warnings}`);
  console.log(`- Files checked: ${results.summary.checkedFiles}`);
  
  if (results.summary.errors > 0) {
    console.log('\n❌ Critical issues found!');
    console.log(`Check the report for details: tools/health/reports/health-${results.timestamp.substring(0, 10)}-*.md`);
  } else if (results.summary.warnings > 0) {
    console.log('\n⚠️ Warnings found.');
    console.log(`Check the report for details: tools/health/reports/health-${results.timestamp.substring(0, 10)}-*.md`);
  } else {
    console.log('\n✅ No issues found. Your project is in good health!');
  }
}

// Run the health check
runHealthCheck(); 