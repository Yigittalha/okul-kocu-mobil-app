# React Native Project Health Check Tool

A non-destructive health analysis tool for React Native/Expo projects. The tool performs various checks on your codebase and generates detailed reports without modifying your code.

## Features

- **Zero-Modification Approach**: Your code remains unchanged
- **Automatic Backups**: Creates a zip backup and git tag before running checks
- **Comprehensive Checks**:
  - File sizes (identifies large files)
  - Dependencies (duplicates, potentially unused)
  - Imports (circular dependencies, unused files)
  - Code quality (ESLint, Prettier in check mode only)
  - Security (basic secret patterns)
  - Navigation sanity (missing/unused screens)
- **Detailed Reports**: Generated in both JSON and Markdown formats

## How to Use

Run the health check with:

```bash
npm run health:check
```

This will:
1. Create a backup at `/backups/health-YYYYMMDD-HHMMSS.zip` and a git tag
2. Run all checks in read-only mode
3. Generate reports in the `tools/health/reports/` directory

## Reports

Reports are saved in two formats:

1. **JSON**: `tools/health/reports/health-<timestamp>.json` (machine-readable)
2. **Markdown**: `tools/health/reports/health-<timestamp>.md` (human-readable)

## What's NOT Included

This tool intentionally does NOT:
- Modify any of your code
- Apply any automatic fixes
- Run Prettier or ESLint in fix mode
- Delete or rename files
- Change any configurations

## Configuration

You can modify the rules and thresholds in `tools/health/rules.js`.

## Safety

Even though the checks are read-only, the tool still creates a backup before running:
- A zip file in the `/backups/` directory
- A git tag (if git is available)

These backups provide extra safety and allow you to track the state of the codebase at each health check.

## Exit Codes

- `0`: No critical issues (warnings may exist)
- `1`: Critical issues found (see report for details)

## Technical Details

- All checks run in read-only mode
- No file modifications are performed
- Suggested fixes are provided as patch commands in the report 