#!/usr/bin/env node
/**
 * Aggregate per-network deployment files into deployments.json.
 *
 * Reads geniusdiamond-<network>-<chainId>.json from the deployments/ directory
 * and produces deployments.json keyed by network name with chainId embedded.
 *
 * Usage:
 *   node scripts/aggregate.mjs
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const kDeploymentsDir = join(__dirname, '..', 'deployments');
const kOutputFile = join(kDeploymentsDir, 'deployments.json');
const kFilenamePattern = /^geniusdiamond-(.+)-(\d+)\.json$/;

const files = readdirSync(kDeploymentsDir).filter((f) => kFilenamePattern.test(f));
const aggregate = {};

for (const file of files.sort()) {
    const [, network, chainIdStr] = file.match(kFilenamePattern);
    const chainId = parseInt(chainIdStr, 10);
    const data = JSON.parse(readFileSync(join(kDeploymentsDir, file), 'utf8'));
    data.chainId = chainId;
    delete data.lastExecTxHash;
    aggregate[network] = data;
}

writeFileSync(kOutputFile, JSON.stringify(aggregate, null, 2), 'utf8');
console.log(`deployments.json written — ${Object.keys(aggregate).length} networks: ${Object.keys(aggregate).join(', ')}`);
