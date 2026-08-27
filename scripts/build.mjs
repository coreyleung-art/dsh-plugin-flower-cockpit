#!/usr/bin/env node
import { execSync } from 'node:child_process';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const lib = join(root, 'lib');

function run(cmd) { console.log('>', cmd); execSync(cmd, { cwd: root, stdio: 'inherit' }); }

// 1. node 端
run('npx tsc -p tsconfig.json');

// 2. client 端打包
run('npx esbuild src/client/index.tsx --bundle --format=cjs --platform=browser --target=es2022 --outfile=lib/.client.tmp.js --log-level=warning --external:react --external:react/jsx-runtime --external:react-dom --external:@deepseek-ai/*');

// 3. 包装 __ModuleLoader__.load
const bundle = readFileSync(join(lib, '.client.tmp.js'), 'utf8');
const wrapped = `window.__ModuleLoader__.load({
  id: "dsh-plugin-flower-cockpit",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
${bundle}
    return module.exports;
  }
});
`;
writeFileSync(join(lib, 'client.js'), wrapped);
console.log('> wrote lib/client.js', wrapped.length, 'bytes');

// 4. 清理
try { execSync('rm -f lib/.client.tmp.js', { cwd: root }); } catch {}

// 5. 类型占位
mkdirSync(join(lib, 'types', 'client'), { recursive: true });
writeFileSync(join(lib, 'types', 'client', 'index.d.ts'), 'export interface CockpitState { ok?: boolean; error?: string; report?: any; promos?: any[]; dataDir?: string; }\n');
console.log('build ok');
