import test from 'node:test';
import assert from 'node:assert/strict';
import { visitFolder, stepFolder } from '../src/domain/explorer-history.js';
import { releaseCatalog } from '../src/domain/release-catalog.js';
import { atlasSeed } from '../src/content/atlas-seed.js';
import { ContentRepository } from '../src/data/content-repository.js';

test('Back/Forward preserve history and a new navigation replaces the forward branch', () => {
  let history = visitFolder(undefined, 'A:\\Archive');
  history = visitFolder(history, 'A:\\Archive\\2019');
  history = stepFolder(history, -1);
  assert.equal(history.paths[history.index], 'A:\\Archive');
  assert.equal(stepFolder(history, 1).paths[1], 'A:\\Archive\\2019');
  history = visitFolder(history, 'A:\\Gallery');
  assert.deepEqual(history.paths, ['A:\\Archive', 'A:\\Gallery']);
});
test('approved releases join legacy presentation by source URL and exclude private entries', () => {
  const entry = atlasSeed.entities.find((entity) => entity.slug === 'new-swag-who-dis');
  const catalog = releaseCatalog([entry, {...entry, id:'private', publicationState:'private'}], [{id:'new-swag', url:entry.metadata.officialUrl, cover:'assets/cover.png', tracks:['Example']}]);
  assert.equal(catalog.length, 1);
  assert.equal(catalog[0].id, 'new-swag');
  assert.equal(catalog[0].cover, 'assets/cover.png');
  assert.equal(releaseCatalog([entry])[0].id, 'new-swag-who-dis');
});
test('normal public visitors ignore device drafts', async () => {
  const local = new Map([['awaken.content-admin-draft', JSON.stringify({links:[{id:'secret-draft'}]})]]);
  const repo = new ContentRepository({storage:{getItem:key=>local.get(key)||null,setItem:(key,value)=>local.set(key,value)},config:{},fetcher:null});
  const result = await repo.getPublicContent();
  assert.notEqual(result.source, 'admin-local');
  assert.ok(!result.content.links.some((item)=>item.id==='secret-draft'));
});
