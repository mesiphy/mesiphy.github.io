/** 与 Astro 无关的目录规则，供构建和回归测试共用。 */
export interface AlbumRecord {
  id: string;
  data: { date: Date; released?: Date; draft: boolean };
}

export interface TrackRecord extends AlbumRecord {
  data: AlbumRecord['data'] & { album: { id: string }; trackNumber: number };
}

export function createMusicCatalog<A extends AlbumRecord, T extends TrackRecord>(
  allAlbums: A[], allTracks: T[], includeDrafts = false,
) {
  const albumIds = new Set(allAlbums.map((album) => album.id));
  const positions = new Set<string>();
  for (const entry of [...allAlbums, ...allTracks]) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry.id)) {
      throw new Error(`音乐内容标识必须使用小写英文、数字和连字符：${entry.id}`);
    }
  }
  for (const track of allTracks) {
    if (track.id === 'albums') throw new Error('单曲标识 albums 为保留路径');
    if (!albumIds.has(track.data.album.id)) {
      throw new Error(`单曲 ${track.id} 引用了不存在的专辑 ${track.data.album.id}`);
    }
    const position = `${track.data.album.id}:${track.data.trackNumber}`;
    if (positions.has(position)) throw new Error(`专辑曲序重复：${position}`);
    positions.add(position);
  }
  const newest = (a: AlbumRecord, b: AlbumRecord) =>
    (b.data.released ?? b.data.date).valueOf() - (a.data.released ?? a.data.date).valueOf() || a.id.localeCompare(b.id, 'en');
  const albums = allAlbums.filter((album) => includeDrafts || !album.data.draft).sort(newest);
  const visibleAlbumIds = new Set(albums.map((album) => album.id));
  const tracks = allTracks.filter((track) =>
    visibleAlbumIds.has(track.data.album.id) && (includeDrafts || !track.data.draft),
  ).sort(newest);
  return { albums, tracks };
}

export function neteaseUrl(id: string): string {
  if (!/^[1-9]\d*$/.test(id)) throw new Error('无效的网易云歌曲 ID');
  return `https://music.163.com/song?id=${id}`;
}

export function neteasePlayerUrl(id: string): string {
  neteaseUrl(id);
  return `https://music.163.com/outchain/player?type=2&id=${id}&auto=0&height=90`;
}
