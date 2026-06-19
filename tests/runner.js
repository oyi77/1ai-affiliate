#!/usr/bin/env node
/**
 * 1AI Affiliate — Unified E2E Test Runner
 *
 * Usage: node tests/runner.js [smoke|e2e|roles|fraud|all]
 *
 * Each test file MUST export an async function `run()` returning:
 *   { passed: number, failed: number, errors: string[] }
 *
 * Missing `run()` or load errors are reported as a single failure
 * and do not halt the runner.
 */

'use strict';

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

// ── Environment ──────────────────────────────────────────

process.env.NODE_ENV = process.env.NODE_ENV || 'test';
process.env.DB_NAME = process.env.DB_NAME || 'prosper1ai_test';
const TEST_PORT = parseInt(process.env.TEST_PORT || '3099', 10);
process.env.PORT = String(TEST_PORT);

const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

// ── Color helpers ────────────────────────────────────────

const RESET = '\x1b[0m';
const GREEN = '\x1b[32m';
const RED   = '\x1b[31m';
const YELLOW = '\x1b[33m';
const CYAN  = '\x1b[36m';
const BOLD  = '\x1b[1m';
const DIM   = '\x1b[2m';

// ── File discovery ───────────────────────────────────────

/**
 * Collects .test.js files for the given mode pattern.
 * Only two pattern types: single-directory and recursive.
 */
function collectFiles(patternDir) {
    const base = path.join(__dirname, 'e2e');
    const files = [];

    if (patternDir === '**/*.test.js') {
        // Recursive walk — collect all .test.js under e2e/
        function walk(dir) {
            if (!fs.existsSync(dir)) return;
            let entries;
            try { entries = fs.readdirSync(dir, { withFileTypes: true }); }
            catch (_) { return; }
            for (const entry of entries) {
                if (entry.name.startsWith('.')) continue;
                const full = path.join(dir, entry.name);
                if (entry.isDirectory()) {
                    walk(full);
                } else if (entry.isFile() && entry.name.endsWith('.test.js')) {
                    files.push(full);
                }
            }
        }
        walk(base);
    } else {
        // Single directory: '<name>/*.test.js'
        const dirName = patternDir.replace(/\/\*\.test\.js$/, '');
        const targetDir = path.join(base, dirName);
        if (!fs.existsSync(targetDir)) return files;
        let entries;
        try { entries = fs.readdirSync(targetDir); }
        catch (_) { return files; }
        for (const entry of entries) {
            if (entry.endsWith('.test.js')) {
                files.push(path.join(targetDir, entry));
            }
        }
    }

    files.sort();
    return files;
}

// ── Port cleanup ─────────────────────────────────────────

function killPort(port) {
    try {
        // Linux / macOS compatible
        execSync(`lsof -ti :${port} | xargs kill -9 2>/dev/null || true`, {
            stdio: 'ignore',
            timeout: 2000
        });
    } catch (_) {
        // Non-fatal — server may not be running
    }
}

// ── Load & run a single test file ────────────────────────

async function runFile(filePath) {
    const relPath = path.relative(path.join(__dirname, '..'), filePath);
    const start = Date.now();

    try {
        // Clear Node require cache so repeated runs work
        delete require.cache[require.resolve(filePath)];

        const mod = require(filePath);
        if (typeof mod.run !== 'function') {
            const elapsed = ((Date.now() - start) / 1000).toFixed(2);
            return {
                file: relPath,
                passed: 0,
                failed: 1,
                errors: ['Missing export: run() — test file does not export async function run()'],
                elapsed,
                loadError: true
            };
        }

        const result = await mod.run();
        const elapsed = ((Date.now() - start) / 1000).toFixed(2);

        // Normalize result
        const passed = typeof result.passed === 'number' ? result.passed : 0;
        const failed = typeof result.failed === 'number' ? result.failed : 0;
        const errors = Array.isArray(result.errors) ? result.errors : [];

        return { file: relPath, passed, failed, errors, elapsed };
    } catch (err) {
        const elapsed = ((Date.now() - start) / 1000).toFixed(2);
        return {
            file: relPath,
            passed: 0,
            failed: 1,
            errors: [err.message],
            elapsed,
            loadError: true
        };
    }
}

// ── Print helpers ────────────────────────────────────────

function printFileHeader(file) {
    console.log(`\n${CYAN}[${file}]${RESET}`);
}

function printResult(testName, status, errMsg) {
    if (status === 'pass') {
        console.log(`  ${GREEN}✓${RESET} ${testName}`);
    } else if (status === 'warn') {
        console.log(`  ${YELLOW}⚠${RESET} ${testName}`);
    } else {
        console.log(`  ${RED}✗${RESET} ${testName}`);
        if (errMsg) {
            console.log(`    ${RED}Error: ${errMsg}${RESET}`);
        }
    }
}

function printFileSummary(passed, failed, elapsed) {
    const parts = [];
    if (passed > 0) parts.push(`${GREEN}${passed} passed${RESET}`);
    if (failed > 0) parts.push(`${RED}${failed} failed${RESET}`);
    const summary = parts.join(', ') || 'no tests';
    console.log(`  ${DIM}──${RESET} ${summary} ${DIM}(${elapsed}s)${RESET} ──`);
}

function padRight(str, len) {
    return str + ' '.repeat(Math.max(0, len - str.length));
}

// ── Banner ───────────────────────────────────────────────

function printBanner() {
    console.log('');
    console.log(`${BOLD}${CYAN}=== 1AI Affiliate Test Runner ===${RESET}`);
    console.log(`  Mode: ${process.argv[2] || 'all'}  |  Port: ${TEST_PORT}  |  DB: ${process.env.DB_NAME}`);
    console.log('');
}

// ── Summary table ────────────────────────────────────────

function printSummary(results, totalElapsed) {
    console.log(`\n${BOLD}═══════════════════════════════════${RESET}`);

    // Per-file table
    const fileColWidth = Math.max(30, ...results.map(r => Math.min(r.file.length, 60)));
    const header = `  ${padRight('File', fileColWidth)}  Passed  Failed   Time`;
    console.log(`  ${DIM}${header}${RESET}`);

    let totalPassed = 0;
    let totalFailed = 0;
    let totalWarnings = 0;

    for (const r of results) {
        const displayName = r.file.length > fileColWidth
            ? r.file.slice(0, fileColWidth - 3) + '...'
            : r.file;
        const p = String(r.passed).padStart(6);
        const f = String(r.failed).padStart(6);
        const t = String(r.elapsed + 's').padStart(7);
        const line = `  ${padRight(displayName, fileColWidth)}  ${GREEN}${p}${RESET}  ${r.failed ? RED : RESET}${f}${RESET}  ${t}`;
        console.log(line);
        totalPassed += r.passed;
        totalFailed += r.failed;
        totalWarnings += (r.warnings || 0);
    }

    const totalTime = totalElapsed.toFixed(1);

    let resultLine = `  Results: ${GREEN}${totalPassed} passed${RESET}`;
    if (totalFailed > 0) resultLine += `, ${RED}${totalFailed} failed${RESET}`;
    else resultLine += `, 0 failed`;
    if (totalWarnings > 0) resultLine += `, ${YELLOW}${totalWarnings} warnings${RESET}`;
    resultLine += `  `;
    console.log(`\n${resultLine}`);
    console.log(`  Duration: ${totalTime}s`);
    console.log(`${BOLD}═══════════════════════════════════${RESET}\n`);
}

// ── Main ─────────────────────────────────────────────────

async function main() {
    const mode = (process.argv[2] || 'all').toLowerCase();

    // Resolve glob pattern
    let pattern;
    switch (mode) {
        case 'smoke':
            pattern = 'smoke/*.test.js';
            break;
        case 'e2e':
            pattern = '**/*.test.js';
            break;
        case 'roles':
            pattern = 'roles/*.test.js';
            break;
        case 'fraud':
            pattern = 'fraud/*.test.js';
            break;
        case 'all':
            pattern = '**/*.test.js';
            break;
        default:
            console.error(`${RED}Unknown mode: ${mode}${RESET}`);
            console.error('Usage: node tests/runner.js [smoke|e2e|roles|fraud|all]');
            process.exit(2);
    }

    printBanner();

    // Kill existing server on test port
    killPort(TEST_PORT);

    // Collect files
    const files = collectFiles(pattern);

    if (files.length === 0) {
        console.log(`  ${YELLOW}No test files found${RESET} for pattern: e2e/${pattern}`);
        console.log(`  Searched in: ${path.join(__dirname, 'e2e')}`);
        console.log('');
        process.exit(0);
    }

    const globalStart = Date.now();
    const allResults = [];

    for (const filePath of files) {
        const relPath = path.relative(path.join(__dirname, '..'), filePath);
        printFileHeader(relPath);

        const result = await runFile(filePath);
        allResults.push(result);

        // Test files produce their own per-case output via console.
        // The runner only prints load/require errors.
        if (result.loadError) {
            for (const err of result.errors) {
                printResult('(load error)', 'fail', err);
            }
        }

        printFileSummary(result.passed, result.failed, result.elapsed);
        // Ensure port is freed before next test file
        killPort(TEST_PORT);
        await new Promise(r => setTimeout(r, 500));
    }

    const totalElapsed = (Date.now() - globalStart) / 1000;
    printSummary(allResults, totalElapsed);

    // Exit code
    const anyFailed = allResults.some(r => r.failed > 0);
    process.exit(anyFailed ? 1 : 0);
}

main().catch(err => {
    console.error(`${RED}FATAL: ${err.message}${RESET}`);
    console.error(err.stack);
    process.exit(1);
});
