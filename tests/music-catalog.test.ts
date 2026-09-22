import test from 'node:test';
import assert from 'node:assert/strict';
import { createMusicCatalog, neteaseUrl, neteasePlayerUrl } from '../src/lib/music-catalog.ts';

const album = (id: string, draft = false) => ({ id, data: { date: new Date('2026-09-22'), draft } });
const track = (id: string, albumId: string, draft = false, trackNumber = 1, date = '2026-09-22') =>
  ({ id, data: { album: { id: albumId }, draft, trackNumber, date: new Date(date) } });

test('生产目录排除草稿以及草稿专辑下未标记草稿的单曲', () => {
  const result = createMusicCatalog([album('live'), album('draft', true)], [
    track('public-song', 'live'), track('draft-song', 'live', true, 2), track('hidden-parent', 'draft'),
  ]);
  assert.deepEqual(result.albums.map((a) => a.id), ['live']);
  assert.deepEqual(result.tracks.map((t) => t.id), ['public-song']);
});

test('开发目录包含草稿，按日期倒序，同日排序稳定，不修改源数组', () => {
  const tracks = [track('older', 'draft', true, 1, '2026-09-01'), track('z-song', 'draft', true, 2), track('a-song', 'draft', true, 3)];
  const result = createMusicCatalog([album('draft', true)], tracks, true);
  assert.deepEqual(result.tracks.map((t) => t.id), ['a-song', 'z-song', 'older']);
  assert.equal(tracks[0].id, 'older');
});

test('阻止丢失专辑、重复曲序和不稳定的路由标识', () => {
  assert.throws(() => createMusicCatalog([], [track('song', 'missing')]), /不存在/);
  assert.throws(() => createMusicCatalog([album('live')], [track('one', 'live'), track('two', 'live')]), /曲序重复/);
  assert.throws(() => createMusicCatalog([album('中文')], []), /标识/);
  assert.throws(() => createMusicCatalog([album('live')], [track('albums', 'live')]), /保留路径/);
});

test('有发行日期时使用发行日期排序，缺少时使用收录日期', () => {
  const earlierRelease = { ...album('earlier'), data: { ...album('earlier').data, released: new Date('2020-01-01') } };
  assert.deepEqual(createMusicCatalog([earlierRelease, album('recent')], []).albums.map((a) => a.id), ['recent', 'earlier']);
});

test('播放器使用 HTTPS、默认关闭自动播放且拒绝非歌曲 ID', () => {
  assert.equal(neteaseUrl('3410295349'), 'https://music.163.com/song?id=3410295349');
  const url = new URL(neteasePlayerUrl('3410295349'));
  assert.equal(url.protocol, 'https:');
  assert.equal(url.searchParams.get('auto'), '0');
  assert.equal(url.searchParams.get('type'), '2');
  assert.throws(() => neteasePlayerUrl('1&auto=1'), /无效/);
});
