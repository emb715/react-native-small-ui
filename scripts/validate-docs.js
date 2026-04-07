#!/usr/bin/env node

/**
 * Documentation Validation Script
 *
 * Validates that:
 * 1. All public exports are documented
 * 2. Documentation uses correct import paths
 * 3. No deprecated import patterns exist
 *
 * Usage:
 *   node scripts/validate-docs.js
 *
 * Exit codes:
 *   0 - All checks passed
 *   1 - Validation errors found
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Configuration
const ROOT_DIR = path.join(__dirname, '..');
const SRC_DIR = path.join(ROOT_DIR, 'src');
const DOCS_DIR = path.join(ROOT_DIR, 'docs', 'src', 'content', 'docs');

const EXPORT_FILES = {
  core: path.join(SRC_DIR, 'index.tsx'),
  theme: path.join(SRC_DIR, 'theme-exports.tsx'),
  utils: path.join(SRC_DIR, 'utils-exports.tsx'),
  colormode: path.join(SRC_DIR, 'colormode.tsx'),
};

const IMPORT_PATTERNS = {
  core: /from\s+['"]react-native-small-ui['"]/g,
  theme: /from\s+['"]react-native-small-ui\/theme['"]/g,
  utils: /from\s+['"]react-native-small-ui\/utils['"]/g,
  colormode: /from\s+['"]react-native-small-ui\/colormode['"]/g,
};

// Deprecated patterns (imports that should use specific paths)
const DEPRECATED_PATTERNS = [
  {
    pattern: /import\s+{[^}]*useTheme[^}]*}\s+from\s+['"]react-native-small-ui['"]/g,
    suggestion: "import { useTheme } from 'react-native-small-ui/theme'",
    name: 'useTheme from core',
  },
  {
    pattern: /import\s+{[^}]*ColorUtils[^}]*}\s+from\s+['"]react-native-small-ui['"]/g,
    suggestion: "import { ColorUtils } from 'react-native-small-ui/theme'",
    name: 'ColorUtils from core',
  },
  {
    pattern: /import\s+{[^}]*useColorMode[^}]*}\s+from\s+['"]react-native-small-ui['"]/g,
    suggestion: "import { useColorMode } from 'react-native-small-ui/colormode'",
    name: 'useColorMode from core',
  },
  {
    pattern: /import\s+{[^}]*useBreakPointValue[^}]*}\s+from\s+['"]react-native-small-ui['"]/g,
    suggestion: "import { useBreakPointValue } from 'react-native-small-ui/utils'",
    name: 'useBreakPointValue from core',
  },
  {
    pattern: /import\s+{[^}]*useMediaQuery[^}]*}\s+from\s+['"]react-native-small-ui['"]/g,
    suggestion: "import { useMediaQuery } from 'react-native-small-ui/utils'",
    name: 'useMediaQuery from core',
  },
  {
    pattern: /import\s+{[^}]*useOrientation[^}]*}\s+from\s+['"]react-native-small-ui['"]/g,
    suggestion: "import { useOrientation } from 'react-native-small-ui/utils'",
    name: 'useOrientation from core',
  },
];

// Extract exports from a file
function extractExports(filePath) {
  if (!fs.existsSync(filePath)) {
    return [];
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const exports = [];

  // Match named exports: export { foo, bar } from '...'
  const namedExportMatches = content.matchAll(/export\s+{\s*([^}]+)\s*}/g);
  for (const match of namedExportMatches) {
    const exportNames = match[1]
      .split(',')
      .map((name) => name.trim().split(/\s+as\s+/).pop().trim());
    exports.push(...exportNames);
  }

  // Match direct exports: export function foo()
  const directExportMatches = content.matchAll(/export\s+(?:function|const|class|type|interface)\s+(\w+)/g);
  for (const match of directExportMatches) {
    exports.push(match[1]);
  }

  return [...new Set(exports)]; // Remove duplicates
}

// Find all documentation files
function findDocFiles(dir) {
  const files = [];

  function walk(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory() && entry.name !== 'node_modules') {
        walk(fullPath);
      } else if (entry.isFile() && /\.(md|mdx)$/i.test(entry.name)) {
        files.push(fullPath);
      }
    }
  }

  if (fs.existsSync(dir)) {
    walk(dir);
  }

  return files;
}

// Check if an export is documented
function isExportDocumented(exportName, docFiles) {
  const searchPattern = new RegExp(`\\b${exportName}\\b`, 'i');

  for (const docFile of docFiles) {
    const content = fs.readFileSync(docFile, 'utf-8');
    if (searchPattern.test(content)) {
      return { documented: true, file: docFile };
    }
  }

  return { documented: false };
}

// Check for deprecated import patterns
function checkDeprecatedPatterns(docFiles) {
  const issues = [];

  for (const docFile of docFiles) {
    const content = fs.readFileSync(docFile, 'utf-8');
    const relPath = path.relative(ROOT_DIR, docFile);

    for (const { pattern, suggestion, name } of DEPRECATED_PATTERNS) {
      const matches = content.match(pattern);
      if (matches) {
        issues.push({
          file: relPath,
          issue: `Deprecated import pattern: ${name}`,
          suggestion,
          count: matches.length,
        });
      }
    }
  }

  return issues;
}

// Main validation
async function validate() {
  log('\n🔍 Validating documentation...\n', 'cyan');

  let hasErrors = false;

  // 1. Extract all exports
  log('📦 Extracting public API exports...', 'blue');
  const allExports = {
    core: extractExports(EXPORT_FILES.core),
    theme: extractExports(EXPORT_FILES.theme),
    utils: extractExports(EXPORT_FILES.utils),
    colormode: extractExports(EXPORT_FILES.colormode),
  };

  log(`  Core exports: ${allExports.core.length}`, 'reset');
  log(`  Theme exports: ${allExports.theme.length}`, 'reset');
  log(`  Utils exports: ${allExports.utils.length}`, 'reset');
  log(`  ColorMode exports: ${allExports.colormode.length}\n`, 'reset');

  // 2. Find all doc files
  log('📚 Scanning documentation files...', 'blue');
  const docFiles = findDocFiles(DOCS_DIR);
  log(`  Found ${docFiles.length} documentation files\n`, 'reset');

  // 3. Check documentation coverage
  log('✅ Checking documentation coverage...', 'blue');
  const undocumented = [];

  for (const [moduleName, exports] of Object.entries(allExports)) {
    for (const exportName of exports) {
      // Skip types and internal exports
      if (exportName.startsWith('_') || /^[A-Z].*Type$/.test(exportName)) {
        continue;
      }

      const result = isExportDocumented(exportName, docFiles);
      if (!result.documented) {
        undocumented.push({ module: moduleName, export: exportName });
      }
    }
  }

  if (undocumented.length > 0) {
    hasErrors = true;
    log(`  ❌ Found ${undocumented.length} undocumented exports:\n`, 'red');
    for (const { module, export: exportName } of undocumented) {
      log(`     - ${exportName} (from ${module})`, 'yellow');
    }
    console.log();
  } else {
    log('  ✅ All exports are documented\n', 'green');
  }

  // 4. Check for deprecated patterns
  log('🔎 Checking for deprecated import patterns...', 'blue');
  const deprecatedIssues = checkDeprecatedPatterns(docFiles);

  if (deprecatedIssues.length > 0) {
    hasErrors = true;
    log(`  ❌ Found ${deprecatedIssues.length} files with deprecated imports:\n`, 'red');
    for (const { file, issue, suggestion, count } of deprecatedIssues) {
      log(`     ${file}`, 'yellow');
      log(`       Issue: ${issue} (${count} occurrence${count > 1 ? 's' : ''})`, 'reset');
      log(`       Suggestion: ${suggestion}`, 'cyan');
      console.log();
    }
  } else {
    log('  ✅ No deprecated import patterns found\n', 'green');
  }

  // Summary
  log('━'.repeat(60), 'cyan');
  if (hasErrors) {
    log('\n❌ Documentation validation FAILED\n', 'red');
    log('Please update the documentation to fix the issues above.\n', 'yellow');
    process.exit(1);
  } else {
    log('\n✅ Documentation validation PASSED\n', 'green');
    log('All exports are documented with correct import paths.\n', 'reset');
    process.exit(0);
  }
}

// Run validation
validate().catch((error) => {
  log(`\n❌ Validation error: ${error.message}\n`, 'red');
  console.error(error);
  process.exit(1);
});
