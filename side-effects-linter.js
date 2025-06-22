#!/usr/bin/env node
/**
 * JS/TS Top-Level Side Effect Linter
 * Author: Chris Osterhaug
 * License: MIT
 *
 * Scans specified directories for code that runs immediately upon module import.
 * Detects: SDK initializations, global assignments, top-level calls, event listeners, DOM mutations, etc.
 *
 * Usage:
 *   1. Update UTILS_DIRS below to include the directories you want to scan.
 *   2. Run: node side-effects-linter.js
 */

const fs = require('fs');
const path = require('path');

// Directories to scan (customize as needed)
const UTILS_DIRS = [
  'src/utils/',
  'src/services/',
  'src/modules/',
  'utils/',
  'lib/'
];

// Patterns to detect top-level side effects
const SIDE_EFFECT_PATTERNS = [
  // SDK/service initialization (e.g., Firebase, AWS, Azure, etc.)
  /\b(firebase|AWS|Azure|amplify|gapi|Stripe|Twilio)[\s.]*\w*\s*\(.*\)/i,
  // Assignment to window/globalThis/global
  /(?:window|globalThis|global)\.[a-zA-Z0-9_]+\s*=/,
  // Top-level event listeners
  /(?:window|document)\.(addEventListener|on[a-zA-Z]+)\s*\(/,
  // Top-level function/method calls
  /^[ \t]*[a-zA-Z0-9_$.]+\s*\(.*\);?\s*$/,
  // Object.defineProperty(window, ...)
  /Object\.defineProperty\s*\(\s*window[ ,]/,
  // Direct mutation of window/globalThis
  /(?:window|globalThis|global)\.[a-zA-Z0-9_]+\s*\./
];

// Ignore lines that start with these (safe/boilerplate)
const IGNORE_PATTERNS = [
  /^export\s+(default\s+)?(function|class|const|let|var|async|{)/,
  /^(function|class|const|let|var|async)\s/,
  /^\/\//, // comment
  /^\s*\/\*/, // block comment start
  /^\s*\*\//, // block comment end
  /^\s*\*/, // block comment line
  /^\s*$/ // empty
];

// Recursively collect JS/TS files in a directory
function getAllFiles(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  for (const file of fs.readdirSync(dir)) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllFiles(filePath));
    } else if (file.endsWith('.js') || file.endsWith('.ts')) {
      results.push(filePath);
    }
  }
  return results;
}

function analyzeFile(filePath) {
  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
  let inFunctionOrClass = false;
  let blockDepth = 0;
  const findings = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Track function/class blocks
    if (/^(export\s+)?(async\s+)?function\s|^(export\s+)?class\s/.test(trimmed)) {
      inFunctionOrClass = true;
    }
    if (inFunctionOrClass) {
      if (/{/.test(line)) blockDepth++;
      if (/}/.test(line)) blockDepth--;
      if (blockDepth <= 0) inFunctionOrClass = false;
      continue;
    }

    if (IGNORE_PATTERNS.some(r => r.test(line))) continue;
    for (const pattern of SIDE_EFFECT_PATTERNS) {
      if (pattern.test(line)) {
        findings.push({
          file: filePath,
          line: i + 1,
          code: line,
          reason: explainSideEffect(line)
        });
        break;
      }
    }
  }
  return findings;
}

function explainSideEffect(line) {
  if (/\b(firebase|AWS|Azure|amplify|gapi|Stripe|Twilio)[\s.]*\w*\s*\(.*\)/i.test(line))
    return 'Service initialization at top level (e.g., SDK init)';
  if (/(?:window|globalThis|global)\.[a-zA-Z0-9_]+\s*=/.test(line))
    return 'Assignment to window/global/globalThis at top level';
  if (/(?:window|document)\.(addEventListener|on[a-zA-Z]+)\s*\(/.test(line))
    return 'Top-level event listener setup';
  if (/Object\.defineProperty\s*\(\s*window[ ,]/.test(line))
    return 'Defining property on window at top level';
  if (/(?:window|globalThis|global)\.[a-zA-Z0-9_]+\s*\./.test(line))
    return 'Direct mutation of window/global/globalThis property at top level';
  if (/^[ \t]*[a-zA-Z0-9_$.]+\s*\(.*\);?\s*$/.test(line))
    return 'Function/method call at top level (not wrapped in function/class)';
  return 'Possible side effect';
}

// Main script
function main() {
  let allFindings = [];
  for (const dir of UTILS_DIRS) {
    const files = getAllFiles(dir);
    for (const file of files) {
      const findings = analyzeFile(file);
      if (findings.length) allFindings = allFindings.concat(findings);
    }
  }

  // Output
  if (allFindings.length === 0) {
    console.log('No top-level side effects detected.');
    fs.writeFileSync('side-effect-report.txt', 'No top-level side effects detected.\n');
    return;
  }

  let report = 'Side Effect Linter Report\n========================\n';
  for (const finding of allFindings) {
    report += `\nFile: ${finding.file}\nLine: ${finding.line}\nCode: ${finding.code}\nReason: ${finding.reason}\n`;
    report += `Suggestion: Move this code into an exported function or class method.\n`;
  }
  console.log(report);
  fs.writeFileSync('side-effect-report.txt', report);
}

main();
