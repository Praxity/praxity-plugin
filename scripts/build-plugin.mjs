import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { buildAdapters } from '../src/skills.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const output = join(root, 'plugins/praxity/skills');
if (existsSync(output)) throw new Error(`Remove previous generated skills first: ${output}`);
const pack = JSON.parse(readFileSync(join(root, 'pack.json'), 'utf8'));
const scratch = join(root, 'dist/plugin-build');
mkdirSync(scratch, { recursive: true });
const tools = [];
for (const tool of pack.tools.filter(tool => tool.skillPath)) {
  const pin = tool.archives['darwin-arm64'];
  if (pin.status !== 'published') throw new Error(`No published skill archive: ${tool.id}`);
  const archive = join(scratch, `${tool.id}.tar.gz`);
  if (!existsSync(archive)) {
    const response = await fetch(pin.url);
    if (!response.ok) throw new Error(`Download failed: ${response.status} ${pin.url}`);
    writeFileSync(archive, Buffer.from(await response.arrayBuffer()));
  }
  const digest = createHash('sha256').update(readFileSync(archive)).digest('hex');
  if (digest !== pin.sha256) throw new Error(`Archive digest mismatch: ${tool.id}`);
  const destination = join(scratch, tool.id);
  if (existsSync(destination)) throw new Error(`Remove previous build directory first: ${destination}`);
  mkdirSync(destination);
  const result = spawnSync('tar', ['-xf', archive, '-C', destination, `--strip-components=${pin.stripComponents}`], { encoding: 'utf8' });
  if (result.status !== 0) throw new Error(`Extract failed: ${tool.id}: ${result.stderr}`);
  tools.push(join(destination, tool.skillPath));
}
const files = buildAdapters({ source: join(root, 'skills'), tools }).claude;
const inventory = {};
for (const [name, bytes] of files) {
  const relative = name.slice('.claude/skills/'.length);
  if (relative.startsWith('install-praxity/')) continue;
  const path = join(output, relative);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, bytes);
  inventory[relative] = createHash('sha256').update(bytes).digest('hex');
}
writeFileSync(join(root, 'plugins/praxity/skills-lock.json'), JSON.stringify({
  archives: Object.fromEntries(pack.tools.filter(tool => tool.skillPath).map(tool => [tool.id, tool.archives['darwin-arm64']])),
  files: inventory,
}, null, 2) + '\n');
console.log(`Generated ${readdirSync(output).length} skills (${Object.keys(inventory).length} files).`);
