import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { buildAdapters } from '../src/skills.mjs';
import { repository } from './helpers.mjs';

const json = path => JSON.parse(readFileSync(join(repository, path), 'utf8'));
const plugin = join(repository, 'plugins/praxity');
const expectedSkills = ['assessment-writing', 'composer', 'prax-format', 'praxity-check', 'praxity-print', 'praxity-trace', 'studio-editor'];

test('both marketplaces resolve one plugin with valid manifests and all seven skills', () => {
  const claude = json('.claude-plugin/marketplace.json');
  const codex = json('.agents/plugins/marketplace.json');
  assert.equal(claude.owner.name, 'Praxity');
  for (const catalog of [claude, codex]) {
    assert.equal(catalog.name, 'praxity');
    assert.equal(catalog.plugins.length, 1);
    assert.equal(catalog.plugins[0].name, 'praxity');
    const source = catalog.plugins[0].source;
    assert.equal(typeof source === 'string' ? source : source.path, './plugins/praxity');
  }
  const portable = json('plugins/praxity/plugin.json');
  assert.equal(portable.$schema, 'https://agent-plugins.org/schemas/1.0.0/plugin.schema.json');
  const { $schema, ...identity } = portable;
  assert.deepEqual(identity, json('plugins/praxity/.claude-plugin/plugin.json'));
  assert.equal(identity.name, 'praxity');
  assert.match(identity.version, /^\d+\.\d+\.\d+$/);
  assert.ok(identity.description);
  assert.ok(identity.author.name);
  assert.deepEqual(readdirSync(join(plugin, 'skills')).sort(), expectedSkills);
  for (const name of expectedSkills) {
    const text = readFileSync(join(plugin, 'skills', name, 'SKILL.md'), 'utf8');
    assert.match(text, new RegExp(`^---\\r?\\nname: ${name}\\r?\\n`));
    assert.match(text, /^description:\s*\S/m);
  }
  assert.equal(existsSync(join(plugin, 'skills/install-praxity')), false);
});

test('generated skills retain canonical Rubato bytes and pinned archive inventory', () => {
  const lock = json('plugins/praxity/skills-lock.json');
  const pack = json('pack.json');
  assert.deepEqual(lock.archives, Object.fromEntries(pack.tools.filter(tool => tool.skillPath).map(tool => [tool.id, tool.archives['darwin-arm64']])));
  const actual = {};
  const walk = (directory, prefix = '') => {
    for (const item of readdirSync(directory, { withFileTypes: true })) {
      const name = prefix + item.name;
      assert.equal(item.isSymbolicLink(), false);
      if (item.isDirectory()) walk(join(directory, item.name), `${name}/`);
      else actual[name] = createHash('sha256').update(readFileSync(join(directory, item.name))).digest('hex');
    }
  };
  walk(join(plugin, 'skills'));
  assert.deepEqual(actual, lock.files);
  for (const [name, bytes] of buildAdapters({ source: join(repository, 'skills') }).claude) {
    const relative = name.slice('.claude/skills/'.length);
    if (relative.startsWith('install-praxity/')) continue;
    assert.deepEqual(readFileSync(join(plugin, 'skills', relative)), bytes, relative);
  }
});
