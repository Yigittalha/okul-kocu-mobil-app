/**
 * Health Check Rules Configuration
 * Defines rules and thresholds for the health check system
 */

module.exports = {
  // File size checks (in KB)
  fileSizes: {
    enabled: true,
    rules: {
      js: {
        warn: 100,   // Warn for JS files larger than 100 KB
        error: 300   // Error for JS files larger than 300 KB
      },
      jsx: {
        warn: 100,   // Warn for JSX files larger than 100 KB
        error: 300   // Error for JSX files larger than 300 KB
      },
      json: {
        warn: 200,   // Warn for JSON files larger than 200 KB
        error: 500   // Error for JSON files larger than 500 KB
      },
      image: {        // Image files (png, jpg, jpeg, gif, webp)
        warn: 500,    // Warn for images larger than 500 KB
        error: 2000   // Error for images larger than 2 MB
      }
    }
  },
  
  // Dependency checks
  dependencies: {
    enabled: true,
    duplicates: {
      enabled: true  // Check for duplicate dependencies
    },
    unused: {
      enabled: true  // Check for unused dependencies (those not imported anywhere)
    }
  },
  
  // Import analysis
  imports: {
    enabled: true,
    unusedFiles: {
      enabled: true,   // Check for JS files not imported anywhere (starting from src/)
    },
    unusedExports: {
      enabled: true    // Check for exported functions/variables not used anywhere
    },
    circularDependencies: {
      enabled: true    // Check for circular dependencies
    }
  },
  
  // Code quality checks
  codeQuality: {
    enabled: true,
    eslint: {
      enabled: true,    // Run ESLint in check mode
      configPath: null  // Use project's ESLint config (null = auto-detect)
    },
    prettier: {
      enabled: true,    // Run Prettier in check mode
      configPath: null  // Use project's Prettier config (null = auto-detect)
    }
  },
  
  // Security checks
  security: {
    enabled: true,
    secrets: {
      enabled: true,      // Check for potential secrets/credentials in code
      patterns: [
        // Common API keys and tokens
        /(['"`])?(api|secret|token|key|password|auth|credential)([A-Z0-9][_a-zA-Z0-9]+)(['"`])?\s*[=:]\s*(['"`][a-zA-Z0-9_\-./=+]{16,}['"`])/i,
        // AWS keys
        /(['"`])?AWS(Secret)?([A-Za-z0-9]+)(['"`])?\s*[=:]\s*(['"`][A-Za-z0-9/+=]{16,}['"`])/i,
        // Firebase config
        /firebase(Config|ApiKey)/i,
        // Tokens and keys with specific formats
        /(gh[a-z0-9]{36}|ey[a-zA-Z0-9]{30,})/
      ]
    }
  },
  
  // Navigation checks
  navigation: {
    enabled: true,
    missingScreens: {
      enabled: true    // Check for screens referenced but not defined
    },
    unusedScreens: {
      enabled: true    // Check for screens defined but not used
    }
  },
  
  // Output settings
  output: {
    jsonReport: true,   // Generate JSON report
    mdReport: true      // Generate Markdown report
  }
}; 