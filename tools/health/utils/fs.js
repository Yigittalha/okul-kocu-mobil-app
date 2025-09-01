/**
 * File system utilities for health check system
 * Handles backups, zip creation, and git tagging
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Check if archiver is installed, and install if not
try {
  require('archiver');
} catch (error) {
  console.log('📦 Installing required dependency: archiver...');
  const { execSync } = require('child_process');
  execSync('npm install --save-dev archiver', {
    cwd: path.resolve(__dirname, '../../..'),
    stdio: 'inherit'
  });
}

// Now we can safely require archiver
const archiver = require('archiver');

// Root project directory
const PROJECT_ROOT = path.resolve(__dirname, '../../..');

// Directories to ignore in various checks
const IGNORE_DIRS = [
  'node_modules',
  '.expo',
  '.git',
  'tools/health/reports',
  'backups',
  'dist',
  'build',
  'web-build',
];

// Files to ignore in various checks
const IGNORE_FILES = [
  '.DS_Store',
  'yarn.lock',
  'package-lock.json',
  '*.log',
];

/**
 * Create a timestamped backup of the project
 * @returns {Object} Backup information
 */
async function createBackup() {
  // Create timestamp for backup identification
  const timestamp = new Date().toISOString()
    .replace(/:/g, '')
    .replace(/\..+/, '')
    .replace('T', '-');
  
  const backupTag = `health-${timestamp}`;
  const backupDir = path.join(PROJECT_ROOT, 'backups');
  const backupPath = path.join(backupDir, `${backupTag}.zip`);
  
  // Ensure backup directory exists
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  
  // Create backup zip
  await createZipBackup(backupPath);
  
  // Create git tag if git repository exists
  let gitTagCreated = false;
  try {
    if (fs.existsSync(path.join(PROJECT_ROOT, '.git'))) {
      createGitTag(backupTag);
      gitTagCreated = true;
    }
  } catch (err) {
    console.warn(`Could not create git tag: ${err.message}`);
  }

  return {
    timestamp,
    tag: backupTag,
    zipPath: backupPath,
    gitTagCreated
  };
}

/**
 * Create a zip backup of the project
 * @param {string} outputPath Path where the zip will be saved
 * @returns {Promise} Promise resolving when zip is created
 */
function createZipBackup(outputPath) {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outputPath);
    const archive = archiver('zip', {
      zlib: { level: 9 } // Maximum compression
    });
    
    output.on('close', () => {
      console.log(`📦 Created backup: ${outputPath} (${(archive.pointer() / 1024 / 1024).toFixed(2)}MB)`);
      resolve();
    });
    
    archive.on('error', (err) => {
      reject(err);
    });
    
    archive.pipe(output);
    
    // Add source files to archive (excluding node_modules, etc.)
    archive.glob('**/*', {
      cwd: PROJECT_ROOT,
      ignore: [
        ...IGNORE_DIRS.map(dir => `${dir}/**`),
        ...IGNORE_FILES,
        'backups/**', // Avoid recursive backup
      ]
    });
    
    archive.finalize();
  });
}

/**
 * Create a git tag for the current state
 * @param {string} tag Tag name
 */
function createGitTag(tag) {
  try {
    execSync(`git tag -f "${tag}"`, { 
      cwd: PROJECT_ROOT,
      stdio: ['ignore', 'pipe', 'pipe']
    });
    console.log(`🏷️  Created git tag: ${tag}`);
  } catch (err) {
    throw new Error(`Failed to create git tag: ${err.message}`);
  }
}

/**
 * Check if a file should be ignored by the health checks
 * @param {string} filePath Path to check
 * @returns {boolean} True if the file should be ignored
 */
function shouldIgnoreFile(filePath) {
  const relativePath = path.relative(PROJECT_ROOT, filePath);
  
  // Check if file is in an ignored directory
  if (IGNORE_DIRS.some(dir => relativePath.startsWith(dir + '/'))) {
    return true;
  }
  
  // Check if file matches an ignored pattern
  const filename = path.basename(filePath);
  if (IGNORE_FILES.some(pattern => {
    if (pattern.includes('*')) {
      const regex = new RegExp(pattern.replace('*', '.*'));
      return regex.test(filename);
    }
    return pattern === filename;
  })) {
    return true;
  }
  
  return false;
}

/**
 * Get all files in the project (with specified extensions)
 * @param {string[]} extensions File extensions to include (e.g., ['.js', '.jsx'])
 * @returns {string[]} Array of file paths
 */
function getAllProjectFiles(extensions = ['.js', '.jsx']) {
  const results = [];
  
  function scanDir(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      
      // Skip ignored files/dirs
      if (shouldIgnoreFile(fullPath)) {
        continue;
      }
      
      if (entry.isDirectory()) {
        scanDir(fullPath);
      } else if (extensions.includes(path.extname(entry.name))) {
        results.push(fullPath);
      }
    }
  }
  
  scanDir(PROJECT_ROOT);
  return results;
}

/**
 * Get file size in KB
 * @param {string} filePath Path to the file
 * @returns {number} File size in KB
 */
function getFileSizeInKB(filePath) {
  const stats = fs.statSync(filePath);
  return stats.size / 1024;
}

/**
 * Read file content
 * @param {string} filePath Path to the file
 * @returns {string} File content
 */
function readFileContent(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

/**
 * Write data to a file (ensuring directory exists)
 * @param {string} filePath Path to the file
 * @param {string|Object} data Data to write (object will be stringified)
 */
function writeFile(filePath, data) {
  const dir = path.dirname(filePath);
  
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  if (typeof data === 'object') {
    data = JSON.stringify(data, null, 2);
  }
  
  fs.writeFileSync(filePath, data);
}

module.exports = {
  createBackup,
  shouldIgnoreFile,
  getAllProjectFiles,
  getFileSizeInKB,
  readFileContent,
  writeFile,
  PROJECT_ROOT,
  IGNORE_DIRS,
  IGNORE_FILES
}; 