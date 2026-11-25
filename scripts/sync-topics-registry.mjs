#!/usr/bin/env node
/**
 * Auto-sync script for topics-registry.json to GitHub
 * Repository: git@github.com:tahiep2012/Stickman-Video.git
 * Branch: main
 */

import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export function syncTopicsRegistry(customMessage = null) {
  try {
    const status = execSync('git status --porcelain projects/topics-registry.json', { cwd: ROOT, encoding: 'utf8' }).trim();
    if (!status) {
      console.log('ℹ️  File projects/topics-registry.json has no changes. Nothing to push.');
      return { synced: false, reason: 'no_changes' };
    }

    const commitMsg = customMessage || `chore(registry): sync topics-registry.json [${new Date().toISOString().split('T')[0]}]`;
    
    console.log('🚀 Staging projects/topics-registry.json...');
    execSync('git add -f projects/topics-registry.json', { cwd: ROOT, stdio: 'inherit' });

    console.log(`📝 Committing: "${commitMsg}"...`);
    execSync(`git commit -m "${commitMsg}"`, { cwd: ROOT, stdio: 'inherit' });

    console.log('📤 Pushing to origin main via secure SSH...');
    execSync('git push origin main', { cwd: ROOT, stdio: 'inherit' });

    console.log('✅ Successfully synced projects/topics-registry.json to GitHub!');
    return { synced: true };
  } catch (err) {
    console.error('❌ Failed to sync topics-registry.json:', err.message);
    throw err;
  }
}

// Run directly if invoked from CLI
if (process.argv[1] && process.argv[1].endsWith('sync-topics-registry.mjs')) {
  const msg = process.argv[2] || null;
  syncTopicsRegistry(msg);
}
