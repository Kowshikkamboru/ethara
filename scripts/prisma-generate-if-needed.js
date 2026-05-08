#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

function hasPrismaBin() {
  const bin1 = path.join(process.cwd(), 'node_modules', '.bin', 'prisma');
  const bin2 = path.join(process.cwd(), 'node_modules', '.bin', 'prisma.cmd');
  return fs.existsSync(bin1) || fs.existsSync(bin2);
}

if (!hasPrismaBin()) {
  console.log('Skipping `prisma generate` — local prisma binary not found (devDependencies may be omitted in this install).');
  process.exit(0);
}

const prismaBin = fs.existsSync(path.join(process.cwd(), 'node_modules', '.bin', 'prisma'))
  ? path.join(process.cwd(), 'node_modules', '.bin', 'prisma')
  : path.join(process.cwd(), 'node_modules', '.bin', 'prisma.cmd');

console.log('Running `prisma generate` via local binary:', prismaBin);
const res = spawnSync(prismaBin, ['generate'], { stdio: 'inherit' });
process.exit(res.status === null ? 1 : res.status);
